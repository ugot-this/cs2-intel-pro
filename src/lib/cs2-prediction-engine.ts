/**
 * CS2 Prediction Engine — weighted multi-factor model
 *
 * Weights:
 *   Team Strength   30%  (ELO + rank + LAN/online context)
 *   Map / Veto      30%  (predicted map pool advantage)
 *   Player Impact   20%  (avg rating, ADR, star player gap)
 *   Recent Form     10%  (last 10 results, exponentially weighted)
 *   H2H + Context   10%  (head-to-head record + tournament stage)
 *
 * Pure synchronous — no I/O, no async. Safe for server components.
 */

import "server-only";

import {
  getTeamProfile,
  ALL_MAPS,
  type MapName,
  type TeamProfile,
  type PlayerStat,
} from "@/lib/cs2-team-profiles";
import { HLTV_TOP30 } from "@/lib/cs2-rankings";

// ─── Output types ──────────────────────────────────────────────

export interface MapPrediction {
  mapName: MapName;
  teamAWinPct: number;
  teamBWinPct: number;
  predictedRounds: number;
  likelyPick: "teamA" | "teamB" | "decider";
}

export interface VetoSimulation {
  sequence: string[];
  expectedMaps: MapName[];
  confidence: number;
}

export interface ModelBreakdown {
  teamStrengthA: number;
  teamStrengthB: number;
  mapAdvantageA: number;
  mapAdvantageB: number;
  playerImpactA: number;
  playerImpactB: number;
  recentFormA: number;
  recentFormB: number;
  h2hA: number;
  h2hB: number;
}

export interface StarPlayer {
  name: string;
  rating: number;
  role: string;
}

export interface EnhancedPrediction {
  // Core fields (backward-compatible)
  teamAWinPct: number;
  teamBWinPct: number;
  confidence: number;
  winner: "teamA" | "teamB";
  keyFactors: string[];
  oddsA: number;
  oddsB: number;
  // Extended fields (optional — absent when profiles unavailable)
  modelBreakdown?: ModelBreakdown;
  mapPredictions?: MapPrediction[];
  vetoSimulation?: VetoSimulation;
  roundsOverUnder?: { line: number; rec: "over" | "under"; conf: number };
  ev?: number;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
  bestBet?: string;
  starPlayerA?: StarPlayer;
  starPlayerB?: StarPlayer;
}

// ─── Helpers ───────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function oddsFromProb(pct: number) {
  return Math.round((100 / Math.max(pct, 1)) * 100) / 100;
}

/** ELO win probability for player A given ratings */
function eloWinProb(eloA: number, eloB: number): number {
  return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
}

/** Rank-based win score (lower rank = stronger) */
function rankScore(rankA: number, rankB: number): number {
  const sA = 31 - rankA;
  const sB = 31 - rankB;
  return sA / (sA + sB);
}

// ─── 1. Team Strength (30%) ────────────────────────────────────

function calcTeamStrength(
  profileA: TeamProfile | null,
  profileB: TeamProfile | null,
  rankA: number,
  rankB: number,
  isLAN: boolean,
): { scoreA: number; scoreB: number } {
  const rScore = rankScore(rankA, rankB);

  if (!profileA && !profileB) {
    return { scoreA: rScore, scoreB: 1 - rScore };
  }

  const eloA = profileA?.eloRating ?? (1800 - rankA * 12);
  const eloB = profileB?.eloRating ?? (1800 - rankB * 12);
  const eloProb = eloWinProb(eloA, eloB);

  const wrA = (profileA ? (isLAN ? profileA.lanWinRate : profileA.onlineWinRate) : 50) / 100;
  const wrB = (profileB ? (isLAN ? profileB.lanWinRate : profileB.onlineWinRate) : 50) / 100;
  const wrScore = wrA / (wrA + wrB);

  const bigA = (profileA?.tournamentContext.bigEventWinRate ?? 50) / 100;
  const bigB = (profileB?.tournamentContext.bigEventWinRate ?? 50) / 100;
  const bigScore = bigA / (bigA + bigB);

  // Weighted composite
  const raw = eloProb * 0.50 + rScore * 0.25 + wrScore * 0.15 + bigScore * 0.10;
  return { scoreA: clamp(raw, 0.15, 0.85), scoreB: clamp(1 - raw, 0.15, 0.85) };
}

// ─── 2. Veto Simulation ────────────────────────────────────────

