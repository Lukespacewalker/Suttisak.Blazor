import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const dataRoutes = [
  '/components/app-grid-shell',
  '/components/app-grid',
  '/components/app-grid-paginator',
  '/components/app-grid-property-column',
  '/components/app-grid-template-column'
];

test('AppGridShell workbench exposes runtime API metadata and paged data', async ({ page }) => {
  await page.goto('/components/app-grid-shell');

  await expect(page.getByRole('complementary', { name: 'AppGridShell controls' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'State', exact: true })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Playbook records table' })).toBeVisible();
  await expect(page.getByText('6 rows', { exact: true })).toBeVisible();
  await expect(page.getByRole('spinbutton')).toHaveValue('1');
});

test('data grid sorting and pagination execute against the live grid', async ({ page }) => {
  await page.goto('/components/app-grid');

  const table = page.getByRole('table', { name: 'Playbook records table' });
  await expect(table.locator('tbody tr')).toHaveCount(3);
  await page.getByRole('button', { name: 'ID', exact: true }).click();
  await expect(table.locator('tbody tr').first()).toContainText('1043');

  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('spinbutton')).toHaveValue('2');
  await expect(table.locator('tbody tr').first()).toContainText('1046');
});

test('data grid search and page-size controls recompute visible data', async ({ page }) => {
  await page.goto('/components/app-grid-shell');

  await page.getByRole('searchbox', { name: 'Search records' }).fill('Wellness');
  await expect(page.getByText('2 matching records', { exact: true })).toBeVisible();
  await expect(page.getByText('2 rows', { exact: true })).toBeVisible();

  await page.getByLabel('Rows per page').selectOption('2');
  await expect(page.getByRole('spinbutton')).toHaveValue('1');
});

test('data grid exposes loading and empty states without rendering stale rows', async ({ page }) => {
  await page.goto('/components/app-grid-shell');

  await page.getByLabel('Content state').selectOption('Loading');
  await expect(page.getByText('Loading playbook records', { exact: true })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Playbook records table' })).not.toBeVisible();

  await page.getByLabel('Content state').selectOption('Empty');
  await expect(page.getByText('No matching records', { exact: true })).toBeVisible();
  await expect(page.getByText('Change the search or state controls to bring records back.', { exact: true })).toBeVisible();
});

test('multiple selection uses native checkbox semantics', async ({ page }) => {
  await page.goto('/components/app-grid');

  const selectAll = page.getByRole('checkbox', { name: 'Select all visible rows' });
  await expect(selectAll).toBeVisible();
  await selectAll.check();

  const rows = page.locator('.component-detail__preview-frame .app-grid__table tbody tr');
  await expect(rows.first()).toHaveClass(/is-selected/);
  await expect(rows.nth(1)).toHaveClass(/is-selected/);
  await expect(rows.nth(2)).toHaveClass(/is-selected/);
});

for (const path of dataRoutes) {
  test(`data workbench has no serious or critical axe violations on ${path}`, async ({ page }) => {
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
