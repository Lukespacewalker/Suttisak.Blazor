import { expect, test } from '@playwright/test';

test('record editor keeps validated actions in the fixed drawer footer and submits with Enter', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 420 });
  await page.goto('/application-shell/records');

  await page.getByRole('button', { name: 'New record' }).click();

  const drawer = page.getByRole('dialog', { name: 'Record editor' });
  const body = drawer.locator('.app-drawer__body');
  const footer = drawer.locator('.app-drawer__surface > .app-drawer__footer');
  const form = body.locator('form#record-editor-form');
  const save = footer.getByRole('button', { name: 'Save record' });

  await expect(drawer).toBeVisible();
  await expect(form).toBeVisible();
  await expect(footer).toHaveCount(1);
  await expect(body.locator('.app-drawer__footer')).toHaveCount(0);
  await expect(body.getByRole('button', { name: 'Save record' })).toHaveCount(0);
  await expect(save).toHaveAttribute('type', 'submit');
  await expect(save).toHaveAttribute('form', 'record-editor-form');
  await expect(save).toBeDisabled();

  const beforeScroll = await drawer.evaluate((element) => {
    const drawerSurface = element.querySelector('.app-drawer__surface');
    const drawerBody = element.querySelector('.app-drawer__body');
    const drawerFooter = element.querySelector('.app-drawer__footer');
    const surfaceBox = drawerSurface.getBoundingClientRect();
    const footerBox = drawerFooter.getBoundingClientRect();

    return {
      footerTop: footerBox.top,
      footerBottom: footerBox.bottom,
      surfaceBottom: surfaceBox.bottom,
      bodyScrollable: drawerBody.scrollHeight > drawerBody.clientHeight
    };
  });

  expect(beforeScroll.bodyScrollable).toBe(true);
  expect(Math.abs(beforeScroll.footerBottom - beforeScroll.surfaceBottom)).toBeLessThanOrEqual(1);

  await body.evaluate((element) => { element.scrollTop = element.scrollHeight; });
  const afterScroll = await footer.evaluate((element) => element.getBoundingClientRect().top);
  expect(Math.abs(afterScroll - beforeScroll.footerTop)).toBeLessThanOrEqual(1);

  const recordName = form.getByRole('textbox', { name: 'Record name', exact: true });
  const program = form.getByRole('textbox', { name: 'Program', exact: true });
  const owner = form.getByRole('textbox', { name: 'Owner', exact: true });

  await recordName.fill('   ');
  await program.fill('Drawer workflow');
  await owner.fill('Browser coverage');
  await expect(save).toBeDisabled();

  await recordName.fill('Browser drawer record');
  await expect(save).toBeEnabled();
  await owner.press('Enter');

  await expect(drawer).not.toBeVisible();
  await expect(page.getByText('Browser drawer record', { exact: true })).toBeVisible();
});
