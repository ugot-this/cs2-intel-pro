import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin Logs" };

const PER_PAGE = 50;

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const skip = (page - 1) * PER_PAGE;

  const [logs, total] = await Promise.all([
    prisma.adminLog.findMany({
      include: { admin: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: PER_PAGE,
      skip,
    }),
    prisma.adminLog.count(),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-glow">Admin Logs</h1>
        <span className="text-muted-foreground text-sm">{total} total</span>
      </div>

      <Card className="bg-card border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Time</TableHead>
              <TableHead className="text-muted-foreground">Admin</TableHead>
              <TableHead className="text-muted-foreground">Action</TableHead>
              <TableHead className="text-muted-foreground">Target</TableHead>
              <TableHead className="text-muted-foreground">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map(log => (
              <TableRow key={log.id} className="border-border hover:bg-surface">
                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                  {log.createdAt.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm">{log.admin.name ?? log.admin.email}</TableCell>
                <TableCell className="font-mono text-xs text-primary">{log.action}</TableCell>
                <TableCell className="text-muted-foreground text-xs font-mono">{log.target ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground text-xs font-mono max-w-xs truncate">
                  {log.details ? JSON.stringify(log.details).slice(0, 80) : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center gap-4 text-sm">
          {page > 1 && <Link href={`?page=${page - 1}`} className="border border-border px-3 py-1.5 rounded-md hover:border-primary/50 transition-colors">← Prev</Link>}
          <span className="text-muted-foreground">Page {page} of {totalPages}</span>
          {page < totalPages && <Link href={`?page=${page + 1}`} className="border border-border px-3 py-1.5 rounded-md hover:border-primary/50 transition-colors">Next →</Link>}
        </div>
      )}
    </div>
  );
}
