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

test('isolated viewport presets set the actual iframe width', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/components/form-grid?viewport=mobile');

  const viewport = page.getByRole('group', { name: 'Viewport (px)' });
  const frame = page.getByTestId('isolated-specimen-frame');
  const hostWidth = page.getByLabel('Host width (px)');
  await expect(frame).toBeVisible({ timeout: wasmTimeout });

  for (const width of [375, 768, 1280]) {
    const preset = viewport.getByRole('button', { name: String(width), exact: true });
    await preset.click();
    await expect(preset).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => frame.evaluate(element => element.contentWindow?.innerWidth)).toBe(width);
    await expect(hostWidth).toHaveCount(0);
  }

  await viewport.getByRole('button', { name: 'Full', exact: true }).click();
  await expect(frame).toHaveCount(0);
  await expect(hostWidth).toBeVisible();
  await expect(page.getByTestId('profile-grid')).toBeVisible();
  expect(await page.evaluate(() => innerWidth)).toBe(1440);
});

test('Full viewport measures the inline host and preserves live form state as it reflows', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/components/form-grid?appearance=standard');
  const widthInput = page.getByRole('spinbutton', { name: 'Host width (px)' });
  const widthOutput = page.getByTestId('rendered-host-width');
  const grid = page.getByTestId('profile-grid');
  const fullName = grid.getByRole('textbox', { name: 'Full name' });
  await expect(widthOutput).toHaveText(/^Rendered: [\d.]+ px$/);
  await fullName.fill('Playbook reviewer');

  for (const [width, columns] of [[701, 2], [700, 1], [699, 1], [320, 1]]) {
    await widthInput.fill(String(width));
    await widthInput.press('Tab');
    await expect(widthOutput).toHaveText(`Rendered: ${width} px`);
    const layout = await grid.evaluate(element => ({
      columns: getComputedStyle(element).gridTemplateColumns.split(' ').length,
      width: element.getBoundingClientRect().width,
      viewport: innerWidth
    }));
    expect(layout).toEqual({ width, columns, viewport: 1600 });
    await expect(fullName).toHaveValue('Playbook reviewer');
  }

  await page.setViewportSize({ width: 320, height: 900 });
  await expect.poll(() => page.getByTestId('specimen-host-width-surface').evaluate(element => element.clientWidth)).toBeLessThan(320);
  await expect(widthOutput).not.toHaveText('Rendered: 320 px');
  await widthInput.clear();
  await widthInput.press('Tab');
  await page.setViewportSize({ width: 1600, height: 900 });
  await expect.poll(() => grid.evaluate(element => element.clientWidth)).toBeGreaterThan(701);
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
