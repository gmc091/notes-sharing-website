// lib/file-utils.ts
import type { LucideIcon } from "lucide-react";
import type { BadgeProps } from "@/components/ui/badge";
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  FileVideo,
  FileAudio,
  ImageIcon,
  File,
} from "lucide-react";

type BadgeVariant = NonNullable<BadgeProps["variant"]>;

type FileTypeInfo = {
  icon: LucideIcon;
  color: string;
  variant: BadgeVariant;
};

interface FileNaming {
  originalName: string;
  key: string;
}

// Constants
const MAX_FILENAME_LENGTH = 255;
const INVALID_CHARS_REGEX = /[<>:"/\\|?*\x00-\x1F]/g;
const RESERVED_FILENAMES = new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  "COM1",
  "COM2",
  "COM3",
  "COM4",
  "COM5",
  "COM6",
  "COM7",
  "COM8",
  "COM9",
  "LPT1",
  "LPT2",
  "LPT3",
  "LPT4",
  "LPT5",
  "LPT6",
  "LPT7",
  "LPT8",
  "LPT9",
]);

// File Types Configuration

export const fileTypeConfig = new Map<string, FileTypeInfo>([
  ["pdf", { icon: FileText, color: "text-red-500", variant: "destructive" }],
  ["doc", { icon: FileText, color: "text-blue-500", variant: "secondary" }],
  ["docx", { icon: FileText, color: "text-blue-500", variant: "secondary" }],
  ["txt", { icon: FileText, color: "text-gray-500", variant: "secondary" }],
  [
    "xls",
    { icon: FileSpreadsheet, color: "text-green-500", variant: "secondary" },
  ],
  [
    "xlsx",
    { icon: FileSpreadsheet, color: "text-green-500", variant: "secondary" },
  ],
  ["ppt", { icon: FileText, color: "text-orange-500", variant: "secondary" }],
  ["pptx", { icon: FileText, color: "text-orange-500", variant: "secondary" }],
  ["jpg", { icon: ImageIcon, color: "text-purple-500", variant: "secondary" }],
  ["jpeg", { icon: ImageIcon, color: "text-purple-500", variant: "secondary" }],
  ["png", { icon: ImageIcon, color: "text-purple-500", variant: "secondary" }],
  ["gif", { icon: ImageIcon, color: "text-purple-500", variant: "secondary" }],
  ["webp", { icon: ImageIcon, color: "text-purple-500", variant: "secondary" }],
  ["json", { icon: FileCode, color: "text-yellow-500", variant: "secondary" }],
  ["js", { icon: FileCode, color: "text-yellow-500", variant: "secondary" }],
  ["css", { icon: FileCode, color: "text-yellow-500", variant: "secondary" }],
  ["html", { icon: FileCode, color: "text-yellow-500", variant: "secondary" }],
  ["mp4", { icon: FileVideo, color: "text-pink-500", variant: "secondary" }],
  ["mp3", { icon: FileAudio, color: "text-pink-500", variant: "secondary" }],
]);

// File Type Checks
export const fileTypeChecks = {
  isOfficeFile: (filename: string): boolean => {
    const ext = getFileExtension(filename);
    return ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext);
  },

  isPreviewableImage: (filename: string): boolean => {
    const ext = getFileExtension(filename);
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
  },

  isPDF: (filename: string): boolean => {
    return getFileExtension(filename) === "pdf";
  },
};

// Basic File Operations
export const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

export const getCleanFileName = (filePath: string): string => {
  const nameWithExt = filePath.split("/").pop() || filePath;
  return decodeURIComponent(nameWithExt);
};

export const getDisplayFilename = (
  filename: string,
  maxLength: number
): string => {
  if (filename.length <= maxLength) return filename;

  const ext = getFileExtension(filename);
  const nameWithoutExt = filename.slice(0, -(ext.length + 1)); // +1 for the dot

  if (ext) {
    const maxNameLength = maxLength - ext.length - 4; // 4 = length of "..." + "."
    if (maxNameLength < 3) return filename.slice(0, maxLength - 3) + "...";
    return nameWithoutExt.slice(0, maxNameLength) + "..." + "." + ext;
  }

  return filename.slice(0, maxLength - 3) + "...";
};

export const getFileTypeInfo = (filename: string): FileTypeInfo => {
  const ext = getFileExtension(filename);
  return (
    fileTypeConfig.get(ext) || {
      icon: File,
      color: "text-gray-500",
      variant: "secondary" as const, // Explicitly type as BadgeVariant
    }
  );
};
// Filename Validation and Generation
export const validateFilename = (filename: string): boolean => {
  // Check for empty filename
  if (!filename || filename.trim().length === 0) {
    return false;
  }

  // Check filename length
  if (filename.length > MAX_FILENAME_LENGTH) {
    return false;
  }

  // Check for invalid characters
  if (INVALID_CHARS_REGEX.test(filename)) {
    return false;
  }

  // Check for reserved names (Windows)
  const nameWithoutExt = filename.split(".")[0].toUpperCase();
  if (RESERVED_FILENAMES.has(nameWithoutExt)) {
    return false;
  }

  return true;
};

export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(INVALID_CHARS_REGEX, "_") // Replace invalid chars with underscore
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim();
};

export const generateUniqueFilename = (
  originalFilename: string,
  noteId: number,
  existingFiles: string[] = []
): FileNaming => {
  const sanitizedName = sanitizeFilename(originalFilename);
  const ext = getFileExtension(sanitizedName);
  const nameWithoutExt = sanitizedName.slice(0, -(ext.length + 1));

  // Create base path with note ID
  const basePath = `notes/${noteId}`;

  // Function to generate numbered filename if needed
  const generateNumberedName = (counter: number): string => {
    const numbered =
      counter === 0
        ? sanitizedName
        : ext
        ? `${nameWithoutExt} (${counter}).${ext}`
        : `${sanitizedName} (${counter})`;
    return `${basePath}/${numbered}`;
  };

  // Find unique key
  let counter = 0;
  let key = generateNumberedName(counter);

  while (existingFiles.includes(key)) {
    counter++;
    key = generateNumberedName(counter);
  }

  return {
    originalName: sanitizedName,
    key: key,
  };
};

// Helper Functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
