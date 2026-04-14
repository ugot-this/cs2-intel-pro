import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserRoleForm } from "./role-form";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { email: true } });
  return { title: user?.email ?? "User Not Found" };
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      subscription: { include: { plan: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!user) notFound();

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button render={<Link href="/admin/users">← Back to Users</Link>} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" />
        <h1 className="text-2xl font-bold">{user.name ?? user.email}</h1>
      </div>

      {/* User Info */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-base">User Info</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">Email: </span>{user.email}</div>
          <div><span className="text-muted-foreground">Name: </span>{user.name ?? "—"}</div>
          <div><span className="text-muted-foreground">Role: </span>
            <Badge variant="outline" className={user.role === "ADMIN" ? "border-primary/30 text-primary" : ""}>{user.role}</Badge>
          </div>
          <div><span className="text-muted-foreground">Joined: </span>{user.createdAt.toLocaleDateString()}</div>
          {user.stripeCustomerId && <div className="col-span-2"><span className="text-muted-foreground">Stripe ID: </span>{user.stripeCustomerId}</div>}
        </CardContent>
      </Card>

      {/* Role Edit */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-base">Change Role</CardTitle></CardHeader>
        <CardContent>
          <UserRoleForm userId={user.id} currentRole={user.role} />
        </CardContent>
      </Card>

      {/* Subscription */}
      {user.subscription && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-base">Subscription</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Plan: </span>{user.subscription.plan.name}</div>
            <div><span className="text-muted-foreground">Status: </span>
              <Badge variant="outline" className={user.subscription.status === "ACTIVE" ? "border-primary/30 text-primary" : "border-destructive/30 text-destructive"}>
                {user.subscription.status}
              </Badge>
            </div>
            <div><span className="text-muted-foreground">Period End: </span>{user.subscription.currentPeriodEnd.toLocaleDateString()}</div>
            <div><span className="text-muted-foreground">Cancel at Period End: </span>{user.subscription.cancelAtPeriodEnd ? "Yes" : "No"}</div>
          </CardContent>
        </Card>
      )}

      {/* Payments */}
      {user.payments.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-base">Recent Payments</CardTitle></CardHeader>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Amount</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.payments.map(p => (
                <TableRow key={p.id} className="border-border hover:bg-surface">
                  <TableCell>${Number(p.amount).toFixed(2)} {p.currency.toUpperCase()}</TableCell>
                  <TableCell><Badge variant="outline" className={p.status === "SUCCEEDED" ? "border-primary/30 text-primary" : "border-destructive/30 text-destructive"}>{p.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{p.createdAt.toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
