import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const feedbackRoutes = [
  '/components/async-content',
  '/components/app-loading',
  '/components/app-progress',
  '/components/app-skeleton',
  '/components/feedback-banner',
  '/components/status-panel',
  '/components/status-page'
];

test('AsyncContent specimen executes ready, error, retry, and loading states', async ({ page }) => {
  await page.goto('/components/async-content');

  await expect(page.getByRole('complementary', { name: 'Feedback and async controls' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'State', exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Ready content' })).toContainText('Report ready');

  await page.getByLabel('Async state').selectOption('Error');
  const alert = page.getByRole('alert').filter({ hasText: 'Report unavailable' });
  await expect(alert).toBeVisible();
  await alert.getByRole('button', { name: 'Retry load' }).click();

  await expect(page.getByRole('status').filter({ hasText: 'Loading report' })).toBeVisible();
  await expect(page.getByText('Retry requested 1 time.', { exact: true })).toBeVisible();
});

test('AppLoading specimen keeps background activity as a polite status', async ({ page }) => {
  await page.goto('/components/app-loading');

  await expect(page.getByRole('rowheader', { name: 'Title', exact: true })).toBeVisible();
  const loading = page.getByRole('status').filter({ hasText: 'Synchronizing records' });
  await expect(loading).toBeVisible();
  await expect(loading).toHaveAttribute('aria-live', 'polite');
});

test('AppProgress specimen updates determinate ARIA values from live controls', async ({ page }) => {
  await page.goto('/components/app-progress');

  await expect(page.getByRole('rowheader', { name: 'Value', exact: true })).toBeVisible();
  const progress = page.getByRole('progressbar', { name: 'Import progress' });
  await expect(progress).toHaveAttribute('aria-valuenow', '45');

  await page.getByLabel('Progress value').fill('70');
  await expect(progress).toHaveAttribute('aria-valuenow', '70');
  await expect(page.getByText('70% complete', { exact: true })).toBeVisible();
});

test('AppSkeleton specimen remains decorative while shape controls change the visual contract', async ({ page }) => {
  await page.goto('/components/app-skeleton');

  await expect(page.getByRole('rowheader', { name: 'Circle', exact: true })).toBeVisible();
  const skeleton = page.locator('.component-detail__preview-frame .app-skeleton').first();
  await expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  await expect(skeleton).not.toHaveClass(/app-skeleton--circle/);

  await page.getByLabel('Circle skeleton').check();
  await expect(skeleton).toHaveClass(/app-skeleton--circle/);
});

test('FeedbackBanner specimen changes announcement urgency and supports dismissal', async ({ page }) => {
  await page.goto('/components/feedback-banner');

  await expect(page.getByRole('rowheader', { name: 'Intent', exact: true })).toBeVisible();
  const infoStatus = page.getByRole('status').filter({ hasText: 'Import information' });
  await expect(infoStatus).toBeVisible();
  await expect(infoStatus).toHaveAttribute('aria-live', 'polite');

  await page.getByLabel('Intent').selectOption('Error');
  const errorAlert = page.getByRole('alert').filter({ hasText: 'Import failed' });
  await expect(errorAlert).toBeVisible();
  await expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
  await errorAlert.getByRole('button', { name: 'Dismiss feedback' }).click();
  await expect(page.getByText('Feedback dismissed.', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Restore feedback' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Import failed' })).toBeVisible();
});

test('StatusPanel specimen exposes loading state through the shared status contract', async ({ page }) => {
  await page.goto('/components/status-panel');

  await expect(page.getByRole('rowheader', { name: 'Loading', exact: true })).toBeVisible();
  await page.getByLabel('Status loading').check();
  const status = page.getByRole('status').filter({ hasText: 'Checking status' });
  await expect(status).toBeVisible();
  await expect(status).toHaveAttribute('aria-live', 'polite');
});

test('StatusPage specimen exposes slots, variants, and heading association', async ({ page }) => {
  await page.goto('/components/status-page');

  const status = page.getByTestId('status-page-specimen').locator('section.status-page');
  await expect(status).toHaveAttribute('role', 'region');
  await expect(status).toHaveAttribute('aria-labelledby', 'status-page-demo-heading');
  await expect(status.getByRole('heading', { level: 1, name: /protected space/i })).toBeVisible();
  await expect(status).toContainText('Application-owned slot');
  await expect(status).toContainText('Reference: STATUS-DEMO-42');

  await page.getByLabel('Variant').selectOption('Error');
  await expect(status).toHaveAttribute('role', 'alert');
  await expect(status).toHaveAttribute('aria-live', 'assertive');

  await page.getByLabel('Custom visual slot').check();
  await expect(status).toContainText('◎');
});

for (const path of feedbackRoutes) {
  test(`feedback workbench has no serious or critical axe violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('main')).toBeVisible();
    if (path === '/components/status-page') {
      await expect(page.locator('.status-page')).toBeVisible();
      await page.waitForTimeout(800);
    }

    const results = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    const blockingViolations = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
    expect(blockingViolations, JSON.stringify(blockingViolations, null, 2)).toEqual([]);
  });
}
