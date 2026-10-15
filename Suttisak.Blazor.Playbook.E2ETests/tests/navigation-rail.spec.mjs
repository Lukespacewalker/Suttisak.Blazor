import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const mode of ['light', 'dark']) {
  test(`collapsed ${mode} navigation keeps labelled destinations and keyboard flyouts`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(`/application-shell/records?appearance=nexora&mode=${mode}`);
    const navigation = page.locator('.app-shell__navigation');
    await page.locator('[data-shell-action="desktop"]').click();
    await expect(navigation).toBeVisible();
    await expect.poll(async () => Math.round((await navigation.boundingBox()).width)).toBe(64);
    const records = navigation.getByRole('link', { name: /^Records/ });
    await expect(records).toHaveAttribute('aria-current', 'page');
    await expect(records.locator('svg')).toBeVisible();
    const box = await records.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    await records.hover();
    const tooltip = page.locator('.app-shell__rail-tooltip');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText('Records');
    await page.getByRole('heading', { name: 'Program records', exact: true }).hover();
    await records.focus();
    await expect(tooltip).toBeVisible();
    await records.press('Escape');
    await expect(tooltip).toBeHidden();

    const submenu = navigation.locator('.nav-submenu__trigger');
    await submenu.focus();
    await submenu.press('Enter');
    const flyout = navigation.locator('.nav-submenu__items');
    await expect(flyout).toBeVisible();
    await expect(flyout.getByRole('link', { name: 'Team', exact: true })).toBeFocused();
    const flyoutBox = await flyout.boundingBox();
    const railBox = await navigation.boundingBox();
    expect(flyoutBox.x).toBeGreaterThanOrEqual(railBox.x + railBox.width);
    expect(flyoutBox.y + flyoutBox.height).toBeLessThanOrEqual(720);
    await page.keyboard.press('Escape');
    await expect(flyout).toBeHidden();
    await expect(submenu).toBeFocused();
    await submenu.press('Space');
    await expect(flyout).toBeVisible();
    await page.getByRole('heading', { name: 'Program records', exact: true }).click();
    await expect(flyout).toBeHidden();
    expect((await new AxeBuilder({ page }).include('[data-app-shell]').withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
  });
}

test('collapsed navigation preserves footer access and restores full mobile labels', async ({ page }) => {
  await page.goto('/application-shell/records?appearance=nexora');
  await page.locator('[data-shell-action="desktop"]').click();
  const navigation = page.locator('.app-shell__navigation');
  const footer = navigation.getByRole('button', { name: 'Navigation information', exact: true });
  await footer.click();
  await expect(navigation.getByText('All systems ready', { exact: true })).toBeVisible();
  const scrollBefore = await page.evaluate(() => window.scrollY);
  await page.evaluate(previous => window.scrollTo(0, previous > 0 ? 0 : 20), scrollBefore);
  await expect.poll(() => page.evaluate(() => window.scrollY)).not.toBe(scrollBefore);
  await expect(navigation.getByText('All systems ready', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(footer).toBeFocused();
  await navigation.locator('.nav-submenu__trigger').click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('[data-shell-action="mobile"]').click();
  await expect(navigation.locator('.nav-item__label').filter({ hasText: 'Overview' })).toBeVisible();
  await expect(navigation.getByText('All systems ready', { exact: true })).toBeVisible();
  await expect(footer).toBeHidden();
  await navigation.getByRole('link', { name: 'Overview', exact: true }).focus();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-shell-action="mobile"]')).toBeFocused();
});

test('idle rail follows its container breakpoint and restores expanded branches', async ({ page }) => {
  await page.goto('/application-shell/records?appearance=nexora');
  const shell = page.locator('[data-app-shell]');
  const branch = shell.locator('.nav-submenu');
  await branch.locator('summary').click();
  await expect(branch).toHaveAttribute('open', '');
  await shell.locator('[data-shell-action="desktop"]').click();
  await expect(branch).not.toHaveAttribute('open', '');
  await shell.evaluate(element => element.style.width = '600px');
  await expect(shell.locator('[data-shell-action="desktop"]')).toBeHidden();
  await expect(branch).toHaveAttribute('open', '');
  await shell.evaluate(element => element.style.removeProperty('width'));
  await expect(shell.locator('[data-shell-action="desktop"]')).toBeVisible();
  await expect(branch).not.toHaveAttribute('open', '');
});

test('forced colors preserves the active descendant branch in the rail', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.goto('/application-shell/records?appearance=nexora');
  await page.locator('[data-shell-action="desktop"]').click();
  const branch = page.locator('.nav-submenu__trigger');
  await expect(branch).toHaveCSS('outline-style', 'solid');
  await expect(branch).toHaveCSS('outline-width', '2px');
});
