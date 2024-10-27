import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { clerkClient, type User } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma"; // Updated import

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  schools: z.array(z.string()).optional(),
  subjects: z.array(z.string()).optional(),
  years: z.array(z.string()).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["date", "views"]).optional().default("date"),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Handle multiple values for schools, subjects, and years
    const schools = searchParams.getAll("schools");
    const subjects = searchParams.getAll("subjects");
    const years = searchParams.getAll("years");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "date";

    const { page, limit } = querySchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      schools,
      subjects,
      years,
      search,
    });

    const skip = (page - 1) * limit;

    // Build the where clause based on filters and search
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

    // Only add search condition if search is not empty
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
            filePaths: {
              has: search,
            },
          },
        ],
      });
    }

    const where: Prisma.NoteWhereInput =
      whereConditions.length > 0 ? { AND: whereConditions } : {};

    const orderBy =
      sortBy === "views"
        ? { viewCount: "desc" as const }
        : { createdAt: "desc" as const };

    const [notes, totalCount] = await Promise.all([
      prisma.note.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          filePaths: true,
          createdAt: true,
          schools: true,
          subjects: true,
          years: true,
          viewCount: true,
          userId: true,
          isAnonymous: true,
        },
      }),
      prisma.note.count({ where }),
    ]);

    // Get user data for non-anonymous notes
    const userIds = notes
      .filter((note) => !note.isAnonymous)
      .map((note) => note.userId)
      .filter((id): id is string => id !== null);

    let clerkUsers: User[] = [];
    if (userIds.length > 0) {
      const { data } = await clerkClient.users.getUserList({
        userId: userIds,
        limit: 100,
      });
      clerkUsers = data;
    }

    // Transform the data to match the expected format
    const notesWithFiles = notes.map((note) => ({
      ...note,
      files: note.filePaths.map((path) => ({
        key: path,
        name: path.split("/").pop() || path,
      })),
      user: note.isAnonymous
        ? null
        : clerkUsers.find((u: User) => u.id === note.userId) || null,
      userId: undefined, // Remove raw userId from response
    }));

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
  } finally {
    await prisma.$disconnect();
  }
}
