import { expect, test } from '@playwright/test';

test('Component Browser fragment links stay on the browser route and scroll to their target', async ({ page }) => {
  await page.goto('/component-browser');

  const sidebar = page.locator('.component-browser__sidebar');
  await sidebar.getByText('Actions & surfaces', { exact: true }).click();

  const appButtonLink = sidebar.getByRole('link', { name: 'AppButton', exact: true });
  await expect(appButtonLink).toBeVisible();
  await expect(appButtonLink).toHaveAttribute('href', 'component-browser#app-button');
  await appButtonLink.click();

  await expect(page).toHaveURL(/\/component-browser#app-button$/);
  await expect(page.locator('#app-button')).toBeInViewport();
});
