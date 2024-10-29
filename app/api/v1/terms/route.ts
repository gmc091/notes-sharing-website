// app/api/terms/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // First ensure the user exists in our database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { termsAcceptance: true },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (user.termsAcceptance) {
      return NextResponse.json(user.termsAcceptance);
    }

    const termsAcceptance = await prisma.termsAcceptance.create({
      data: {
        userId: userId,
      },
    });

    return NextResponse.json(termsAcceptance);
  } catch (error) {
    console.error("[TERMS_ACCEPT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const termsAcceptance = await prisma.termsAcceptance.findUnique({
      where: {
        userId: userId,
      },
    });

    return NextResponse.json(termsAcceptance);
  } catch (error) {
    console.error("[TERMS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
