import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';

const bootstrap = fs.readFileSync(path.resolve('../Suttisak.Blazor.UserInterface/wwwroot/js/theme-bootstrap.js'), 'utf8');
const storageKey = 'suttisak-blazor:theme-settings';

async function consumer(page, { saved, defaultAppearance = 'quiet-luxury', defaultTheme, blocked = false } = {}) {
  await page.addInitScript(({ saved, blocked, storageKey }) => {
    if (saved !== undefined && localStorage.getItem(storageKey) === null) localStorage.setItem(storageKey, JSON.stringify(saved));
    if (blocked) Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage unavailable'); } });
  }, { saved, blocked, storageKey });
  await page.route('**/consumer-appearance-fixture', route => route.fulfill({
    contentType: 'text/html',
    body: `<!doctype html><html lang="en" data-default-appearance="${defaultAppearance}" ${defaultTheme ? `data-default-theme="${defaultTheme}"` : ''}><head><script>${bootstrap}</script></head><body>
      <label for="appearance">Appearance</label><select id="appearance" data-appearance-selector><option value="standard">Standard</option><option value="essential">Essential</option><option value="quiet-luxury">Quiet Luxury</option><option value="nexora">Nexora</option></select>
      <label for="other">Other selector</label><select id="other" data-appearance-selector><option value="standard">Standard</option><option value="essential">Essential</option><option value="quiet-luxury">Quiet Luxury</option><option value="nexora">Nexora</option></select>
      <button data-theme-preference="dark">Dark</button><button data-theme-preference="system">System</button>
    </body></html>`
  }));
  await page.goto('/consumer-appearance-fixture');
}

test('consumer default and saved appearance hydrate every selector and survive color mode changes', async ({ page }) => {
  await consumer(page, { saved: { mode: 'light', appearance: 'essential' } });
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'essential');
  await expect(page.getByLabel('Appearance', { exact: true })).toHaveValue('essential');
  for (const appearance of ['standard', 'quiet-luxury', 'nexora', 'essential']) {
    await page.getByLabel('Appearance', { exact: true }).selectOption(appearance);
    await expect(page.locator('html')).toHaveAttribute('data-appearance', appearance);
    await expect(page.getByLabel('Other selector')).toHaveValue(appearance);
    await page.getByRole('button', { name: 'Dark', exact: true }).click();
    expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey)).toMatchObject({ mode: 'dark', appearance });
  }
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'essential');
});

test('first-time and invalid saved choices use the app default', async ({ page }) => {
  await consumer(page, { saved: { appearance: 'unknown' } });
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'quiet-luxury');
  await expect(page.getByLabel('Appearance', { exact: true })).toHaveValue('quiet-luxury');
});

test('appearance remains usable without storage and does not change system color mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await consumer(page, { blocked: true });
  await page.getByLabel('Appearance', { exact: true }).selectOption('essential');
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'essential');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByLabel('Appearance', { exact: true })).toHaveValue('essential');
});

test('temporary appearance previews stay temporary when the color mode changes', async ({ page }) => {
  await consumer(page, { saved: { mode: 'system', appearance: 'standard' } });
  await page.evaluate(() => window.suttisakAppearance.set('quiet-luxury', false));
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'quiet-luxury');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey)).toMatchObject({ mode: 'dark', appearance: 'standard' });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'standard');
});

test('the shared selector switches all appearances in desktop and mobile preferences', async ({ page }) => {
  await page.goto('/components/appearance-selector');
  const workbench = page.getByTestId('preferences-workbench');
  const desktop = workbench.locator('.preferences-selector__desktop [data-appearance-selector]');
  await expect(desktop.locator('option')).toHaveText(['Standard', 'Essential', 'Quiet Luxury', 'Nexora']);
  for (const appearance of ['quiet-luxury', 'essential', 'nexora', 'standard']) {
    await desktop.selectOption(appearance);
    await expect(page.locator('.playbook').first()).toHaveAttribute('data-appearance', appearance);
    await expect(page.locator('#appearance-select')).toHaveValue(appearance);
    await desktop.focus();
    await expect(desktop.locator('..')).toHaveCSS('outline-style', 'solid');
    await expect(desktop.locator('..')).toHaveCSS('outline-width', '2px');
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const disclosure = workbench.locator('.preferences-selector__mobile');
  await disclosure.locator('summary').focus();
  await disclosure.locator('summary').press('Enter');
  await disclosure.locator('[data-appearance-selector]').selectOption('quiet-luxury');
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'quiet-luxury');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
  await page.reload();
  await expect(page.locator('#appearance-select')).toHaveValue('quiet-luxury');
});

test('identity preferences stay contained and keyboard operable at login card widths', async ({ page }) => {
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/layout-patterns/identity');
    const preferences = page.locator('.identity-layout__preferences');
    const summary = preferences.locator('summary');
    await summary.focus();
    await summary.press('Enter');
    const selector = preferences.locator('.preferences-selector__mobile [data-appearance-selector]');
    await selector.selectOption('quiet-luxury');
    await expect(page.locator('html')).toHaveAttribute('data-appearance', 'quiet-luxury');
    const box = await selector.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    const trigger = await summary.boundingBox();
    const brand = await page.locator('.layout-pattern-brand').boundingBox();
    expect(trigger.x >= brand.x + brand.width || trigger.y + trigger.height <= brand.y).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
  }
});
