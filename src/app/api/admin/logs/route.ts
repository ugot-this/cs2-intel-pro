import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);

    const skip = (page - 1) * limit;

    const [total, logs] = await Promise.all([
      prisma.adminLog.count(),
      prisma.adminLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          admin: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      logs,
      pagination: { page, limit, total, totalPages },
    });
  } catch (error) {
    console.error("Admin logs list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
