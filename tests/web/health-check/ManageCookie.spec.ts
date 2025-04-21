import { test, expect } from '@playwright/test';

test('Oasano', async ({ page, context }) => {
  try {
    const viewportWidth = 1900; // Adjust as needed for your screen
    const viewportHeight = 1000; // Adjust as needed for your screen
    await page.setViewportSize({ width: viewportWidth, height: viewportHeight });

    // Step 3: Go to the URL with UTM parameters
    const url = 'https://hub.birmingham.ac.uk/?osano_v=two&utm_source=audience&utm_medium=mediatest&utm_campaign=QA&uadgroup=uadgrouptest&uAdCampgn=uadcampgntest&utm_term=urefkeywordtest&event=eventTest0&promotion=promoTest1&partnership=partnerTest2&ae=lb1&utm_content=testcontent';
    await page.goto(url);

    // Step 4: Wait for the cookie consent dialog to appear (waiting for a specific element with a given selector)
    await page.waitForSelector('.osano-cm-window__dialog', { timeout: 10000 });
    await page.waitForTimeout(2000);


    // Step 5: Click "Accept All" button (if visible)
    const acceptButton = await page.$('button.osano-cm-accept-all');
    if (acceptButton) {
      console.log('Clicking "Accept All" button...');
      await acceptButton.click();
    } else {
      console.log('Accept All button not found.');
    }
    await page.waitForTimeout(2000);

    // Step 6: Optional - Check for cookies after accepting
    const cookies = await context.cookies();
    console.log('Cookies after accepting consent:', cookies);

  } catch (error) {
    console.error('Error during the test:', error);
  } finally {
    // Step 7: Close page after operations
    await page.close(); 
  }
 
});
