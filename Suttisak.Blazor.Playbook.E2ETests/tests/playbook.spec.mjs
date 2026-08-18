import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('UI Playbook shared-component contracts', () => {
  test('ThemeSelector updates the one html data-theme contract', async ({ page }) => {
    await page.goto('/');
    const selector = page.locator('.playbook-preferences .theme-selector');
    await expect(selector).toBeVisible();

    await selector.getByRole('button', { name: 'Use dark theme' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(selector.getByRole('button', { name: 'Use dark theme' })).toHaveAttribute('aria-pressed', 'true');

    await selector.getByRole('button', { name: 'Use light theme' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    const systemScheme = await page.evaluate(() => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    await selector.getByRole('button', { name: 'Use system theme' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', systemScheme);
  });

  test('AppTabs supports keyboard roving focus and panels remain semantically linked', async ({ page }) => {
    await page.goto('/component-browser');
    const tabs = page.getByRole('tablist', { name: 'Component browser preview tabs' });
    const overview = tabs.getByRole('tab', { name: 'Overview' });
    const api = tabs.getByRole('tab', { name: 'API' });

    await overview.focus();
    await overview.press('ArrowRight');

    await expect(api).toBeFocused();
    await expect(api).toHaveAttribute('aria-selected', 'true');
    const panels = page.locator('[role=tabpanel]');
    await expect(panels).toHaveCount(3);
    await expect(panels.filter({ hasText: 'Parameters are explicit Razor properties' })).toBeVisible();
  });

  test('A 100k-row AppQuickGrid keeps the browser DOM bounded', async ({ page }) => {
    await page.goto('/grid-performance');
    const grid = page.locator('table[aria-label="100000 virtual records"]');
    await expect(grid).toBeVisible();

    const renderedRows = grid.locator('tbody tr');
    await expect(renderedRows.first()).toContainText('1');
    // The browser renders only the viewport plus its overscan buffer: less
    // than 0.2% of the 100k source, rather than every record.
    expect(await renderedRows.count()).toBeLessThan(200);
  });

  test('Form controls remain bounded on mobile and honor reduced motion', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/form-controls');

    const layout = await page.evaluate(() => ({
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth
    }));

    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.scrollBehavior).toBe('auto');
  });

  for (const path of ['/', '/component-browser', '/form-controls']) {
    test(`has no serious or critical axe violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('main')).toBeVisible();

      const results = await new AxeBuilder({ page })
        .include('main')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      const blockingViolations = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');

      expect(blockingViolations, JSON.stringify(blockingViolations, null, 2)).toEqual([]);
    });
  }
});
