import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('picker rejection preserves focus query and external selection in a constrained theme', async ({ page }) => {
  await page.goto('/components/app-search-picker');
  await expect(page.getByRole('heading', { level: 1, name: 'AppSearchPicker' })).toBeVisible();
  const preview = page.locator('.component-detail__preview-frame').first();
  await page.getByLabel('Reject selection changes').check();
  await preview.getByLabel('Search options').fill('Beta');
  const beta = preview.locator('[data-picker-option=beta]');
  await beta.focus();
  await beta.press('Enter');
  await expect(beta).toBeFocused();
  await expect(beta).toHaveAttribute('aria-pressed', 'false');
  await expect(preview.getByLabel('Search options')).toHaveValue('Beta');
  await expect(preview.locator('.app-search-picker__selected')).toContainText('Alpha record');
  await page.getByRole('button', { name: 'Set Beta externally' }).click();
  await expect(beta).toHaveAttribute('aria-pressed', 'true');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(preview.locator('.app-search-picker')).toBeVisible();
  const violations = (await new AxeBuilder({ page }).include('.component-detail__preview-frame').analyze()).violations;
  expect(violations).toEqual([]);
});

test('complete print composition retains records beyond screen page', async ({ page }) => {
  await page.goto('/report-print');
  await expect(page.getByText('Record 1 — application-owned description')).toBeVisible();
  await expect(page.locator('.report-print-example__print tbody tr')).toHaveCount(12);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.report-print-example__screen')).toBeHidden();
  await expect(page.locator('.report-print-example__print')).toBeVisible();
  await expect(page.getByText('Frozen source reference 12')).toBeVisible();
});

test('picker keyboard references survive filtering and parent selection removal', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/components/app-search-picker');
  const preview = page.locator('.component-detail__preview-frame').first();
  await page.getByLabel('Reject selection changes').check();
  await preview.getByLabel('Search options').fill('Beta');
  const beta = preview.locator('[data-picker-option=beta]');
  await beta.focus();
  await beta.press('Enter');
  await page.getByLabel('Reject selection changes').uncheck();
  await page.getByLabel('Multiple selection').check();
  await preview.getByLabel('Search options').fill('');
  await beta.click();
  await preview.locator('[data-picker-remove=alpha]').click();
  await beta.focus();
  await beta.press('ArrowDown');
  await expect(preview.locator('[data-picker-option=long]')).toBeFocused();
  await preview.locator('[data-picker-option=long]').press('Home');
  await expect(preview.locator('[data-picker-option=alpha]')).toBeFocused();
  await preview.locator('[data-picker-option=alpha]').press('End');
  await expect(preview.locator('[data-picker-option=long]')).toBeFocused();
  expect(errors).toEqual([]);
});
