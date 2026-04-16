"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const TESTIMONIALS = [
  {
    quote:
      "The multi-factor AI completely changed how I approach CS2 analysis. Win probabilities are eerily accurate — I use them before every single bet.",
    name: "Alex K.",
    role: "Pro Bettor",
    years: "3 years",
    initial: "AK",
    accentColor: "text-primary",
    borderColor: "border-primary/20",
    bgColor: "bg-primary/5",
  },
  {
    quote:
      "VIP signals alone pay for the subscription tenfold. The EV calculations flag edges I'd have missed entirely. Consistently profitable since upgrading.",
    name: "Maria S.",
    role: "Esports Analyst",
    years: "2 years",
    initial: "MS",
    accentColor: "text-cyan-400",
    borderColor: "border-cyan-400/20",
    bgColor: "bg-cyan-400/5",
  },
  {
    quote:
      "The veto simulation module is something my whole coaching team relies on for pre-match scouting. Nothing else on the market comes close to this depth.",
    name: "Jake T.",
    role: "Head Coach",
    years: "Semi-Pro",
    initial: "JT",
    accentColor: "text-emerald-400",
    borderColor: "border-emerald-400/20",
    bgColor: "bg-emerald-400/5",
  },
  {
    quote:
      "Skeptical at first — the free tier already gave me insights I wasn't finding anywhere else. Upgraded to Pro within a week. Should've done it sooner.",
    name: "Nina L.",
    role: "CS2 Content Creator",
    years: "1 year",
    initial: "NL",
    accentColor: "text-primary",
    borderColor: "border-primary/20",
    bgColor: "bg-primary/5",
  },
];

export function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_50%,rgba(0,255,136,0.04),transparent)] pointer-events-none" />

      <div className="container mx-auto px-4" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold text-primary/70 tracking-[0.25em] uppercase mb-4">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            Trusted by CS2{" "}
            <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              Professionals
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            Join thousands of analysts, bettors, and coaches who rely on CS2 Intel Pro every match day.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.09, ease: [0.23, 0.86, 0.39, 0.96] as [number, number, number, number] }}
              className={`group relative rounded-2xl border ${t.borderColor} bg-card p-6 flex flex-col gap-4 hover:border-opacity-40 transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Quote mark */}
              <div className={`absolute top-4 right-5 text-5xl font-black leading-none ${t.accentColor} opacity-10 select-none pointer-events-none`}>
                "
              </div>

              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <svg key={j} className={`h-3 w-3 ${t.accentColor}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-border/60">
                <div className={`h-9 w-9 rounded-full ${t.bgColor} border ${t.borderColor} flex items-center justify-center text-xs font-black ${t.accentColor} shrink-0`}>
                  {t.initial}
                </div>
                <div>
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.role} · {t.years}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
