import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const route of ['/', '/components', '/components/app-card', '/patterns', '/foundations', '/guidelines', '/grid-performance', '/landing']) {
  test(`quiet luxury applies display typography to all headings on ${route}`, async ({ page }) => {
    await page.goto(`${route}?appearance=quiet-luxury`);
    if (route === '/grid-performance') {
      // This page initializes 100,000 records before mounting its shell.
      // Use the existing grid tests' startup budget; appearance checks stay at 5s.
      await expect(page.getByRole('table', { name: '100000 virtual records' })).toBeVisible({ timeout: 20_000 });
    }
    await expect(page.locator('.playbook').first()).toHaveAttribute('data-appearance', 'quiet-luxury');
    const headings = page.locator('.playbook :is(h1, h2, h3, h4, h5, h6, [role="heading"], .app-heading)');
    await expect(headings.first()).toBeVisible();
    const fonts = await headings.evaluateAll(elements => elements.map(el => getComputedStyle(el).fontFamily));
    for (const font of fonts) {
      expect(font).toContain('Georgia');
      expect(font).not.toContain('Figtree');
    }
  });
}

test('heading typography switches in both the reference page and isolated preview while controls keep body typography', async ({ page }) => {
  await page.goto('/components/app-button?appearance=standard&viewport=mobile');
  const heading = page.locator('.component-detail__hero h1');
  const appearance = page.getByLabel('Appearance', { exact: true });
  const previewHeading = page.frameLocator('[data-testid="isolated-specimen-frame"]').locator('h2').first();
  await expect(heading).toHaveCSS('font-family', /Figtree/);
  await expect(previewHeading).toHaveCSS('font-family', /Figtree/);
  const bodyFont = await appearance.evaluate(el => getComputedStyle(el).fontFamily);

  await appearance.selectOption('quiet-luxury');
  await expect(heading).toHaveCSS('font-family', /Georgia/);
  await expect(previewHeading).toHaveCSS('font-family', /Georgia/);
  await expect(appearance).toHaveCSS('font-family', bodyFont);

  await appearance.selectOption('standard');
  await expect(heading).toHaveCSS('font-family', /Figtree/);
  await expect(previewHeading).toHaveCSS('font-family', /Figtree/);
});

test('appearance can be shared, changed, and carried into isolated component previews', async ({ page }) => {
  await page.goto('/components/app-button?appearance=quiet-luxury&theme=mentalinsight&viewport=mobile&keep=example');
  await expect(page.getByLabel('Appearance', { exact: true })).toHaveValue('quiet-luxury');
  const frame = page.getByTestId('isolated-specimen-frame');
  await expect(frame).toHaveAttribute('src', /appearance=quiet-luxury/);
  await expect(page.frameLocator('[data-testid="isolated-specimen-frame"]').locator('.specimen-host'))
    .toHaveAttribute('data-appearance', 'quiet-luxury');

  await page.getByLabel('Appearance', { exact: true }).selectOption('standard');
  await expect.poll(() => new URL(page.url()).searchParams.get('appearance')).toBe('standard');
  expect(new URL(page.url()).searchParams.get('keep')).toBe('example');
  await expect(frame).toHaveAttribute('src', /appearance=standard/);
  await expect(page.getByLabel('Application', { exact: true })).toHaveValue('mentalinsight');
  await page.reload();
  await expect(page.getByLabel('Appearance', { exact: true })).toHaveValue('standard');

  await page.goto('/components/app-button?appearance=unknown');
  await expect(page.getByLabel('Appearance', { exact: true })).toHaveValue('standard');
});

for (const mode of ['light', 'dark']) {
  test(`quiet luxury ${mode} stays readable and usable at desktop and mobile widths`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/application-shell/records?appearance=quiet-luxury&mode=${mode}`);
    await expect(page.getByLabel('Appearance', { exact: true })).toHaveValue('quiet-luxury');
    await expect(page.locator('.playbook').first()).toHaveCSS('background-color', mode === 'light' ? 'rgb(245, 242, 235)' : 'rgb(28, 27, 24)');
    await page.getByLabel('Appearance', { exact: true }).focus();
    await expect(page.getByLabel('Appearance', { exact: true })).toBeFocused();
    expect(await page.getByLabel('Appearance', { exact: true }).evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');

    const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(accessibility.violations).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`quiet-luxury-${mode}-desktop.png`) });

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByLabel('Appearance', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const mobileAccessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(mobileAccessibility.violations).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`quiet-luxury-${mode}-mobile.png`) });
    await page.getByLabel('Appearance', { exact: true }).selectOption('standard');
    await expect(page.locator('.playbook').first()).toHaveAttribute('data-appearance', 'standard');
  });
}

test('quiet luxury respects system color mode and reduced motion', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('/?appearance=quiet-luxury&mode=auto');
  await expect(page.locator('.playbook')).toHaveCSS('background-color', 'rgb(28, 27, 24)');
  const duration = await page.locator('.playbook').evaluate(el => parseFloat(getComputedStyle(el).transitionDuration));
  expect(duration).toBeLessThanOrEqual(0.00001);
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await expect(page.locator('.playbook')).toHaveCSS('background-color', 'rgb(245, 242, 235)');
  await page.screenshot({ path: testInfo.outputPath('quiet-luxury-home.png') });
});
