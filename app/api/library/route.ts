// app/api/library/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Add this export to mark the route as dynamic
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const purchasedNotes = await prisma.noteView.findMany({
      where: {
        userId,
        hasPaid: true,
      },
      include: {
        note: {
          select: {
            id: true,
            title: true,
            filePaths: true,
            createdAt: true,
            schools: true,
            subjects: true,
            years: true,
            viewCount: true,
            rating: true,
            ratingCount: true,
          },
        },
      },
      orderBy: {
        viewedAt: "desc",
      },
    });

    return NextResponse.json({
      notes: purchasedNotes.map((view) => ({
        ...view.note,
        purchasedAt: view.viewedAt,
        files: view.note.filePaths.map((path) => ({
          key: path,
          name: path.split("/").pop() || path,
        })),
      })),
    });
  } catch (error) {
    console.error("Error fetching library:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
