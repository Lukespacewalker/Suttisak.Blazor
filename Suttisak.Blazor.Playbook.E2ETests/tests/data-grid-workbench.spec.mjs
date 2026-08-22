import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const dataRoutes = [
  '/components/app-data-grid',
  '/components/app-grid',
  '/components/app-grid-paginator',
  '/components/app-grid-property-column',
  '/components/app-grid-select-column',
  '/components/app-grid-template-column'
];

test('AppDataGrid workbench exposes runtime API metadata and paged data', async ({ page }) => {
  await page.goto('/components/app-data-grid');

  await expect(page.getByRole('complementary', { name: 'AppDataGrid controls' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'State', exact: true })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Playbook records table' })).toBeVisible();
  await expect(page.getByText('6 rows', { exact: true })).toBeVisible();
  await expect(page.getByText('Page 1 of 2', { exact: true })).toBeVisible();
});

test('data grid sorting and pagination execute against the live grid', async ({ page }) => {
  await page.goto('/components/app-grid');

  const table = page.getByRole('table', { name: 'Playbook records table' });
  await expect(table.locator('tbody tr')).toHaveCount(3);
  await page.getByRole('button', { name: 'Sort ID ascending' }).click();
  await expect(table.locator('tbody tr').first()).toContainText('1043');

  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('Page 2 of 2', { exact: true })).toBeVisible();
  await expect(table.locator('tbody tr').first()).toContainText('1046');
});

test('data grid search and page-size controls recompute visible data', async ({ page }) => {
  await page.goto('/components/app-data-grid');

  await page.getByRole('searchbox', { name: 'Search records' }).fill('Wellness');
  await expect(page.getByText('2 matching records', { exact: true })).toBeVisible();
  await expect(page.getByText('2 rows', { exact: true })).toBeVisible();

  await page.getByLabel('Rows per page').selectOption('2');
  await expect(page.getByText('Page 1 of 1', { exact: true })).toBeVisible();
});

test('data grid exposes loading and empty states without rendering stale rows', async ({ page }) => {
  await page.goto('/components/app-data-grid');

  await page.getByLabel('Content state').selectOption('Loading');
  await expect(page.getByText('Loading playbook records', { exact: true })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Playbook records table' })).not.toBeVisible();

  await page.getByLabel('Content state').selectOption('Empty');
  await expect(page.getByText('No matching records', { exact: true })).toBeVisible();
  await expect(page.getByText('Change the search or state controls to bring records back.', { exact: true })).toBeVisible();
});

test('multiple selection uses native checkbox semantics', async ({ page }) => {
  await page.goto('/components/app-grid-select-column');

  const selectAll = page.getByRole('checkbox', { name: 'Select all visible rows' });
  await expect(selectAll).toBeVisible();
  await selectAll.check();

  const rows = page.locator('.component-detail__preview-frame .app-grid__table tbody tr');
  await expect(rows.first()).toHaveAttribute('aria-selected', 'true');
  await expect(rows.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(rows.nth(2)).toHaveAttribute('aria-selected', 'true');
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
