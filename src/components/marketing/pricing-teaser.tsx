"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Zap, Star, ArrowRight } from "lucide-react";

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
    variant: "default" as const,
    badge: null,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/ month",
    description: "Everything for serious CS2 analysis.",
    features: [
      "Unlimited match previews",
      "Full AI model breakdown",
      "Player impact scores",
      "Veto simulation",
      "Live odds & EV calc",
      "Email alerts",
    ],
    cta: "Start Pro",
    href: "/register",
    variant: "pro" as const,
    badge: "Most Popular",
  },
  {
    name: "VIP",
    price: "$79",
    period: "/ month",
    description: "Maximum edge for professionals.",
    features: [
      "Everything in Pro",
      "Exclusive VIP signals",
      "Rounds O/U lines",
      "Risk level ratings",
      "Private Discord access",
      "1-on-1 analyst sessions",
    ],
    cta: "Go VIP",
    href: "/register",
    variant: "vip" as const,
    badge: "Best Value",
  },
];

export function PricingTeaser() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(0,255,136,0.05),transparent)] pointer-events-none" />

      <div className="container mx-auto px-4" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold text-primary/70 tracking-[0.25em] uppercase mb-4">
            Pricing
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            Simple,{" "}
            <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              Transparent
            </span>{" "}
            Pricing
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            Start free. Upgrade when you want more power. Cancel anytime.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.23, 0.86, 0.39, 0.96] as [number, number, number, number] }}
              className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                plan.variant === "pro"
                  ? "border-primary/50 bg-card shadow-[0_0_60px_rgba(0,255,136,0.15)] -translate-y-2 md:-translate-y-4"
                  : plan.variant === "vip"
                  ? "border-amber-400/30 bg-[#0f1208] hover:border-amber-400/50"
                  : "border-border bg-card hover:border-border/80"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[10px] font-black tracking-widest uppercase ${
                      plan.variant === "pro"
                        ? "bg-primary text-primary-foreground"
                        : "bg-amber-400 text-black"
                    }`}
                  >
                    {plan.variant === "pro" ? <Zap className="h-2.5 w-2.5" /> : <Star className="h-2.5 w-2.5" />}
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h3
                    className={`text-base font-black uppercase tracking-widest ${
                      plan.variant === "pro"
                        ? "text-primary"
                        : plan.variant === "vip"
                        ? "text-amber-400"
                        : "text-foreground"
                    }`}
                  >
                    {plan.name}
                  </h3>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-black tabular-nums">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              {/* Divider */}
              <div
                className={`h-px mb-6 ${
                  plan.variant === "pro"
                    ? "bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                    : plan.variant === "vip"
                    ? "bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"
                    : "bg-border"
                }`}
              />

              {/* Features */}
              <ul className="flex flex-col gap-2.5 flex-1 mb-7">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className={`h-4 w-4 mt-0.5 shrink-0 ${
                        plan.variant === "pro"
                          ? "text-primary"
                          : plan.variant === "vip"
                          ? "text-amber-400"
                          : "text-primary/60"
                      }`}
                    />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={`group inline-flex items-center justify-center gap-2 rounded-xl h-11 px-4 text-sm font-bold tracking-wide transition-all ${
                  plan.variant === "pro"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_25px_rgba(0,255,136,0.3)]"
                    : plan.variant === "vip"
                    ? "bg-amber-400/10 text-amber-400 border border-amber-400/30 hover:bg-amber-400/20 hover:border-amber-400/50"
                    : "border border-border bg-background hover:border-primary/30 hover:bg-primary/5"
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Pro glow overlay */}
              {plan.variant === "pro" && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/[0.04] to-transparent pointer-events-none" />
              )}
              {plan.variant === "vip" && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-amber-400/[0.04] to-transparent pointer-events-none" />
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center mt-10"
        >
          <Link
            href="/pricing"
            className="text-primary hover:underline text-sm font-semibold inline-flex items-center gap-1.5"
          >
            View full plan comparison
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
