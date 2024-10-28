// app/api/v1/users/me/preferences/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Type definitions
interface UserPreferences {
  showInLeaderboard: boolean;
}

interface CacheEntry {
  data: UserPreferences;
  timestamp: number;
}

// Validation schema
const preferenceSchema = z.object({
  showInLeaderboard: z.boolean(),
});

// Cache user preferences (5 minutes)
const userPrefsCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000;

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check cache
    const cached = userPrefsCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { showInLeaderboard: true },
    });

    const response: UserPreferences = {
      showInLeaderboard: user?.showInLeaderboard ?? true,
    };

    // Update cache
    userPrefsCache.set(userId, {
      data: response,
      timestamp: Date.now(),
    });

    return NextResponse.json(response);
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

    const data = await request.json();
    const validated = preferenceSchema.parse(data);

    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: { showInLeaderboard: validated.showInLeaderboard },
      create: {
        clerkId: userId,
        showInLeaderboard: validated.showInLeaderboard,
        points: 5, // Default points
      },
    });

    const response: UserPreferences = {
      showInLeaderboard: user.showInLeaderboard,
    };

    // Update cache
    userPrefsCache.set(userId, {
      data: response,
      timestamp: Date.now(),
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating preferences:", error);

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
  }
}
