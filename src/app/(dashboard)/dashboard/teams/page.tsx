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
import { TeamLogo } from "./team-logo";
import { TrendingUp, TrendingDown, Users, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Teams – CS2 Intel Pro" };

// ─── Helpers ───────────────────────────────────────────────────

const REGION_COLORS: Record<string, string> = {
  EU:   "bg-blue-500/10 text-blue-400",
  NA:   "bg-red-500/10 text-red-400",
  CIS:  "bg-orange-500/10 text-orange-400",
  APAC: "bg-green-500/10 text-green-400",
  SA:   "bg-yellow-500/10 text-yellow-400",
  ME:   "bg-purple-500/10 text-purple-400",
};

const FLAG_EMOJI: Record<string, string> = {
  FR: "🇫🇷", UA: "🇺🇦", BR: "🇧🇷", RU: "🇷🇺", SA: "🇸🇦",
  MN: "🇲🇳", DE: "🇩🇪", DK: "🇩🇰", TR: "🇹🇷", SE: "🇸🇪",
  US: "🇺🇸", AR: "🇦🇷", CN: "🇨🇳", EU: "🇪🇺",
};

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

// ─── Unified team model ─────────────────────────────────────────

interface TeamRow {
  id: number;
  name: string;
  acronym: string;
  imageUrl: string | null;
  logoUrl: string | null;
  region: string;
  flag: string;
  players: string[];
  winRate: number;
  recentForm: ("W" | "L")[];
  hltvRank: number;
  rankChange: number;
}

// ─── Build from HLTV static data ───────────────────────────────

function fromHLTV(teams: HLTVTeam[]): TeamRow[] {
  return teams.map(t => ({
    id: t.id,
    name: t.name,
    acronym: t.name.slice(0, 4).toUpperCase(),
    imageUrl: null,
    logoUrl: t.logoUrl,
    region: t.region,
    flag: t.flag,
    players: t.players,
    winRate: t.winRate,
    recentForm: [],
    hltvRank: t.rank,
    rankChange: t.change,
  }));
}

// ─── Enrich with PandaScore logos + form ───────────────────────

async function enrichWithPandaScore(rows: TeamRow[]): Promise<TeamRow[]> {
  let psTeams: PSTeam[] = [];
  try {
    psTeams = await getTopTeams(25);
  } catch {
    return rows;
  }

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
      winRate: match.winRate > 0 ? match.winRate : row.winRate,
    };
  });
}

// ─── Podium config ──────────────────────────────────────────────

const PODIUM = [
  {
    color: "text-yellow-400",
    border: "border-yellow-400/30",
    glow: "shadow-[0_0_30px_rgba(234,179,8,0.10)]",
    bg: "bg-yellow-400/[0.04]",
    label: "#1",
    tagClass: "bg-yellow-400/10 text-yellow-400/80",
  },
  {
    color: "text-slate-300",
    border: "border-slate-400/20",
    glow: "",
    bg: "",
    label: "#2",
    tagClass: "bg-slate-400/10 text-slate-300/70",
  },
  {
    color: "text-amber-600",
    border: "border-amber-600/20",
    glow: "",
    bg: "bg-amber-600/[0.03]",
    label: "#3",
    tagClass: "bg-amber-600/10 text-amber-500/70",
  },
];

// ─── Page ───────────────────────────────────────────────────────

