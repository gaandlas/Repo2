import { Page, expect, BrowserContext } from '@playwright/test';

export async function verifyDefaultRfi(page: Page, context: BrowserContext, liveUrl: string, singleProgramUrl: string) {
  // Open browser and navigate to the live URL
  await page.goto(liveUrl);
  await page.waitForLoadState('load');

  // Get the smart_rfi_uuid cookie value
  const cookies = await context.cookies();
  console.log(cookies); // Log all cookies for debugging
  const smartRfiCookie = cookies.find(cookie => cookie.name === 'smart_rfi_uuid');
  const uuid = smartRfiCookie?.value;
  console.log(`smart_rfi_uuid: ${uuid}`);

  // Navigate to the Single Program URL from the site data
  await page.goto(`${liveUrl}${singleProgramUrl}`);

  // Get the value of the selected option in the dropdown
  const selectedValue = await page.getAttribute('select#program', 'value');

  // Compare the UUID from the cookie with the selected option
  console.log(`Comparing ${uuid} to ${selectedValue}`);
  expect(selectedValue).toBe(uuid);
}