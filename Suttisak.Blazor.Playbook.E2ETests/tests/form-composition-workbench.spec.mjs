import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const formRoutes = [
  '/components/form-section',
  '/components/form-grid',
  '/components/form-field',
  '/components/form-actions',
  '/components/form-validation-summary'
];

test('form composition specimen exposes semantic section and configurable grid contracts', async ({ page }) => {
  await page.goto('/components/form-section');

  await expect(page.getByRole('complementary', { name: 'Form composition controls' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Title', exact: true })).toBeVisible();

  const section = page.getByRole('region', { name: 'Review profile' });
  await expect(section).toBeVisible();

  const grid = page.getByTestId('profile-grid');
  await expect(grid).toHaveCSS('--form-grid-columns', '2');
  await page.getByLabel('Grid columns').selectOption('4');
  await expect(grid).toHaveCSS('--form-grid-columns', '4');
});

test('invalid submit flows DataAnnotations into summary, inline alerts, and ARIA field state', async ({ page }) => {
  await page.goto('/components/form-validation-summary');

  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByTestId('submit-status')).toHaveText('Validation blocked submission.');

  const summary = page.getByTestId('validation-summary');
  await expect(summary).toHaveAttribute('role', 'alert');
  await expect(summary).toHaveAttribute('aria-live', 'assertive');
  await expect(summary).toContainText('Full name is required.');
  await expect(summary).toContainText('Email is required.');

  const fullName = page.getByLabel('Full name');
  const email = page.getByLabel('Email');
  await expect(fullName).toHaveAttribute('aria-invalid', 'true');
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await expect(fullName).toHaveAttribute('aria-describedby', /description.*validation|validation.*description/);
  await expect(email).toHaveAttribute('aria-describedby', /description.*validation|validation.*description/);
  await expect(page.getByRole('alert').filter({ hasText: 'Full name is required.' })).toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: 'Email is required.' })).toBeVisible();
});

test('inline validation can be hidden without removing summary feedback or aria-invalid', async ({ page }) => {
  await page.goto('/components/form-field');

  await page.getByLabel('Inline validation').uncheck();
  await page.getByRole('button', { name: 'Save profile' }).click();

  await expect(page.getByTestId('validation-summary')).toContainText('Full name is required.');
  await expect(page.getByLabel('Full name')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByLabel('Full name')).toHaveAttribute('aria-describedby', /description/);
  await expect(page.getByRole('alert').filter({ hasText: 'Full name is required.' })).toHaveCount(0);
});

test('valid submit succeeds only after required and email validation pass', async ({ page }) => {
  await page.goto('/components/form-actions');

  await page.getByLabel('Full name').fill('Ada Lovelace');
  await page.getByLabel('Email').fill('not-an-email');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByTestId('submit-status')).toHaveText('Validation blocked submission.');
  await expect(page.getByTestId('validation-summary')).toContainText('Enter a valid email address.');

  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByTestId('submit-status')).toHaveText('Saved Ada Lovelace.');
  await expect(page.getByLabel('Full name')).toHaveAttribute('aria-invalid', 'false');
  await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'false');
});

test('form actions support reset, sticky state, and disabled inputs', async ({ page }) => {
  await page.goto('/components/form-actions');

  const actions = page.getByTestId('form-actions');
  await expect(actions).not.toHaveClass(/form-actions--sticky/);
  await page.getByLabel('Sticky actions').check();
  await expect(actions).toHaveClass(/form-actions--sticky/);

  await page.getByLabel('Full name').fill('Grace Hopper');
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByLabel('Full name')).toHaveValue('');
  await expect(page.getByTestId('submit-status')).toHaveText('Form reset.');

  await page.getByLabel('Disabled form inputs').check();
  await expect(page.getByLabel('Full name')).toBeDisabled();
  await expect(page.getByLabel('Email')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Save profile' })).toBeDisabled();
});

for (const path of formRoutes) {
  test(`form composition workbench has no serious or critical axe violations on ${path}`, async ({ page }) => {
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
