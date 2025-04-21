import { test, expect } from '@playwright/test';
import { fillAndSubmitForm } from '../../../lib/pages/fill_RFI_form'; 
import { firstName, lastName, email, phoneNumber, zipcode, country, state, isAffiliate } from '../../../data/testData';  
import { SiteInfo, forEachSite } from '../../../data/siteData'; 

// Jenkins ENV_NAME parameter
const envName = process.env.ENV_NAME; 
// const envName = 'live'; // Local testing


forEachSite((site: SiteInfo) => {
  const { "RURL": liveUrl, TealiumProfile: tealiumProfile, FormType: formType, SiteType: siteType, PantheonMachineName: pantheonMachineName, RURLSubdomain: subdomain, GravityForm: gravityForm, utm: utm } = site;

  // Construct the URL based on the ENV_NAME
  const url = envName == 'live'
    ? `${liveUrl}${utm}`
    : `https://${envName}-${pantheonMachineName}.pantheonsite.io/${subdomain}${utm}`;

  if (gravityForm == 'TRUE') {
      console.log(`Gravity Form found for ${url}`);
  } else {
    try {
      test(`RFI form submission and validation for ${url}`, async ({ page }) => {
        await page.goto(url);
        await fillAndSubmitForm(page, siteType);
      });
    } catch (error) {
      console.log(error);
    }

}});


