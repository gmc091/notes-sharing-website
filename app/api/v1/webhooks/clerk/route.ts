// app/api/v1/webhooks/clerk/route.ts

import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

async function validateRequest(request: Request) {
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(CLERK_WEBHOOK_SECRET || "");

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  return evt;
}

export async function POST(request: Request) {
  try {
    const evt = await validateRequest(request);
    if (!(evt instanceof Object)) {
      return evt; // Return error response if validation failed
    }

    const eventType = evt.type;

    if (eventType === "user.created") {
      const { id: userId } = evt.data;

      try {
        await prisma.user.create({
          data: {
            clerkId: userId,
            points: 5,
            showInLeaderboard: true,
          },
        });
      } catch (error) {
        // Check if error is a Prisma error
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          // If user already exists (unique constraint violation), ignore the error
          if (error.code === "P2002") {
            return new Response("User already exists", { status: 200 });
          }
        }
        throw error;
      }

      return new Response("User initialized with points", { status: 200 });
    }

    if (eventType === "user.deleted") {
      const { id: userId } = evt.data;

      try {
        await prisma.user.delete({
          where: { clerkId: userId },
        });
      } catch (error) {
        // Check if error is a Prisma error
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          // If user doesn't exist, ignore the error
          if (error.code === "P2025") {
            return new Response("User already deleted", { status: 200 });
          }
        }
        throw error;
      }

      return new Response("User deleted", { status: 200 });
    }

    return new Response("Webhook processed", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);

    // Properly type the error message
    let errorMessage = "Error processing webhook";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
