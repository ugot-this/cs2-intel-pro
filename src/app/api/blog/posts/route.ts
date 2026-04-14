import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");

    const where: Record<string, unknown> = { status: "PUBLISHED" };
    if (category) where.category = category;
    if (tag) where.tags = { has: tag };

    const skip = (page - 1) * limit;

    const [total, posts] = await prisma.$transaction([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          category: true,
          tags: true,
          status: true,
          publishedAt: true,
          seoTitle: true,
          seoDescription: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: { id: true, name: true, image: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ posts, total, page, totalPages });
  } catch (error) {
    console.error("Blog posts list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
