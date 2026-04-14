import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request) {
  try {
    const [
      totalUsers,
      paidSubscriptions,
      revenueAgg,
      planBreakdownRaw,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({
        where: {
          status: "ACTIVE",
          plan: { slug: { not: "free" } },
        },
      }),
      prisma.payment.aggregate({
        where: { status: "SUCCEEDED" },
        _sum: { amount: true },
      }),
      prisma.subscription.groupBy({
        by: ["planId"],
        _count: true,
        where: { status: "ACTIVE" },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true, name: true, createdAt: true },
      }),
    ]);

    const totalRevenue = revenueAgg._sum.amount
      ? revenueAgg._sum.amount.toNumber()
      : 0;

    // Fetch plans for name mapping
    const planIds = planBreakdownRaw.map((r) => r.planId);
    const plans = await prisma.subscriptionPlan.findMany({
      where: { id: { in: planIds } },
      select: { id: true, name: true, slug: true },
    });

    const planMap = new Map(plans.map((p) => [p.id, p]));

    const planBreakdown = planBreakdownRaw.map((r) => {
      const plan = planMap.get(r.planId);
      return {
        plan: plan?.name ?? r.planId,
        slug: plan?.slug ?? "",
        count: r._count,
      };
    });

    return NextResponse.json({
      totalUsers,
      paidSubscriptions,
      totalRevenue,
      planBreakdown,
      recentUsers,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
