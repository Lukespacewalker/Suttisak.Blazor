import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const contracts = [
  { slug: 'marketing-page', kind: 'Pattern docs', parameter: 'Id', route: 'landing' },
  { slug: 'access-page-layout', kind: 'Pattern docs', parameter: 'Title', route: 'access/login' },
  { slug: 'application-shell', kind: 'Pattern docs', parameter: 'Brand', route: 'application-shell' },
  { slug: 'header-footer-layout', kind: 'Pattern docs', parameter: 'Body', route: 'layout-patterns/header-footer' },
  { slug: 'identity-layout', kind: 'Pattern docs', parameter: 'Body', route: 'layout-patterns/identity' },
  { slug: 'landing-layout', kind: 'Pattern docs', parameter: 'Body', route: 'layout-patterns/landing' },
  { slug: 'main-layout', kind: 'Pattern docs', parameter: 'Body', route: 'layout-patterns/application' },
  { slug: 'root-layout', kind: 'Pattern docs', parameter: 'Body', route: 'layout-patterns/application' },
  { slug: 'app-input-support', kind: 'Reference', parameter: 'Description', route: 'components/app-text-box' },
  { slug: 'app-overlay-host', kind: 'Reference', parameter: null, route: 'components/app-dialog' },
  { slug: 'layout-mobile-menu-button-wrapper', kind: 'Reference', parameter: null, route: null }
];

async function expectNoSeriousOrCriticalViolations(page, include) {
  let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']);
  if (include) builder = builder.include(include);
  const results = await builder.analyze();
  const blocking = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
}

for (const contract of contracts) {
  test(`${contract.slug} has ${contract.kind} and runtime metadata`, async ({ page }) => {
    await page.goto(`/components/${contract.slug}`);

    await expect(page.locator('.component-detail__coverage')).toHaveText(contract.kind);
    const documentation = page.getByTestId('coverage-documentation');
    await expect(documentation).toBeVisible();
    const documentationKind = contract.kind === 'Pattern docs' ? 'Pattern' : 'Reference';
    await expect(documentation.getByText(`${documentationKind} documentation`)).toBeVisible();
    await expect(documentation.getByRole('heading', { level: 3, name: `${documentationKind} coverage` })).toBeVisible();
    await expect(documentation.getByText('Composition responsibilities', { exact: true })).toBeVisible();
    await expect(documentation.getByText('Application-owned responsibilities', { exact: true })).toBeVisible();
    await expect(documentation.getByText('Tests', { exact: true })).toBeVisible();
    await expect(documentation.getByText('Related components', { exact: true })).toBeVisible();
    await expect(page.locator('.component-detail__generic-preview')).toHaveCount(0);

    const api = page.getByRole('region', { name: 'Component API parameters' });
    await expect(api).toBeVisible();
    if (contract.parameter) {
      await expect(api.getByRole('rowheader', { name: contract.parameter, exact: true })).toBeVisible();
    }

    if (contract.route) {
      await expect(documentation.getByRole('link').first()).toHaveAttribute('href', contract.route);
    } else {
      await expect(documentation.locator('.component-detail__documentation-intro > a')).toHaveCount(0);
      await expect(documentation.getByRole('link')).toHaveCount(2);
    }

    await expectNoSeriousOrCriticalViolations(page, 'main');
    await page.reload();
    await expect(page.getByTestId('coverage-documentation')).toBeVisible();
  });
}

const patternRoutes = [
  { name: 'MarketingPage', route: '/landing', marker: 'main.marketing-page' },
  { name: 'AccessPageLayout', route: '/access/login', marker: '.access-page-layout' },
  { name: 'ApplicationShell', route: '/application-shell', marker: '[data-app-shell]' },
  { name: 'HeaderFooterLayout', route: '/layout-patterns/header-footer', marker: '[data-testid="header-footer-layout-pattern"]' },
  { name: 'IdentityLayout', route: '/layout-patterns/identity', marker: '[data-testid="identity-layout-pattern"]' },
  { name: 'LandingLayout', route: '/layout-patterns/landing', marker: '[data-testid="landing-layout-pattern"]' },
  { name: 'MainLayout', route: '/layout-patterns/application', marker: '[data-testid="main-layout-pattern"]' },
  { name: 'RootLayout', route: '/layout-patterns/application', marker: '#blazor-error-ui', existsOnly: true }
];

for (const pattern of patternRoutes) {
  test(`${pattern.name} canonical route executes the real page-level contract with valid landmarks`, async ({ page }) => {
    await page.goto(pattern.route);

    const marker = page.locator(pattern.marker);
    if (pattern.existsOnly) {
      await expect(marker).toHaveCount(1);
    } else {
      await expect(marker).toBeVisible();
    }
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('main main')).toHaveCount(0);
    await expectNoSeriousOrCriticalViolations(page);
  });
}

test('MainLayout route keeps current navigation, skip focus, and mobile containment wired through ApplicationShell', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 720 });
  await page.goto('/layout-patterns/application');

  const current = page.getByRole('link', { name: 'Application', exact: true });
  await expect(current).toHaveAttribute('aria-current', 'page');

  const menuButton = page.locator('[data-shell-action="mobile"]');
  await expect(menuButton).toHaveAttribute('aria-label', 'Open navigation');
  await menuButton.click();
  const navigation = page.locator('.app-shell__navigation');
  await expect(navigation).toHaveClass(/is-open/);
  await expect.poll(() => navigation.evaluate(element => element.getBoundingClientRect().left))
    .toBeGreaterThanOrEqual(0);
  const geometry = await navigation.evaluate(element => {
    const box = element.getBoundingClientRect();
    return { right: box.right, width: window.innerWidth };
  });
  expect(geometry.right).toBeLessThanOrEqual(geometry.width + 1);

  await menuButton.click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

  const skip = page.getByRole('link', { name: 'Skip to main content' });
  await skip.focus();
  await skip.press('Enter');
  await expect(page.locator('main.app-shell__main')).toBeFocused();
});
