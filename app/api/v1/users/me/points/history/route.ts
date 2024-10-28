// app/api/v1/users/me/points/history/route.ts
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

    const [transactions, totalCount] = await Promise.all([
      prisma.pointTransaction.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.pointTransaction.count({
        where: {
          userId,
        },
      }),
    ]);

    // Get current point balance
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { points: true },
    });

    return NextResponse.json({
      transactions,
      currentPoints: user?.points || 0,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      limit,
    });
  } catch (error) {
    console.error("Error fetching points history:", error);
    return NextResponse.json(
      { error: "Failed to fetch points history" },
      { status: 500 }
    );
  }
}
