"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lock, TrendingUp, Clock, ChevronRight, Radio,
  ChevronDown, ChevronUp, Zap, Target, BarChart2,
  Map, Shield, User, TrendingDown, Award,
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
    name: string;
    acronym: string;
    imageUrl: string | null;
    region: string;
    winRate: number;
    recentForm: ("W" | "L")[];
    players: string[];
  };
  teamB: {
    name: string;
    acronym: string;
    imageUrl: string | null;
    region: string;
    winRate: number;
    recentForm: ("W" | "L")[];
    players: string[];
  };
  league: string;
  serie: string;
  startTime: string;
  format: string;
  isLive: boolean;
  planReq: "free" | "pro" | "vip";
  prediction: {
    teamAWinPct: number;
    teamBWinPct: number;
    confidence: number;
    winner: string;
    keyFactors: string[];
    oddsA: number;
    oddsB: number;
    // PRO fields
    modelBreakdown?: ModelBreakdown;
    starPlayerA?: StarPlayer;
    starPlayerB?: StarPlayer;
    // VIP fields
    mapPredictions?: MapPrediction[];
    vetoSimulation?: VetoSimulation;
    roundsOverUnder?: { line: number; rec: "over" | "under"; conf: number };
    ev?: number;
    riskLevel?: "LOW" | "MEDIUM" | "HIGH";
    bestBet?: string;
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

// ─── Sub-components ───────────────────────────────────────────

function FormBadge({ result }: { result: "W" | "L" }) {
  return (
    <span className={cn(
      "inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold",
      result === "W" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
    )}>
      {result}
    </span>
  );
}

function WinBar({ labelA, labelB, pctA, pctB, thin }: {
  labelA: string; labelB: string; pctA: number; pctB: number; thin?: boolean;
}) {
  const h = thin ? "h-1.5" : "h-2";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-xs">
        <span className="w-24 font-medium truncate">{labelA}</span>
        <div className={cn("flex-1 bg-border rounded-full overflow-hidden", h)}>
          <div className={cn("rounded-full transition-all", h, pctA >= pctB ? "bg-primary" : "bg-muted-foreground/40")}
            style={{ width: `${pctA}%` }} />
        </div>
        <span className={cn("w-8 text-right font-bold tabular-nums", pctA >= pctB ? "text-primary" : "text-muted-foreground")}>
          {pctA}%
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="w-24 font-medium truncate">{labelB}</span>
        <div className={cn("flex-1 bg-border rounded-full overflow-hidden", h)}>
          <div className={cn("rounded-full transition-all", h, pctB > pctA ? "bg-primary" : "bg-muted-foreground/40")}
            style={{ width: `${pctB}%` }} />
        </div>
        <span className={cn("w-8 text-right font-bold tabular-nums", pctB > pctA ? "text-primary" : "text-muted-foreground")}>
          {pctB}%
        </span>
      </div>
    </div>
  );
}

// ─── PRO: Model Breakdown ──────────────────────────────────────

const BREAKDOWN_LABELS = [
  { key: "teamStrength", label: "Багийн хүч",     icon: Shield,     weight: "30%" },
  { key: "mapAdvantage", label: "Газрын давуу",   icon: Map,        weight: "30%" },
  { key: "playerImpact", label: "Тоглогчийн нөлөө", icon: User,    weight: "20%" },
  { key: "recentForm",   label: "Сүүлийн хэлбэр", icon: TrendingUp, weight: "10%" },
  { key: "h2h",          label: "H2H · Контекст", icon: BarChart2,  weight: "10%" },
] as const;

