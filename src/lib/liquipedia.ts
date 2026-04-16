/**
 * Liquipedia CS2 match scraper
 * Uses the MediaWiki parse API — no Cloudflare, publicly accessible
 * Endpoint: https://liquipedia.net/counterstrike/api.php?action=parse&page=Liquipedia:Matches
 */

import type { MatchData } from "@/app/(dashboard)/dashboard/predictions/predictions-client";
import { HLTV_TOP30 } from "@/lib/cs2-rankings";
import { runFullPrediction } from "@/lib/cs2-prediction-engine";

// ─── Types ─────────────────────────────────────────────────────

export interface LiquipediaMatch {
  teamA: string;
  teamB: string;
  startTime: string; // ISO
  format: string;    // "BO1" | "BO3" | "BO5"
  event: string;
  timestamp: number; // unix ms
}

// ─── Team logo/rank lookup from static HLTV data ───────────────

const TEAM_LOOKUP = new Map(
  HLTV_TOP30.map(t => [t.name.toLowerCase(), t])
);

// Common Liquipedia name variants → canonical HLTV name
const NAME_ALIASES: Record<string, string> = {
  "natus vincere":      "NAVI",
  "navi":               "NAVI",
  "team vitality":      "Vitality",
  "team spirit":        "Spirit",
  "faze clan":          "FaZe",
  "faze":               "FaZe",
  "g2 esports":         "G2",
  "g2":                 "G2",
  "team liquid":        "Liquid",
  "heroic":             "Heroic",
  "cloud9":             "Cloud9",
  "aurora gaming":      "Aurora",
  "aurora":             "Aurora",
  "monte":              "MONTE",
  "ence":               "ENCE",
  "3dmax":              "3DMAX",
  "big":                "BIG",
  "mouz":               "MOUZ",
  "mousesports":        "MOUZ",
  "virtus.pro":         "Virtus.pro",
  "virtus pro":         "Virtus.pro",
  "9 pandas":           "9 Pandas",
  "9pandas":            "9 Pandas",
  "komplexity":         "Complexity",
  "complexity gaming":  "Complexity",
  "team falcons":       "Falcons",
  "falcons":            "Falcons",
  "eternal fire":       "Eternal Fire",
  "imperial esports":   "Imperial",
  "imperial":           "Imperial",
  "b8":                 "B8",
  "hotu":               "HOTU",
  "pari match talks":   "paiN",
  "pain gaming":        "paiN",
  "pain":               "paiN",
  "amkal":              "AMKAL",
  "og":                 "OG",
  "fluxo":              "Fluxo",
  "apeks":              "Apeks",
};

function resolveTeam(rawName: string) {
  const lower = rawName.toLowerCase().trim();
  const canonical = NAME_ALIASES[lower] ?? rawName;
  const hltvTeam = TEAM_LOOKUP.get(canonical.toLowerCase());
  return {
    name: canonical,
    hltvData: hltvTeam ?? null,
  };
}

// ─── Win probability from rankings ────────────────────────────

function predictFromRanks(rankA: number | null, rankB: number | null) {
  const rA = rankA ?? 31;
  const rB = rankB ?? 31;
  const scoreA = 1 / rA;
  const scoreB = 1 / rB;
  const total = scoreA + scoreB;
  const pctA = Math.round((scoreA / total) * 100);
  const diff = Math.abs(rA - rB);
  const confidence = Math.min(82, 50 + diff * 2);
  return { pctA, confidence };
}

function planRequired(index: number): "free" | "pro" | "vip" {
  if (index < 3) return "free";
  if (index < 7) return "pro";
  return "vip";
}

// ─── HTML parser ───────────────────────────────────────────────

function parseMatchesFromHtml(html: string, daysAhead: number): LiquipediaMatch[] {
  const now = Date.now();
  const cutoff = now + daysAhead * 86_400_000;
  const results: LiquipediaMatch[] = [];

  // Split ONLY on top-level <div class="match-info"> (exact class, not match-info-header etc.)
  const blocks = html.split('<div class="match-info">');
  blocks.shift(); // drop everything before first match

  for (const block of blocks) {
    // --- Timestamp (inside <span class="timer-object" data-timestamp="...">) ---
    const tsMatch = block.match(/data-timestamp="(\d{9,11})"/);
    if (!tsMatch) continue;
    const tsSeconds = parseInt(tsMatch[1], 10);
    const tsMs = tsSeconds * 1000;

    // Skip past or too-far-future matches
    if (tsMs < now - 3 * 3600_000) continue; // allow 3h buffer for live
    if (tsMs > cutoff) continue;

    // --- Team names (two <span class="name"> per match) ---
    // Teams with known pages: <span class="name" ...><a ...>DISPLAY</a></span>
    // TBD teams:              <span class="name" ...>TBD</span>  (no anchor)
    const nameMatches = [...block.matchAll(/<span class="name"[^>]*><a[^>]*>([^<]+)<\/a><\/span>/g)];
    // Skip this match if either team is TBD (not enough confirmed names)
    if (nameMatches.length < 2) continue;
    const teamA = nameMatches[0][1].trim();
    const teamB = nameMatches[1][1].trim();
    if (!teamA || !teamB || teamA === "TBD" || teamB === "TBD") continue;

    // --- Format (Bo1 / Bo3 / Bo5) ---
    const boMatch = block.match(/\(Bo(\d)\)/i);
    const format = boMatch ? `BO${boMatch[1]}` : "BO3";

    // --- Event name: from title attribute of tournament link ---
    // e.g. title="Intel Extreme Masters/2026/Rio#Group B" → "IEM Rio 2026"
    let event = "CS2 Match";
    const evTitleMatch = block.match(/match-info-tournament[\s\S]*?title="([^"]+)"/);
    if (evTitleMatch) {
      // "Intel Extreme Masters/2026/Rio#Group B" → "Intel Extreme Masters Rio 2026"
      const raw = evTitleMatch[1].replace(/#[^"]*$/, ""); // strip #fragment
      const parts = raw.split("/").map(s => s.trim()).filter(Boolean);
      // Reconstruct: "Tournament 2026 Location" or just join sensibly
      if (parts.length >= 3) {
        event = `${parts[0]} ${parts[2]} ${parts[1]}`; // e.g. "Intel Extreme Masters Rio 2026"
      } else if (parts.length === 2) {
        event = `${parts[0]} ${parts[1]}`;
      } else {
        event = parts[0];
      }
    }

    results.push({
      teamA,
      teamB,
      startTime: new Date(tsMs).toISOString(),
      format,
      event,
      timestamp: tsMs,
    });
  }

  // Sort by time
  results.sort((a, b) => a.timestamp - b.timestamp);
  return results;
}

