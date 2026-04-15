import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth-helpers";
import { UPCOMING_MATCHES, relativeTime } from "@/lib/cs2-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, TrendingUp, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Predictions" };

const PLAN_RANK: Record<string, number> = { free: 0, pro: 1, vip: 2 };

function hasAccess(userPlan: string, required: string) {
  return PLAN_RANK[userPlan] >= PLAN_RANK[required];
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

export default async function PredictionsPage() {
  const user = await requireAuth();
  const userPlan = user.planSlug;

  const accessibleCount = UPCOMING_MATCHES.filter(m => hasAccess(userPlan, m.planRequired)).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Таамаглалууд</h1>
          <p className="text-muted-foreground mt-1">Удахгүй болох CS2 тоглоомуудын AI таамаглал</p>
        </div>
        <Badge variant="outline" className="border-primary text-primary capitalize">
          {userPlan} plan
        </Badge>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Нийт тоглоом", value: UPCOMING_MATCHES.length },
          { label: "Хандах боломжтой", value: accessibleCount },
          { label: "Өнөөдрийн сигнал", value: UPCOMING_MATCHES.filter(m => {
            const diffH = (new Date(m.startTime).getTime() - Date.now()) / 3_600_000;
            return diffH >= 0 && diffH < 24;
          }).length },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Match list */}
      <div className="space-y-4">
        {UPCOMING_MATCHES.map((match) => {
          const canAccess = hasAccess(userPlan, match.planRequired);
          const { teamA, teamB, prediction } = match;

          return (
            <Card key={match.id} className={cn("bg-card border-border overflow-hidden", !canAccess && "opacity-80")}>
              {/* Tournament header */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-background/40">
                <span>{match.tournamentLogo}</span>
                <span className="text-xs text-muted-foreground font-medium">{match.tournament}</span>
                <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {relativeTime(match.startTime)}
                </span>
                <Badge variant="outline" className="text-xs ml-2">{match.format}</Badge>
                {match.planRequired !== "free" && (
                  <Badge
                    variant="outline"
                    className={cn("text-xs capitalize ml-1",
                      match.planRequired === "vip" ? "border-yellow-500 text-yellow-500" : "border-primary text-primary"
                    )}
                  >
                    {match.planRequired}
                  </Badge>
                )}
              </div>

              <CardContent className="p-4">
                {canAccess ? (
                  <div className="space-y-4">
                    {/* Teams */}
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                      {/* Team A */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{teamA.logo}</span>
                          <div>
                            <p className="font-bold text-sm">{teamA.name}</p>
                            <p className="text-xs text-muted-foreground">{teamA.tag} · {teamA.region}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {teamA.recentForm.map((r, i) => <FormBadge key={i} result={r} />)}
                        </div>
                        <p className="text-xs text-muted-foreground">Rating {teamA.rating}</p>
                      </div>

                      {/* VS + odds */}
                      <div className="text-center space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">VS</p>
                        <p className="text-xs text-muted-foreground">{match.odds.teamA} : {match.odds.teamB}</p>
                      </div>

                      {/* Team B */}
                      <div className="space-y-1 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <div>
                            <p className="font-bold text-sm">{teamB.name}</p>
                            <p className="text-xs text-muted-foreground">{teamB.tag} · {teamB.region}</p>
                          </div>
                          <span className="text-2xl">{teamB.logo}</span>
                        </div>
                        <div className="flex gap-1 justify-end">
                          {teamB.recentForm.map((r, i) => <FormBadge key={i} result={r} />)}
                        </div>
                        <p className="text-xs text-muted-foreground">Rating {teamB.rating}</p>
                      </div>
                    </div>

                    {/* Win probability bars */}
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Ялах магадлал</p>
                      <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-1.5 items-center">
                        <span className="text-xs font-medium w-10">{teamA.tag}</span>
                        <ConfidenceBar value={prediction.teamAWinPct} winner={prediction.winner === "teamA"} />
                        <span className="text-xs font-medium w-10 text-right">{teamB.tag}</span>
                      </div>
                      <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 items-center">
                        <span className="text-xs w-10" />
                        <ConfidenceBar value={100 - prediction.teamAWinPct} winner={prediction.winner === "teamB"} />
                        <span className="text-xs w-10" />
                      </div>
                    </div>

                    {/* AI analysis */}
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-wide">AI Дүн шинжилгээ</span>
                        <Badge className="ml-auto text-xs bg-primary/20 text-primary border-0">
                          {prediction.confidence}% итгэл
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{prediction.analysis}</p>
                      {userPlan !== "free" && (
                        <ul className="space-y-1 mt-2">
                          {prediction.keyFactors.map((f, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-primary mt-0.5">•</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Prediction badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Манай таамаглал:</span>
                        <Badge className="bg-primary/20 text-primary border-primary/30 font-bold">
                          {prediction.winner === "teamA" ? teamA.name : teamB.name} ялна
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Locked state */
                  <div className="flex flex-col items-center justify-center py-6 gap-3">
                    <Lock className="w-8 h-8 text-muted-foreground" />
                    <div className="text-center">
                      <p className="font-medium">
                        {match.planRequired === "vip" ? "VIP" : "Pro"} төлөвлөгөө шаардлагатай
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Энэ таамаглалыг харахын тулд {match.planRequired === "vip" ? "VIP" : "Pro"} эрх нээгээрэй
                      </p>
                    </div>
                    <Button render={<Link href="/pricing" />} size="sm" className="gap-1.5">
                      Эрх нээх <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
