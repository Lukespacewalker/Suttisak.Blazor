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

  await page.getByRole('button', { name: '375' }).click();
  const frameWidth = await page.locator('.component-detail__preview-frame').evaluate(element => element.getBoundingClientRect().width);
  expect(frameWidth).toBeLessThanOrEqual(376);
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

for (const path of ['/components/app-button', '/foundations', '/guidelines']) {
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