// ─── Convert to MatchData ──────────────────────────────────────

function toMatchData(lm: LiquipediaMatch, index: number): MatchData {
  const tA = resolveTeam(lm.teamA);
  const tB = resolveTeam(lm.teamB);

  const rankA = tA.hltvData?.rank ?? null;
  const rankB = tB.hltvData?.rank ?? null;
  const winRateA = tA.hltvData?.winRate ?? 50;
  const winRateB = tB.hltvData?.winRate ?? 50;
  const playersA = tA.hltvData?.players ?? [];
  const playersB = tB.hltvData?.players ?? [];

  // Run full AI prediction engine (sync, server-only)
  let prediction: MatchData["prediction"];
  try {
    prediction = runFullPrediction(tA.name, tB.name, lm.format, lm.event);
  } catch {
    // Fallback to rank-only if engine errors
    const { pctA, confidence } = predictFromRanks(rankA, rankB);
    prediction = {
      teamAWinPct: pctA,
      teamBWinPct: 100 - pctA,
      confidence,
      winner: pctA >= 50 ? "teamA" : "teamB",
      keyFactors: [
        rankA ? `${tA.name} дэлхийн рейтингт #${rankA}-д байна` : `${tA.name} тоглоомд оролцож байна`,
        rankB ? `${tB.name} дэлхийн рейтингт #${rankB}-д байна` : `${tB.name} тоглоомд оролцож байна`,
      ],
      oddsA: Math.round((100 / Math.max(pctA, 1)) * 100) / 100,
      oddsB: Math.round((100 / Math.max(100 - pctA, 1)) * 100) / 100,
    };
  }

  return {
    id: lm.timestamp + index,
    teamA: {
      name: tA.name,
      acronym: tA.name.slice(0, 4).toUpperCase(),
      imageUrl: tA.hltvData?.logoUrl ?? null,
      region: tA.hltvData?.region ?? "EU",
      winRate: winRateA,
      recentForm: [],
      players: playersA,
    },
    teamB: {
      name: tB.name,
      acronym: tB.name.slice(0, 4).toUpperCase(),
      imageUrl: tB.hltvData?.logoUrl ?? null,
      region: tB.hltvData?.region ?? "EU",
      winRate: winRateB,
      recentForm: [],
      players: playersB,
    },
    league: lm.event,
    serie: rankA && rankB ? `#${rankA} vs #${rankB}` : "",
    startTime: lm.startTime,
    format: lm.format,
    isLive: lm.timestamp < Date.now() + 300_000 && lm.timestamp > Date.now() - 3 * 3600_000,
    planReq: planRequired(index),
    prediction,
  };
}

// ─── Main export ───────────────────────────────────────────────

/**
 * Fetch real CS2 matches from Liquipedia (mirrors HLTV match schedule).
 * Returns up to `limit` upcoming matches within `daysAhead` days.
 * 5-minute cache via Next.js fetch revalidation.
 */
export async function getLiquipediaMatches(
  daysAhead = 14,
  limit = 25,
): Promise<MatchData[]> {
  const url =
    "https://liquipedia.net/counterstrike/api.php?" +
    new URLSearchParams({
      action: "parse",
      page: "Liquipedia:Matches",
      prop: "text",
      format: "json",
    });

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "CS2IntelPro/1.0 (educational; contact: admin@cs2intelpro.com)",
      Accept: "application/json",
    },
    // No cache — page is force-dynamic, always fetch fresh data
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Liquipedia API error: ${res.status}`);
  }

  const json = await res.json();
  const html: string = json?.parse?.text?.["*"] ?? "";

  if (!html) {
    throw new Error("Liquipedia: empty parse result");
  }

  const raw = parseMatchesFromHtml(html, daysAhead);

  // Deduplicate by team pair + day (same match can appear in multiple sections)
  const seen = new Set<string>();
  const deduped = raw.filter(m => {
    const key = `${m.teamA.toLowerCase()}|${m.teamB.toLowerCase()}|${m.startTime.slice(0, 13)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return deduped.slice(0, limit).map((m, i) => toMatchData(m, i));
}
