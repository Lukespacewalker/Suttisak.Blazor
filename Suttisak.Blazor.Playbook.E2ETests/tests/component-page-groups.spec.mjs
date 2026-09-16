import { expect, test } from '@playwright/test';

test('component browser groups companion components and finds their individual APIs', async ({ page }) => {
  await page.goto('/components');
  await expect(page.locator('[data-component-name="AppSelect"]')).toBeVisible();
  await expect(page.locator('[data-component-name="AppSelectItem"]')).toHaveCount(0);
  await page.getByRole('searchbox', { name: 'Find a component' }).fill('AppSelectItem');
  const result = page.locator('[data-component-name]');
  await expect(result).toHaveCount(1);
  await expect(result).toContainText('AppSelectItem');
  await result.click();
  await expect(page).toHaveURL(/\/components\/app-select#api-app-select-item$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Select', exact: true })).toBeVisible();
  await expect(page.locator('[data-api-component="AppSelectItem"]')).toBeVisible();
});

test('legacy member links retain preview settings and select the correct API', async ({ page }) => {
  await page.goto('/components/form-grid?viewport=mobile&mode=dark');
  await expect(page).toHaveURL(/\/components\/form-section\?viewport=mobile&mode=dark#api-form-grid$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Form Composition', exact: true })).toBeVisible();
  await expect(page.locator('[data-api-component="FormGrid"]')).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Columns', exact: true })).toBeVisible();
  await expect(page.getByTestId('isolated-specimen-frame')).toHaveAttribute('src', /specimens\/form-section\?.*mode=dark/);
});

test('member API navigation supports browser history without duplicating the preview', async ({ page }) => {
  await page.goto('/components/nav');
  const members = page.getByRole('navigation', { name: 'Components on this page' });
  await members.getByRole('link', { name: 'NavItem', exact: true }).click();
  await expect(page).toHaveURL(/#api-nav-item$/);
  await expect(page.locator('[data-api-component="NavItem"]')).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Href', exact: true })).toBeVisible();
  await members.getByRole('link', { name: 'NavSubmenu', exact: true }).click();
  await expect(page.locator('[data-api-component="NavSubmenu"]')).toBeVisible();
  await page.goBack();
  await expect(page.locator('[data-api-component="NavItem"]')).toBeVisible();
  await expect(page.getByTestId('navigation-workbench')).toHaveCount(1);
});

test('numeric inputs and multiple selection show only their own controls', async ({ page }) => {
  await page.goto('/components/app-number-input');
  await expect(page.getByRole('spinbutton', { name: 'Capacity', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Multiple selection', exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Calendar mode')).toHaveCount(0);
  await page.goto('/components/app-multi-select');
  await expect(page.getByRole('heading', { name: 'Multiple selection', exact: true })).toBeVisible();
  await expect(page.getByRole('spinbutton', { name: 'Capacity', exact: true })).toHaveCount(0);
});

test('marketing proof and step pairs have focused shared pages', async ({ page }) => {
  await page.goto('/components/marketing-proof-item');
  await expect(page).toHaveURL(/\/components\/marketing-proof-strip#api-marketing-proof-item$/);
  await expect(page.getByTestId('marketing-proof-item')).toBeVisible();
  await expect(page.getByTestId('marketing-hero')).toHaveCount(0);
  await expect(page.getByTestId('marketing-step-list')).toHaveCount(0);
  await page.goto('/components/marketing-step');
  await expect(page).toHaveURL(/\/components\/marketing-step-list#api-marketing-step$/);
  await expect(page.getByTestId('marketing-step-list')).toBeVisible();
  await expect(page.getByTestId('marketing-proof-item')).toHaveCount(0);
});

test('member selection survives theme and viewport changes and keyboard navigation', async ({ page }) => {
  await page.goto('/components/app-select');
  const link = page.getByRole('navigation', { name: 'Components on this page' }).getByRole('link', { name: 'AppSelectItem', exact: true });
  await link.focus();
  await link.press('Enter');
  await expect(page.locator('[data-api-component="AppSelectItem"]')).toBeFocused();
  await page.getByRole('button', { name: 'Use dark theme' }).click();
  await expect(page.locator('[data-api-component="AppSelectItem"]')).toBeVisible();
  await page.getByRole('button', { name: '375', exact: true }).click();
  await expect(page.locator('[data-api-component="AppSelectItem"]')).toBeVisible();
  await expect(page.getByTestId('isolated-specimen-frame')).toHaveAttribute('src', /mode=dark/);
  await page.reload();
  await expect(page.locator('[data-api-component="AppSelectItem"]')).toBeVisible();
});

test('narrow documentation starts with its subject and keeps the page browser available', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/components/marketing-proof-strip?mode=dark');
  await expect(page.getByRole('heading', { level: 1, name: 'Marketing Proof', exact: true })).toBeInViewport();
  const browser = page.getByRole('navigation', { name: 'Component groups' });
  await expect(browser).toBeHidden();
  const toggle = page.getByRole('button', { name: 'Browse component pages' });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(browser).toBeVisible();
  await toggle.click();
  await expect(browser).toBeHidden();
});
