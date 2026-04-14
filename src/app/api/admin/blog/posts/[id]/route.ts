import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-log";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Admin get blog post error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getToken({ req });
    const adminId = token?.sub as string;

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

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

    // Determine publishedAt
    let publishedAt: Date | null | undefined = undefined; // keep existing
    if (body.status === "PUBLISHED" && existing.status === "DRAFT") {
      publishedAt = new Date();
    } else if (body.status === "DRAFT" && existing.status === "PUBLISHED") {
      publishedAt = null;
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.excerpt !== undefined && { excerpt: body.excerpt }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.coverImage !== undefined && { coverImage: body.coverImage }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.status !== undefined && { status: body.status }),
        ...(publishedAt !== undefined && { publishedAt }),
        ...(body.seoTitle !== undefined && { seoTitle: body.seoTitle }),
        ...(body.seoDescription !== undefined && { seoDescription: body.seoDescription }),
      },
    });

    logAdminAction(adminId, "UPDATE_POST", id, { title: body.title });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Admin update blog post error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getToken({ req });
    const adminId = token?.sub as string;

    await prisma.blogPost.delete({ where: { id } });

    logAdminAction(adminId, "DELETE_POST", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete blog post error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
