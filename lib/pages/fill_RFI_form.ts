import { Page } from '@playwright/test'; // Import Playwright's Page type
import { firstName, lastName, email, phoneNumber, zipcode, country, state, isAffiliate, generateRandomFourDigitNumber, generateDynamicEmail } from '../../data/testData';

export async function fillTextField(page: Page, fieldId: string, value: string) {
  if (await page.$(fieldId)) {
    await page.fill(fieldId, value);
  }
}

export async function selectOptionField(page: Page, fieldId: string, option: { label?: string, index?: number, value?: string }) {
  if (await page.$(fieldId)) {
    await page.selectOption(fieldId, option);
  }
}

export async function selectCheckbox(page: Page, fieldId: string) {
  if (await page.$(fieldId)) {
    await page.check(fieldId);
  }
}

export async function fillAndSubmitForm(page: Page, siteType: string, formData: Partial<{ 
  firstName: string, 
  lastName: string, 
  email: string, 
  phoneNumber: string, 
  zipcode: string, 
  country: string, 
  state: string, 
  highestDegreeLevel: number, 
  howHeard: number 
}> = {}) {
  // Generate new random values for each call
  const randomFirstName = `Jenkins${generateRandomFourDigitNumber()}`;
  const randomLastName = `Automation${generateRandomFourDigitNumber()}`;
  const randomEmail = generateDynamicEmail();

  // Wait for the page to fully load
  await page.waitForLoadState('load');
  console.log('Page loaded successfully. Filling the form...');

  // Select Program
  await selectOptionField(page, '#fr-programs', { index: 1 });

  // Fill RFI Form with provided data or default values
  await fillTextField(page, '#fr-first-name', formData.firstName ?? randomFirstName);
  await fillTextField(page, '#fr-last-name', formData.lastName ?? randomLastName);
  await fillTextField(page, '#fr-email', formData.email ?? randomEmail);
  await fillTextField(page, '#fr-phone', formData.phoneNumber ?? phoneNumber);
  await fillTextField(page, '#fr-zipcode', formData.zipcode ?? zipcode);
  await fillTextField(page, '#fr-location', formData.zipcode ?? zipcode);

  // Simulate typing in the location field to trigger Google Autocomplete
  if (await page.$('#fr-location')) {
    await page.waitForTimeout(2000); // Wait for Google Autocomplete to populate results
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
  }

  // Check if the highest level of education field exists and fill it
  await selectOptionField(page, '#fr-highest-degree-level', { index: formData.highestDegreeLevel ?? 1 });

  // Check if the country dropdown exists and select the value
  await selectOptionField(page, '#fr-country', { label: formData.country ?? country });

  // Check if the state dropdown exists and select the value
  await selectOptionField(page, '#fr-state', { value: formData.state ?? state });

  // Check if the how heard dropdown exists and select an option
  await selectOptionField(page, '#fr-how-heard', { index: formData.howHeard ?? 1 });

  await selectCheckbox(page, '#fr-sms-consent-checkbox');
  await selectCheckbox(page, '#fr-military-affiliated-checkbox');

  if (isAffiliate) {
    await selectCheckbox(page, 'input[name="isAffiliate"]');
  }

  // Check if the form qualifier checkbox exists and click it
  await selectCheckbox(page, '#fr-form-qualifier-checkbox');

  // Check if the program qualifier checkbox exists and click it
  await selectCheckbox(page, '#fr-program-qualifier-checkbox');

  console.log('Form filled successfully. Attempting to submit the form.');

  // Click the submit button and wait for navigation
  await Promise.all([
    await page.click('button.fr-button--submit'),
  ]);

  console.log('Submit Button clicked.');
}
