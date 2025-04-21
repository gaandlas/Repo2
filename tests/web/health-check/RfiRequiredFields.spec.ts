import { test, expect } from '@playwright/test';
import { fillAndSubmitForm } from '../../../lib/pages/fill_RFI_form';
import { SiteInfo, forEachSite } from '../../../data/siteData';

const envName = process.env.ENV_NAME; 

forEachSite((site: SiteInfo) => {
  const { "RURL": liveUrl, TealiumProfile: tealiumProfile, FormType: formType, SiteType: siteType, PantheonMachineName: pantheonMachineName, RURLSubdomain: subdomain, GravityForm: gravityForm, utm: utm } = site;

  const url = envName == 'live'
    ? `${liveUrl}${utm}`
    : `https://${envName}-${pantheonMachineName}.pantheonsite.io/${subdomain}${utm}`;

  if (gravityForm !== 'TRUE') {
    test.describe(`RFI Required Fields for ${url}`, () => {
      test('should not submit if first name is empty', async ({ page }) => {
        await page.goto(url);
        await fillAndSubmitForm(page, siteType, { firstName: '' });
        await expect(page).not.toHaveURL(/\/thank-you\//);
      });

      test('should not submit if last name is empty', async ({ page }) => {
        await page.goto(url);
        await fillAndSubmitForm(page, siteType, { lastName: '' });
        await expect(page).not.toHaveURL(/\/thank-you\//);
      });

      test('should not submit if email is empty', async ({ page }) => {
        await page.goto(url);
        await fillAndSubmitForm(page, siteType, { email: '' });
        await expect(page).not.toHaveURL(/\/thank-you\//);
      });

      test('should not submit if phone is empty', async ({ page }) => {
        await page.goto(url);
        await fillAndSubmitForm(page, siteType, { phoneNumber: '' });
        await expect(page).not.toHaveURL(/\/thank-you\//);
      });
    });
  }
});