type VetoAction = { team: "A" | "B"; action: "ban" | "pick" };

function getVetoSteps(format: string): VetoAction[] {
  if (format === "BO1") {
    // Each team bans 3, 1 left as decider
    return [
      { team: "A", action: "ban" }, { team: "B", action: "ban" },
      { team: "A", action: "ban" }, { team: "B", action: "ban" },
      { team: "A", action: "ban" }, { team: "B", action: "ban" },
    ];
  }
  if (format === "BO5") {
    return [
      { team: "A", action: "ban" }, { team: "B", action: "ban" },
      { team: "A", action: "pick" }, { team: "B", action: "pick" },
      { team: "A", action: "pick" }, { team: "B", action: "pick" },
    ];
  }
  // BO3 default
  return [
    { team: "A", action: "ban" }, { team: "B", action: "ban" },
    { team: "A", action: "pick" }, { team: "B", action: "pick" },
    { team: "A", action: "ban" }, { team: "B", action: "ban" },
  ];
}

function bestBan(actor: TeamProfile | null, remaining: MapName[]): MapName {
  if (actor?.vetoBans) {
    for (const preferred of actor.vetoBans) {
      if (remaining.includes(preferred)) return preferred;
    }
  }
  // Fallback: ban the map where actor has lowest win rate
  if (actor?.mapStats) {
    return [...remaining].sort(
      (a, b) => actor.mapStats[a].winRate - actor.mapStats[b].winRate
    )[0];
  }
  // No data: ban last map in list
  return remaining[remaining.length - 1];
}

function bestPick(actor: TeamProfile | null, remaining: MapName[]): MapName {
  if (actor?.vetoPicks) {
    for (const preferred of actor.vetoPicks) {
      if (remaining.includes(preferred)) return preferred;
    }
  }
  if (actor?.mapStats) {
    return [...remaining].sort(
      (a, b) => actor.mapStats[b].winRate - actor.mapStats[a].winRate
    )[0];
  }
  return remaining[0];
}

export function simulateVeto(
  nameA: string,
  nameB: string,
  profileA: TeamProfile | null,
  profileB: TeamProfile | null,
  format: string,
): VetoSimulation {
  const remaining: MapName[] = [...ALL_MAPS];
  const sequence: string[] = [];
  const pool: MapName[] = [];
  const pickSrc: ("teamA" | "teamB")[] = [];

  const steps = getVetoSteps(format);

  for (const step of steps) {
    const actor = step.team === "A" ? profileA : profileB;
    const actorName = step.team === "A" ? nameA : nameB;

    if (step.action === "ban") {
      const map = bestBan(actor, remaining);
      remaining.splice(remaining.indexOf(map), 1);
      sequence.push(`${actorName} bans ${map}`);
    } else {
      const map = bestPick(actor, remaining);
      remaining.splice(remaining.indexOf(map), 1);
      pool.push(map);
      pickSrc.push(step.team === "A" ? "teamA" : "teamB");
      sequence.push(`${actorName} picks ${map}`);
    }
  }

  // Last remaining map is the decider
  if (remaining.length > 0) {
    pool.push(remaining[0]);
    pickSrc.push("decider" as never);
    sequence.push(`Decider: ${remaining[0]}`);
  }

  const hasData = (profileA !== null ? 1 : 0) + (profileB !== null ? 1 : 0);
  const confidence = hasData === 2 ? 74 : hasData === 1 ? 52 : 38;

  return { sequence, expectedMaps: pool, confidence };
}

// ─── 3. Map Advantage (30%) ────────────────────────────────────

