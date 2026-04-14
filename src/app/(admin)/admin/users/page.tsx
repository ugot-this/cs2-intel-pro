import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Users" };

const PER_PAGE = 20;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { search, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const skip = (page - 1) * PER_PAGE;

  const where = search
    ? { OR: [
        { email: { contains: search, mode: "insensitive" as const } },
        { name: { contains: search, mode: "insensitive" as const } },
      ]}
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { subscription: { include: { plan: true } } },
      orderBy: { createdAt: "desc" },
      take: PER_PAGE,
      skip,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-glow">Users</h1>
        <span className="text-muted-foreground text-sm">{total} total</span>
      </div>

      <form method="GET" className="flex gap-2 max-w-sm">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by email or name..."
          className="flex-1 h-9 rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <Button type="submit" variant="outline" size="sm">Search</Button>
      </form>

      <Card className="bg-card border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Email</TableHead>
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Role</TableHead>
              <TableHead className="text-muted-foreground">Plan</TableHead>
              <TableHead className="text-muted-foreground">Joined</TableHead>
              <TableHead className="text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id} className="border-border hover:bg-surface">
                <TableCell>{u.email}</TableCell>
                <TableCell className="text-muted-foreground">{u.name ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={u.role === "ADMIN" ? "default" : "outline"}
                    className={u.role === "ADMIN" ? "bg-primary/20 text-primary border-primary/30" : ""}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground capitalize">
                  {u.subscription?.plan.slug ?? "free"}
                </TableCell>
                <TableCell className="text-muted-foreground">{u.createdAt.toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button render={<Link href={`/admin/users/${u.id}`}>View</Link>} variant="ghost" size="sm" className="h-7 text-xs hover:text-primary" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center gap-4 text-sm">
          {page > 1 && <Link href={`?page=${page - 1}${search ? `&search=${search}` : ""}`} className="border border-border px-3 py-1.5 rounded-md hover:border-primary/50 transition-colors">← Prev</Link>}
          <span className="text-muted-foreground">Page {page} of {totalPages}</span>
          {page < totalPages && <Link href={`?page=${page + 1}${search ? `&search=${search}` : ""}`} className="border border-border px-3 py-1.5 rounded-md hover:border-primary/50 transition-colors">Next →</Link>}
        </div>
      )}
    </div>
  );
}
