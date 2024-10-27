// lib/points-utils.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type TransactionType =
  | "VIEW_SPENT"
  | "VIEW_EARNED"
  | "UPLOAD_REWARD"
  | "MONTHLY_BONUS"
  | "RATING_BONUS";

interface PointTransaction {
  userId: string;
  amount: number;
  type: TransactionType;
  description: string;
}

export async function getUserPoints(userId: string): Promise<number> {
  // First try to get existing user with points
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { points: true },
  });

  if (!user) {
    // If user doesn't exist, create them with initial 5 points
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

  // Start a transaction to ensure data consistency
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

export async function canUserViewNote(userId: string): Promise<boolean> {
  const points = await getUserPoints(userId);
  return points >= 1;
}

export async function handleNoteView(
  userId: string,
  noteId: number
): Promise<boolean> {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { userId: true, rating: true },
  });

  if (!note) return false;

  // Use transaction properly
  await prisma.$transaction(async (tx) => {
    // Deduct point from viewer using tx
    await tx.pointTransaction.create({
      data: {
        userId,
        amount: -1,
        type: "VIEW_SPENT",
        description: `Viewed note #${noteId}`,
      },
    });

    await tx.user.update({
      where: { clerkId: userId },
      data: {
        points: { decrement: 1 },
      },
    });

    // Award points to note owner (if not viewing their own note)
    if (userId !== note.userId) {
      // Calculate points to award based on rating
      const pointsToAward = note.rating && note.rating >= 4 ? 2 : 1;

      await tx.pointTransaction.create({
        data: {
          userId: note.userId,
          amount: pointsToAward,
          type: "VIEW_EARNED",
          description: `Note #${noteId} was viewed`,
        },
      });

      await tx.user.update({
        where: { clerkId: note.userId },
        data: {
          points: { increment: pointsToAward },
        },
      });
    }
  });

  return true;
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

export async function handleNoteRating(
  userId: string,
  noteId: number,
  rating: number
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Create or update the rating
    await tx.noteRating.upsert({
      where: {
        noteId_userId: {
          noteId,
          userId,
        },
      },
      create: {
        noteId,
        userId,
        rating,
      },
      update: {
        rating,
      },
    });

    // Recalculate average rating
    const ratings = await tx.noteRating.findMany({
      where: { noteId },
      select: { rating: true },
    });

    const avgRating =
      ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    // Update note with new average rating and count
    await tx.note.update({
      where: { id: noteId },
      data: {
        rating: avgRating,
        ratingCount: ratings.length,
      },
    });
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
