import { expect, test } from '@playwright/test';

async function expectReadableMenu(menu, title, subtitle) {
  const titleText = menu.getByText(title, { exact: true });
  const subtitleText = menu.getByText(subtitle, { exact: true });
  await expect(titleText).toBeVisible();
  await expect(subtitleText).toBeVisible();

  await expect.poll(async () => {
    const titleBox = await titleText.boundingBox();
    const subtitleBox = await subtitleText.boundingBox();
    return subtitleBox.y - (titleBox.y + titleBox.height);
  }, { message: 'The subtitle must start below the title' }).toBeGreaterThanOrEqual(0);

  expect(await menu.evaluate(element => element.scrollWidth <= element.clientWidth + 1),
    'Menu content must fit within its container').toBe(true);
}

for (const appearance of ['standard', 'essential', 'quiet-luxury']) {
  for (const mode of ['light', 'dark']) {
    test(`CardMenu keeps title and subtitle readable in ${appearance} ${mode}`, async ({ page }) => {
      const brands = appearance === 'quiet-luxury'
        ? ['mentalinsight', 'healthinsight', 'audiogramiq']
        : ['mentalinsight'];

      for (const theme of brands) {
        await page.goto(`/specimens/card-menu?appearance=${appearance}&theme=${theme}&mode=${mode}`);
        const menu = page.getByRole('button', { name: 'Open participant settings' });
        for (const width of [1440, 320]) {
          await page.setViewportSize({ width, height: 1000 });
          await expectReadableMenu(menu, 'Participant settings', 'Profile, preferences, and access');
        }

        const longTitle = 'ParticipantSettingsAndPreferences'.repeat(4);
        const longSubtitle = 'รายละเอียดการตั้งค่าและการเข้าถึงข้อมูลสำหรับผู้ใช้งาน'.repeat(4);
        await page.getByLabel('Menu title', { exact: true }).fill(longTitle);
        await page.getByLabel('Menu subtitle', { exact: true }).fill(longSubtitle);
        await expectReadableMenu(menu, longTitle, longSubtitle);

        await page.getByLabel('Menu title', { exact: true }).fill('Participant settings');
        await page.getByLabel('Menu subtitle', { exact: true }).fill('Profile, preferences, and access');
        await menu.focus();
        await menu.press('Enter');
        await expect(page.getByTestId('layout-status')).toHaveText('Participant settings selected.');
        await menu.press('Space');
        await expect(menu).toBeFocused();
        expect(await menu.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none');
      }
    });
  }
}
