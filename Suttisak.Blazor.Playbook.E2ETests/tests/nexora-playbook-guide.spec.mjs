import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const palettes = [
  ['audiogramiq', 'rgb(8, 119, 125)', 'rgb(76, 215, 212)'],
  ['bafsworkout', 'rgb(81, 57, 138)', 'rgb(178, 162, 239)'],
  ['coekpi', 'rgb(11, 95, 172)', 'rgb(105, 186, 255)'],
  ['ergotrack', 'rgb(73, 53, 143)', 'rgb(177, 161, 242)'],
  ['mentalinsight', 'rgb(150, 80, 46)', 'rgb(226, 173, 140)'],
  ['healthinsight', 'rgb(8, 105, 181)', 'rgb(96, 189, 255)']
];

for (const [application, light, dark] of palettes) {
  test(`Nexora ${application} preview uses its real host accent in both modes`, async ({ page }) => {
    await page.goto(`/?appearance=nexora&theme=${application}&mode=light`);
    const primary = page.locator('.playbook-home__primary-action');
    await expect(primary).toHaveCSS('background-color', light);
    await page.getByRole('button', { name: 'Use dark theme', exact: true }).click();
    await expect(primary).toHaveCSS('background-color', dark);
    await expect(page.locator('.playbook')).toHaveCSS('background-color', 'rgb(23, 24, 26)');
  });
}

test('home search launches the matching component guide with preview settings intact', async ({ page }) => {
  await page.goto('/?appearance=nexora&theme=mentalinsight&mode=dark');
  const search = page.getByRole('searchbox', { name: 'Search the component library', exact: true });
  await search.fill('AppCheckbox');
  await search.press('Enter');
  await expect(page).toHaveURL(/\/components\?/);
  await expect(page.getByRole('searchbox', { name: 'Find a component', exact: true })).toHaveValue('AppCheckbox');
  await expect(page.locator('.component-browser__card')).toHaveCount(1);
  await page.locator('.component-browser__card').click();
  await expect(page.getByRole('heading', { name: 'AppCheckbox', exact: true }).first()).toBeVisible();
  await expect(page.locator('#appearance-select')).toHaveValue('nexora');
  await expect(page.locator('#theme-select')).toHaveValue('mentalinsight');
  await expect(page.locator('.playbook')).toHaveAttribute('data-color-mode', 'dark');
});

test('home showcase contains working shared form controls and reports the local result', async ({ page }) => {
  await page.goto('/?appearance=nexora&mode=light');
  await page.getByRole('textbox', { name: 'Workspace name', exact: true }).fill('คลินิกตัวอย่าง');
  const summaries = page.getByRole('checkbox', { name: 'Weekly summaries', exact: true });
  await summaries.focus();
  await summaries.press('Space');
  await expect(summaries).not.toBeChecked();
  await page.getByRole('button', { name: 'Apply changes', exact: true }).click();
  await expect(page.locator('.playbook-home__preview [role="status"]')).toContainText('คลินิกตัวอย่าง');
  await expect(page.locator('.playbook-home__preview [role="status"]')).toContainText('off');
});

test('component guide links retain distinct keyboard focus including forced colors', async ({ page }) => {
  await page.goto('/components?appearance=nexora&q=AppButton');
  const card = page.locator('.component-browser__card').first();
  await card.focus();
  await expect(card).toBeFocused();
  await expect(card).toHaveCSS('outline-style', 'solid');
  await expect(card).toHaveCSS('outline-width', '2px');
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(card).toHaveCSS('outline-style', 'solid');
  await card.press('Enter');
  const related = page.locator('.component-detail__related a').first();
  await related.focus();
  await expect(related).toHaveCSS('outline-width', '2px');
});

for (const mode of ['light', 'dark']) {
  test(`Nexora home ${mode} remains usable and accessible at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(`/?appearance=nexora&theme=mentalinsight&mode=${mode}`);
    await expect(page.getByRole('textbox', { name: 'Workspace name', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Apply changes', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}

test('first paint loader follows the Nexora surface before the app hydrates', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, colorScheme: 'light' });
  const page = await context.newPage();
  await page.goto(baseURL);
  await expect(page.locator('.playbook-loading')).toHaveCSS('background-color', 'rgb(247, 245, 240)');
  await expect(page.getByRole('heading', { name: 'Loading UI Playbook' })).toBeVisible();
  await context.close();
});
