import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-helpers";
import { UPCOMING_MATCHES } from "@/lib/cs2-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, BarChart2, TrendingUp, Target, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pro Analytics" };

const PLAN_RANK: Record<string, number> = { free: 0, pro: 1, vip: 2 };

export default async function ProAnalyticsPage() {
  const user = await requireAuth();
  const hasPro = PLAN_RANK[user.planSlug] >= PLAN_RANK["pro"];

  if (!hasPro) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Pro Analytics</h1>
          <p className="text-muted-foreground mt-2 max-w-md">
            Дэлгэрэнгүй газрын шинжилгээ, багийн тактик, түүхэн статистик болон betting value дүн шинжилгээг харахын тулд Pro эрх шаардлагатай.
          </p>
        </div>
        <Button render={<Link href="/pricing" />} className="gap-2">
          Pro эрх нээх <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // Map win rate data from all matches
  const mapStats: Record<string, { teamAWins: number; total: number; label: string }> = {};
  for (const match of UPCOMING_MATCHES) {
    for (const mp of match.prediction.mapPredictions) {
      if (!mapStats[mp.map]) mapStats[mp.map] = { teamAWins: 0, total: 0, label: mp.map };
      mapStats[mp.map].teamAWins += mp.teamAWinPct / 100;
      mapStats[mp.map].total += 1;
    }
  }
  const mapData = Object.values(mapStats).map(s => ({
    map: s.label,
    avgWinPct: Math.round(s.teamAWins / s.total * 100),
  })).sort((a, b) => b.avgWinPct - a.avgWinPct);

  // Overall model accuracy stats (mock historical data)
  const accuracyStats = [
    { label: "Нийт таамаглал", value: "2,847", icon: BarChart2 },
    { label: "Зөв таамаглал", value: "1,892", icon: Target },
    { label: "Нийт нарийвчлал", value: "66.5%", icon: TrendingUp },
    { label: "BO3 нарийвчлал", value: "71.2%", icon: TrendingUp },
  ];

  // Per-match map breakdown
  const proMatches = UPCOMING_MATCHES.filter(m => m.planRequired !== "vip");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pro Analytics</h1>
          <p className="text-muted-foreground mt-1">Дэлгэрэнгүй CS2 тоглоомын дүн шинжилгээ</p>
        </div>
        <Badge variant="outline" className="border-primary text-primary capitalize">{user.planSlug} plan</Badge>
      </div>

      {/* Model accuracy overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {accuracyStats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold text-primary">{s.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Map win rate analysis */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Газрын хамгийн өндөр нарийвчлал</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mapData.map(({ map, avgWinPct }) => (
            <div key={map} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{map}</span>
                <span className={cn(
                  "font-bold",
                  avgWinPct >= 65 ? "text-green-400" : avgWinPct >= 55 ? "text-yellow-400" : "text-muted-foreground"
                )}>{avgWinPct}%</span>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${avgWinPct}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Per-match deep analysis */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Тоглоом тус бүрийн газрын шинжилгээ</h2>
        <div className="space-y-4">
          {proMatches.map((match) => (
            <Card key={match.id} className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <span>{match.tournamentLogo}</span>
                  <div className="flex-1">
                    <CardTitle className="text-sm">
                      {match.teamA.tag} vs {match.teamB.tag}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{match.tournament} · {match.format}</p>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-0 text-xs">
                    {match.prediction.confidence}% итгэл
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Газар тус бүрийн таамаглал</p>
                {match.prediction.mapPredictions.map((mp) => (
                  <div key={mp.map} className="grid grid-cols-[80px_1fr_80px] items-center gap-3 text-xs">
                    <span className="font-medium">{mp.map}</span>
                    <div className="relative w-full bg-border rounded-full h-4 overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-blue-500/40 transition-all flex items-center justify-end pr-1"
                        style={{ width: `${mp.teamAWinPct}%` }}
                      >
                        {mp.teamAWinPct >= 30 && (
                          <span className="text-white text-[10px] font-bold">{mp.teamAWinPct}%</span>
                        )}
                      </div>
                      <div
                        className="absolute right-0 top-0 h-full bg-red-500/40 transition-all flex items-center justify-start pl-1"
                        style={{ width: `${100 - mp.teamAWinPct}%` }}
                      >
                        {(100 - mp.teamAWinPct) >= 30 && (
                          <span className="text-white text-[10px] font-bold">{100 - mp.teamAWinPct}%</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-muted-foreground">{100 - mp.teamAWinPct}%</div>
                  </div>
                ))}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span className="text-blue-400 font-medium">{match.teamA.tag}</span>
                  <span className="text-red-400 font-medium">{match.teamB.tag}</span>
                </div>
                {/* Key factors */}
                <div className="mt-3 space-y-1">
                  {match.prediction.keyFactors.map((f, i) => (
                    <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span>{f}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
