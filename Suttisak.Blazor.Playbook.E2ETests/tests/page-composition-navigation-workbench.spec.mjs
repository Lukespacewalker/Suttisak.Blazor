import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  ['/components/app-select-item', 'Value', 'component-detail__lab'],
  ['/components/app-radio', 'Value', 'component-detail__lab'],
  ['/components/app-tab', 'Label', 'component-detail__lab'],
  ['/components/page-heading', 'Title', 'page-composition-workbench'],
  ['/components/page-action-toolbar', 'PrimaryAction', 'page-composition-workbench'],
  ['/components/page-breadcrumbs', 'Items', 'page-composition-workbench'],
  ['/components/section-navigation', 'AriaLabel', 'page-composition-workbench'],
  ['/components/mobile-navigation-account', null, 'account-navigation-workbench'],
  ['/components/profile-menu', 'LoginText', 'account-navigation-workbench']
];

for (const [path, parameter, workbench] of routes) {
  test(`${path} exposes the real executable contract after direct navigation and reload`, async ({ page }) => {
    await page.goto(path);

    if (workbench === 'component-detail__lab') {
      await expect(page.locator(`.${workbench}`).first()).toBeVisible();
    } else {
      await expect(page.getByTestId(workbench)).toBeVisible();
    }
    await expect(page.locator('.component-detail__coverage')).toHaveText('Interactive');
    await expect(page.getByRole('region', { name: 'Component API parameters' })).toBeVisible();
    if (parameter) {
      await expect(page.getByRole('rowheader', { name: parameter, exact: true })).toBeVisible();
    }

    await page.reload();
    await expect(page.locator('.component-detail__coverage')).toHaveText('Interactive');
  });
}

test('AppSelectItem is a real option inside AppSelect and preserves native selection semantics', async ({ page }) => {
  await page.goto('/components/app-select-item');

  const select = page.getByRole('combobox', { name: 'Region' }).first();
  await expect(select.getByRole('option', { name: 'Thailand' })).toHaveAttribute('value', 'th');
  await expect(select.getByRole('option', { name: 'Unavailable region' })).toBeDisabled();
  await select.selectOption('sg');
  await expect(select).toHaveValue('sg');
});

test('AppRadio child keeps native group exclusivity and arrow-key activation', async ({ page }) => {
  await page.goto('/components/app-radio');

  const group = page.getByRole('group', { name: 'Contact channel' });
  const email = group.getByRole('radio', { name: 'Email' });
  const phone = group.getByRole('radio', { name: 'Phone' });
  await expect(email).toHaveAttribute('name', 'contact-channel');
  await expect(phone).toHaveAttribute('name', 'contact-channel');
  await expect(email).toBeChecked();
  await email.focus();
  await email.press('ArrowRight');
  await expect(phone).toBeFocused();
  await expect(phone).toBeChecked();
  await expect(email).not.toBeChecked();
  await expect(page.getByRole('status').filter({ hasText: 'Channel: Phone' })).toBeVisible();
});

test('AppTab direct route preserves tabpanel relationships and roving keyboard focus', async ({ page }) => {
  await page.goto('/components/app-tab');

  const overview = page.getByRole('tab', { name: 'Overview' }).first();
  const activity = page.getByRole('tab', { name: 'Activity' }).first();
  await overview.focus();
  await overview.press('ArrowRight');
  await expect(activity).toBeFocused();
  await expect(activity).toHaveAttribute('aria-selected', 'true');
  const panelId = await activity.getAttribute('aria-controls');
  const panel = page.locator(`#${panelId}`);
  await expect(panel).toHaveAttribute('aria-labelledby', await activity.getAttribute('id'));
  await expect(panel).toBeVisible();
});

