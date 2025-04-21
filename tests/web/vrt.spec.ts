import { test, expect } from '@playwright/test';
import { SiteInfo, forEachSite } from '../../data/siteData';
import { uploadToS3 } from '../modules/misc/s3upload';
import { validateEmail } from '../modules/misc/emailNotification';
import { sendEmail } from '../modules/misc/emailNotification';
//import path from 'path';
import fs from 'fs-extra';
import { PNG } from 'pngjs';
const sharp = require('sharp');

//todo list
//1 - make it run with array of urls DONE
//2 - upload to S3, if there's a diff DONE
//3 - dynamic threshold DONE
//4 - S3 upload to be a module DONE
//5 - results text saved as artifact {module} //OPTIONAL
//6 - email notification module DONE
//7 - try & catch goTo if 404 console.error it
//8 - group result msgs and print all together at the end
//9 - dynamic urls
//10 - urls as a field
//1 - if email has value and is valid email
//todo list end

// Function to parse URLs from environment variables
function parseUrls(urls: string, siteNames: string): Record<string, string[]> {
  if (!urls.includes(',') && !urls.includes('[') && urls !== '') {
    // Single URL for all sites
    return { 'all': [urls] };
  } else if (urls.includes(',') && !urls.includes('[') && urls !== '') {
    // Comma-separated URLs for all sites
    return { 'all': urls.split(',').map(url => url.trim()) };
  } else if (urls.includes('[') && urls !== '') {
    // Multiple site-specific URL lists
    const urlGroups = urls.split('],').map(group =>
      group.replace(/[\[\]]/g, '').split(',').map(url => url.trim())
    );
    const siteList = siteNames.split(',').map(site => site.trim());

    return siteList.reduce<Record<string, string[]>>((acc, site, index) => {
      acc[site] = urlGroups[index] || [];
      return acc;
    }, {});
  }

  return {}; // Handle invalid input
}
//parse urls from siteConfig
function extractPath(urlString: string): string {
  if (!urlString) {
    return '';
  }

  try {
    const url = new URL(urlString);
    if (!url.pathname || url.pathname === '/') {
      return '/';
    }
    return url.pathname;
  } catch (error) {
    return urlString;
  }
}
//do slashes
function addSlashes(url: string): string {
  if (!url) {
    return '';
  }

  if (!url.startsWith('/')) {
    url = '/' + url;
  }

  if (!url.endsWith('/')) {
    url += '/';
  }

  return url;
}

//this is dynamic from ENV_NAME in jenkins
const vrtEnv = process.env.ENV_NAME || 'wp-updates';
//this is dynamic from THRESHOLD in jenkins
const tHold = parseFloat(process.env.THOLD || '0.8');
const qaUser = process.env.QA_USER || 'jose.gil@risepoint.com';
//urls from field
const urls = process.env.URLS || '';
const site_name = process.env.SITE_NAME || '';
const sitesToUrls = parseUrls(urls, site_name);
//is it local or jenkins
const isJenkins = !!process.env.JOB_NAME;
///
const usePantheonDomain = process.env.PANTHEON_DOMAIN === 'true';

