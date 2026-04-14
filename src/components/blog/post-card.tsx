import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PostCardProps = {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    category: string | null;
    publishedAt: Date | null;
    createdAt: Date;
    author: { id: string; name: string | null; email: string };
  };
};

export function PostCard({ post }: PostCardProps) {
  const displayDate = (post.publishedAt ?? post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <Card className="h-full bg-card border border-border hover:border-primary/40 transition-colors overflow-hidden">
        {/* Cover image */}
        <div className="relative w-full aspect-video overflow-hidden">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 via-primary/5 to-background" />
          )}
        </div>

        <CardContent className="p-5 flex flex-col gap-3">
          {post.category && (
            <Badge variant="outline" className="self-start text-xs border-primary/40 text-primary">
              {post.category}
            </Badge>
          )}

          <h2 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-2 border-t border-border">
            <span>{post.author.name ?? post.author.email}</span>
            <span>·</span>
            <span>{displayDate}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
