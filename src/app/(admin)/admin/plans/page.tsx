import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Plans" };

export default async function AdminPlansPage() {
  const plans = await prisma.subscriptionPlan.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-glow">Subscription Plans</h1>
        <Button render={<Link href="/admin/plans/new">+ New Plan</Link>} variant="default" size="sm" />
      </div>

      <Card className="bg-card border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Slug</TableHead>
              <TableHead className="text-muted-foreground">Price</TableHead>
              <TableHead className="text-muted-foreground">Active</TableHead>
              <TableHead className="text-muted-foreground">Order</TableHead>
              <TableHead className="text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map(plan => (
              <TableRow key={plan.id} className="border-border hover:bg-surface">
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell className="text-muted-foreground">{plan.slug}</TableCell>
                <TableCell>${Number(plan.price).toFixed(2)}/{plan.currency}</TableCell>
                <TableCell>
                  <Badge variant={plan.isActive ? "default" : "outline"}
                    className={plan.isActive ? "bg-primary/20 text-primary border-primary/30" : ""}>
                    {plan.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{plan.sortOrder}</TableCell>
                <TableCell>
                  <Button render={<Link href={`/admin/plans/${plan.id}/edit`}>Edit</Link>} variant="ghost" size="sm" className="h-7 text-xs hover:text-primary" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
