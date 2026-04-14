"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Plan = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  features: string[];
  stripePriceId: string | null;
};

export function PricingPageClient({ plans }: { plans: Plan[] }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(plan: Plan) {
    if (!session) {
      window.location.href = "/register";
      return;
    }
    if (!plan.stripePriceId) return; // free plan
    setLoading(plan.id);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug: plan.slug }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {plans.map((plan) => {
        const isPro = plan.slug === "pro";
        const isFree = plan.slug === "free";
        return (
          <Card
            key={plan.id}
            className={cn(
              "relative flex flex-col bg-card border",
              isPro ? "border-primary shadow-glow scale-105" : "border-border"
            )}
          >
            {isPro && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3">Most Popular</Badge>
              </div>
            )}
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-bold text-primary">${plan.price}</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-3 flex-1 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={cn("w-full", isPro && "shadow-glow")}
                variant={isPro ? "default" : "outline"}
                disabled={loading === plan.id}
                onClick={() =>
                  isFree ? (window.location.href = "/register") : handleCheckout(plan)
                }
              >
                {loading === plan.id
                  ? "Processing..."
                  : isFree
                    ? "Get Started Free"
                    : `Get ${plan.name}`}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
