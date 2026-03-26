import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { logger } from "./logger";

const BUCKET = process.env.AWS_S3_BUCKET ?? "baozhen-uploads";
const REGION = process.env.AWS_REGION ?? "us-east-1";

// Support Cloudflare R2 via endpoint override
const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
  ...(process.env.R2_ACCOUNT_ID
    ? {
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      }
    : {}),
});

export type UploadFolder = "products" | "suppliers" | "avatars" | "categories";

export interface UploadResult {
  url: string;
  key: string;
}

export async function uploadFile(
  file: Buffer,
  folder: UploadFolder,
  mimeType: string,
  extension: string
): Promise<UploadResult> {
  const key = `${folder}/${uuidv4()}.${extension}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: mimeType,
      CacheControl: "public, max-age=31536000",
    })
  );

  const url = process.env.R2_PUBLIC_URL
    ? `${process.env.R2_PUBLIC_URL}/${key}`
    : `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

  logger.info("File uploaded to S3", { key, folder });

  return { url, key };
}

export async function deleteFile(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
  logger.info("File deleted from S3", { key });
}

export async function getPresignedUploadUrl(
  folder: UploadFolder,
  mimeType: string,
  extension: string
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const key = `${folder}/${uuidv4()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 min

  const publicUrl = process.env.R2_PUBLIC_URL
    ? `${process.env.R2_PUBLIC_URL}/${key}`
    : `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

  return { uploadUrl, publicUrl, key };
}

export async function getPresignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
}

export function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.slice(1); // remove leading /
  } catch {
    return null;
  }
}
