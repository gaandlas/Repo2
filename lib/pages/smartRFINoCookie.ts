import { test, expect, firefox } from '@playwright/test';

export async function smartRFINoCookie(url: string, program: string) {
  // Launch Firefox with cookie settings
  const browser = await firefox.launch({
    firefoxUserPrefs: {
      'network.cookie.cookieBehavior': 2,
    },
  });

  const context = await browser.newContext();
  const page = await context.newPage();


  // Navigate to the landing page URL
  const landingPageRfi = url+program;
  await page.goto(landingPageRfi);
  await context.clearCookies();

  // Check if the program dropdown is visible
  const programDropdown = page.locator('#fr-programs');
  await expect(programDropdown).toBeVisible();

  // Get the number of options in the dropdown and assert it's more than 1
  const options = await programDropdown.locator('option').count();
  expect(options).toBeGreaterThan(1);

  await browser.close();
};
