import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

// S3 Configuration
const s3Config = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'solar-crm-uploads';

// Initialize S3 client (only if credentials are provided)
export const s3Client = new S3Client(s3Config);

// Check if S3 is configured
export const isS3Configured = !!(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_S3_BUCKET
);

// Allowed file types and their MIME types
export const ALLOWED_FILE_TYPES: Record<string, string[]> = {
  pdf: ['application/pdf'],
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  gif: ['image/gif'],
  doc: ['application/msword'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  xls: ['application/vnd.ms-excel'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
};

// Maximum file size (default 10MB)
export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10);

/**
 * Validates file type against allowed types
 */
export function isValidFileType(mimeType: string): boolean {
  return Object.values(ALLOWED_FILE_TYPES).some((types) => types.includes(mimeType));
}

/**
 * Gets file extension from mime type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  for (const [ext, types] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (types.includes(mimeType)) {
      return ext;
    }
  }
  return 'bin';
}

/**
 * Generates a unique filename for S3
 */
export function generateUniqueFilename(originalName: string, mimeType: string): string {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = getExtensionFromMimeType(mimeType);
  const sanitizedName = originalName
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9-_]/g, '_') // Replace special chars
    .slice(0, 50); // Limit length

  return `${timestamp}-${randomString}-${sanitizedName}.${extension}`;
}

/**
 * Generates S3 key with folder structure
 */
export function generateS3Key(
  entityType: 'project' | 'customer' | 'form',
  entityId: string,
  filename: string
): string {
  return `${entityType}s/${entityId}/${filename}`;
}

/**
 * Uploads a file to S3
 */
export async function uploadToS3(
  buffer: Buffer,
  key: string,
  mimeType: string
): Promise<{ url: string; key: string }> {
  if (!isS3Configured) {
    throw new Error('S3 is not configured. Please set AWS credentials.');
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    ACL: 'private',
  });

  await s3Client.send(command);

  return {
    url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`,
    key,
  };
}

/**
 * Deletes a file from S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  if (!isS3Configured) {
    throw new Error('S3 is not configured. Please set AWS credentials.');
  }

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Generates a presigned URL for secure file download
 */
export async function getPresignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  if (!isS3Configured) {
    throw new Error('S3 is not configured. Please set AWS credentials.');
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generates a presigned URL for direct upload
 */
export async function getPresignedUploadUrl(
  key: string,
  mimeType: string,
  expiresIn = 3600
): Promise<string> {
  if (!isS3Configured) {
    throw new Error('S3 is not configured. Please set AWS credentials.');
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: mimeType,
    ACL: 'private',
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Extracts S3 key from full URL
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Handle both path-style and virtual-hosted-style URLs
    if (urlObj.hostname.includes('.s3.')) {
      return urlObj.pathname.slice(1); // Remove leading /
    }
    // Handle s3://bucket/key format
    if (urlObj.protocol === 's3:') {
      return urlObj.pathname.slice(1);
    }
    return null;
  } catch {
    return null;
  }
}
