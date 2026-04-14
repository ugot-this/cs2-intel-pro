import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { BlogEditForm } from "./edit-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id }, select: { title: true } });
  return { title: post ? `Edit: ${post.title}` : "Post Not Found" };
}

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();
  return <BlogEditForm post={{
    id: post.id, title: post.title, slug: post.slug, excerpt: post.excerpt ?? "",
    content: post.content, coverImage: post.coverImage ?? "", category: post.category ?? "",
    tags: post.tags.join(", "), status: post.status,
    seoTitle: post.seoTitle ?? "", seoDescription: post.seoDescription ?? "",
  }} />;
}
