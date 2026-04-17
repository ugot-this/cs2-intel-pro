import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-helpers";
import {
  TrendingUp, Users, BarChart2, Zap, ArrowRight, Activity, Clock, Target,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireAuth();

  const statCards = [
    { label: "Current Plan",       value: user.planSlug.toUpperCase(), icon: Zap,      color: "text-primary",    bg: "bg-primary/10",     isText: true },
    { label: "Matches Analyzed",   value: "2,847",                     icon: BarChart2, color: "text-cyan-400",   bg: "bg-cyan-400/10",    isText: false },
    { label: "Win Rate",           value: "67%",                       icon: TrendingUp, color: "text-primary",   bg: "bg-primary/10",     isText: false },
    { label: "ROI",                value: "+23.4%",                    icon: Activity,   color: "text-emerald-400", bg: "bg-emerald-400/10", isText: false },
  ];

  const recentActivity = [
    { action: "Match analysis completed", subject: "NAVI vs Vitality",    time: "2h ago",  dot: "bg-primary" },
    { action: "Prediction generated",     subject: "FaZe Clan vs G2",      time: "5h ago",  dot: "bg-cyan-400" },
    { action: "Team stats updated",       subject: "Team Liquid",           time: "1d ago",  dot: "bg-border" },
    { action: "Signal triggered",         subject: "Astralis vs Cloud9",    time: "2d ago",  dot: "bg-border" },
  ];

  return (
    <div className="p-6 space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-primary/60 tracking-[0.2em] uppercase mb-1">Intelligence Dashboard</p>
          <h1 className="text-3xl font-black text-foreground leading-tight">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              {user.name ?? user.email}
            </span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Your CS2 Intel Pro overview</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-black text-primary uppercase tracking-widest">
          <Zap className="h-3 w-3" />
          {user.planSlug}
        </span>
      </div>

      {/* Stat Cards - 4 column grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl bg-card border border-border/60 p-4 relative overflow-hidden group hover:border-border transition-colors">
              {/* Subtle bg glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(0,255,136,0.04),transparent)]" />
              <div className="flex items-start justify-between mb-3">
                <p className="text-[11px] text-muted-foreground/60 uppercase tracking-widest font-medium">{card.label}</p>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.bg} shrink-0`}>
                  <Icon className={`h-3.5 w-3.5 ${card.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-black tabular-nums leading-none ${card.color}`}>{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/predictions"
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground h-10 px-5 text-sm font-bold hover:bg-primary/90 shadow-[0_0_20px_rgba(0,255,136,0.2)] transition-all">
            <TrendingUp className="h-3.5 w-3.5" />
            View Predictions
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link href="/dashboard/teams"
            className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card h-10 px-5 text-sm font-semibold text-foreground hover:border-primary/30 hover:text-primary transition-all">
            <Users className="h-3.5 w-3.5" />
            Team Stats
          </Link>
          {user.planSlug !== "vip" && (
            <Link href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 h-10 px-5 text-sm font-semibold text-primary hover:bg-primary/10 transition-all">
              <Zap className="h-3.5 w-3.5" />
              Upgrade Plan
            </Link>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xs font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-4">Recent Activity</h2>
        <div className="rounded-xl bg-card border border-border/60 overflow-hidden">
          {recentActivity.map((item, index) => (
            <div key={index} className={`flex items-start gap-3 px-5 py-4 ${index < recentActivity.length - 1 ? "border-b border-border/40" : ""} hover:bg-primary/2 transition-colors`}>
              <div className="flex flex-col items-center mt-1.5 gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${item.dot} shrink-0`} />
                {index < recentActivity.length - 1 && <span className="w-px h-full min-h-[16px] bg-border/30" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground/80">
                  {item.action}{" "}
                  <span className="font-bold text-foreground">{item.subject}</span>
                </p>
                <p className="text-xs text-muted-foreground/50 mt-0.5 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
