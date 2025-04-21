import { test } from '@playwright/test';
import { smartRFINoCookie } from '../../../lib/pages/smartRFINoCookie';
import { smartRFIWithCookie } from '../../../lib/pages/smartRFIWithCookie'; 
import { smartRFIMicrosite } from '../../../lib/pages/smartRFIMicrosite'; 
import { SiteInfo, forEachSite } from '../../../data/siteData'; 

// Jenkins ENV_NAME parameter
const envName = process.env.ENV_NAME; 
 //const envName = 'live'; // Local testing

forEachSite((site: SiteInfo) => {
  const { URL: baseUrl, RURL: RFIPage, TealiumProfile: tealiumProfile, FormType: formType, SiteType: siteType, PantheonMachineName: pantheonMachineName, RURLSubdomain: subdomain, SingleProgramURL: singleProgramUrl, UUID: UUID, Affurl: affUrl, GravityForm: gravityForm } = site;
  if (gravityForm == 'TRUE') {
    console.log(`Gravity Form found for ${baseUrl}`);
} else {
  test(`Smart RFI End-to-End Test for ${baseUrl}${singleProgramUrl}`, async ({ page, context }) => {
    if (siteType === 'Microsite') {
      await smartRFIMicrosite(baseUrl, affUrl, RFIPage, UUID);

    } else if (siteType === 'LP') {
      await smartRFINoCookie(baseUrl, singleProgramUrl);
      await smartRFIWithCookie(baseUrl, singleProgramUrl);
    }
  });
}});
