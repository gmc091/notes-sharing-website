import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { generateUniqueFilename, validateFilename } from "@/lib/file-utils";
import { auth } from "@clerk/nextjs/server";
import { handleNoteUpload } from "@/lib/points-utils";

// Validation schemas remain the same
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

type AcceptedFileType = (typeof ACCEPTED_FILE_TYPES)[number];

const fileSchema = z.object({
  name: z.string().min(1, "Filename is required"),
  type: z
    .string()
    .refine(
      (type): type is AcceptedFileType =>
        ACCEPTED_FILE_TYPES.includes(type as AcceptedFileType),
      "Invalid file type. Supported types: PDF, JPEG, PNG, DOC, DOCX"
    ),
  size: z.number().max(100 * 1024 * 1024, "File size must be less than 100MB"),
});

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required").max(100).trim(),
  description: z.string().max(500).optional(), // New field
  schools: z
    .array(z.string())
    .min(1)
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
  subjects: z.array(z.string()).min(1),
  years: z
    .array(z.string())
    .min(1)
    .refine(
      (years) => years.every((year) => /^[1-5]$/.test(year)),
      "Years must be between 1 and 5"
    ),
  files: z.array(fileSchema).min(1).max(10),
  isAnonymous: z.boolean().default(false),
});

// Initialize S3 client
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// Helper function remains the same
async function generatePresignedUrls(
  files: z.infer<typeof fileSchema>[],
  noteId: number,
  existingFiles: string[]
) {
  return Promise.all(
    files.map(async (file) => {
      if (!validateFilename(file.name)) {
        throw new Error(`Invalid filename: ${file.name}`);
      }

      const fileNaming = generateUniqueFilename(
        file.name,
        noteId,
        existingFiles
      );

      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: fileNaming.key,
        ContentType: file.type,
        Metadata: {
          originalName: fileNaming.originalName,
          noteId: noteId.toString(),
        },
      });

      const url = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

      return {
        ...fileNaming,
        url,
      };
    })
  );
}

export async function POST(request: Request) {
  try {
    // Auth check
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate request data
    const rawData = await request.json();
    const validatedData = uploadSchema.parse(rawData);

    // Execute transaction and store result
    const result = await prisma.$transaction(async (tx) => {
      // Create note
      const note = await tx.note.create({
        data: {
          title: validatedData.title,
          description: validatedData.description, // Add description
          schools: validatedData.schools,
          subjects: validatedData.subjects,
          years: validatedData.years.map(Number),
          filePaths: [],
          createdAt: new Date(),
          userId,
          isAnonymous: validatedData.isAnonymous,
          purchaseCount: 0,
        },
      });

      // Generate presigned URLs
      const fileData = await generatePresignedUrls(
        validatedData.files,
        note.id,
        []
      );

      // Update note with file paths
      await tx.note.update({
        where: { id: note.id },
        data: {
          filePaths: fileData.map((f) => f.key),
        },
      });

      // Award points for uploading
      await handleNoteUpload(userId, note.id);

      return {
        noteId: note.id,
        fileData,
      };
    });

    // Return response outside of transaction
    return NextResponse.json({
      success: true,
      noteId: result.noteId,
      presignedUrls: result.fileData.map((f) => ({
        url: f.url,
        key: f.key,
        originalName: f.originalName,
      })),
    });
  } catch (error) {
    console.error("Error handling upload:", error);

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
