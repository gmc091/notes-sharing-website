// app/api/v1/notes/[noteId]/route.ts
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { deleteFilesFromR2, generateSignedUrl } from "@/lib/r2-storage";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1, "Title is required").max(100).trim(),
  description: z.string().max(500).optional(),
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
  isAnonymous: z.boolean(),
});

// GET: Fetch note details
export async function GET(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const noteId = parseInt(params.noteId);
    if (isNaN(noteId)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });
    }

    // Fetch note with purchase information
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: {
        id: true,
        title: true,
        description: true,
        filePaths: true,
        createdAt: true,
        schools: true,
        subjects: true,
        years: true,
        purchaseCount: true,
        userId: true,
        isAnonymous: true,
        user: {
          select: {
            clerkId: true,
          },
        },
        purchases: {
          where: { userId },
          select: { purchasedAt: true },
        },
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Get user data from Clerk if not anonymous
    let authorUsername = null;
    if (!note.isAnonymous && note.user?.clerkId) {
      try {
        const clerkUser = await clerkClient.users.getUser(note.user.clerkId);
        authorUsername =
          clerkUser.username ||
          `${clerkUser.firstName} ${clerkUser.lastName}`.trim();
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    // Generate signed URLs for all files
    const filesWithUrls = await Promise.all(
      note.filePaths.map(async (path) => {
        const url = await generateSignedUrl(path);
        return {
          key: path,
          name: path.split("/").pop() || path,
          url,
        };
      })
    );

    // Transform note data
    const transformedNote = {
      ...note,
      files: filesWithUrls,
      authorUsername,
      isPurchased: note.purchases.length > 0,
      isAuthor: note.userId === userId,
      user: undefined,
      purchases: undefined,
      userId: undefined,
    };

    return NextResponse.json(transformedNote);
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Update note
export async function PATCH(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const noteId = parseInt(params.noteId);
    if (isNaN(noteId)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });
    }

    // Verify note ownership
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { userId: true },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (note.userId !== userId) {
      return NextResponse.json(
        { error: "Not authorized to edit this note" },
        { status: 403 }
      );
    }

    const rawData = await request.json();
    const validatedData = updateSchema.parse(rawData);

    // Update note
    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        schools: validatedData.schools,
        subjects: validatedData.subjects,
        years: validatedData.years.map(Number),
        isAnonymous: validatedData.isAnonymous,
      },
    });

    return NextResponse.json({
      success: true,
      note: updatedNote,
    });
  } catch (error) {
    console.error("Error updating note:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete note
export async function DELETE(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const noteId = parseInt(params.noteId);
    if (isNaN(noteId)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });
    }

    // Get note with file paths
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: {
        userId: true,
        filePaths: true,
        purchaseCount: true,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (note.userId !== userId) {
      return NextResponse.json(
        { error: "Not authorized to delete this note" },
        { status: 403 }
      );
    }

    // Prevent deletion if note has been purchased
    if (note.purchaseCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete note that has been purchased",
          message:
            "This note has been purchased by other users and cannot be deleted",
        },
        { status: 403 }
      );
    }

    // Start transaction for note and file deletion
    await prisma.$transaction(async (tx) => {
      // Delete purchases first
      await tx.notePurchase.deleteMany({
        where: { noteId },
      });

      // Delete the note
      await tx.note.delete({
        where: { id: noteId },
      });

      // Delete files from R2
      if (note.filePaths.length > 0) {
        await deleteFilesFromR2(note.filePaths);
      }
    });

    return NextResponse.json({
      success: true,
      message: "Note and associated files deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to delete note. Please try again later.",
      },
      { status: 500 }
    );
  }
}
