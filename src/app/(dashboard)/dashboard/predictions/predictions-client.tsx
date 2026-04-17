"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lock, TrendingUp, Clock, ChevronRight, Radio,
  ChevronDown, ChevronUp, Zap, Target, BarChart2,
  Map, Shield, User, TrendingDown, Award, AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TeamLogo } from "../teams/team-logo";

// ─── Types ────────────────────────────────────────────────────

export interface MapPrediction {
  mapName: string;
  teamAWinPct: number;
  teamBWinPct: number;
  predictedRounds: number;
  likelyPick: "teamA" | "teamB" | "decider";
}

export interface VetoSimulation {
  sequence: string[];
  expectedMaps: string[];
  confidence: number;
}

export interface ModelBreakdown {
  teamStrengthA: number; teamStrengthB: number;
  mapAdvantageA: number; mapAdvantageB: number;
  playerImpactA: number; playerImpactB: number;
  recentFormA: number;  recentFormB: number;
  h2hA: number;         h2hB: number;
}

export interface StarPlayer {
  name: string;
  rating: number;
  role: string;
}

export interface MatchData {
  id: number;
  teamA: {
    name: string; acronym: string; imageUrl: string | null;
    region: string; winRate: number; recentForm: ("W" | "L")[];
    players: string[];
  };
  teamB: {
    name: string; acronym: string; imageUrl: string | null;
    region: string; winRate: number; recentForm: ("W" | "L")[];
    players: string[];
  };
  league: string; serie: string; startTime: string;
  format: string; isLive: boolean;
  planReq: "free" | "pro" | "vip";
  prediction: {
    teamAWinPct: number; teamBWinPct: number;
    confidence: number; winner: string;
    keyFactors: string[]; oddsA: number; oddsB: number;
    modelBreakdown?: ModelBreakdown;
    starPlayerA?: StarPlayer; starPlayerB?: StarPlayer;
    mapPredictions?: MapPrediction[]; vetoSimulation?: VetoSimulation;
    roundsOverUnder?: { line: number; rec: "over" | "under"; conf: number };
    ev?: number; riskLevel?: "LOW" | "MEDIUM" | "HIGH"; bestBet?: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return "Явагдаж байна";
  const h = Math.round(diff / 3_600_000);
  if (h === 0) return "Удахгүй";
  if (h < 24) return `${h} цагийн дараа`;
  return `${Math.ceil(h / 24)} өдрийн дараа`;
}
const PLAN_RANK: Record<string, number> = { free: 0, pro: 1, vip: 2 };
function hasAccess(userPlan: string, required: string) {
  return PLAN_RANK[userPlan] >= PLAN_RANK[required];
}

// ─── Constants ────────────────────────────────────────────────

const BREAKDOWN_LABELS = [
  { key: "teamStrength", label: "Багийн хүч",        icon: Shield,     weight: "30%" },
  { key: "mapAdvantage", label: "Газрын давуу",       icon: Map,        weight: "30%" },
  { key: "playerImpact", label: "Тоглогчийн нөлөө",  icon: User,       weight: "20%" },
  { key: "recentForm",   label: "Сүүлийн хэлбэр",    icon: TrendingUp, weight: "10%" },
  { key: "h2h",          label: "H2H · Контекст",     icon: BarChart2,  weight: "10%" },
] as const;

const ROLE_LABELS: Record<string, string> = { awp: "AWP", entry: "Entry", support: "Support", igl: "IGL", lurk: "Lurk" };
const ROLE_COLORS: Record<string, string> = {
  awp: "text-yellow-400 bg-yellow-400/10", entry: "text-red-400 bg-red-400/10",
  support: "text-blue-400 bg-blue-400/10", igl: "text-purple-400 bg-purple-400/10",
  lurk: "text-green-400 bg-green-400/10",
};
const PICK_LABELS: Record<string, string> = { teamA: "A Pick", teamB: "B Pick", decider: "Decider" };
const PICK_COLORS: Record<string, string> = {
  teamA: "text-primary border-primary/30", teamB: "text-cyan-400 border-cyan-400/30",
  decider: "text-orange-400 border-orange-400/30",
};

// ─── Sub-components ───────────────────────────────────────────

function FormBadge({ result }: { result: "W" | "L" }) {
  return (
    <span className={cn(
      "inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-black",
      result === "W"
        ? "bg-primary/15 text-primary border border-primary/25"
        : "bg-red-500/15 text-red-400 border border-red-500/25"
    )}>
      {result}
    </span>
  );
}

function SplitBar({ pctA, nameA, nameB }: { pctA: number; nameA: string; nameB: string }) {
  const pctB = 100 - pctA;
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className={cn("text-2xl font-black tabular-nums leading-none", pctA >= pctB ? "text-primary" : "text-muted-foreground")}>
          {pctA}%
        </span>
        <span className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.2em]">Ялах магадлал</span>
        <span className={cn("text-2xl font-black tabular-nums leading-none", pctB > pctA ? "text-cyan-400" : "text-muted-foreground")}>
          {pctB}%
        </span>
      </div>
      <div className="relative h-2.5 rounded-full bg-border/60 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{
            width: `${pctA}%`,
            background: pctA >= pctB
              ? "linear-gradient(90deg, #00ff88, #00cc66)"
              : "linear-gradient(90deg, rgba(0,255,136,0.4), rgba(0,204,102,0.3))",
            boxShadow: pctA > 55 ? "0 0 10px rgba(0,255,136,0.35)" : "none",
          }}
        />
        <div
          className="absolute inset-y-0 right-0 rounded-full transition-all duration-700"
          style={{
            width: `${pctB}%`,
            background: pctB > pctA
              ? "linear-gradient(270deg, #00ccff, #0099cc)"
              : "linear-gradient(270deg, rgba(0,204,255,0.4), rgba(0,153,204,0.3))",
            boxShadow: pctB > 55 ? "0 0 10px rgba(0,204,255,0.35)" : "none",
          }}
        />
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-background/80 z-10" />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground/40">
        <span className="truncate max-w-[45%]">{nameA}</span>
        <span className="truncate max-w-[45%] text-right">{nameB}</span>
      </div>
    </div>
  );
}

