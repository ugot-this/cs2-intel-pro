"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lock, TrendingUp, Clock, ChevronRight, Radio,
  ChevronDown, ChevronUp, Zap, Target, BarChart2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TeamLogo } from "../teams/team-logo";

// ─── Types ────────────────────────────────────────────────────

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

function WinBar({ labelA, labelB, pctA, pctB }: {
  labelA: string; labelB: string; pctA: number; pctB: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs">
        <span className="w-12 font-medium truncate">{labelA}</span>
        <div className="flex-1 bg-border rounded-full h-2 overflow-hidden">
          <div
            className={cn("h-2 rounded-full transition-all", pctA >= pctB ? "bg-primary" : "bg-muted-foreground/50")}
            style={{ width: `${pctA}%` }}
          />
        </div>
        <span className={cn("w-8 text-right font-bold", pctA >= pctB ? "text-primary" : "text-muted-foreground")}>
          {pctA}%
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="w-12 font-medium truncate">{labelB}</span>
        <div className="flex-1 bg-border rounded-full h-2 overflow-hidden">
          <div
            className={cn("h-2 rounded-full transition-all", pctB > pctA ? "bg-primary" : "bg-muted-foreground/50")}
            style={{ width: `${pctB}%` }}
          />
        </div>
        <span className={cn("w-8 text-right font-bold", pctB > pctA ? "text-primary" : "text-muted-foreground")}>
          {pctB}%
        </span>
      </div>
    </div>
  );
}

// ─── Prediction Panel ─────────────────────────────────────────

function PredictionPanel({ match, userPlan }: { match: MatchData; userPlan: string }) {
  const { prediction: p, teamA, teamB } = match;
  const winnerName = p.winner === "teamA" ? teamA.name : teamB.name;
  const canSeeFactors = hasAccess(userPlan, "pro");

  return (
    <div className="border-t border-border mt-4 pt-4 space-y-4">
      {/* Win probability */}
      <div>
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
          Ялах магадлал
        </p>
        <WinBar
          labelA={teamA.acronym}
          labelB={teamB.acronym}
          pctA={p.teamAWinPct}
          pctB={p.teamBWinPct}
        />
      </div>

      {/* AI box */}
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

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-background/60 rounded p-2 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Ялагч</p>
            <p className="text-xs font-bold text-primary">{winnerName}</p>
          </div>
          <div className="bg-background/60 rounded p-2 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">{teamA.acronym} odds</p>
            <p className="text-sm font-bold">{p.oddsA}</p>
          </div>
          <div className="bg-background/60 rounded p-2 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">{teamB.acronym} odds</p>
            <p className="text-sm font-bold">{p.oddsB}</p>
          </div>
        </div>

        {/* Key factors */}
        {canSeeFactors ? (
          <ul className="space-y-1">
            {p.keyFactors.map((f, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-primary mt-0.5">•</span>
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

      {/* Players */}
      <div className="grid grid-cols-2 gap-3">
        {[teamA, teamB].map(t => (
          <div key={t.name} className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{t.name} lineup</p>
            <div className="flex flex-wrap gap-1">
              {t.players.slice(0, 5).map(p => (
                <span key={p} className="text-xs bg-accent px-1.5 py-0.5 rounded text-muted-foreground">
                  {p}
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
  match,
  userPlan,
  isSelected,
  onToggle,
}: {
  match: MatchData;
  userPlan: string;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const canAccess = hasAccess(userPlan, match.planReq);
  const { teamA, teamB } = match;

  return (
    <Card className={cn(
      "bg-card border-border overflow-hidden transition-all",
      isSelected && "border-primary/50 shadow-[0_0_15px_rgba(0,255,136,0.08)]",
      !canAccess && "opacity-75"
    )}>
      {/* Header bar */}
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
            match.planReq === "vip" ? "border-yellow-500 text-yellow-500" : "border-primary text-primary"
          )}>
            {match.planReq}
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        {/* Teams row */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
          {/* Team A */}
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

          {/* VS */}
          <div className="text-center px-2">
            <p className="text-xs text-muted-foreground font-bold">VS</p>
          </div>

          {/* Team B */}
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

        {/* Action button or locked */}
        <div className="mt-4">
          {canAccess ? (
            <Button
              variant={isSelected ? "default" : "outline"}
              className="w-full gap-2"
              onClick={onToggle}
            >
              {isSelected ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Prediction нуух
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Prediction харах
                  <ChevronDown className="w-4 h-4" />
                </>
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

        {/* Expanded prediction */}
        {isSelected && canAccess && (
          <PredictionPanel match={match} userPlan={userPlan} />
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Client Component ────────────────────────────────────

export function PredictionsList({
  matches,
  userPlan,
  usingMock,
  mockReason,
}: {
  matches: MatchData[];
  userPlan: string;
  usingMock: boolean;
  mockReason?: string;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const toggle = (id: number) => setSelectedId(prev => prev === id ? null : id);

  const todayMatches = matches.filter(m => {
    const diff = new Date(m.startTime).getTime() - Date.now();
    return diff >= -3_600_000 && diff < 86_400_000; // -1h to +24h
  });

  const laterMatches = matches.filter(m => {
    const diff = new Date(m.startTime).getTime() - Date.now();
    return diff >= 86_400_000;
  });

  const liveMatches = matches.filter(m => m.isLive);

  const accessCount = matches.filter(m =>
    PLAN_RANK[userPlan] >= PLAN_RANK[m.planReq]
  ).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Нийт тоглоом", value: matches.length, icon: BarChart2 },
          { label: "Өнөөдрийн тоглоом", value: todayMatches.length + liveMatches.length, icon: Clock },
          { label: "Харах боломжтой", value: accessCount, icon: Target },
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

      {/* Demo banner */}
      {usingMock && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="p-3 text-xs text-yellow-400 space-y-1">
            <p>⚠️ Demo горим — demo өгөгдөл харагдаж байна.</p>
            {mockReason && (
              <p className="text-yellow-400/70 font-mono">Шалтгаан: {mockReason}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Live matches */}
      {liveMatches.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wide flex items-center gap-2 mb-3">
            <Radio className="w-4 h-4 animate-pulse" /> Одоо явагдаж байгаа
          </h2>
          <div className="space-y-3">
            {liveMatches.map(m => (
              <MatchCard
                key={m.id}
                match={m}
                userPlan={userPlan}
                isSelected={selectedId === m.id}
                onToggle={() => toggle(m.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Today's matches */}
      {todayMatches.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4" /> Өнөөдрийн тоглоомууд
          </h2>
          <div className="space-y-3">
            {todayMatches.map(m => (
              <MatchCard
                key={m.id}
                match={m}
                userPlan={userPlan}
                isSelected={selectedId === m.id}
                onToggle={() => toggle(m.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming */}
      {laterMatches.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4" /> Удахгүй болох тоглоомууд
          </h2>
          <div className="space-y-3">
            {laterMatches.map(m => (
              <MatchCard
                key={m.id}
                match={m}
                userPlan={userPlan}
                isSelected={selectedId === m.id}
                onToggle={() => toggle(m.id)}
              />
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
