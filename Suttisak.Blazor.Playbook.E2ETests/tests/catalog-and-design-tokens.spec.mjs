import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const wasmTimeout = 20_000;

async function expectNoSeriousOrCriticalViolations(page) {
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter(violation =>
    violation.impact === 'serious' || violation.impact === 'critical');
  expect(blocking).toEqual([]);
}

test('Component Browser reports and filters the complete catalog from one source', async ({ page }) => {
  await page.goto('/components');

  await expect(page.getByRole('heading', { level: 1, name: /Every component/i })).toBeVisible({ timeout: wasmTimeout });

  const summary = page.getByRole('complementary', { name: 'Component coverage summary' });
  await expect(summary).toBeVisible();
  await expect(summary.locator('article').nth(0).locator('strong')).toHaveText('90');
  await expect(summary.locator('article').nth(1).locator('strong')).toHaveText('79');
  await expect(page.locator('[data-component-name]')).toHaveCount(90, { timeout: wasmTimeout });

  const interactiveFilter = page.locator('.component-browser__coverage-filter button').filter({ hasText: 'Interactive' });
  await expect(interactiveFilter).toHaveCount(1);
  await interactiveFilter.click();
  await expect(interactiveFilter).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-component-coverage="interactive"]')).toHaveCount(79, { timeout: wasmTimeout });
  await expect(page.locator('[data-component-name]')).toHaveCount(79, { timeout: wasmTimeout });

  await page.getByRole('searchbox', { name: 'Find a component' }).fill('AppButton');
  await expect(page.locator('[data-component-name="AppButton"]')).toHaveCount(1);
  await page.locator('[data-component-name="AppButton"]').click();
  await expect(page).toHaveURL(/\/components\/app-button$/);
  await expect(page.getByRole('heading', { level: 1, name: 'AppButton' })).toBeVisible({ timeout: wasmTimeout });
});

test('Component Browser has no serious or critical accessibility violations', async ({ page }) => {
  await page.goto('/components');
  await expect(page.locator('[data-component-name]')).toHaveCount(90, { timeout: wasmTimeout });
  await expectNoSeriousOrCriticalViolations(page);
});

test('packaged design-token manifest is complete and unique', async ({ request }) => {
  const response = await request.get('/_content/Suttisak.Blazor.UserInterface/design-tokens.json');
  expect(response.ok()).toBeTruthy();

  const manifest = await response.json();
  expect(manifest.schemaVersion).toBe(1);
  expect(manifest.categories).toHaveLength(10);

  const tokens = manifest.categories.flatMap(category => category.tokens);
  expect(tokens).toHaveLength(71);
  expect(new Set(tokens.map(token => token.name)).size).toBe(71);
  expect(tokens.map(token => token.name)).toContain('--app-brand');
  expect(tokens.map(token => token.name)).toContain('--app-focus-ring');
  expect(tokens.map(token => token.name)).toContain('--app-marketing-max-width');
});

test('token explorer renders the packaged contract and passes axe', async ({ page }) => {
  await page.goto('/tokens');

  await expect(page.getByRole('heading', { level: 1, name: 'Tokens before decoration.' })).toBeVisible({ timeout: wasmTimeout });
  await expect(page.locator('[data-design-token]')).toHaveCount(71, { timeout: wasmTimeout });
  await expect(page.locator('[data-design-token="--app-brand"]')).toBeVisible();
  await expect(page.locator('[data-design-token="--app-duration-normal"]')).toBeVisible();
  await expectNoSeriousOrCriticalViolations(page);
});