function calcMapAdvantage(
  profileA: TeamProfile | null,
  profileB: TeamProfile | null,
  maps: MapName[],
): { scoreA: number; scoreB: number; mapPredictions: MapPrediction[]; runsOULine: number } {
  const mapPredictions: MapPrediction[] = [];
  let totalCompetitiveness = 0;

  if (!maps.length) {
    return { scoreA: 0.5, scoreB: 0.5, mapPredictions: [], runsOULine: 24.5 };
  }

  const probs: number[] = [];

  for (let i = 0; i < maps.length; i++) {
    const m = maps[i];
    const wrA = profileA?.mapStats[m].winRate ?? 50;
    const wrB = profileB?.mapStats[m].winRate ?? 50;
    const probA = wrA / (wrA + wrB);
    probs.push(probA);

    const avgDiff = Math.abs(profileA?.mapStats[m].avgRoundDiff ?? 0);
    const competitiveness = clamp(1 - avgDiff / 8, 0, 1);
    totalCompetitiveness += competitiveness;
    const predictedRounds = Math.round(20 + competitiveness * 8);

    const likelyPick: "teamA" | "teamB" | "decider" =
      i === maps.length - 1 ? "decider" : i % 2 === 0 ? "teamA" : "teamB";

    mapPredictions.push({
      mapName: m,
      teamAWinPct: Math.round(probA * 100),
      teamBWinPct: 100 - Math.round(probA * 100),
      predictedRounds,
      likelyPick,
    });
  }

  const avgProb = probs.reduce((a, b) => a + b, 0) / probs.length;
  const avgComp = totalCompetitiveness / maps.length;
  const ouLine = Math.round((20 + avgComp * 8) * 2) / 2; // snap to .5

  return {
    scoreA: clamp(avgProb, 0.15, 0.85),
    scoreB: clamp(1 - avgProb, 0.15, 0.85),
    mapPredictions,
    runsOULine: ouLine,
  };
}

// ─── 4. Player Impact (20%) ────────────────────────────────────

function calcPlayerImpact(
  profileA: TeamProfile | null,
  profileB: TeamProfile | null,
): {
  scoreA: number; scoreB: number;
  starA: StarPlayer | null; starB: StarPlayer | null;
} {
  if (!profileA && !profileB) return { scoreA: 0.5, scoreB: 0.5, starA: null, starB: null };

  function teamScore(p: TeamProfile | null): number {
    if (!p) return 0.5;
    const avgRating = p.players.reduce((s, pl) => s + pl.rating, 0) / p.players.length;
    const avgADR    = p.players.reduce((s, pl) => s + pl.adr, 0)    / p.players.length;
    const ratingScore = clamp((avgRating - 1.0) / 0.40, 0, 1);
    const adrScore    = clamp((avgADR - 60) / 40, 0, 1);
    return ratingScore * 0.70 + adrScore * 0.30;
  }

  function starPlayer(p: TeamProfile | null): StarPlayer | null {
    if (!p || !p.players.length) return null;
    const star = [...p.players].sort((a, b) => b.rating - a.rating)[0];
    return { name: star.name, rating: star.rating, role: star.role };
  }

  const sA = teamScore(profileA);
  const sB = teamScore(profileB);
  const total = sA + sB;

  return {
    scoreA: clamp(sA / total, 0.2, 0.8),
    scoreB: clamp(sB / total, 0.2, 0.8),
    starA: starPlayer(profileA),
    starB: starPlayer(profileB),
  };
}

// ─── 5. Recent Form (10%) ──────────────────────────────────────

function calcRecentForm(
  profile: TeamProfile | null,
  fallbackForm: ("W" | "L")[],
): number {
  const results = profile?.recentResults ?? fallbackForm;
  if (!results.length) return 0.5;

  const weights = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];
  let score = 0;
  let totalW = 0;

  for (let i = 0; i < Math.min(results.length, weights.length); i++) {
    score  += weights[i] * (results[i] === "W" ? 1 : 0);
    totalW += weights[i];
  }

  return clamp(score / totalW, 0.1, 0.9);
}

// ─── 6. H2H + Context (10%) ───────────────────────────────────

function calcH2HContext(
  profileA: TeamProfile | null,
  profileB: TeamProfile | null,
  nameB: string,
  isPlayoffs: boolean,
  isGroupStage: boolean,
): { scoreA: number; scoreB: number; h2hSample: number } {
  let h2hScore = 0.5;
  let sample = 0;

  if (profileA?.h2h?.[nameB]) {
    const { wins, losses } = profileA.h2h[nameB]!;
    sample = wins + losses;
    if (sample > 0) h2hScore = wins / sample;
  }

  // Tournament context bonuses
  let bonus = 0;
  if (isPlayoffs && profileA?.tournamentContext.strongInPlayoffs) bonus += 0.04;
  if (isGroupStage && profileA?.tournamentContext.strongInGroup)  bonus += 0.03;
  if (isPlayoffs && profileA?.tournamentContext.strongInPlayoffs === false) bonus -= 0.03;

  return {
    scoreA: clamp(h2hScore + bonus, 0.1, 0.9),
    scoreB: clamp(1 - h2hScore - bonus, 0.1, 0.9),
    h2hSample: sample,
  };
}

