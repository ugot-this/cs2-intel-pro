import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth-helpers";
import {
  getUpcomingMatches,
  getRunningMatches,
  getTeamRecentMatches,
  formatBO,
  matchStartTime,
  relativeTime,
  computeWinRate,
  computeRecentForm,
  predictWinProbability,
  oddsFromProbability,
  regionFromLocation,
  type PSMatch,
  type PSTeam,
} from "@/lib/pandascore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, TrendingUp, Clock, ChevronRight, Radio } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Predictions – CS2 Intel Pro" };

const PLAN_RANK: Record<string, number> = { free: 0, pro: 1, vip: 2 };

function hasAccess(userPlan: string, required: string) {
  return PLAN_RANK[userPlan] >= PLAN_RANK[required];
}

function planRequired(index: number): "free" | "pro" | "vip" {
  if (index < 3) return "free";
  if (index < 6) return "pro";
  return "vip";
}

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

function ConfidenceBar({ value, winner }: { value: number; winner: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-border rounded-full h-1.5">
        <div
          className={cn("h-1.5 rounded-full transition-all", winner ? "bg-primary" : "bg-muted-foreground")}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={cn("text-xs font-medium w-8 text-right", winner ? "text-primary" : "text-muted-foreground")}>
        {value}%
      </span>
    </div>
  );
}

interface EnrichedMatch {
  match: PSMatch;
  teamA: PSTeam;
  teamB: PSTeam;
  teamAWinPct: number;
  teamBWinPct: number;
  confidence: number;
  recentFormA: ("W" | "L")[];
  recentFormB: ("W" | "L")[];
  winRateA: number;
  winRateB: number;
  planReq: "free" | "pro" | "vip";
  isLive: boolean;
}

async function enrichMatch(
  match: PSMatch,
  index: number,
  isLive = false
): Promise<EnrichedMatch | null> {
  if (match.opponents.length < 2) return null;
  const teamA = match.opponents[0].opponent;
  const teamB = match.opponents[1].opponent;

  const [recentA, recentB] = await Promise.allSettled([
    getTeamRecentMatches(teamA.id, 10),
    getTeamRecentMatches(teamB.id, 10),
  ]);

  const matchesA = recentA.status === "fulfilled" ? recentA.value : [];
  const matchesB = recentB.status === "fulfilled" ? recentB.value : [];

  const winRateA = computeWinRate(matchesA, teamA.id);
  const winRateB = computeWinRate(matchesB, teamB.id);
  const recentFormA = computeRecentForm(matchesA, teamA.id);
  const recentFormB = computeRecentForm(matchesB, teamB.id);

  const { teamAWinPct, confidence } = predictWinProbability(winRateA, winRateB);

  return {
    match,
    teamA,
    teamB,
    teamAWinPct,
    teamBWinPct: 100 - teamAWinPct,
    confidence,
    recentFormA,
    recentFormB,
    winRateA,
    winRateB,
    planReq: planRequired(index),
    isLive,
  };
}

