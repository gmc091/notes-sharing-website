// app/api/notes/[noteId]/rate/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const ratingSchema = z.object({
  rating: z.number().min(1).max(5),
});

export async function POST(
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

    const body = await request.json();
    const { rating } = ratingSchema.parse(body);

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Check if user has viewed the note
      const view = await tx.noteView.findUnique({
        where: {
          noteId_userId: {
            noteId,
            userId,
          },
        },
      });

      if (!view) {
        throw new Error("Must view note before rating");
      }

      // Check if note exists and user is not the author
      const note = await tx.note.findUnique({
        where: { id: noteId },
        select: { userId: true },
      });

      if (!note) {
        throw new Error("Note not found");
      }

      if (note.userId === userId) {
        throw new Error("Cannot rate your own note");
      }

      // Update or create rating
      const noteRating = await tx.noteRating.upsert({
        where: {
          noteId_userId: {
            noteId,
            userId,
          },
        },
        update: {
          rating,
        },
        create: {
          noteId,
          userId,
          rating,
        },
      });

      // Recalculate average rating
      const ratings = await tx.noteRating.findMany({
        where: { noteId },
        select: { rating: true },
      });

      const avgRating =
        ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

      // Update note with new average and count
      await tx.note.update({
        where: { id: noteId },
        data: {
          rating: avgRating,
          ratingCount: ratings.length,
        },
      });

      return {
        rating: noteRating.rating,
        averageRating: avgRating,
        totalRatings: ratings.length,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing rating:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid rating data" },
        { status: 400 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const statusCode =
      errorMessage === "Must view note before rating"
        ? 403
        : errorMessage === "Note not found"
        ? 404
        : errorMessage === "Cannot rate your own note"
        ? 403
        : 500;

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

export async function GET(
  _request: Request,
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

    const userRating = await prisma.noteRating.findUnique({
      where: {
        noteId_userId: {
          noteId,
          userId,
        },
      },
    });

    return NextResponse.json({ rating: userRating?.rating || null });
  } catch (error) {
    console.error("Error fetching rating:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
