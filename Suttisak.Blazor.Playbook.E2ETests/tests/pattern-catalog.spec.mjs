import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const wasmTimeout = 20_000;
const canonicalPatternSlugs = [
  'validated-form-workflow',
  'virtualized-data-workspace',
  'product-marketing-landing',
  'secure-access-flow',
  'application-workspace-shell',
  'record-management-workflow',
  'status-route-recovery',
  'router-level-layout-composition'
];

async function expectNoSeriousOrCriticalViolations(page) {
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter(violation =>
    violation.impact === 'serious' || violation.impact === 'critical');
  expect(blocking).toEqual([]);
}

test('Pattern Library lists recipes and filters by domain or component', async ({ page }) => {
  await page.goto('/patterns');

  await expect(page.getByRole('heading', { level: 1, name: /Page patterns and component recipes/i }))
    .toBeVisible({ timeout: wasmTimeout });
  const catalogSlugs = await page.locator('[data-pattern-slug]').evaluateAll(cards =>
    cards.map(card => card.getAttribute('data-pattern-slug')));
  expect(catalogSlugs).toEqual(canonicalPatternSlugs);

  const summary = page.getByRole('complementary', { name: 'Pattern library summary' });
  await expect(summary.getByText(String(canonicalPatternSlugs.length), { exact: true })).toBeVisible();

  await page.getByRole('searchbox', { name: 'Find a pattern' }).fill('StatusRouteContent');
  await expect(page).toHaveURL(/q=StatusRouteContent/);
  await expect(page.locator('[data-pattern-slug]')).toHaveCount(1);
  await expect(page.locator('[data-pattern-slug="status-route-recovery"]')).toBeVisible();
  await expect(page.locator('.pattern-browser__results-heading p')).toContainText(/1\s*pattern/);
  await page.reload();
  await expect(page.getByRole('searchbox', { name: 'Find a pattern' })).toHaveValue('StatusRouteContent');
  await expect(page.locator('[data-pattern-slug]')).toHaveCount(1);

  await page.getByRole('searchbox', { name: 'Find a pattern' }).fill('');
  const structureFilter = page.getByRole('button', { name: 'Application structure', exact: true });
  await structureFilter.click();
  await expect(page).toHaveURL(/category=Application(?:%20|\+)structure/);
  await expect(structureFilter).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-pattern-slug]')).toHaveCount(
    canonicalPatternSlugs.filter(slug =>
      slug === 'application-workspace-shell' || slug === 'router-level-layout-composition').length);
  await expect(page.locator('.pattern-browser__results-heading p')).toContainText(/2\s*patterns/);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Application structure', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('Every pattern has a detail route, recipe, components, tests, and page link', async ({ page }) => {
  await page.goto('/patterns');
  await expect(page.locator('[data-pattern-slug]')).toHaveCount(canonicalPatternSlugs.length, { timeout: wasmTimeout });

  const slugs = await page.locator('[data-pattern-slug]').evaluateAll(cards =>
    cards.map(card => card.getAttribute('data-pattern-slug')));

  for (const slug of slugs) {
    await page.goto(`/patterns/${slug}`);
    await expect(page.locator(`[data-pattern-detail="${slug}"]`)).toBeVisible({ timeout: wasmTimeout });
    await expect(page.getByTestId('pattern-recipe')).not.toBeEmpty();
    await expect(page.locator('[data-pattern-ingredient]').first()).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Checks before use' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Test coverage' })).toBeVisible();

    const launch = page.locator('.pattern-detail__launch');
    await expect(launch).toHaveAttribute('href', /^(?!patterns\/)[a-z0-9\-/]+$/);
  }
});

test('Pattern ingredients link to stable component detail routes', async ({ page }) => {
  await page.goto('/patterns/virtualized-data-workspace');

  const appGrid = page.locator('[data-pattern-ingredient="AppGrid"]');
  await expect(appGrid).toHaveAttribute('href', 'components/app-grid');
  await appGrid.click();

  await expect(page).toHaveURL(/\/components\/app-grid$/);
  await expect(page.getByRole('heading', { level: 1, name: 'AppGrid' }))
    .toBeVisible({ timeout: wasmTimeout });
});

test('Pattern pages contain wide recipes without creating narrow document overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const path of ['/patterns', '/patterns/validated-form-workflow']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: wasmTimeout });

    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth
    }));
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
  }

  const recipe = page.getByTestId('pattern-recipe');
  const recipeDimensions = await recipe.evaluate(element => ({
    client: element.clientWidth,
    scroll: element.scrollWidth,
    overflowX: getComputedStyle(element).overflowX
  }));
  expect(recipeDimensions.scroll).toBeGreaterThan(recipeDimensions.client);
  expect(recipeDimensions.overflowX).toBe('auto');
});

test('Pattern Browser and Pattern Detail have no serious or critical accessibility violations', async ({ page }) => {
  await page.goto('/patterns');
  await expect(page.locator('[data-pattern-slug]')).toHaveCount(canonicalPatternSlugs.length, { timeout: wasmTimeout });
  await expectNoSeriousOrCriticalViolations(page);

  await page.goto('/patterns/validated-form-workflow');
  await expect(page.locator('[data-pattern-detail="validated-form-workflow"]')).toBeVisible({ timeout: wasmTimeout });
  await expectNoSeriousOrCriticalViolations(page);
});
