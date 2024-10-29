// app/api/v1/users/me/points/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createPointTransaction, getUserPoints } from "@/lib/points-utils";
import type { TransactionType } from "@/stores/points-store";

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

    // Handle purchase action
    if (body.action === "PURCHASE") {
      if (!body.noteId) {
        return NextResponse.json({ error: "Missing noteId" }, { status: 400 });
      }

      // Create purchase transaction
      await createPointTransaction({
        userId,
        amount: -1, // Spend 1 point
        type: "PURCHASE_SPENT",
        description: `Acquisto nota #${body.noteId}`,
      });
    } else {
      // Handle other transaction types
      if (!body.type || typeof body.amount !== "number" || !body.description) {
        return NextResponse.json(
          { error: "Invalid transaction data" },
          { status: 400 }
        );
      }

      await createPointTransaction({
        userId,
        amount: body.amount,
        type: body.type as TransactionType,
        description: body.description,
      });
    }

    // Get updated points after transaction
    const updatedPoints = await getUserPoints(userId);
    return NextResponse.json({ points: updatedPoints });
  } catch (error) {
    console.error("Error processing transaction:", error);
    return NextResponse.json(
      { error: "Failed to process transaction" },
      { status: 500 }
    );
  }
}
