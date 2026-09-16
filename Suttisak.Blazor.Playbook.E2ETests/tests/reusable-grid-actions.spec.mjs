import { expect, test } from '@playwright/test';
import fs from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';

test('row actions are a keyboard-operable popup above the scrolling grid', async ({ page }) => {
  await page.goto('/components/app-grid');
  const trigger = page.getByRole('button', { name: 'Actions for Annual hearing surveillance', exact: true });
  await trigger.focus();
  await trigger.press('Enter');
  const popup = page.locator('[data-app-action-menu]:popover-open');
  await expect(popup).toBeVisible();
  await expect(popup.getByRole('button', { name: 'Edit', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(popup.getByRole('button', { name: 'Delete', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(popup).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole('heading', { name: 'AppGrid', exact: true }).click();
  await expect(popup).toHaveCount(0);
});

for (const theme of ['light', 'dark']) {
  test(`shared action menu fits a constrained preview in ${theme} theme`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/app-action-menu');
    await page.getByRole('button', { name: `Use ${theme} theme` }).click();
    await page.getByRole('button', { name: '375', exact: true }).click();
    const preview = page.frameLocator('[data-testid="isolated-specimen-frame"]');
    await preview.getByRole('button', { name: 'Actions for Annual hearing surveillance', exact: true }).click();
    const popup = preview.locator('[data-app-action-menu]:popover-open');
    await expect(popup).toBeVisible();
    const geometry = await popup.evaluate(menu => {
      const rect = menu.getBoundingClientRect();
      return { x: rect.x, right: rect.right, y: rect.y, bottom: rect.bottom,
        width: innerWidth, height: innerHeight,
        hit: menu.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)) };
    });
    expect(geometry.x).toBeGreaterThanOrEqual(0);
    expect(geometry.right).toBeLessThanOrEqual(geometry.width);
    expect(geometry.y).toBeGreaterThanOrEqual(0);
    expect(geometry.bottom).toBeLessThanOrEqual(geometry.height);
    expect(geometry.hit).toBe(true);
    const results = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations.filter(item => ['serious', 'critical'].includes(item.impact))).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`grid-actions-${theme}.png`) });
  });
}

test('virtualized select-all exports a bounded window after scrolling', async ({ page }) => {
  await page.goto('/grid-performance');
  const table = page.getByRole('table', { name: '100000 virtual records' });
  await expect(table).toBeVisible();
  const viewport = page.locator('.app-grid');
  await viewport.scrollIntoViewIfNeeded();
  await expect.poll(() => viewport.evaluate(element => element.scrollHeight)).toBeGreaterThan(5000);
  await viewport.evaluate(element => { element.scrollTop = 5000; });
  const checkboxes = table.locator('tbody input.app-grid__checkbox');
  await expect(checkboxes.first()).not.toHaveAttribute('aria-label', 'Select row 1');
  const visibleIds = await checkboxes.evaluateAll(inputs => inputs.map(input => Number(input.getAttribute('aria-label').replace('Select row ', ''))));
  await page.getByRole('checkbox', { name: 'Select all visible rows' }).check();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export selected', exact: true }).click();
  const csv = await fs.readFile(await (await downloadPromise).path(), 'utf8');
  const lines = csv.trim().split('\r\n');
  expect(lines.length).toBeGreaterThan(2);
  expect(lines.length).toBeLessThan(200);
  expect(lines.slice(1).map(line => Number(line.match(/^"(\d+)"/)[1]))).toEqual(visibleIds);
});

