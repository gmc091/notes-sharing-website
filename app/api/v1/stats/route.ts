// app/api/v1/stats/views/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Ensure route is not cached by Next.js
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Cache the total views data for 5 minutes to reduce database load
const CACHE_DURATION = 5 * 60 * 1000;
let cachedData: { totalViews: number; timestamp: number } | null = null;

export async function GET() {
  try {
    // Return cached data if available and not expired
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return NextResponse.json({ totalViews: cachedData.totalViews });
    }

    // Get total views by summing up all purchaseCount values
    const aggregation = await prisma.note.aggregate({
      _sum: {
        purchaseCount: true,
      },
    });

    const totalViews = aggregation._sum.purchaseCount || 0;

    // Update cache
    cachedData = {
      totalViews,
      timestamp: Date.now(),
    };

    return NextResponse.json({ totalViews });
  } catch (error) {
    console.error("Error fetching total views:", error);
    return NextResponse.json(
      { error: "Failed to fetch total views" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
