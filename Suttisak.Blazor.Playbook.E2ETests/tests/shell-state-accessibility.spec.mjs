import { expect, test } from '@playwright/test';

test.describe('Playbook shell state and accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('hydrates valid shell query state and ignores invalid values', async ({ page }) => {
    await page.goto('/landing?theme=mentalinsight&mode=dark&globalViewport=narrow');

    const shell = page.locator('.playbook');
    await expect(shell).toHaveClass(/theme-mentalinsight/);
    await expect(shell).toHaveAttribute('data-color-mode', 'dark');
    await expect(shell).toHaveAttribute('data-viewport', 'narrow');
    await expect(page.getByLabel('Application')).toHaveValue('mentalinsight');
    const shellBar = page.locator('.playbook-bar');
    await expect(shellBar.getByRole('group', { name: 'Color scheme' }).getByRole('button', { name: 'Use dark theme' })).toHaveAttribute('aria-pressed', 'true');
    await expect(shellBar.getByRole('group', { name: 'Global preview width' }).getByRole('button', { name: 'Narrow' })).toHaveAttribute('aria-pressed', 'true');

    await page.goto('/landing?theme=unknown&mode=sepia&globalViewport=phone');
    await expect(shell).toHaveClass(/theme-audiogramiq/);
    await expect(shell).toHaveAttribute('data-color-mode', 'light');
    await expect(shell).toHaveAttribute('data-viewport', 'wide');
  });

  test('shell controls replace query state while preserving unrelated parameters', async ({ page }) => {
    await page.goto('/landing?keep=unchanged');
    const initialHistoryLength = await page.evaluate(() => history.length);

    await page.getByLabel('Application').selectOption('ergotrack');
    await expect.poll(() => new URL(page.url()).searchParams.get('theme')).toBe('ergotrack');
    expect(new URL(page.url()).searchParams.get('keep')).toBe('unchanged');

    const shellBar = page.locator('.playbook-bar');
    const colorScheme = shellBar.getByRole('group', { name: 'Color scheme' });
    await colorScheme.getByRole('button', { name: 'Use dark theme' }).click();
    await expect.poll(() => new URL(page.url()).searchParams.get('mode')).toBe('dark');
    await expect(colorScheme.getByRole('button', { name: 'Use dark theme' })).toHaveAttribute('aria-pressed', 'true');

    const viewport = shellBar.getByRole('group', { name: 'Global preview width' });
    await viewport.getByRole('button', { name: 'Narrow' }).click();
    await expect.poll(() => new URL(page.url()).searchParams.get('globalViewport')).toBe('narrow');
    await expect(viewport.getByRole('button', { name: 'Narrow' })).toHaveAttribute('aria-pressed', 'true');
    await expect(viewport.getByRole('button', { name: 'Wide' })).toHaveAttribute('aria-pressed', 'false');

    const query = new URL(page.url()).searchParams;
    expect(query.get('keep')).toBe('unchanged');
    expect(query.get('theme')).toBe('ergotrack');
    expect(query.get('mode')).toBe('dark');
    expect(query.get('globalViewport')).toBe('narrow');
    expect(await page.evaluate(() => history.length)).toBe(initialHistoryLength);
  });

  test('skip link moves focus to the global content target', async ({ page }) => {
    await page.goto('/landing');

    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skipLink).toHaveAttribute('href', '#playbook-main-content');
    await skipLink.focus();
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
    await skipLink.press('Enter');

    await expect(page.locator('#playbook-main-content')).toBeFocused();
  });

  test('theme and viewport groups expose button semantics and selection', async ({ page }) => {
    await page.goto('/landing');

    const shellBar = page.locator('.playbook-bar');
    const colorScheme = shellBar.getByRole('group', { name: 'Color scheme' });
    const viewport = shellBar.getByRole('group', { name: 'Global preview width' });
    await expect(colorScheme).toBeVisible();
    await expect(viewport).toBeVisible();

    for (const button of await colorScheme.getByRole('button').all()) {
      await expect(button).toHaveAttribute('type', 'button');
      await expect(button).toHaveAttribute('aria-pressed', /^(true|false)$/);
    }

    for (const button of await viewport.getByRole('button').all()) {
      await expect(button).toHaveAttribute('type', 'button');
      await expect(button).toHaveAttribute('aria-pressed', /^(true|false)$/);
    }
  });
});