export default async function TeamsPage() {
  await requireAuth();

  let teams: TeamRow[] = fromHLTV(HLTV_TOP30);
  let hasPanda = false;

  if (hasPandaScoreKey()) {
    teams = await enrichWithPandaScore(teams);
    hasPanda = true;
  }

  const top3 = teams.slice(0, 3);

  return (
    <div className="p-6 space-y-6 max-w-6xl">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-black text-primary/60 tracking-[0.2em] uppercase mb-1">
            World Rankings
          </p>
          <h1 className="text-3xl font-black leading-tight">Багуудын статистик</h1>
          <p className="text-muted-foreground/60 text-sm mt-1">
            HLTV Top 30 рейтинг{hasPanda && " · PandaScore live data"}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-xs font-black text-primary">
          <Users className="h-3 w-3" />
          {teams.length} баг
        </span>
      </div>

      {/* ── Top 3 Podium ────────────────────────────────────── */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {top3.map((team, i) => {
            const cfg = PODIUM[i];
            return (
              <div
                key={team.id}
                className={cn(
                  "relative rounded-xl border p-5 overflow-hidden",
                  cfg.border, cfg.bg, cfg.glow
                )}
              >
                {/* Large watermark rank */}
                <span className={cn(
                  "absolute -top-2 -right-1 text-[5rem] font-black leading-none opacity-[0.05] select-none pointer-events-none",
                  cfg.color
                )}>
                  {i + 1}
                </span>

                {/* Top row: podium icon + rank change */}
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1",
                    i === 0 ? "bg-yellow-400/10" : i === 1 ? "bg-slate-400/10" : "bg-amber-600/10"
                  )}>
                    <Trophy className={cn("w-3.5 h-3.5", cfg.color)} />
                    <span className={cn("text-xs font-black", cfg.color)}>{cfg.label}</span>
                  </div>
                  {team.rankChange !== 0 && (
                    <span className={cn(
                      "text-xs font-bold",
                      team.rankChange > 0 ? "text-green-400" : "text-red-400"
                    )}>
                      {team.rankChange > 0 ? `▲ ${team.rankChange}` : `▼ ${Math.abs(team.rankChange)}`}
                    </span>
                  )}
                </div>

                {/* Team identity */}
                <div className="flex items-center gap-3 mb-4">
                  <TeamLogo
                    logoUrl={team.imageUrl ?? team.logoUrl}
                    name={team.name}
                    acronym={team.acronym}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="font-black text-base leading-tight truncate">{team.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-sm">{FLAG_EMOJI[team.flag] ?? "🌐"}</span>
                      <span className={cn(
                        "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                        REGION_COLORS[team.region] ?? REGION_COLORS.EU
                      )}>
                        {team.region}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats mini-grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="rounded-lg bg-background/40 border border-border/30 p-2.5">
                    <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-1">Ялалт</p>
                    <p className={cn(
                      "text-xl font-black tabular-nums leading-none",
                      team.winRate >= 60 ? "text-green-400" :
                      team.winRate >= 50 ? "text-yellow-400" : "text-red-400"
                    )}>
                      {team.winRate}%
                    </p>
                  </div>
                  <div className="rounded-lg bg-background/40 border border-border/30 p-2.5">
                    <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-1">Тоглогч</p>
                    <p className="text-xl font-black text-primary tabular-nums leading-none">
                      {team.players.length}
                    </p>
                  </div>
                </div>

                {/* Player tags */}
                {team.players.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {team.players.map(p => (
                      <span key={p} className={cn("text-[11px] px-1.5 py-0.5 rounded font-semibold", cfg.tagClass)}>
                        {p}
                      </span>
                    ))}
                  </div>
                )}

                {/* Recent form */}
                {team.recentForm.length > 0 && (
                  <div className="flex items-center gap-0.5">
                    {team.recentForm.map((r, idx) => <FormBadge key={idx} result={r} />)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Rankings table ──────────────────────────────────── */}
      <div className="rounded-xl bg-card border border-border/60 overflow-hidden">

        {/* Table header */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50">
          <Users className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-black">HLTV Top 30 — CS2 багуудын жагсаалт</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40 bg-background/20">
                <th className="text-left px-5 py-3 text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest w-14">#</th>
                <th className="text-left px-5 py-3 text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest">Баг</th>
                <th className="text-left px-5 py-3 text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest">Бүс</th>
                <th className="text-right px-5 py-3 text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest">WR %</th>
                <th className="text-left px-5 py-3 text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest hidden sm:table-cell">Хэлбэр</th>
                <th className="text-left px-5 py-3 text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest hidden lg:table-cell">Тоглогчид</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, idx) => {
                const wins = team.recentForm.filter(r => r === "W").length;
                const trending = wins >= 3;
                const isTop = idx < 3;

                return (
                  <tr
                    key={team.id}
                    className={cn(
                      "border-b border-border/30 transition-colors group hover:bg-primary/[0.025]",
                      isTop && "bg-primary/[0.012]"
                    )}
                  >
                    {/* Rank */}
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className={cn(
                          "font-black tabular-nums leading-tight",
                          idx === 0 ? "text-yellow-400 text-lg" :
                          idx === 1 ? "text-slate-300 text-base" :
                          idx === 2 ? "text-amber-500 text-base" :
                          "text-foreground/80 text-sm"
                        )}>
                          {team.hltvRank}
                        </span>
                        {team.rankChange !== 0 && (
                          <span className={cn(
                            "text-[10px] font-bold leading-none",
                            team.rankChange > 0 ? "text-green-400" : "text-red-400"
                          )}>
                            {team.rankChange > 0 ? `▲${team.rankChange}` : `▼${Math.abs(team.rankChange)}`}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Team */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <TeamLogo
                          logoUrl={team.imageUrl ?? team.logoUrl}
                          name={team.name}
                          acronym={team.acronym}
                          size="sm"
                        />
                        <div>
                          <p className={cn(
                            "font-bold leading-tight text-sm",
                            isTop ? "text-foreground" : "text-foreground/85"
                          )}>
                            {team.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground/40 font-mono">
                            {team.acronym}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Region */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm leading-none">{FLAG_EMOJI[team.flag] ?? "🌐"}</span>
                        <span className={cn(
                          "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                          REGION_COLORS[team.region] ?? REGION_COLORS.EU
                        )}>
                          {team.region}
                        </span>
                      </div>
                    </td>

                    {/* Win rate */}
                    <td className="px-5 py-3.5 text-right">
                      <span className={cn(
                        "font-black text-sm tabular-nums",
                        team.winRate >= 60 ? "text-green-400" :
                        team.winRate >= 50 ? "text-yellow-400" : "text-red-400"
                      )}>
                        {team.winRate}%
                      </span>
                    </td>

                    {/* Recent form */}
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      {team.recentForm.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <div className="flex gap-0.5">
                            {team.recentForm.map((r, i2) => <FormBadge key={i2} result={r} />)}
                          </div>
                          {trending
                            ? <TrendingUp className="w-3 h-3 text-green-400 shrink-0" />
                            : <TrendingDown className="w-3 h-3 text-red-400 shrink-0" />
                          }
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/30">—</span>
                      )}
                    </td>

                    {/* Players */}
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      {team.players.length > 0 ? (
                        <div className="flex flex-wrap gap-0.5">
                          {team.players.map(p => (
                            <span
                              key={p}
                              className="text-[10px] bg-border/30 text-muted-foreground/60 px-1.5 py-0.5 rounded font-medium group-hover:bg-primary/8 group-hover:text-primary/60 transition-colors"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/30">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
