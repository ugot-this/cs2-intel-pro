import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-log";
import { slugify } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);
    const status = searchParams.get("status") ?? undefined;

    const where = status ? { status: status as "DRAFT" | "PUBLISHED" } : {};
    const skip = (page - 1) * limit;

    const [total, posts] = await Promise.all([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      posts,
      pagination: { page, limit, total, totalPages },
    });
  } catch (error) {
    console.error("Admin blog posts list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    const adminId = token?.sub as string;

    const body = await req.json() as {
      title?: string;
      slug?: string;
      excerpt?: string;
      content?: string;
      coverImage?: string;
      category?: string;
      tags?: string[];
      status?: "DRAFT" | "PUBLISHED";
      seoTitle?: string;
      seoDescription?: string;
    };

    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const slug = body.slug || slugify(body.title);

    const post = await prisma.blogPost.create({
      data: {
        title: body.title,
        slug,
        authorId: adminId,
        content: body.content ?? "",
        ...(body.excerpt !== undefined && { excerpt: body.excerpt }),
        ...(body.coverImage !== undefined && { coverImage: body.coverImage }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.status === "PUBLISHED" && { publishedAt: new Date() }),
        ...(body.seoTitle !== undefined && { seoTitle: body.seoTitle }),
        ...(body.seoDescription !== undefined && { seoDescription: body.seoDescription }),
      },
    });

    logAdminAction(adminId, "CREATE_POST", post.id, { title: body.title });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Admin create blog post error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
