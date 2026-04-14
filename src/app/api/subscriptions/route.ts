import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: token.userId as string },
      include: { plan: true },
    });

    if (!subscription) {
      return NextResponse.json({ plan: "free", status: "ACTIVE", features: [] });
    }

    const features = Array.isArray(subscription.plan.features)
      ? subscription.plan.features
      : [];

    return NextResponse.json({
      plan: subscription.plan.slug,
      planName: subscription.plan.name,
      status: subscription.status,
      features,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    });
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
