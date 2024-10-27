import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Updated import
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { generateUniqueFilename, validateFilename } from "@/lib/file-utils";
import { auth } from "@clerk/nextjs/server";
import { handleNoteUpload } from "@/lib/points-utils";

// Initialize S3 client with Cloudflare R2 credentials
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// Validation schema for file types
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

type AcceptedFileType = (typeof ACCEPTED_FILE_TYPES)[number];

// Updated validation schema
const uploadSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters")
    .trim(),
  schools: z
    .array(z.string())
    .min(1, "At least one school must be selected")
    .refine(
      (schools) =>
        schools.every((school) =>
          [
            "Liceo scientifico",
            "Liceo classico",
            "Liceo linguistico",
            "Scienze umane",
          ].includes(school)
        ),
      "Invalid school selection"
    ),
  subjects: z.array(z.string()).min(1, "At least one subject must be selected"),
  years: z
    .array(z.string())
    .min(1, "At least one year must be selected")
    .refine(
      (years) => years.every((year) => /^[1-5]$/.test(year)),
      "Years must be between 1 and 5"
    ),
  files: z
    .array(
      z.object({
        name: z.string().min(1, "Filename is required"),
        type: z
          .string()
          .refine(
            (type): type is AcceptedFileType =>
              ACCEPTED_FILE_TYPES.includes(type as AcceptedFileType),
            "Invalid file type. Supported types: PDF, JPEG, PNG, DOC, DOCX"
          ),
        size: z
          .number()
          .max(100 * 1024 * 1024, "File size must be less than 100MB"),
      })
    )
    .min(1, "At least one file is required")
    .max(10, "Maximum 10 files allowed per upload"),
  isAnonymous: z.boolean().default(false),
});

interface LogData {
  title?: string;
  fileCount?: number;
  noteId?: number;
  originalName?: string;
  key?: string;
}

const logger = {
  info: (message: string, data?: LogData) => {
    console.log(`[INFO] ${message}`, data ? JSON.stringify(data, null, 2) : "");
  },
  error: (message: string, error: unknown) => {
    console.error(`[ERROR] ${message}:`, error);
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }
  },
  debug: (message: string, data?: LogData) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[DEBUG] ${message}`,
        data ? JSON.stringify(data, null, 2) : ""
      );
    }
  },
};

export async function POST(request: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawData = await request.json();
    const validatedData = uploadSchema.parse(rawData);

    // Ensure user exists in the database
    await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: { clerkId: userId },
    });

    logger.debug("Received upload request", {
      title: rawData.title,
      fileCount: rawData.files?.length,
    });

    // Create the note record with additional metadata
    const note = await prisma.note.create({
      data: {
        title: validatedData.title,
        schools: validatedData.schools,
        subjects: validatedData.subjects,
        years: validatedData.years.map((year) => parseInt(year)),
        filePaths: [],
        createdAt: new Date(),
        userId,
        isAnonymous: validatedData.isAnonymous,
        viewCount: 0,
      },
    });

    // Award points for uploading
    await handleNoteUpload(userId, note.id);

    logger.info("Request data validated successfully");

    logger.debug("Created note record", { noteId: note.id });

    // Get existing files in this note's directory (for duplicate checking)
    const existingFiles = await prisma.note
      .findUnique({
        where: { id: note.id },
        select: { filePaths: true },
      })
      .then((n) => n?.filePaths || []);

    // Generate unique filenames and presigned URLs
    const fileData = await Promise.all(
      validatedData.files.map(async (file) => {
        // Validate filename
        if (!validateFilename(file.name)) {
          throw new Error(`Invalid filename: ${file.name}`);
        }

        logger.debug("Processing file", {
          originalName: file.name,
        });

        // Generate unique filename
        const fileNaming = generateUniqueFilename(
          file.name,
          note.id,
          existingFiles
        );

        // Generate presigned URL
        const command = new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: fileNaming.key,
          ContentType: file.type,
          Metadata: {
            originalName: fileNaming.originalName,
            noteId: note.id.toString(),
          },
        });

        const presignedUrl = await getSignedUrl(r2Client, command, {
          expiresIn: 3600,
        });

        logger.debug("Generated presigned URL", {
          key: fileNaming.key,
        });

        return {
          ...fileNaming,
          url: presignedUrl,
        };
      })
    );

    // Update note with file paths
    await prisma.note.update({
      where: { id: note.id },
      data: {
        filePaths: fileData.map((f) => f.key),
      },
    });

    logger.info("Upload request processed successfully", {
      noteId: note.id,
      fileCount: fileData.length,
    });

    return NextResponse.json({
      success: true,
      noteId: note.id,
      presignedUrls: fileData.map((f) => ({
        url: f.url,
        key: f.key,
        originalName: f.originalName,
      })),
    });
  } catch (error) {
    logger.error("Error handling upload", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
