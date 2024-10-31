// app/api/v1/notes/[noteId]/route.ts
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateSignedUrl } from "@/lib/r2";

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

    // Transform the note data
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
