import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  ['/components/nav', 'Embedded'],
  ['/components/nav-group', 'Label'],
  ['/components/nav-item', 'Href'],
  ['/components/nav-submenu', 'Expanded']
];

for (const [path, parameter] of routes) {
  test(`${path} exposes runtime API metadata and the navigation workbench`, async ({ page }) => {
    await page.goto(path);

    await expect(page.getByRole('complementary', { name: 'Navigation controls' })).toBeVisible();
    await expect(page.getByTestId('navigation-workbench')).toBeVisible();
    await expect(page.getByRole('rowheader', { name: parameter, exact: true })).toBeVisible();
  });
}

test('NavItem marks the current route with aria-current and keeps inactive destinations unmarked', async ({ page }) => {
  await page.goto('/components/nav');

  const current = page.getByRole('link', { name: 'Navigation overview' });
  const catalog = page.getByRole('link', { name: /Component catalog/ });

  await expect(current).toHaveAttribute('aria-current', 'page');
  await expect(current).toHaveClass(/nav-item--active/);
  await expect(catalog).not.toHaveAttribute('aria-current', 'page');
});

test('NavSubmenu retains native details and summary disclosure behavior', async ({ page }) => {
  await page.goto('/components/nav-submenu');

  const details = page.getByTestId('reports-submenu');
  const summary = details.locator('summary');

  await expect(details).toHaveAttribute('open', '');
  await summary.click();
  await expect(details).not.toHaveAttribute('open', '');
  await summary.click();
  await expect(details).toHaveAttribute('open', '');
});

test('navigation controls rerender submenu expanded and active presentation states', async ({ page }) => {
  await page.goto('/components/nav-submenu');

  const details = page.getByTestId('reports-submenu');
  const expanded = page.getByLabel('Reports expanded');
  const active = page.getByLabel('Reports active');

  await expanded.uncheck();
  await expect(details).not.toHaveAttribute('open', '');

  await active.check();
  await expect(details).toHaveClass(/is-active/);

  await expanded.check();
  await expect(details).toHaveAttribute('open', '');
});

for (const [path] of routes) {
  test(`navigation workbench has no serious or critical axe violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('main')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    const blockingViolations = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
    expect(blockingViolations, JSON.stringify(blockingViolations, null, 2)).toEqual([]);
  });
}
