import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, CreditCard, DollarSign, TrendingUp } from "lucide-react";


export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminPage() {
  const [totalUsers, paidSubscriptions, revenueAgg, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "ACTIVE", plan: { slug: { not: "free" } } } }),
    prisma.payment.aggregate({ where: { status: "SUCCEEDED" }, _sum: { amount: true } }),
    prisma.user.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, email: true, name: true, createdAt: true } }),
  ]);

  const totalRevenue = revenueAgg._sum.amount ? Number(revenueAgg._sum.amount) : 0;

  const stats = [
    { label: "Total Users", value: totalUsers.toLocaleString(), icon: Users },
    { label: "Paid Subscribers", value: paidSubscriptions.toLocaleString(), icon: CreditCard },
    { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign },
    { label: "Active Plans", value: "3", icon: TrendingUp },
  ];

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-glow">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="bg-card border-border">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{s.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Users</h2>
        <Card className="bg-card border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.map(u => (
                <TableRow key={u.id} className="border-border hover:bg-surface">
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell className="text-muted-foreground">{u.name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{u.createdAt.toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
