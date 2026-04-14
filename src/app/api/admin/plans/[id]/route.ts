import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-log";
import type { Prisma } from "@prisma/client";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getToken({ req });
    const adminId = token?.sub as string;

    const body = await req.json() as {
      name?: string;
      stripePriceId?: string;
      price?: number;
      currency?: string;
      features?: unknown;
      isActive?: boolean;
      sortOrder?: number;
    };

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.stripePriceId !== undefined && { stripePriceId: body.stripePriceId }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.currency !== undefined && { currency: body.currency }),
        ...(body.features !== undefined && { features: body.features as Prisma.InputJsonValue }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });

    logAdminAction(adminId, "UPDATE_PLAN", id, body as Record<string, unknown>);

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Admin update plan error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getToken({ req });
    const adminId = token?.sub as string;

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: false },
    });

    logAdminAction(adminId, "DEACTIVATE_PLAN", id);

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Admin deactivate plan error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
