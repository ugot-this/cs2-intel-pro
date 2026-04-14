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

type PlanData = { id: string; name: string; slug: string; price: number; currency: string; features: string; sortOrder: number; isActive: boolean };

export function PlanEditForm({ plan }: { plan: PlanData }) {
  const router = useRouter();
  const [name, setName] = useState(plan.name);
  const [slug, setSlug] = useState(plan.slug);
  const [price, setPrice] = useState(String(plan.price));
  const [features, setFeatures] = useState(plan.features);
  const [sortOrder, setSortOrder] = useState(String(plan.sortOrder));
  const [isActive, setIsActive] = useState(plan.isActive);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let parsedFeatures: string[];
    try { parsedFeatures = JSON.parse(features); } catch { toast.error("Features must be valid JSON array"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, price: parseFloat(price), features: parsedFeatures, sortOrder: parseInt(sortOrder), isActive }),
      });
      const data = await res.json();
      if (res.ok) { toast.success("Plan updated"); router.push("/admin/plans"); }
      else toast.error(data.error || "Failed to update");
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm(`Delete plan "${name}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Plan deleted"); router.push("/admin/plans"); }
      else { const d = await res.json(); toast.error(d.error || "Failed to delete"); }
    } finally { setDeleting(false); }
  }

  return (
    <div className="p-6 max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        <Button render={<Link href="/admin/plans">← Back</Link>} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" />
        <h1 className="text-2xl font-bold">Edit Plan</h1>
      </div>
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-base">Plan Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} required className="bg-surface border-border" /></div>
            <div className="space-y-1"><Label>Slug</Label><Input value={slug} onChange={e => setSlug(e.target.value)} required className="bg-surface border-border" /></div>
            <div className="space-y-1"><Label>Price (USD/mo)</Label><Input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="bg-surface border-border" /></div>
            <div className="space-y-1"><Label>Features (JSON array)</Label><Textarea value={features} onChange={e => setFeatures(e.target.value)} rows={4} className="bg-surface border-border font-mono text-sm" /></div>
            <div className="space-y-1"><Label>Sort Order</Label><Input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="bg-surface border-border" /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4" />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving} className="flex-1">{saving ? "Saving..." : "Save Changes"}</Button>
              <Button type="button" variant="destructive" disabled={deleting} onClick={handleDelete}>{deleting ? "Deleting..." : "Delete"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
