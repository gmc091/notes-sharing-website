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

export const fileTypeConfig = new Map<string, FileTypeInfo>([
  ["pdf", { icon: FileText, color: "text-red-500", variant: "pdf" }],
  ["doc", { icon: FileText, color: "text-blue-500", variant: "document" }],
  ["docx", { icon: FileText, color: "text-blue-500", variant: "document" }],
  ["txt", { icon: FileText, color: "text-gray-500", variant: "document" }],
  [
    "xls",
    { icon: FileSpreadsheet, color: "text-green-500", variant: "spreadsheet" },
  ],
  [
    "xlsx",
    { icon: FileSpreadsheet, color: "text-green-500", variant: "spreadsheet" },
  ],
  ["jpg", { icon: ImageIcon, color: "text-purple-500", variant: "image" }],
  ["jpeg", { icon: ImageIcon, color: "text-purple-500", variant: "image" }],
  ["png", { icon: ImageIcon, color: "text-purple-500", variant: "image" }],
  ["gif", { icon: ImageIcon, color: "text-purple-500", variant: "image" }],
  ["webp", { icon: ImageIcon, color: "text-purple-500", variant: "image" }],
  ["json", { icon: FileCode, color: "text-yellow-500", variant: "code" }],
  ["js", { icon: FileCode, color: "text-yellow-500", variant: "code" }],
  ["css", { icon: FileCode, color: "text-yellow-500", variant: "code" }],
  ["html", { icon: FileCode, color: "text-yellow-500", variant: "code" }],
  ["mp4", { icon: FileVideo, color: "text-pink-500", variant: "media" }],
  ["mp3", { icon: FileAudio, color: "text-pink-500", variant: "media" }],
]);

// Filename validation constants
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

export const validateFilename = (
  filename: string
): { isValid: boolean; error?: string } => {
  // Check for empty filename
  if (!filename || filename.trim().length === 0) {
    return { isValid: false, error: "Il nome del file non può essere vuoto" };
  }

  // Check filename length
  if (filename.length > MAX_FILENAME_LENGTH) {
    return {
      isValid: false,
      error: `Il nome del file non può superare i ${MAX_FILENAME_LENGTH} caratteri`,
    };
  }

  // Check for invalid characters
  if (INVALID_CHARS_REGEX.test(filename)) {
    return {
      isValid: false,
      error: "Il nome del file contiene caratteri non validi",
    };
  }

  // Check for reserved names (Windows)
  const nameWithoutExt = filename.split(".")[0].toUpperCase();
  if (RESERVED_FILENAMES.has(nameWithoutExt)) {
    return {
      isValid: false,
      error: "Il nome del file non può essere un nome riservato di sistema",
    };
  }

  return { isValid: true };
};

export const generateUniqueFilename = (
  originalFilename: string,
  existingFiles: string[] = []
): string => {
  const ext = getFileExtension(originalFilename);
  const nameWithoutExt = originalFilename.slice(0, -(ext.length + 1));
  let newFilename = originalFilename;
  let counter = 1;

  while (existingFiles.includes(newFilename)) {
    newFilename = ext
      ? `${nameWithoutExt} (${counter}).${ext}`
      : `${originalFilename} (${counter})`;
    counter++;
  }

  return newFilename;
};

export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(INVALID_CHARS_REGEX, "_") // Replace invalid chars with underscore
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim();
};

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
  const nameWithoutExt = filename.slice(0, -(ext.length + 1));

  if (ext) {
    const maxNameLength = maxLength - ext.length - 4;
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
      variant: "secondary",
    }
  );
};

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
