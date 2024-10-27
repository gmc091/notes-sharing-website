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

export const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

export const getCleanFileName = (filePath: string): string => {
  const nameWithExt = filePath.split("/").pop() || filePath;
  return decodeURIComponent(nameWithExt);
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

// Function to truncate filenames with ellipsis
export const getDisplayFilename = (
  filename: string,
  maxLength: number
): string => {
  if (filename.length <= maxLength) return filename;

  const ext = getFileExtension(filename);
  const nameWithoutExt = filename.slice(0, -(ext.length + 1)); // +1 for the dot

  if (ext) {
    // Reserve characters for the extension (including the dot) and ellipsis
    const maxNameLength = maxLength - ext.length - 4; // 4 = length of "..." + "."
    if (maxNameLength < 3) return filename.slice(0, maxLength - 3) + "...";
    return nameWithoutExt.slice(0, maxNameLength) + "..." + "." + ext;
  } else {
    // No extension, just truncate and add ellipsis
    return filename.slice(0, maxLength - 3) + "...";
  }
};