test.describe('VRT Tests', () => {

  test.describe.configure({ mode: 'serial' });

  const logMessages: string[] = [];
  const errorMessages: string[] = [];
  const logScreenshots: string[] = [];

  forEachSite((site: SiteInfo) => {
    const { SiteType: SiteType, PantheonMachineName: pantheonMachineName,  URL: URL, RURLSubdomain: RURLSubdomain, Affurl: Affurl, SingleProgramURL: SingleProgramURL} = site;

    test(`VRT Test for ${pantheonMachineName}`, async ({ page, context }) => {
      test.setTimeout(40000);
      //if no urls from jenkins
      //use urls from json file
      let urlsToUse = sitesToUrls[pantheonMachineName] || sitesToUrls['all'] || [];
      if (urlsToUse.length == 0) {
        const urlsToTest = [extractPath(RURLSubdomain), extractPath(SingleProgramURL)];
        if (SiteType === 'LP') {
          urlsToTest.push(extractPath(Affurl));
        } else {
          urlsToTest.push(extractPath(URL));
        }
        urlsToUse = urlsToTest.filter(url => url !== '');
      }

      for (const url of urlsToUse) {
        let urlGoto = addSlashes(url);
        const liveUrl = usePantheonDomain ? `https://live-${pantheonMachineName}.pantheonsite.io${urlGoto}` : `${URL}${urlGoto}`;
        const envUrl = `https://${vrtEnv}-${pantheonMachineName}.pantheonsite.io${urlGoto}`;
        //
        const MAX_RETRIES = 3;
        let attempt = 0;
        try {
          while (attempt < MAX_RETRIES) {
            try {
              attempt++;
              console.log(`Attempt ${attempt}: Navigating to ${liveUrl}`);
              await page.goto(liveUrl, { waitUntil: 'load', timeout: 40000 });
              break; // Exit retry loop on success
            } catch (gotoError) {
              if (gotoError instanceof Error) {
                console.error(`Attempt ${attempt} failed: ${gotoError.message}`);
              } else {
                console.error(`Attempt ${attempt} failed: ${gotoError}`);
              }
              if (attempt === MAX_RETRIES) {
                throw new Error(`Failed to load ${liveUrl} after ${MAX_RETRIES} attempts`);
              }
            }
          }
          await page.waitForSelector('body');
          await page.evaluate(() => {
            // Scroll to the bottom and back to top
            // lazyload images force loading
            window.scrollTo(0, document.body.scrollHeight);
            window.scrollTo(0, 0);
          });
          /*await page.evaluateHandle('document.fonts.ready');*/

          const urlPath = url.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'home';
          const liveScreenshot = `screenshots/${pantheonMachineName}_${urlPath}_prod.png`;
          const envScreenshot = `screenshots/${pantheonMachineName}_${urlPath}_${vrtEnv}.png`;
          const diffScreenshot = `screenshots/${pantheonMachineName}_${urlPath}_diff.png`;
          //
          await page.screenshot({
            fullPage: true,
            path: liveScreenshot
          });
          console.log(`screenshot at ${liveUrl}`);
          await page.close();
          page = await context.newPage();

          attempt = 0;
          while (attempt < MAX_RETRIES) {
            try {
              attempt++;
              console.log(`Attempt ${attempt}: Navigating to ${envUrl}`);
              await page.goto(envUrl, { waitUntil: 'load', timeout: 40000 });
              break; // Exit retry loop on success
            } catch (gotoError) {
              if (gotoError instanceof Error) {
                console.error(`Attempt ${attempt} failed: ${gotoError.message}`);
              } else {
                console.error(`Attempt ${attempt} failed: ${gotoError}`);
              }
              if (attempt === MAX_RETRIES) {
                throw new Error(`Failed to load ${envUrl} after ${MAX_RETRIES} attempts`);
              }
            }
          }
          await page.waitForSelector('body');
          await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
            window.scrollTo(0, 0);
          });
          /*await page.evaluateHandle('document.fonts.ready');*/

          await page.screenshot({
            fullPage: true,
            path: envScreenshot
          });
          console.log(`screenshot at ${envUrl}`);
          await page.close();
          page = await context.newPage();
          //
          const liveMetadata = await sharp(liveScreenshot).metadata();
          const envMetadata = await sharp(envScreenshot).metadata();
          const maxWidth = Math.max(liveMetadata.width, envMetadata.width);
          const maxHeight = Math.max(liveMetadata.height, envMetadata.height);

          const paddedLive= await sharp(liveScreenshot)
          .extend({
            top: 0,
            bottom: maxHeight - liveMetadata.height,
            left: 0,
            right: maxWidth - liveMetadata.width,
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          })
          .toBuffer();
          const paddedEnv = await sharp(envScreenshot)
          .extend({
            top: 0,
            bottom: maxHeight - envMetadata.height,
            left: 0,
            right: maxWidth - envMetadata.width,
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          })
          .toBuffer();

          const img1 = PNG.sync.read(paddedLive);
          const img2 = PNG.sync.read(paddedEnv);

          const { width, height } = img1;

          const diff = new PNG({ width, height });

          const pixelmatch = (await import('pixelmatch')).default;
          const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: tHold });

          if (numDiffPixels > 0) {
            fs.writeFileSync(diffScreenshot, PNG.sync.write(diff));
            //console.error(`### Found ${numDiffPixels} different pixels at ${pantheonMachineName} - ${urlPath} ###`);
            //errorMessages.push(`### Found ${numDiffPixels} different pixels at ${pantheonMachineName} - ${urlPath} ###`);
            //S3
            if (isJenkins) {
              uploadToS3('wp-jenkins-artifacts', diffScreenshot, 'img/png', 'vrt').catch(error => console.error("Upload failed:", error));
              logScreenshots.push(diffScreenshot);
            }
            //expect(numDiffPixels).toBe(0);
            throw new Error(`Found ${numDiffPixels} different pixels at ${pantheonMachineName} - ${urlPath}`);
          } else {
            logMessages.push(`No visual differences found at ${pantheonMachineName} - ${urlPath}`);
          }
        } catch (error) {
          //console.error('Error: ', error);
          if (error instanceof Error) {
            errorMessages.push(`Error: ${error.message}`);
          } else {
            errorMessages.push(`Error: ${String(error)}`);
          }
          continue; // Proceed to the next URL
        }
      }

    });

  });

  test.afterAll(async () => {
    if (logMessages.length > 0) {
      console.log('#######VRT RESULTS#######');
      console.log(logMessages.join('\n'));
    }
    if (errorMessages.length > 0) {
      console.log('#######VRT ERRORS#######');
      console.error(errorMessages.join('\n'));
    }
    if (isJenkins && await validateEmail(qaUser)) {
      //todo: if email has value and is valid email
      const body = [
        logMessages.join('\n'),
        errorMessages.join('\n')
      ].join('\n');
      await sendEmail(qaUser, 'VRT done!', body, logScreenshots);
    }
  });
})
