import { expect } from '@playwright/test';

// Shared choices expose the native input for semantics and a visible label
// for pointer interaction. Click that label rather than the clipped input.
export async function setCheckbox(checkbox, checked) {
  if (await checkbox.isChecked() !== checked) {
    await checkbox.locator('..').click();
  }
  await expect(checkbox).toBeChecked({ checked });
}
