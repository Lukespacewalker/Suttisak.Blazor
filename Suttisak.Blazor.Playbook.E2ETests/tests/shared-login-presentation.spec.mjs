import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const mode of ['light', 'dark']) {
  test(`shared login ${mode} keeps form, photo, preferences and alternative actions usable`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/access/shared-login?appearance=nexora&mode=${mode}`);
    const layout = page.locator('.access-login-layout');
    const panel = layout.locator('.access-login-panel');
    const showcase = layout.locator('.access-login-showcase');
    const kicker = showcase.locator('.identity-showcase-kicker');
    const photoTextColor = await kicker.evaluate(element => getComputedStyle(element).color);
    await layout.evaluate(element => element.style.setProperty('--app-accent', '#e2ad8c'));
    // A dark-page accent must not fade small text over the light photo overlay.
    await expect(kicker).toHaveCSS('color', photoTextColor);
    await layout.evaluate(element => element.style.removeProperty('--app-accent'));
    await expect(layout.locator('h1')).toHaveText('Welcome back');
    await expect(layout.locator('main')).toHaveCount(1);
    await expect(layout.locator('main > :first-child')).toHaveClass('access-login-panel');
    await expect(layout.locator('h1, h2').first()).toHaveText('Welcome back');
    const formBox = await panel.boundingBox();
    const storyBox = await showcase.boundingBox();
    expect(storyBox.x + storyBox.width).toBeLessThanOrEqual(formBox.x + 1);
    expect(await showcase.locator('picture img').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    await layout.getByLabel('Username', { exact: true }).fill('example');
    await layout.getByLabel('Password', { exact: true }).fill('demonstration');
    await layout.getByRole('checkbox', { name: 'Keep me signed in' }).focus();
    await page.keyboard.press('Space');
    await expect(layout.getByRole('checkbox', { name: 'Keep me signed in' })).toBeChecked();
    await layout.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(layout.getByRole('status')).toHaveText('Sign-in demonstration submitted.');
    await layout.getByRole('button', { name: 'Microsoft', exact: true }).click();
    await expect(layout.getByRole('status')).toHaveText('Microsoft demonstration selected.');
    await layout.getByRole('button', { name: 'Continue with passkey', exact: true }).click();
    await expect(layout.getByRole('status')).toHaveText('Passkey demonstration selected.');
    await layout.getByRole('button', { name: 'Forgot password?', exact: true }).click();
    await expect(layout.getByRole('status')).toHaveText('Password-recovery demonstration selected.');
    const colorMenu = layout.locator('[data-login-preference="color"]');
    await colorMenu.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(colorMenu).toHaveAttribute('open', '');
    await expect(colorMenu.locator('[data-theme-selector]')).toBeVisible();
    const languageMenu = layout.locator('[data-login-preference="language"]');
    await languageMenu.locator('summary').click();
    await expect(colorMenu).not.toHaveAttribute('open', '');
    await expect(languageMenu.locator('.culture-selector')).toBeVisible();
    await languageMenu.locator('summary').click();
    expect((await new AxeBuilder({ page }).include('.access-login-layout').withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
    await layout.screenshot({ path: testInfo.outputPath(`shared-login-${mode}-desktop.png`) });
    for (const width of [1440, 768, 390, 320]) {
      // Constrain the parent while the browser remains desktop-sized.
      await layout.evaluate((element, width) => { element.style.width = `${width}px`; }, width);
      const smallForm = await panel.boundingBox();
      const smallStory = await showcase.boundingBox();
      if (width < 1440) expect(smallForm.y + smallForm.height).toBeLessThanOrEqual(smallStory.y + 1);
      expect(await layout.evaluate(element => element.scrollWidth)).toBeLessThanOrEqual(width);
      const providerIcon = layout.locator('.external-login-option .app-button__label > img[slot="start"]');
      await expect(providerIcon).toBeVisible();
      await expect(providerIcon).toHaveCSS('width', '32px');
      await expect(providerIcon).toHaveCSS('height', '32px');
      const microsoft = await layout.getByRole('button', { name: 'Microsoft', exact: true }).boundingBox();
      const passkey = await layout.getByRole('button', { name: 'Continue with passkey', exact: true }).boundingBox();
      expect(Math.abs(microsoft.y - passkey.y)).toBeLessThanOrEqual(1);
      expect(Math.abs(microsoft.height - passkey.height)).toBeLessThanOrEqual(1);
      expect(microsoft.height).toBeGreaterThanOrEqual(44);
      expect((await new AxeBuilder({ page }).include('.access-login-layout').withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
      await layout.screenshot({ path: testInfo.outputPath(`shared-login-${mode}-${width}.png`) });
    }
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
    await expect(layout.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
    await layout.getByLabel('Username', { exact: true }).focus();
    await expect(layout.locator('.app-form-control__input-wrap:focus-within')).toHaveCSS('outline-style', 'solid');
    // The group also supports a site with passkey access and no OAuth provider.
    await layout.locator('.login-provider-block').evaluate(element => element.remove());
    const groupBox = await layout.getByRole('group', { name: 'Alternative access' }).boundingBox();
    const onlyMethod = await layout.getByRole('button', { name: 'Continue with passkey', exact: true }).boundingBox();
    expect(onlyMethod.width).toBeCloseTo(groupBox.width, 0);
    // Hosts may supply introductory copy and status without a marketing feature row.
    await layout.locator('.identity-showcase-features').evaluate(element => element.remove());
    const status = await showcase.locator('.identity-showcase-status').boundingBox();
    const showcaseBounds = await showcase.boundingBox();
    expect(showcaseBounds.y + showcaseBounds.height - status.y - status.height).toBeLessThanOrEqual(41);
  });
}

test('shared login accommodates long brands, tall forms and multi-line footers without overlap', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/access/shared-login?appearance=nexora&mode=light');
  const layout = page.locator('.access-login-layout');
  await layout.locator('.access-login-body').evaluate(element => element.style.minHeight = '48rem');
  await layout.locator('.access-login-footer').evaluate(element => {
    const note = document.createElement('p');
    note.textContent = 'Organization contact information and application credits. '.repeat(8);
    element.append(note);
  });
  for (const name of ['Physical fitness assessment system', 'ระบบการทดสอบสมรรถภาพร่างกาย', 'Key Performance Indicators']) {
    await layout.locator('.access-login-brand a > span, .access-login-showcase-brand a > span').evaluateAll((elements, name) => {
      for (const element of elements) element.textContent = name;
    }, name);
    for (const width of [1440, 390, 320]) {
      await layout.evaluate((element, width) => element.style.width = `${width}px`, width);
      expect(await layout.evaluate(element => element.scrollWidth)).toBeLessThanOrEqual(width);
      const support = await layout.locator('.access-login-support').boundingBox();
      const footer = await layout.locator('.access-login-footer').boundingBox();
      expect(support.y + support.height).toBeLessThanOrEqual(footer.y);
      await expect(layout.locator('[data-login-preference="color"] summary')).toBeVisible();
      await expect(layout.locator('[data-login-preference="language"] summary')).toBeVisible();
      expect(await layout.locator('.access-login-brand').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
      expect(await layout.locator('.access-login-showcase-brand > a').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
      const showcaseBrand = await layout.locator('.access-login-showcase-brand').boundingBox();
      const showcaseKicker = await layout.locator('.identity-showcase-kicker').boundingBox();
      expect(showcaseBrand.y + showcaseBrand.height).toBeLessThanOrEqual(showcaseKicker.y);
      const footerFits = await layout.locator('.access-login-footer').evaluate(element => element.scrollWidth <= element.clientWidth);
      expect(footerFits).toBe(true);
    }
  }
});