function WinBar({ labelA, labelB, pctA, pctB, thin }: {
  labelA: string; labelB: string; pctA: number; pctB: number; thin?: boolean;
}) {
  const h = thin ? "h-1" : "h-1.5";
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-xs">
        <span className="w-20 font-medium truncate text-muted-foreground">{labelA}</span>
        <div className={cn("flex-1 bg-border/50 rounded-full overflow-hidden", h)}>
          <div className={cn("rounded-full", h, pctA >= pctB ? "bg-primary" : "bg-muted-foreground/30")}
            style={{ width: `${pctA}%` }} />
        </div>
        <span className={cn("w-8 text-right font-bold tabular-nums text-xs", pctA >= pctB ? "text-primary" : "text-muted-foreground/60")}>
          {pctA}%
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="w-20 font-medium truncate text-muted-foreground">{labelB}</span>
        <div className={cn("flex-1 bg-border/50 rounded-full overflow-hidden", h)}>
          <div className={cn("rounded-full", h, pctB > pctA ? "bg-cyan-400" : "bg-muted-foreground/30")}
            style={{ width: `${pctB}%` }} />
        </div>
        <span className={cn("w-8 text-right font-bold tabular-nums text-xs", pctB > pctA ? "text-cyan-400" : "text-muted-foreground/60")}>
          {pctB}%
        </span>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, label, color = "text-primary", right }: {
  icon: React.ElementType; label: string; color?: string; right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon className={cn("w-3.5 h-3.5", color)} />
        <span className={cn("text-[11px] font-bold uppercase tracking-widest", color)}>{label}</span>
      </div>
      {right}
    </div>
  );
}

// ─── PRO: Model Breakdown ──────────────────────────────────────

