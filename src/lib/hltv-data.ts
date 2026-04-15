/**
 * CS2 rankings and match data
 * Uses hardcoded HLTV top-30 rankings (no external package dependency)
 */
import type { MatchData } from "@/app/(dashboard)/dashboard/predictions/predictions-client";
import { HLTV_TOP30, UPCOMING_EVENTS } from "@/lib/cs2-rankings";

// Re-export type for consumers that import from here
export type { HLTVTeam } from "@/lib/cs2-rankings";
export type { UpcomingEvent as HLTVEvent } from "@/lib/cs2-rankings";

// ─── Team Rankings ─────────────────────────────────────────────

export async function getHLTVRankings() {
  return HLTV_TOP30;
}

// ─── Upcoming Events ───────────────────────────────────────────

export async function getHLTVUpcomingEvents() {
  return UPCOMING_EVENTS;
}

// ─── Matches (no live data available — off-week) ───────────────

export async function getHLTVMatches(): Promise<MatchData[]> {
  // No live match scraping — return empty so callers fall through to ranking matchups
  return [];
}

// ─── Top team matchups when no live matches ─────────────────────

/**
 * HLTV рейтингийн top баг pair-ээс prediction үүсгэнэ.
 */
export function generateMatchupsFromRankings(
  teams: Awaited<ReturnType<typeof getHLTVRankings>>,
  count = 10
): MatchData[] {
  const top = teams.slice(0, count * 2);
  const matches: MatchData[] = [];

  for (let i = 0; i < Math.min(count, Math.floor(top.length / 2)); i++) {
    const tA = top[i * 2];
    const tB = top[i * 2 + 1];
    if (!tA || !tB) continue;

    // Rank-аас ялалтын хувь тооцоолно (rank 1 = хамгийн өндөр)
    const scoreA = 1 / tA.rank;
    const scoreB = 1 / tB.rank;
    const total = scoreA + scoreB;
    const pctA = Math.round((scoreA / total) * 100);
    const diff = Math.abs(tA.rank - tB.rank);
    const confidence = Math.min(82, 50 + diff * 2);

    const planReq: "free" | "pro" | "vip" = i < 3 ? "free" : i < 7 ? "pro" : "vip";

    // Хуурамч хуваарь — ирэх 7 хоногийн дотор
    const startTime = new Date(
      Date.now() + (i + 1) * 2 * 24 * 3600 * 1000
    ).toISOString();

    matches.push({
      id: tA.id * 1000 + tB.id,
      teamA: {
        name: tA.name,
        acronym: tA.name.slice(0, 4).toUpperCase(),
        imageUrl: null,
        region: "EU",
        winRate: Math.round(65 - tA.rank * 0.5),
        recentForm: [],
        players: [],
      },
      teamB: {
        name: tB.name,
        acronym: tB.name.slice(0, 4).toUpperCase(),
        imageUrl: null,
        region: "EU",
        winRate: Math.round(65 - tB.rank * 0.5),
        recentForm: [],
        players: [],
      },
      league: "HLTV Ranking Matchup",
      serie: `#${tA.rank} vs #${tB.rank}`,
      startTime,
      format: "BO3",
      isLive: false,
      planReq,
      prediction: {
        teamAWinPct: pctA,
        teamBWinPct: 100 - pctA,
        confidence,
        winner: pctA >= 50 ? "teamA" : "teamB",
        keyFactors: [
          `${tA.name} дэлхийн рейтингт #${tA.rank}-д байна`,
          `${tB.name} дэлхийн рейтингт #${tB.rank}-д байна`,
          `Rank зөрүү: ${diff} байр`,
          diff < 3 ? "Тэнцүү тэмцэл болно" : `${tA.rank < tB.rank ? tA.name : tB.name} тодорхой давуу`,
        ],
        oddsA: Math.round((100 / pctA) * 100) / 100,
        oddsB: Math.round((100 / (100 - pctA)) * 100) / 100,
      },
    });
  }

  return matches;
}
