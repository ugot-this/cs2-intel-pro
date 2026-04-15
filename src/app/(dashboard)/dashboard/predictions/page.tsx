import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth-helpers";
import {
  getUpcomingMatches,
  getRunningMatches,
  getTeamRecentMatches,
  getAllMatches,
  hasPandaScoreKey,
  formatBO,
  matchStartTime,
  computeWinRate,
  computeRecentForm,
  predictWinProbability,
  oddsFromProbability,
  regionFromLocation,
} from "@/lib/pandascore";
import {
  getHLTVMatches,
  getHLTVRankings,
  getHLTVUpcomingEvents,
  generateMatchupsFromRankings,
  type HLTVEvent,
} from "@/lib/hltv-data";
import { UPCOMING_MATCHES } from "@/lib/cs2-data";
import { PredictionsList, type MatchData } from "./predictions-client";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Predictions – CS2 Intel Pro" };

function planRequired(index: number): "free" | "pro" | "vip" {
  if (index < 3) return "free";
  if (index < 7) return "pro";
  return "vip";
}

/** cs2-data.ts mock → MatchData */
function fromMock(): MatchData[] {
  return UPCOMING_MATCHES.map((m, i) => ({
    id: i + 1000,
    teamA: {
      name: m.teamA.name,
      acronym: m.teamA.tag,
      imageUrl: null,
      region: m.teamA.region,
      winRate: m.teamA.winRate,
      recentForm: m.teamA.recentForm,
      players: m.teamA.players,
    },
    teamB: {
      name: m.teamB.name,
      acronym: m.teamB.tag,
      imageUrl: null,
      region: m.teamB.region,
      winRate: m.teamB.winRate,
      recentForm: m.teamB.recentForm,
      players: m.teamB.players,
    },
    league: m.tournament,
    serie: "",
    startTime: m.startTime,
    format: m.format,
    isLive: false,
    planReq: m.planRequired,
    prediction: {
      teamAWinPct: m.prediction.teamAWinPct,
      teamBWinPct: 100 - m.prediction.teamAWinPct,
      confidence: m.prediction.confidence,
      winner: m.prediction.winner === "teamA" ? "teamA" : "teamB",
      keyFactors: m.prediction.keyFactors,
      oddsA: m.odds.teamA,
      oddsB: m.odds.teamB,
    },
  }));
}

/** PandaScore → MatchData */
async function fromPandaScore(): Promise<MatchData[]> {
  const [upcoming, running] = await Promise.allSettled([
    getUpcomingMatches(20),
    getRunningMatches(),
  ]);

  let upcomingList = upcoming.status === "fulfilled" ? upcoming.value : [];
  const runningList = running.status === "fulfilled" ? running.value : [];
  const liveIds = new Set(runningList.map(m => m.id));

  if (upcomingList.length === 0) {
    const all = await getAllMatches(20);
    upcomingList = all.filter(m => !liveIds.has(m.id));
  }

  const all = [...runningList.slice(0, 3), ...upcomingList.slice(0, 17)];
  if (all.length === 0) return [];

  const enriched = await Promise.allSettled(
    all.map(async (match, i) => {
      if (match.opponents.length < 2) return null;
      const tA = match.opponents[0].opponent;
      const tB = match.opponents[1].opponent;

      const [rA, rB] = await Promise.allSettled([
        getTeamRecentMatches(tA.id, 10),
        getTeamRecentMatches(tB.id, 10),
      ]);

      const mA = rA.status === "fulfilled" ? rA.value : [];
      const mB = rB.status === "fulfilled" ? rB.value : [];
      const wrA = computeWinRate(mA, tA.id);
      const wrB = computeWinRate(mB, tB.id);
      const formA = computeRecentForm(mA, tA.id);
      const formB = computeRecentForm(mB, tB.id);
      const { teamAWinPct, confidence } = predictWinProbability(wrA, wrB);

      return {
        id: match.id,
        teamA: {
          name: tA.name,
          acronym: tA.acronym ?? tA.name.slice(0, 4).toUpperCase(),
          imageUrl: tA.image_url,
          region: regionFromLocation(tA.location),
          winRate: wrA,
          recentForm: formA,
          players: tA.players.slice(0, 5).map(p => p.name),
        },
        teamB: {
          name: tB.name,
          acronym: tB.acronym ?? tB.name.slice(0, 4).toUpperCase(),
          imageUrl: tB.image_url,
          region: regionFromLocation(tB.location),
          winRate: wrB,
          recentForm: formB,
          players: tB.players.slice(0, 5).map(p => p.name),
        },
        league: match.league.name,
        serie: match.serie.full_name ?? "",
        startTime: matchStartTime(match),
        format: formatBO(match.number_of_games),
        isLive: liveIds.has(match.id),
        planReq: planRequired(i),
        prediction: {
          teamAWinPct,
          teamBWinPct: 100 - teamAWinPct,
          confidence,
          winner: teamAWinPct >= 50 ? "teamA" : "teamB",
          keyFactors: [
            `${tA.name} сүүлийн тоглоомуудад ${wrA}% ялалтын хувьтай`,
            `${tB.name} сүүлийн тоглоомуудад ${wrB}% ялалтын хувьтай`,
            ...(match.number_of_games >= 3 ? [`${formatBO(match.number_of_games)} формат — газрын давуу байдал чухал`] : []),
          ],
          oddsA: oddsFromProbability(teamAWinPct),
          oddsB: oddsFromProbability(100 - teamAWinPct),
        },
      } satisfies MatchData;
    })
  );

  return enriched
    .filter((r): r is PromiseFulfilledResult<MatchData> =>
      r.status === "fulfilled" && r.value !== null
    )
    .map(r => r.value);
}

