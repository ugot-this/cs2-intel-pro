"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewPlanPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("0");
  const [features, setFeatures] = useState('["Feature 1", "Feature 2"]');
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  function handleNameChange(v: string) {
    setName(v);
    setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let parsedFeatures: string[];
    try { parsedFeatures = JSON.parse(features); } catch { toast.error("Features must be valid JSON array"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, price: parseFloat(price), features: parsedFeatures, sortOrder: parseInt(sortOrder), isActive }),
      });
      const data = await res.json();
      if (res.ok) { toast.success("Plan created"); router.push("/admin/plans"); }
      else toast.error(data.error || "Failed to create plan");
    } finally { setSaving(false); }
  }

  return (
    <div className="p-6 max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        <Button render={<Link href="/admin/plans">← Back</Link>} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" />
        <h1 className="text-2xl font-bold">New Plan</h1>
      </div>
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-base">Plan Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1"><Label>Name</Label><Input value={name} onChange={e => handleNameChange(e.target.value)} required className="bg-surface border-border" /></div>
            <div className="space-y-1"><Label>Slug</Label><Input value={slug} onChange={e => setSlug(e.target.value)} required className="bg-surface border-border" /></div>
            <div className="space-y-1"><Label>Price (USD/mo)</Label><Input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="bg-surface border-border" /></div>
            <div className="space-y-1"><Label>Features (JSON array)</Label><Textarea value={features} onChange={e => setFeatures(e.target.value)} rows={4} className="bg-surface border-border font-mono text-sm" /></div>
            <div className="space-y-1"><Label>Sort Order</Label><Input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="bg-surface border-border" /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4" />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <Button type="submit" disabled={saving} className="w-full">{saving ? "Creating..." : "Create Plan"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
