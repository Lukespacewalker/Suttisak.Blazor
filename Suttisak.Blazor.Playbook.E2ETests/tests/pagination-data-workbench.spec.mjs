import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const paginatorRoute = '/components/app-grid-paginator';

test('AppGridPaginator exposes runtime API metadata and starts at the first boundary', async ({ page }) => {
  await page.goto(paginatorRoute);

  await expect(page.getByRole('complementary', { name: 'Grid pagination and virtualization controls' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'State', exact: true })).toBeVisible();

  const pagination = page.getByRole('navigation', { name: 'Record pagination' });
  await expect(pagination.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  await expect(pagination.getByRole('button', { name: 'Next page' })).toBeEnabled();
  await expect(page.getByTestId('grid-pagination-summary')).toHaveText('Page 1 of 3');
});

test('AppGridPaginator moves with buttons and direct page entry while clamping boundaries', async ({ page }) => {
  await page.goto(paginatorRoute);

  const pagination = page.getByRole('navigation', { name: 'Record pagination' });
  const previous = pagination.getByRole('button', { name: 'Previous page' });
  const next = pagination.getByRole('button', { name: 'Next page' });
  const pageNumber = pagination.getByRole('spinbutton');

  await next.click();
  await expect(page.getByTestId('grid-pagination-summary')).toHaveText('Page 2 of 3');
  await expect(page.getByTestId('pagination-status')).toHaveText('AppGridPaginator moved to page 2.');
  await expect(previous).toBeEnabled();

  await pageNumber.fill('99');
  await pageNumber.press('Enter');
  await expect(page.getByTestId('grid-pagination-summary')).toHaveText('Page 3 of 3');
  await expect(next).toBeDisabled();

  await pageNumber.fill('1');
  await pageNumber.press('Enter');
  await expect(page.getByTestId('grid-pagination-summary')).toHaveText('Page 1 of 3');
  await expect(previous).toBeDisabled();
});

test('changing page size resets the current page and total pages', async ({ page }) => {
  await page.goto(paginatorRoute);

  const pagination = page.getByRole('navigation', { name: 'Record pagination' });
  await pagination.getByRole('button', { name: 'Next page' }).click();
  await expect(page.getByTestId('grid-pagination-summary')).toHaveText('Page 2 of 3');

  await page.getByLabel('Rows per page').selectOption('3');
  await expect(page.getByTestId('grid-pagination-summary')).toHaveText('Page 1 of 2');
  await expect(page.getByTestId('pagination-status')).toHaveText('AppGridPaginator now shows 3 rows per page.');
});

test('AppGridShell exposes named focusable data regions', async ({ page }) => {
  await page.goto(paginatorRoute);

  const pagedShell = page.getByRole('region', { name: 'Paged records example' });
  const virtualShell = page.getByRole('region', { name: 'Virtual records example' });

  await expect(pagedShell).toHaveAttribute('tabindex', '0');
  await expect(virtualShell).toHaveAttribute('tabindex', '0');
  await pagedShell.focus();
  await expect(pagedShell).toBeFocused();
});

test('AppGrid virtualization controls remain explicit and valid', async ({ page }) => {
  await page.goto(paginatorRoute);

  await page.getByLabel('Virtualize AppGrid').check();
  await page.getByLabel('Overscan rows').selectOption('5');
  await expect(page.getByLabel('Virtualize AppGrid')).toBeChecked();
  await expect(page.getByLabel('Overscan rows')).toHaveValue('5');
  await expect(page.getByRole('table', { name: 'Virtual records table' })).toBeVisible();
});

test('grid pagination workbench has no serious or critical axe violations', async ({ page }) => {
  await page.goto(paginatorRoute);
  await expect(page.locator('main')).toBeVisible();

  const results = await new AxeBuilder({ page })
    .include('main')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();

  const blockingViolations = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
  expect(blockingViolations, JSON.stringify(blockingViolations, null, 2)).toEqual([]);
});