function ModelBreakdownPanel({
  breakdown, nameA, nameB,
}: {
  breakdown: ModelBreakdown;
  nameA: string;
  nameB: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <BarChart2 className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-primary uppercase tracking-wide">
          AI Загварын задаргаа
        </span>
      </div>
      <div className="space-y-2.5">
        {BREAKDOWN_LABELS.map(({ key, label, icon: Icon, weight }) => {
          const pctA = breakdown[`${key}A` as keyof ModelBreakdown] as number;
          const pctB = breakdown[`${key}B` as keyof ModelBreakdown] as number;
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Icon className="w-3 h-3" />
                  {label}
                </span>
                <span className="text-muted-foreground/60">{weight}</span>
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

const ROLE_LABELS: Record<string, string> = {
  awp: "AWP", entry: "Entry", support: "Support", igl: "IGL", lurk: "Lurk",
};
const ROLE_COLORS: Record<string, string> = {
  awp: "text-yellow-400 bg-yellow-400/10",
  entry: "text-red-400 bg-red-400/10",
  support: "text-blue-400 bg-blue-400/10",
  igl: "text-purple-400 bg-purple-400/10",
  lurk: "text-green-400 bg-green-400/10",
};

function StarPlayerPanel({
  starA, starB, nameA, nameB,
}: {
  starA: StarPlayer; starB: StarPlayer; nameA: string; nameB: string;
}) {
  const ratingWinnerA = starA.rating >= starB.rating;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Award className="w-3.5 h-3.5 text-yellow-400" />
        <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wide">
          Гол тоглогчид
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { star: starA, team: nameA, isWinner: ratingWinnerA },
          { star: starB, team: nameB, isWinner: !ratingWinnerA },
        ].map(({ star, team, isWinner }) => (
          <div
            key={team}
            className={cn(
              "rounded-lg p-2.5 space-y-1.5 border",
              isWinner
                ? "bg-primary/8 border-primary/25"
                : "bg-background/40 border-border",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold truncate">{star.name}</span>
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded font-medium",
                ROLE_COLORS[star.role] ?? "text-muted-foreground bg-muted/20",
              )}>
                {ROLE_LABELS[star.role] ?? star.role}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{team}</p>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "text-lg font-black tabular-nums leading-none",
                isWinner ? "text-primary" : "text-foreground",
              )}>
                {star.rating.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">rating</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VIP: Map Predictions ──────────────────────────────────────

const PICK_LABELS: Record<string, string> = {
  teamA: "A Pick", teamB: "B Pick", decider: "Decider",
};
const PICK_COLORS: Record<string, string> = {
  teamA: "text-primary border-primary/30",
  teamB: "text-blue-400 border-blue-400/30",
  decider: "text-orange-400 border-orange-400/30",
};

function MapPredictionsPanel({
  maps, nameA, nameB,
}: {
  maps: MapPrediction[]; nameA: string; nameB: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Map className="w-3.5 h-3.5 text-orange-400" />
        <span className="text-xs font-semibold text-orange-400 uppercase tracking-wide">
          Газрын таамаглал
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {maps.map((m, i) => (
          <div key={i} className="bg-background/60 rounded-lg p-2.5 border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">{m.mapName}</span>
              <Badge
                variant="outline"
                className={cn("text-xs px-1.5 py-0 h-5", PICK_COLORS[m.likelyPick])}
              >
                {PICK_LABELS[m.likelyPick]}
              </Badge>
            </div>
            <WinBar
              labelA={nameA} labelB={nameB}
              pctA={m.teamAWinPct} pctB={m.teamBWinPct}
              thin
            />
            <p className="text-xs text-muted-foreground text-center">
              ~{m.predictedRounds} раунд
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VIP: Veto Simulation ──────────────────────────────────────

function VetoSimulationPanel({ veto }: { veto: VetoSimulation }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
            Вето симуляц
          </span>
        </div>
        <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/30">
          {veto.confidence}% итгэл
        </Badge>
      </div>
      <div className="bg-background/60 rounded-lg border border-border overflow-hidden">
        {veto.sequence.map((step, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-xs",
              i < veto.sequence.length - 1 && "border-b border-border/50",
            )}
          >
            <span className="w-4 h-4 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground font-bold shrink-0">
              {i + 1}
            </span>
            <span className={cn(
              "flex-1",
              step.startsWith("Decider") ? "text-orange-400 font-semibold" : "text-foreground",
            )}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VIP: Stats Row (O/U, EV, Risk) ───────────────────────────

function RiskBadge({ level }: { level: "LOW" | "MEDIUM" | "HIGH" }) {
  const styles = {
    LOW:    "bg-green-500/10 text-green-400 border-green-500/20",
    MEDIUM: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    HIGH:   "bg-red-500/10 text-red-400 border-red-500/20",
  };
  const labels = { LOW: "Бага эрсдэл", MEDIUM: "Дунд эрсдэл", HIGH: "Өндөр эрсдэл" };
  return (
    <Badge variant="outline" className={cn("text-xs font-semibold", styles[level])}>
      {labels[level]}
    </Badge>
  );
}

function VIPStatsPanel({
  ou, ev, riskLevel, bestBet,
}: {
  ou: { line: number; rec: "over" | "under"; conf: number };
  ev: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  bestBet: string;
}) {
  const evPositive = ev >= 0;
  return (
    <div className="space-y-3">
      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-background/60 rounded-lg p-2 border border-border text-center space-y-0.5">
          <p className="text-xs text-muted-foreground">Раунд O/U</p>
          <p className="text-sm font-bold">{ou.line}</p>
          <p className={cn("text-xs font-semibold", ou.rec === "over" ? "text-green-400" : "text-red-400")}>
            {ou.rec === "over" ? "▲ Дээш" : "▼ Доош"}
          </p>
          <p className="text-xs text-muted-foreground">{ou.conf}%</p>
        </div>

        <div className="bg-background/60 rounded-lg p-2 border border-border text-center space-y-0.5">
          <p className="text-xs text-muted-foreground">EV</p>
          <p className={cn("text-sm font-bold tabular-nums", evPositive ? "text-green-400" : "text-red-400")}>
            {evPositive ? "+" : ""}{ev.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground">Хүлээгдэх өгөөж</p>
        </div>

        <div className="bg-background/60 rounded-lg p-2 border border-border text-center space-y-1 flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground">Эрсдэл</p>
          <RiskBadge level={riskLevel} />
        </div>
      </div>

      {/* Best bet */}
      <div className="bg-primary/8 border border-primary/25 rounded-lg p-3 flex items-start gap-2">
        <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-0.5">
            Хамгийн сайн бет
          </p>
          <p className="text-xs text-foreground">{bestBet}</p>
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
    <div className="border-t border-border mt-4 pt-4 space-y-5">

      {/* ── Win probability (FREE) ────────────────────────────── */}
      <div>
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
          Ялах магадлал
        </p>
        <WinBar
          labelA={teamA.name}
          labelB={teamB.name}
          pctA={p.teamAWinPct}
          pctB={p.teamBWinPct}
        />
      </div>

      {/* ── AI summary box (FREE) ─────────────────────────────── */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              AI Таамаглал
            </span>
          </div>
          <Badge className="text-xs bg-primary/20 text-primary border-0">
            {p.confidence}% итгэл
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-background/60 rounded p-2 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Ялагч</p>
            <p className="text-xs font-bold text-primary truncate">{winnerName}</p>
          </div>
          <div className="bg-background/60 rounded p-2 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">{teamA.acronym} odds</p>
            <p className="text-sm font-bold tabular-nums">{p.oddsA}</p>
          </div>
          <div className="bg-background/60 rounded p-2 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">{teamB.acronym} odds</p>
            <p className="text-sm font-bold tabular-nums">{p.oddsB}</p>
          </div>
        </div>

        {canPro ? (
          <ul className="space-y-1">
            {p.keyFactors.map((f, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-primary mt-0.5 shrink-0">•</span>
                {f}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/60 rounded p-2">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            Key factors харахын тулд Pro эрх шаардлагатай
          </div>
        )}
      </div>

      {/* ── PRO: Model Breakdown ──────────────────────────────── */}
      {canPro ? (
        <>
          {p.modelBreakdown && (
            <div className="bg-card border border-border rounded-lg p-3">
              <ModelBreakdownPanel
                breakdown={p.modelBreakdown}
                nameA={teamA.name}
                nameB={teamB.name}
              />
            </div>
          )}

          {p.starPlayerA && p.starPlayerB && (
            <div className="bg-card border border-border rounded-lg p-3">
              <StarPlayerPanel
                starA={p.starPlayerA}
                starB={p.starPlayerB}
                nameA={teamA.name}
                nameB={teamB.name}
              />
            </div>
          )}
        </>
      ) : (
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" />
                AI Загварын задаргаа
              </p>
              <p className="text-xs text-muted-foreground">
                5 хүчин зүйлийн задаргаа · Гол тоглогчийн харьцуулалт
              </p>
            </div>
            <Button size="sm" variant="outline" className="text-xs border-primary/40 text-primary hover:bg-primary/10 shrink-0" render={<Link href="/pricing" />}>
              Pro нээх
            </Button>
          </div>
        </div>
      )}

      {/* ── VIP: Deep Insights ────────────────────────────────── */}
      {canVip ? (
        <>
          {p.mapPredictions && p.mapPredictions.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-3">
              <MapPredictionsPanel
                maps={p.mapPredictions}
                nameA={teamA.name}
                nameB={teamB.name}
              />
            </div>
          )}

          {p.vetoSimulation && (
            <div className="bg-card border border-border rounded-lg p-3">
              <VetoSimulationPanel veto={p.vetoSimulation} />
            </div>
          )}

          {p.roundsOverUnder && p.ev !== undefined && p.riskLevel && p.bestBet && (
            <div className="bg-card border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wide">
                  VIP Дохио
                </span>
              </div>
              <VIPStatsPanel
                ou={p.roundsOverUnder}
                ev={p.ev}
                riskLevel={p.riskLevel}
                bestBet={p.bestBet}
              />
            </div>
          )}
        </>
      ) : (
        <div className="bg-card border border-yellow-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-yellow-400">VIP Дохио</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Газрын таамаглал · Вето симуляц · O/U · EV% · Хамгийн сайн бет
              </p>
            </div>
            <Button size="sm" variant="outline" className="text-xs border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 shrink-0" render={<Link href="/pricing" />}>
              VIP нээх
            </Button>
          </div>
        </div>
      )}

      {/* ── Players lineup ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {[teamA, teamB].map(t => (
          <div key={t.name} className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{t.name} lineup</p>
            <div className="flex flex-wrap gap-1">
              {t.players.slice(0, 5).map(pl => (
                <span key={pl} className="text-xs bg-accent px-1.5 py-0.5 rounded text-muted-foreground">
                  {pl}
                </span>
              ))}
              {t.players.length === 0 && (
                <span className="text-xs text-muted-foreground">Мэдээлэл алга</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Match Card ───────────────────────────────────────────────

function MatchCard({
  match, userPlan, isSelected, onToggle,
}: {
  match: MatchData; userPlan: string; isSelected: boolean; onToggle: () => void;
}) {
  const canAccess = hasAccess(userPlan, match.planReq);
  const { teamA, teamB } = match;

  return (
    <Card className={cn(
      "bg-card border-border overflow-hidden transition-all",
      isSelected && "border-primary/50 shadow-[0_0_15px_rgba(0,255,136,0.08)]",
      !canAccess && "opacity-75",
    )}>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-background/40 flex-wrap">
        {match.isLive && (
          <span className="flex items-center gap-1 text-xs text-red-400 font-semibold">
            <Radio className="w-3 h-3 animate-pulse" /> LIVE
          </span>
        )}
        <span className="text-xs text-muted-foreground font-medium truncate flex-1">
          {match.league}{match.serie ? ` · ${match.serie}` : ""}
        </span>
        <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
          <Clock className="w-3 h-3" />
          {relativeTime(match.startTime)}
        </span>
        <Badge variant="outline" className="text-xs shrink-0">{match.format}</Badge>
        {match.planReq !== "free" && (
          <Badge variant="outline" className={cn(
            "text-xs capitalize shrink-0",
            match.planReq === "vip" ? "border-yellow-500 text-yellow-500" : "border-primary text-primary",
          )}>
            {match.planReq}
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
          <div className="flex items-center gap-2">
            <TeamLogo logoUrl={teamA.imageUrl} name={teamA.name} acronym={teamA.acronym} size="sm" />
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{teamA.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {teamA.recentForm.slice(0, 5).map((r, i) => <FormBadge key={i} result={r} />)}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">WR {teamA.winRate}%</p>
            </div>
          </div>

          <div className="text-center px-2">
            <p className="text-xs text-muted-foreground font-bold">VS</p>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <div className="min-w-0 text-right">
              <p className="font-bold text-sm truncate">{teamB.name}</p>
              <div className="flex items-center gap-1 mt-0.5 justify-end">
                {teamB.recentForm.slice(0, 5).map((r, i) => <FormBadge key={i} result={r} />)}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">WR {teamB.winRate}%</p>
            </div>
            <TeamLogo logoUrl={teamB.imageUrl} name={teamB.name} acronym={teamB.acronym} size="sm" />
          </div>
        </div>

        <div className="mt-4">
          {canAccess ? (
            <Button
              variant={isSelected ? "default" : "outline"}
              className="w-full gap-2"
              onClick={onToggle}
            >
              {isSelected ? (
                <><ChevronUp className="w-4 h-4" />Prediction нуух</>
              ) : (
                <><Zap className="w-4 h-4" />AI Prediction харах<ChevronDown className="w-4 h-4" /></>
              )}
            </Button>
          ) : (
            <Button variant="outline" className="w-full gap-2 border-primary/30 text-muted-foreground" render={<Link href="/pricing" />}>
              <Lock className="w-4 h-4" />
              {match.planReq === "vip" ? "VIP" : "Pro"} эрх нээх
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {isSelected && canAccess && (
          <PredictionPanel match={match} userPlan={userPlan} />
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Client Component ────────────────────────────────────

export function PredictionsList({
  matches, userPlan, usingMock, mockReason,
}: {
  matches: MatchData[];
  userPlan: string;
  usingMock: boolean;
  mockReason?: string;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const toggle = (id: number) => setSelectedId(prev => prev === id ? null : id);

  const liveMatches   = matches.filter(m => m.isLive);
  const todayMatches  = matches.filter(m => {
    const diff = new Date(m.startTime).getTime() - Date.now();
    return !m.isLive && diff >= -3_600_000 && diff < 86_400_000;
  });
  const laterMatches  = matches.filter(m => {
    const diff = new Date(m.startTime).getTime() - Date.now();
    return !m.isLive && diff >= 86_400_000;
  });
  const accessCount = matches.filter(m => PLAN_RANK[userPlan] >= PLAN_RANK[m.planReq]).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Нийт тоглоом",      value: matches.length,                          icon: BarChart2 },
          { label: "Өнөөдрийн тоглоом", value: todayMatches.length + liveMatches.length, icon: Clock },
          { label: "Харах боломжтой",   value: accessCount,                              icon: Target },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="text-2xl font-bold text-primary leading-none">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {usingMock && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="p-3 text-xs text-yellow-400 space-y-1">
            <p>⚠️ Demo горим — demo өгөгдөл харагдаж байна.</p>
            {mockReason && <p className="text-yellow-400/70 font-mono">Шалтгаан: {mockReason}</p>}
          </CardContent>
        </Card>
      )}

      {liveMatches.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wide flex items-center gap-2 mb-3">
            <Radio className="w-4 h-4 animate-pulse" /> Одоо явагдаж байгаа
          </h2>
          <div className="space-y-3">
            {liveMatches.map(m => (
              <MatchCard key={m.id} match={m} userPlan={userPlan}
                isSelected={selectedId === m.id} onToggle={() => toggle(m.id)} />
            ))}
          </div>
        </section>
      )}

      {todayMatches.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4" /> Өнөөдрийн тоглоомууд
          </h2>
          <div className="space-y-3">
            {todayMatches.map(m => (
              <MatchCard key={m.id} match={m} userPlan={userPlan}
                isSelected={selectedId === m.id} onToggle={() => toggle(m.id)} />
            ))}
          </div>
        </section>
      )}

      {laterMatches.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4" /> Удахгүй болох тоглоомууд
          </h2>
          <div className="space-y-3">
            {laterMatches.map(m => (
              <MatchCard key={m.id} match={m} userPlan={userPlan}
                isSelected={selectedId === m.id} onToggle={() => toggle(m.id)} />
            ))}
          </div>
        </section>
      )}

      {matches.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-10 text-center text-muted-foreground">
            Одоогоор хуваарьт тоглоом байхгүй байна
          </CardContent>
        </Card>
      )}
    </div>
  );
}
