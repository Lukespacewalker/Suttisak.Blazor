import { expect, test } from '@playwright/test';

test('section navigation opens a clickable More panel above the primary links scroller', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/specimens/section-navigation?appearance=standard');

  const nav = page.getByRole('navigation', { name: 'Assessment sections' });
  const items = nav.locator('.section-navigation__items');
  await nav.evaluate(element => {
    element.parentElement.style.width = '600px';
    for (const link of element.querySelectorAll('.section-navigation__primary-items a')) {
      link.style.minWidth = '225px';
    }
  });

  await expect(nav).toHaveAttribute('data-overflowing', 'true');
  await expect(items).toHaveCSS('overflow-x', 'auto');
  await expect.poll(() => items.evaluate(element => {
    element.scrollLeft = element.scrollWidth;
    return element.scrollLeft;
  })).toBeGreaterThan(0);

  const more = nav.locator('.section-navigation__overflow > summary');
  await more.focus();
  await more.press('Enter');
  await expect(more).toBeFocused();
  const documents = nav.getByRole('link', { name: 'Documents', exact: true });
  await documents.evaluate(element => {
    element.addEventListener('click', event => event.preventDefault(), { once: true });
  });
  await documents.click();
  await expect(page.getByRole('heading', { name: 'Documents', exact: true })).toBeVisible();
});

for (const [appearance, mode] of [['standard', 'light'], ['essential', 'dark']]) {
  test(`legacy access layout stacks ${appearance} ${mode} within a narrow desktop host`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/access/login?appearance=${appearance}&mode=${mode}`);

    const grid = page.locator('.access-page-layout__grid');
    const card = grid.locator('.access-page-layout__card');
    const showcase = grid.locator('.access-page-layout__showcase');
    const desktopCard = await card.boundingBox();
    const desktopShowcase = await showcase.boundingBox();
    expect(desktopCard.x + desktopCard.width).toBeLessThanOrEqual(desktopShowcase.x + 1);

    const username = card.getByRole('textbox', { name: 'Username' });
    for (const width of [600, 375]) {
      await grid.evaluate((element, width) => {
        element.closest('.access-preview').style.maxWidth = `${width}px`;
      }, width);
      await expect.poll(async () => {
        const form = await card.boundingBox();
        const story = await showcase.boundingBox();
        return story.y - (form.y + form.height);
      }).toBeGreaterThanOrEqual(-1);

      await expect(card.locator('.access-page-layout__controls')).toHaveCSS('position', 'static');
      expect(await grid.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
      await username.fill(`name${width}@example.com`);
      await expect(username).toHaveValue(`name${width}@example.com`);
    }
  });
}

for (const [colorScheme, forcedColors] of [['light', 'none'], ['dark', 'none'], ['light', 'active']]) {
  test(`closed experience disclosure keeps its keyboard outline within the surface in ${colorScheme} with forced colors ${forcedColors}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme, forcedColors });
    await page.goto(`/specimens/experience-disclosure?appearance=standard&mode=${colorScheme}`);

    const details = page.getByTestId('experience-disclosure-secondary');
    const summary = details.locator('summary');
    await expect(details).not.toHaveAttribute('open', '');
    await page.getByTestId('experience-disclosure-primary').locator('summary').focus();
    await page.keyboard.press('Tab');
    await expect(summary).toBeFocused();
    await expect(summary).toHaveCSS('outline-style', 'solid');
    expect(await summary.evaluate(element => {
      const style = getComputedStyle(element);
      return parseFloat(style.outlineWidth) > 0 &&
        parseFloat(style.outlineOffset) + parseFloat(style.outlineWidth) <= 0;
    })).toBe(true);

    await page.keyboard.press('Enter');
    await expect(details).toHaveAttribute('open', '');
    await expect(summary).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(details).not.toHaveAttribute('open', '');
  });
}