test('page composition wires heading, breadcrumb population, active navigation, and actions', async ({ page }) => {
  await page.goto('/components/page-heading');

  const heading = page.locator('.page-composition-specimen .page-heading');
  await expect(heading).toHaveAttribute('aria-labelledby', 'specimen-page-title');
  await expect(heading.getByRole('heading', { level: 1, name: 'Overview' })).toHaveAttribute('id', 'specimen-page-title');
  await expect(page.locator('.page-composition-specimen__breadcrumbs [aria-current="page"]')).toHaveText('Overview');
  await expect(page.getByRole('link', { name: 'Overview', exact: true })).toHaveAttribute('aria-current', 'page');

  await page.getByLabel('Active section').selectOption('history');
  await expect(heading.getByRole('heading', { level: 1, name: 'Audit history' })).toBeVisible();
  await expect(page.locator('.page-composition-specimen__breadcrumbs [aria-current="page"]')).toHaveText('Audit history');
  await expect(page.getByRole('link', { name: 'Audit history', exact: true }).first()).toHaveAttribute('aria-current', 'page');

  await page.getByRole('button', { name: 'Save assessment' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Assessment saved.' })).toBeVisible();
});

test('page toolbar and section navigation use native keyboard disclosures when constrained', async ({ page }) => {
  await page.goto('/components/page-action-toolbar');
  await page.getByRole('button', { name: '375' }).click();

  const host = page.getByTestId('isolated-specimen-frame');
  await expect.poll(() => host.evaluate(element => element.contentWindow?.innerWidth ?? 0)).toBe(375);
  const frame = page.frameLocator('[data-testid="isolated-specimen-frame"]');

  const toolbar = frame.getByRole('toolbar', { name: 'Assessment actions' });
  await expect(toolbar).toHaveAttribute('data-overflowing', 'true');
  const more = toolbar.locator('summary');
  await more.focus();
  await more.press('Enter');
  await expect(toolbar.locator('details')).toHaveAttribute('open', '');
  await expect(more).toBeFocused();
  await expect(toolbar.getByRole('button', { name: 'Request archive' })).toBeVisible();

  const mobileDisclosure = frame.locator('.section-navigation__mobile');
  await expect(mobileDisclosure).toBeVisible();
  const mobileSummary = mobileDisclosure.locator('summary');
  await mobileSummary.focus();
  await mobileSummary.press('Enter');
  await expect(mobileDisclosure).toHaveAttribute('open', '');
  await expect(mobileSummary).toBeFocused();

  const preview = frame.locator('.component-detail__preview-frame');
  const containment = await preview.evaluate(element => ({ client: element.clientWidth, scroll: element.scrollWidth }));
  expect(containment.scroll).toBeLessThanOrEqual(containment.client + 1);
});

test('ProfileMenu expands from the keyboard and retains focus on its summary', async ({ page }) => {
  await page.goto('/components/profile-menu');

  const profile = page.locator('.account-navigation-specimen .profile-menu').first();
  const summary = profile.locator('summary');
  await expect(summary).toContainText('Kanda Srisuk');
  await summary.focus();
  await summary.press('Enter');
  await expect(profile).toHaveAttribute('open', '');
  await expect(summary).toBeFocused();
  await expect(profile.getByRole('link', { name: 'Manage account' })).toBeVisible();
  await summary.press('Enter');
  await expect(profile).not.toHaveAttribute('open', '');
});

test('MobileNavigationAccount contains real account and preference controls at 375 pixels', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 900 });
  await page.goto('/components/mobile-navigation-account');
  await page.getByRole('button', { name: '375' }).click();

  const frame = page.frameLocator('[data-testid="isolated-specimen-frame"]');
  const account = frame.locator('.account-navigation-specimen .mobile-nav-account');
  await expect(account).toContainText('Kanda Srisuk');
  await expect(account.getByRole('group', { name: 'Color scheme' })).toBeVisible();
  await expect(account.getByLabel('Language', { exact: true })).toBeVisible();
  await expect(account.getByRole('button', { name: 'Sign out' })).toBeVisible();

  const containment = await account.evaluate(element => ({ client: element.clientWidth, scroll: element.scrollWidth }));
  expect(containment.scroll).toBeLessThanOrEqual(containment.client + 1);
});

for (const [path] of routes) {
  test(`${path} has no serious or critical axe violations`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('main')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    const blocking = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
}
