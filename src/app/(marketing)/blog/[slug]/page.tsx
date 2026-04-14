import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { PostContent } from "@/components/blog/post-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { title: true, excerpt: true },
  });
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { author: { select: { id: true, name: true, email: true } } },
  });

  if (!post) notFound();

  return (
    <article className="container mx-auto px-4 py-16 max-w-3xl">
      {post.category && (
        <span className="text-xs font-medium text-primary uppercase tracking-wider">
          {post.category}
        </span>
      )}
      <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4">{post.title}</h1>
      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
        <span>By {post.author.name ?? post.author.email}</span>
        <span>·</span>
        <span>
          {(post.publishedAt ?? post.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
        {post.tags.length > 0 && (
          <>
            <span>·</span>
            <span>{post.tags.join(", ")}</span>
          </>
        )}
      </div>
      {post.coverImage && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-8">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
        </div>
      )}
      <PostContent content={post.content} />
    </article>
  );
}
