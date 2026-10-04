import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function openCards(page, pattern = 'Cards') {
  await page.goto('/components/app-grid');
  await page.getByRole('combobox', { name: 'Responsive pattern', exact: true }).selectOption(pattern);
  // Constrain the component inside a desktop viewport: this must not be a window media query.
  await page.locator('.component-specimen__demo').evaluate(el => { el.style.width = '360px'; el.style.maxWidth = '100%'; });
  await expect(page.locator('.app-grid__cards-view')).toBeVisible();
}

test('all three responsive recipes preserve table comparison or show cards', async ({ page }) => {
  await openCards(page);
  await expect(page.getByRole('table', { name: 'Playbook records table' })).not.toBeVisible();
  await expect(page.locator('.app-grid__card')).toHaveCount(3);
  await expect(page.locator('.app-grid__card').first()).toContainText('Program');
  await page.getByRole('combobox', { name: 'Responsive pattern', exact: true }).selectOption('Table');
  const table = page.getByRole('table', { name: 'Playbook records table' });
  await expect(table).toBeVisible();
  expect(await page.locator('.app-grid-shell__viewport').evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true);
  await page.getByRole('combobox', { name: 'Responsive pattern', exact: true }).selectOption('Summary');
  await expect(page.locator('.app-grid__cards-view')).toBeVisible();
  const details = page.locator('.app-grid__card').first().getByRole('button', { name: 'View details' });
  await details.click();
  const dialog = page.getByRole('dialog', { name: 'Record details' });
  await expect(dialog).toContainText('Narin P.');
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(details).toBeFocused();
});

test('cards sort, paginate, select and retain state and focus across resize', async ({ page }) => {
  await openCards(page);
  await page.getByRole('combobox', { name: 'Sort by', exact: true }).selectOption({ label: 'ID' });
  await expect(page.locator('.app-grid__card').first()).toContainText('Office movement campaign');
  await page.getByRole('checkbox', { name: 'Select row 1043', exact: true }).check();
  await page.getByRole('combobox', { name: 'Sort direction', exact: true }).selectOption('descending');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('.app-grid-paginator [aria-current="page"]')).toHaveText('2');
  await expect(page.getByRole('checkbox', { name: 'Select row 1043', exact: true })).toBeChecked();
  await page.getByRole('checkbox', { name: 'Select row 1043', exact: true }).focus();
  await page.locator('.component-specimen__demo').evaluate(el => { el.style.width = '900px'; });
  await page.setViewportSize({ width: 1800, height: 1000 });
  await expect(page.locator('.app-grid__cards-view')).not.toBeVisible();
  await expect(page.locator('.app-grid')).toBeFocused();
  await expect(page.getByRole('checkbox', { name: 'Select row 1043', exact: true })).toBeChecked();
  await expect(page.locator('.app-grid-paginator [aria-current="page"]')).toHaveText('2');
  await page.getByRole('button', { name: 'ID', exact: true }).focus();
  await page.locator('.component-specimen__demo').evaluate(el => { el.style.width = '360px'; });
  await expect(page.locator('.app-grid__cards-view')).toBeVisible();
  await expect(page.locator('.app-grid')).toBeFocused();
  await expect(page.getByRole('combobox', { name: 'Sort direction', exact: true })).toHaveValue('descending');
  await page.getByRole('checkbox', { name: 'Select all visible rows' }).check();
  await expect(page.getByText('3 selected', { exact: true })).toBeVisible();
});

for (const theme of ['light', 'dark']) {
  test(`compact cards are accessible and contained in ${theme}`, async ({ page }) => {
    await openCards(page, 'Summary');
    await page.getByRole('button', { name: `Use ${theme} theme`, exact: true }).click();
    await expect(page.locator('.playbook')).toHaveCSS('color-scheme', theme);
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
    await page.locator('.component-specimen__demo').evaluate(el => { el.style.width = '320px'; });
    expect(await page.locator('.app-grid').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    const results = await new AxeBuilder({ page }).include('.component-detail__preview-frame')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations.filter(v => ['serious', 'critical'].includes(v.impact))).toEqual([]);
    await page.locator('.component-detail__preview-frame').screenshot({ path: `test-results/grid-cards-${theme}.png` });
    await page.getByRole('searchbox', { name: 'Search records' }).fill('no matching record');
    await expect(page.locator('.app-grid__card')).toHaveCount(0);
  });
}

test('disabling cards while its module loads keeps the table visible', async ({ page }) => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  let requested;
  const started = new Promise(resolve => { requested = resolve; });
  await page.route('**/js/app-grid.js', async route => { requested(); await gate; await route.continue(); });
  await page.goto('/components/app-grid');
  await page.locator('.component-specimen__demo').evaluate(el => { el.style.width = '360px'; });
  await page.getByRole('combobox', { name: 'Responsive pattern', exact: true }).selectOption('Cards');
  await started;
  await page.getByRole('combobox', { name: 'Responsive pattern', exact: true }).selectOption('Table');
  const moduleResponse = page.waitForResponse(response => response.url().endsWith('/js/app-grid.js'));
  release();
  await moduleResponse;
  await expect(page.locator('.app-grid__cards-view')).toHaveCount(0);
  await expect(page.getByRole('table', { name: 'Playbook records table' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Responsive pattern', exact: true }).selectOption('Cards');
  await expect(page.locator('.app-grid__cards-view')).toBeVisible();
});

test('closing details after resize returns focus to the visible grid', async ({ page }) => {
  await page.setViewportSize({ width: 1800, height: 1000 });
  await openCards(page, 'Summary');
  await page.locator('.app-grid__card').first().getByRole('button', { name: 'View details' }).click();
  const dialog = page.getByRole('dialog', { name: 'Record details' });
  await expect(dialog).toBeVisible();
  await page.locator('.component-specimen__demo').evaluate(el => { el.style.width = '900px'; });
  await expect(page.getByRole('table', { name: 'Playbook records table' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.locator('.app-grid')).toBeFocused();
});
