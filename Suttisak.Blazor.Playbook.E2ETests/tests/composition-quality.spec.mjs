import { expect, test } from '@playwright/test';

for (const appearance of ['standard', 'essential', 'quiet-luxury', 'nexora']) {
  for (const mode of ['light', 'dark']) {
    test(`${appearance} ${mode} record search uses one input surface at desktop and constrained widths`, async ({ page }, testInfo) => {
      await page.goto(`/application-shell/records?appearance=${appearance}&mode=${mode}`);
      const search = page.getByRole('searchbox', { name: 'Search records', exact: true });
      const container = page.getByRole('search');
      await expect(page.locator('.demo-data-panel')).toHaveCSS('border-top-width', '0px');
      await expect(page.locator('.demo-data-panel')).toHaveCSS('box-shadow', 'none');
      await expect(page.getByRole('heading', { name: 'All records', exact: true })).toBeVisible();
      expect(await page.locator('.demo-data-panel .app-grid-shell').evaluate(element => parseFloat(getComputedStyle(element).borderTopWidth))).toBeGreaterThan(0);

      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 900 });
        await search.fill('Annual hearing');
        await expect(page.getByText('1 of 6 records', { exact: true })).toBeVisible();
        const clear = page.getByRole('button', { name: 'Clear search', exact: true });
        await expect(clear).toBeVisible();
        const geometry = await container.evaluate(element => {
          const control = element.querySelector('.app-form-control__input-wrap');
          const input = control.querySelector('input');
          const bounds = element.getBoundingClientRect();
          const controlBounds = control.getBoundingClientRect();
          const inputBounds = input.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            outerBorder: style.borderTopWidth,
            outerBackground: style.backgroundColor,
            outerShadow: style.boxShadow,
            outerOutline: style.outlineStyle,
            controlBorder: getComputedStyle(control).borderTopWidth,
            containsControl: controlBounds.top >= bounds.top - 1 && controlBounds.bottom <= bounds.bottom + 1,
            containsInput: inputBounds.top >= controlBounds.top - 1 && inputBounds.bottom <= controlBounds.bottom + 1,
            fitsViewport: bounds.right <= innerWidth + 1,
            iconInsideControl: control.querySelectorAll('.app-form-control__icon-content').length
          };
        });
        expect(geometry.outerBorder).toBe('0px');
        expect(geometry.outerBackground).toBe('rgba(0, 0, 0, 0)');
        expect(geometry.outerShadow).toBe('none');
        expect(geometry.outerOutline).toBe('none');
        expect(parseFloat(geometry.controlBorder)).toBeGreaterThan(0);
        expect(geometry.containsControl).toBe(true);
        expect(geometry.containsInput).toBe(true);
        expect(geometry.fitsViewport).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        expect(geometry.iconInsideControl).toBe(1);
        await clear.click();
        await expect(search).toHaveValue('');
        await expect(page.getByText('6 records', { exact: true })).toBeVisible();
      }
      await page.screenshot({ path: testInfo.outputPath('records-constrained.png'), fullPage: true });
    });

    test(`${appearance} ${mode} application overview and result cards reuse shared theme surfaces`, async ({ page }, testInfo) => {
      await page.goto(`/components/app-card?appearance=${appearance}&mode=${mode}`);
      const sharedCard = page.locator('.component-detail__preview-frame .app-card').first();
      await expect(sharedCard).toBeVisible();
      const reference = await sharedCard.evaluate(element => {
        const style = getComputedStyle(element);
        return { radius: style.borderRadius, shadow: style.boxShadow };
      });

      for (const [route, selector, count] of [
        ['/application-shell', '.demo-overview-card', 3],
        ['/application-shell/person', '.person-overview-card', 3],
        ['/application-shell/person/results', '.person-result-card', 3]
      ]) {
        await page.goto(`${route}?appearance=${appearance}&mode=${mode}`);
        const cards = page.locator(selector);
        await expect(cards).toHaveCount(count);
        if (route === '/application-shell') {
          const backgrounds = await cards.evaluateAll(elements => elements.map(element => {
            const style = getComputedStyle(element);
            return `${style.backgroundColor} ${style.backgroundImage}`;
          }));
          expect(backgrounds[0]).not.toBe(backgrounds[1]);
        } else {
          await expect(page.locator(route.endsWith('/results') ? '.person-result-card--attention' : '.person-overview-card--signal'))
            .not.toHaveCSS('background-image', 'none');
        }
        for (const width of [1440, 390]) {
          await page.setViewportSize({ width, height: 900 });
          for (const card of await cards.all()) {
            await expect(card).toHaveCSS('border-radius', reference.radius);
            await expect(card).toHaveCSS('box-shadow', reference.shadow);
            expect(await card.evaluate(element => element.getBoundingClientRect().right <= innerWidth + 1)).toBe(true);
            if (route.endsWith('/results')) {
              const footerInset = await card.evaluate(element => element.getBoundingClientRect().bottom - element.querySelector('footer').getBoundingClientRect().bottom);
              expect(footerInset).toBeGreaterThanOrEqual(0);
              expect(footerInset).toBeLessThan(40);
            }
          }
        }
        if (route.endsWith('/results')) {
          await expect(page.getByRole('article')).toHaveCount(3);
          await expect(page.getByText('Repeat audiometry in 3 months', { exact: true })).toBeVisible();
          const heading = cards.first().locator('strong').first();
          const footer = cards.first().locator('footer');
          expect(await heading.evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThan(20);
          expect(await footer.evaluate(element => element.querySelector('b').getBoundingClientRect().top > element.parentElement.querySelector('p').getBoundingClientRect().bottom)).toBe(true);
        }
      }
      await page.screenshot({ path: testInfo.outputPath('cards-constrained.png'), fullPage: true });
    });
  }
}
