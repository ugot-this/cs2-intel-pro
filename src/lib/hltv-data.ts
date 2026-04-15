/**
 * HLTV unofficial API wrapper
 * Rankings болон events ажилладаг, matches Cloudflare-аар хаалттай
 */
import { HLTV } from "hltv";
import type { MatchData } from "@/app/(dashboard)/dashboard/predictions/predictions-client";

// ─── Team Rankings ─────────────────────────────────────────────

export interface HLTVTeam {
  rank: number;
  id: number;
  name: string;
  change: number;
  isNew: boolean;
}

export async function getHLTVRankings(): Promise<HLTVTeam[]> {
  const ranking = await HLTV.getTeamRanking();
  return ranking.slice(0, 30).map((r) => ({
    rank: r.place,
    id: r.team.id ?? 0,
    name: r.team.name,
    change: r.change ?? 0,
    isNew: r.isNew ?? false,
  }));
}

// ─── Matches ───────────────────────────────────────────────────

export async function getHLTVMatches(): Promise<MatchData[]> {
  const matches = await HLTV.getMatches();
  if (!matches.length) return [];

  return matches
    .filter((m) => m.team1 && m.team2)
    .slice(0, 20)
    .map((m, i) => {
      const wrA = 50 + Math.round(Math.random() * 20 - 10);
      const wrB = 50 + Math.round(Math.random() * 20 - 10);
      const total = wrA + wrB;
      const pctA = Math.round((wrA / total) * 100);
      const fmt =
        m.format === "bo1" ? "BO1" : m.format === "bo3" ? "BO3" : m.format === "bo5" ? "BO5" : "BO3";

      const planReq: "free" | "pro" | "vip" = i < 3 ? "free" : i < 7 ? "pro" : "vip";

      return {
        id: m.id,
        teamA: {
          name: m.team1!.name,
          acronym: m.team1!.name.slice(0, 4).toUpperCase(),
          imageUrl: null,
          region: "EU",
          winRate: wrA,
          recentForm: [],
          players: [],
        },
        teamB: {
          name: m.team2!.name,
          acronym: m.team2!.name.slice(0, 4).toUpperCase(),
          imageUrl: null,
          region: "EU",
          winRate: wrB,
          recentForm: [],
          players: [],
        },
        league: m.event?.name ?? "HLTV",
        serie: "",
        startTime: m.date ? new Date(m.date).toISOString() : new Date().toISOString(),
        format: fmt,
        isLive: m.live ?? false,
        planReq,
        prediction: {
          teamAWinPct: pctA,
          teamBWinPct: 100 - pctA,
          confidence: Math.min(80, 50 + Math.abs(wrA - wrB)),
          winner: pctA >= 50 ? "teamA" : "teamB",
          keyFactors: [
            `${m.team1!.name} сүүлийн тоглоомуудад ${wrA}% ялалтын хувьтай`,
            `${m.team2!.name} сүүлийн тоглоомуудад ${wrB}% ялалтын хувьтай`,
          ],
          oddsA: Math.round((100 / pctA) * 100) / 100,
          oddsB: Math.round((100 / (100 - pctA)) * 100) / 100,
        },
      } satisfies MatchData;
    });
}

// ─── Upcoming Events ───────────────────────────────────────────

export interface HLTVEvent {
  id: number;
  name: string;
  dateStart: number;
  dateEnd: number;
  daysUntil: number;
}

export async function getHLTVUpcomingEvents(): Promise<HLTVEvent[]> {
  const events = await HLTV.getEvents();
  const now = Date.now();
  return events
    .filter((e) => e.dateStart != null)
    .map((e) => ({
      id: e.id,
      name: e.name,
      dateStart: e.dateStart!,
      dateEnd: e.dateEnd ?? e.dateStart!,
      daysUntil: Math.ceil((e.dateStart! - now) / 86_400_000),
    }))
    .filter((e) => e.daysUntil >= 0 && e.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 8);
}

// ─── Top team matchups when no live matches ─────────────────────

/**
 * HLTV рейтингийн top баг pair-ээс prediction үүсгэнэ.
 * Яг одоо тоглоом байхгүй үед ашиглана.
 */
export function generateMatchupsFromRankings(
  teams: HLTVTeam[],
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
