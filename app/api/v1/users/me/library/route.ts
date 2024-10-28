// app/api/v1/users/library/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get all notes purchased by the user
    const [purchases, totalCount] = await Promise.all([
      prisma.notePurchase.findMany({
        where: {
          userId,
        },
        select: {
          purchasedAt: true,
          note: {
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
            },
          },
        },
        orderBy: {
          purchasedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.notePurchase.count({
        where: {
          userId,
        },
      }),
    ]);

    const notes = purchases.map((purchase) => ({
      ...purchase.note,
      files: purchase.note.filePaths.map((path) => ({
        key: path,
        name: path.split("/").pop() || path,
      })),
      purchasedAt: purchase.purchasedAt,
      isPurchased: true,
      isAuthor: purchase.note.userId === userId,
    }));

    return NextResponse.json({
      notes,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      limit,
    });
  } catch (error) {
    console.error("Error fetching library:", error);
    return NextResponse.json(
      { error: "Failed to fetch library" },
      { status: 500 }
    );
  }
}
