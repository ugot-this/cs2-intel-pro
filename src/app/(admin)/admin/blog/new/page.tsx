"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function NewBlogPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [saving, setSaving] = useState(false);

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!slug || slug === toSlug(title)) setSlug(toSlug(v));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/blog/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, slug, excerpt: excerpt || undefined, content, coverImage: coverImage || undefined,
          category: category || undefined, tags: tags.split(",").map(t => t.trim()).filter(Boolean),
          status, seoTitle: seoTitle || undefined, seoDescription: seoDescription || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) { toast.success("Post created"); router.push("/admin/blog"); }
      else toast.error(data.error || "Failed to create post");
    } finally { setSaving(false); }
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button render={<Link href="/admin/blog">← Back</Link>} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" />
        <h1 className="text-2xl font-bold">New Blog Post</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-base">Post Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1"><Label>Title *</Label><Input value={title} onChange={e => handleTitleChange(e.target.value)} required className="bg-surface border-border" /></div>
            <div className="space-y-1"><Label>Slug *</Label><Input value={slug} onChange={e => setSlug(e.target.value)} required className="bg-surface border-border font-mono text-sm" /></div>
            <div className="space-y-1"><Label>Excerpt</Label><Textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} className="bg-surface border-border" /></div>
            <div className="space-y-1"><Label>Content *</Label><Textarea value={content} onChange={e => setContent(e.target.value)} required rows={12} className="bg-surface border-border font-mono text-sm" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Cover Image URL</Label><Input value={coverImage} onChange={e => setCoverImage(e.target.value)} className="bg-surface border-border" /></div>
              <div className="space-y-1"><Label>Category</Label><Input value={category} onChange={e => setCategory(e.target.value)} className="bg-surface border-border" /></div>
            </div>
            <div className="space-y-1"><Label>Tags (comma-separated)</Label><Input value={tags} onChange={e => setTags(e.target.value)} className="bg-surface border-border" /></div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={status} onValueChange={v => { if (v) setStatus(v as "DRAFT" | "PUBLISHED"); }}>
                <SelectTrigger className="bg-surface border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-surface border-border">
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-base">SEO</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1"><Label>SEO Title</Label><Input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className="bg-surface border-border" /></div>
            <div className="space-y-1"><Label>SEO Description</Label><Textarea value={seoDescription} onChange={e => setSeoDescription(e.target.value)} rows={2} className="bg-surface border-border" /></div>
          </CardContent>
        </Card>
        <Button type="submit" disabled={saving} className="w-full">{saving ? "Creating..." : "Create Post"}</Button>
      </form>
    </div>
  );
}
