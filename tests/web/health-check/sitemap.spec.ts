import { test } from '@playwright/test';
import { checkSitemapHealth } from '../../../lib/pages/checkSitemapHealth';
import { SiteInfo, forEachSite } from '../../../data/siteData'; 


// Jenkins ENV_NAME parameter
//const envName = process.env.ENV_NAME; 
 const envName = 'live'; // Local testing

forEachSite((site: SiteInfo) => {
  const { "URL": liveUrl, FormType: formType, SiteType: siteType, PantheonMachineName: pantheonMachineName } = site;

  // Construct the URL based on the ENV_NAME
  const url = envName == 'live'
    ? `${liveUrl}`
    : `https://${envName}-${pantheonMachineName}.pantheonsite.io`;

  test(`Sitemap End-to-End Test for ${url}/sitemap_index.xml`, async ({ page, context }) => {
    if (siteType === 'Microsite') {
      await checkSitemapHealth(page, url);
    }
    else if (siteType === 'LP') {
      console.log("LP does not need a sitemap");
    }
  });
});


