// app/api/v1/notes/route.ts
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  schools: z.array(z.string()).optional(),
  subjects: z.array(z.string()).optional(),
  years: z.array(z.string()).optional(),
  search: z.string().optional(),
  sort: z.enum(["recent", "alpha", "popular"]).default("recent"),
});

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(request.url);

    const schools = searchParams.getAll("schools");
    const subjects = searchParams.getAll("subjects");
    const years = searchParams.getAll("years");
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "recent";

    const { page, limit } = querySchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      schools,
      subjects,
      years,
      search,
      sort,
    });

    const skip = (page - 1) * limit;

    // Build where clause
    const whereConditions: Prisma.NoteWhereInput[] = [];

    if (schools.length > 0) {
      whereConditions.push({ schools: { hasSome: schools } });
    }

    if (subjects.length > 0) {
      whereConditions.push({ subjects: { hasSome: subjects } });
    }

    if (years.length > 0) {
      whereConditions.push({ years: { hasSome: years.map(Number) } });
    }

    if (search.trim()) {
      whereConditions.push({
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
          {
            filePaths: {
              has: search,
            },
          },
        ],
      });
    }

    const where: Prisma.NoteWhereInput =
      whereConditions.length > 0 ? { AND: whereConditions } : {};

    // Define sorting
    let orderBy: Prisma.NoteOrderByWithRelationInput;
    switch (sort) {
      case "alpha":
        orderBy = { title: "asc" };
        break;
      case "popular":
        orderBy = { purchaseCount: "desc" };
        break;
      case "recent":
      default:
        orderBy = { createdAt: "desc" };
    }

    const [notes, totalCount] = await Promise.all([
      prisma.note.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true, // Added description field
          filePaths: true,
          createdAt: true,
          schools: true,
          subjects: true,
          years: true,
          purchaseCount: true,
          userId: true,
          isAnonymous: true,
          user: {
            select: {
              clerkId: true,
            },
          },
          purchases: userId
            ? {
                where: {
                  userId: userId,
                },
                select: {
                  purchasedAt: true,
                },
              }
            : false,
        },
      }),
      prisma.note.count({ where }),
    ]);

    // Transform data
    const notesWithFiles = await Promise.all(
      notes.map(async (note) => {
        const { filePaths, userId: noteUserId, user } = note;

        let authorUsername = null;
        if (!note.isAnonymous && user?.clerkId) {
          try {
            const clerkUser = await clerkClient.users.getUser(user.clerkId);
            authorUsername =
              clerkUser.username ||
              `${clerkUser.firstName} ${clerkUser.lastName}`.trim();
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        }

        return {
          ...note,
          files: filePaths.map((path) => ({
            key: path,
            name: path.split("/").pop() || path,
          })),
          authorUsername,
          filePaths: undefined,
          isPurchased: Boolean(note.purchases?.length),
          isAuthor: userId === noteUserId,
          userId: undefined,
          user: undefined,
          purchases: undefined,
        };
      })
    );

    return NextResponse.json({
      notes: notesWithFiles,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      limit,
    });
  } catch (error) {
    console.error("Error in notes GET handler:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "An error occurred while fetching notes" },
      { status: 500 }
    );
  }
}