function ModelBreakdownPanel({ breakdown, nameA, nameB }: { breakdown: ModelBreakdown; nameA: string; nameB: string }) {
  return (
    <div>
      <SectionHeader icon={BarChart2} label="AI Загварын задаргаа" />
      <div className="space-y-3">
        {BREAKDOWN_LABELS.map(({ key, label, icon: Icon, weight }) => {
          const pctA = breakdown[`${key}A` as keyof ModelBreakdown] as number;
          const pctB = breakdown[`${key}B` as keyof ModelBreakdown] as number;
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="w-3 h-3" />
                  {label}
                </span>
                <span className="text-[10px] text-muted-foreground/40 font-mono">{weight}</span>
              </div>
              <WinBar labelA={nameA} labelB={nameB} pctA={pctA} pctB={pctB} thin />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PRO: Star Player Matchup ──────────────────────────────────

function StarPlayerPanel({ starA, starB, nameA, nameB }: { starA: StarPlayer; starB: StarPlayer; nameA: string; nameB: string }) {
  const aWins = starA.rating >= starB.rating;
  return (
    <div>
      <SectionHeader icon={Award} label="Гол тоглогчид" color="text-yellow-400" />
      <div className="grid grid-cols-2 gap-2">
        {[
          { star: starA, team: nameA, isWinner: aWins, side: "A" },
          { star: starB, team: nameB, isWinner: !aWins, side: "B" },
        ].map(({ star, team, isWinner, side }) => (
          <div key={side} className={cn(
            "rounded-lg p-3 border space-y-2",
            isWinner ? "bg-primary/5 border-primary/20" : "bg-background/30 border-border/50"
          )}>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold truncate">{star.name}</span>
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0",
                ROLE_COLORS[star.role] ?? "text-muted-foreground bg-muted/20")}>
                {ROLE_LABELS[star.role] ?? star.role}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-none">{team}</p>
            <div className="flex items-baseline gap-1.5">
              <span className={cn("text-xl font-black tabular-nums leading-none",
                isWinner ? "text-primary" : "text-foreground/70")}>
                {star.rating.toFixed(2)}
              </span>
              <span className="text-[10px] text-muted-foreground">rating</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VIP: Map Predictions ──────────────────────────────────────

function MapPredictionsPanel({ maps, nameA, nameB }: { maps: MapPrediction[]; nameA: string; nameB: string }) {
  return (
    <div>
      <SectionHeader icon={Map} label="Газрын таамаглал" color="text-orange-400" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {maps.map((m, i) => (
          <div key={i} className="bg-background/40 rounded-lg p-3 border border-border/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black">{m.mapName}</span>
              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4", PICK_COLORS[m.likelyPick])}>
                {PICK_LABELS[m.likelyPick]}
              </Badge>
            </div>
            <WinBar labelA={nameA} labelB={nameB} pctA={m.teamAWinPct} pctB={m.teamBWinPct} thin />
            <p className="text-[10px] text-muted-foreground/60 text-center font-mono">~{m.predictedRounds}R</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VIP: Veto Simulation ──────────────────────────────────────

function VetoSimulationPanel({ veto }: { veto: VetoSimulation }) {
  return (
    <div>
      <SectionHeader icon={Shield} label="Вето симуляц" color="text-blue-400"
        right={<Badge variant="outline" className="text-[10px] text-blue-400 border-blue-400/30">{veto.confidence}%</Badge>} />
      <div className="space-y-0.5">
        {veto.sequence.map((step, i) => (
          <div key={i} className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-md text-xs",
            i % 2 === 0 ? "bg-background/30" : "bg-transparent",
            step.startsWith("Decider") && "bg-orange-400/5 border border-orange-400/15"
          )}>
            <span className="w-5 h-5 rounded-full bg-border/60 flex items-center justify-center text-[10px] font-black text-muted-foreground shrink-0">
              {i + 1}
            </span>
            <span className={cn(
              "flex-1",
              step.startsWith("Decider") ? "text-orange-400 font-semibold" : "text-foreground/80"
            )}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VIP: Risk Badge ──────────────────────────────────────────

function RiskBadge({ level }: { level: "LOW" | "MEDIUM" | "HIGH" }) {
  const configs = {
    LOW:    { class: "bg-green-500/10 text-green-400 border-green-500/20", label: "Бага эрсдэл" },
    MEDIUM: { class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", label: "Дунд эрсдэл" },
    HIGH:   { class: "bg-red-500/10 text-red-400 border-red-500/20", label: "Өндөр эрсдэл" },
  };
  const c = configs[level];
  return <Badge variant="outline" className={cn("text-xs font-bold", c.class)}>{c.label}</Badge>;
}

// ─── VIP: Stats Panel ─────────────────────────────────────────

function VIPStatsPanel({ ou, ev, riskLevel, bestBet }: {
  ou: { line: number; rec: "over" | "under"; conf: number };
  ev: number; riskLevel: "LOW" | "MEDIUM" | "HIGH"; bestBet: string;
}) {
  const evPos = ev >= 0;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {/* O/U */}
        <div className="rounded-lg bg-background/50 border border-border/50 p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">O/U Раунд</p>
          <p className="text-base font-black tabular-nums">{ou.line}</p>
          <p className={cn("text-[11px] font-bold mt-1", ou.rec === "over" ? "text-green-400" : "text-red-400")}>
            {ou.rec === "over" ? "↑ Дээш" : "↓ Доош"}
          </p>
          <p className="text-[10px] text-muted-foreground/50 mt-0.5">{ou.conf}% conf</p>
        </div>
        {/* EV */}
        <div className="rounded-lg bg-background/50 border border-border/50 p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">EV%</p>
          <p className={cn("text-base font-black tabular-nums", evPos ? "text-green-400" : "text-red-400")}>
            {evPos ? "+" : ""}{ev.toFixed(1)}%
          </p>
          <p className="text-[10px] text-muted-foreground/50 mt-1.5">Хүлээгдэх</p>
        </div>
        {/* Risk */}
        <div className="rounded-lg bg-background/50 border border-border/50 p-3 flex flex-col items-center justify-center gap-1.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Эрсдэл</p>
          <RiskBadge level={riskLevel} />
        </div>
      </div>
      {/* Best bet */}
      <div className="rounded-lg bg-yellow-400/5 border border-yellow-400/20 p-3 flex items-start gap-2.5">
        <Zap className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-[11px] font-black text-yellow-400 uppercase tracking-widest mb-1">Хамгийн сайн бет</p>
          <p className="text-sm text-foreground/90">{bestBet}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Prediction Panel ─────────────────────────────────────────

function PredictionPanel({ match, userPlan }: { match: MatchData; userPlan: string }) {
  const { prediction: p, teamA, teamB } = match;
  const winnerName = p.winner === "teamA" ? teamA.name : teamB.name;
  const canPro = hasAccess(userPlan, "pro");
  const canVip = hasAccess(userPlan, "vip");

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: [0.23, 0.86, 0.39, 0.96] as [number, number, number, number] }}
      className="overflow-hidden"
    >
      <div className="border-t border-border/50 mt-4 pt-5 space-y-4">

        {/* AI prediction summary */}
        <div className="rounded-xl bg-primary/5 border border-primary/15 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-black text-primary uppercase tracking-widest">AI Таамаглал</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">Итгэл:</span>
              <span className="text-sm font-black text-primary tabular-nums">{p.confidence}%</span>
            </div>
          </div>

          {/* Win probability split bar */}
          <SplitBar pctA={p.teamAWinPct} nameA={teamA.name} nameB={teamB.name} />

          {/* Winner + Odds */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="bg-background/50 rounded-lg p-2.5 text-center border border-border/40">
              <p className="text-[10px] text-muted-foreground mb-1">Таамагласан ялагч</p>
              <p className="text-xs font-black text-primary truncate">{winnerName}</p>
            </div>
            <div className="bg-background/50 rounded-lg p-2.5 text-center border border-border/40">
              <p className="text-[10px] text-muted-foreground mb-1">{teamA.acronym} odds</p>
              <p className="text-sm font-black tabular-nums">{p.oddsA}</p>
            </div>
            <div className="bg-background/50 rounded-lg p-2.5 text-center border border-border/40">
              <p className="text-[10px] text-muted-foreground mb-1">{teamB.acronym} odds</p>
              <p className="text-sm font-black tabular-nums">{p.oddsB}</p>
            </div>
          </div>

          {/* Key factors */}
          {canPro ? (
            <div className="space-y-1.5 pt-1">
              {p.keyFactors.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground/80">
                  <span className="text-primary/60 mt-0.5 shrink-0 text-[10px]">▸</span>
                  {f}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/50 rounded-lg p-2.5 border border-border/40">
              <Lock className="w-3 h-3 shrink-0" />
              Гол хүчин зүйлийг харахын тулд Pro эрх шаардлагатай
            </div>
          )}
        </div>

        {/* PRO: Model breakdown + star players */}
        {canPro ? (
          <>
            {p.modelBreakdown && (
              <div className="rounded-xl bg-card border border-border/60 p-4">
                <ModelBreakdownPanel breakdown={p.modelBreakdown} nameA={teamA.name} nameB={teamB.name} />
              </div>
            )}
            {p.starPlayerA && p.starPlayerB && (
              <div className="rounded-xl bg-card border border-border/60 p-4">
                <StarPlayerPanel starA={p.starPlayerA} starB={p.starPlayerB} nameA={teamA.name} nameB={teamB.name} />
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl bg-card border border-primary/15 p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold flex items-center gap-1.5 mb-0.5">
                <Lock className="w-3 h-3 text-primary" />
                AI Загварын задаргаа
              </p>
              <p className="text-[11px] text-muted-foreground">5 хүчин зүйлийн задаргаа · Гол тоглогчийн харьцуулалт</p>
            </div>
            <Button size="sm" variant="outline" className="shrink-0 text-xs border-primary/40 text-primary hover:bg-primary/10" render={<Link href="/pricing" />}>
              Pro нээх
            </Button>
          </div>
        )}

        {/* VIP: Deep insights */}
        {canVip ? (
          <>
            {p.mapPredictions && p.mapPredictions.length > 0 && (
              <div className="rounded-xl bg-card border border-border/60 p-4">
                <MapPredictionsPanel maps={p.mapPredictions} nameA={teamA.name} nameB={teamB.name} />
              </div>
            )}
            {p.vetoSimulation && (
              <div className="rounded-xl bg-card border border-border/60 p-4">
                <VetoSimulationPanel veto={p.vetoSimulation} />
              </div>
            )}
            {p.roundsOverUnder && p.ev !== undefined && p.riskLevel && p.bestBet && (
              <div className="rounded-xl bg-card border border-yellow-400/20 p-4">
                <SectionHeader icon={Zap} label="VIP Дохио" color="text-yellow-400" />
                <VIPStatsPanel ou={p.roundsOverUnder} ev={p.ev} riskLevel={p.riskLevel} bestBet={p.bestBet} />
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl bg-card border border-yellow-400/15 p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold flex items-center gap-1.5 mb-0.5">
                <Lock className="w-3 h-3 text-yellow-400" />
                <span className="text-yellow-400">VIP Дохио</span>
              </p>
              <p className="text-[11px] text-muted-foreground">Газрын таамаглал · Вето симуляц · O/U · EV% · Best Bet</p>
            </div>
            <Button size="sm" variant="outline" className="shrink-0 text-xs border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10" render={<Link href="/pricing" />}>
              VIP нээх
            </Button>
          </div>
        )}

        {/* Player lineups */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {[teamA, teamB].map((t, si) => (
            <div key={t.name} className="space-y-1.5">
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{t.name}</p>
              <div className="flex flex-wrap gap-1">
                {t.players.slice(0, 5).map(pl => (
                  <span key={pl} className={cn(
                    "text-[11px] px-1.5 py-0.5 rounded font-medium",
                    si === 0 ? "bg-primary/[0.08] text-primary/70" : "bg-cyan-500/[0.08] text-cyan-400/70"
                  )}>
                    {pl}
                  </span>
                ))}
                {t.players.length === 0 && (
                  <span className="text-xs text-muted-foreground/40">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Match Card ───────────────────────────────────────────────

function MatchCard({ match, userPlan, isSelected, onToggle }: {
  match: MatchData; userPlan: string; isSelected: boolean; onToggle: () => void;
}) {
  const canAccess = hasAccess(userPlan, match.planReq);
  const { teamA, teamB, prediction: p } = match;

  return (
    <div className={cn(
      "rounded-xl border bg-card overflow-hidden transition-all duration-200",
      isSelected
        ? "border-primary/40 shadow-[0_0_20px_rgba(0,255,136,0.08)]"
        : "border-border/60 hover:border-border",
      !canAccess && "opacity-70",
    )}>
      {/* Header row */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50 bg-background/30">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {match.isLive && (
            <span className="flex items-center gap-1 text-[11px] text-red-400 font-black shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
              </span>
              LIVE
            </span>
          )}
          <span className="text-xs text-muted-foreground font-medium truncate">
            {match.league}{match.serie ? ` · ${match.serie}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {relativeTime(match.startTime)}
          </span>
          <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-border/60">{match.format}</Badge>
          {match.planReq !== "free" && (
            <Badge variant="outline" className={cn(
              "text-[10px] h-5 px-1.5 font-black uppercase",
              match.planReq === "vip"
                ? "border-yellow-400/50 text-yellow-400"
                : "border-primary/50 text-primary"
            )}>
              {match.planReq}
            </Badge>
          )}
        </div>
      </div>

      {/* Main body */}
      <div className="px-4 py-4">
        {/* Teams row */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-4">
          {/* Team A */}
          <div className="flex items-center gap-2.5 min-w-0">
            <TeamLogo logoUrl={teamA.imageUrl} name={teamA.name} acronym={teamA.acronym} size="sm" />
            <div className="min-w-0">
              <p className="font-black text-sm truncate">{teamA.name}</p>
              <p className="text-[11px] text-muted-foreground/60 font-mono">{teamA.region} · {teamA.winRate}%</p>
              <div className="flex items-center gap-0.5 mt-1">
                {teamA.recentForm.slice(0, 5).map((r, i) => <FormBadge key={i} result={r} />)}
              </div>
            </div>
          </div>

          {/* Center VS */}
          <div className="text-center px-1">
            <p className="text-[10px] font-black text-muted-foreground/30 tracking-[0.3em] uppercase">VS</p>
          </div>

          {/* Team B */}
          <div className="flex items-center gap-2.5 justify-end min-w-0">
            <div className="min-w-0 text-right">
              <p className="font-black text-sm truncate">{teamB.name}</p>
              <p className="text-[11px] text-muted-foreground/60 font-mono">{teamB.region} · {teamB.winRate}%</p>
              <div className="flex items-center gap-0.5 mt-1 justify-end">
                {teamB.recentForm.slice(0, 5).map((r, i) => <FormBadge key={i} result={r} />)}
              </div>
            </div>
            <TeamLogo logoUrl={teamB.imageUrl} name={teamB.name} acronym={teamB.acronym} size="sm" />
          </div>
        </div>

        {/* Win probability preview bar */}
        {canAccess && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className={cn("text-sm font-black tabular-nums", p.teamAWinPct >= p.teamBWinPct ? "text-primary" : "text-muted-foreground/50")}>
                {p.teamAWinPct}%
              </span>
              <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">Ялах магадлал</span>
              <span className={cn("text-sm font-black tabular-nums", p.teamBWinPct > p.teamAWinPct ? "text-cyan-400" : "text-muted-foreground/50")}>
                {p.teamBWinPct}%
              </span>
            </div>
            <div className="relative h-1.5 rounded-full bg-border/40 overflow-hidden">
              <div className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${p.teamAWinPct}%`,
                  background: p.teamAWinPct >= p.teamBWinPct
                    ? "linear-gradient(90deg, #00ff88, #00cc66)"
                    : "rgba(0,255,136,0.25)",
                }} />
              <div className="absolute inset-y-0 right-0 rounded-full"
                style={{
                  width: `${p.teamBWinPct}%`,
                  background: p.teamBWinPct > p.teamAWinPct
                    ? "linear-gradient(270deg, #00ccff, #0088cc)"
                    : "rgba(0,204,255,0.25)",
                }} />
            </div>
          </div>
        )}

        {/* CTA */}
        {canAccess ? (
          <button
            onClick={onToggle}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-lg h-9 text-xs font-bold tracking-wide transition-all border",
              isSelected
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-background/30 border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5"
            )}
          >
            {isSelected ? (
              <><ChevronUp className="w-3.5 h-3.5" /> Prediction нуух</>
            ) : (
              <><Zap className="w-3.5 h-3.5" /> AI Prediction харах <ChevronDown className="w-3.5 h-3.5" /></>
            )}
          </button>
        ) : (
          <Link
            href="/pricing"
            className="w-full flex items-center justify-center gap-2 rounded-lg h-9 text-xs font-bold border border-border/50 bg-background/30 text-muted-foreground hover:border-primary/30 hover:text-primary transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            {match.planReq === "vip" ? "VIP" : "Pro"} эрх нээх
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}

        {/* Expanded prediction */}
        <AnimatePresence>
          {isSelected && canAccess && (
            <PredictionPanel match={match} userPlan={userPlan} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────

export function PredictionsList({ matches, userPlan, usingMock, mockReason }: {
  matches: MatchData[]; userPlan: string; usingMock: boolean; mockReason?: string;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const toggle = (id: number) => setSelectedId(prev => prev === id ? null : id);

  const liveMatches = matches.filter(m => m.isLive);
  const todayMatches = matches.filter(m => {
    const diff = new Date(m.startTime).getTime() - Date.now();
    return !m.isLive && diff >= -3_600_000 && diff < 86_400_000;
  });
  const laterMatches = matches.filter(m => {
    const diff = new Date(m.startTime).getTime() - Date.now();
    return !m.isLive && diff >= 86_400_000;
  });
  const accessCount = matches.filter(m => PLAN_RANK[userPlan] >= PLAN_RANK[m.planReq]).length;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Нийт тоглоом", value: matches.length, icon: BarChart2, color: "text-primary" },
          { label: "Өнөөдрийн тоглоом", value: todayMatches.length + liveMatches.length, icon: Clock, color: "text-cyan-400" },
          { label: "Харах боломжтой", value: accessCount, icon: Target, color: "text-primary" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl bg-card border border-border/60 px-4 py-3.5 flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", s.color === "text-primary" ? "bg-primary/10" : "bg-cyan-400/10")}>
                <Icon className={cn("w-4 h-4", s.color)} />
              </div>
              <div>
                <p className={cn("text-2xl font-black tabular-nums leading-none", s.color)}>{s.value}</p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mock warning */}
      {usingMock && (
        <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-4 py-3 text-xs text-yellow-400 space-y-1">
          <p className="font-bold flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5" /> Demo горим</p>
          {mockReason && <p className="text-yellow-400/60 font-mono">{mockReason}</p>}
        </div>
      )}

      {/* Live section */}
      {liveMatches.length > 0 && (
        <section>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-400" />
            </span>
            <h2 className="text-[11px] font-black text-red-400 uppercase tracking-[0.2em]">Одоо явагдаж байгаа</h2>
          </div>
          <div className="space-y-3">
            {liveMatches.map(m => (
              <MatchCard key={m.id} match={m} userPlan={userPlan} isSelected={selectedId === m.id} onToggle={() => toggle(m.id)} />
            ))}
          </div>
        </section>
      )}

      {/* Today section */}
      {todayMatches.length > 0 && (
        <section>
          <div className="flex items-center gap-2.5 mb-3">
            <Clock className="w-3.5 h-3.5 text-muted-foreground/50" />
            <h2 className="text-[11px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">Өнөөдрийн тоглоомууд</h2>
          </div>
          <div className="space-y-3">
            {todayMatches.map(m => (
              <MatchCard key={m.id} match={m} userPlan={userPlan} isSelected={selectedId === m.id} onToggle={() => toggle(m.id)} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming section */}
      {laterMatches.length > 0 && (
        <section>
          <div className="flex items-center gap-2.5 mb-3">
            <TrendingDown className="w-3.5 h-3.5 text-muted-foreground/40" />
            <h2 className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Удахгүй болох тоглоомууд</h2>
          </div>
          <div className="space-y-3">
            {laterMatches.map(m => (
              <MatchCard key={m.id} match={m} userPlan={userPlan} isSelected={selectedId === m.id} onToggle={() => toggle(m.id)} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {matches.length === 0 && (
        <div className="rounded-xl bg-card border border-border/60 p-14 text-center">
          <p className="text-muted-foreground/50 text-sm">Одоогоор хуваарьт тоглоом байхгүй байна</p>
        </div>
      )}
    </div>
  );
}
