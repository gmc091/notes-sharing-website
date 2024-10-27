// app/api/notes/[noteId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getR2FileMetadata, generateSignedUrl } from "@/lib/r2";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { canUserViewNote } from "@/lib/points-utils";

const paramsSchema = z.object({
  noteId: z.coerce.number().positive(),
});

export async function GET(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { noteId } = paramsSchema.parse({ noteId: params.noteId });

    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: {
        id: true,
        title: true,
        schools: true,
        subjects: true,
        years: true,
        filePaths: true,
        createdAt: true,
        viewCount: true,
        userId: true,
        isAnonymous: true,
        rating: true,
        ratingCount: true,
        views: {
          where: {
            userId: userId,
          },
          select: {
            viewedAt: true,
          },
        },
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const hasViewed = note.views.length > 0;

    // If user has already viewed the note or it's their own note, they can access it
    // Otherwise, check if they have enough points
    if (!hasViewed && userId !== note.userId) {
      const canView = await canUserViewNote(userId);
      if (!canView) {
        return NextResponse.json(
          { error: "Insufficient points to view note" },
          { status: 403 }
        );
      }
    }

    const [filesWithUrls, userData] = await Promise.all([
      Promise.all(
        note.filePaths.map(async (filePath) => {
          const [metadata, url] = await Promise.all([
            getR2FileMetadata(filePath),
            generateSignedUrl(filePath),
          ]);
          return { ...metadata, url };
        })
      ),
      note.isAnonymous || !note.userId
        ? null
        : clerkClient.users.getUser(note.userId),
    ]);

    // If user is viewing (not their own note) and hasn't viewed before, record view
    if (userId && userId !== note.userId && !hasViewed) {
      await recordView(noteId, userId);
    }

    return NextResponse.json({
      id: note.id,
      title: note.title,
      schools: note.schools,
      subjects: note.subjects,
      years: note.years,
      createdAt: note.createdAt,
      viewCount: note.viewCount,
      isAnonymous: note.isAnonymous,
      rating: note.rating,
      ratingCount: note.ratingCount,
      files: filesWithUrls,
      user: note.isAnonymous ? null : userData,
      hasViewed,
    });
  } catch (error) {
    console.error("Error fetching note:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid note ID", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "An error occurred while fetching the note" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function recordView(noteId: number, userId: string) {
  try {
    // Ensure user exists
    await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: { clerkId: userId },
    });

    // Record view
    await prisma.noteView.upsert({
      where: {
        noteId_userId: { noteId, userId },
      },
      update: { viewedAt: new Date() },
      create: {
        noteId,
        userId,
        viewedAt: new Date(),
      },
    });

    // Update note view count
    const viewCount = await prisma.noteView.count({
      where: { noteId },
    });

    await prisma.note.update({
      where: { id: noteId },
      data: { viewCount },
    });
  } catch (error) {
    console.error("Error recording view:", error);
  }
}

// Export config to ensure the API route is always dynamic
export const dynamic = "force-dynamic";
