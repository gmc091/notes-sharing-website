// app/api/v1/users/leaderboard/route.ts
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { cache } from "react";

export const dynamic = "force-dynamic";

interface LeaderboardUser {
  id: string;
  username: string;
  noteCount: number;
  isCurrentUser: boolean;
}

interface LeaderboardResponse {
  users: LeaderboardUser[];
}

interface CacheData {
  data: LeaderboardResponse;
  timestamp: number;
}

// Cache the leaderboard data for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cachedData: CacheData | null = null;

// Cached user data fetching
const getClerkUsers = cache(async (userIds: string[]) => {
  if (!userIds.length) return [];
  const { data } = await clerkClient.users.getUserList({
    userId: userIds,
    limit: 100,
  });
  return data;
});

export async function GET() {
  try {
    const { userId: currentUserId } = auth();

    // Check cache
    if (
      cachedData &&
      Date.now() - cachedData.timestamp < CACHE_DURATION &&
      !currentUserId // Only use cache for non-authenticated requests
    ) {
      return NextResponse.json(cachedData.data);
    }

    // Fetch users and their note counts in a single query
    const users = await prisma.user.findMany({
      where: {
        showInLeaderboard: true,
        notes: {
          some: {}, // Only include users with at least one note
        },
      },
      select: {
        clerkId: true,
        _count: {
          select: { notes: true },
        },
      },
      orderBy: [
        { notes: { _count: "desc" } },
        { clerkId: "asc" }, // Secondary sort for stability
      ],
      take: 10,
    });

    const clerkUsers = await getClerkUsers(users.map((user) => user.clerkId));

    const leaderboardData: LeaderboardUser[] = users.map((user) => {
      const clerkUser = clerkUsers.find((cu) => cu.id === user.clerkId);
      return {
        id: user.clerkId,
        username:
          clerkUser?.username || clerkUser?.firstName || "Anonymous User",
        noteCount: user._count.notes,
        isCurrentUser: user.clerkId === currentUserId,
      };
    });

    const response: LeaderboardResponse = { users: leaderboardData };

    // Update cache if no current user
    if (!currentUserId) {
      cachedData = {
        data: response,
        timestamp: Date.now(),
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
