import nodemailer from 'nodemailer';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

export async function sendEmail(
  receiverEmail: string,
  subject: string,
  body: string,
  attachmentPath?: string | string[]
) {
  const senderEmail = "admin.edservices@risepoint.com";

  try {
    // Initialize AWS S3 client
    const s3 = new S3Client({ region: 'us-east-1' });

    //console.log("Fetching SMTP credentials from S3...");

    // Fetch SMTP credentials from S3
    const command = new GetObjectCommand({
      Bucket: 'wp-jenkins-artifacts',
      Key: 'credentials/smtp.json',
    });
    const response = await s3.send(command);

    const credentialsBody = await streamToString(response.Body as Readable);
    const { username, password } = JSON.parse(credentialsBody);
    //console.log("SMTP credentials successfully retrieved.");

    // Configure nodemailer transport using SMTP credentials
    const transporter = nodemailer.createTransport({
      host: "email-smtp.us-east-1.amazonaws.com",
      port: 587,
      secure: false,
      auth: {
        user: username,
        pass: password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    //console.log("Nodemailer transporter configured.");

    // Prepare attachments if any
    let attachments: { filename: string; path: string }[] = [];
    if (attachmentPath) {
      const attachmentPaths = Array.isArray(attachmentPath) ? attachmentPath : [attachmentPath];
      attachments = attachmentPaths.map((path) => ({
        filename: path.split('/').pop() || 'unknown',
        path,
      }));
    }

    // Set up email options
    const mailOptions = {
      from: senderEmail,
      to: receiverEmail,
      subject,
      text: body,
      attachments,
    };

    //console.log("Sending email...");
    const info = await transporter.sendMail(mailOptions);
    //console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error in sendEmail function:', error);
  }
}

// Helper function to convert stream to string
async function streamToString(stream: Readable): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}


export async function validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}