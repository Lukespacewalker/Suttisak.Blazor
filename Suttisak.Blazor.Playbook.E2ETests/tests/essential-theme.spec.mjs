import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const mode of ['light', 'dark']) {
  test(`essential ${mode} keeps records readable and preserves application identity`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/application-shell/records?appearance=essential&mode=${mode}`);
    await expect(page.getByLabel('Appearance', { exact: true })).toHaveValue('essential');
    const shell = page.locator('.playbook').first();
    await expect(shell).toHaveCSS('background-color', mode === 'light' ? 'rgb(245, 246, 248)' : 'rgb(20, 23, 27)');
    const brands = {
      audiogramiq: ['rgb(8, 119, 125)', 'rgb(76, 215, 212)'],
      bafsworkout: ['rgb(81, 57, 138)', 'rgb(178, 162, 239)'],
      coekpi: ['rgb(11, 95, 172)', 'rgb(105, 186, 255)'],
      ergotrack: ['rgb(73, 53, 143)', 'rgb(177, 161, 242)'],
      mentalinsight: ['rgb(179, 34, 85)', 'rgb(255, 120, 152)'],
      healthinsight: ['rgb(8, 105, 181)', 'rgb(96, 189, 255)']
    };
    for (const [theme, colors] of Object.entries(brands)) {
      await page.getByLabel('Application', { exact: true }).selectOption(theme);
      await expect(shell).toHaveClass(new RegExp(`theme-${theme}`));
      const button = page.getByRole('button', { name: 'New record', exact: true });
      await expect(button).toHaveCSS('background-color', colors[mode === 'light' ? 0 : 1]);
    }
    await page.getByLabel('Application', { exact: true }).selectOption('audiogramiq');
    await page.getByRole('searchbox', { name: 'Search records', exact: true }).fill('Annual hearing');
    await expect(page.getByText('1 of 6 records', { exact: true })).toBeVisible();
    await expect(page.locator('.demo-data-search')).toHaveCSS('outline-style', 'solid');
    await page.getByRole('button', { name: 'Clear search', exact: true }).click();
    await expect(page.getByText('6 records', { exact: true })).toBeVisible();
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`essential-${mode}-desktop.png`) });

    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'New record', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Record editor' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Record name', exact: true }).fill('Essential preview');
    await expect(page.getByRole('textbox', { name: 'Record name', exact: true })).toBeFocused();
    await expect(page.locator('.app-form-control__input-wrap:focus-within')).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Record editor' })).not.toBeVisible();
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`essential-${mode}-mobile.png`) });
  });
}

test('essential follows shared links and isolated calendar previews and can switch back', async ({ page }, testInfo) => {
  await page.goto('/components/app-calendar-picker?appearance=essential&viewport=mobile&keep=example');
  await expect(page.getByLabel('Appearance', { exact: true })).toHaveValue('essential');
  const preview = page.frameLocator('[data-testid="isolated-specimen-frame"]');
  await expect(preview.locator('.specimen-host')).toHaveAttribute('data-appearance', 'essential');
  const date = preview.getByLabel('Appointment date');
  await date.fill('2026-10-20');
  await expect(preview.getByRole('status').filter({ hasText: 'Date: 2026-10-20' })).toBeVisible();
  await preview.getByRole('button', { name: 'Open calendar' }).click();
  await expect(preview.getByRole('dialog', { name: 'Calendar', exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('essential-calendar.png') });
  await page.keyboard.press('Escape');
  await expect(preview.getByRole('dialog', { name: 'Calendar', exact: true })).not.toBeVisible();
  await page.getByLabel('Appearance', { exact: true }).selectOption('quiet-luxury');
  await expect(preview.locator('.specimen-host')).toHaveAttribute('data-appearance', 'quiet-luxury');
  expect(new URL(page.url()).searchParams.get('keep')).toBe('example');
  await page.getByLabel('Appearance', { exact: true }).selectOption('essential');
  await page.reload();
  await expect(page.getByLabel('Appearance', { exact: true })).toHaveValue('essential');
});

test('essential respects system color mode and reduced motion', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('/?appearance=essential&mode=auto');
  await expect(page.locator('.playbook')).toHaveCSS('background-color', 'rgb(20, 23, 27)');
  const duration = await page.locator('.playbook').evaluate(el => parseFloat(getComputedStyle(el).transitionDuration));
  expect(duration).toBeLessThanOrEqual(0.00001);
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await expect(page.locator('.playbook')).toHaveCSS('background-color', 'rgb(245, 246, 248)');
});
