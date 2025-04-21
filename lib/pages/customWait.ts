import { Page } from '@playwright/test';

export async function waitForThankYouPage(page: Page, timeout = 60000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      // Check if URL contains "thank-you"
      const currentUrl = page.url();
      const urlContainsThankYou = currentUrl.includes('thank-you');

      // Check if there's an H1 with "Thank You" text
      const h1WithThankYou = await page.$(
        'h1:has-text("Thank You"), h1:has-text("thank you"), h1:has-text("Thanks"), h1:has-text("thanks")'
      ).then(element => !!element);

    //   // Check if utag_data is available
    //   const utagAvailable = await page.evaluate(() => {
    //     return !!(window as any).utag_data;
    //   });

      // Log the status of each check
      console.log(`URL contains "thank-you": ${urlContainsThankYou}`);
      console.log(`H1 with "Thank You" exists: ${h1WithThankYou}`);
    //   console.log(`utag_data available: ${utagAvailable}`);

      // If any of the conditions are true, consider it a success
      if (urlContainsThankYou || h1WithThankYou) {
        console.log('Thank You page detected');
        return true;
      }

      console.log('Waiting for Thank You page...');
    } catch (error) {
      console.log('Error while checking for Thank You page:', error);
    }

    await page.waitForTimeout(1000); // Wait for 1 second before trying again
  }

  throw new Error('Timed out waiting for Thank You page');
}
