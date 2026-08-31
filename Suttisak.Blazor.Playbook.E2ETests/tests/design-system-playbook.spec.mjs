import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('machine-readable manifest is internally complete and unique', async ({ request }) => {
  const response = await request.get('/component-manifest.json');
  expect(response.ok()).toBeTruthy();

  const manifest = await response.json();
  expect(manifest.schemaVersion).toBe(1);
  const names = manifest.components.map(component => component.name);
  const groupedNames = manifest.groups.flatMap(group => group.components);
  expect(manifest.componentCount).toBe(names.length);
  expect(new Set(names).size).toBe(names.length);
  expect(groupedNames.sort()).toEqual([...names].sort());
  expect(manifest.patterns.length).toBeGreaterThan(0);
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

  await page.getByRole('button', { name: '375' }).click();
  const host = page.getByTestId('isolated-specimen-frame');
  await expect(host).toBeVisible();
  await expect.poll(
    () => host.evaluate(element => element.contentWindow?.innerWidth ?? 0),
    { timeout: 2_000 }
  ).toBe(375);

  const isolated = page.frameLocator('[data-testid="isolated-specimen-frame"]');
  await expect(isolated.getByRole('button', { name: 'Save changes' }).first()).toBeVisible();
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

test('AppTextBox uses an outline-free filled surface with a visible soft focus state', async ({ page }) => {
  await page.goto('/components/app-text-box');

  const preview = page.locator('.component-detail__preview-frame').first();
  const input = preview.getByRole('textbox', { name: 'Full name' });
  const surface = preview.locator('.app-form-control__input-wrap').first();

  await expect(surface).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
  await expect(surface).toHaveCSS('box-shadow', 'none');

  await input.focus();
  await expect(input).toBeFocused();
  await expect(input).toHaveCSS('outline-style', 'none');
  await expect(surface).not.toHaveCSS('box-shadow', 'none');
  await expect(surface).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');

  await page.getByRole('button', { name: 'Use dark theme' }).first().click();
  await input.focus();
  await expect(input).toHaveCSS('outline-style', 'none');
  await expect(surface).not.toHaveCSS('box-shadow', 'none');
  await expect(surface).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
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

test('AppDrawer supports X and Escape while protecting against backdrop dismissal', async ({ page }) => {
  await page.goto('/components/app-drawer');

  await expect(page.getByRole('complementary', { name: 'AppDrawer controls' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Position' })).toBeVisible();
  await page.getByLabel('Position').selectOption('Start');
  await page.getByLabel('Prevent outside dismiss').check();
  await page.getByRole('button', { name: 'Open drawer' }).click();

  const drawer = page.getByRole('dialog', { name: 'Workspace settings' });
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveClass(/app-drawer--start/);
  await expect(drawer).toHaveAttribute('data-dismissible', 'true');
  await expect(drawer).toHaveAttribute('data-prevent-outside-dismiss', 'true');
  await expect(drawer.getByRole('button', { name: 'Close drawer' })).toBeVisible();

  const viewport = page.viewportSize();
  await page.mouse.click((viewport?.width ?? 1280) - 5, 5);
  await expect(drawer).toBeVisible();

  await drawer.getByRole('button', { name: 'Close drawer' }).click();
  await expect(drawer).not.toBeVisible();
  await expect(page.getByText('Result: cancelled')).toBeVisible();

  await page.getByRole('button', { name: 'Open drawer' }).click();
  await expect(drawer).toBeVisible();
  await drawer.press('Escape');
  await expect(drawer).not.toBeVisible();
});

test('Foundations exposes semantic tokens instead of a parallel palette', async ({ page }) => {
  await page.goto('/foundations');

  await expect(page.getByRole('heading', { level: 1, name: 'Design tokens' })).toBeVisible();
  await expect(page.locator('.foundations-page__token-grid article')).toHaveCount(71);
  await expect(page.getByText('--app-brand', { exact: true })).toBeVisible();
  await expect(page.getByText('--app-space-4', { exact: true })).toBeVisible();
  await expect(page.getByText('--app-radius-lg', { exact: true })).toBeVisible();
});

test('Guidelines publishes the component discovery workflow', async ({ page }) => {
  await page.goto('/guidelines');

  await expect(page.getByRole('heading', { level: 2, name: 'Repository workflow' })).toBeVisible();
  await expect(page.getByText('Search the component catalog.')).toBeVisible();

  const manifestLink = page.getByRole('link', { name: /View component manifest/i });
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
