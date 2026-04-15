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
import { HLTV_TOP30, type HLTVTeam } from "@/lib/cs2-rankings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Teams – CS2 Intel Pro" };

// ─── Helpers ───────────────────────────────────────────────────

const REGION_COLORS: Record<string, string> = {
  EU:   "bg-blue-500/10 text-blue-400 border-blue-500/30",
  NA:   "bg-red-500/10 text-red-400 border-red-500/30",
  CIS:  "bg-orange-500/10 text-orange-400 border-orange-500/30",
  APAC: "bg-green-500/10 text-green-400 border-green-500/30",
  SA:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  ME:   "bg-purple-500/10 text-purple-400 border-purple-500/30",
};

const FLAG_EMOJI: Record<string, string> = {
  FR: "🇫🇷", UA: "🇺🇦", BR: "🇧🇷", RU: "🇷🇺", SA: "🇸🇦",
  MN: "🇲🇳", DE: "🇩🇪", DK: "🇩🇰", TR: "🇹🇷", SE: "🇸🇪",
  US: "🇺🇸", AR: "🇦🇷", CN: "🇨🇳", EU: "🇪🇺",
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

// ─── Unified team model used in this page ─────────────────────

interface TeamRow {
  id: number;
  name: string;
  acronym: string;
  imageUrl: string | null;
  region: string;
  flag: string;
  players: string[];
  winRate: number;
  recentForm: ("W" | "L")[];
  hltvRank: number;
  rankChange: number;
}

// ─── Build team rows from HLTV static data ─────────────────────

function fromHLTV(teams: HLTVTeam[]): TeamRow[] {
  return teams.map(t => ({
    id: t.id,
    name: t.name,
    acronym: t.name.slice(0, 4).toUpperCase(),
    imageUrl: null,
    region: t.region,
    flag: t.flag,
    players: t.players,
    winRate: t.winRate,
    recentForm: [],
    hltvRank: t.rank,
    rankChange: t.change,
  }));
}

// ─── Optionally enrich with PandaScore logos + form ────────────

async function enrichWithPandaScore(rows: TeamRow[]): Promise<TeamRow[]> {
  let psTeams: PSTeam[] = [];
  try {
    psTeams = await getTopTeams(25);
  } catch {
    return rows;
  }

  // For each PandaScore team, try to match by name
  const enriched = await Promise.allSettled(
    psTeams.map(async ps => {
      const recent = await getTeamRecentMatches(ps.id, 10).catch(() => []);
      return {
        psId: ps.id,
        name: ps.name,
        imageUrl: ps.image_url,
        location: ps.location,
        recentForm: computeRecentForm(recent, ps.id, 5),
        winRate: computeWinRate(recent, ps.id),
      };
    })
  );

  const psData = enriched
    .filter((r): r is PromiseFulfilledResult<{
      psId: number; name: string; imageUrl: string | null;
      location: string | null; recentForm: ("W" | "L")[]; winRate: number;
    }> => r.status === "fulfilled")
    .map(r => r.value);

  return rows.map(row => {
    const match = psData.find(ps =>
      ps.name.toLowerCase().includes(row.name.toLowerCase()) ||
      row.name.toLowerCase().includes(ps.name.toLowerCase())
    );
    if (!match) return row;
    return {
      ...row,
      imageUrl: match.imageUrl ?? row.imageUrl,
      recentForm: match.recentForm.length > 0 ? match.recentForm : row.recentForm,
      // Keep HLTV winRate; only override if PandaScore has enough data
      winRate: match.winRate > 0 ? match.winRate : row.winRate,
    };
  });
}

// ─── Page ──────────────────────────────────────────────────────

export default async function TeamsPage() {
  await requireAuth();

  // Always start from HLTV static data — never empty
  let teams: TeamRow[] = fromHLTV(HLTV_TOP30);
  let hasPanda = false;

  // Optionally enrich with PandaScore logos + recent form
  if (hasPandaScoreKey()) {
    teams = await enrichWithPandaScore(teams);
    hasPanda = true;
  }

  const top3 = teams.slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Багуудын статистик</h1>
          <p className="text-muted-foreground mt-1">
            🔴 HLTV Top 30 рейтинг
            {hasPanda && " · PandaScore logo/form"}
          </p>
        </div>
        <Badge variant="outline" className="text-xs border-primary/30 text-primary">
          {teams.length} баг
        </Badge>
      </div>

      {/* Top 3 podium */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.map((team, i) => (
            <Card
              key={team.id}
              className={cn(
                "bg-card border-border",
                i === 0 && "border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.12)]",
                i === 1 && "border-gray-400/30",
                i === 2 && "border-amber-600/30"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Logo or letter avatar */}
                    {team.imageUrl ? (
                      <img
                        src={team.imageUrl}
                        alt={team.name}
                        className="w-11 h-11 rounded-lg object-contain bg-background p-0.5"
                      />
                    ) : (
                      <div className={cn(
                        "w-11 h-11 rounded-lg flex items-center justify-center text-sm font-black",
                        i === 0 ? "bg-yellow-500/20 text-yellow-400" :
                        i === 1 ? "bg-gray-400/20 text-gray-300" :
                        "bg-amber-600/20 text-amber-500"
                      )}>
                        {team.acronym.slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-base leading-tight">{team.name}</CardTitle>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-sm">{FLAG_EMOJI[team.flag] ?? "🌐"}</span>
                        <Badge
                          variant="outline"
                          className={cn("text-xs py-0", REGION_COLORS[team.region] ?? REGION_COLORS.EU)}
                        >
                          {team.region}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "text-2xl font-black block",
                      i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : "text-amber-600"
                    )}>
                      #{team.hltvRank}
                    </span>
                    {team.rankChange !== 0 && (
                      <span className={cn(
                        "text-xs font-medium",
                        team.rankChange > 0 ? "text-green-400" : "text-red-400"
                      )}>
                        {team.rankChange > 0 ? `▲${team.rankChange}` : `▼${Math.abs(team.rankChange)}`}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Stats row */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Ялалтын хувь</p>
                    <p className={cn(
                      "font-bold",
                      team.winRate >= 60 ? "text-green-400" :
                      team.winRate >= 50 ? "text-yellow-400" : "text-red-400"
                    )}>{team.winRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Тоглогчид</p>
                    <p className="font-bold text-primary">{team.players.length}</p>
                  </div>
                </div>

                {/* Players */}
                {team.players.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Тоглогчид</p>
                    <div className="flex flex-wrap gap-1">
                      {team.players.map(p => (
                        <span key={p} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent form */}
                {team.recentForm.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Сүүлийн хэлбэр</p>
                    <div className="flex gap-1">
                      {team.recentForm.map((r, idx) => <FormBadge key={idx} result={r} />)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Full rankings table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <CardTitle className="text-lg">HLTV Top 30 — CS2 багуудын жагсаалт</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/40">
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium w-12">#</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Баг</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Бүс</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">WR%</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium hidden sm:table-cell">Хэлбэр</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium hidden lg:table-cell">Тоглогчид</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {teams.map((team) => {
                  const wins = team.recentForm.filter(r => r === "W").length;
                  const trending = wins >= 3;
                  return (
                    <tr key={team.id} className="hover:bg-accent/30 transition-colors">
                      {/* Rank */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start">
                          <span className="font-bold text-foreground">{team.hltvRank}</span>
                          {team.rankChange !== 0 && (
                            <span className={cn(
                              "text-xs font-medium leading-none",
                              team.rankChange > 0 ? "text-green-400" : "text-red-400"
                            )}>
                              {team.rankChange > 0 ? `▲${team.rankChange}` : `▼${Math.abs(team.rankChange)}`}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Team name + logo */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {team.imageUrl ? (
                            <img
                              src={team.imageUrl}
                              alt={team.name}
                              className="w-7 h-7 rounded object-contain bg-background shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                              {team.acronym.slice(0, 2)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold leading-tight">{team.name}</p>
                            <p className="text-xs text-muted-foreground">{team.acronym}</p>
                          </div>
                        </div>
                      </td>

                      {/* Region + flag */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span>{FLAG_EMOJI[team.flag] ?? "🌐"}</span>
                          <Badge
                            variant="outline"
                            className={cn("text-xs", REGION_COLORS[team.region] ?? REGION_COLORS.EU)}
                          >
                            {team.region}
                          </Badge>
                        </div>
                      </td>

                      {/* Win rate */}
                      <td className="px-4 py-3 text-right">
                        <span className={cn(
                          "font-bold",
                          team.winRate >= 60 ? "text-green-400" :
                          team.winRate >= 50 ? "text-yellow-400" : "text-red-400"
                        )}>
                          {team.winRate}%
                        </span>
                      </td>

                      {/* Recent form */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5">
                          {team.recentForm.length > 0 ? (
                            <>
                              <div className="flex gap-0.5">
                                {team.recentForm.map((r, idx) => <FormBadge key={idx} result={r} />)}
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

                      {/* Players */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {team.players.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {team.players.map(p => (
                              <span key={p} className="text-xs bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded">
                                {p}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
