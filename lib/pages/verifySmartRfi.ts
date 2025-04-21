import { Page, expect } from '@playwright/test';

export async function verifySmartRfi(page: Page, context: BrowserContext) {
  const baseUrl = '<BASE_URL>'; // Replace with the actual base URL

  // Open browser, set viewport, and navigate to the sitemap
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${baseUrl}/sitemap.xml`);
  await page.waitForLoadState('load');

  // Check if the program resource link is visible and click it
  const programResourceLink = page.locator('a:has-text("Program Resource Sitemap Link")');
  if (await programResourceLink.isVisible()) {
    await programResourceLink.click();
    await page.waitForLoadState('load');
  }

  // Get the smart_rfi_uuid cookie value
  const cookies = await context.cookies();
  const smartRfiCookie = cookies.find(cookie => cookie.name === 'smart_rfi_uuid');
  const uuid = smartRfiCookie?.value;

  // Navigate to the RFI page and compare the UUID with the selected option
  await page.goto('<RFI_PAGE_URL>'); // Replace with the actual RFI page URL
  const selectedValue = await page.getAttribute('select#program', 'value');

  console.log(`Comparing ${uuid} to ${selectedValue}`);
  expect(selectedValue).toBe(uuid);
}
