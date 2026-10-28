import { expect, test } from '@playwright/test';
import { setCheckbox } from '../helpers/set-checkbox.mjs';

// Exercise the library's public CSS contracts without Playbook's own overrides.
async function openCssConsumer(page, { appearance = 'standard', mode = 'light', body }) {
  await page.route('**/component-css-consumer', route => route.fulfill({
    contentType: 'text/html',
    body: `<!doctype html><html lang="en" data-theme="${mode}" data-appearance="${appearance}" style="color-scheme:${mode}"><head>
      <title>Shared CSS consumer</title><meta name="viewport" content="width=device-width,initial-scale=1">
      <link rel="stylesheet" href="/_content/Suttisak.Blazor.UserInterface/css/main.css">
      <link rel="stylesheet" href="/_content/Suttisak.Blazor.UserInterface/Suttisak.Blazor.UserInterface.bundle.scp.css">
      <link rel="stylesheet" href="/_content/Suttisak.Blazor.UserInterface/css/appearance.css">
      </head><body>${body}</body></html>`
  }));
  await page.goto('/component-css-consumer');
}

for (const appearance of ['nexora', 'quiet-luxury']) {
  for (const mode of ['light', 'dark']) {
    for (const error of ['native', 'has-error', 'aria-invalid']) {
      test(`${appearance} ${mode} ${error} error outranks a stale modified-valid state`, async ({ page }) => {
        await page.setViewportSize({ width: mode === 'light' ? 1440 : 320, height: 900 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await openCssConsumer(page, {
          appearance, mode,
          body: `<form><div class="app-form-control"><label for="email" class="app-form-control__label">Email</label>
            <div class="app-form-control__input-wrap"><input id="email" type="email" required class="app-form-control__input modified valid" value="ada@example.com"></div>
            </div><button type="submit">Save</button></form>`
        });
        const input = page.getByRole('textbox', { name: 'Email', exact: true });
        const wrap = input.locator('..');
        await expect(wrap).toHaveCSS('border-color', mode === 'light' ? 'rgb(16, 124, 16)' : 'rgb(84, 199, 84)');

        if (error === 'native') {
          await input.fill('not-an-email');
          await page.getByRole('button', { name: 'Save', exact: true }).click();
          expect(await input.evaluate(el => el.matches(':invalid') && el.matches(':user-invalid'))).toBe(true);
        } else if (error === 'has-error') {
          await input.evaluate(el => el.closest('.app-form-control').classList.add('has-error'));
        } else {
          await input.evaluate(el => el.setAttribute('aria-invalid', 'true'));
        }

        await expect(wrap).toHaveCSS('border-color', mode === 'light' ? 'rgb(180, 35, 24)' : 'rgb(255, 139, 131)');
        await expect(wrap).toHaveCSS('background-color', mode === 'light' ? 'rgb(255, 240, 239)' : 'rgb(66, 28, 26)');
        await input.focus();
        await expect(wrap).toHaveCSS('outline-width', '2px');
      });
    }
  }
}

for (const mode of ['light', 'dark']) {
  test(`Nexora ${mode} leaves untouched required fields neutral`, async ({ page }) => {
    await openCssConsumer(page, {
      appearance: 'nexora', mode,
      body: `<div class="app-form-control"><label for="required">Required name</label>
        <div class="app-form-control__input-wrap"><input id="required" required class="app-form-control__input"></div></div>`
    });
    const input = page.getByRole('textbox', { name: 'Required name' });
    expect(await input.evaluate(el => el.matches(':invalid') && !el.matches(':user-invalid'))).toBe(true);
    await expect(input.locator('..')).toHaveCSS('border-color', mode === 'light' ? 'rgb(148, 139, 125)' : 'rgb(136, 131, 121)');
    await expect(input.locator('..')).toHaveCSS('background-color', mode === 'light' ? 'rgb(255, 255, 255)' : 'rgb(35, 36, 38)');
    await expect(input.locator('..')).toHaveCSS('box-shadow', 'none');
  });

  test(`Nexora ${mode} preserves ExperienceCard elevation in desktop and constrained previews`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/components/experience-card?appearance=nexora&mode=${mode}`);
    const card = page.getByTestId('experience-card');
    const elevated = page.getByRole('checkbox', { name: 'Elevated card', exact: true });
    for (const width of [1440, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.mouse.move(0, 0);
      await setCheckbox(elevated, false);
      const flatShadow = await card.evaluate(el => getComputedStyle(el).boxShadow);
      await setCheckbox(elevated, true);
      await expect.poll(() => card.evaluate(el => getComputedStyle(el).boxShadow)).not.toBe(flatShadow);
      expect(await card.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      await setCheckbox(page.getByRole('checkbox', { name: 'Interactive treatment', exact: true }), true);
      await card.hover();
      await expect(card).toHaveCSS('transform', 'none');
      await setCheckbox(page.getByRole('checkbox', { name: 'Interactive treatment', exact: true }), false);
    }
  });

  test(`CardMenu ${mode} honors host padding while retaining focus and activation`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/specimens/card-menu?appearance=nexora&mode=${mode}`);
    const menu = page.getByRole('button', { name: 'Open participant settings', exact: true });
    // CardMenu.Style is emitted as this inline style attribute.
    await menu.evaluate(el => el.style.padding = '28px 36px');
    for (const width of [1440, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect(menu).toHaveCSS('padding-top', '28px');
      await expect(menu).toHaveCSS('padding-inline-start', '36px');
      expect(await menu.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    }
    await menu.focus();
    await expect(menu).toHaveCSS('outline-width', '2px');
    await menu.press('Enter');
    await expect(page.getByTestId('layout-status')).toHaveText('Participant settings selected.');
  });
}

const pageBody = style => `<main class="app-page" style="${style}"><header class="app-page__intro"><h1>Page title</h1></header><div class="app-page__body">Page content</div></main>`;

async function expectPageInsets(page, { top, bottom, inline }) {
  const container = page.locator('.app-page');
  await expect(container).toHaveCSS('padding-top', `${top}px`);
  await expect(container).toHaveCSS('padding-bottom', `${bottom}px`);
  await expect(container).toHaveCSS('padding-left', `${inline}px`);
  await expect(container).toHaveCSS('padding-right', `${inline}px`);
  const edges = await container.evaluate(el => {
    const page = el.getBoundingClientRect();
    const intro = el.querySelector('.app-page__intro').getBoundingClientRect();
    const style = getComputedStyle(el);
    return {
      top: intro.top - page.top - parseFloat(style.borderTopWidth),
      left: intro.left - page.left - parseFloat(style.borderLeftWidth),
      right: page.right - intro.right - parseFloat(style.borderRightWidth)
    };
  });
  for (const edge of Object.values(edges)) expect(Math.abs(edge)).toBeLessThanOrEqual(1);
}

for (const width of [1440, 320]) {
  test(`legacy page intro reaches the page edges with independent logical insets at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openCssConsumer(page, { body: pageBody('') });
    await expectPageInsets(page, { top: 12, bottom: width === 320 ? 16 : 24, inline: width === 320 ? 12 : 24 });
  });
}

test('legacy page accepts scalar and two-value host block padding with a custom intro start', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openCssConsumer(page, { body: pageBody('--app-page-padding-block:2rem 3rem;--app-page-padding-block-start:2rem;--app-page-padding-inline:1.25rem') });
  await expectPageInsets(page, { top: 32, bottom: 48, inline: 20 });
  await page.locator('.app-page').evaluate(el => el.style.setProperty('--app-page-padding-block', '2rem'));
  await expectPageInsets(page, { top: 32, bottom: 32, inline: 20 });
});
