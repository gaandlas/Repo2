import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { AWS_PROFILE } from "../../data/localFiles/localTestData"; // Import the profile from localTestData.ts
import { fromIni } from "@aws-sdk/credential-providers";
import { Readable } from "stream";

const REGION = "us-east-1"; // Replace with your AWS region

// Use the default profile or specify a profile if needed
const credentials = fromIni({ 
  profile: process.env.AWS_PROFILE || AWS_PROFILE,
  filepath: process.env.AWS_SHARED_CREDENTIALS_FILE || `${require('os').homedir()}/.aws/credentials`,
  configFilepath: process.env.AWS_CONFIG_FILE || `${require('os').homedir()}/.aws/config`
});

const s3Client = new S3Client({ region: REGION, credentials });

export async function getObject(bucketName: string, key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
  const response = await s3Client.send(command);

  const streamToString = (stream: Readable): Promise<string> =>
    new Promise((resolve, reject) => {
      const chunks: any[] = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("error", reject);
      stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });

  return streamToString(response.Body as Readable);
}