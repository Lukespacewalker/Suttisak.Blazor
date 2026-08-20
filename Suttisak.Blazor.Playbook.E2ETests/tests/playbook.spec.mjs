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

  test('Component Browser indexes the complete Razor catalog and exposes live inputs', async ({ page }) => {
    await page.goto('/component-browser');

    await expect(page.locator('.component-browser__directory > section a')).toHaveCount(90);
    await expect(page.locator('#app-text-box input')).toBeVisible();
    await expect(page.locator('#app-number-input input[type="number"]')).toBeVisible();
    await expect(page.locator('#app-multi-select select[multiple]')).toBeVisible();
    await expect(page.locator('#app-calendar-picker input')).toBeVisible();

    const search = page.getByRole('searchbox', { name: 'Find a component' });
    await search.fill('AppTextBox');
    const sidebar = page.locator('.component-browser__sidebar');
    await expect(sidebar.getByRole('link', { name: 'AppTextBox' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'AppButton' })).toHaveCount(0);
  });

  test('A 100k-row AppQuickGrid keeps the browser DOM bounded', async ({ page }) => {
    await page.goto('/grid-performance');
    const grid = page.locator('table[aria-label="100000 virtual records"]');
    // WebAssembly startup on the smallest hosted Linux runner can exceed the
    // default five-second assertion window for this intentionally large page.
    await expect(grid).toBeVisible({ timeout: 20_000 });

    const renderedRows = grid.locator('tbody tr');
    await expect(renderedRows.first()).toContainText('1', { timeout: 20_000 });
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

  test('Login keeps Microsoft and Passkey aligned with monochrome icons', async ({ page }) => {
    await page.goto('/access/login');

    const providers = page.locator('.access-provider-grid button');
    await expect(providers).toHaveCount(2);
    await expect(providers.nth(0)).toContainText('Microsoft');
    await expect(providers.nth(1)).toContainText('Passkey');

    const desktop = await providers.evaluateAll(buttons => ({
      top: buttons.map(button => button.getBoundingClientRect().top),
      fills: buttons.map(button => getComputedStyle(button.querySelector('svg')).fill)
    }));
    expect(Math.abs(desktop.top[0] - desktop.top[1])).toBeLessThan(1);
    expect(new Set(desktop.fills).size).toBe(1);

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileTop = await providers.evaluateAll(buttons => buttons.map(button => button.getBoundingClientRect().top));
    expect(mobileTop[1]).toBeGreaterThan(mobileTop[0]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test('Breadcrumbs form one visual surface with the active page heading', async ({ page }) => {
    await page.goto('/application-shell');

    const breadcrumbs = page.locator('.application-page-heading__breadcrumbs');
    const heading = page.locator('.application-page-heading__visual .page-heading');
    await expect(breadcrumbs).toBeVisible();
    await expect(heading).toBeVisible();

    const geometry = await page.locator('.application-page-heading').evaluate(surface => {
      const breadcrumbBox = surface.querySelector('.application-page-heading__breadcrumbs').getBoundingClientRect();
      const headingBox = surface.querySelector('.page-heading').getBoundingClientRect();
      return { seam: Math.abs(breadcrumbBox.bottom - headingBox.top) };
    });
    expect(geometry.seam).toBeLessThanOrEqual(2);
  });

  for (const path of ['/', '/component-browser', '/form-controls', '/grid-performance', '/landing', '/access/login', '/application-shell']) {
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