export default async function PredictionsPage() {
  const user = await requireAuth();
  const userPlan = user.planSlug;

  let enriched: EnrichedMatch[] = [];
  let apiError: string | null = null;

  try {
    const [upcoming, running] = await Promise.allSettled([
      getUpcomingMatches(15),
      getRunningMatches(),
    ]);

    const upcomingMatches = upcoming.status === "fulfilled" ? upcoming.value : [];
    const runningMatches = running.status === "fulfilled" ? running.value : [];
    const liveIds = new Set(runningMatches.map(m => m.id));

    const allMatches = [
      ...runningMatches.slice(0, 2),
      ...upcomingMatches.slice(0, 13),
    ];

    if (allMatches.length === 0) {
      apiError = "Одоогоор хуваарьт тоглоом байхгүй байна.";
    } else {
      const results = await Promise.allSettled(
        allMatches.map((m, i) => enrichMatch(m, i, liveIds.has(m.id)))
      );
      enriched = results
        .filter((r): r is PromiseFulfilledResult<EnrichedMatch> =>
          r.status === "fulfilled" && r.value !== null
        )
        .map(r => r.value);
    }
  } catch (err) {
    apiError = err instanceof Error ? err.message : "API алдаа гарлаа";
  }

  const accessibleCount = enriched.filter(e => hasAccess(userPlan, e.planReq)).length;
  const todayCount = enriched.filter(e => {
    const diff = new Date(matchStartTime(e.match)).getTime() - Date.now();
    return diff >= 0 && diff < 86_400_000;
  }).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Таамаглалууд</h1>
          <p className="text-muted-foreground mt-1">
            HLTV дээрх бодит CS2 тоглоомуудын AI таамаглал
          </p>
        </div>
        <Badge variant="outline" className="border-primary text-primary capitalize">
          {userPlan} план
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Нийт тоглоом", value: enriched.length },
          { label: "Харах боломжтой", value: accessibleCount },
          { label: "Өнөөдрийн тоглоом", value: todayCount },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {apiError && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-4 text-sm text-red-400">{apiError}</CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {enriched.map((e) => {
          const canAccess = hasAccess(userPlan, e.planReq);
          const { match, teamA, teamB } = e;
          const winner = e.teamAWinPct >= 50 ? teamA : teamB;
          const startTime = matchStartTime(match);

          return (
            <Card
              key={match.id}
              className={cn("bg-card border-border overflow-hidden", !canAccess && "opacity-75")}
            >
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-background/40 flex-wrap">
                {e.isLive && (
                  <span className="flex items-center gap-1 text-xs text-red-400 font-semibold">
                    <Radio className="w-3 h-3 animate-pulse" /> LIVE
                  </span>
                )}
                <span className="text-xs text-muted-foreground font-medium">
                  {match.league.name}
                  {match.serie.full_name ? ` · ${match.serie.full_name}` : ""}
                </span>
                <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {relativeTime(startTime)}
                </span>
                <Badge variant="outline" className="text-xs">{formatBO(match.number_of_games)}</Badge>
                {e.planReq !== "free" && (
                  <Badge
                    variant="outline"
                    className={cn("text-xs capitalize",
                      e.planReq === "vip"
                        ? "border-yellow-500 text-yellow-500"
                        : "border-primary text-primary"
                    )}
                  >
                    {e.planReq}
                  </Badge>
                )}
              </div>

              <CardContent className="p-4">
                {canAccess ? (
                  <div className="space-y-4">
                    {/* Teams */}
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {teamA.image_url ? (
                            <img
                              src={teamA.image_url}
                              alt={teamA.name}
                              className="w-8 h-8 rounded object-contain bg-background"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {(teamA.acronym ?? teamA.name).slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-sm">{teamA.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {teamA.acronym} · {regionFromLocation(teamA.location)}
                            </p>
                          </div>
                        </div>
                        {e.recentFormA.length > 0 && (
                          <div className="flex gap-1">
                            {e.recentFormA.map((r, i) => <FormBadge key={i} result={r} />)}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">WR {e.winRateA}%</p>
                      </div>

                      <div className="text-center space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">VS</p>
                        <p className="text-xs text-muted-foreground">
                          {oddsFromProbability(e.teamAWinPct)} : {oddsFromProbability(e.teamBWinPct)}
                        </p>
                      </div>

                      <div className="space-y-1 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <div>
                            <p className="font-bold text-sm">{teamB.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {teamB.acronym} · {regionFromLocation(teamB.location)}
                            </p>
                          </div>
                          {teamB.image_url ? (
                            <img
                              src={teamB.image_url}
                              alt={teamB.name}
                              className="w-8 h-8 rounded object-contain bg-background"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {(teamB.acronym ?? teamB.name).slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        {e.recentFormB.length > 0 && (
                          <div className="flex gap-1 justify-end">
                            {e.recentFormB.map((r, i) => <FormBadge key={i} result={r} />)}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">WR {e.winRateB}%</p>
                      </div>
                    </div>

                    {/* Win probability */}
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        Ялах магадлал
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium w-12 truncate">
                            {teamA.acronym ?? teamA.name.slice(0, 4)}
                          </span>
                          <ConfidenceBar value={e.teamAWinPct} winner={e.teamAWinPct >= 50} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium w-12 truncate">
                            {teamB.acronym ?? teamB.name.slice(0, 4)}
                          </span>
                          <ConfidenceBar value={e.teamBWinPct} winner={e.teamBWinPct >= 50} />
                        </div>
                      </div>
                    </div>

                    {/* AI analysis */}
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                          AI Дүн шинжилгээ
                        </span>
                        <Badge className="ml-auto text-xs bg-primary/20 text-primary border-0">
                          {e.confidence}% итгэл
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {winner.name} нь сүүлийн үзүүлэлтэд үндэслэн{" "}
                        {Math.max(e.teamAWinPct, e.teamBWinPct)}% магадлалтай ялах хандлагатай байна.{" "}
                        {Math.abs(e.winRateA - e.winRateB) < 10
                          ? "Тэнцүү тэмцэл болох магадлалтай."
                          : Math.abs(e.winRateA - e.winRateB) < 20
                            ? "Бага зэрэг ялгаатай тэмцэл."
                            : "Нэг тал давуу байдалтай байна."}
                      </p>
                      {userPlan !== "free" && (
                        <ul className="space-y-1 mt-1">
                          <li className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-primary mt-0.5">•</span>
                            {teamA.name} сүүлийн тоглоомуудад {e.winRateA}% ялалтын хувьтай
                          </li>
                          <li className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-primary mt-0.5">•</span>
                            {teamB.name} сүүлийн тоглоомуудад {e.winRateB}% ялалтын хувьтай
                          </li>
                          {match.number_of_games >= 3 && (
                            <li className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-primary mt-0.5">•</span>
                              {formatBO(match.number_of_games)} формат — газрын давуу байдал чухал үүрэг гүйцэтгэнэ
                            </li>
                          )}
                        </ul>
                      )}
                    </div>

                    {/* Prediction badge */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Манай таамаглал:</span>
                      <Badge className="bg-primary/20 text-primary border-primary/30 font-bold">
                        {winner.name} ялна
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 gap-3">
                    <Lock className="w-8 h-8 text-muted-foreground" />
                    <div className="text-center">
                      <p className="font-medium">
                        {e.planReq === "vip" ? "VIP" : "Pro"} төлөвлөгөө шаардлагатай
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {teamA.name} vs {teamB.name} таамаглалыг харахын тулд эрх нээнэ үү
                      </p>
                    </div>
                    <Button size="sm" className="gap-1.5" render={<Link href="/pricing" />}>
                      Эрх нээх <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {enriched.length === 0 && !apiError && (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center text-muted-foreground">
              Одоогоор хуваарьт тоглоом байхгүй байна
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
