import { Page, expect } from '@playwright/test';

// Generalized function to validate utag data
export async function validateUtagData(page: Page, expectedData: Record<string, any>) {
  const utag = await page.evaluate(() => (window as any).utag_data);
  
  console.log('Full utag data:', utag);
  console.log('Expected data:', expectedData);

  // Iterate through the expectedData and compare with actual utag values
  for (const [key, expectedValue] of Object.entries(expectedData)) {
    console.log(`Checking key: ${key}`);
    console.log(`Expected value:`, expectedValue);
    console.log(`Actual value:`, utag[key]);

    // Make sure the key exists in utag_data
    expect(utag).toHaveProperty(key);

    if (expectedValue && typeof expectedValue === 'object' && 'asymmetricMatch' in expectedValue) {
      console.log(`Using asymmetric matcher for ${key}`);
      
      if (expectedValue.$$typeof === Symbol.for('jest.asymmetricMatcher')) {
        if (expectedValue.toString().includes('StringContaining')) {
          const searchString = expectedValue.sample.toLowerCase();
          const actualValue = String(utag[key]).toLowerCase();
          
          console.log(`Checking if "${actualValue}" contains "${searchString}"`);
          
          expect(actualValue).toContain(searchString);
        } else {
          // Handle other asymmetric matchers (any, arrayContaining, etc.)
          expect(utag[key]).toEqual(expectedValue);
        }
      }
    } else {
      // For regular values, use toStrictEqual
      expect(utag[key]).toStrictEqual(expectedValue);
    }
  }
}



