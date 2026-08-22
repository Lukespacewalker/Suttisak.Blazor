import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const advancedInputRoutes = [
  '/components/app-number-input',
  '/components/app-multi-select',
  '/components/app-radio-group',
  '/components/app-calendar-picker',
  '/components/app-time-picker',
  '/components/app-date-time-picker'
];

test('AppNumberInput specimen binds typed numeric values and native range metadata', async ({ page }) => {
  await page.goto('/components/app-number-input');

  await expect(page.getByRole('complementary', { name: 'Advanced input controls' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Min', exact: true })).toBeVisible();

  const input = page.getByLabel('Capacity');
  await expect(input).toHaveAttribute('type', 'number');
  await expect(input).toHaveAttribute('min', '0');
  await expect(input).toHaveAttribute('max', '100');
  await expect(input).toHaveAttribute('step', '5');
  await input.fill('70');
  await expect(page.getByRole('status').filter({ hasText: 'Capacity: 70' })).toBeVisible();
});

test('AppMultiSelect specimen preserves multiple typed selections', async ({ page }) => {
  await page.goto('/components/app-multi-select');

  await expect(page.getByRole('rowheader', { name: 'SelectedItems', exact: true })).toBeVisible();
  const select = page.getByLabel('Review roles');
  await select.selectOption(['Reviewer', 'Observer']);

  await expect(page.getByRole('status').filter({ hasText: 'Roles: Observer, Reviewer' })).toBeVisible();
  await expect(select.locator('option:checked')).toHaveCount(2);
  await expect(select.getByRole('option', { name: 'Archived' })).toBeDisabled();
});

test('AppRadioGroup specimen keeps one exclusive choice and exposes fieldset semantics', async ({ page }) => {
  await page.goto('/components/app-radio-group');

  await expect(page.getByRole('rowheader', { name: 'Orientation', exact: true })).toBeVisible();
  const group = page.getByRole('group', { name: 'Contact channel' });
  await expect(group).toBeVisible();

  const phone = page.getByRole('radio', { name: 'Phone' });
  const email = page.getByRole('radio', { name: 'Email' });
  await expect(email).toBeChecked();
  await phone.check();
  await expect(phone).toBeChecked();
  await expect(email).not.toBeChecked();
  await expect(page.getByRole('status').filter({ hasText: 'Channel: Phone' })).toBeVisible();
});

test('AppCalendarPicker specimen binds invariant dates and switches progressive-enhancement mode', async ({ page }) => {
  await page.goto('/components/app-calendar-picker');

  await expect(page.getByRole('rowheader', { name: 'Mode', exact: true })).toBeVisible();
  const input = page.getByLabel('Appointment date');
  await input.fill('2026-10-20');
  await expect(page.getByRole('status').filter({ hasText: 'Date: 2026-10-20' })).toBeVisible();

  const wrapper = page.locator('[data-app-calendar]').first();
  await expect(wrapper).toHaveAttribute('data-app-calendar', 'popup');
  await expect(page.getByRole('button', { name: 'Open calendar' })).toBeVisible();

  await page.getByLabel('Calendar mode').selectOption('Native');
  await expect(wrapper).toHaveAttribute('data-app-calendar', 'native');
  await expect(page.getByRole('button', { name: 'Open calendar' })).toHaveCount(0);
});

test('AppTimePicker specimen updates precision and localized trigger contract', async ({ page }) => {
  await page.goto('/components/app-time-picker');

  await expect(page.getByRole('rowheader', { name: 'MinuteStep', exact: true })).toBeVisible();
  const input = page.getByLabel('Start time');
  await expect(input).toHaveAttribute('step', '900');
  await input.fill('14:30');
  await expect(page.getByRole('status').filter({ hasText: 'Time: 14:30' })).toBeVisible();

  await page.getByLabel('Minute step').selectOption('5');
  await expect(input).toHaveAttribute('step', '300');
  await page.getByLabel('Include seconds').check();
  await expect(input).toHaveAttribute('step', '5');

  await page.getByLabel('Thai picker text').check();
  const wrapper = page.locator('[data-app-time]').first();
  await expect(wrapper).toHaveAttribute('data-picker-locale', 'th-TH');
  await expect(page.getByRole('button', { name: 'เปิดตัวเลือกเวลา' })).toBeVisible();
});

test('AppDateTimePicker specimen binds browser-local values and transport field names', async ({ page }) => {
  await page.goto('/components/app-date-time-picker');

  await expect(page.getByRole('rowheader', { name: 'Name', exact: true })).toBeVisible();
  const input = page.getByLabel('Follow-up');
  await input.fill('2026-10-20T16:45');
  await expect(page.getByRole('status').filter({ hasText: 'Follow-up: 2026-10-20T16:45' })).toBeVisible();

  await expect(input).toHaveAttribute('name', 'FollowUp.LocalDateTime');
  await expect(page.locator('input[type="hidden"][name="FollowUp.UtcDateTime"]')).toHaveCount(1);
  await expect(page.locator('input[type="hidden"][name="FollowUp.TimeZoneId"]')).toHaveCount(1);
  await expect(page.locator('input[type="hidden"][name="FollowUp.UtcOffsetMinutes"]')).toHaveCount(1);

  await page.getByLabel('Thai picker text').check();
  const wrapper = page.locator('[data-app-datetime]').first();
  await expect(wrapper).toHaveAttribute('data-picker-locale', 'th-TH');
  await expect(page.getByRole('button', { name: 'เปิดตัวเลือกวันที่และเวลา' })).toBeVisible();
  await expect(page.getByText('เวลาท้องถิ่นของเบราว์เซอร์', { exact: true })).toBeVisible();
});

for (const path of advancedInputRoutes) {
  test(`advanced input workbench has no serious or critical axe violations on ${path}`, async ({ page }) => {
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
