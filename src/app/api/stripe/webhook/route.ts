import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

export function mapStripeStatus(
  status: string
): "ACTIVE" | "CANCELED" | "PAST_DUE" | "TRIALING" {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "canceled":
      return "CANCELED";
    case "past_due":
    case "incomplete":
    case "incomplete_expired":
    case "unpaid":
      return "PAST_DUE";
    case "trialing":
      return "TRIALING";
    case "paused":
      return "CANCELED";
    default:
      return "CANCELED";
  }
}

/** Extract period timestamps from subscription items (Stripe v22: moved from sub to items) */
function getSubPeriod(sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  return {
    start: item?.current_period_start ?? sub.start_date,
    end: item?.current_period_end ?? Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
  };
}

/** Extract subscription ID from an invoice (Stripe v22: moved to parent.subscription_details) */
function getInvoiceSubId(invoice: Stripe.Invoice): string | null {
  const sub = invoice.parent?.subscription_details?.subscription;
  if (!sub) return null;
  return typeof sub === "string" ? sub : sub.id;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) break;

        const stripeSubId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
        if (!stripeSubId) break;

        const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
        const priceId = stripeSub.items.data[0]?.price.id;
        if (!priceId) {
          console.error("checkout.session.completed: no priceId on subscription", stripeSubId);
          return NextResponse.json({ error: "No price found on subscription" }, { status: 500 });
        }

        const plan = await prisma.subscriptionPlan.findFirst({
          where: { stripePriceId: priceId },
        });
        if (!plan) break;

        const { start, end } = getSubPeriod(stripeSub);

        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            planId: plan.id,
            stripeSubId,
            status: mapStripeStatus(stripeSub.status),
            currentPeriodStart: new Date(start * 1000),
            currentPeriodEnd: new Date(end * 1000),
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          },
          update: {
            planId: plan.id,
            stripeSubId,
            status: mapStripeStatus(stripeSub.status),
            currentPeriodStart: new Date(start * 1000),
            currentPeriodEnd: new Date(end * 1000),
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          },
        });

        if (session.customer) {
          const customerId = typeof session.customer === "string"
            ? session.customer
            : session.customer.id;
          await prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customerId },
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const stripeSubId = getInvoiceSubId(invoice);
        if (!stripeSubId) break;

        const subscription = await prisma.subscription.findUnique({
          where: { stripeSubId },
        });
        if (!subscription) break;

        // Use invoice.id as the unique payment identifier (Stripe v22: payment_intent removed from invoice)
        const stripePaymentId = invoice.id;

        // Idempotent: upsert so duplicate event deliveries are no-ops
        await prisma.payment.upsert({
          where: { stripePaymentId },
          create: {
            userId: subscription.userId,
            subscriptionId: subscription.id,
            stripePaymentId,
            amount: invoice.amount_paid / 100,
            currency: invoice.currency,
            status: "SUCCEEDED",
          },
          update: {},
        });

        // Update subscription period using authoritative Stripe subscription data
        const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
        const { start, end } = getSubPeriod(stripeSub);
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: "ACTIVE",
            currentPeriodStart: new Date(start * 1000),
            currentPeriodEnd: new Date(end * 1000),
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const stripeSubId = getInvoiceSubId(invoice);
        if (!stripeSubId) break;

        await prisma.subscription.update({
          where: { stripeSubId },
          data: { status: "PAST_DUE" },
        });
        break;
      }

      case "customer.subscription.updated": {
        const stripeSub = event.data.object as Stripe.Subscription;

        // Guard: skip if subscription not found (out-of-order delivery)
        const existing = await prisma.subscription.findUnique({
          where: { stripeSubId: stripeSub.id },
        });
        if (!existing) break;

        const priceId = stripeSub.items.data[0]?.price.id;
        let planId: string | undefined;
        if (priceId) {
          const plan = await prisma.subscriptionPlan.findFirst({
            where: { stripePriceId: priceId },
          });
          if (plan) planId = plan.id;
        }

        const { start, end } = getSubPeriod(stripeSub);

        await prisma.subscription.update({
          where: { stripeSubId: stripeSub.id },
          data: {
            status: mapStripeStatus(stripeSub.status),
            ...(planId ? { planId } : {}),
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
            currentPeriodStart: new Date(start * 1000),
            currentPeriodEnd: new Date(end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const stripeSub = event.data.object as Stripe.Subscription;

        const freePlan = await prisma.subscriptionPlan.findFirst({
          where: { slug: "free" },
        });
        if (!freePlan) break;

        const hundredYearsFromNow = new Date();
        hundredYearsFromNow.setFullYear(hundredYearsFromNow.getFullYear() + 100);

        await prisma.subscription.update({
          where: { stripeSubId: stripeSub.id },
          data: {
            planId: freePlan.id,
            stripeSubId: null,
            status: "ACTIVE",
            cancelAtPeriodEnd: false,
            currentPeriodEnd: hundredYearsFromNow,
          },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Processing error" }, { status: 500 });
  }
}
