
import { test } from '@playwright/test';
import { SiteInfo,forEachSite } from '../../data/siteData'; 

//const urls = ['https://online.carlow.edu/','https://online.calvin.edu/'];

// Single site
//test('Robots for site' , async ({ page, context }) => {
//const startingPageUrl = 'https://online.carlow.edu/';
//await page.goto(startingPageUrl + 'robots.txt');

//await page.waitForTimeout(5000);
//await page.close();
//});
//const urls = process.env.ENV_NAME

// Loop through each site
forEachSite ((site : SiteInfo)  => {
  const {URL:baseUrl, SiteType: siteType }= site;

    test(`Robots test for ${baseUrl}/robots.txt`,async ({ page, context }) => {
        await page.goto(baseUrl + '/robots.txt');
   console.log("message");
  
  })
});



 
