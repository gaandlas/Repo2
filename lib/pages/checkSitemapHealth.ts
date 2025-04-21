import { expect, Page } from '@playwright/test';

export async function checkSitemapHealth(page: Page, baseUrl: string) {
  const sitemapIndexUrl = `${baseUrl}/sitemap_index.xml`;

  // Go to the sitemap index page
  await page.goto(sitemapIndexUrl);

  // Select only the <a> elements inside the <table id="sitemap">
  const sitemapLinks = await page.$$eval('#sitemap a', links => links.map(link => (link as HTMLAnchorElement).href));
  expect(sitemapLinks.length).toBeGreaterThan(0);

  // Iterate through each sitemap link and verify it's reachable
  for (const sitemapLink of sitemapLinks) {
    const sitemapResponse = await page.goto(sitemapLink);
    if (!sitemapResponse) {
      throw new Error(`Failed to fetch ${sitemapLink}`);
    }
    expect(sitemapResponse.status()).toBe(200);

    // Check that the response is also in XML format
    const sitemapContentType = sitemapResponse.headers()['content-type'];
    expect(sitemapContentType).toContain('xml');

    expect(sitemapLinks.length).toBeGreaterThan(0);
  }
  const element = page.locator('#sitemap > tbody > tr:nth-child(1) > td:nth-child(1) > a');
  await element.click();
}
