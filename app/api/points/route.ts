// app/api/points/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import {
  canUserViewNote,
  handleNoteView,
  handleNoteRating,
} from "@/lib/points-utils";

const prisma = new PrismaClient();

// Schema for the rating request
const rateNoteSchema = z.object({
  noteId: z.number(),
  rating: z.number().min(1).max(5),
});

// Schema for the view check request
const checkViewSchema = z.object({
  noteId: z.number(),
});

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create user with initial points
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {}, // No update needed
      create: {
        clerkId: userId,
        points: 5, // Initial points for new users
        showInLeaderboard: true,
      },
      select: { points: true },
    });

    return NextResponse.json({ points: user.points });
  } catch (error) {
    console.error("Error fetching points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    // Make sure user exists with initial points
    await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        points: 5,
        showInLeaderboard: true,
      },
    });

    switch (action) {
      case "checkView": {
        const { noteId } = checkViewSchema.parse(body);
        const canView = await canUserViewNote(userId);
        const hasViewed = await prisma.noteView.findUnique({
          where: {
            noteId_userId: {
              noteId,
              userId,
            },
          },
        });
        return NextResponse.json({ canView, hasViewed: !!hasViewed });
      }

      case "view": {
        const { noteId } = checkViewSchema.parse(body);
        if (!(await canUserViewNote(userId))) {
          return NextResponse.json(
            { error: "Insufficient points" },
            { status: 403 }
          );
        }
        const success = await handleNoteView(userId, noteId);
        return NextResponse.json({ success });
      }

      case "rate": {
        const { noteId, rating } = rateNoteSchema.parse(body);
        // Check if user has viewed the note
        const hasViewed = await prisma.noteView.findUnique({
          where: {
            noteId_userId: {
              noteId,
              userId,
            },
          },
        });

        if (!hasViewed) {
          return NextResponse.json(
            { error: "Must view note before rating" },
            { status: 403 }
          );
        }

        await handleNoteRating(userId, noteId, rating);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error processing points action:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
