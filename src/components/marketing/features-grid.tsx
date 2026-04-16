"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Brain,
  BarChart3,
  Zap,
  Star,
  Map,
  TrendingUp,
} from "lucide-react";

const FEATURES = [
  {
    num: "01",
    icon: Brain,
    title: "Multi-Factor AI Engine",
    description:
      "Five weighted models — team strength, map/veto, player impact, recent form, H2H context — fused into a single win probability.",
    stat: "5 models",
    statLabel: "combined",
    accent: "from-primary/20 to-emerald-500/10",
    border: "hover:border-primary/40",
    glow: "group-hover:shadow-[0_0_30px_rgba(0,255,136,0.12)]",
  },
  {
    num: "02",
    icon: Map,
    title: "Veto Simulation",
    description:
      "Full BO1/BO3/BO5 veto sequence modeled per team's known pick/ban tendencies. See exactly which maps will be played.",
    stat: "BO5",
    statLabel: "depth",
    accent: "from-cyan-500/15 to-primary/10",
    border: "hover:border-cyan-500/30",
    glow: "group-hover:shadow-[0_0_30px_rgba(0,204,255,0.10)]",
  },
  {
    num: "03",
    icon: BarChart3,
    title: "Player Impact Scores",
    description:
      "Per-player ELO, ADR, K/D, clutch rate and role weight factored in. Star player edges surface as key factors.",
    stat: "5 metrics",
    statLabel: "per player",
    accent: "from-primary/15 to-teal-400/10",
    border: "hover:border-primary/35",
    glow: "group-hover:shadow-[0_0_30px_rgba(0,255,136,0.10)]",
  },
  {
    num: "04",
    icon: Zap,
    title: "Live Odds & EV",
    description:
      "Expected value calculation against live market odds. Positive EV bets highlighted — know when the edge is real.",
    stat: "+EV",
    statLabel: "detection",
    accent: "from-amber-500/10 to-primary/8",
    border: "hover:border-amber-500/30",
    glow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.10)]",
  },
  {
    num: "05",
    icon: Star,
    title: "VIP Signals",
    description:
      "High-confidence calls with risk level, best bet type, and analyst notes — exclusive to VIP subscribers.",
    stat: "VIP",
    statLabel: "exclusive",
    accent: "from-yellow-400/15 to-amber-500/8",
    border: "hover:border-yellow-400/40",
    glow: "group-hover:shadow-[0_0_30px_rgba(250,204,21,0.12)]",
  },
  {
    num: "06",
    icon: TrendingUp,
    title: "Rounds O/U Lines",
    description:
      "Predicted total rounds over/under with competitiveness score. Model-generated lines calibrated from thousands of matches.",
    stat: "O/U",
    statLabel: "lines",
    accent: "from-primary/12 to-cyan-400/8",
    border: "hover:border-primary/30",
    glow: "group-hover:shadow-[0_0_30px_rgba(0,255,136,0.08)]",
  },
];

export function FeaturesGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-28 relative overflow-hidden">
      {/* Subtle bg texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_50%_at_50%_100%,rgba(0,255,136,0.04),transparent)] pointer-events-none" />

      <div className="container mx-auto px-4" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.23, 0.86, 0.39, 0.96] as [number, number, number, number] }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold text-primary/70 tracking-[0.25em] uppercase mb-4">
            Intelligence Modules
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              Win
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            Six battle-tested intelligence modules built for serious CS2 analysts —
            from live prediction to deep veto research.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/40 rounded-2xl overflow-hidden border border-border/40">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.num}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: 0.1 + i * 0.08,
                  ease: [0.23, 0.86, 0.39, 0.96] as [number, number, number, number],
                }}
                className={`group relative bg-card p-7 flex flex-col gap-4 transition-all duration-300 ${feature.border} ${feature.glow} cursor-default`}
              >
                {/* Number */}
                <span className="absolute top-5 right-6 text-[2.5rem] font-black text-white/[0.04] leading-none select-none pointer-events-none">
                  {feature.num}
                </span>

                {/* Icon + accent bg */}
                <div className="relative w-fit">
                  <div
                    className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.accent} blur-lg scale-150`}
                  />
                  <div className="relative h-11 w-11 rounded-xl bg-card border border-border flex items-center justify-center group-hover:border-primary/30 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold text-foreground leading-snug">
                      {feature.title}
                    </h3>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-black text-primary leading-tight tabular-nums">
                        {feature.stat}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 leading-tight">
                        {feature.statLabel}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Left accent bar on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/0 via-primary/60 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-sm" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
