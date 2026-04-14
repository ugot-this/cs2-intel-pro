import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { PricingPageClient } from "./client";

export const metadata: Metadata = { title: "Pricing" };

export default async function PricingPage() {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const serializedPlans = plans.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    currency: p.currency,
    features: Array.isArray(p.features) ? (p.features as string[]) : [],
    stripePriceId: p.stripePriceId,
  }));

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Choose the plan that fits your analysis needs. Upgrade or downgrade anytime.
        </p>
      </div>
      <PricingPageClient plans={serializedPlans} />
    </div>
  );
}
