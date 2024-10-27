// app/api/user/preferences/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma"; // Updated import

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { showInLeaderboard: true },
    });

    return NextResponse.json({
      showInLeaderboard: user?.showInLeaderboard ?? true,
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { showInLeaderboard } = await request.json();

    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: { showInLeaderboard },
      create: { clerkId: userId, showInLeaderboard },
    });

    return NextResponse.json({
      showInLeaderboard: user.showInLeaderboard,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
