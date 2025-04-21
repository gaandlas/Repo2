import { test, expect } from '@playwright/test';
import { fillAndSubmitForm } from '../../../lib/pages/fill_RFI_form'; 
import { firstName, lastName, email, phoneNumber, zipcode, country, state, isAffiliate } from '../../../data/testData';  
import { SiteInfo, forEachSite } from '../../../data/siteData'; 

// Jenkins ENV_NAME parameter
const envName = process.env.ENV_NAME; 
// const envName = 'live'; // Local testing


forEachSite((site: SiteInfo) => {
  const { Affurl: liveUrl, SiteType: siteType, PantheonMachineName: pantheonMachineName, GravityForm: gravityForm, AffUtm: affUtm, AffSubdomain: affSubdomain } = site;

  if (siteType === 'LP' && gravityForm != 'TRUE' && affSubdomain != 'n/a') {
    // Construct the URL based on the ENV_NAME
    const url = envName == 'live'
      ? `${liveUrl}/${affUtm}`
      : `https://${envName}-${pantheonMachineName}.pantheonsite.io/${affSubdomain}/${affUtm}`;


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
    }

  } else {
    console.log(`No affiliate subdomain found for ${pantheonMachineName}`);
  }
});


