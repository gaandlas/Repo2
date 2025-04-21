import { test, expect } from '@playwright/test';
import { SiteInfo, forEachSite } from '../../../data/siteData';

// Jenkins ENV_NAME parameter
const envName = process.env.ENV_NAME;
// const envName = 'live'; // Local testing

// Iterate through each site
forEachSite((site: SiteInfo) => {
  const {URL:baseUrl, SiteType: siteType,"PantheonMachineName": pantheonMachineName}= site;
  // Construct the URL based on the ENV_NAME
  const url = envName == 'live'
  ? baseUrl
  : `https://${envName}-${pantheonMachineName}.pantheonsite.io/`;
  
  // Start a new test for each site
   test(`SEO End-to-End Test for ${url}`, async ({ page, context }) => {
    //await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.goto(url);
  
      const expectedMetaTags = {
        Microsite: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        LP: 'noindex, nofollow'
      };

      
    // Fetch the actual robots meta tag element
    const metaTag = await page.$('meta[name="robots"]');

    // Get the content if the meta tag exists
    const metaContent = metaTag ? await metaTag.getAttribute('content') : undefined;
    
    
    // Log expected and actual values
    console.log('Expected robots meta tag:', expectedMetaTags);
    console.log('Actual robots meta tag:', metaContent);

    // Assert the meta content matches the expected value
    expect(metaContent).toBe(expectedMetaTags[siteType]);
   
  });
});
