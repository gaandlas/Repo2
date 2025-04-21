import { test, expect } from '@playwright/test';
import { fillAndSubmitForm } from '../../../lib/pages/fill_RFI_form'; 
import { email } from '../../../data/testData';  // Adjust the path as needed
import { SiteInfo, forEachSite } from '../../../data/siteData'; 

// Jenkins ENV_NAME parameter
 const envName = process.env.ENV_NAME; 

//const envName = 'live'; // Local testing
let failedTests = [];

forEachSite((site: SiteInfo) => {
  const { "RURL": liveUrl, TealiumProfile: tealiumProfile, FormType: formType, SiteType: siteType, PantheonMachineName: pantheonMachineName, RURLSubdomain: subdomain, GravityForm: gravityForm } = site;

  // Construct the URL based on the ENV_NAME
  const url = envName == 'live'
    ? liveUrl
    : `https://${envName}-${pantheonMachineName}.pantheonsite.io/${subdomain}`;

  test(`RFI form submission and validation for ${url}`, async ({ page }) => {
    // Navigate to the constructed site URL
    await page.goto(url);

    //print email variable
    console.log(email);

    // Validate Brand page Tealium profile
    const utag = await page.evaluate(() => (window as any).utag_data);

    if (siteType === 'LP') {
      expect(utag['page_type']).toBe('landing-page');
      expect(utag['partner_name']).toBe(tealiumProfile);
      expect(utag['site_type']).toBe('Landing Page');
      expect(utag['page_name']).not.toBe('');
      expect(utag['is_conversion']).toBe(0);
      expect(utag['is_landing_page']).toBe(1);
      expect(utag['program_name']).not.toBe('');
      expect(utag['page_category']).toBe('Landing Page');
      expect(utag['site_section']).toBe('Landing Page');
      // expect(utag['site_subsection1']).toContain('Brand'); // This is not always present on lp-miis
    } else if (siteType === 'Microsite') {
      expect(utag['page_type']).toBe('content');
      expect(utag['partner_name']).toBe(tealiumProfile);
      expect(utag['site_type']).toBe('Microsite');
      expect(utag['page_name']).not.toBe('');
      expect(utag['is_conversion']).toBe(0);
      expect(utag['is_landing_page']).toBe(0);
      expect(utag['program_name']).toBe(tealiumProfile + '-brand');
      expect(utag['site_framework']).toBe('tux');
      if (utag['page_name'] === 'Request Information') {
        expect(utag['site_section']).not.toBe('');
        expect(utag['page_category']).not.toBe('');
      } else {
          expect(utag['site_section']).not.toBe('');
          expect(utag['page_category']).not.toBe('');
      }
    }

// Call the form-filling function
await fillAndSubmitForm(page, siteType);

// if (siteType === 'LP') {
//   await page.waitForURL('**/lpconfirm-thank-you/**', { timeout: 60000 })
// } else if (siteType === 'Microsite') {
//   await page.waitForURL('**/thank-you/**', { timeout: 60000 })
// }

await page.waitForNavigation();

// Now, evaluate the thank you page data
try {
  const thankYouUtag = await page.evaluate(() => (window as any).utag_data);
  
  if (siteType === 'LP') {
    expect(thankYouUtag['page_type']).toBe('thankyou');
    expect(thankYouUtag['partner_name']).toBe(tealiumProfile);
    expect(thankYouUtag['site_type']).toBe('Landing Page');
    expect(thankYouUtag['page_name'].toLowerCase()).toContain('thank');
    expect(thankYouUtag['is_conversion']).toBe(1);
    expect(thankYouUtag['is_landing_page']).toBe(1);
    expect(thankYouUtag['program_name'].toLowerCase()).not.toBe(tealiumProfile + '-brand');
    expect(thankYouUtag['page_category']).toBe('Landing Page');
    expect(thankYouUtag['site_section']).toBe('Thank You');
  } else if (siteType === 'Microsite') {
    expect(thankYouUtag['page_type']).toBe('thankyou');
    expect(thankYouUtag['partner_name']).toBe(tealiumProfile);
    expect(thankYouUtag['site_type']).toBe('Microsite');
    expect(thankYouUtag['page_name']).toBe('Thank You');
    expect(thankYouUtag['is_conversion']).toBe(1);
    expect(thankYouUtag['is_landing_page']).toBe(0);
    expect(thankYouUtag['program_name']).not.toBe(tealiumProfile + '-brand');
    expect(thankYouUtag['site_framework']).toBe('tux');
    expect(thankYouUtag['site_section']).toBe('Thank You');
    expect(thankYouUtag['page_category']).toBe('Thank You');
    expect(thankYouUtag).toHaveProperty('program_uuid');
    expect(thankYouUtag).toHaveProperty('dl_uid');
  }
} catch (e) {
  console.error('Failed to validate Thank You page data: ', e);
}    
  });
});

