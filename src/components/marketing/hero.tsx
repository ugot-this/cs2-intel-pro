import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Crosshair } from "lucide-react";

export function Hero() {
  return (
    <section className="relative w-full py-24 md:py-32 overflow-hidden">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,255,136,0.08),transparent)]" />

      <div className="relative container mx-auto px-4 flex flex-col items-center text-center">
        <Badge
          variant="outline"
          className="mb-6 inline-flex items-center gap-1.5 border-primary/30 bg-primary/5 text-primary px-3 py-1 text-xs font-medium"
        >
          <Crosshair className="h-3 w-3" />
          AI-Powered CS2 Analysis
        </Badge>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 max-w-4xl">
          Predict. Analyze.{" "}
          <span className="text-primary text-glow">Win.</span>
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Professional-grade CS2 match intelligence powered by machine learning.
          Get real-time win probabilities, deep team analytics, and VIP signals
          trusted by top analysts worldwide.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground h-11 px-8 text-sm font-semibold transition-all hover:bg-primary/90 shadow-glow hover:shadow-glow-lg"
          >
            Get Started Free
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-surface h-11 px-8 text-sm font-semibold transition-all hover:border-primary/40 hover:bg-primary/5"
          >
            View Pricing
          </Link>
        </div>

        {/* Social proof strip */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-muted-foreground text-sm">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
            10,000+ active analysts
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
            95% prediction accuracy
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
            Live match coverage
          </span>
        </div>
      </div>
    </section>
  );
}
