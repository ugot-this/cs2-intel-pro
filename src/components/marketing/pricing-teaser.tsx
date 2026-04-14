import Link from "next/link";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with basic match previews.",
    features: [
      "5 match previews per day",
      "Basic win probability",
      "Public match history",
      "Community access",
    ],
    cta: "Get Started",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/ month",
    description: "Everything you need for serious analysis.",
    features: [
      "Unlimited match previews",
      "Advanced AI predictions",
      "Team deep-dive analytics",
      "Live odds tracker",
      "Pro written insights",
      "Email alerts",
    ],
    cta: "Start Pro",
    href: "/register",
    highlighted: true,
  },
  {
    name: "VIP",
    price: "$79",
    period: "/ month",
    description: "Maximum edge for professionals.",
    features: [
      "Everything in Pro",
      "Exclusive VIP signals",
      "Priority data refresh",
      "Private Discord access",
      "1-on-1 analyst sessions",
      "Custom watchlists",
    ],
    cta: "Go VIP",
    href: "/register",
    highlighted: false,
  },
];

export function PricingTeaser() {
  return (
    <section className="py-24 bg-surface/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent{" "}
            <span className="text-primary text-glow">Pricing</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            Start free, upgrade when you need more power. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-6 flex flex-col gap-6 ${
                plan.highlighted
                  ? "border-primary shadow-glow bg-card"
                  : "border-border bg-card"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">
                    {plan.period}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  {plan.description}
                </p>
              </div>

              <ul className="flex flex-col gap-2.5 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`inline-flex items-center justify-center rounded-lg h-10 px-4 text-sm font-semibold transition-all ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
                    : "border border-border bg-background hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/pricing"
            className="text-primary hover:underline text-sm font-medium"
          >
            View full plan comparison →
          </Link>
        </div>
      </div>
    </section>
  );
}
