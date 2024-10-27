// app/api/webhooks/clerk/route.ts

import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// These should match the webhook secrets you set in your Clerk Dashboard
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
      // Initialize user with 5 points when they sign up
      const { id: userId } = evt.data;

      await prisma.user.create({
        data: {
          clerkId: userId,
          points: 5,
          showInLeaderboard: true,
        },
      });

      return new Response("User initialized with points", { status: 200 });
    }

    if (eventType === "user.deleted") {
      // Clean up user data when they delete their account
      const { id: userId } = evt.data;

      await prisma.user.delete({
        where: { clerkId: userId },
      });

      return new Response("User deleted", { status: 200 });
    }

    return new Response("Webhook processed", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Error processing webhook", { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
