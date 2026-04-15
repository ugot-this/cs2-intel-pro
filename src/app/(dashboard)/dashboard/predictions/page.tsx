import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth-helpers";
import {
  getHLTVRankings,
  getHLTVUpcomingEvents,
  generateMatchupsFromRankings,
  type HLTVEvent,
} from "@/lib/hltv-data";
import { getLiquipediaMatches } from "@/lib/liquipedia";
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
  let dataSource: "liquipedia" | "rankings" | "demo" = "demo";
  let upcomingEvents: HLTVEvent[] = [];

  // 1. Always load upcoming events for the panel (static, instant)
  try {
    upcomingEvents = await getHLTVUpcomingEvents();
  } catch { /* ignore */ }

  // 2. Liquipedia — primary real-data source (mirrors HLTV match schedule)
  try {
    const liqMatches = await getLiquipediaMatches(14, 25);
    if (liqMatches.length > 0) {
      matches = liqMatches;
      dataSource = "liquipedia";
    }
  } catch (err) {
    console.error("[predictions] Liquipedia error:", err);
  }

  // 3. Liquipedia empty/failed → HLTV ranking matchups anchored to next event
  if (matches.length === 0) {
    try {
      const rankings = await getHLTVRankings();
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
            {dataSource === "liquipedia"
              ? "🟢 Liquipedia — бодит CS2 тоглоомын хуваарь"
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
