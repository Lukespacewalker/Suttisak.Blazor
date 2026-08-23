import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const wasmTimeout = 20_000;
const marketingRoutes = [
  'marketing-action-link',
  'marketing-call-to-action',
  'marketing-card',
  'marketing-container',
  'marketing-feature-grid',
  'marketing-hero',
  'marketing-product-frame',
  'marketing-proof-item',
  'marketing-proof-strip',
  'marketing-section-header',
  'marketing-step',
  'marketing-step-list'
];

async function expectNoSeriousOrCriticalViolations(page) {
  const results = await new AxeBuilder({ page })
    .include('main')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  const blocking = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
}

test('Marketing workbench composes the public primitives and exposes meaningful states', async ({ page }) => {
  await page.goto('/components/marketing-hero');

  await expect(page.getByRole('heading', { level: 1, name: 'MarketingHero', exact: true })).toBeVisible({ timeout: wasmTimeout });
  const workbench = page.getByTestId('marketing-workbench');
  await expect(workbench).toBeVisible({ timeout: wasmTimeout });

  await expect(page.getByTestId('marketing-primary-action')).toHaveClass(/marketing-action--primary/);
  await page.getByLabel('Primary action style').selectOption('Secondary');
  await expect(page.getByTestId('marketing-primary-action')).toHaveClass(/marketing-action--secondary/);

  await page.getByLabel('Hero title').fill('A clearer product promise.');
  await expect(page.getByTestId('marketing-hero').getByRole('heading', { level: 1 })).toHaveText('A clearer product promise.');

  await expect(page.getByTestId('marketing-product-frame')).toBeVisible();
  await page.getByLabel('Product frame').uncheck();
  await expect(page.getByTestId('marketing-product-frame')).toHaveCount(0);

  await expect(page.getByTestId('marketing-featured-card')).toHaveClass(/marketing-card--featured/);
  await page.getByLabel('Featured card').uncheck();
  await expect(page.getByTestId('marketing-featured-card')).not.toHaveClass(/marketing-card--featured/);

  await expect(page.getByTestId('marketing-step-list')).toHaveJSProperty('tagName', 'OL');
  await expect(page.getByTestId('marketing-step')).toHaveJSProperty('tagName', 'LI');

  await expect(page.getByTestId('marketing-call-to-action')).toBeVisible();
  await page.getByLabel('Closing call to action').uncheck();
  await expect(page.getByTestId('marketing-call-to-action')).toHaveCount(0);
});

test('MarketingPage stays pattern-level because its main landmark is exercised by the landing route', async ({ page }) => {
  await page.goto('/components');
  const card = page.locator('[data-component-name="MarketingPage"]');
  await expect(card).toBeVisible({ timeout: wasmTimeout });
  await expect(card).toHaveAttribute('data-component-coverage', 'pattern');

  await page.goto('/landing');
  await expect(page.locator('main.marketing-page')).toBeVisible({ timeout: wasmTimeout });
  await expect(page.locator('main.marketing-page main')).toHaveCount(0);
});

for (const slug of marketingRoutes) {
  test(`${slug} executable route has no serious or critical axe violations`, async ({ page }) => {
    await page.goto(`/components/${slug}`);
    await expect(page.getByTestId('marketing-workbench')).toBeVisible({ timeout: wasmTimeout });
    await expectNoSeriousOrCriticalViolations(page);
  });
}
