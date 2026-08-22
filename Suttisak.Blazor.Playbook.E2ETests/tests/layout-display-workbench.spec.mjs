import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const layoutRoutes = [
  '/components/app-card',
  '/components/app-stack',
  '/components/app-divider',
  '/components/pill',
  '/components/toolbar',
  '/components/card-menu'
];

test('layout workbench exposes runtime API metadata and composable surface semantics', async ({ page }) => {
  await page.goto('/components/app-card');

  await expect(page.getByRole('complementary', { name: 'Layout and display controls' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Title', exact: true })).toBeVisible();
  await expect(page.getByTestId('surface-card')).toBeVisible();
  await expect(page.getByTestId('surface-card')).not.toHaveAttribute('role', 'button');
  await expect(page.getByRole('toolbar', { name: 'Assessment actions' })).toBeVisible();
});

test('AppStack controls direction, spacing, and wrapping without changing children', async ({ page }) => {
  await page.goto('/components/app-stack');

  const stack = page.getByTestId('layout-stack');
  await expect(stack).toHaveClass(/app-stack--vertical/);
  await expect(stack).toHaveCSS('--app-stack-gap', '16px');

  await page.getByLabel('Stack direction').selectOption('Horizontal');
  await expect(stack).toHaveClass(/app-stack--horizontal/);

  await page.getByLabel('Gap').selectOption('0.5rem');
  await expect(stack).toHaveCSS('--app-stack-gap', '8px');

  await page.getByLabel('Wrap horizontal content').uncheck();
  await expect(stack).not.toHaveClass(/app-stack--wrap/);
});

test('interactive AppCard supports keyboard activation and active state', async ({ page }) => {
  await page.goto('/components/app-card');

  const card = page.getByRole('button', { name: 'Review queue card' });
  await expect(card).toHaveAttribute('tabindex', '0');
  await card.focus();
  await card.press('Enter');
  await expect(page.getByTestId('layout-status')).toHaveText('Card activated.');
  await expect(card).toHaveClass(/app-card--active/);

  await card.press('Space');
  await expect(page.getByTestId('layout-status')).toHaveText('Card deactivated.');
  await expect(card).not.toHaveClass(/app-card--active/);
});

test('interactive card can be removed while the content surface stays non-interactive', async ({ page }) => {
  await page.goto('/components/app-card');

  await page.getByLabel('Interactive card').uncheck();
  await expect(page.getByTestId('interactive-card')).toHaveCount(0);
  await expect(page.getByTestId('surface-card')).toBeVisible();
  await expect(page.getByTestId('surface-card')).not.toHaveAttribute('role', 'button');
});

test('AppDivider exposes horizontal and vertical separator orientation', async ({ page }) => {
  await page.goto('/components/app-divider');

  const divider = page.getByTestId('layout-divider');
  await expect(divider).toHaveAttribute('role', 'separator');
  await expect(divider).toHaveAttribute('aria-orientation', 'horizontal');

  await page.getByLabel('Vertical divider').check();
  await expect(divider).toHaveAttribute('aria-orientation', 'vertical');
  await expect(divider).toHaveClass(/app-divider--vertical/);
});

test('Toolbar groups actions and invokes the primary action', async ({ page }) => {
  await page.goto('/components/toolbar');

  const toolbar = page.getByRole('toolbar', { name: 'Assessment actions' });
  await expect(toolbar).toBeVisible();
  await toolbar.getByRole('button', { name: 'Open review' }).click();
  await expect(page.getByTestId('layout-status')).toHaveText('Primary toolbar action selected.');
});

test('CardMenu preserves native button activation and disabled behavior', async ({ page }) => {
  await page.goto('/components/card-menu');

  const menu = page.getByRole('button', { name: 'Open participant settings' });
  await menu.click();
  await expect(page.getByTestId('layout-status')).toHaveText('Participant settings selected.');

  await page.getByLabel('Disabled card menu').check();
  await expect(menu).toBeDisabled();
});

test('Pill remains present as compact status metadata inside the composed card', async ({ page }) => {
  await page.goto('/components/pill');

  await expect(page.getByText('Ready', { exact: true })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'ChildContent', exact: true })).toBeVisible();
});

for (const path of layoutRoutes) {
  test(`layout and display workbench has no serious or critical axe violations on ${path}`, async ({ page }) => {
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
