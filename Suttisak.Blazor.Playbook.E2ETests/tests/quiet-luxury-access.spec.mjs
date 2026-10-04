import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function settledStyles(locator, keys) {
  // Theme hydration and focus can start a shared CSS transition. Compare the
  // final presentation, rather than unrelated intermediate animation frames.
  await expect.poll(() => locator.evaluate(el => el.getAnimations()
    .filter(animation => animation.playState === 'running').length)).toBe(0);
  return locator.evaluate((el, keys) => Object.fromEntries(keys.map(key => [key, getComputedStyle(el)[key]])), keys);
}

for (const theme of ['mentalinsight', 'healthinsight', 'audiogramiq']) {
  for (const mode of ['light', 'dark']) {
    test(`quiet luxury access keeps the form primary and the introduction compact for ${theme}/${mode}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(`/access/login?appearance=quiet-luxury&theme=${theme}&mode=${mode}`);
      const layout = page.locator('.access-page-layout');
      const heading = layout.locator('.access-page-layout__heading h1');
      const introduction = layout.locator('.access-page-layout__showcase');
      await expect(heading).toHaveCSS('font-family', /Georgia/);
      expect(await heading.evaluate(el => Number(getComputedStyle(el).fontWeight))).toBeLessThanOrEqual(500);
      const formBox = await layout.locator('.access-page-layout__card').boundingBox();
      const infoBox = await introduction.boundingBox();
      expect(formBox.width).toBeGreaterThan(infoBox.width);
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);

      const previewInput = layout.getByLabel('Username', { exact: true });
      await previewInput.focus();
      const inputProperties = ['paddingInlineStart', 'paddingInlineEnd', 'borderTopWidth', 'backgroundColor', 'fontFamily', 'fontSize', 'fontWeight', 'outlineStyle'];
      const previewStyles = await settledStyles(previewInput, inputProperties);
      const inputMarkup = await previewInput.evaluate(el => el.closest('.app-form-control').outerHTML);
      const buttonProperties = ['fontFamily', 'fontSize', 'fontWeight', 'borderRadius', 'backgroundColor', 'boxShadow', 'paddingInlineStart', 'paddingBlockStart'];
      const previewButtonStyles = await settledStyles(layout.getByRole('button', { name: 'Sign in', exact: true }), buttonProperties);

      // A consumer fixture deliberately loads only published library assets.
      // The same presentation must work without Playbook CSS or application code.
      const vars = await layout.evaluate(el => ['--app-quiet-brand', '--app-quiet-brand-soft', '--app-quiet-brand-border']
        .map(key => [key, getComputedStyle(el).getPropertyValue(key)]));
      // IdentityLayout composes genuine shared inputs/buttons/preferences;
      // the access pattern also has app-owned provider/language demonstrations.
      await page.goto('/layout-patterns/identity');
      const html = await page.locator('.access-page-layout').evaluate((el, inputMarkup) => {
        const copy = el.cloneNode(true);
        copy.querySelector('.layout-contract-form__row .app-form-control').outerHTML = inputMarkup;
        return copy.outerHTML;
      }, inputMarkup);
      const fixture = { html, vars };
      await page.route('**/quiet-access-consumer', route => route.fulfill({
        contentType: 'text/html',
        body: `<!doctype html><html lang="en" data-appearance="quiet-luxury" style="color-scheme:${mode};${fixture.vars.map(([key, value]) => `${key}:${value}`).join(';')}">
          <head><title>Example care workspace sign in</title><meta name="viewport" content="width=device-width,initial-scale=1">
          <link rel="stylesheet" href="/_content/Suttisak.Blazor.UserInterface/css/main.css">
          <link rel="stylesheet" href="/_content/Suttisak.Blazor.UserInterface/Suttisak.Blazor.UserInterface.bundle.scp.css">
          <link rel="stylesheet" href="/_content/Suttisak.Blazor.UserInterface/css/appearance.css"></head>
          <body>${fixture.html}</body></html>`
      }));
      await page.goto('/quiet-access-consumer');
      const consumer = page.locator('.access-page-layout');
      const input = consumer.getByLabel('Username', { exact: true });
      await input.focus();
      const consumerStyles = await settledStyles(input, inputProperties);
      expect(previewStyles, 'Playbook must not repaint the shared icon input').toEqual(consumerStyles);
      const consumerButtonStyles = await settledStyles(consumer.getByRole('button', { name: 'Continue', exact: true }), buttonProperties);
      expect(previewButtonStyles, 'Playbook must not repaint the shared primary action').toEqual(consumerButtonStyles);
      const wrap = input.locator('..');
      await expect(wrap).toHaveCSS('outline-style', 'solid');
      await expect(wrap).toHaveCSS('outline-width', '2px');
      await expect(wrap).toHaveCSS('box-shadow', 'none');

      for (const width of [390, 320]) {
        await page.setViewportSize({ width, height: 844 });
        const intro = await consumer.locator('.access-page-layout__showcase').boundingBox();
        const field = await input.boundingBox();
        expect(intro.y + intro.height).toBeLessThanOrEqual(field.y);
        expect(intro.height).toBeLessThan(240);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
        const checkbox = consumer.getByRole('checkbox', { name: 'Keep this demonstration signed in', exact: true });
        await checkbox.focus();
        await checkbox.press('Space');
        await expect(checkbox).toHaveJSProperty('checked', width === 390);
        expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
      }
    });
  }
}

test('quiet luxury form focus remains visible in forced colors and reduced motion', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.goto('/form-controls?appearance=quiet-luxury&mode=light');
  const input = page.getByLabel('Display name', { exact: true });
  await input.focus();
  await expect(input.locator('..')).toHaveCSS('outline-style', 'solid');
  await expect(input.locator('..')).toHaveCSS('outline-width', '2px');
  await expect(input.locator('..')).toHaveCSS('box-shadow', 'none');
  const duration = await input.locator('..').evaluate(el => parseFloat(getComputedStyle(el).transitionDuration));
  expect(duration).toBeLessThanOrEqual(0.00001);
});

test('a constrained library-only introduction wraps unbroken organization text without clipping it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/layout-patterns/identity');
  const html = await page.locator('.access-page-layout').evaluate(el => el.outerHTML);
  await page.route('**/constrained-access-consumer', route => route.fulfill({
    contentType: 'text/html',
    body: `<!doctype html><html lang="en" data-appearance="quiet-luxury"><head><title>Example organization sign in</title>
      <link rel="stylesheet" href="/_content/Suttisak.Blazor.UserInterface/css/main.css">
      <link rel="stylesheet" href="/_content/Suttisak.Blazor.UserInterface/Suttisak.Blazor.UserInterface.bundle.scp.css">
      <link rel="stylesheet" href="/_content/Suttisak.Blazor.UserInterface/css/appearance.css"></head>
      <body><div style="width:320px;max-width:100%">${html}</div></body></html>`
  }));
  await page.goto('/constrained-access-consumer');
  const organization = page.locator('.identity-showcase-status > span');
  await organization.evaluate(el => el.textContent = 'OrganizationNameWithLongUnbrokenTextForNarrowLayouts');
  const content = await page.locator('.access-page-layout__showcase-content').boundingBox();
  const text = await organization.boundingBox();
  expect(text.x + text.width).toBeLessThanOrEqual(content.x + content.width);
  const introduction = await page.locator('.access-page-layout__showcase').boundingBox();
  const field = await page.getByLabel('Work email', { exact: true }).boundingBox();
  expect(introduction.y + introduction.height).toBeLessThanOrEqual(field.y);
});
