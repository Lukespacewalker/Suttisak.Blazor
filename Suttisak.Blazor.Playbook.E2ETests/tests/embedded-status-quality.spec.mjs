import { expect, test } from '@playwright/test';
import { setCheckbox } from '../helpers/set-checkbox.mjs';

for (const width of [375, 1280]) {
  for (const mode of ['light', 'dark']) {
    test(`grid states keep one surface and live-region semantics at ${width} in ${mode}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/specimens/app-grid?appearance=nexora&mode=${mode}`);
      const shell = page.locator('.app-grid-shell');
      await expect(shell).toBeVisible();

      for (const state of ['Loading', 'Empty', 'Error']) {
        await page.getByRole('combobox', { name: 'Content state', exact: true }).selectOption(state);
        const status = shell.locator('.status-panel');
        await expect(status).toBeVisible();
        await expect(status).toHaveAttribute('role', state === 'Error' ? 'alert' : 'status');
        await expect(status).toHaveAttribute('aria-live', state === 'Error' ? 'assertive' : 'polite');
        await expect(status).toHaveCSS('border-top-width', '0px');
        await expect(status).toHaveCSS('border-radius', '0px');
        await expect(status).toHaveCSS('box-shadow', 'none');
        await expect(status).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
        const fits = await status.evaluate(element => {
          const statusBox = element.getBoundingClientRect();
          const shellBox = element.closest('.app-grid-shell').getBoundingClientRect();
          return statusBox.left >= shellBox.left && statusBox.right <= shellBox.right;
        });
        expect(fits).toBe(true);
      }
    });
  }
}

test('standalone status stays framed and embedded async retains retry interaction', async ({ page }) => {
  await page.goto('/specimens/status-panel?appearance=nexora&mode=light');
  const status = page.getByRole('status').filter({ hasText: 'System available' });
  await expect(status).toBeVisible();
  expect(await status.evaluate(element => parseFloat(getComputedStyle(element).borderTopWidth))).toBeGreaterThan(0);

  await setCheckbox(page.getByRole('checkbox', { name: 'Embedded panels', exact: true }), true);
  await expect(status).toHaveCSS('border-top-width', '0px');
  await page.getByRole('combobox', { name: 'Async state', exact: true }).selectOption('Error');
  const error = page.getByRole('alert').filter({ hasText: 'Report unavailable' });
  await expect(error).toHaveCSS('border-top-width', '0px');
  await error.getByRole('button', { name: 'Retry load' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Loading report' })).toBeVisible();
  await expect(page.getByText('Retry requested 1 time.', { exact: true })).toBeVisible();
});
