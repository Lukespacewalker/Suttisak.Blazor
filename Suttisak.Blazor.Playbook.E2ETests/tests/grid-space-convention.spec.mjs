import { expect, test } from '@playwright/test';

test('paged filler preserves space without borders or hover and keeps one-page navigation', async ({ page }) => {
  await page.goto('/components/app-grid');
  const table = page.getByRole('table', { name: 'Playbook records table' });
  await expect(table).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search records' }).fill('Wellness');
  await expect(page.getByText('2 matching records', { exact: true })).toBeVisible();
  const filler = table.locator('tbody tr').last();
  await expect(filler).toHaveText('');
  expect(await filler.evaluate(row => row.getBoundingClientRect().height)).toBeGreaterThan(20);
  await filler.hover();
  expect(await filler.evaluate(row => getComputedStyle(row).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
  for (const cell of await filler.locator('td').all()) {
    await expect(cell).toHaveCSS('border-bottom-width', '0px');
  }
  const paginator = page.getByRole('navigation', { name: 'Playbook grid pagination' });
  await expect(paginator).toBeVisible();
  await expect(paginator.getByRole('button', { name: 'Previous', exact: true })).toBeDisabled();
  await expect(paginator.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
  await expect(paginator.locator('button svg')).toHaveCount(2);
});

test('virtual scrolling has no paginator and retains a bounded row window', async ({ page }) => {
  await page.goto('/grid-performance');
  const table = page.getByRole('table', { name: '100000 virtual records' });
  // Match this 100k-record WASM example's established hosted-runner startup budget.
  await expect(table).toBeVisible({ timeout: 20_000 });
  const viewport = page.locator('.app-grid');
  await viewport.scrollIntoViewIfNeeded();
  const rows = table.locator('tbody tr.app-grid__data-row');
  await expect(rows.first()).toBeVisible({ timeout: 20_000 });
  const firstRecord = await rows.first().innerText();
  await expect(page.locator('.app-grid-paginator')).toHaveCount(0);
  expect(await rows.count()).toBeLessThan(200);
  await expect.poll(() => viewport.evaluate(el => el.scrollHeight)).toBeGreaterThan(5000);
  await viewport.evaluate(el => { el.scrollTop = 5000; });
  await expect(rows.first()).not.toHaveText(firstRecord);
  expect(await rows.count()).toBeLessThan(200);
});
