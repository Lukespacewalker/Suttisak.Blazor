import { expect, test } from '@playwright/test';

test('Component Browser links resolve to stable component detail routes', async ({ page }) => {
  await page.goto('/component-browser');

  const sidebar = page.locator('.component-browser__sidebar');
  await sidebar.getByText('Actions & surfaces', { exact: true }).click();

  const appButtonLink = sidebar.getByRole('link', { name: /AppButton/ });
  await expect(appButtonLink).toBeVisible();
  await expect(appButtonLink).toHaveAttribute('href', 'components/app-button');
  await appButtonLink.click();

  await expect(page).toHaveURL(/\/components\/app-button$/);
  await expect(page.getByRole('heading', { level: 1, name: 'AppButton' })).toBeVisible();
  await expect(page.getByText('Interactive', { exact: true }).first()).toBeVisible();

  const detailSidebar = page.locator('.component-detail__sidebar');
  await expect(detailSidebar).toBeVisible();
  await expect(detailSidebar.getByRole('link', { name: 'AppButton' })).toHaveAttribute('aria-current', 'page');

  await detailSidebar.getByText('Forms & inputs', { exact: true }).click();
  await detailSidebar.getByRole('link', { name: 'AppCheckbox' }).click();

  await expect(page).toHaveURL(/\/components\/app-checkbox$/);
  await expect(page.getByRole('heading', { level: 1, name: 'AppCheckbox' })).toBeVisible();
});
