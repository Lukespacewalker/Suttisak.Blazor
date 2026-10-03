import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';

const bootstrap = fs.readFileSync(path.resolve('../Suttisak.Blazor.UserInterface/wwwroot/js/theme-bootstrap.js'), 'utf8');
const storageKey = 'suttisak-blazor:theme-settings';

for (const savedMode of [undefined, 'dark', 'system']) {
  test(`Nexora light default honors ${savedMode ?? 'first visit'} through theme module hydration`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.addInitScript(({ savedMode, storageKey }) => {
      if (savedMode) localStorage.setItem(storageKey, JSON.stringify({ mode: savedMode, appearance: 'nexora' }));
    }, { savedMode, storageKey });
    await page.route('**/nexora-bootstrap-fixture', route => route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><html data-default-appearance="nexora" data-default-theme="light"><head><script>${bootstrap}</script></head><body>
        <button data-theme-preference="dark">Dark</button><button data-theme-preference="system">System</button>
        <script type="module">import { subscribeTheme } from '/_content/Suttisak.Blazor.UserInterface/Components/ThemeSwitcher.razor.js';
          subscribeTheme({ invokeMethodAsync(_, preference) { document.body.dataset.preference = preference; return Promise.resolve(); } });</script>
      </body></html>`
    }));
    await page.goto('/nexora-bootstrap-fixture');
    await expect(page.locator('html')).toHaveAttribute('data-appearance', 'nexora');
    await expect(page.locator('body')).toHaveAttribute('data-preference', savedMode ?? 'light');
    await expect(page.locator('html')).toHaveAttribute('data-theme', savedMode ? 'dark' : 'light');
    await page.getByRole('button', { name: 'System', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey)).toEqual({ mode: 'system', appearance: 'nexora' });
  });
}

for (const mode of ['light', 'dark']) {
  test(`Nexora ${mode} shell supports search, editor, mobile navigation and accessible emphasis`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/application-shell/records?appearance=nexora&mode=${mode}`);
    await expect(page.getByLabel('Appearance', { exact: true })).toHaveValue('nexora');
    await expect(page.locator('.playbook').first()).toHaveCSS('background-color', mode === 'light' ? 'rgb(247, 245, 240)' : 'rgb(23, 24, 26)');
    const action = page.getByRole('button', { name: 'New record', exact: true });
    await expect(action).toHaveCSS('background-image', /linear-gradient/);
    await page.getByRole('searchbox', { name: 'Search records', exact: true }).fill('Annual hearing');
    await expect(page.getByText('1 of 6 records', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Clear search', exact: true }).click();
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`nexora-shell-${mode}-desktop.png`) });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await action.click();
    await expect(page.getByRole('dialog', { name: 'Record editor' })).toBeVisible();
    const input = page.getByRole('textbox', { name: 'Record name', exact: true });
    await input.fill('Nexora preview');
    await expect(input.locator('..')).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Record editor' })).not.toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`nexora-shell-${mode}-mobile.png`) });
  });

  test(`Nexora ${mode} access places introduction left and prioritizes form on mobile`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/access/login?appearance=nexora&mode=${mode}`);
    await expect(page.getByLabel('Appearance', { exact: true })).toHaveValue('nexora');
    const card = page.locator('.access-page-layout__card');
    const showcase = page.locator('.access-page-layout__showcase');
    const form = await card.boundingBox();
    const story = await showcase.boundingBox();
    expect(story.x + story.width).toBeLessThanOrEqual(form.x);
    await page.getByLabel('Username', { exact: true }).fill('name@example.com');
    await page.getByLabel('Password', { exact: true }).fill('demonstration');
    const checkbox = page.getByRole('checkbox', { name: 'Keep me signed in', exact: true });
    await checkbox.focus();
    await checkbox.press('Space');
    await expect(checkbox).toBeChecked();
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
    await page.locator('.access-page-layout').screenshot({ path: testInfo.outputPath(`nexora-login-${mode}-desktop.png`) });
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      const mobileForm = await card.boundingBox();
      const mobileStory = await showcase.boundingBox();
      expect(mobileForm.y + mobileForm.height).toBeLessThanOrEqual(mobileStory.y);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
      await page.locator('.access-page-layout').screenshot({ path: testInfo.outputPath(`nexora-login-${mode}-${width}.png`) });
    }
  });
}

for (const mode of ['light', 'dark']) {
  test(`Nexora ${mode} photo split works with library assets in a constrained host`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/access/login?appearance=nexora&mode=${mode}`);
    const html = await page.locator('.access-page-layout').evaluate(el => {
      const copy = el.cloneNode(true);
      copy.querySelector('.access-page-layout__controls').remove();
      return copy.outerHTML;
    });
    await page.route('**/nexora-access-consumer', route => route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><html lang="en" data-theme="${mode}" data-appearance="nexora" style="color-scheme:${mode}"><head>
        <title>Example care workspace sign in</title><meta name="viewport" content="width=device-width,initial-scale=1">
        <link rel="stylesheet" href="/_content/Suttisak.Blazor.UserInterface/css/main.css">
        <link rel="stylesheet" href="/_content/Suttisak.Blazor.UserInterface/Suttisak.Blazor.UserInterface.bundle.scp.css">
        <link rel="stylesheet" href="/_content/Suttisak.Blazor.UserInterface/css/appearance.css">
        </head><body>${html}</body></html>`
    }));
    await page.goto('/nexora-access-consumer');
    const layout = page.locator('.access-page-layout');
    const image = layout.locator('picture img');
    await expect(image).toBeVisible();
    expect(await image.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
    const pictureBox = await image.boundingBox();
    const panelBox = await layout.locator('.access-page-layout__showcase').boundingBox();
    expect(pictureBox.width).toBeCloseTo(panelBox.width, 0);
    expect(pictureBox.height).toBeCloseTo(panelBox.height, 0);
    await layout.getByLabel('Username', { exact: true }).focus();
    await expect(layout.locator('.app-form-control__input-wrap:focus-within')).toHaveCSS('outline-style', 'solid');
    await layout.screenshot({ path: testInfo.outputPath(`nexora-consumer-${mode}-desktop.png`) });
    await layout.evaluate(el => { el.parentElement.style.width = '320px'; });
    const formBox = await layout.locator('.access-page-layout__card').boundingBox();
    const storyBox = await layout.locator('.access-page-layout__showcase').boundingBox();
    expect(formBox.y + formBox.height).toBeLessThanOrEqual(storyBox.y);
    expect(await layout.evaluate(el => el.scrollWidth)).toBeLessThanOrEqual(320);
    await layout.screenshot({ path: testInfo.outputPath(`nexora-consumer-${mode}-constrained.png`) });
  });
}

for (const mode of ['light', 'dark']) {
  test(`Nexora ${mode} reflects a host teal accent in primary, navigation, focus and selection`, async ({ page }) => {
    await page.goto(`/application-shell/records?appearance=nexora&mode=${mode}`);
    const scope = page.locator('.playbook').first();
    await expect(scope).toHaveAttribute('data-appearance', 'nexora');
    await scope.evaluate(el => {
      el.style.setProperty('--app-nexora-accent', 'light-dark(#176a65, #83cec5)');
      el.style.setProperty('--app-nexora-on-accent', 'light-dark(#ffffff, #132824)');
    });
    const accent = mode === 'light' ? 'rgb(23, 106, 101)' : 'rgb(131, 206, 197)';
    const action = page.getByRole('button', { name: 'New record', exact: true });
    await expect(action).toHaveCSS('border-color', accent);
    await expect(action).toHaveCSS('background-color', accent);
    await expect(action).toHaveCSS('color', mode === 'light' ? 'rgb(255, 255, 255)' : 'rgb(19, 40, 36)');
    await expect(page.locator('.app-shell .nav-item--active').first()).toHaveCSS('color', accent);
    await action.click();
    const input = page.getByRole('textbox', { name: 'Record name', exact: true });
    await input.focus();
    await expect(input.locator('..')).toHaveCSS('outline-color', accent);
    await page.keyboard.press('Escape');
    const selection = page.locator('.app-shell tbody .app-grid__checkbox').first();
    await selection.check();
    await expect(selection).toHaveCSS('accent-color', accent);
    await expect(page.locator('.app-shell tbody tr.is-selected').first()).toBeVisible();
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
  });
}

test('Nexora shared previews preserve query context and forced color focus', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.goto('/components/app-text-box?appearance=nexora&viewport=mobile&keep=example');
  await expect(page.getByLabel('Appearance', { exact: true })).toHaveValue('nexora');
  const preview = page.frameLocator('[data-testid="isolated-specimen-frame"]');
  await expect(preview.locator('.specimen-host')).toHaveAttribute('data-appearance', 'nexora');
  const input = preview.locator('input').first();
  await input.focus();
  await expect(input.locator('..')).toHaveCSS('outline-style', 'solid');
  await expect(input.locator('..')).toHaveCSS('outline-width', '2px');
  await page.getByLabel('Appearance', { exact: true }).selectOption('standard');
  await expect(preview.locator('.specimen-host')).toHaveAttribute('data-appearance', 'standard');
  expect(new URL(page.url()).searchParams.get('keep')).toBe('example');
});
