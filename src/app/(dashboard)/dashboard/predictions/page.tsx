import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth-helpers";
import {
  getScheduledMatches,
  getRunningMatches,
  getTeamRecentMatches,
  hasPandaScoreKey,
  formatBO,
  matchStartTime,
  computeWinRate,
  computeRecentForm,
  predictWinProbability,
  oddsFromProbability,
  regionFromLocation,
  type PSMatch,
} from "@/lib/pandascore";
import {
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

// ─── Plan helper ───────────────────────────────────────────────

function planRequired(index: number): "free" | "pro" | "vip" {
  if (index < 3) return "free";
  if (index < 7) return "pro";
  return "vip";
}

// ─── Mock fallback ─────────────────────────────────────────────

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

// ─── PandaScore → MatchData ─────────────────────────────────────

async function enrichMatch(match: PSMatch, index: number): Promise<MatchData | null> {
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
    isLive: match.status === "running",
    planReq: planRequired(index),
    prediction: {
      teamAWinPct,
      teamBWinPct: 100 - teamAWinPct,
      confidence,
      winner: teamAWinPct >= 50 ? "teamA" : "teamB",
      keyFactors: [
        `${tA.name} сүүлийн тоглоомуудад ${wrA}% ялалтын хувьтай`,
        `${tB.name} сүүлийн тоглоомуудад ${wrB}% ялалтын хувьтай`,
        ...(match.number_of_games >= 3
          ? [`${formatBO(match.number_of_games)} формат — газрын давуу байдал чухал`]
          : []),
      ],
      oddsA: oddsFromProbability(teamAWinPct),
      oddsB: oddsFromProbability(100 - teamAWinPct),
    },
  } satisfies MatchData;
}

async function fromPandaScore(): Promise<MatchData[]> {
  // Try running matches + scheduled in the next 14 days in parallel
  const [scheduled, running] = await Promise.allSettled([
    getScheduledMatches(14),
    getRunningMatches(),
  ]);

  const scheduledList = scheduled.status === "fulfilled" ? scheduled.value : [];
  const runningList   = running.status === "fulfilled"   ? running.value   : [];

  // Deduplicate: running takes priority
  const liveIds = new Set(runningList.map(m => m.id));
  const combined = [
    ...runningList.slice(0, 5),
    ...scheduledList.filter(m => !liveIds.has(m.id)).slice(0, 20),
  ];

  if (combined.length === 0) return [];

  const enriched = await Promise.allSettled(
    combined.map((match, i) => enrichMatch(match, i))
  );

  return enriched
    .filter((r): r is PromiseFulfilledResult<MatchData> =>
      r.status === "fulfilled" && r.value !== null
    )
    .map(r => r.value);
}

// ─── Upcoming Events panel ─────────────────────────────────────

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
                {e.daysUntil === 0
                  ? "🔴 Өнөөдөр эхэлнэ"
                  : e.daysUntil < 0
                  ? "🟢 Явагдаж байна"
                  : `${e.daysUntil} өдрийн дараа`}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────

export default async function PredictionsPage() {
  const user = await requireAuth();

  let matches: MatchData[] = [];
  let dataSource: "pandascore" | "rankings" | "demo" = "demo";
  let upcomingEvents: HLTVEvent[] = [];

  // 1. Always load upcoming events for the panel (static, instant)
  try {
    upcomingEvents = await getHLTVUpcomingEvents();
  } catch { /* ignore */ }

  // 2. PandaScore — primary real-data source (date-range query)
  if (hasPandaScoreKey()) {
    try {
      matches = await fromPandaScore();
      if (matches.length > 0) dataSource = "pandascore";
    } catch (err) {
      console.error("[predictions] PandaScore error:", err);
    }
  }

  // 3. PandaScore empty → HLTV ranking matchups anchored to next event
  if (matches.length === 0) {
    try {
      const rankings = await getHLTVRankings();
      // Use the nearest upcoming event as the date anchor
      const anchor = upcomingEvents.find(e => e.daysUntil >= 0);
      matches = generateMatchupsFromRankings(rankings, 10, anchor);
      dataSource = "rankings";
    } catch (err) {
      console.error("[predictions] Rankings fallback error:", err);
    }
  }

  // 4. Everything failed → static demo data
  if (matches.length === 0) {
    matches = fromMock();
    dataSource = "demo";
  }

  const usingMock = dataSource === "demo";
  const mockReason = usingMock ? "Demo горим — бүх эх сурвалж амжилтгүй" : undefined;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Таамаглалууд</h1>
          <p className="text-muted-foreground mt-1">
            {dataSource === "pandascore"
              ? "🟢 PandaScore — бодит тоглоомын хуваарь"
              : dataSource === "rankings"
              ? "🟡 HLTV рейтинг дээр суурилсан симуляц"
              : "⚪ Demo өгөгдөл"}
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
