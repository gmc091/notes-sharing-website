// lib/points-utils.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type TransactionType = "PURCHASE" | "UPLOAD_REWARD" | "MONTHLY_BONUS";

interface PointTransaction {
  userId: string;
  amount: number;
  type: TransactionType;
  description: string;
}

export async function getUserPoints(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { points: true },
  });

  if (!user) {
    // If user doesn't exist, create them with initial points
    const newUser = await prisma.user.create({
      data: {
        clerkId: userId,
        points: 5,
      },
      select: { points: true },
    });
    return newUser.points;
  }

  return user.points;
}

export async function createPointTransaction(
  transaction: PointTransaction
): Promise<void> {
  const { userId, amount, type, description } = transaction;

  await prisma.$transaction(async (tx) => {
    // Create the transaction record
    await tx.pointTransaction.create({
      data: {
        userId,
        amount,
        type,
        description,
      },
    });

    // Update user's points
    await tx.user.update({
      where: { clerkId: userId },
      data: {
        points: {
          increment: amount,
        },
      },
    });
  });
}

export async function handleNotePurchase(
  userId: string,
  noteId: number
): Promise<boolean> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Check if user already purchased the note
      const existingPurchase = await tx.notePurchase.findUnique({
        where: {
          noteId_userId: {
            noteId,
            userId,
          },
        },
      });

      if (existingPurchase) {
        return true; // Note already purchased
      }

      // Get note and check if user is the author
      const note = await tx.note.findUnique({
        where: { id: noteId },
        select: { userId: true },
      });

      if (!note) {
        throw new Error("Note not found");
      }

      if (note.userId === userId) {
        return true; // Author has automatic access
      }

      // Check if user has enough points
      const user = await tx.user.findUnique({
        where: { clerkId: userId },
        select: { points: true },
      });

      if (!user || user.points < 1) {
        throw new Error("Insufficient points");
      }

      // Deduct point from purchaser
      await tx.user.update({
        where: { clerkId: userId },
        data: {
          points: { decrement: 1 },
          pointTransactions: {
            create: {
              amount: -1,
              type: "PURCHASE",
              description: `Purchased note #${noteId}`,
            },
          },
        },
      });

      // Record the purchase
      await tx.notePurchase.create({
        data: {
          noteId,
          userId,
          purchasedAt: new Date(),
        },
      });

      // Update note purchase count and award point to owner
      if (note.userId) {
        await tx.user.update({
          where: { clerkId: note.userId },
          data: {
            points: { increment: 1 },
            pointTransactions: {
              create: {
                amount: 1,
                type: "PURCHASE",
                description: `Note #${noteId} was purchased`,
              },
            },
          },
        });
      }

      // Increment purchase count
      await tx.note.update({
        where: { id: noteId },
        data: {
          purchaseCount: { increment: 1 },
        },
      });

      return true;
    });

    return result;
  } catch (error) {
    console.error("Error in handleNotePurchase:", error);
    return false;
  }
}

export async function handleNoteUpload(
  userId: string,
  noteId: number
): Promise<void> {
  await createPointTransaction({
    userId,
    amount: 1,
    type: "UPLOAD_REWARD",
    description: `Uploaded note #${noteId}`,
  });
}

export async function distributeMonthlyBonuses(): Promise<void> {
  const topUsers = await prisma.user.findMany({
    where: {
      showInLeaderboard: true,
    },
    orderBy: {
      notes: {
        _count: "desc",
      },
    },
    take: 3,
    select: {
      clerkId: true,
    },
  });

  const bonuses = [15, 10, 5];

  await Promise.all(
    topUsers.map((user, index) =>
      createPointTransaction({
        userId: user.clerkId,
        amount: bonuses[index],
        type: "MONTHLY_BONUS",
        description: `Monthly leaderboard bonus - Position ${index + 1}`,
      })
    )
  );
}
