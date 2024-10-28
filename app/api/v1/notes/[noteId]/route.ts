// app/api/v1/notes/[noteId]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
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
        purchases: {
          where: { userId },
          select: { purchasedAt: true },
        },
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
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
      isPurchased: note.purchases.length > 0,
      isAuthor: note.userId === userId,
      purchases: undefined, // Remove raw purchases from response
      userId: undefined, // Remove raw userId from response
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
