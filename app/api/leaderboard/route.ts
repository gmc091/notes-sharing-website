// app/api/leaderboard/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth, clerkClient, type User } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const { userId: currentUserId } = auth();

    // Get users with their note counts
    const users = await prisma.user.findMany({
      where: {
        showInLeaderboard: true,
      },
      select: {
        clerkId: true,
        _count: {
          select: { notes: true },
        },
      },
      orderBy: {
        notes: { _count: "desc" },
      },
      take: 10,
    });

    // Get Clerk user data
    const userIds = users.map((user) => user.clerkId);
    let clerkUsers: User[] = [];
    if (userIds.length > 0) {
      const { data } = await clerkClient.users.getUserList({
        userId: userIds,
        limit: 100,
      });
      clerkUsers = data;
    }

    const leaderboardData = users.map((user) => {
      const clerkUser = clerkUsers.find((cu: User) => cu.id === user.clerkId);
      return {
        id: user.clerkId,
        username:
          clerkUser?.username || clerkUser?.firstName || "Anonymous User",
        noteCount: user._count.notes,
        isCurrentUser: user.clerkId === currentUserId,
      };
    });

    return NextResponse.json({ users: leaderboardData });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
