import { test, expect } from '@playwright/test';

// Single site
test('TuitionCal for site' , async ({ page, context }) => {

const viewportWidth = 1900; // Adjust as needed for your screen
const viewportHeight = 1000; // Adjust as needed for your screen
await page.setViewportSize({ width: viewportWidth, height: viewportHeight });
    
const startingPageUrl = 'https://nova-5477-web-bpu.pantheonsite.io/tuition-financial-aid/tuition-calculator/';
await page.goto(startingPageUrl);
//await page.setViewportSize({ width: 1000, height: 1092});
 
await page.selectOption('select[name="level"]', { index : 3 });
await page.selectOption('select[id="program"]', { index: 1 });
const inputSelector = '#transfer-credits';
await page.waitForSelector(inputSelector);
 
// Check if the input has the "readonly" attribute
const isReadOnly = await page.$eval(inputSelector, (input) => input.hasAttribute('readonly'));
if (!isReadOnly) {
  await page.fill(inputSelector, '10');
} else {
  console.log('The field is read-only, skipping input actions.');
}

await page.fill("#financial-assistance", "100");
// Locate your <p> element
const locator = page.locator('p[x-show="Number(program) !== 0 && (programs[program].rate === 0 || programs[program].credits === 0)"]');

// Get the `display` style value
const displayValue = await locator.evaluate((el) => el.style.display);

// If it says 'none', continue; otherwise, just return (test passes and ends).
if (displayValue !== 'none')
{
  console.log('"Data Not Available" Error Message is displayed. Test pass.');
  return;
}

// Selectors for each row in the table
const programCostSelector = 'tr.border td';
const transferCreditSelector = '.credits-assistance .success tbody tr:nth-of-type(1) td';
const financialAssistanceSelector = '.credits-assistance .success tr:nth-child(2) td';
const estimatedTuitionSelector = '.finances__subtotal td';

// Function to parse and format the currency text (e.g., "$49,200.00" to 49200.00)
const parseCurrency = (text) => parseFloat(text.replace(/[^0-9.]/g, ''));

// Wait for table to be visible and get the values
await page.waitForSelector('.finances');

const programCost = parseCurrency(await page.$eval(programCostSelector, el => el.innerText));
let transferCreditValue = 0;
let financialAssistance = 0;

// Check if transfer credit is displayed, then retrieve value
if (await page.$(transferCreditSelector) !== null) {
  transferCreditValue = parseCurrency(await page.$eval(transferCreditSelector, el => el.innerText));
}

// Check if financial assistance is displayed, then retrieve value
if (await page.$(financialAssistanceSelector) !== null) {
  financialAssistance = parseCurrency(await page.$eval(financialAssistanceSelector, el => el.innerText));
}

const estimatedTuition = parseCurrency(await page.$eval(estimatedTuitionSelector, el => el.innerText));


// Calculate expected tuition
const expectedTuition = programCost - transferCreditValue - financialAssistance;

if (expectedTuition === estimatedTuition) {
  console.log('Tuition cost calculation is correct.');
} else {
  console.error(`Tuition cost calculation is incorrect. Expected ${expectedTuition}, but got ${estimatedTuition}.`);
}

// Assert that the calculated value matches the displayed estimated tuition
expect(expectedTuition).toBe(estimatedTuition);

});