// ─── Rounds O/U ────────────────────────────────────────────────

function predictRoundsOU(
  line: number,
  avgComp: number,
): { line: number; rec: "over" | "under"; conf: number } {
  const rec = avgComp >= 0.55 ? "over" : "under";
  const spread = Math.abs(line - 24.5);
  const conf = clamp(50 + spread * 4 + avgComp * 15, 50, 82);
  return { line, rec, conf: Math.round(conf) };
}

// ─── EV calculation ────────────────────────────────────────────

function calcEV(modelProbPct: number, decimalOdds: number): number {
  const p = modelProbPct / 100;
  const ev = p * (decimalOdds - 1) - (1 - p);
  return Math.round(ev * 1000) / 10; // as %
}

// ─── Risk level ────────────────────────────────────────────────

function getRiskLevel(
  confidence: number,
  h2hSample: number,
  hasProfiles: boolean,
): "LOW" | "MEDIUM" | "HIGH" {
  if (confidence >= 70 && h2hSample >= 5 && hasProfiles) return "LOW";
  if (confidence >= 55 || h2hSample >= 3)                return "MEDIUM";
  return "HIGH";
}

// ─── Best bet string ───────────────────────────────────────────

function buildBestBet(
  winnerName: string,
  winnerPct: number,
  ou: { line: number; rec: "over" | "under"; conf: number } | undefined,
  confidence: number,
  ev: number,
): string {
  if (winnerPct >= 68 && confidence >= 65 && ev >= 5) {
    return `Тоглоомын ялагч: ${winnerName} (${winnerPct}% • EV +${ev.toFixed(1)}%)`;
  }
  if (ou && ou.conf >= 68 && ou.conf > confidence) {
    const label = ou.rec === "over" ? "Дээш" : "Доош";
    return `Раунд тоо ${label} ${ou.line} (${ou.conf}% итгэлтэй)`;
  }
  if (winnerPct >= 60 && confidence >= 58) {
    return `Тоглоомын ялагч: ${winnerName} — дунд зэргийн итгэлтэй`;
  }
  return "Тодорхой давуу байдал байхгүй — тоглоомыг хянаарай";
}

// ─── Confidence calculation ────────────────────────────────────

function calcConfidence(
  rawA: number,
  rawB: number,
  hasProfileA: boolean,
  hasProfileB: boolean,
): number {
  const spread = Math.abs(rawA - rawB);
  const profileBonus = hasProfileA && hasProfileB ? 14 : hasProfileA || hasProfileB ? 6 : 0;
  return clamp(Math.round(46 + spread * 80 + profileBonus), 45, 92);
}

// ─── Main prediction function ──────────────────────────────────

