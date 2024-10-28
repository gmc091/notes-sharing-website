import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  schools: z.array(z.string()).optional(),
  subjects: z.array(z.string()).optional(),
  years: z.array(z.string()).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["date", "purchases"]).default("date"),
});

export async function GET(request: Request) {
  try {
    const { userId } = auth();
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
      sortBy === "purchases"
        ? { purchaseCount: "desc" as const }
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
          purchaseCount: true,
          userId: true,
          isAnonymous: true,
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

    // Transform the data to match the expected format
    const notesWithFiles = notes.map((note) => {
      // Only destructure what we need to remove from the final object
      const { filePaths, userId: noteUserId } = note;

      return {
        ...note,
        files: filePaths.map((path) => ({
          key: path,
          name: path.split("/").pop() || path,
        })),
        filePaths: undefined, // Remove filePaths from response
        isPurchased: Boolean(note.purchases?.length),
        isAuthor: userId === noteUserId,
        userId: undefined, // Remove raw userId from response
        purchases: undefined, // Remove purchases from response
      };
    });

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
