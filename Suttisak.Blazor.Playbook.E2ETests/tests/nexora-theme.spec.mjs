import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';

const bootstrap = fs.readFileSync(path.resolve('../Suttisak.Blazor.UserInterface/wwwroot/js/theme-bootstrap.js'), 'utf8');
const storageKey = 'suttisak-blazor:theme-settings';

for (const mode of ['light', 'dark']) {
  test(`Nexora ${mode} signed-out shell access keeps readable hover and keyboard focus`, async ({ page }) => {
    await page.goto(`/specimens/profile-menu?appearance=nexora&mode=${mode}`);
    const login = page.locator('.shell-profile-login');
    await login.hover();
    await expect(login).toHaveCSS('color', mode === 'light' ? 'rgb(255, 253, 248)' : 'rgb(36, 30, 22)');
    await page.mouse.move(0, 0);
    await page.keyboard.press('Tab');
    await login.focus();
    await expect(login).toBeFocused();
    await expect(login).toHaveCSS('outline-style', 'solid');
  });

  test(`Nexora ${mode} shared footer and legacy backgrounds use semantic surfaces`, async ({ page }) => {
    await page.goto(`/specimens/company-footer?appearance=nexora&mode=${mode}`);
    const footer = page.locator('.company-footer');
    await expect(footer).toHaveCSS('color', mode === 'light' ? 'rgb(104, 99, 92)' : 'rgb(190, 185, 175)');
    await expect(page.locator('.hero.background')).toHaveCSS('background-image', 'none');
    await expect(page.locator('.hero.background')).toHaveCSS('background-color', mode === 'light' ? 'rgb(242, 239, 233)' : 'rgb(44, 45, 47)');
    await page.goto('/layout-patterns/header-footer');
    await expect(page.locator('.header-footer-content')).toHaveCSS('background-image', 'none');
  });
}

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
    const menu = page.locator('.app-shell__menu-button--mobile');
    await menu.click();
    await expect(page.locator('.app-shell__navigation')).toHaveClass(/is-open/);
    await expect(page.locator('.app-shell__navigation')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
    const navigation = await page.locator('.app-shell__navigation').boundingBox();
    expect(navigation.x).toBeGreaterThanOrEqual(0);
    expect(navigation.x + navigation.width).toBeLessThanOrEqual(390);
    await page.screenshot({ path: testInfo.outputPath(`nexora-shell-${mode}-mobile-navigation.png`) });
    await menu.click();
    await expect(page.locator('.app-shell__navigation')).not.toHaveClass(/is-open/);
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

for (const mode of ['light', 'dark']) {
  for (const kind of ['checkbox', 'radio']) {
    test(`Nexora ${mode} unchecked ${kind} has a visible boundary and keeps keyboard selection`, async ({ page }, testInfo) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/components/app-${kind === 'checkbox' ? 'checkbox' : 'radio-group'}?appearance=nexora&mode=${mode}`);
      const preview = page.locator('.component-detail__preview-frame').first();
      const input = kind === 'checkbox' ? preview.getByRole('checkbox') : preview.getByRole('radio', { name: 'Phone', exact: true });
      if (kind === 'checkbox') {
        await input.focus();
        await input.press('Space');
      }
      await expect(input).not.toBeChecked();
      const control = input.locator('+ .app-choice__control');
      await expect(control).toHaveCSS('background-color', mode === 'light' ? 'rgb(247, 245, 240)' : 'rgb(23, 24, 26)');
      const readContrast = () => control.evaluate(el => {
        const luminance = color => {
          const channels = color.match(/[\d.]+/g).slice(0, 3).map(value => Number(value) / 255)
            .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
          return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
        };
        const style = getComputedStyle(el);
        const border = luminance(style.borderTopColor);
        const ratio = background => {
          const adjacent = luminance(background);
          return (Math.max(border, adjacent) + .05) / (Math.min(border, adjacent) + .05);
        };
        return { fill: ratio(style.backgroundColor), card: ratio(getComputedStyle(el.closest('.app-choice')).backgroundColor) };
      });
      const contrast = await readContrast();
      expect(contrast.fill, 'unchecked boundary against its inner fill').toBeGreaterThanOrEqual(3);
      expect(contrast.card, 'unchecked boundary against its surrounding choice card').toBeGreaterThanOrEqual(3);
      await input.locator('..').hover();
      await expect(input.locator('..')).toHaveCSS('background-color', mode === 'light' ? 'rgb(238, 233, 225)' : 'rgb(54, 55, 57)');
      const hovered = await readContrast();
      expect(hovered.fill, 'hovered unchecked boundary against its inner fill').toBeGreaterThanOrEqual(3);
      expect(hovered.card, 'hovered unchecked boundary against its surrounding choice card').toBeGreaterThanOrEqual(3);
      await testInfo.attach('choice-boundary-contrast', { body: JSON.stringify({ neutral: contrast, hovered }), contentType: 'application/json' });
      await preview.screenshot({ path: testInfo.outputPath(`nexora-${kind}-${mode}-unchecked.png`) });
      // A host's scoped validation rule must retain its semantic error border.
      await page.addStyleTag({ content: '.host-choice-error[data-consent] .app-choice__control { border-color: var(--app-danger); }' });
      await input.evaluate(el => {
        el.setAttribute('aria-invalid', 'true');
        el.parentElement.classList.add('host-choice-error');
        el.parentElement.dataset.consent = '';
      });
      await expect(control).toHaveCSS('border-color', mode === 'light' ? 'rgb(180, 35, 24)' : 'rgb(255, 139, 131)');
      await input.evaluate(el => {
        el.setAttribute('aria-invalid', 'false');
        el.parentElement.classList.remove('host-choice-error');
      });
      await input.focus();
      await input.press('Space');
      await expect(input).toBeChecked();
      await expect(control).toHaveCSS('border-color', mode === 'light' ? 'rgb(139, 100, 41)' : 'rgb(214, 184, 124)');
      await expect(input.locator('..')).toHaveCSS('outline-width', '2px');
    });
  }

  test(`Nexora ${mode} required fields stay neutral until invalid interaction and preserve explicit errors`, async ({ page }) => {
    await page.goto(`/access/login?appearance=nexora&mode=${mode}`);
    const html = await page.locator('.access-page-layout').evaluate(el => {
      const copy = el.cloneNode(true);
      copy.querySelector('.access-page-layout__controls').remove();
      copy.querySelectorAll('.access-form input.app-form-control__input').forEach(input => input.required = true);
      return copy.outerHTML;
    });
    await page.route('**/nexora-required-consumer', route => route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><html lang="en" data-theme="${mode}" data-appearance="nexora"><head>
        <title>Required account fields</title><meta name="viewport" content="width=device-width,initial-scale=1">
        <link rel="stylesheet" href="/_content/Suttisak.Blazor.UserInterface/css/main.css">
        <link rel="stylesheet" href="/_content/Suttisak.Blazor.UserInterface/Suttisak.Blazor.UserInterface.bundle.scp.css">
        <link rel="stylesheet" href="/_content/Suttisak.Blazor.UserInterface/css/appearance.css">
        </head><body>${html}</body></html>`
    }));
    await page.goto('/nexora-required-consumer');
    const username = page.getByLabel('Username', { exact: true });
    const password = page.getByLabel('Password', { exact: true });
    expect(await username.evaluate(el => el.matches(':invalid') && !el.matches(':user-invalid'))).toBe(true);
    for (const input of [username, password]) {
      await expect(input.locator('..')).toHaveCSS('background-color', mode === 'light' ? 'rgb(255, 255, 255)' : 'rgb(35, 36, 38)');
      await expect(input.locator('..')).toHaveCSS('border-color', mode === 'light' ? 'rgb(148, 139, 125)' : 'rgb(136, 131, 121)');
      await expect(input.locator('..')).toHaveCSS('box-shadow', 'none');
    }
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    expect(await username.evaluate(el => el.matches(':user-invalid'))).toBe(true);
    await expect(username).toBeFocused();
    const danger = mode === 'light' ? 'rgb(180, 35, 24)' : 'rgb(255, 139, 131)';
    await expect(username.locator('..')).toHaveCSS('border-color', danger);
    await expect(username.locator('..')).toHaveCSS('outline-color', danger);
    await expect(username.locator('..')).toHaveCSS('outline-width', '2px');
    await password.fill('valid native value');
    await password.evaluate(el => el.closest('.app-form-control').classList.add('has-error'));
    expect(await password.evaluate(el => el.validity.valid)).toBe(true);
    await expect(password.locator('..')).toHaveCSS('border-color', danger);
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

for (const mode of ['light', 'dark']) {
  test(`Nexora ${mode} placeholder remains readable on the actual input surface`, async ({ page }, testInfo) => {
    await page.goto(`/components/app-text-box?appearance=nexora&mode=${mode}`);
    const preview = page.locator('.component-detail__preview-frame').first();
    const input = preview.getByRole('textbox');
    await input.fill('');
    await expect(input).toHaveAttribute('placeholder', 'Enter a name');
    const contrast = await input.evaluate(el => {
      const luminance = color => {
        const channels = color.match(/[\d.]+/g).slice(0, 3).map(value => Number(value) / 255)
          .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
        return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
      };
      const placeholder = getComputedStyle(el, '::placeholder');
      const text = luminance(placeholder.color);
      const surface = luminance(getComputedStyle(el.closest('.app-form-control__input-wrap')).backgroundColor);
      return { color: placeholder.color, opacity: placeholder.opacity, ratio: (Math.max(text, surface) + .05) / (Math.min(text, surface) + .05) };
    });
    expect(contrast.opacity).toBe('1');
    expect(contrast.ratio, 'placeholder text against its input background').toBeGreaterThanOrEqual(4.5);
    await testInfo.attach('placeholder-contrast', { body: JSON.stringify(contrast), contentType: 'application/json' });
  });
}
