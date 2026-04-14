import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/admin-log";

interface PlanInput {
  name: string;
  slug: string;
  price: number;
}

interface ValidateResult {
  valid: boolean;
  error?: string;
}

export function validatePlanInput({ name, slug, price }: PlanInput): ValidateResult {
  if (!name) return { valid: false, error: "Name is required" };
  if (!slug) return { valid: false, error: "Slug is required" };
  if (price < 0) return { valid: false, error: "Price cannot be negative" };
  return { valid: true };
}

export async function GET(_req: Request) {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Admin plans list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    const adminId = token?.sub as string;

    const body = await req.json() as {
      name: string;
      slug: string;
      price: number;
      stripePriceId?: string;
      currency?: string;
      features?: unknown;
      isActive?: boolean;
      sortOrder?: number;
    };

    const validation = validatePlanInput({ name: body.name, slug: body.slug, price: body.price });
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: body.name,
        slug: body.slug,
        price: body.price,
        ...(body.stripePriceId !== undefined && { stripePriceId: body.stripePriceId }),
        ...(body.currency !== undefined && { currency: body.currency }),
        ...(body.features !== undefined && { features: body.features as Parameters<typeof prisma.subscriptionPlan.create>[0]["data"]["features"] }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });

    logAdminAction(adminId, "CREATE_PLAN", plan.id, { name: body.name });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    console.error("Admin create plan error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
