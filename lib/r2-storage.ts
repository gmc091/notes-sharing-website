// lib/r2.ts

import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Shared R2 client configuration
 */
export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/**
 * Interface for file metadata
 */
export interface FileMetadata {
  key: string;
  size?: number;
  lastModified?: Date;
  url?: string;
  contentType?: string;
}

/**
 * Gets metadata for a file stored in R2
 */
export async function getR2FileMetadata(
  filePath: string
): Promise<FileMetadata> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME!,
      Prefix: filePath,
      MaxKeys: 1,
    });

    const response = await r2Client.send(command);
    const file = response.Contents?.[0];

    if (!file) {
      throw new Error(`File not found: ${filePath}`);
    }

    return {
      key: filePath,
      size: file.Size,
      lastModified: file.LastModified,
      contentType: file.ETag ? file.ETag.replace(/"/g, "") : undefined,
    };
  } catch (error) {
    console.error(`Error fetching metadata for ${filePath}:`, error);
    return { key: filePath };
  }
}

/**
 * Generates a signed URL for file download
 */
export async function generateSignedUrl(filePath: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: filePath,
    });

    return await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  } catch (error) {
    console.error(`Error generating signed URL for ${filePath}:`, error);
    throw new Error("Failed to generate file access URL");
  }
}

export async function deleteFilesFromR2(filePaths: string[]): Promise<void> {
  try {
    await Promise.all(
      filePaths.map(async (path) => {
        try {
          const command = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: path,
          });

          await r2Client.send(command);
          r2Logger.info(`Successfully deleted file: ${path}`);
        } catch (error) {
          r2Logger.error(`Failed to delete file: ${path}`, error);
          // Continue with other deletions even if one fails
        }
      })
    );
  } catch (error) {
    r2Logger.error("Error in bulk file deletion:", error);
    throw new Error("Failed to delete files from storage");
  }
}

export async function deleteFileFromR2(path: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: path,
    });

    await r2Client.send(command);
    r2Logger.info(`Successfully deleted file: ${path}`);
    return true;
  } catch (error) {
    r2Logger.error(`Failed to delete file: ${path}`, error);
    return false;
  }
}

type LogData = Record<string, unknown>;

/**
 * Logger utility for R2 operations
 */
export const r2Logger = {
  info: (message: string, data?: LogData) => {
    console.log(`[R2] ${message}`, data ? JSON.stringify(data, null, 2) : "");
  },
  error: (message: string, error: unknown) => {
    console.error(`[R2 Error] ${message}:`, error);
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }
  },
  debug: (message: string, data?: LogData) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[R2 Debug] ${message}`,
        data ? JSON.stringify(data, null, 2) : ""
      );
    }
  },
};
