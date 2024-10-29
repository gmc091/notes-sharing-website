import { PrismaClient } from "@prisma/client";
import type { TransactionType } from "@/stores/points-store";

const prisma = new PrismaClient();

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
    // Verify user has enough points for negative transactions
    if (amount < 0) {
      const user = await tx.user.findUnique({
        where: { clerkId: userId },
        select: { points: true },
      });

      if (!user || user.points < Math.abs(amount)) {
        throw new Error("Insufficient points");
      }
    }

    // Create transaction record
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

export async function handleNoteUpload(
  userId: string,
  noteId: number
): Promise<void> {
  await createPointTransaction({
    userId,
    amount: 1,
    type: "UPLOAD_REWARD",
    description: `Caricamento nota #${noteId}`,
  });
}

export async function handleNotePurchase(
  userId: string,
  noteId: number
): Promise<boolean> {
  try {
    await prisma.$transaction(async (tx) => {
      // Check if already purchased
      const existingPurchase = await tx.notePurchase.findUnique({
        where: {
          noteId_userId: {
            noteId,
            userId,
          },
        },
      });

      if (existingPurchase) {
        return true;
      }

      // Get note details
      const note = await tx.note.findUnique({
        where: { id: noteId },
        select: { userId: true },
      });

      if (!note) {
        throw new Error("Note not found");
      }

      // Create purchase record
      await tx.notePurchase.create({
        data: {
          noteId,
          userId,
          purchasedAt: new Date(),
        },
      });

      // Update note purchase count
      await tx.note.update({
        where: { id: noteId },
        data: {
          purchaseCount: { increment: 1 },
        },
      });
    });

    return true;
  } catch (error) {
    console.error("Error in handleNotePurchase:", error);
    return false;
  }
}
