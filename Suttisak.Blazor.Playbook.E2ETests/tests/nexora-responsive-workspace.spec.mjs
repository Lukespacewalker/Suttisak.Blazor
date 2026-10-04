import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Exercise real shell controls and data tasks at both tablet orientations.
// Constrained component previews alone cannot prove usable application chrome.
for (const mode of ['light', 'dark']) {
  for (const size of [{ width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1024, height: 420 }, { width: 1440, height: 900 }]) {
    test(`Nexora ${mode} workspace keeps navigation, search and editor usable at ${size.width}x${size.height}`, async ({ page }, testInfo) => {
      await page.setViewportSize(size);
      await page.goto(`/application-shell/records?appearance=nexora&mode=${mode}`);
      const shell = page.locator('[data-app-shell]');
      const heading = shell.getByRole('heading', { level: 1, name: 'Program records' });
      const task = shell.getByRole('button', { name: 'New record', exact: true });
      await expect(heading).toBeVisible();
      const taskBox = await task.boundingBox();
      expect(taskBox.y + taskBox.height, 'create task is visible without scrolling').toBeLessThanOrEqual(size.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(size.width);
      await expect(shell.locator('.application-page-heading__breadcrumbs')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(shell.locator('.application-page-heading__breadcrumbs')).toHaveCSS('border-top-width', '0px');
      await page.screenshot({ path: testInfo.outputPath(`workspace-${mode}-${size.width}x${size.height}-initial.png`) });

      const mobile = size.width === 768;
      const toggle = shell.locator(`[data-shell-action="${mobile ? 'mobile' : 'desktop'}"]`);
      await expect(toggle).toBeVisible();
      if (mobile) {
        await expect(toggle.locator('> span')).toHaveCount(3);
        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        await expect(toggle).toHaveAttribute('aria-label', 'Close demo navigation');
        await expect(shell.locator('.app-shell__navigation')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
        await page.keyboard.press('Tab');
        await shell.locator('.app-shell__navigation .theme-selector').getByRole('button', { name: 'Use light theme' }).focus();
        await expect(shell.locator('.app-shell__navigation .theme-selector').getByRole('button', { name: 'Use light theme' })).toHaveCSS('outline-width', '2px');
        await shell.locator('.app-shell__navigation').getByRole('link', { name: 'Overview', exact: true }).focus();
        await page.screenshot({ path: testInfo.outputPath(`workspace-${mode}-${size.width}x${size.height}-navigation.png`) });
        await page.keyboard.press('Escape');
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(toggle).toBeFocused();
      } else {
        await expect(toggle.locator('.app-shell__panel-icon--contract')).toBeVisible();
        await expect(toggle.locator('.app-shell__panel-icon--expand')).toBeHidden();
        await expect(toggle.locator('> span').first()).toBeHidden();
        await toggle.focus();
        await toggle.press('Enter');
        await expect(toggle).toHaveAttribute('aria-label', 'Expand navigation');
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(toggle.locator('.app-shell__panel-icon--expand')).toBeVisible();
        await expect(shell.locator('.app-shell__navigation')).toBeHidden();
        await toggle.press('Enter');
        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        await expect(toggle.locator('.app-shell__panel-icon--contract')).toBeVisible();
        await expect(shell.locator('.app-shell__navigation')).toBeVisible();
        await shell.locator('.app-shell__navigation').getByRole('link', { name: 'Overview', exact: true }).focus();
        await page.keyboard.press('Escape');
        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      }

      const search = shell.getByRole('searchbox', { name: 'Search records', exact: true });
      await search.fill('Annual hearing');
      await expect(shell.getByText('1 of 6 records', { exact: true })).toBeVisible();
      await shell.getByRole('button', { name: 'Clear search', exact: true }).click();
      const sort = shell.getByRole('button', { name: 'Record', exact: true });
      await sort.focus();
      await sort.press('Enter');
      await expect(sort.locator('..').locator('..')).toHaveAttribute('aria-sort', /ascending|descending/);
      const selection = shell.locator('tbody .app-grid__checkbox').first();
      await selection.focus();
      await selection.press('Space');
      await expect(selection).toBeChecked();
      await expect(shell.getByRole('button', { name: 'Export selected', exact: true })).toBeVisible();
      await selection.press('Space');
      await task.click();
      const editor = page.getByRole('dialog', { name: 'Record editor' });
      await expect(editor).toBeVisible();
      const name = editor.getByRole('textbox', { name: 'Record name', exact: true });
      await name.fill('Tablet review');
      await expect(name).toBeFocused();
      await expect(name.locator('..')).toHaveCSS('outline-width', '2px');
      await editor.getByRole('button', { name: 'Cancel', exact: true }).click();
      await expect(editor).toBeHidden();
      await expect(task).toBeFocused();
      expect((await new AxeBuilder({ page }).include('[data-app-shell]').withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath(`workspace-${mode}-${size.width}x${size.height}.png`) });
    });
  }
}

test('Nexora desktop panel control preserves reduced-motion and forced-color keyboard access', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.goto('/application-shell/records?appearance=nexora');
  const toggle = page.locator('[data-shell-action="desktop"]');
  await toggle.focus();
  await expect(toggle).toHaveCSS('outline-width', '2px');
  await toggle.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle.locator('.app-shell__panel-icon--expand')).toBeVisible();
  expect(await page.locator('.app-shell__frame').evaluate(element => parseFloat(getComputedStyle(element).transitionDuration))).toBeLessThanOrEqual(.00001);
  await toggle.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const selectedTheme = page.locator('.app-shell__preferences .theme-selector button.active');
  await selectedTheme.focus();
  await expect(selectedTheme).toHaveCSS('outline-width', '2px');
  await expect(selectedTheme).toHaveCSS('outline-style', 'solid');
});

for (const appearance of ['standard', 'essential', 'quiet-luxury']) {
  test(`${appearance} keeps the existing desktop menu symbol`, async ({ page }) => {
    await page.goto(`/application-shell/records?appearance=${appearance}`);
    const toggle = page.locator('[data-shell-action="desktop"]');
    await expect(toggle.locator('> span').first()).toBeVisible();
    await expect(toggle.locator('.app-shell__panel-icon').first()).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
  test(`${appearance} mobile navigation supports Escape and restores its opener`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/application-shell/records?appearance=${appearance}`);
    const toggle = page.locator('[data-shell-action="mobile"]');
    await toggle.click();
    const link = page.locator('.app-shell__navigation').getByRole('link', { name: 'Overview', exact: true });
    await link.focus();
    await link.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveAttribute('aria-label', 'Open demo navigation');
    await expect(toggle).toBeFocused();
    await expect(page.locator('.app-shell__scrim')).not.toHaveClass(/is-visible/);
  });
}

test('mobile navigation leaves nested native Escape and resized desktop navigation intact', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/application-shell/records?appearance=nexora');
  const toggle = page.locator('[data-shell-action="mobile"]');
  const navigation = page.locator('.app-shell__navigation');
  await toggle.click();
  // Model application-owned native content inside the existing Navigation slot.
  await navigation.evaluate(element => {
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.textContent = 'Open navigation help';
    trigger.setAttribute('popovertarget', 'navigation-help');
    const popup = document.createElement('div');
    popup.id = 'navigation-help';
    popup.popover = 'auto';
    popup.innerHTML = '<button type="button">Navigation help action</button>';
    element.append(trigger, popup);
  });
  await navigation.getByRole('button', { name: 'Open navigation help' }).click();
  const popupAction = navigation.getByRole('button', { name: 'Navigation help action' });
  await popupAction.focus();
  await popupAction.press('Escape');
  await expect(popupAction).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const link = navigation.getByRole('link', { name: 'Overview', exact: true });
  await link.focus();
  await link.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();

  await toggle.click();
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(toggle).toBeHidden();
  await link.focus();
  await link.press('Escape');
  await expect(navigation).toBeVisible();
  await expect(page.locator('[data-shell-action="desktop"]')).toHaveAttribute('aria-expanded', 'true');
  await expect(link).toBeFocused();
});

for (const appearance of ['nexora', 'standard', 'essential', 'quiet-luxury']) {
  test(`${appearance} mobile Escape dismisses an owned popup before navigation when focus stays on its invoker`, async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`/application-shell/records?appearance=${appearance}`);
    const toggle = page.locator('[data-shell-action="mobile"]');
    const navigation = page.locator('.app-shell__navigation');
    await toggle.click();
    await navigation.evaluate(element => {
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.textContent = 'Open navigation help';
      trigger.setAttribute('popovertarget', 'navigation-help');
      const popup = document.createElement('div');
      popup.id = 'navigation-help';
      popup.popover = 'auto';
      popup.textContent = 'Navigation help';
      element.append(trigger, popup);
    });
    const popupTrigger = navigation.getByRole('button', { name: 'Open navigation help' });
    await popupTrigger.focus();
    await popupTrigger.press('Enter');
    await expect(popupTrigger).toBeFocused();
    await expect(navigation.locator('#navigation-help')).toBeVisible();
    await popupTrigger.press('Escape');
    await expect(navigation.locator('#navigation-help')).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(popupTrigger).toBeFocused();
    await popupTrigger.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });
}
