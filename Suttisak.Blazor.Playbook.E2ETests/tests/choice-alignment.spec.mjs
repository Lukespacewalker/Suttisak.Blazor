import { expect, test } from '@playwright/test';

async function expectCenteredChoices(choices) {
  await expect.poll(() => choices.evaluateAll(labels => Math.max(...labels.map(label => {
    const control = label.querySelector('.app-choice__control').getBoundingClientRect();
    const content = label.querySelector('.app-choice__content').getBoundingClientRect();
    return Math.abs(control.top + control.height / 2 - content.top - content.height / 2);
  })))).toBeLessThan(0.75);
}

for (const mode of ['light', 'dark']) {
  test(`checkbox and radio labels stay vertically centered in ${mode} mode`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/components/app-checkbox?mode=${mode}`);
    const preview = page.locator('.component-detail__preview-frame').first();
    await expect(preview.getByRole('checkbox')).toBeVisible();
    await expectCenteredChoices(preview.locator('.app-choice'));
    const checkedState = page.locator('.component-detail__states .app-choice').filter({ has: page.getByRole('checkbox', { name: 'Email me updates', exact: true }) });
    await expect(checkedState.locator('.app-choice__mixed')).toHaveCSS('opacity', '0');
    const mixedState = page.locator('.component-detail__states .app-choice--indeterminate');
    await expect(mixedState.locator('.app-choice__mixed')).toHaveCSS('opacity', '1');
    await expectCenteredChoices(page.locator('.component-detail__states .app-choice'));

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByLabel('Label', { exact: true }).fill('Include archived records from all departments in this report');
    await expectCenteredChoices(preview.locator('.app-choice'));
    await expect(preview.locator('.app-choice__content')).toHaveCSS('text-align', 'start');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await preview.screenshot({ path: testInfo.outputPath(`checkbox-${mode}-wrapped.png`) });

    await page.goto(`/components/app-radio-group?mode=${mode}`);
    const radios = preview.locator('.app-choice--radio');
    await expect(radios).toHaveCount(3);
    await expectCenteredChoices(radios);
    await radios.filter({ hasText: 'Phone' }).click();
    await expect(preview.getByRole('radio', { name: 'Phone' })).toBeChecked();
    await expectCenteredChoices(radios);
    await preview.screenshot({ path: testInfo.outputPath(`radio-${mode}-mobile.png`) });
  });
}
