import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db";
import { createCheckoutSession, createOrGetCustomer } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await req.json();

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan || !plan.stripePriceId || !plan.isActive) {
      return NextResponse.json({ error: "Plan not found or unavailable" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: token.userId as string } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      customerId = await createOrGetCustomer(user.email, user.name);
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const url = await createCheckoutSession(customerId, plan.stripePriceId, token.userId as string);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
