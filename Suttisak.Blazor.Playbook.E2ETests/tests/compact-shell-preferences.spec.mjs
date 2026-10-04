import { expect, test } from '@playwright/test';
import path from 'node:path';

function capturePath(testInfo, name) {
  return process.env.CONTROL_EVIDENCE_DIR ? path.join(process.env.CONTROL_EVIDENCE_DIR, name) : testInfo.outputPath(name);
}

test('opted-in shell hides scheme and language actions behind two keyboard operable icon popovers', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/application-shell?compactPreferences=true');
  const shell = page.locator('[data-app-shell]');
  const header = shell.locator('.app-shell__header');
  const theme = header.locator('[data-shell-preference="theme"]');
  const language = header.locator('[data-shell-preference="language"]');
  const themePopup = shell.locator('[data-shell-preference-popup="theme"]');
  const languagePopup = shell.locator('[data-shell-preference-popup="language"]');
  await expect(theme).toHaveAccessibleName('Color scheme');
  await expect(language).toHaveAccessibleName('Language');
  await expect(header.getByRole('button', { name: 'Use dark theme' })).not.toBeVisible();
  await theme.focus();
  await theme.press('Enter');
  await expect(themePopup).toBeVisible();
  await theme.press('Escape');
  await expect(themePopup).not.toBeVisible();
  await expect(theme).toBeFocused();
  await theme.press('Enter');
  await themePopup.getByRole('button', { name: 'Use dark theme' }).click();
  await expect(page.locator('.playbook')).toHaveCSS('color-scheme', 'dark');
  await expect(themePopup.getByRole('button', { name: 'Use dark theme' })).toHaveAttribute('aria-pressed', 'true');
  await language.click();
  await expect(themePopup).not.toBeVisible();
  await expect(languagePopup).toBeVisible();
  await page.getByRole('heading', { name: 'Good morning, Kanda' }).click();
  await expect(languagePopup).not.toBeVisible();
  await expect(header.locator('select')).toHaveCount(0);
});

for (const width of [1024, 1440]) {
  for (const mode of ['light', 'dark']) {
    test(`icon preference popovers stay anchored and readable at ${width} in ${mode}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/application-shell?compactPreferences=true&appearance=nexora&mode=${mode}`);
      const shell = page.locator('[data-app-shell]');
      for (const preference of ['theme', 'language']) {
        const trigger = shell.locator(`[data-shell-preference="${preference}"]`);
        const popup = shell.locator(`[data-shell-preference-popup="${preference}"]`);
        await trigger.focus();
        await trigger.press('Space');
        await expect(popup).toBeVisible();
        const triggerBox = await trigger.boundingBox();
        const popupBox = await popup.boundingBox();
        expect(triggerBox.width).toBeGreaterThanOrEqual(44);
        expect(triggerBox.height).toBeGreaterThanOrEqual(44);
        expect(popupBox.y).toBeGreaterThanOrEqual(triggerBox.y + triggerBox.height);
        expect(popupBox.x).toBeGreaterThanOrEqual(0);
        expect(popupBox.x + popupBox.width).toBeLessThanOrEqual(width);
        expect(Math.abs(popupBox.x + popupBox.width - triggerBox.x - triggerBox.width)).toBeLessThanOrEqual(2);
        for (const option of await popup.getByRole('button').all()) {
          const box = await option.boundingBox();
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
        await shell.locator('.app-shell__header').screenshot({ path: capturePath(testInfo, `header-${width}-${mode}-${preference}.png`) });
        await popup.screenshot({ path: capturePath(testInfo, `popup-${width}-${mode}-${preference}.png`) });
        await trigger.press('Escape');
        await expect(popup).not.toBeVisible();
        await expect(trigger).toBeFocused();
        await expect(trigger).toHaveCSS('outline-width', '2px');
      }
    });
  }
}

for (const width of [320, 390, 768]) {
  test(`compact header keeps raw mobile picker actions and drawer Escape at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/application-shell?compactPreferences=true&appearance=nexora');
    const shell = page.locator('[data-app-shell]');
    await expect(shell.locator('[data-shell-preference="theme"]')).not.toBeVisible();
    const menu = shell.locator('[data-shell-action="mobile"]');
    await menu.click();
    const navigation = shell.locator('.app-shell__navigation');
    await expect(navigation.locator('[popover]')).toHaveCount(0);
    const dark = navigation.getByRole('button', { name: 'Use dark theme' });
    await dark.focus();
    await dark.press('Enter');
    await expect(dark).toHaveAttribute('aria-pressed', 'true');
    await dark.press('Escape');
    await expect(navigation).not.toHaveClass(/is-open/);
    await expect(menu).toBeFocused();
  });
}

for (const appearance of ['standard', 'essential', 'quiet-luxury']) {
  test(`default header retains its existing visible pickers in ${appearance}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/application-shell?appearance=${appearance}`);
    const header = page.locator('[data-app-shell] .app-shell__header');
    await expect(header.locator('[data-shell-preference], [popover]')).toHaveCount(0);
    await expect(header.getByRole('button', { name: 'Use dark theme' })).toBeVisible();
    await expect(header.getByRole('button', { name: 'EN', exact: true })).toBeVisible();
  });
}

test('an open desktop preference popup cannot obstruct mobile navigation after resize', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/application-shell?compactPreferences=true&appearance=nexora');
  const shell = page.locator('[data-app-shell]');
  await shell.locator('[data-shell-preference="theme"]').click();
  await expect(shell.locator('[data-shell-preference-popup="theme"]')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(shell.locator('[data-shell-preference-popup="theme"]')).not.toBeVisible();
  const menu = shell.locator('[data-shell-action="mobile"]');
  await menu.click();
  const dark = shell.locator('.app-shell__navigation').getByRole('button', { name: 'Use dark theme' });
  await dark.focus();
  await dark.press('Escape');
  await expect(menu).toBeFocused();
  await expect(shell.locator('.app-shell__navigation')).not.toHaveClass(/is-open/);
});
