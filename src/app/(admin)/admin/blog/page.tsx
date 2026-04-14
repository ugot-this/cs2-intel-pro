import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Blog Posts" };

const PER_PAGE = 15;

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const skip = (page - 1) * PER_PAGE;

  const statusFilter = status === "PUBLISHED" ? "PUBLISHED" : status === "DRAFT" ? "DRAFT" : undefined;
  const where = statusFilter ? { status: statusFilter as "PUBLISHED" | "DRAFT" } : {};

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: { author: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: PER_PAGE,
      skip,
    }),
    prisma.blogPost.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-glow">Blog Posts</h1>
        <Button render={<Link href="/admin/blog/new">+ New Post</Link>} variant="default" size="sm" />
      </div>

      <div className="flex gap-2">
        {[["", "All"], ["PUBLISHED", "Published"], ["DRAFT", "Drafts"]].map(([val, label]) => (
          <Link key={val} href={val ? `/admin/blog?status=${val}` : "/admin/blog"}
            className={cn("text-sm px-3 py-1.5 rounded-md border transition-colors",
              (val === "" ? !statusFilter : statusFilter === val)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50")}>
            {label}
          </Link>
        ))}
      </div>

      <Card className="bg-card border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Title</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Author</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map(post => (
              <TableRow key={post.id} className="border-border hover:bg-surface">
                <TableCell className="font-medium max-w-xs truncate">{post.title}</TableCell>
                <TableCell>
                  <Badge variant="outline"
                    className={post.status === "PUBLISHED" ? "border-primary/30 text-primary" : "border-border text-muted-foreground"}>
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{post.author.name ?? post.author.email}</TableCell>
                <TableCell className="text-muted-foreground">{post.createdAt.toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button render={<Link href={`/admin/blog/${post.id}/edit`}>Edit</Link>} variant="ghost" size="sm" className="h-7 text-xs hover:text-primary" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center gap-4 text-sm">
          {page > 1 && <Link href={`?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ""}`} className="border border-border px-3 py-1.5 rounded-md hover:border-primary/50 transition-colors">← Prev</Link>}
          <span className="text-muted-foreground">Page {page} of {totalPages}</span>
          {page < totalPages && <Link href={`?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ""}`} className="border border-border px-3 py-1.5 rounded-md hover:border-primary/50 transition-colors">Next →</Link>}
        </div>
      )}
    </div>
  );
}
