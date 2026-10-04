import { expect, test } from '@playwright/test';

for (const preference of ['theme', 'language']) {
  test(`HeaderControl ${preference} popup stays actionable when its icon is near the viewport bottom`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/components/preferences-selector');
    const preferences = page.getByTestId('preferences-workbench');
    const trigger = preferences.locator(`[data-shell-preference="${preference}"]`);
    await trigger.evaluate(el => window.scrollBy(0, el.getBoundingClientRect().bottom - innerHeight + 12));
    await trigger.focus();
    await trigger.press('Enter');
    const popup = preferences.locator(`[data-shell-preference-popup="${preference}"]`);
    await expect(popup).toBeVisible();
    const box = await popup.boundingBox();
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(720);
    const option = popup.getByRole('button', { name: preference === 'theme' ? 'Use dark theme' : 'Use English' });
    await expect(option).toBeInViewport();
    await option.click();
    if (preference === 'theme') await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    else await expect.poll(() => page.evaluate(() => localStorage.getItem('BlazorCulture'))).toBe('en');
  });
}

for (const surface of [
  { name: 'HeaderControl', route: '/specimens/preferences-selector', selector: '[data-testid="preferences-workbench"] .preferences-selector' },
  { name: 'HeaderControlWithUser', route: '/layout-patterns/header-footer', selector: '.header-user-controls .preferences-selector' }
]) {
  for (const width of [1440, 320]) {
    test(`${surface.name} ${width} keeps language and scheme actions without preference dropdowns`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(() => {
        if (localStorage.getItem('suttisak-blazor:theme-settings') === null)
          localStorage.setItem('suttisak-blazor:theme-settings', JSON.stringify({ mode: 'light', appearance: 'nexora' }));
      });
      await page.goto(`${surface.route}?appearance=nexora`);
      const preferences = page.locator(surface.selector);
      await expect(preferences).toBeVisible();
      await expect(preferences.locator('select')).toHaveCount(0);
      const controls = preferences.locator(width < 900 ? '.preferences-selector__mobile' : '.preferences-selector__desktop');
      if (width < 900) {
        await controls.locator('summary').focus();
        await controls.locator('summary').press('Enter');
        await expect(controls).toHaveAttribute('open', '');
      }
      else {
        await expect(controls.locator('[data-shell-preference]')).toHaveCount(2);
        await controls.locator('[data-shell-preference="theme"]').press('Enter');
      }
      await expect(controls.getByRole('button', { name: 'Use light theme' })).toBeVisible();
      await controls.getByRole('button', { name: 'Use dark theme' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      await expect(controls.getByRole('button', { name: 'Use dark theme' })).toHaveAttribute('aria-pressed', 'true');
      expect(await page.evaluate(() => JSON.parse(localStorage.getItem('suttisak-blazor:theme-settings')))).toEqual({ mode: 'dark', appearance: 'nexora' });
      if (width >= 900) await controls.locator('[data-shell-preference="language"]').click();
      await controls.getByRole('button', { name: 'ใช้ภาษาไทย' }).click();
      await expect(page).toHaveURL(new RegExp(surface.route));
      await expect.poll(() => page.evaluate(() => localStorage.getItem('BlazorCulture'))).toBe('th');
      if (width < 900) await controls.locator('summary').press('Enter');
      else await controls.locator('[data-shell-preference="language"]').click();
      await expect(controls.getByRole('button', { name: 'ใช้ภาษาไทย' })).toHaveAttribute('aria-pressed', 'true');
      await expect(preferences.locator('select')).toHaveCount(0);
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await preferences.screenshot({ path: testInfo.outputPath(`${surface.name}-${width}-preferences.png`) });
    });
  }
}

test('MainLayout omits appearance dropdowns in desktop and opened mobile navigation', async ({ page }) => {
  await page.goto('/layout-patterns/application');
  const shell = page.locator('[data-app-shell]');
  await expect(shell).toBeVisible();
  await expect(shell.locator('select')).toHaveCount(0);
  await shell.locator('[data-shell-preference="theme"]').click();
  await expect(shell.getByRole('button', { name: 'Use light theme' }).first()).toBeVisible();
  await page.setViewportSize({ width: 320, height: 844 });
  await shell.locator('[data-shell-action="mobile"]').click();
  await expect(shell.locator('.app-shell__navigation')).toHaveClass(/is-open/);
  await expect(shell.locator('.app-shell__navigation select')).toHaveCount(0);
  await expect(shell.locator('.app-shell__navigation .theme-selector')).toBeVisible();
  await expect(shell.locator('.app-shell__navigation .culture-selector')).toBeVisible();
});
