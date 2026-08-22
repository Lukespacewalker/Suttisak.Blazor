import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('machine-readable manifest tracks the 90-component catalog', async ({ request }) => {
  const response = await request.get('/component-manifest.json');
  expect(response.ok()).toBeTruthy();

  const manifest = await response.json();
  expect(manifest.schemaVersion).toBe(1);
  expect(manifest.componentCount).toBe(90);

  const names = manifest.groups.flatMap(group => group.components);
  expect(names).toHaveLength(90);
  expect(new Set(names).size).toBe(90);
  expect(names).toContain('AppButton');
  expect(names).toContain('ApplicationShell');
});

test('AppButton detail route exposes controls, states, and runtime API metadata', async ({ page }) => {
  await page.goto('/components/app-button');

  await expect(page.getByRole('heading', { level: 1, name: 'AppButton' })).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'AppButton controls' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Parameter' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Variant' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Disabled' })).toBeVisible();

  await page.getByLabel('Text').fill('Publish report');
  await expect(page.getByRole('button', { name: 'Publish report' }).first()).toBeVisible();

  const frame = page.locator('.component-detail__preview-frame');
  await page.getByRole('button', { name: '375' }).click();
  await expect(frame).toHaveClass(/component-detail__preview-frame--mobile/);
  await expect.poll(
    () => frame.evaluate(element => element.getBoundingClientRect().width),
    { timeout: 2_000 }
  ).toBeLessThanOrEqual(376);
});

test('AppTextBox detail route exposes inherited input API and live controls', async ({ page }) => {
  await page.goto('/components/app-text-box');

  await expect(page.getByRole('heading', { level: 1, name: 'AppTextBox' })).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'AppTextBox controls' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Label' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Placeholder' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Disabled' })).toBeVisible();

  await page.getByLabel('Value', { exact: true }).fill('Grace Hopper');
  await expect(page.getByRole('textbox', { name: 'Full name' }).first()).toHaveValue('Grace Hopper');
});

test('AppCheckbox detail route keeps control state wired to the live specimen', async ({ page }) => {
  await page.goto('/components/app-checkbox');

  await expect(page.getByRole('complementary', { name: 'AppCheckbox controls' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'ThreeState', exact: true })).toBeVisible();

  const previewCheckbox = page.getByRole('checkbox', { name: /Email me updates/i }).first();
  await expect(previewCheckbox).toBeChecked();
  await page.getByLabel('Checked', { exact: true }).uncheck();
  await expect(previewCheckbox).not.toBeChecked();
});

test('AppSelect detail route exposes generic runtime API metadata', async ({ page }) => {
  await page.goto('/components/app-select');

  await expect(page.getByRole('complementary', { name: 'AppSelect controls' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Options' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Placeholder' })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Region' }).first()).toHaveValue('th');
});

test('AppTabs specimen exposes roving keyboard navigation and controlled state', async ({ page }) => {
  await page.goto('/components/app-tabs');

  await expect(page.getByRole('complementary', { name: 'AppTabs controls' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'ActiveId', exact: true })).toBeVisible();

  const overview = page.getByRole('tab', { name: 'Overview' }).first();
  const activity = page.getByRole('tab', { name: 'Activity' }).first();
  await expect(overview).toHaveAttribute('aria-selected', 'true');
  await overview.focus();
  await overview.press('ArrowRight');
  await expect(activity).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel').filter({ hasText: 'Recent activity' })).toBeVisible();
});

test('AppBreadcrumb specimen keeps the final item current and lets the trail change depth', async ({ page }) => {
  await page.goto('/components/app-breadcrumb');

  await expect(page.getByRole('complementary', { name: 'AppBreadcrumb controls' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Items' })).toBeVisible();
  await expect(page.locator('.component-detail__preview-frame [aria-current="page"]')).toHaveText('Quarterly report');

  await page.getByLabel('Depth').selectOption('4');
  await expect(page.locator('.component-detail__preview-frame .app-breadcrumb__item')).toHaveCount(4);
  await page.getByLabel('Current page').fill('Annual review');
  await expect(page.locator('.component-detail__preview-frame [aria-current="page"]')).toHaveText('Annual review');
});

test('AppDialog specimen opens a native modal with runtime API metadata and closes with a result', async ({ page }) => {
  await page.goto('/components/app-dialog');

  await expect(page.getByRole('complementary', { name: 'AppDialog controls' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Mode' })).toBeVisible();
  await page.getByRole('button', { name: 'Open dialog' }).click();

  const dialog = page.getByRole('dialog', { name: 'Publish changes?' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('open', '');
  await dialog.getByRole('button', { name: 'Confirm' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText('Result: Confirmed')).toBeVisible();
});

test('AppDrawer specimen opens from the configured edge and can be cancelled', async ({ page }) => {
  await page.goto('/components/app-drawer');

  await expect(page.getByRole('complementary', { name: 'AppDrawer controls' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Position' })).toBeVisible();
  await page.getByLabel('Position').selectOption('Start');
  await page.getByRole('button', { name: 'Open drawer' }).click();

  const drawer = page.getByRole('dialog', { name: 'Workspace settings' });
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveClass(/app-drawer--start/);
  await drawer.getByRole('button', { name: 'Cancel' }).click();
  await expect(drawer).not.toBeVisible();
  await expect(page.getByText('Result: cancelled')).toBeVisible();
});

test('Foundations exposes semantic tokens instead of a parallel palette', async ({ page }) => {
  await page.goto('/foundations');

  await expect(page.getByRole('heading', { level: 1, name: 'Tokens before decoration.' })).toBeVisible();
  await expect(page.locator('.foundations-page__swatches article')).toHaveCount(12);
  await expect(page.getByText('--app-brand', { exact: true })).toBeVisible();
  await expect(page.getByText('--app-space-4', { exact: true })).toBeVisible();
  await expect(page.getByText('--app-radius-lg', { exact: true })).toBeVisible();
});

test('Guidelines publishes the agent-first component discovery workflow', async ({ page }) => {
  await page.goto('/guidelines');

  await expect(page.getByRole('heading', { level: 2, name: 'AI / agent workflow' })).toBeVisible();
  await expect(page.getByText('Search the component catalog first.')).toBeVisible();

  const manifestLink = page.getByRole('link', { name: /machine-readable component manifest/i });
  await expect(manifestLink).toHaveAttribute('href', 'component-manifest.json');
});

for (const path of [
  '/components/app-button',
  '/components/app-text-box',
  '/components/app-text-area',
  '/components/app-select',
  '/components/app-checkbox',
  '/components/app-switch',
  '/components/app-tabs',
  '/components/app-breadcrumb',
  '/components/app-dialog',
  '/components/app-drawer',
  '/foundations',
  '/guidelines'
]) {
  test(`new Playbook surface has no serious or critical axe violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('main')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    const blockingViolations = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
    expect(blockingViolations, JSON.stringify(blockingViolations, null, 2)).toEqual([]);
  });
}
