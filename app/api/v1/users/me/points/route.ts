// app/api/v1/users/me/points/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserPoints, handleNotePurchase } from "@/lib/points-utils";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const points = await getUserPoints(userId);
    return NextResponse.json({ points });
  } catch (error) {
    console.error("Error fetching points:", error);
    return NextResponse.json(
      { error: "Failed to fetch points" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, noteId } = body;

    if (action !== "PURCHASE" || !noteId) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const success = await handleNotePurchase(userId, noteId);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to purchase note" },
        { status: 400 }
      );
    }

    const updatedPoints = await getUserPoints(userId);
    return NextResponse.json({ points: updatedPoints });
  } catch (error) {
    console.error("Error processing points transaction:", error);
    return NextResponse.json(
      { error: "Failed to process transaction" },
      { status: 500 }
    );
  }
}
