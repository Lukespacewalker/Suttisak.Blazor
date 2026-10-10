import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('specimen checkbox controls use shared visuals and preserve keyboard, mode, and disabled bindings', async ({ page }, testInfo) => {
  await page.goto('/components/app-checkbox?appearance=quiet-luxury');
  const controls = page.getByRole('complementary', { name: 'AppCheckbox controls' });
  const checked = controls.getByRole('checkbox', { name: 'Checked', exact: true });
  await expect(checked).toHaveClass(/app-choice__native/);
  await expect(controls.locator('.app-choice').first()).toHaveCSS('display', 'flex');
  const preview = page.locator('.component-detail__preview-frame').first();
  await checked.focus();
  await checked.press('Space');
  await expect(preview.getByRole('checkbox')).not.toBeChecked();
  await controls.getByText('Checked', { exact: true }).click();
  await expect(preview.getByRole('checkbox')).toBeChecked();
  await controls.getByText('Three-state mode', { exact: true }).click();
  await expect(controls.getByRole('checkbox', { name: 'Three-state mode' })).toBeChecked();
  await expect(preview.getByRole('checkbox')).toBeChecked();
  await expect(preview).toContainText('Current state: Checked');
  await controls.getByText('Disabled', { exact: true }).click();
  await expect(preview.getByRole('checkbox')).toBeDisabled();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('shared-checkbox-mobile.png') });
});

for (const mode of ['light', 'dark']) {
  test(`quiet luxury retains six distinct application brands in ${mode} mode`, async ({ page }, testInfo) => {
    await page.goto(`/components/app-button?appearance=quiet-luxury&mode=${mode}`);
    const colors = new Set();
    for (const theme of ['audiogramiq', 'bafsworkout', 'coekpi', 'ergotrack', 'mentalinsight', 'healthinsight']) {
      await page.getByLabel('Application', { exact: true }).selectOption(theme);
      const button = page.locator('.component-detail__preview-frame .app-button--primary').first();
      await expect(button).toBeVisible();
      colors.add(await button.evaluate(el => getComputedStyle(el).backgroundColor));
      await expect(page.locator('.playbook').first()).toHaveCSS('background-color', mode === 'light' ? 'rgb(245, 242, 235)' : 'rgb(28, 27, 24)');
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
    }
    expect(colors.size).toBe(6);
    await page.screenshot({ path: testInfo.outputPath(`brand-${mode}-desktop.png`) });
    await page.getByRole('button', { name: '375', exact: true }).click();
    const isolated = page.frameLocator('[data-testid="isolated-specimen-frame"]');
    const host = isolated.locator('.specimen-host');
    await expect(host).toHaveAttribute('data-appearance', 'quiet-luxury');
    const mainColor = await page.locator('.playbook').first().evaluate(el => getComputedStyle(el).getPropertyValue('--app-brand'));
    await expect.poll(() => host.evaluate(el => getComputedStyle(el).getPropertyValue('--app-brand'))).toBe(mainColor);
  });
}
