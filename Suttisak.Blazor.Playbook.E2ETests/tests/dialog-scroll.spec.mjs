import { test, expect } from '@playwright/test';
import { setCheckbox } from '../helpers/set-checkbox.mjs';

for (const footer of [true, false]) {
  test(`long dialog content scrolls with ${footer ? 'a fixed footer' : 'body actions'} on a narrow viewport`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 650 });
    await page.goto('/components/app-dialog');
    await setCheckbox(page.getByLabel('Long content', { exact: true }), true);
    if (!footer) await setCheckbox(page.getByLabel('Show footer', { exact: true }), false);
    const trigger = page.getByRole('button', { name: 'Open dialog', exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Publish changes?' });
    await expect(dialog).toBeVisible();
    const body = dialog.locator('.app-dialog__body');
    const geometry = await body.evaluate(element => {
      const rect = element.getBoundingClientRect();
      const outer = element.closest('dialog').getBoundingClientRect();
      return { bottom: rect.bottom, outerBottom: outer.bottom, height: element.clientHeight, scroll: element.scrollHeight };
    });
    expect(geometry.bottom).toBeLessThanOrEqual(geometry.outerBottom + 1);
    expect(geometry.scroll).toBeGreaterThan(geometry.height);
    if (footer) await expect(dialog.getByRole('button', { name: 'Confirm', exact: true })).toBeInViewport();
    await body.evaluate(element => { element.scrollTop = element.scrollHeight; });
    const close = dialog.getByRole('button', { name: footer ? 'Cancel' : 'Close content', exact: true });
    await expect(close).toBeInViewport();
    await close.click();
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });
}
