import { test, expect, firefox } from '@playwright/test';

// The function similar to your Katalon test with cookie handling
export async function smartRFIWithCookie(baseUrl: string, landingPageRfi: string) {
  // Launch Firefox with cookie settings
  const browser = await firefox.launch({
    firefoxUserPrefs: {
      'network.cookie.cookieBehavior': 0, // Allow cookies
    },
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Open the browser with the combined URL
  const fullUrl = baseUrl + landingPageRfi;
  await page.goto(fullUrl);

  // Verify that the program element is NOT present
  const programElement = page.locator('#fr-programs');
  await expect(programElement).not.toBeVisible({ timeout: 0 });

  const utag = await page.evaluate(() => (window as any).utag_data);


  // Retrieve the `program_uuid` value via JavaScript execution
  const programUUID = utag['program_uuid'];
  console.log(`Program UUID: ${programUUID}`);

  // Assert that the programUUID is not null
  expect(programUUID).toBeTruthy();

  // Access the cookie and compare it with the program UUID
  const cookies = await context.cookies();
  const smartRfiCookie = cookies.find(cookie => cookie.name === 'smart_rfi_uuid');
  console.log(`smart_rfi_uuid: ${smartRfiCookie?.value}`);

  // Assert that the cookie value matches the programUUID
  expect(smartRfiCookie?.value).toBe(programUUID);

  await browser.close();
};
