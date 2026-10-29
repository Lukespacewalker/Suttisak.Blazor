import { expect, test } from '@playwright/test';

const host = `http://127.0.0.1:${process.env.CULTURE_TEST_PORT ?? '5175'}`;
async function chooseCulture(page, name, keyboard = false) {
  const button = page.getByRole('button', { name });
  await Promise.all([page.waitForEvent('load'), keyboard ? button.press('Enter') : button.click()]);
}
for (const [mode, runtime] of [['static', 'Static'], ['server', 'Server'], ['wasm', 'WebAssembly']]) {
  test(`${mode}: one language selection preserves the live route and applies the culture`, async ({ page }) => {
    await page.goto(`${host}/test-app/probe/${mode}/landing`);
    await expect(page.getByTestId('runtime')).toHaveText(runtime);
    await page.getByRole('link', { name: 'Open person' }).click();
    const destination = `${host}/test-app/probe/${mode}/person%20one?visit=a%26b&next=%2Freports%3Fx%3D1#result`;
    await expect(page).toHaveURL(destination);
    await chooseCulture(page, 'ใช้ภาษาไทย', true);
    await expect(page).toHaveURL(destination);
    await expect(page.getByTestId('runtime')).toHaveText(runtime);
    await expect(page.getByRole('heading', { name: 'ผลตรวจ' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ใช้ภาษาไทย' })).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(page.getByTestId('culture')).toHaveText('th-TH');
    await chooseCulture(page, 'Use English');
    await expect(page).toHaveURL(destination);
    await expect(page.getByRole('heading', { name: 'Test results' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Use English' })).toHaveAttribute('aria-pressed', 'true');
  });
}

for (const mode of ['static', 'server']) {
  test(`${mode}: stale local storage cannot claim Thai while the rendered content is English`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('BlazorCulture', 'th'));
    await page.goto(`${host}/test-app/probe/${mode}/landing`);
    await expect(page.getByRole('heading', { name: 'Test results' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Use English' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'ใช้ภาษาไทย' })).toHaveAttribute('aria-pressed', 'false');
  });
}

for (const [mode, runtime] of [['static', 'Static'], ['server', 'Server'], ['wasm', 'WebAssembly']]) {
  test(`${mode}: Auto applies the device language once after an explicit choice`, async ({ browser }) => {
    const context = await browser.newContext({ locale: 'th-TH' });
    const page = await context.newPage();
    await page.goto(`${host}/test-app/probe/${mode}/landing`);
    await expect(page.getByTestId('runtime')).toHaveText(runtime);
    await chooseCulture(page, 'Use English');
    await expect(page.getByTestId('culture')).toHaveText('en-US');
    await chooseCulture(page, 'Use device language');
    await expect(page.getByTestId('runtime')).toHaveText(runtime);
    await expect(page.getByTestId('culture')).toHaveText('th-TH');
    await expect(page.getByRole('button', { name: 'Use device language' })).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('BlazorCulture'))).toBe('auto');
    await context.close();
  });
}

test('static: native form works without JavaScript and keeps encoded query values', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const destination = `${host}/test-app/probe/static/person%20one?visit=a%26b`;
  await page.goto(destination);
  await chooseCulture(page, 'ใช้ภาษาไทย');
  await expect(page).toHaveURL(destination);
  await expect(page.getByRole('heading', { name: 'ผลตรวจ' })).toBeVisible();
  await context.close();
});

for (const [mode, runtime] of [['server', 'Server'], ['wasm', 'WebAssembly']]) {
test(`${mode}: storage unavailable does not prevent one-click culture changes`, async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } });
  });
  await page.goto(`${host}/test-app/probe/${mode}/landing`);
  await expect(page.getByTestId('runtime')).toHaveText(runtime);
  await chooseCulture(page, 'ใช้ภาษาไทย');
  await expect(page.getByTestId('runtime')).toHaveText(runtime);
  await expect(page.getByTestId('culture')).toHaveText('th-TH');
  await expect(page.getByRole('button', { name: 'ใช้ภาษาไทย' })).toHaveAttribute('aria-pressed', 'true');
});
}

test('Auto leaves the server free to follow a changed device language', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'th-TH' });
  const page = await context.newPage();
  await page.goto(`${host}/test-app/probe/server/landing`);
  await expect(page.getByTestId('runtime')).toHaveText('Server');
  await chooseCulture(page, 'Use device language');
  await expect(page.getByTestId('culture')).toHaveText('th-TH');
  // A restarted browser changes both HTTP and WebSocket language headers.
  const nextContext = await browser.newContext({ locale: 'en-US', storageState: await context.storageState() });
  const nextPage = await nextContext.newPage();
  await nextPage.goto(`${host}/test-app/probe/server/landing`);
  await expect(nextPage.getByTestId('runtime')).toHaveText('Server');
  await expect(nextPage.getByTestId('culture')).toHaveText('en-US');
  await expect(nextPage.getByRole('button', { name: 'Use device language' })).toHaveAttribute('aria-pressed', 'true');
  await nextContext.close();
  await context.close();
});

test('standalone WebAssembly applies explicit and Auto culture through its client endpoint', async ({ page }) => {
  await page.goto('/components/culture-selector?visit=a%26b#playbook-main-content');
  const destination = page.url();
  const specimen = page.getByTestId('preferences-workbench');
  await specimen.locator('[data-shell-preference="language"]').click();
  await specimen.getByRole('button', { name: 'ใช้ภาษาไทย' }).click();
  await expect(page).toHaveURL(destination);
  await expect(specimen.locator('[data-culture-selector]').first()).toHaveAttribute('data-current-culture', 'th-TH');
  await specimen.locator('[data-shell-preference="language"]').click();
  await specimen.getByRole('button', { name: 'Use device language' }).click();
  await expect(page).toHaveURL(destination);
  await expect(specimen.locator('[data-culture-selector]').first()).toHaveAttribute('data-current-culture', 'en-US');
});
