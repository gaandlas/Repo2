import { Page, expect } from '@playwright/test';

export async function verifyProgramDropdown(page: Page) {
  await page.goto('<RFI_PAGE_URL>'); // Replace with the actual RFI page URL

  // Get the selected option count
  const selectedOptionCount = await page.evaluate(() => {
    return document.querySelectorAll('select#program option:checked').length;
  });

  // Assert that there is at least one selected option
  expect(selectedOptionCount).not.toBe(0);
}
