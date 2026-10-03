import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function headingHost(page, { mode = 'light', appearance = 'nexora', visual = false, width = 390, constrained = false, accent = false, kind = 'experience' } = {}) {
  await page.setViewportSize({ width, height: 844 });
  await page.goto(`/specimens/${kind}-heading?appearance=${appearance}&mode=${mode}`);
  if (kind === 'experience') {
    await expect(page.getByTestId('experience-visual')).toBeVisible();
    if (!visual) await page.getByLabel('Include visual', { exact: true }).uncheck();
  }
  const heading = await page.locator(`.${kind}-heading`).evaluate(element => {
    const copy = element.cloneNode(true);
    // A static consumer starts in SSR fallback, not the previous viewport's
    // completed ResizeObserver state from the interactive Playbook specimen.
    copy.querySelectorAll('[data-adaptive-overflow]').forEach(toolbar => {
      toolbar.removeAttribute('data-overflow-ready');
      toolbar.removeAttribute('data-overflowing');
    });
    return copy.outerHTML;
  });
  const task = await page.getByRole('button', { name: kind === 'experience' ? 'Open result details' : 'Save assessment', exact: true }).evaluate(element => {
    const copy = element.cloneNode(true);
    if (element.textContent.trim() === 'Save assessment') copy.querySelector('.app-button__label').textContent = 'Continue task';
    return copy.outerHTML;
  });
  await page.route('**/heading-consumer', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html>
    <html lang="en" data-appearance="${appearance}" data-theme="${mode}" style="color-scheme:${mode}">
    <head><meta charset="utf-8"><title>Example result workspace</title><meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" href="/_content/Suttisak.Blazor.UserInterface/css/main.css">
    <link rel="stylesheet" href="/_content/Suttisak.Blazor.UserInterface/Suttisak.Blazor.UserInterface.bundle.scp.css">
    <link rel="stylesheet" href="/_content/Suttisak.Blazor.UserInterface/css/appearance.css">
    <style>body{margin:0}main{box-sizing:border-box;width:${constrained ? '320px' : 'min(64rem,100%)'};padding:1rem;margin:auto;display:grid;gap:1rem}section{padding:1rem;border:1px solid var(--app-border);border-radius:var(--app-radius-lg);background:var(--app-surface)}h2{margin:0 0 .5rem}section p{margin:.5rem 0 1rem}${accent ? ':root{--app-nexora-accent:light-dark(#176a65,#83cec5);--app-nexora-on-accent:light-dark(#fff,#132824);--app-font-heading:Sarabun,serif}' : ''}</style>
    </head><body><main>${heading}<section aria-labelledby="task-title"><h2 id="task-title">Result details</h2><p>Read the current result and its next steps.</p>${task}</section></main></body></html>` }));
  await page.goto('/heading-consumer');
  await page.locator(`.${kind}-heading`).evaluate(element => Promise.all(element.getAnimations({ subtree: true }).filter(animation => animation.effect.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))));
}

for (const mode of ['light', 'dark']) {
  test(`Nexora ${mode} PageHeading stays unframed above the first-viewport task`, async ({ page }, testInfo) => {
    for (const size of [{ width: 320 }, { width: 390 }, { width: 1440 }, { width: 1440, constrained: true }]) {
      await headingHost(page, { ...size, mode, kind: 'page' });
      const heading = page.locator('.page-heading');
      await expect(heading).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(heading).toHaveCSS('background-image', 'none');
      await expect(heading).toHaveCSS('border-top-width', '0px');
      await expect(heading).toHaveCSS('border-radius', '0px');
      await expect(heading).toHaveCSS('box-shadow', 'none');
      const followingTask = page.getByRole('button', { name: 'Continue task', exact: true });
      const taskBox = await followingTask.boundingBox();
      expect(taskBox.y + taskBox.height, 'following primary task inside first viewport').toBeLessThanOrEqual(844);
      await expect.poll(() => heading.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
      const primary = heading.getByRole('button', { name: 'Save assessment', exact: true });
      await primary.focus();
      await expect(primary).toHaveCSS('outline-width', '2px');
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
      await page.locator('main').screenshot({ path: testInfo.outputPath(`unframed-${mode}-${size.width}${size.constrained ? '-parent320' : ''}.png`) });
      // The existing global legacy introduction contract remains a card.
      await page.locator('main').evaluate(element => {
        const intro = document.createElement('div');
        intro.className = 'app-page__intro';
        intro.textContent = 'Application-owned introduction';
        element.append(intro);
      });
      await expect(page.locator('.app-page__intro')).toHaveCSS('background-color', mode === 'light' ? 'rgb(255, 255, 255)' : 'rgb(35, 36, 38)');
      await expect(page.locator('.app-page__intro')).toHaveCSS('border-radius', '16px');
      await expect(page.locator('.app-page__intro')).not.toHaveCSS('box-shadow', 'none');
    }
  });
  for (const size of [{ width: 320 }, { width: 390 }, { width: 1440 }, { width: 1440, constrained: true }]) {
    test(`Nexora ${mode} heading preserves the following task at ${size.width}${size.constrained ? ' with 320px parent' : ''}`, async ({ page }, testInfo) => {
      for (const visual of [false, true]) {
        await headingHost(page, { ...size, mode, visual });
        const heading = page.locator('.experience-heading');
        const title = heading.getByRole('heading', { level: 1 });
        await expect(heading).toHaveAttribute('aria-labelledby', 'experience-demo-heading');
        await expect(title).toContainText('Your annual check');
        const geometry = await heading.evaluate(element => {
          const title = element.querySelector('h1');
          const style = getComputedStyle(element);
          return { height: element.getBoundingClientRect().height, minHeight: style.minHeight, fontSize: parseFloat(getComputedStyle(title).fontSize), titleWidth: title.getBoundingClientRect().width, copyWidth: element.querySelector('.experience-heading__copy').getBoundingClientRect().width, scrollWidth: element.scrollWidth, width: element.clientWidth };
        });
        expect(geometry.minHeight, 'no hero minimum height').toBe('0px');
        expect(geometry.fontSize).toBeLessThanOrEqual(32);
        expect(geometry.titleWidth, 'heading uses available copy width').toBeCloseTo(geometry.copyWidth, 0);
        expect(geometry.height).toBeLessThanOrEqual(visual ? 350 : 290);
        expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.width);
        if (visual) {
          const image = heading.getByRole('img', { name: 'Overall result score 82 out of 100' });
          await expect(image).toBeVisible();
          const imageBox = await image.boundingBox();
          const leadBox = await heading.locator('.experience-heading__lead').boundingBox();
          expect(imageBox.y >= leadBox.y + leadBox.height || imageBox.x >= leadBox.x + leadBox.width).toBe(true);
        } else await expect(heading.locator('.experience-heading__visual')).toBeHidden();
        const task = page.getByRole('button', { name: 'Open result details', exact: true });
        const taskBox = await task.boundingBox();
        expect(taskBox.y + taskBox.height, 'following primary task visible in first viewport').toBeLessThanOrEqual(844);
        await page.keyboard.press('Tab');
        await expect(task).toBeFocused();
        await expect(task).toHaveCSS('outline-width', '2px');
        expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
        await page.locator('main').screenshot({ path: testInfo.outputPath(`heading-${mode}-${visual ? 'visual' : 'no-visual'}.png`) });
      }
    });
  }
  test(`Nexora ${mode} heading respects a host accent and heading font`, async ({ page }) => {
    await headingHost(page, { mode, accent: true });
    await expect(page.locator('.experience-heading__eyebrow')).toHaveCSS('color', mode === 'light' ? 'rgb(23, 106, 101)' : 'rgb(131, 206, 197)');
    await expect(page.locator('.experience-heading h1 em')).toHaveCSS('color', mode === 'light' ? 'rgb(23, 106, 101)' : 'rgb(131, 206, 197)');
    await expect(page.locator('.experience-heading h1')).toHaveCSS('font-family', 'Sarabun, serif');
  });
  test(`Nexora ${mode} compact PageHeading keeps host typography and usable primary actions`, async ({ page }, testInfo) => {
    await page.goto(`/specimens/page-heading?appearance=nexora&mode=${mode}`);
    await page.locator('.specimen-host').evaluate(element => {
      element.style.setProperty('--app-nexora-accent', 'light-dark(#176a65,#83cec5)');
      element.style.setProperty('--app-font-heading', 'Sarabun,serif');
    });
    const heading = page.locator('.page-heading');
    await expect(heading.locator('h1')).toHaveCSS('font-family', 'Sarabun, serif');
    await expect(heading.locator('.page-heading__section-icon')).toHaveCSS('color', mode === 'light' ? 'rgb(23, 106, 101)' : 'rgb(131, 206, 197)');
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      const titleSize = await heading.locator('h1').evaluate(element => parseFloat(getComputedStyle(element).fontSize));
      expect(titleSize).toBeLessThanOrEqual(26.4);
      const primary = heading.getByRole('button', { name: 'Save assessment', exact: true });
      await primary.focus();
      await expect(primary).toHaveCSS('outline-width', '2px');
      await primary.press('Enter');
      await expect(page.getByRole('status').filter({ hasText: 'Assessment saved.' })).toBeVisible();
      await expect.poll(() => heading.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
      await heading.screenshot({ path: testInfo.outputPath(`page-heading-${mode}-${width}.png`) });
    }
    await page.setViewportSize({ width: 1440, height: 844 });
    await page.getByTestId('page-composition-workbench').evaluate(element => { element.style.width = '320px'; });
    await expect(heading.getByRole('button', { name: 'Save assessment', exact: true })).toBeVisible();
    await expect.poll(() => heading.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    await heading.screenshot({ path: testInfo.outputPath(`page-heading-${mode}-constrained.png`) });
  });
}

test('Nexora heading retains keyboard task interactions, reduced motion and forced colors', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await page.goto('/specimens/experience-heading?appearance=nexora');
  await page.getByLabel('Include visual', { exact: true }).uncheck();
  const task = page.getByRole('button', { name: 'Open result details', exact: true });
  await task.focus();
  await task.press('Enter');
  await expect(page.getByRole('status')).toHaveText('Result details opened.');
  await expect(task).toHaveCSS('outline-style', 'solid');
  await expect(page.locator('.experience-heading__copy')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.experience-heading')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.locator('.experience-heading__visual')).toBeHidden();
});

for (const appearance of ['standard', 'essential', 'quiet-luxury']) {
  test(`${appearance} retains its existing ExperienceHeading geometry`, async ({ page }) => {
    await headingHost(page, { appearance, width: 1440 });
    await expect(page.locator('.experience-heading')).toHaveCSS('min-height', '330px');
    await expect(page.locator('.experience-heading h1')).toHaveCSS('font-size', '80px');
    await expect(page.locator('.experience-heading__visual')).toBeVisible();
  });
  test(`${appearance} retains its framed PageHeading surface`, async ({ page }) => {
    await headingHost(page, { appearance, kind: 'page', width: 1440 });
    await expect(page.locator('.page-heading')).toHaveCSS('border-top-width', '1px');
    await expect(page.locator('.page-heading')).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    if (appearance === 'standard') await expect(page.locator('.page-heading')).not.toHaveCSS('box-shadow', 'none');
    else await expect(page.locator('.page-heading')).toHaveCSS('box-shadow', 'none');
  });
}
