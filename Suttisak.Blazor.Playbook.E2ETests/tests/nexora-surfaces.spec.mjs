import { expect, test } from '@playwright/test';
import path from 'node:path';

function capturePath(testInfo, name) {
  return process.env.CONTROL_EVIDENCE_DIR ? path.join(process.env.CONTROL_EVIDENCE_DIR, name) : testInfo.outputPath(name);
}

for (const width of [320, 768, 1440]) {
  for (const longContent of [false, true]) {
    test(`Nexora shell keeps its viewport frame and a modest bottom inset at ${width}, long=${longContent}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/layout-patterns/application?appearance=nexora&longContent=${longContent}`);
      const metrics = await page.locator('[data-app-shell]').evaluate(shell => {
        const frame = shell.querySelector('.app-shell__frame');
        const content = shell.querySelector('.app-shell__content');
        return {
          shellBottom: shell.getBoundingClientRect().bottom + scrollY,
          frameBottom: frame.getBoundingClientRect().bottom + scrollY,
          documentHeight: document.documentElement.scrollHeight,
          paddingBottom: parseFloat(getComputedStyle(content).paddingBottom),
          headerImage: getComputedStyle(shell.querySelector('.app-shell__header')).backgroundImage,
          navigationImage: getComputedStyle(shell.querySelector('.app-shell__navigation')).backgroundImage
        };
      });
      expect(metrics.paddingBottom).toBeLessThanOrEqual(24);
      expect(Math.abs(metrics.shellBottom - metrics.frameBottom)).toBeLessThanOrEqual(1);
      expect(Math.abs(metrics.documentHeight - Math.max(900, metrics.shellBottom))).toBeLessThanOrEqual(1);
      expect(metrics.headerImage).toContain('linear-gradient');
      expect(metrics.navigationImage).toContain('linear-gradient');
      if (longContent) {
        expect(metrics.documentHeight).toBeGreaterThan(900);
        const last = page.getByTestId('layout-long-content-end');
        await last.scrollIntoViewIfNeeded();
        await expect(last).toBeInViewport();
      }
      await page.screenshot({ path: capturePath(testInfo, `shell-bottom-${width}-long-${longContent}.png`), fullPage: true });
      await testInfo.attach('shell-box-metrics', { body: JSON.stringify(metrics, null, 2), contentType: 'application/json' });
    });
  }
}

for (const mode of ['light', 'dark']) {
  for (const accent of [null, '#8c4b29', '#245ea8', '#7147a1']) {
    test(`Nexora ${mode} primary gradient preserves text contrast and hover with ${accent ?? 'library default accent'}`, async ({ page }, testInfo) => {
      await page.goto(`/components/app-button?appearance=nexora&mode=${mode}`);
      // Keep the unbranded fallback covered independently of Playbook's host palette.
      if (!accent) await page.locator('.playbook').evaluate(el => el.classList.remove('theme-audiogramiq'));
      if (accent) await page.locator('.playbook').evaluate((el, accent) => {
        el.style.setProperty('--app-nexora-accent', accent);
        el.style.setProperty('--app-nexora-on-accent', '#fffdf8');
      }, accent);
      const primary = page.locator('.component-detail__preview-frame .app-button--primary').first();
      await expect(primary).toBeVisible();
      await primary.hover();
      await expect(primary).not.toHaveCSS('background-image', 'none');
      await expect(primary).toHaveCSS('transform', 'none');
      await expect(primary).toHaveCSS('color', accent || mode === 'light' ? 'rgb(255, 253, 248)' : 'rgb(36, 30, 22)');
      const evidence = await primary.evaluate(el => {
        const style = getComputedStyle(el);
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        const luminance = color => {
          context.fillStyle = color;
          context.fillRect(0, 0, 1, 1);
          const channels = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map(value => value / 255)
            .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
          return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
        };
        const text = luminance(style.color);
        const stops = style.backgroundImage.match(/(?:rgb\([^)]+\)|color\([^)]+\))/g) ?? [];
        return {
          image: style.backgroundImage, text: style.color, stops,
          ratios: stops.map(stop => {
            const surface = luminance(stop);
            return (Math.max(text, surface) + .05) / (Math.min(text, surface) + .05);
          })
        };
      });
      expect(evidence.stops).toHaveLength(3);
      for (const ratio of evidence.ratios) expect(ratio, evidence.image).toBeGreaterThanOrEqual(4.5);
      await testInfo.attach('gradient-text-contrast', { body: JSON.stringify(evidence, null, 2), contentType: 'application/json' });
      await primary.screenshot({ path: capturePath(testInfo, `primary-${mode}-${accent?.slice(1) ?? 'default'}.png`) });
    });
  }
}

test('Nexora keeps danger variants and disabled/busy primary actions distinct', async ({ page }) => {
  await page.goto('/components/app-button?appearance=nexora');
  const preview = page.locator('.component-detail__preview-frame');
  for (const variant of ['Danger', 'DangerPrimary']) {
    await page.getByRole('combobox', { name: 'Variant', exact: true }).selectOption(variant);
    const button = preview.getByRole('button');
    await expect(button).toHaveCSS('background-image', 'none');
    await expect(button).toHaveCSS('color', variant === 'Danger' ? 'rgb(180, 35, 24)' : 'rgb(255, 255, 255)');
  }
  await page.getByRole('combobox', { name: 'Variant', exact: true }).selectOption('Primary');
  await page.getByRole('checkbox', { name: 'Disabled', exact: true }).check();
  await expect(preview.getByRole('button')).toBeDisabled();
  await expect(preview.getByRole('button')).toHaveCSS('opacity', '0.48');
  await page.getByRole('checkbox', { name: 'Disabled', exact: true }).uncheck();
  await page.getByRole('checkbox', { name: 'Loading', exact: true }).check();
  await expect(preview.getByRole('button')).toBeDisabled();
  await expect(preview.getByRole('button')).toHaveAttribute('aria-busy', 'true');
});

test('Nexora forced colors remove decorative gradients while preserving keyboard focus', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.goto('/components/app-button?appearance=nexora');
  const primary = page.locator('.component-detail__preview-frame .app-button--primary').first();
  await primary.focus();
  await expect(primary).toHaveCSS('background-image', 'none');
  await expect(primary).toHaveCSS('outline-width', '2px');
  await expect(primary).toHaveCSS('animation-name', 'none');
  const durations = await primary.evaluate(el => getComputedStyle(el).transitionDuration.split(',').map(value => parseFloat(value)));
  for (const duration of durations) expect(duration).toBeLessThanOrEqual(.00001);
  await page.goto('/layout-patterns/application?appearance=nexora');
  for (const surface of ['.app-shell__header', '.app-shell__navigation']) await expect(page.locator(surface)).toHaveCSS('background-image', 'none');
});

for (const appearance of ['standard', 'essential', 'quiet-luxury']) {
  test(`Nexora chrome refinements preserve existing ${appearance} shell geometry and surfaces`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(appearance => localStorage.setItem('suttisak-blazor:theme-settings', JSON.stringify({ appearance, mode: 'light' })), appearance);
    await page.goto(`/layout-patterns/application?appearance=${appearance}`);
    await expect(page.locator('html')).toHaveAttribute('data-appearance', appearance);
    await expect(page.locator('.app-shell__header')).toHaveCSS('background-image', 'none');
    await expect(page.locator('.app-shell__navigation')).toHaveCSS('background-image', 'none');
    await expect(page.locator('.app-shell__content')).toHaveCSS('padding-bottom', '56px');
  });
}
