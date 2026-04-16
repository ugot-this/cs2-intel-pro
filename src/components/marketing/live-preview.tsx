"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useEffect } from "react";
import { Activity, Shield, Crosshair, BarChart2, Layers } from "lucide-react";

function WinBar({ pct, delay = 0 }: { pct: number; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const width = useMotionValue(0);
  const widthPct = useTransform(width, (v) => `${v}%`);

  useEffect(() => {
    if (inView) {
      animate(width, pct, { duration: 1.4, delay, ease: [0.23, 0.86, 0.39, 0.96] as [number, number, number, number] });
    }
  }, [inView, pct, delay, width]);

  return (
    <div ref={ref} className="h-2 rounded-full bg-border overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
        style={{ width: widthPct, boxShadow: "0 0 10px rgba(0,255,136,0.4)" }}
      />
    </div>
  );
}

const MODEL_FACTORS = [
  { label: "Team Strength", pctA: 72, color: "bg-primary" },
  { label: "Map / Veto", pctA: 68, color: "bg-cyan-400" },
  { label: "Player Impact", pctA: 61, color: "bg-emerald-400" },
  { label: "Recent Form", pctA: 58, color: "bg-teal-400" },
];

export function LivePreview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });

  return (
    <section ref={sectionRef} className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_50%,rgba(0,255,136,0.05),transparent)] pointer-events-none" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold text-primary/70 tracking-[0.25em] uppercase mb-4">
            Live Intelligence
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            Match Analysis.{" "}
            <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              Elevated.
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            Real-time win probabilities, multi-factor model breakdown, and veto intelligence
            — all unified in one tactical view.
          </p>
        </motion.div>

        {/* Card layout: 2-col on large screens */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-5 gap-px bg-border/30 rounded-2xl overflow-hidden border border-border/50 shadow-[0_0_60px_rgba(0,255,136,0.06)]">
          {/* Left: Match + win bar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="md:col-span-3 bg-card flex flex-col"
          >
            {/* Match header */}
            <div className="px-6 py-3.5 border-b border-border flex items-center justify-between bg-surface/50">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Live</span>
                <span className="text-xs text-muted-foreground">· ESL Pro League S21</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Layers className="h-3 w-3" />
                <span>BO3</span>
              </div>
            </div>

            {/* Teams */}
            <div className="px-6 py-7 flex-1">
              {/* Team A */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-sm font-black text-primary">
                    VIT
                  </div>
                  <div>
                    <p className="font-bold text-sm">Vitality</p>
                    <p className="text-xs text-muted-foreground">#1 World · ELO 1820</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black tabular-nums">13</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Rounds</p>
                </div>
              </div>

              {/* Win probability */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-primary tabular-nums">64%</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Win Probability</span>
                  <span className="text-xs font-semibold text-muted-foreground tabular-nums">36%</span>
                </div>
                <WinBar pct={64} delay={0.4} />
              </div>

              {/* VS divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] font-black text-muted-foreground/40 tracking-[0.3em] uppercase">VS</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Team B */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 rounded-xl bg-border/80 border border-border flex items-center justify-center text-sm font-black text-muted-foreground">
                    NAVI
                  </div>
                  <div>
                    <p className="font-bold text-sm">NAVI</p>
                    <p className="text-xs text-muted-foreground">#2 World · ELO 1790</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black tabular-nums">10</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Rounds</p>
                </div>
              </div>
            </div>

            {/* Odds footer */}
            <div className="px-6 py-3.5 border-t border-border bg-surface/30 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />
                Live odds
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">VIT</p>
                  <p className="text-sm font-black text-primary">1.56</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">NAVI</p>
                  <p className="text-sm font-semibold">2.40</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Model breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="md:col-span-2 bg-card border-l border-border/0 flex flex-col"
          >
            {/* Panel header */}
            <div className="px-5 py-3.5 border-b border-border bg-surface/50 flex items-center gap-2">
              <BarChart2 className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Model</span>
            </div>

            <div className="px-5 py-6 flex flex-col gap-5 flex-1">
              {/* Confidence */}
              <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Confidence</p>
                <p className="text-3xl font-black text-primary">78%</p>
              </div>

              {/* Factor bars */}
              <div className="flex flex-col gap-3.5">
                {MODEL_FACTORS.map((f, i) => (
                  <motion.div
                    key={f.label}
                    initial={{ opacity: 0, x: 12 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.08 }}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{f.label}</span>
                      <span className="text-[10px] font-bold text-primary">{f.pctA}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-border overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${f.color}`}
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${f.pctA}%` } : {}}
                        transition={{ duration: 1.2, delay: 0.6 + i * 0.1, ease: [0.23, 0.86, 0.39, 0.96] as [number, number, number, number] }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Star player callout */}
              <div className="mt-auto rounded-xl border border-border bg-surface/40 px-4 py-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Crosshair className="h-3 w-3 text-primary" />
                  <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Star Player</span>
                </div>
                <p className="text-sm font-bold">ZywOo</p>
                <p className="text-[10px] text-muted-foreground">Rating 1.31 · ADR 82.4</p>
              </div>

              {/* Best bet */}
              <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Best Bet</p>
                <p className="text-xs font-bold text-primary">Vitality ML — 1.56</p>
                <p className="text-[10px] text-muted-foreground/70">+EV: +8.4%</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-muted-foreground/50 mt-5"
        >
          Decorative preview — real data available with a free account
        </motion.p>
      </div>
    </section>
  );
}
