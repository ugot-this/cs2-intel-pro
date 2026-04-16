"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ElegantShape } from "@/components/ui/shape-landing-hero";
import { ArrowRight, Crosshair, Shield, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const step = target / (duration / 16);
          let current = 0;
          const timer = setInterval(() => {
            current = Math.min(current + step, target);
            setCount(Math.floor(current));
            if (current >= target) clearInterval(timer);
          }, 16);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const STATS = [
  { label: "Active Analysts", value: 10000, suffix: "+", icon: Shield },
  { label: "Prediction Accuracy", value: 95, suffix: "%", icon: Crosshair },
  { label: "Matches Covered", value: 200, suffix: "+", icon: Zap },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.2 + i * 0.12, ease: [0.23, 0.86, 0.39, 0.96] as [number, number, number, number] },
  }),
};

export function Hero() {
  return (
    <section className="relative w-full min-h-[92vh] flex flex-col items-center justify-center py-20 md:py-28 overflow-hidden">
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ElegantShape
          delay={0.2}
          width={650}
          height={150}
          rotate={-12}
          gradient="from-primary/25 to-cyan-500/15"
          className="-top-16 -left-48 opacity-70"
        />
        <ElegantShape
          delay={0.45}
          width={500}
          height={130}
          rotate={18}
          gradient="from-cyan-400/20 to-primary/12"
          className="top-1/3 -right-36 opacity-60"
        />
        <ElegantShape
          delay={0.35}
          width={350}
          height={90}
          rotate={-6}
          gradient="from-emerald-400/18 to-primary/10"
          className="bottom-1/3 -left-16 opacity-50"
        />
        <ElegantShape
          delay={0.6}
          width={250}
          height={65}
          rotate={42}
          gradient="from-cyan-300/15 to-teal-400/10"
          className="top-1/4 left-1/2 opacity-40"
        />
        <ElegantShape
          delay={0.55}
          width={420}
          height={110}
          rotate={-22}
          gradient="from-primary/12 to-emerald-500/8"
          className="-bottom-8 right-1/4 opacity-50"
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Center radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_35%,rgba(0,255,136,0.08),transparent)] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary tracking-widest uppercase backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            AI-Powered CS2 Intelligence
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <h1 className="text-6xl md:text-8xl lg:text-[6.5rem] font-black tracking-tight leading-[0.9] mb-4 max-w-5xl">
            <span className="block text-white/95">Predict. Analyze.</span>
            <span className="block bg-gradient-to-r from-primary via-emerald-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_60px_rgba(0,255,136,0.3)]">
              Win.
            </span>
          </h1>
        </motion.div>

        {/* Description */}
        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mt-6 mb-10 leading-relaxed"
        >
          Professional-grade CS2 match intelligence powered by multi-factor AI.
          Real-time win probabilities, veto simulation, player impact scores,
          and VIP signals trusted by top analysts worldwide.
        </motion.p>

        {/* CTAs */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-center gap-4 mb-16"
        >
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground h-12 px-8 text-sm font-bold tracking-wide transition-all hover:bg-primary/90 shadow-[0_0_30px_rgba(0,255,136,0.25)] hover:shadow-[0_0_50px_rgba(0,255,136,0.4)]"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 h-12 px-8 text-sm font-semibold backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-primary/5"
          >
            View Pricing
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-8 md:gap-16"
        >
          {STATS.map(({ label, value, suffix, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="h-3.5 w-3.5 text-primary/60" />
                <span className="text-xs text-muted-foreground/60 uppercase tracking-widest font-medium">
                  {label}
                </span>
              </div>
              <span className="text-2xl md:text-3xl font-black text-primary tabular-nums">
                <AnimatedCounter target={value} suffix={suffix} />
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
