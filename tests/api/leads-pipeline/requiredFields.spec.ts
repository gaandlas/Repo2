import { test, expect, request } from '@playwright/test';
import fs from 'fs';
import path from 'path';

function getRandomString(length: number) {
  return Math.random().toString(36).substring(2, 2 + length);
}

function getRandomPhoneNumber() {
  return '321' + Math.floor(1000000 + Math.random() * 9000000).toString();
}

test('Submit leads pipeline data', async ({}) => {
  const filePath = path.resolve(__dirname, '../../../data/samplePayloads/leads-pipeline.json');
  const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  jsonData['srp-valid-user'].FirstName = 'Nexus' + getRandomString(10);
  jsonData['srp-valid-user'].LastName = 'Team' + getRandomString(10);
  jsonData['srp-valid-user'].Phone = getRandomPhoneNumber();
  jsonData['srp-valid-user'].Email = 'NexusTeam' + getRandomString(10) + '@test.com';

  const endpoint = 'https://hooks.zapier.com/hooks/catch/18464004/2s4msoo/';

  const apiContext = await request.newContext();
  const response = await apiContext.post(endpoint, {
    data: jsonData['srp-valid-user']
  });

  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  console.log('Response for srp-valid-user:', responseBody);
});
