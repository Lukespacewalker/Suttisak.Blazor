import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const wasmTimeout = 20_000;

async function expectNoSeriousOrCriticalViolations(page) {
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter(violation =>
    violation.impact === 'serious' || violation.impact === 'critical');
  expect(blocking).toEqual([]);
}

test('Component Browser reports and filters the catalog from the manifest', async ({ page, request }) => {
  const manifest = await (await request.get('/component-manifest.json')).json();
  const interactiveCount = manifest.components.filter(component => component.coverage === 'interactive').length;
  await page.goto('/components');

  await expect(page.getByRole('heading', { level: 1, name: /Browse components/i })).toBeVisible({ timeout: wasmTimeout });

  const summary = page.getByRole('complementary', { name: 'Component coverage summary' });
  await expect(summary).toBeVisible();
  await expect(summary.locator('article').nth(0).locator('strong')).toHaveText(String(manifest.componentCount));
  await expect(summary.locator('article').nth(1).locator('strong')).toHaveText(String(interactiveCount));
  await expect(page.locator('[data-component-name]')).toHaveCount(manifest.componentCount, { timeout: wasmTimeout });

  const interactiveFilter = page.locator('.component-browser__coverage-filter button').filter({ hasText: 'Interactive' });
  await expect(interactiveFilter).toHaveCount(1);
  await interactiveFilter.click();
  await expect(interactiveFilter).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-component-coverage="interactive"]')).toHaveCount(interactiveCount, { timeout: wasmTimeout });
  await expect(page.locator('[data-component-name]')).toHaveCount(interactiveCount, { timeout: wasmTimeout });

  await page.getByRole('searchbox', { name: 'Find a component' }).fill('AppButton');
  await expect(page.locator('[data-component-name="AppButton"]')).toHaveCount(1);
  await page.locator('[data-component-name="AppButton"]').click();
  await expect(page).toHaveURL(/\/components\/app-button$/);
  await expect(page.getByRole('heading', { level: 1, name: 'AppButton' })).toBeVisible({ timeout: wasmTimeout });
});

test('Component Browser has no serious or critical accessibility violations', async ({ page, request }) => {
  const manifest = await (await request.get('/component-manifest.json')).json();
  await page.goto('/components');
  await expect(page.locator('[data-component-name]')).toHaveCount(manifest.componentCount, { timeout: wasmTimeout });
  await expectNoSeriousOrCriticalViolations(page);
});

test('Playbook home reports the same workbench count as the Component Browser', async ({ page }) => {
  await page.goto('/components');
  const browserMetric = page.getByRole('complementary', { name: 'Component coverage summary' })
    .locator('article').filter({ hasText: 'workbenches' }).locator('strong');
  const workbenchCount = await browserMetric.textContent({ timeout: wasmTimeout });

  await page.goto('/');

  const metric = page.locator('.playbook-home__metrics article').filter({ hasText: 'Workbenches' });
  await expect(metric.locator('strong')).toHaveText(workbenchCount ?? '');
});

test('StatusPage detail executes the shared visual contract and error semantics', async ({ page }) => {
  await page.goto('/components/status-page');

  const specimen = page.getByTestId('status-page-specimen');
  await expect(specimen).toBeVisible({ timeout: wasmTimeout });

  const statusPage = specimen.locator('.status-page');
  await expect(statusPage).toHaveClass(/status-page--forbidden/);
  await expect(statusPage).toHaveAttribute('role', 'region');
  await expect(statusPage).toHaveAttribute('aria-live', 'polite');

  await page.getByLabel('Variant').selectOption('Error');
  await expect(statusPage).toHaveClass(/status-page--error/);
  await expect(statusPage).toHaveAttribute('role', 'alert');
  await expect(statusPage).toHaveAttribute('aria-live', 'assertive');

  await page.getByLabel('Custom visual slot').check();
  await expect(specimen.locator('.status-page-demo-visual')).toHaveText('◎');
  await page.waitForTimeout(800);
  await expectNoSeriousOrCriticalViolations(page);
});

test('StatusRouteContent composes the shared page with route actions and request reference', async ({ page }) => {
  await page.goto('/access/custom-error');

  const preview = page.getByRole('region', { name: 'Custom status page preview' });
  await expect(preview).toBeVisible({ timeout: wasmTimeout });

  const statusPage = preview.locator('.status-page');
  await expect(statusPage).toHaveClass(/status-page--error/);
  await expect(statusPage.getByRole('heading', { level: 1 })).toHaveText('Something stopped unexpectedly.');
  await expect(statusPage.locator('.status-page__route-brand')).toContainText('Service status / 500');
  await expect(statusPage.locator('.status-page__reference code')).toHaveText('ERR-DEMO-9F2A');
  await expect(statusPage.getByRole('button', { name: 'Try again' })).toBeVisible();
  await expect(statusPage.getByRole('link', { name: 'Return to home' })).toBeVisible();
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

  await expect(page.getByRole('heading', { level: 1, name: 'Design tokens' })).toBeVisible({ timeout: wasmTimeout });
  await expect(page.locator('[data-design-token]')).toHaveCount(71, { timeout: wasmTimeout });
  await expect(page.locator('[data-design-token="--app-brand"]')).toBeVisible();
  await expect(page.locator('[data-design-token="--app-duration-normal"]')).toBeVisible();
  await expectNoSeriousOrCriticalViolations(page);
});
