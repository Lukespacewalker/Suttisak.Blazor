import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const paginationRoutes = [
  '/components/app-pagination',
  '/components/app-quick-grid',
  '/components/app-quick-paginator',
  '/components/data-grid-container'
];

test('AppPagination exposes runtime API metadata and starts at the first boundary', async ({ page }) => {
  await page.goto('/components/app-pagination');

  await expect(page.getByRole('complementary', { name: 'Pagination and QuickGrid controls' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'State', exact: true })).toBeVisible();

  const pagination = page.getByRole('navigation', { name: 'Record pagination' });
  await expect(pagination.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  await expect(pagination.getByRole('button', { name: 'Next page' })).toBeEnabled();
  await expect(page.getByTestId('app-pagination-summary')).toHaveText('Page 1 of 3');
});

test('AppPagination moves with buttons and direct page entry while clamping boundaries', async ({ page }) => {
  await page.goto('/components/app-pagination');

  const pagination = page.getByRole('navigation', { name: 'Record pagination' });
  const previous = pagination.getByRole('button', { name: 'Previous page' });
  const next = pagination.getByRole('button', { name: 'Next page' });
  const pageNumber = pagination.getByRole('spinbutton');

  await next.click();
  await expect(page.getByTestId('app-pagination-summary')).toHaveText('Page 2 of 3');
  await expect(page.getByTestId('pagination-status')).toHaveText('AppPagination moved to page 2.');
  await expect(previous).toBeEnabled();

  await pageNumber.fill('99');
  await pageNumber.press('Enter');
  await expect(page.getByTestId('app-pagination-summary')).toHaveText('Page 3 of 3');
  await expect(next).toBeDisabled();

  await pageNumber.fill('1');
  await pageNumber.press('Enter');
  await expect(page.getByTestId('app-pagination-summary')).toHaveText('Page 1 of 3');
  await expect(previous).toBeDisabled();
});

test('changing AppPagination page size resets the current page and total pages', async ({ page }) => {
  await page.goto('/components/app-pagination');

  const pagination = page.getByRole('navigation', { name: 'Record pagination' });
  await pagination.getByRole('button', { name: 'Next page' }).click();
  await expect(page.getByTestId('app-pagination-summary')).toHaveText('Page 2 of 3');

  await page.getByLabel('App rows per page').selectOption('3');
  await expect(page.getByTestId('app-pagination-summary')).toHaveText('Page 1 of 2');
  await expect(page.getByTestId('pagination-status')).toHaveText('AppPagination now shows 3 rows per page.');
});

test('DataGridContainer exposes named focusable data regions', async ({ page }) => {
  await page.goto('/components/data-grid-container');

  const appContainer = page.getByRole('region', { name: 'Paged records example' });
  const quickContainer = page.getByRole('region', { name: 'QuickGrid records example' });

  await expect(appContainer).toHaveAttribute('tabindex', '0');
  await expect(quickContainer).toHaveAttribute('tabindex', '0');
  await appContainer.focus();
  await expect(appContainer).toBeFocused();
});

test('AppQuickGrid renders framework-backed paging and responds to page size controls', async ({ page }) => {
  await page.goto('/components/app-quick-grid');

  await expect(page.getByRole('rowheader', { name: 'Virtualize', exact: true })).toBeVisible();
  await expect(page.getByRole('table', { name: 'QuickGrid records table' })).toBeVisible();
  await expect(page.getByRole('row')).toHaveCount(3);

  await page.getByLabel('QuickGrid rows per page').selectOption('3');
  await expect(page.getByRole('row')).toHaveCount(4);
  await expect(page.getByTestId('pagination-status')).toHaveText('QuickGrid now shows 3 rows per page.');
});

test('AppQuickPaginator advances and disables next at the final page', async ({ page }) => {
  await page.goto('/components/app-quick-paginator');

  const paginator = page.getByTestId('quick-paginator');
  const next = paginator.getByRole('button', { name: /next/i });
  const previous = paginator.getByRole('button', { name: /previous/i });

  await expect(previous).toBeDisabled();
  await next.click();
  await expect(previous).toBeEnabled();
  await next.click();
  await expect(next).toBeDisabled();
});

test('QuickGrid virtualization controls remain explicit and valid', async ({ page }) => {
  await page.goto('/components/app-quick-grid');

  await page.getByLabel('Virtualize QuickGrid').check();
  await page.getByLabel('Overscan rows').selectOption('5');
  await expect(page.getByLabel('Virtualize QuickGrid')).toBeChecked();
  await expect(page.getByLabel('Overscan rows')).toHaveValue('5');
  await expect(page.getByRole('table', { name: 'QuickGrid records table' })).toBeVisible();
});

for (const path of paginationRoutes) {
  test(`pagination data workbench has no serious or critical axe violations on ${path}`, async ({ page }) => {
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
