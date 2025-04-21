// filepath: /c:/Users/rob.grajirena/Documents/GitHub/playwright/lib/utils/aws.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { fromIni } from "@aws-sdk/credential-providers";
import { AWS_PROFILE } from "../../data/localFiles/localTestData"; // Import the profile from localTestData.ts

const REGION = "us-east-1"; // Replace with your AWS region

// Use the default profile or specify a profile if needed
const credentials = fromIni({ 
  profile: process.env.AWS_PROFILE || AWS_PROFILE,
  filepath: process.env.AWS_SHARED_CREDENTIALS_FILE || `${require('os').homedir()}/.aws/credentials`,
  configFilepath: process.env.AWS_CONFIG_FILE || `${require('os').homedir()}/.aws/config`
});

const ddbClient = new DynamoDBClient({ region: REGION, credentials });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export { ddbDocClient };