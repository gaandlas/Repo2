import { test, expect } from '@playwright/test';

test('Ensure cookie handling and form submission with Osano consent', async ({ page, context }) => {
  // Clear cookies at the start of the test
  await context.clearCookies();

  // Navigate to the site with UTM parameters and osano_v variant
  const url = 'https://hub.birmingham.ac.uk/?osano_v=two&utm_source=audience&utm_medium=mediatest&utm_campaign=QA&uadgroup=uadgrouptest&uAdCampgn=uadcampgntest&utm_term=urefkeywordtest&event=eventTest0&promotion=promoTest1&partnership=partnerTest2&ae=lb1&utm_content=testcontent';
  await page.goto(url, { waitUntil: 'load' });

  // Wait for the cookie consent banner to appear
  await page.waitForSelector('.osano-cm-window__dialog', { timeout: 10000 });

  // Verify that STYXKEY_CONSENTMGR cookie is not set initially
  const cookiesBeforeConsent = await context.cookies();
  let consentCookie = cookiesBeforeConsent.find(cookie => cookie.name === 'STYXKEY_CONSENTMGR');
  console.log('STYXKEY_CONSENTMGR cookie before consent:', consentCookie);

  //  Click "Accept All" button in the consent banner
  const acceptButton = await page.locator('button.osano-cm-accept-all');
  await acceptButton.click();

  // Verify that STYXKEY_CONSENTMGR cookie has been updated
  const cookiesAfterConsent = await context.cookies();
  consentCookie = cookiesAfterConsent.find(cookie => cookie.name === 'STYXKEY_CONSENTMGR');
  console.log('STYXKEY_CONSENTMGR cookie after consent:', consentCookie);

  // Validate cookie value for osano:true 
  expect(consentCookie.value).toContain('osano:true');
 

  // Wait for the button to appear
  const buttonLocator = page.locator('a.tux-c-button--narrow.tux-c-button.tux-c-button--primary');
  
  // Optionally, you can wait until it's visible and clickable
  await buttonLocator.waitFor({ state: 'visible' });

  // Click the button
  await buttonLocator.click();

  // Check if the program dropdown exists and select the program
  const programSelector = '#fr-programs'; // Replace with actual selector of your program dropdown
  const programExists = await page.isVisible(programSelector);

  let programUuid = '';
  if (programExists) {
    // Select the first option (you can adjust the index as needed)
    await page.selectOption(programSelector, { index: 1 });
    programUuid = await page.getAttribute(programSelector, 'value'); // Get selected program UUID
  } else {
    // Fallback if the dropdown doesn't exist
    //programUuid = process.env.PROGRAM_UUID || 'defaultProgramUuid';
    programUuid = process.env.PROGRAM_UUID || '69e322ac-2ba1-1023-4c99-f36b62933cf';
  }
  
  console.log('Program UUID selected:', programUuid); 


  // Fill out the form
  const firstName = 'Abc'; 
  const lastName = 'ef';   
  const email = 'abcdef@test.com';  
  const phoneNumber = '5109431001';  
  const zipcode = '12345';   
  const country = 'United States of America';  
  const state = 'New York';  
  await page.fill('input[id="fr-first-name"]', firstName);
  await page.fill('input[id="fr-last-name"]', lastName);
  await page.fill('input[id="fr-email"]', email);
  await page.fill('input[id="fr-phone"]', phoneNumber);
  
  // Select country and state (if available)
  await page.selectOption('select[id="fr-country"]', { label: country });
  if (state) {
    await page.selectOption('select[id="fr-state"]', { label: state });
  }
  await page.locator('.fr-form-qualifier-checkbox').click();


  const button = await page.locator('button:has-text("Request Info")');
  await button.click();

  await page.waitForTimeout(2000);
  await page.close(); 

/*
  
  // Check that cookies are created after submission
  const cookiesAfterSubmission = await context.cookies();
  const jwmUidCookie = cookiesAfterSubmission.find(cookie => cookie.name === 'STYXKEY_jwm_uid');
  const jwmPcCookie = cookiesAfterSubmission.find(cookie => cookie.name === 'jwm_pc');
  const jwmPuuidCookie = cookiesAfterSubmission.find(cookie => cookie.name === 'jwm_puuid');

  console.log('Cookies after RFI submission:', {
    jwmUidCookie,
    jwmPcCookie,
    jwmPuuidCookie
  });

  //  Verify the cookies are set with expected values 
       expect(jwmUidCookie).toBeDefined();
       expect(jwmPcCookie).toBeDefined();
       expect(jwmPuuidCookie).toBeDefined();

  // Close and reopen the browser without clearing cookies
  await page.close();
  const newContext = await page.newContext();
  const newPage = await newContext.newPage();

  // Visit the same URL
  await newPage.goto('https://hub.birmingham.ac.uk/');

  //  Verify that cookies are still set (STYXKEY_CONSENTMGR, STYXKEY_jwm_uid, jwm_pc, jwm_puuid)
  const cookiesOnRevisit = await newContext.cookies();
  console.log('Cookies after reopening browser:', cookiesOnRevisit);

  expect(cookiesOnRevisit.some(cookie => cookie.name === 'STYXKEY_CONSENTMGR')).toBeTruthy();
  expect(cookiesOnRevisit.some(cookie => cookie.name === 'STYXKEY_jwm_uid')).toBeTruthy();
  expect(cookiesOnRevisit.some(cookie => cookie.name === 'jwm_pc')).toBeTruthy();
  expect(cookiesOnRevisit.some(cookie => cookie.name === 'jwm_puuid')).toBeTruthy();

  //Select Cookie Preferences link and open preferences window
  await newPage.locator('a#cookie-preferences').click();

  //  Wait for the preferences modal to appear
  await newPage.waitForSelector('div.cookie-preferences-modal');

  // Unselect "Personalization" and save
  await newPage.locator('input#personalization').uncheck();
  await newPage.locator('button#save-preferences').click();

  //  Verify that STYXKEY_CONSENTMGR cookie has been updated  and other cookies are gone
  const cookiesAfterPreferenceChange = await newContext.cookies();
  consentCookie = cookiesAfterPreferenceChange.find(cookie => cookie.name === 'STYXKEY_CONSENTMGR');
  const otherCookies = cookiesAfterPreferenceChange.filter(cookie => !['STYXKEY_CONSENTMGR', 'STYXKEY_jwm_uid', 'jwm_pc', 'jwm_puuid'].includes(cookie.name));

  console.log('Cookies after changing preferences:', {
    consentCookie,
    otherCookies
  });

  expect(consentCookie.value).toContain('c3:0');
  expect(otherCookies.length).toBe(0);

  // Step 20: Submit RFI again and verify that other cookies are not recreated
  await newPage.locator('button#submit-rfi').click();
  const cookiesAfterSecondRFI = await newContext.cookies();
  expect(cookiesAfterSecondRFI.some(cookie => cookie.name === 'STYXKEY_jwm_uid')).toBeFalsy();
  expect(cookiesAfterSecondRFI.some(cookie => cookie.name === 'jwm_pc')).toBeFalsy();
  expect(cookiesAfterSecondRFI.some(cookie => cookie.name === 'jwm_puuid')).toBeFalsy();

  // Close the browser after the test
  await newPage.close();  */
});
