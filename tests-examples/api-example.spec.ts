import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Define a basic API test
test('basic API test', async ({ request }) => {
  // Read the JSON data from the .example.json file
  const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/samplePayloads/.example.json'), 'utf-8'));
  
  // Extract the validUser portion of the JSON data
  const postData = data.validUser;

  // Send a POST request to the specified endpoint with the JSON data
  const response = await request.post('https://api.example.com/endpoint', {
    data: postData
  });

  // Check that the response status is 200 (OK)
  expect(response.status()).toBe(200);

  // Parse the response body as JSON
  const responseBody = await response.json();

  // Check that the response body contains a property 'success' with value true
  expect(responseBody).toHaveProperty('success', true);
});
