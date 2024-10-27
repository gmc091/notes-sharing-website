import { NextResponse } from "next/server";
import { auth, clerkClient, type User } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId: currentUserId } = auth();

    // Rest of the leaderboard code remains the same...
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
