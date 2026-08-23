import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  '/components/experience-card',
  '/components/experience-disclosure',
  '/components/experience-disclosure-group',
  '/components/experience-heading'
];

test('ExperienceHeading exposes reader-facing semantics and a meaningful visual', async ({ page }) => {
  await page.goto('/components/experience-heading');

  await expect(page.getByRole('complementary', { name: 'Experience controls' })).toBeVisible();
  const headingRegion = page.getByTestId('experience-heading');
  await expect(headingRegion).toHaveAttribute('aria-labelledby', 'experience-demo-heading');
  await expect(headingRegion.getByRole('heading', { level: 1 })).toContainText('Your annual check');
  await expect(page.getByTestId('experience-visual')).toHaveAttribute('role', 'img');
  await expect(page.getByTestId('experience-visual')).toHaveAttribute('aria-label', 'Overall result score 82 out of 100');
});

test('ExperienceHeading switches a visual between meaningful and decorative treatment', async ({ page }) => {
  await page.goto('/components/experience-heading');

  const visual = page.getByTestId('experience-visual');
  const visualContainer = page.locator('.experience-heading__visual').first();
  await page.getByLabel('Decorative visual').check();

  await expect(visualContainer).toHaveAttribute('aria-hidden', 'true');
  await expect(visual).not.toHaveAttribute('role', 'img');
  await expect(visual).not.toHaveAttribute('aria-label', /.+/);
});

test('ExperienceCard controls presentation classes without changing application-owned content', async ({ page }) => {
  await page.goto('/components/experience-card');

  const card = page.getByTestId('experience-card');
  await expect(card).toHaveClass(/experience-card--accent/);
  await expect(card).toHaveClass(/experience-card--elevated/);
  await expect(card).not.toHaveClass(/experience-card--interactive/);
  await expect(card).toContainText('The shared component owns the surface treatment');

  await page.getByLabel('Interactive treatment').check();
  await page.getByLabel('Elevated card').uncheck();
  await expect(card).toHaveClass(/experience-card--interactive/);
  await expect(card).not.toHaveClass(/experience-card--elevated/);
});

test('ExperienceDisclosure preserves native details behavior and recommendation state', async ({ page }) => {
  await page.goto('/components/experience-disclosure');

  const primary = page.getByTestId('experience-disclosure-primary');
  const secondary = page.getByTestId('experience-disclosure-secondary');
  await expect(primary).toHaveAttribute('open', '');
  await expect(primary).toHaveClass(/experience-disclosure--recommended/);
  await expect(primary.getByText('Recommended')).toBeVisible();
  await expect(secondary).not.toHaveAttribute('open', '');

  await secondary.locator('summary').click();
  await expect(secondary).toHaveAttribute('open', '');

  await page.getByLabel('Recommended disclosure').uncheck();
  await expect(primary).not.toHaveClass(/experience-disclosure--recommended/);
  await expect(primary.getByText('Recommended')).toHaveCount(0);
});

for (const path of routes) {
  test(`experience workbench has no serious or critical axe violations on ${path}`, async ({ page }) => {
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