export function runFullPrediction(
  teamAName: string,
  teamBName: string,
  format: string,
  event: string,
): EnhancedPrediction {
  const profileA = getTeamProfile(teamAName);
  const profileB = getTeamProfile(teamBName);

  // Rank lookup from HLTV_TOP30
  const rankDataA = HLTV_TOP30.find(t => t.name.toLowerCase() === teamAName.toLowerCase());
  const rankDataB = HLTV_TOP30.find(t => t.name.toLowerCase() === teamBName.toLowerCase());
  const rankA = rankDataA?.rank ?? 25;
  const rankB = rankDataB?.rank ?? 25;

  // Detect context from event name
  const eventLower = event.toLowerCase();
  const isLAN = eventLower.includes("iem") || eventLower.includes("esl") || eventLower.includes("blast") || eventLower.includes("major");
  const isPlayoffs = eventLower.includes("playoff") || eventLower.includes("semi") || eventLower.includes("final") || eventLower.includes("quarter");
  const isGroupStage = eventLower.includes("group") || (!isPlayoffs);

  // ─ Component scores ──────────────────────────────────────────
  const strength  = calcTeamStrength(profileA, profileB, rankA, rankB, isLAN);
  const veto      = simulateVeto(teamAName, teamBName, profileA, profileB, format);
  const mapAdv    = calcMapAdvantage(profileA, profileB, veto.expectedMaps);
  const playerImp = calcPlayerImpact(profileA, profileB);
  const formA     = calcRecentForm(profileA, rankDataA?.winRate ? [] : []);
  const formB     = calcRecentForm(profileB, rankDataB?.winRate ? [] : []);
  const h2h       = calcH2HContext(profileA, profileB, teamBName, isPlayoffs, isGroupStage);

  // Normalise form to [0,1] pair
  const formTotal = formA + formB;
  const formScoreA = formTotal > 0 ? formA / formTotal : 0.5;
  const formScoreB = 1 - formScoreA;

  // ─ Weighted aggregation ──────────────────────────────────────
  const rawA =
    strength.scoreA  * 0.30 +
    mapAdv.scoreA    * 0.30 +
    playerImp.scoreA * 0.20 +
    formScoreA       * 0.10 +
    h2h.scoreA       * 0.10;

  const rawB =
    strength.scoreB  * 0.30 +
    mapAdv.scoreB    * 0.30 +
    playerImp.scoreB * 0.20 +
    formScoreB       * 0.10 +
    h2h.scoreB       * 0.10;

  const total = rawA + rawB;
  const teamAWinPct = Math.round((rawA / total) * 100);
  const teamBWinPct = 100 - teamAWinPct;
  const winner: "teamA" | "teamB" = teamAWinPct >= 50 ? "teamA" : "teamB";
  const winnerName = winner === "teamA" ? teamAName : teamBName;
  const winnerPct  = winner === "teamA" ? teamAWinPct : teamBWinPct;

  const hasPA = profileA !== null;
  const hasPA2 = profileB !== null;
  const confidence = calcConfidence(rawA, rawB, hasPA, hasPA2);

  // Scale component scores to 0-100 for display
  const breakdown: ModelBreakdown = {
    teamStrengthA:  Math.round(strength.scoreA  * 100),
    teamStrengthB:  Math.round(strength.scoreB  * 100),
    mapAdvantageA:  Math.round(mapAdv.scoreA    * 100),
    mapAdvantageB:  Math.round(mapAdv.scoreB    * 100),
    playerImpactA:  Math.round(playerImp.scoreA * 100),
    playerImpactB:  Math.round(playerImp.scoreB * 100),
    recentFormA:    Math.round(formScoreA       * 100),
    recentFormB:    Math.round(formScoreB       * 100),
    h2hA:           Math.round(h2h.scoreA       * 100),
    h2hB:           Math.round(h2h.scoreB       * 100),
  };

  // Rounds O/U
  const avgComp = mapAdv.mapPredictions.reduce(
    (s, m) => s + (1 - Math.abs(m.teamAWinPct - 50) / 50), 0,
  ) / Math.max(mapAdv.mapPredictions.length, 1);
  const ou = predictRoundsOU(mapAdv.runsOULine, avgComp);

  // EV (use model vs implied odds from rank)
  const impliedOddsA = 1 + (rankB / (rankA + rankB)) * 2.5; // rough bookmaker model
  const ev = calcEV(teamAWinPct, impliedOddsA);

  const oddsA = oddsFromProb(teamAWinPct);
  const oddsB = oddsFromProb(teamBWinPct);

  const riskLevel = getRiskLevel(confidence, h2h.h2hSample, hasPA && hasPA2);

  const ou2 = ou;
  const bestBet = buildBestBet(winnerName, winnerPct, ou2, confidence, ev);

  // Key factors (Mongolian)
  const keyFactors: string[] = [
    rankDataA ? `${teamAName} дэлхийн рейтингт #${rankA}-д байна` : `${teamAName} тоглоомд оролцож байна`,
    rankDataB ? `${teamBName} дэлхийн рейтингт #${rankB}-д байна` : `${teamBName} тоглоомд оролцож байна`,
    ...(hasPA && hasPA2 ? [
      `Газрын давуу байдал: ${veto.expectedMaps.join(", ")}`,
      `Ялагдашгүй орчин: ${isLAN ? "LAN турнир" : "Online тэмцэл"}`,
    ] : []),
    ...(Math.abs(rankA - rankB) < 4
      ? ["Тэнцүү тэмцэл болно"]
      : [`${rankA < rankB ? teamAName : teamBName} рейтингийн давуу байдалтай`]),
  ];

  return {
    teamAWinPct,
    teamBWinPct,
    confidence,
    winner,
    keyFactors,
    oddsA,
    oddsB,
    modelBreakdown: breakdown,
    mapPredictions: mapAdv.mapPredictions,
    vetoSimulation: veto,
    roundsOverUnder: ou2,
    ev,
    riskLevel,
    bestBet,
    starPlayerA: playerImp.starA ?? undefined,
    starPlayerB: playerImp.starB ?? undefined,
  };
}