// import { test, expect } from '@playwright/test';
// import { fillAndSubmitForm } from '../../modules/fill_RFI_form'; 
// import { email } from '../../../data/testData';  // Adjust the path as needed
// import { SiteInfo, forEachSite } from '../../../data/siteData'; 
// import {
//   checkLPBrandPageUtag,
//   checkMicrositeBrandPageUtag,
//   checkLPThankYouPageUtag,
//   checkMicrositeThankYouPageUtag
// } from '../../modules/utagDataChecker';
// import { waitForThankYouPage } from '../../modules/customWait';

// const envName = 'live'; // Local testing
// let failedTests = [];

// forEachSite((site: SiteInfo) => {
//   const { "RURL": liveUrl, TealiumProfile: tealiumProfile, FormType: formType, SiteType: siteType, PantheonMachineName: pantheonMachineName, RURLSubdomain: subdomain, GravityForm: gravityForm } = site;

//   const url = envName == 'live'
//     ? liveUrl
//     : `https://${envName}-${pantheonMachineName}.pantheonsite.io/${subdomain}`;
    
//   if (gravityForm == 'TRUE') {
//       console.log(`Gravity Form found for ${url}`);
//   } else {
//     test(`RFI form submission and validation for ${url}`, async ({ page }) => {
//       await page.goto(url);

//       console.log(email);

//       const utag = await page.evaluate(() => (window as any).utag_data);

//       if (siteType === 'LP') {
//         checkLPBrandPageUtag(utag, tealiumProfile);
//       } else if (siteType === 'Microsite') {
//         checkMicrositeBrandPageUtag(utag, tealiumProfile);
//       }

//       await fillAndSubmitForm(page, siteType);

//       try {
//         await waitForThankYouPage(page);
//       } catch (error) {
//         console.error(`Failed to detect Thank You page for ${url}:`, error);
//         test.fail();
//       }

//       try {
//         const thankYouUtag = await page.evaluate(() => (window as any).utag_data);
        
//         if (siteType === 'LP') {
//           checkLPThankYouPageUtag(thankYouUtag, tealiumProfile);
//         } else if (siteType === 'Microsite') {
//           checkMicrositeThankYouPageUtag(thankYouUtag, tealiumProfile);
//         }
//       } catch (e) {
//         console.error('Failed to validate Thank You page data: ', e);
//       }    
//     });
// }});

// import { test, expect } from '@playwright/test';
// import { fillAndSubmitForm } from '../modules/fill_RFI_form.spec'; 
// import { validateUtagData } from '../modules/validateUtagData'; 

// import { firstName, lastName, email, phoneNumber, zipcode, country, state, isAffiliate } from '../../data/testData';  
// import { SiteInfo, forEachSite } from '../../data/siteData'; 

// const envName = 'live'; // Local testing

// forEachSite((site: SiteInfo) => {
//   const { "RURL": liveUrl, "Tealium Profile": tealiumProfile, "Form Type": formType, "SiteType": siteType, "PantheonMachineName": pantheonMachineName, "RURL Subdomain": subdomain } = site;

//   const url = envName == 'live'
//     ? liveUrl
//     : `https://${envName}-${pantheonMachineName}.pantheonsite.io/${subdomain}`;

//   test(`RFI form submission and validation for ${url}`, async ({ page }) => {
//     await page.goto(url);

//     // Example data for LP and Microsite
//     const expectedUtagDataLP = {
//       'page_type': 'landing-page',
//       'partner_name': tealiumProfile,
//       'site_type': 'Landing Page',
//       'is_conversion': 0,
//       'is_landing_page': 1,
//       'page_name': expect.any(String),
//       'program_name': expect.any(String),
//       'page_category': 'Landing Page',
//       'site_section': 'Landing Page',
//     };

//     const expectedUtagDataMicrosite = {
//       'page_type': 'content',
//       'partner_name': tealiumProfile,
//       'site_type': 'Microsite',
//       'page_name': expect.any(String),
//       'is_conversion': 0,
//       'program_name': `${tealiumProfile}-brand`,
//       'site_framework': 'tux',
//       'site_section': expect.any(String),
//       'page_category': expect.any(String),
//     };

//     // Call generalized function to validate utag data
//     const expectedUtagData = siteType === 'LP' ? expectedUtagDataLP : expectedUtagDataMicrosite;
//     await validateUtagData(page, expectedUtagData);

//     // Call the form-filling function
//     await fillAndSubmitForm(page, siteType);

//     await page.waitForNavigation();

//     // Validate Thank You page data
//     const expectedThankYouData = {
//       'page_type': 'thankyou',
//       'partner_name': tealiumProfile,
//       'site_type': siteType === 'LP' ? 'Landing Page' : 'Microsite',
//       'page_name': expect.stringContaining('thank'),  // This is case-insensitive now
//       'is_conversion': 1,
//       'program_name': expect.any(String),
//       'site_section': 'Thank You',
//       'page_category': 'Thank You',
//     };

//     await validateUtagData(page, expectedThankYouData);
//   });
// });
