import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  '/components/local-time',
  '/components/initialize-time-zone'
];

test('LocalTime exposes runtime API metadata and keeps a machine-readable UTC instant', async ({ page }) => {
  await page.goto('/components/local-time');

  await expect(page.getByRole('complementary', { name: 'Time and localization controls' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Value', exact: true })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Format', exact: true })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Culture', exact: true })).toBeVisible();

  const semanticTime = page.locator('time').first();
  await expect(semanticTime).toHaveAttribute('datetime', '2026-08-23T00:00:00.0000000Z');
  await expect(page.getByTestId('utc-instant')).toHaveText('2026-08-23T00:00:00.0000000Z');
});

test('LocalTime reacts to explicit browser time-zone changes without changing the UTC contract', async ({ page }) => {
  await page.goto('/components/local-time');

  const semanticTime = page.locator('time').first();
  const zone = page.getByLabel('Time zone');

  await zone.selectOption('UTC');
  await expect(semanticTime).toHaveText('2026-08-23 00:00:00 +00:00');
  await expect(page.getByTestId('local-offset')).toContainText('00:00:00');

  await zone.selectOption('Asia/Bangkok');
  await expect(semanticTime).toHaveText('2026-08-23 07:00:00 +07:00');
  await expect(page.getByTestId('time-zone-status')).toContainText('Asia/Bangkok');
  await expect(semanticTime).toHaveAttribute('datetime', '2026-08-23T00:00:00.0000000Z');
});

test('LocalTime culture and format controls change presentation while preserving the instant', async ({ page }) => {
  await page.goto('/components/local-time');

  const semanticTime = page.locator('time').first();
  await page.getByLabel('Time zone').selectOption('Asia/Bangkok');
  await page.getByLabel('Format').selectOption('dddd, dd MMMM yyyy HH:mm');

  await page.getByLabel('Culture').selectOption('en-US');
  const englishText = await semanticTime.textContent();
  await expect(page.getByTestId('culture-name')).toHaveText('en-US');

  await page.getByLabel('Culture').selectOption('th-TH');
  await expect(page.getByTestId('culture-name')).toHaveText('th-TH');
  await expect(semanticTime).not.toHaveText(englishText ?? '');
  await expect(semanticTime).toHaveAttribute('datetime', '2026-08-23T00:00:00.0000000Z');
});

test('InitializeTimeZone route demonstrates browser initialization as an executable specimen', async ({ page }) => {
  await page.goto('/components/initialize-time-zone');

  await expect(page.getByRole('complementary', { name: 'Time and localization controls' })).toBeVisible();
  await expect(page.getByTestId('time-zone-status')).toContainText('Browser time zone:');
  await expect(page.locator('time').first()).toBeVisible();
});

for (const path of routes) {
  test(`time localization workbench has no serious or critical axe violations on ${path}`, async ({ page }) => {
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
