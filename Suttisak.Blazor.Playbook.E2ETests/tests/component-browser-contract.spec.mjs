import { expect, test } from '@playwright/test';

const wasmTimeout = 20_000;

test('Component Browser restores search, coverage, and compact view from the URL', async ({ page }) => {
  await page.goto('/components?q=button&coverage=interactive&view=compact');

  const search = page.getByRole('searchbox', { name: 'Find a component' });
  await expect(search).toHaveValue('button', { timeout: wasmTimeout });
  await expect(page.getByRole('button', { name: /Interactive/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Compact' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-component-name="AppButton"]')).toBeVisible();

  await page.reload();
  await expect(search).toHaveValue('button', { timeout: wasmTimeout });
  await expect(page.getByRole('button', { name: 'Compact' })).toHaveAttribute('aria-pressed', 'true');
});

test('Component category links resolve to generated section anchors', async ({ page }) => {
  await page.goto('/components?q=form&coverage=interactive&view=compact');

  const link = page.getByRole('navigation', { name: 'Visible component categories' })
    .getByRole('link', { name: /Forms & inputs/ });
  await expect(link).toHaveAttribute('href', '/components?q=form&coverage=interactive&view=compact#components-forms-inputs', { timeout: wasmTimeout });
  await link.click();

  await expect(page.locator('#components-forms-inputs')).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(document.querySelector(location.hash)))).toBe(true);
  const state = new URL(page.url());
  expect(state.searchParams.get('q')).toBe('form');
  expect(state.searchParams.get('coverage')).toBe('interactive');
  expect(state.searchParams.get('view')).toBe('compact');
});

test('legacy compact catalog route redirects to the shared Component Browser', async ({ page }) => {
  await page.goto('/catalog');
  await expect(page).toHaveURL(/\/components\?view=compact$/, { timeout: wasmTimeout });
  await expect(page.getByRole('button', { name: 'Compact' })).toHaveAttribute('aria-pressed', 'true');
});

test('375 preview uses a real child viewport and triggers FormGrid media queries', async ({ page }) => {
  await page.goto('/components/form-grid?viewport=mobile');

  const host = page.getByTestId('isolated-specimen-frame');
  await expect(host).toBeVisible({ timeout: wasmTimeout });
  await expect.poll(() => host.evaluate(element => element.contentWindow?.innerWidth ?? 0)).toBe(375);

  const isolated = page.frameLocator('[data-testid="isolated-specimen-frame"]');
  const grid = isolated.locator('.form-grid').first();
  await expect(grid).toBeVisible();
  await expect.poll(() => grid.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(1);
});

test('isolated viewport keeps top-layer dialogs inside the child browsing context', async ({ page }) => {
  await page.goto('/components/app-dialog?viewport=mobile');

  const host = page.getByTestId('isolated-specimen-frame');
  await expect(host).toBeVisible({ timeout: wasmTimeout });
  const isolated = page.frameLocator('[data-testid="isolated-specimen-frame"]');
  await isolated.getByRole('button', { name: 'Open dialog' }).click();

  const dialog = isolated.getByRole('dialog', { name: 'Publish changes?' });
  await expect(dialog).toBeVisible();
  const geometry = await dialog.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: innerWidth, height: innerHeight };
  });
  expect(geometry.left).toBeGreaterThanOrEqual(0);
  expect(geometry.right).toBeLessThanOrEqual(geometry.width);
  expect(geometry.top).toBeGreaterThanOrEqual(0);
  expect(geometry.bottom).toBeLessThanOrEqual(geometry.height);

  await dialog.press('Escape');
  await expect(dialog).not.toBeVisible();
});
