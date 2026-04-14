import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { PostCard } from "@/components/blog/post-card";

export const dynamic = "force-dynamic";
import Link from "next/link";

export const metadata: Metadata = { title: "Blog" };

const PER_PAGE = 9;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const { page: pageStr, category } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const skip = (page - 1) * PER_PAGE;

  const where = {
    status: "PUBLISHED" as const,
    ...(category ? { category } : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: PER_PAGE,
      skip,
      include: { author: { select: { id: true, name: true, email: true } } },
    }),
    prisma.blogPost.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  const categories = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { category: true },
    distinct: ["category"],
  });
  const uniqueCategories = categories.map((c) => c.category).filter(Boolean) as string[];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">Blog</h1>
        <p className="text-muted-foreground">CS2 analysis, tips, and esports insights.</p>
      </div>

      {uniqueCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/blog"
            className={`text-sm px-3 py-1 rounded-full border transition-colors ${
              !category
                ? "border-primary text-primary"
                : "border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            All
          </Link>
          {uniqueCategories.map((cat) => (
            <Link
              key={cat}
              href={`/blog?category=${encodeURIComponent(cat)}`}
              className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                category === cat
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-12">
          {page > 1 && (
            <Link
              href={`/blog?page=${page - 1}${category ? `&category=${category}` : ""}`}
              className="text-sm border border-border px-4 py-2 rounded-lg hover:border-primary/50 transition-colors"
            >
              ← Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/blog?page=${page + 1}${category ? `&category=${category}` : ""}`}
              className="text-sm border border-border px-4 py-2 rounded-lg hover:border-primary/50 transition-colors"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
