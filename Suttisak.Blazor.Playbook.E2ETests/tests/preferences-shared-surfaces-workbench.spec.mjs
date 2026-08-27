import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  ['/components/culture-selector', null, 'preferences-workbench'],
  ['/components/preferences-selector', null, 'preferences-workbench'],
  ['/components/theme-switcher', null, 'preferences-workbench'],
  ['/components/company-footer', 'CompanyName', 'shared-surfaces-workbench'],
  ['/components/hero', 'Title', 'shared-surfaces-workbench']
];

for (const [path, parameter, workbench] of routes) {
  test(`${path} exposes its real executable contract after direct navigation and reload`, async ({ page }) => {
    await page.goto(path);

    await expect(page.getByTestId(workbench)).toBeVisible();
    await expect(page.locator('.component-detail__coverage')).toHaveText('Interactive');
    await expect(page.getByRole('region', { name: 'Component API parameters' })).toBeVisible();
    if (parameter) {
      await expect(page.getByRole('rowheader', { name: parameter, exact: true })).toBeVisible();
    }

    await page.reload();
    await expect(page.getByTestId(workbench)).toBeVisible();
  });
}

test('CultureSelector persists and applies Thai culture through the host redirect contract', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.blazorCulture.set('en-US'));
  await page.goto('/components/culture-selector');

  let selector = page.locator('[data-testid="preferences-workbench"] .preferences-selector__desktop .culture-selector');
  await expect(selector.getByRole('button', { name: 'Use English' })).toHaveAttribute('aria-pressed', 'true');
  await selector.getByRole('button', { name: 'ใช้ภาษาไทย' }).click();

  await expect(page).toHaveURL(/\/components\/culture-selector$/);
  await expect.poll(() => page.evaluate(() => window.blazorCulture.get())).toBe('th-TH');
  selector = page.locator('[data-testid="preferences-workbench"] .preferences-selector__desktop .culture-selector');
  await expect(selector.getByRole('button', { name: 'ใช้ภาษาไทย' })).toHaveAttribute('aria-pressed', 'true');
  await expect(selector.getByRole('button', { name: 'Use English' })).toHaveAttribute('aria-pressed', 'false');

  await page.reload();
  selector = page.locator('[data-testid="preferences-workbench"] .preferences-selector__desktop .culture-selector');
  await expect(selector.getByRole('button', { name: 'ใช้ภาษาไทย' })).toHaveAttribute('aria-pressed', 'true');
});

test('ThemeSwitcher persists light and dark choices and follows live system-scheme changes', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/components/theme-switcher');

  const theme = () => page.locator('[data-testid="preferences-workbench"] .preferences-selector__desktop .theme-selector');
  await expect(theme().getByRole('button', { name: 'Use system theme' })).toHaveAttribute('aria-pressed', 'true');

  await theme().getByRole('button', { name: 'Use dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(theme().getByRole('button', { name: 'Use dark theme' })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('suttisak-blazor:theme-settings')).mode)).toBe('dark');

  await theme().getByRole('button', { name: 'Use light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.emulateMedia({ colorScheme: 'dark' });
  await theme().getByRole('button', { name: 'Use system theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await theme().getByRole('button', { name: 'Use dark theme' }).click();
  await expect(theme().getByRole('button', { name: 'Use dark theme' })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('suttisak-blazor:theme-settings')).mode)).toBe('dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(theme().getByRole('button', { name: 'Use dark theme' })).toHaveAttribute('aria-pressed', 'true');
});

test('PreferencesSelector uses a contained keyboard disclosure and removes motion when requested', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/preferences-selector');

  const workbench = page.getByTestId('preferences-workbench');
  await expect(workbench.locator('.preferences-selector__desktop')).toBeHidden();
  const disclosure = workbench.locator('.preferences-selector__mobile');
  const summary = disclosure.locator('summary');
  await summary.focus();
  await summary.press('Enter');
  await expect(disclosure).toHaveAttribute('open', '');
  await expect(summary).toBeFocused();
  await expect(disclosure.getByRole('group', { name: 'Color scheme' })).toBeVisible();
  await expect(disclosure.getByLabel('Language', { exact: true })).toBeVisible();

  const popoverBox = await disclosure.locator('.preferences-selector__popover').boundingBox();
  expect(popoverBox.x).toBeGreaterThanOrEqual(0);
  expect(popoverBox.x + popoverBox.width).toBeLessThanOrEqual(800);
  const transitionSeconds = await disclosure.getByRole('button', { name: 'Use light theme' })
    .evaluate(element => Number.parseFloat(getComputedStyle(element).transitionDuration));
  expect(transitionSeconds).toBeLessThanOrEqual(0.001);
});

test('Hero and CompanyFooter preserve headings, contextual footer semantics, and narrow wrapping', async ({ page }) => {
  await page.setViewportSize({ width: 460, height: 900 });
  await page.goto('/components/hero');

  const hero = page.locator('[data-testid="shared-surfaces-workbench"] section.hero');
  await expect(hero.getByRole('heading', { level: 1, name: 'Make the next decision clear.' })).toBeVisible();
  await expect(hero.getByRole('heading', { level: 2, name: 'A shared surface for application-owned stories.' })).toBeVisible();
  await expect(hero).toHaveClass(/background/);
  await expect(hero).toHaveCSS('flex-direction', 'column');

  await page.getByLabel('Hero title').fill('A focused shared story.');
  await expect(hero.getByRole('heading', { level: 1 })).toHaveText('A focused shared story.');
  await page.getByLabel('Background treatment').uncheck();
  await expect(hero).not.toHaveClass(/background/);

  const footer = page.locator('[data-testid="shared-surfaces-workbench"] footer.company-footer');
  await expect(footer).toContainText('Created by');
  await expect(footer).toContainText('v1.4.2');
  const company = footer.getByRole('link', { name: 'Northstar Studio' });
  await expect(company).toHaveAttribute('target', '_blank');
  await expect(company).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(footer).toHaveCSS('flex-wrap', 'wrap');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(460);
});

for (const [path] of routes) {
  test(`${path} has no serious or critical axe violations`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('main')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    const blocking = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
}
