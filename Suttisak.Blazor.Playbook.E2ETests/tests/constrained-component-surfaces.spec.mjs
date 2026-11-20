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

for (const [appearance, mode] of [['standard', 'light'], ['nexora', 'dark']]) {
  test(`ExperienceHeading fits localized titles in a narrow ${appearance} host`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/specimens/experience-heading?appearance=${appearance}&mode=${mode}`);

    const host = page.getByTestId('experience-workbench');
    const heading = page.getByTestId('experience-heading');
    const copy = heading.locator('.experience-heading__copy');
    const title = heading.getByRole('heading', { level: 1 });
    const visual = heading.getByRole('img', { name: 'Overall result score 82 out of 100' });
    const sizeHost = width => host.evaluate((element, width) => {
      element.style.inlineSize = `${width}px`;
    }, width);

    await sizeHost(800);
    const desktopCopy = await copy.boundingBox();
    const desktopVisual = await visual.boundingBox();
    expect(desktopVisual.x).toBeGreaterThanOrEqual(desktopCopy.x + desktopCopy.width - 1);

    for (const [width, lang, text] of [
      [375, 'en', 'An assessment for WorkplaceErgonomicsAndOccupationalHealth'],
      [320, 'th', 'แบบประเมินการยศาสตร์และสุขภาพในการทำงานประจำปีของคุณ'],
    ]) {
      await sizeHost(width);
      await title.evaluate((element, { lang, text }) => {
        element.lang = lang;
        element.textContent = text;
      }, { lang, text });

      await expect(title).toHaveText(text);
      await expect(visual).toBeVisible();
      await expect.poll(() => heading.evaluate(element => {
        const copy = element.querySelector('.experience-heading__copy').getBoundingClientRect();
        const visual = element.querySelector('.experience-heading__visual').getBoundingClientRect();
        return visual.top >= copy.bottom - 1;
      }), 'the supplied visual sits below the entire copy').toBe(true);
      expect((await copy.boundingBox()).width).toBeGreaterThan(width * 0.75);
      expect(await title.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
      expect(await title.evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeLessThanOrEqual(42);
    }

    const action = page.getByRole('button', { name: 'Open result details' });
    await action.focus();
    await action.press('Enter');
    await expect(page.getByRole('status')).toHaveText('Result details opened.');
  });
}

for (const { slug, item, titleLabel, mode } of [
  { slug: 'marketing-proof-strip', item: '.marketing-proof-item', titleLabel: 'Proof title', mode: 'light' },
  { slug: 'marketing-step-list', item: '.marketing-step', titleLabel: 'First step title', mode: 'dark' },
]) {
  test(`${slug} arranges items from its own width in specimens and the landing page`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/specimens/${slug}?appearance=standard&mode=${mode}`);

    const host = page.getByTestId('marketing-workbench');
    const items = page.getByTestId(slug).locator(item);
    const title = 'WorkshopRegistrationAndAccessibilityInformation';
    await page.getByLabel(titleLabel, { exact: true }).fill(title);
    await expect(items.first().getByRole('heading')).toHaveText(title);

    for (const width of [320, 720, 980]) {
      await host.evaluate((element, width) => {
        element.style.inlineSize = `${width}px`;
      }, width);
      const [first, second, last] = await items.evaluateAll(elements => elements.map(element => {
        const { y, width } = element.getBoundingClientRect();
        const { borderBlockEndWidth, borderInlineEndWidth } = getComputedStyle(element);
        return { y, width, borderBlockEndWidth, borderInlineEndWidth };
      }));

      if (width === 320) {
        expect(first.y).toBeLessThan(second.y);
        expect(second.y).toBeLessThan(last.y);
        expect(first.borderInlineEndWidth).toBe('0px');
        expect(first.borderBlockEndWidth).toBe('1px');
      } else if (width === 720) {
        expect(first.y).toBe(second.y);
        expect(second.y).toBeLessThan(last.y);
        expect(last.width).toBeCloseTo(first.width + second.width, 0);
        expect(first.borderInlineEndWidth).toBe('1px');
        expect(second.borderBlockEndWidth).toBe('1px');
      } else {
        expect(first.y).toBe(second.y);
        expect(second.y).toBe(last.y);
        expect(last.width).toBeCloseTo(first.width, 0);
      }
      expect(await items.first().getByRole('heading').evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
    }

    await page.goto(`/landing?appearance=standard&mode=${mode}`);
    const nested = page.locator(`.marketing-page .${slug}`);
    await nested.evaluate(element => { element.style.maxInlineSize = '320px'; });
    const y = await nested.locator(item).evaluateAll(elements => elements.map(element => element.getBoundingClientRect().y));
    expect(y).toHaveLength(3);
    expect(y[0]).toBeLessThan(y[1]);
    expect(y[1]).toBeLessThan(y[2]);
  });
}

test('AppGridShell stacks controls within a narrow desktop host and scrolls the table locally', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/specimens/app-grid-shell?appearance=standard');

  const shell = page.getByRole('region', { name: 'Playbook records', exact: true });
  const commandbar = shell.locator('.app-grid-shell__commandbar');
  const positions = () => commandbar.evaluate(element => Array.from(element.children).map(child => {
    const { left, top, bottom } = child.getBoundingClientRect();
    return { left, top, bottom };
  }));
  const sizeHost = width => shell.evaluate((element, width) => {
    element.parentElement.style.inlineSize = `${width}px`;
  }, width);

  await sizeHost(800);
  const [wideSearch, wideFilter, wideActions] = await positions();
  expect(wideFilter.top).toBeLessThan(wideSearch.bottom);
  expect(wideActions.top).toBeLessThan(wideSearch.bottom);

  await sizeHost(320);
  const [narrowSearch, narrowFilter, narrowActions] = await positions();
  expect(narrowFilter.top).toBeGreaterThan(narrowSearch.bottom);
  expect(narrowActions.top).toBeGreaterThan(narrowFilter.bottom);
  expect(narrowFilter.left).toBe(narrowSearch.left);
  expect(narrowActions.left).toBe(narrowSearch.left);

  await page.getByRole('combobox', { name: 'Responsive pattern', exact: true }).selectOption('Table');
  await expect(page.getByRole('table', { name: 'Playbook records table' })).toBeVisible();
  const viewport = shell.locator('.app-grid-shell__viewport');
  expect(await viewport.evaluate(element => element.scrollWidth - element.clientWidth)).toBeGreaterThan(0);
  expect(await page.locator('html').evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);

  const search = page.getByRole('searchbox', { name: 'Search records' });
  await search.fill('office');
  const clear = shell.getByRole('button', { name: 'Clear search', exact: true });
  await clear.focus();
  await clear.press('Enter');
  await expect(search).toHaveValue('');
});
