import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import path from 'node:path';

async function openLarge(page, appearance = 'nexora') {
  await page.goto(`/components/app-grid-paginator?appearance=${appearance}`);
  await page.getByRole('combobox', { name: 'Record set', exact: true }).selectOption('large');
  const pagination = page.getByRole('navigation', { name: 'Record pagination' });
  await expect(pagination.locator('.app-grid-paginator__summary')).toHaveText('Showing 1–10 of 1,248 rows');
  return pagination;
}

function capturePath(testInfo, name) {
  return process.env.CONTROL_EVIDENCE_DIR ? path.join(process.env.CONTROL_EVIDENCE_DIR, name) : testInfo.outputPath(name);
}

test('numbered pages expose first, middle and last windows, real rows, and one current page', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const pagination = await openLarge(page);
  const numbers = pagination.locator('.app-grid-paginator__number');
  await expect(numbers).toHaveText(['1', '2', '3', '4', '5', '125']);
  await expect(pagination.locator('.app-grid-paginator__ellipsis')).toHaveCount(1);
  const page5 = pagination.getByRole('button', { name: 'Page 5', exact: true });
  await page5.focus();
  await page5.press('Enter');
  await expect(pagination.locator('[aria-current="page"]')).toHaveText('5');
  await expect(page.getByRole('table', { name: 'Paged records table', exact: true }).locator('tbody tr').first()).toContainText('Record 41');
  await pagination.getByRole('button', { name: 'Page 125', exact: true }).click();
  await expect(pagination.locator('.app-grid-paginator__summary')).toHaveText('Showing 1,241–1,248 of 1,248 rows');
  await expect(numbers).toHaveText(['1', '121', '122', '123', '124', '125']);
  await expect(pagination.getByRole('button', { name: 'Next page' })).toBeDisabled();
  await expect(page.getByRole('table', { name: 'Paged records table', exact: true }).locator('tbody tr').first()).toContainText('Record 1,241');
  await page.getByLabel('Legacy numeric page input').check();
  await pagination.getByRole('spinbutton').fill('62');
  await pagination.getByRole('spinbutton').press('Enter');
  await page.getByLabel('Legacy numeric page input').uncheck();
  await expect(numbers).toHaveText(['1', '60', '61', '62', '63', '64', '125']);
  await expect(pagination.locator('.app-grid-paginator__ellipsis')).toHaveCount(2);
  await expect(pagination.locator('[aria-current="page"]')).toHaveText('62');
  await expect(pagination.locator('.app-grid-paginator__summary')).toHaveText('Showing 611–620 of 1,248 rows');
  await pagination.screenshot({ path: capturePath(testInfo, 'pagination-middle-1440.png') });
  await pagination.getByRole('combobox', { name: 'Rows per page' }).selectOption('50');
  await expect(pagination.locator('[aria-current="page"]')).toHaveText('1');
  await expect(pagination.locator('.app-grid-paginator__summary')).toHaveText('Showing 1–50 of 1,248 rows');
  await expect(pagination.getByRole('button', { name: 'Page 25', exact: true })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Paged records table', exact: true }).locator('tbody tr.app-grid__data-row')).toHaveCount(50);
});

test('empty and loading results announce their state without navigable phantom pages', async ({ page }) => {
  const pagination = await openLarge(page);
  await page.getByRole('combobox', { name: 'Record set', exact: true }).selectOption('empty');
  await expect(pagination.locator('.app-grid-paginator__summary')).toHaveText('Showing 0–0 of 0 rows');
  await expect(pagination.locator('.app-grid-paginator__number')).toHaveCount(0);
  await expect(pagination.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  await expect(pagination.getByRole('button', { name: 'Next page' })).toBeDisabled();
  await page.getByRole('combobox', { name: 'Record set', exact: true }).selectOption('loading');
  await expect(pagination.locator('.app-grid-paginator__summary')).toHaveText('Rows are loading');
  await expect(pagination.locator('.app-grid-paginator__number')).toHaveCount(0);
  await expect(pagination.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  await expect(pagination.getByRole('button', { name: 'Next page' })).toBeDisabled();
});

for (const width of [320, 390, 768, 1024, 1440]) {
  for (const mode of ['light', 'dark']) {
    test(`numbered pagination remains operable and contained at ${width} in ${mode}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ colorScheme: mode, reducedMotion: 'reduce' });
      await page.addInitScript(mode => localStorage.setItem('suttisak-blazor:theme-settings', JSON.stringify({ mode, appearance: 'nexora' })), mode);
      const pagination = await openLarge(page);
      if (width === 1440) await page.locator('.component-specimen__demo').evaluate(el => { el.style.width = '256px'; });
      const page2 = pagination.getByRole('button', { name: 'Page 2', exact: true });
      await page2.focus();
      await page2.press('Enter');
      await expect(page2).toHaveAttribute('aria-current', 'page');
      await expect(page2).toBeFocused();
      await expect(page2).toHaveCSS('outline-style', 'solid');
      await expect(pagination.locator('.app-grid-paginator__summary')).toHaveText('Showing 11–20 of 1,248 rows');
      await pagination.getByRole('combobox', { name: 'Rows per page' }).selectOption('25');
      await expect(pagination.locator('[aria-current="page"]')).toHaveText('1');
      expect(await pagination.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      for (const control of await pagination.locator('button:visible, select:visible').all()) {
        const box = await control.boundingBox();
        expect(box.width).toBeGreaterThanOrEqual(24);
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
      const results = await new AxeBuilder({ page }).include('.app-grid-paginator').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(results.violations.filter(v => ['serious', 'critical'].includes(v.impact))).toEqual([]);
      await pagination.screenshot({ path: capturePath(testInfo, `pagination-${width}-${mode}.png`) });
    });
  }
}

for (const appearance of ['standard', 'essential', 'quiet-luxury']) {
  test(`numbered paging preserves host state and focus in ${appearance}`, async ({ page }) => {
    const pagination = await openLarge(page, appearance);
    const page2 = pagination.getByRole('button', { name: 'Page 2', exact: true });
    await page2.focus();
    await page2.press('Enter');
    await expect(page2).toHaveAttribute('aria-current', 'page');
    await expect(page2).toBeFocused();
    await expect(pagination.locator('.app-grid-paginator__summary')).toHaveText('Showing 11–20 of 1,248 rows');
  });
}

test('RTL and forced colors retain the current page, arrow direction and visible focus', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  const pagination = await openLarge(page);
  await pagination.evaluate(el => { el.dir = 'rtl'; });
  const page2 = pagination.getByRole('button', { name: 'Page 2', exact: true });
  await page2.focus();
  await page2.press('Enter');
  await expect(page2).toHaveAttribute('aria-current', 'page');
  await expect(page2).toHaveCSS('outline-style', 'solid');
  await expect(page2).toHaveCSS('outline-width', '2px');
  await expect(pagination.getByRole('button', { name: 'Next page' }).locator('svg')).toHaveCSS('transform', 'matrix(-1, 0, 0, -1, 0, 0)');
});
