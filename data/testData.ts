// testData.ts

// Function to generate dynamic email
export function generateDynamicEmail(): string {
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
    const year = now.getFullYear().toString();

    return `JenkinsAutomation${time}${day}${month}${year}@test.com`;
}

export function generateRandomFourDigitNumber(): number {
    return Math.floor(1000 + Math.random() * 9000);
}

// Read QA_USER from environment variables and split into firstName and lastName
const qaUser = process.env.QA_USER || 'Jenkins Automation';
const names = qaUser.split(' ');
const baseFirstName = names[0] || 'Jenkins';
const baseLastName = names[1] || 'Automation';

export const firstName = baseFirstName+generateRandomFourDigitNumber();
export const lastName = baseLastName+generateRandomFourDigitNumber();
export const email = generateDynamicEmail();
export const phoneNumber = '+1 615-934-4567';
export const zipcode = '40220';
export const country = 'United States of America';
export const state = 'KY';
export const isAffiliate = false;