import { test, expect, firefox } from '@playwright/test';

// The function that mirrors the Katalon test, checking program UUID and cookie
export async function smartRFIMicrosite(baseUrl: string, startingPage: string, rfiPage: string, expectedUUID: string) {
  // Launch Firefox with cookie settings
  const browser = await firefox.launch({
    firefoxUserPrefs: {
      'network.cookie.cookieBehavior': 0, // Allow cookies
    },
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Open the browser and navigate to the starting page
  const startingPageUrl = baseUrl + startingPage;
  await page.goto(startingPageUrl);

  // Retrieve the `program_uuid` value via JavaScript execution
  const programUUID = await page.evaluate(() => (window as any).utag_data.program_uuid);
  console.log(`Program UUID: ${programUUID}`);

  // Assert that the programUUID matches the expectedUUID
  expect(programUUID).toBe(expectedUUID);

  // Navigate to the RFI page
  await page.goto(rfiPage);

  // Assert that the `smart_rfi_uuid` cookie is present
  const cookies = await context.cookies();
  const smartRfiCookie = cookies.find(cookie => cookie.name === 'smart_rfi_uuid');
  console.log(`smart_rfi_uuid: ${smartRfiCookie?.value}`);

  expect(smartRfiCookie?.value).toBeTruthy();

  // Assert that the `smart_rfi_uuid` cookie value matches the programUUID
  expect(smartRfiCookie?.value).toBe(programUUID);

  // Verify the form's Program dropdown value matches the `smart_rfi_uuid` cookie
  const dropdownValue = await page.locator('select#fr-programs').evaluate(el => el.value);
  expect(dropdownValue).toBe(smartRfiCookie?.value);  

  // Verify the form's Program dropdown value matches the programUUID
  expect(dropdownValue).toBe(programUUID);

  await browser.close();
};
