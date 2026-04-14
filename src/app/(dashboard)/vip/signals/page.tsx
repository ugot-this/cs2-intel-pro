import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-helpers";
import { VIP_SIGNALS, relativeTime } from "@/lib/cs2-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Crown, Zap, TrendingUp, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "VIP Signals" };

const STAKE_COLORS: Record<string, string> = {
  LOW: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  MEDIUM: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  HIGH: "bg-green-500/10 text-green-400 border-green-500/30",
};

const STAKE_LABELS: Record<string, string> = {
  LOW: "Бага",
  MEDIUM: "Дунд",
  HIGH: "Өндөр",
};

const TYPE_LABELS: Record<string, string> = {
  MONEYLINE: "ML",
  MAP_HANDICAP: "Handicap",
  OVER_UNDER: "O/U",
  FIRST_MAP: "Map 1",
};

export default async function VipSignalsPage() {
  const user = await requireAuth();
  const hasVip = user.planSlug === "vip";

  if (!hasVip) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
          <Crown className="w-8 h-8 text-yellow-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">VIP Сигналууд</h1>
          <p className="text-muted-foreground mt-2 max-w-md">
            Өндөр нарийвчлалтай betting сигнал, expected value шинжилгээ, мөнгө удирдлагын зөвлөмжийг авахын тулд VIP эрх шаардлагатай.
          </p>
        </div>
        <Button render={<Link href="/pricing" />} className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
          <Crown className="w-4 h-4" />
          VIP эрх нээх <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  const totalEV = VIP_SIGNALS.reduce((sum, s) => sum + s.expectedValue, 0) / VIP_SIGNALS.length;
  const highConfidence = VIP_SIGNALS.filter(s => s.confidence >= 65).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="w-7 h-7 text-yellow-500" />
            VIP Сигналууд
          </h1>
          <p className="text-muted-foreground mt-1">Өндөр нарийвчлалтай betting сигнал</p>
        </div>
        <Badge variant="outline" className="border-yellow-500 text-yellow-500">VIP план</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Нийт сигнал", value: VIP_SIGNALS.length, icon: Zap },
          { label: "Өндөр итгэлтэй", value: highConfidence, icon: TrendingUp },
          { label: "Дундаж EV", value: `+${totalEV.toFixed(1)}%`, icon: Crown },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <Icon className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-yellow-400">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Signals */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Өнөөдрийн сигналууд</h2>
        {VIP_SIGNALS.map((signal) => {
          const { match } = signal;
          return (
            <Card key={signal.id} className="bg-card border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.05)]">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span>{match.tournamentLogo}</span>
                    <div>
                      <CardTitle className="text-sm">
                        {match.teamA.tag} vs {match.teamB.tag}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">{match.tournament} · {relativeTime(match.startTime)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge variant="outline" className={cn("text-xs", STAKE_COLORS[signal.stake])}>
                      {STAKE_LABELS[signal.stake]} мөрийлт
                    </Badge>
                    <Badge variant="outline" className="text-xs border-border">
                      {TYPE_LABELS[signal.type]}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Signal box */}
                <div className="bg-yellow-500/5 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-xs text-yellow-500 font-semibold uppercase tracking-wide mb-1">Сигнал</p>
                  <p className="text-lg font-bold">{signal.recommendation}</p>
                  <p className="text-muted-foreground text-sm mt-0.5">{signal.description}</p>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-background rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-0.5">Коэффициент</p>
                    <p className="text-xl font-bold text-primary">{signal.odds}</p>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-0.5">Итгэл</p>
                    <p className={cn(
                      "text-xl font-bold",
                      signal.confidence >= 70 ? "text-green-400" : signal.confidence >= 60 ? "text-yellow-400" : "text-muted-foreground"
                    )}>{signal.confidence}%</p>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-0.5">Expected Value</p>
                    <p className={cn(
                      "text-xl font-bold",
                      signal.expectedValue > 10 ? "text-green-400" : signal.expectedValue > 5 ? "text-yellow-400" : "text-muted-foreground"
                    )}>+{signal.expectedValue}%</p>
                  </div>
                </div>

                {/* Confidence bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Итгэлийн түвшин</span>
                    <span>{signal.confidence}%</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-yellow-500 transition-all"
                      style={{ width: `${signal.confidence}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center pb-2">
        ⚠️ Энэ сигналууд нь зөвхөн боловсролын зорилготой. Мөрийлтийн шийдвэрийг өөрөө гаргана уу.
      </p>
    </div>
  );
}
