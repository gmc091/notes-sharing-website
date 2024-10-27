// lib/file-utils.ts

import path from "path";

interface FileNamingResult {
  key: string; // Full path in storage (e.g., "notes/123/filename.pdf")
  originalName: string; // Original filename for reference
  storageName: string; // Actual filename in storage
}

/**
 * Sanitizes a filename to ensure it's safe for storage while preserving readability
 */
export function sanitizeFilename(filename: string): string {
  // Get the file extension and base name
  const ext = path.extname(filename);
  const baseName = path.basename(filename, ext);

  return (
    baseName
      // Convert to lowercase for consistency
      .toLowerCase()
      // Replace spaces and special chars with hyphens
      .replace(/[^a-z0-9]+/g, "-")
      // Remove starting/ending hyphens
      .replace(/^-+|-+$/g, "")
      // Limit length of base name
      .slice(0, 50) + ext.toLowerCase()
  );
}

/**
 * Generates a unique filename while preserving the original name
 * @param originalFilename The original filename from the user
 * @param noteId The ID of the note this file belongs to
 * @param existingFiles Array of existing filenames in the same directory (for duplicate checking)
 */
export function generateUniqueFilename(
  originalFilename: string,
  noteId: number,
  existingFiles: string[] = []
): FileNamingResult {
  // First, sanitize the filename
  const sanitized = sanitizeFilename(originalFilename);
  const ext = path.extname(sanitized);
  const baseName = path.basename(sanitized, ext);

  // Function to check if a filename already exists
  const isDuplicate = (name: string) =>
    existingFiles.includes(`notes/${noteId}/${name}`);

  // If no duplicate, use the sanitized name directly
  if (!isDuplicate(sanitized)) {
    return {
      key: `notes/${noteId}/${sanitized}`,
      originalName: originalFilename,
      storageName: sanitized,
    };
  }

  // Handle duplicates by adding a counter
  let counter = 1;
  let uniqueName = `${baseName}-${counter}${ext}`;

  while (isDuplicate(uniqueName)) {
    counter++;
    uniqueName = `${baseName}-${counter}${ext}`;
  }

  return {
    key: `notes/${noteId}/${uniqueName}`,
    originalName: originalFilename,
    storageName: uniqueName,
  };
}

/**
 * Validates a filename against security and system constraints
 */
export function validateFilename(filename: string): boolean {
  // Check for null bytes (security risk)
  if (filename.includes("\0")) return false;

  // Check minimum and maximum length
  if (filename.length < 1 || filename.length > 255) return false;

  // Check for prohibited characters and patterns
  const prohibitedPattern = /^\.|\.\.|\/|\\|[:*?"<>|]/;
  if (prohibitedPattern.test(filename)) return false;

  return true;
}

/**
 * Extracts metadata from a filename
 */
export function extractFileMetadata(filename: string) {
  const ext = path.extname(filename).toLowerCase();

  // Map common extensions to friendly type names
  const typeMap: Record<string, string> = {
    ".pdf": "PDF Document",
    ".doc": "Word Document",
    ".docx": "Word Document",
    ".txt": "Text File",
    ".jpg": "Image",
    ".jpeg": "Image",
    ".png": "Image",
    // Add more as needed
  };

  return {
    extension: ext,
    type: typeMap[ext] || "Unknown Type",
    baseName: path.basename(filename, ext),
  };
}

/**
 * Gets a display name for a file (potentially shorter version for UI)
 */
export function getDisplayFilename(
  filename: string,
  maxLength: number = 30
): string {
  if (filename.length <= maxLength) return filename;

  const ext = path.extname(filename);
  const baseName = path.basename(filename, ext);

  // Calculate how much of the base name we can show
  const maxBaseLength = maxLength - ext.length - 3; // 3 for the ellipsis
  const truncatedBase = baseName.slice(0, maxBaseLength);

  return `${truncatedBase}...${ext}`;
}