function UpcomingEventsPanel({ events }: { events: HLTVEvent[] }) {
  if (!events.length) return null;
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold text-primary">Удахгүй болох турнир</p>
        </div>
        <div className="space-y-2">
          {events.map(e => (
            <div key={e.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="font-medium">{e.name}</span>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {e.daysUntil === 0 ? "Өнөөдөр" : `${e.daysUntil} өдрийн дараа`}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function PredictionsPage() {
  const user = await requireAuth();

  let matches: MatchData[] = [];
  let mockReason = "";
  let usingMock = false;
  let upcomingEvents: HLTVEvent[] = [];

  // 1. HLTV-ээс бодит тоглоом авах
  try {
    matches = await getHLTVMatches();
  } catch (err) {
    console.error("[predictions] HLTV matches error:", err);
  }

  // 2. HLTV хоосон → PandaScore туршина
  if (matches.length === 0 && hasPandaScoreKey()) {
    try {
      matches = await fromPandaScore();
    } catch (err) {
      console.error("[predictions] PandaScore error:", err);
    }
  }

  // 3. Хоёулаа хоосон → HLTV rankings-аас matchup үүсгэнэ
  if (matches.length === 0) {
    try {
      const [rankings, events] = await Promise.allSettled([
        getHLTVRankings(),
        getHLTVUpcomingEvents(),
      ]);

      upcomingEvents = events.status === "fulfilled" ? events.value : [];

      if (rankings.status === "fulfilled" && rankings.value.length > 0) {
        matches = generateMatchupsFromRankings(rankings.value, 10);
        usingMock = true;
        mockReason = "Одоогоор хуваарьт тоглоом байхгүй — HLTV рейтинг дээр суурилсан prediction";
      } else {
        // 4. Бүх зүйл амжилтгүй → mock
        matches = fromMock();
        usingMock = true;
        mockReason = "Demo горим";
      }
    } catch (err) {
      console.error("[predictions] HLTV rankings error:", err);
      matches = fromMock();
      usingMock = true;
      mockReason = "Demo горим";
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Таамаглалууд</h1>
          <p className="text-muted-foreground mt-1">
            Тоглоомоо сонгоод AI prediction авна уу
          </p>
        </div>
      </div>

      {upcomingEvents.length > 0 && (
        <UpcomingEventsPanel events={upcomingEvents} />
      )}

      <PredictionsList
        matches={matches}
        userPlan={user.planSlug}
        usingMock={usingMock}
        mockReason={mockReason}
      />
    </div>
  );
}
