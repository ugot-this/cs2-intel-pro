import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth-helpers";
import {
  getTopTeams,
  getTeamRecentMatches,
  hasPandaScoreKey,
  computeWinRate,
  computeRecentForm,
  regionFromLocation,
  type PSTeam,
} from "@/lib/pandascore";
import { TEAMS } from "@/lib/cs2-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Teams – CS2 Intel Pro" };

const REGION_COLORS: Record<string, string> = {
  EU: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  NA: "bg-red-500/10 text-red-400 border-red-500/30",
  CIS: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  APAC: "bg-green-500/10 text-green-400 border-green-500/30",
};

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

interface EnrichedTeam {
  team: PSTeam;
  winRate: number;
  recentForm: ("W" | "L")[];
  region: string;
}

async function enrichTeam(team: PSTeam): Promise<EnrichedTeam> {
  try {
    const recent = await getTeamRecentMatches(team.id, 10);
    return {
      team,
      winRate: computeWinRate(recent, team.id),
      recentForm: computeRecentForm(recent, team.id, 5),
      region: regionFromLocation(team.location),
    };
  } catch {
    return {
      team,
      winRate: 50,
      recentForm: [],
      region: regionFromLocation(team.location),
    };
  }
}

function mockTeams(): EnrichedTeam[] {
  return [...TEAMS]
    .sort((a, b) => b.rating - a.rating)
    .map(t => ({
      team: {
        id: t.id.charCodeAt(0),
        name: t.name,
        acronym: t.tag,
        image_url: null,
        location: t.region === "CIS" ? "UA" : t.region === "NA" ? "US" : t.region === "APAC" ? "KR" : "DE",
        players: t.players.map((p, i) => ({
          id: i,
          name: p,
          first_name: null,
          last_name: null,
          nationality: null,
          image_url: null,
        })),
      },
      winRate: t.winRate,
      recentForm: t.recentForm,
      region: t.region,
    }));
}

export default async function TeamsPage() {
  await requireAuth();

  let teams: EnrichedTeam[] = [];
  let usingMock = false;

  if (!hasPandaScoreKey()) {
    teams = mockTeams();
    usingMock = true;
  } else {
    try {
      const rawTeams = await getTopTeams(20);
      const results = await Promise.allSettled(rawTeams.map(enrichTeam));
      teams = results
        .filter((r): r is PromiseFulfilledResult<EnrichedTeam> => r.status === "fulfilled")
        .map(r => r.value)
        .sort((a, b) => b.winRate - a.winRate);
    } catch {
      teams = mockTeams();
      usingMock = true;
    }
  }

  const top3 = teams.slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Багуудын статистик</h1>
        <p className="text-muted-foreground mt-1">
          {usingMock ? "Demo өгөгдөл" : "PandaScore бодит мэдээлэл"}
        </p>
      </div>

      {usingMock && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="p-3 text-xs text-yellow-400 flex items-center gap-2">
            ⚠️ Demo горим — жинхэнэ багуудыг харахын тулд{" "}
            <span className="font-mono font-bold">PANDASCORE_API_KEY</span> тохируулна уу.
          </CardContent>
        </Card>
      )}

      {/* Top 3 */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.map((e, i) => (
            <Card
              key={e.team.id}
              className={cn(
                "bg-card border-border",
                i === 0 && "border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {e.team.image_url ? (
                      <img
                        src={e.team.image_url}
                        alt={e.team.name}
                        className="w-10 h-10 rounded object-contain bg-background"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {(e.team.acronym ?? e.team.name).slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-base">{e.team.name}</CardTitle>
                      <Badge
                        variant="outline"
                        className={cn("text-xs mt-0.5", REGION_COLORS[e.region] ?? REGION_COLORS.EU)}
                      >
                        {e.region}
                      </Badge>
                    </div>
                  </div>
                  <span className={cn(
                    "text-2xl font-black",
                    i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : "text-amber-600"
                  )}>
                    #{i + 1}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Ялалтын хувь</p>
                    <p className="font-bold text-green-400">{e.winRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Тоглогчид</p>
                    <p className="font-bold text-primary">{e.team.players.length}</p>
                  </div>
                </div>
                {e.recentForm.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Сүүлийн хэлбэр</p>
                    <div className="flex gap-1">
                      {e.recentForm.map((r, idx) => <FormBadge key={idx} result={r} />)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Full table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">CS2 Багуудын жагсаалт</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/40">
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium w-10">#</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Баг</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Бүс</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">WR%</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Хэлбэр</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium hidden lg:table-cell">Тоглогчид</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {teams.map((e, i) => {
                  const wins = e.recentForm.filter(r => r === "W").length;
                  const trending = wins >= 3;
                  return (
                    <tr key={e.team.id} className="hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground font-medium">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {e.team.image_url ? (
                            <img
                              src={e.team.image_url}
                              alt={e.team.name}
                              className="w-7 h-7 rounded object-contain bg-background"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {(e.team.acronym ?? e.team.name).slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold">{e.team.name}</p>
                            <p className="text-xs text-muted-foreground">{e.team.acronym}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", REGION_COLORS[e.region] ?? REGION_COLORS.EU)}
                        >
                          {e.region}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={cn(
                          "font-bold",
                          e.winRate >= 60 ? "text-green-400" :
                          e.winRate >= 50 ? "text-yellow-400" : "text-red-400"
                        )}>
                          {e.winRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {e.recentForm.length > 0 ? (
                            <>
                              <div className="flex gap-0.5">
                                {e.recentForm.map((r, idx) => <FormBadge key={idx} result={r} />)}
                              </div>
                              {trending
                                ? <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                                : <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                              }
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <p className="text-xs text-muted-foreground">
                          {e.team.players.slice(0, 5).map(p => p.name).join(", ") || "—"}
                        </p>
                      </td>
                    </tr>
                  );
                })}
                {teams.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Өгөгдөл ачааллаж байна...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
