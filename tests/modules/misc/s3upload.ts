import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from 'fs-extra';
import path from 'path';

let s3Client: S3Client;
s3Client = new S3Client({
    region: 'us-east-1',
});

export async function uploadToS3 (bucketName: string, filePath: string, contentType: string, folder?: string) {
    const objectName = path.basename(filePath);
    console.log("Starting upload...");

    try {
      // Log file path and check if it exists
      console.log("File path:", filePath);
      if (!fs.existsSync(filePath)) {
        console.error("File does not exist:", filePath);
        return;
      }

      // Read the file into a buffer
      console.log("Reading file...");
      const fileContent = fs.readFileSync(filePath);

      console.log("File read successfully, starting upload...");

      const keyPrefix = folder ? `${folder}/` : '';

      // Upload the file to S3
      const uploadParams = {
        Bucket: bucketName,
        Key: `${keyPrefix}${objectName}`,
        Body: fileContent,
        ContentType: contentType,
      };

      const command = new PutObjectCommand(uploadParams);
      const result = await s3Client.send(command);
      //console.log("S3 Upload Result:", result);

      console.log(`File uploaded successfully`);
    } catch (err) {
      console.error('Error uploading file:', err);
    }
};

// how to use: Call the function and handle the promise
//uploadToS3(bucketName, filePath, contentType, folder).catch(error => console.error("Upload failed:", error));