test('sorted select-all exports exactly the visible records', async ({ page }) => {
  await page.goto('/components/app-grid');
  await page.getByRole('button', { name: 'ID', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Select all visible rows' }).check();
  const table = page.getByRole('table', { name: 'Playbook records table' });
  await expect(table.locator('tbody tr.is-selected')).toHaveCount(3);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export selected', exact: true }).click();
  const download = await downloadPromise;
  const csv = await fs.readFile(await download.path(), 'utf8');
  expect(csv).toContain('Office movement campaign');
  expect(csv).toContain('Respirator fitness follow-up');
  expect(csv).not.toContain('Annual hearing surveillance');
});

test('specimen edits data and confirms batch deletion without mutating on cancel', async ({ page }) => {
  await page.goto('/components/app-grid');
  await page.getByRole('checkbox', { name: 'Select row 1048', exact: true }).check();
  await page.getByRole('button', { name: 'Actions for Annual hearing surveillance', exact: true }).click();
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  const editor = page.getByRole('dialog', { name: 'Record editor' });
  await editor.getByRole('textbox', { name: 'Record name', exact: true }).fill('Edited assessment');
  await editor.getByRole('button', { name: 'Save record', exact: true }).click();
  await expect(page.getByRole('table', { name: 'Playbook records table' })).toContainText('Edited assessment');
  await page.getByRole('checkbox', { name: 'Select all visible rows' }).check();
  const toolbar = page.getByRole('toolbar', { name: 'Actions for selected rows' });
  await toolbar.getByRole('button', { name: 'Delete selected', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Delete selected records?' });
  await dialog.getByRole('button', { name: 'Keep records' }).click();
  await expect(page.getByText('6 matching records', { exact: true })).toBeVisible();
  await toolbar.getByRole('button', { name: 'Delete selected', exact: true }).click();
  await dialog.getByRole('button', { name: 'Delete selected', exact: true }).click();
  await expect(page.getByText('3 matching records', { exact: true })).toBeVisible();
  await expect(toolbar).not.toBeVisible();
  await expect(page.getByRole('table', { name: 'Playbook records table' })).not.toContainText('Edited assessment');
});

test('virtualized keyboard focus stays below the sticky header', async ({ page }) => {
  await page.goto('/grid-performance');
  const viewport = page.locator('.app-grid');
  await viewport.scrollIntoViewIfNeeded();
  await expect.poll(() => viewport.evaluate(element => element.scrollHeight)).toBeGreaterThan(5000);
  await viewport.evaluate(element => { element.scrollTop = 5000; });
  const checkboxes = viewport.locator('tbody input.app-grid__checkbox');
  await expect(checkboxes.first()).not.toHaveAttribute('aria-label', 'Select row 1');
  const focusedId = await viewport.evaluate(grid => {
    const headerBottom = grid.querySelector('th').getBoundingClientRect().bottom;
    const candidates = [...grid.querySelectorAll('tbody input.app-grid__checkbox')];
    const target = candidates.filter(input => input.getBoundingClientRect().top < headerBottom).at(-1);
    if (!target) throw new Error('Expected an overscan row above the visible window');
    target.focus();
    return target.getAttribute('aria-label');
  });
  const target = page.getByRole('checkbox', { name: focusedId, exact: true });
  await expect(target).toBeFocused();
  await expect.poll(() => target.evaluate(input => {
    const header = input.closest('table').querySelector('th').getBoundingClientRect();
    return input.getBoundingClientRect().top - header.bottom;
  })).toBeGreaterThanOrEqual(2);
});

test('deleting an unselected row names that row and preserves another selection', async ({ page }) => {
  await page.goto('/components/app-grid');
  await page.getByRole('checkbox', { name: 'Select row 1048', exact: true }).check();
  const trigger = page.getByRole('button', { name: 'Actions for North terminal ergonomics', exact: true });
  await trigger.click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Delete this record?', exact: true });
  await expect(dialog).toContainText('North terminal ergonomics');
  await expect(dialog).not.toContainText('Annual hearing surveillance');
  await dialog.getByRole('button', { name: 'Keep records' }).click();
  await expect(page.getByText('6 matching records', { exact: true })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Select row 1048', exact: true })).toBeChecked();
  await trigger.click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await dialog.getByRole('button', { name: 'Delete record', exact: true }).click();
  await expect(page.getByText('5 matching records', { exact: true })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Select row 1048', exact: true })).toBeChecked();
  await expect(page.getByRole('table', { name: 'Playbook records table' })).not.toContainText('North terminal ergonomics');
});
