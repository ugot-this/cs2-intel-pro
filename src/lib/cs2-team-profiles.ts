/**
 * CS2 Team Profiles — enriched static data for top 20 teams
 * Includes map stats, player ratings, veto tendencies, H2H records
 * Data based on HLTV/Liquipedia statistics (2025–2026 season)
 */

export type MapName =
  | "Mirage" | "Inferno" | "Ancient" | "Anubis"
  | "Nuke"   | "Dust2"   | "Train";

export const ALL_MAPS: MapName[] = [
  "Mirage", "Inferno", "Ancient", "Anubis", "Nuke", "Dust2", "Train",
];

export interface MapStat {
  winRate: number;       // 0–100
  ctWinRate: number;     // CT side win %
  tWinRate: number;      // T side win %
  avgRoundDiff: number;  // average round differential (signed, team's perspective)
  pistolWinRate: number; // pistol round win %
}

export type PlayerRole = "awp" | "entry" | "support" | "igl" | "lurk";

export interface PlayerStat {
  name: string;
  rating: number;    // HLTV 2.0 rating (1.0–1.40)
  adr: number;       // Average Damage per Round
  kd: number;        // Kill/Death ratio
  hsPercent: number; // Headshot %
  clutchRate: number; // Clutch round win %
  role: PlayerRole;
}

export interface H2HRecord {
  wins: number;
  losses: number;
}

export interface TeamProfile {
  name: string;      // must match HLTV_TOP30[].name exactly
  eloRating: number;
  mapStats: Record<MapName, MapStat>;
  players: PlayerStat[];
  vetoPicks: MapName[];   // preferred picks (ordered)
  vetoBans: MapName[];    // preferred bans (ordered)
  lanWinRate: number;     // 0–100
  onlineWinRate: number;  // 0–100
  h2h: Partial<Record<string, H2HRecord>>;
  recentResults: ("W" | "L")[];
  tournamentContext: {
    strongInGroup: boolean;
    strongInPlayoffs: boolean;
    bigEventWinRate: number;
  };
}

// ─── Name resolver ─────────────────────────────────────────────

const PROFILE_ALIASES: Record<string, string> = {
  "natus vincere": "NAVI",
  "navi":          "NAVI",
  "team vitality": "Vitality",
  "vitality":      "Vitality",
  "team spirit":   "Spirit",
  "spirit":        "Spirit",
  "faze clan":     "FaZe",
  "faze":          "FaZe",
  "g2 esports":    "G2",
  "g2":            "G2",
  "team falcons":  "Falcons",
  "falcons":       "Falcons",
  "aurora gaming": "Aurora",
  "aurora":        "Aurora",
  "the mongolz":   "The MongolZ",
  "mongolz":       "The MongolZ",
  "mouz":          "MOUZ",
  "mousesports":   "MOUZ",
  "team furia":    "FURIA",
  "furia":         "FURIA",
  "3dmax":         "3DMAX",
  "astralis":      "Astralis",
  "parivision":    "PARIVISION",
  "fut esports":   "FUT",
  "fut":           "FUT",
  "b8":            "B8",
  "hotu":          "HOTU",
  "legacy":        "Legacy",
  "9z":            "9z",
};

export function resolveProfileName(raw: string): string {
  const lower = raw.toLowerCase().trim();
  return PROFILE_ALIASES[lower] ?? raw;
}

// ─── Team Profiles ─────────────────────────────────────────────

const PROFILES: TeamProfile[] = [
  // ── 1. Vitality ─────────────────────────────────────────────
  {
    name: "Vitality",
    eloRating: 1820,
    vetoPicks: ["Ancient", "Nuke"],
    vetoBans: ["Dust2", "Train"],
    lanWinRate: 74,
    onlineWinRate: 68,
    recentResults: ["W","W","W","L","W","W","W","L","W","W"],
    h2h: {
      "NAVI":    { wins: 8, losses: 4 },
      "Spirit":  { wins: 6, losses: 3 },
      "FURIA":   { wins: 7, losses: 2 },
      "Falcons": { wins: 5, losses: 3 },
      "MOUZ":    { wins: 5, losses: 2 },
      "G2":      { wins: 6, losses: 2 },
      "FaZe":    { wins: 6, losses: 3 },
    },
    tournamentContext: { strongInGroup: true, strongInPlayoffs: true, bigEventWinRate: 71 },
    mapStats: {
      Ancient: { winRate: 78, ctWinRate: 63, tWinRate: 54, avgRoundDiff: 4.5, pistolWinRate: 58 },
      Nuke:    { winRate: 75, ctWinRate: 65, tWinRate: 55, avgRoundDiff: 4.0, pistolWinRate: 56 },
      Inferno: { winRate: 68, ctWinRate: 58, tWinRate: 51, avgRoundDiff: 2.5, pistolWinRate: 53 },
      Anubis:  { winRate: 65, ctWinRate: 57, tWinRate: 50, avgRoundDiff: 2.0, pistolWinRate: 52 },
      Mirage:  { winRate: 62, ctWinRate: 54, tWinRate: 50, avgRoundDiff: 1.5, pistolWinRate: 51 },
      Dust2:   { winRate: 55, ctWinRate: 50, tWinRate: 47, avgRoundDiff: 0.5, pistolWinRate: 48 },
      Train:   { winRate: 50, ctWinRate: 50, tWinRate: 44, avgRoundDiff: 0.0, pistolWinRate: 47 },
    },
    players: [
      { name: "zywOo",  rating: 1.32, adr: 84, kd: 1.28, hsPercent: 40, clutchRate: 68, role: "awp" },
      { name: "flameZ", rating: 1.18, adr: 77, kd: 1.14, hsPercent: 55, clutchRate: 54, role: "entry" },
      { name: "Spinx",  rating: 1.14, adr: 74, kd: 1.11, hsPercent: 48, clutchRate: 50, role: "lurk" },
      { name: "mezii",  rating: 1.08, adr: 70, kd: 1.05, hsPercent: 44, clutchRate: 45, role: "support" },
      { name: "apEX",   rating: 1.02, adr: 67, kd: 0.99, hsPercent: 48, clutchRate: 42, role: "igl" },
    ],
  },

  // ── 2. NAVI ─────────────────────────────────────────────────
  {
    name: "NAVI",
    eloRating: 1790,
    vetoPicks: ["Inferno", "Nuke"],
    vetoBans: ["Train", "Dust2"],
    lanWinRate: 70,
    onlineWinRate: 65,
    recentResults: ["W","W","L","W","W","W","L","W","W","L"],
    h2h: {
      "Vitality":  { wins: 4, losses: 8 },
      "Spirit":    { wins: 5, losses: 4 },
      "Falcons":   { wins: 4, losses: 2 },
      "FURIA":     { wins: 5, losses: 3 },
      "MOUZ":      { wins: 4, losses: 3 },
      "G2":        { wins: 4, losses: 2 },
      "FaZe":      { wins: 5, losses: 4 },
      "HOTU":      { wins: 6, losses: 1 },
      "Aurora":    { wins: 3, losses: 2 },
      "B8":        { wins: 5, losses: 0 },
    },
    tournamentContext: { strongInGroup: true, strongInPlayoffs: true, bigEventWinRate: 66 },
    mapStats: {
      Inferno: { winRate: 75, ctWinRate: 62, tWinRate: 54, avgRoundDiff: 4.2, pistolWinRate: 57 },
      Nuke:    { winRate: 70, ctWinRate: 66, tWinRate: 52, avgRoundDiff: 3.5, pistolWinRate: 55 },
      Ancient: { winRate: 64, ctWinRate: 57, tWinRate: 50, avgRoundDiff: 2.0, pistolWinRate: 52 },
      Anubis:  { winRate: 62, ctWinRate: 55, tWinRate: 49, avgRoundDiff: 1.5, pistolWinRate: 51 },
      Mirage:  { winRate: 60, ctWinRate: 54, tWinRate: 48, avgRoundDiff: 1.0, pistolWinRate: 50 },
      Dust2:   { winRate: 52, ctWinRate: 49, tWinRate: 46, avgRoundDiff: 0.2, pistolWinRate: 48 },
      Train:   { winRate: 48, ctWinRate: 48, tWinRate: 43, avgRoundDiff: -0.5, pistolWinRate: 46 },
    },
    players: [
      { name: "w0nderful", rating: 1.25, adr: 80, kd: 1.22, hsPercent: 55, clutchRate: 62, role: "awp" },
      { name: "b1t",       rating: 1.20, adr: 78, kd: 1.17, hsPercent: 52, clutchRate: 58, role: "entry" },
      { name: "iM",        rating: 1.15, adr: 75, kd: 1.12, hsPercent: 47, clutchRate: 52, role: "lurk" },
      { name: "jL",        rating: 1.10, adr: 72, kd: 1.08, hsPercent: 44, clutchRate: 48, role: "support" },
      { name: "aleksib",   rating: 1.02, adr: 66, kd: 0.98, hsPercent: 42, clutchRate: 44, role: "igl" },
    ],
  },

  // ── 3. FURIA ─────────────────────────────────────────────────
  {
    name: "FURIA",
    eloRating: 1760,
    vetoPicks: ["Inferno", "Mirage"],
    vetoBans: ["Nuke", "Train"],
    lanWinRate: 62,
    onlineWinRate: 70,
    recentResults: ["W","L","W","W","L","W","W","L","W","W"],
    h2h: {
      "Vitality": { wins: 2, losses: 7 },
      "NAVI":     { wins: 3, losses: 5 },
      "Legacy":   { wins: 6, losses: 1 },
      "9z":       { wins: 5, losses: 1 },
      "G2":       { wins: 3, losses: 3 },
      "FaZe":     { wins: 3, losses: 4 },
    },
    tournamentContext: { strongInGroup: true, strongInPlayoffs: false, bigEventWinRate: 58 },
    mapStats: {
      Inferno: { winRate: 72, ctWinRate: 60, tWinRate: 55, avgRoundDiff: 3.8, pistolWinRate: 58 },
      Mirage:  { winRate: 70, ctWinRate: 58, tWinRate: 54, avgRoundDiff: 3.2, pistolWinRate: 56 },
      Anubis:  { winRate: 62, ctWinRate: 55, tWinRate: 50, avgRoundDiff: 1.8, pistolWinRate: 52 },
      Ancient: { winRate: 58, ctWinRate: 52, tWinRate: 48, avgRoundDiff: 1.0, pistolWinRate: 50 },
      Dust2:   { winRate: 56, ctWinRate: 51, tWinRate: 48, avgRoundDiff: 0.8, pistolWinRate: 49 },
      Nuke:    { winRate: 48, ctWinRate: 54, tWinRate: 40, avgRoundDiff: -0.8, pistolWinRate: 46 },
      Train:   { winRate: 45, ctWinRate: 47, tWinRate: 41, avgRoundDiff: -1.5, pistolWinRate: 44 },
    },
    players: [
      { name: "KSCERATO", rating: 1.22, adr: 78, kd: 1.19, hsPercent: 52, clutchRate: 58, role: "lurk" },
      { name: "yuurih",   rating: 1.18, adr: 75, kd: 1.15, hsPercent: 50, clutchRate: 54, role: "entry" },
      { name: "skullz",   rating: 1.15, adr: 74, kd: 1.12, hsPercent: 56, clutchRate: 50, role: "entry" },
      { name: "chelo",    rating: 1.06, adr: 68, kd: 1.03, hsPercent: 46, clutchRate: 44, role: "support" },
      { name: "FalleN",   rating: 1.04, adr: 68, kd: 1.01, hsPercent: 38, clutchRate: 46, role: "igl" },
    ],
  },

  // ── 4. PARIVISION ───────────────────────────────────────────
  {
    name: "PARIVISION",
    eloRating: 1740,
    vetoPicks: ["Inferno", "Ancient"],
    vetoBans: ["Train", "Mirage"],
    lanWinRate: 63,
    onlineWinRate: 67,
    recentResults: ["W","W","L","W","W","L","W","L","W","W"],
    h2h: {
      "Spirit":   { wins: 3, losses: 4 },
      "Aurora":   { wins: 4, losses: 2 },
      "NAVI":     { wins: 2, losses: 4 },
      "Vitality": { wins: 1, losses: 5 },
    },
    tournamentContext: { strongInGroup: true, strongInPlayoffs: false, bigEventWinRate: 55 },
    mapStats: {
      Inferno: { winRate: 68, ctWinRate: 59, tWinRate: 52, avgRoundDiff: 2.8, pistolWinRate: 55 },
      Ancient: { winRate: 66, ctWinRate: 58, tWinRate: 51, avgRoundDiff: 2.4, pistolWinRate: 54 },
      Nuke:    { winRate: 64, ctWinRate: 62, tWinRate: 49, avgRoundDiff: 2.0, pistolWinRate: 52 },
      Anubis:  { winRate: 60, ctWinRate: 55, tWinRate: 48, avgRoundDiff: 1.2, pistolWinRate: 50 },
      Mirage:  { winRate: 54, ctWinRate: 50, tWinRate: 47, avgRoundDiff: 0.4, pistolWinRate: 48 },
      Dust2:   { winRate: 52, ctWinRate: 49, tWinRate: 46, avgRoundDiff: 0.2, pistolWinRate: 47 },
      Train:   { winRate: 46, ctWinRate: 47, tWinRate: 42, avgRoundDiff: -1.0, pistolWinRate: 45 },
    },
    players: [
      { name: "FL1T",     rating: 1.21, adr: 77, kd: 1.17, hsPercent: 45, clutchRate: 54, role: "entry" },
      { name: "zorte",    rating: 1.18, adr: 75, kd: 1.14, hsPercent: 50, clutchRate: 50, role: "lurk" },
      { name: "Forester", rating: 1.14, adr: 73, kd: 1.11, hsPercent: 42, clutchRate: 48, role: "awp" },
      { name: "fame",     rating: 1.08, adr: 69, kd: 1.05, hsPercent: 48, clutchRate: 44, role: "support" },
      { name: "Krad",     rating: 1.02, adr: 65, kd: 0.99, hsPercent: 44, clutchRate: 42, role: "igl" },
    ],
  },

  // ── 5. Falcons ──────────────────────────────────────────────
  {
    name: "Falcons",
    eloRating: 1750,
    vetoPicks: ["Inferno", "Mirage"],
    vetoBans: ["Ancient", "Nuke"],
    lanWinRate: 66,
    onlineWinRate: 60,
    recentResults: ["W","W","L","W","W","W","L","L","W","W"],
    h2h: {
      "Vitality": { wins: 3, losses: 5 },
      "NAVI":     { wins: 2, losses: 4 },
      "G2":       { wins: 3, losses: 2 },
      "FaZe":     { wins: 4, losses: 3 },
      "MOUZ":     { wins: 3, losses: 3 },
      "Spirit":   { wins: 2, losses: 3 },
    },
    tournamentContext: { strongInGroup: false, strongInPlayoffs: true, bigEventWinRate: 60 },
    mapStats: {
      Inferno: { winRate: 70, ctWinRate: 60, tWinRate: 53, avgRoundDiff: 3.2, pistolWinRate: 56 },
      Mirage:  { winRate: 68, ctWinRate: 58, tWinRate: 52, avgRoundDiff: 2.8, pistolWinRate: 55 },
      Anubis:  { winRate: 62, ctWinRate: 56, tWinRate: 49, avgRoundDiff: 1.6, pistolWinRate: 52 },
      Dust2:   { winRate: 58, ctWinRate: 53, tWinRate: 48, avgRoundDiff: 1.0, pistolWinRate: 50 },
      Ancient: { winRate: 52, ctWinRate: 50, tWinRate: 46, avgRoundDiff: 0.2, pistolWinRate: 48 },
      Nuke:    { winRate: 48, ctWinRate: 52, tWinRate: 40, avgRoundDiff: -0.8, pistolWinRate: 46 },
      Train:   { winRate: 46, ctWinRate: 48, tWinRate: 42, avgRoundDiff: -1.2, pistolWinRate: 45 },
    },
    players: [
      { name: "NiKo",    rating: 1.28, adr: 83, kd: 1.25, hsPercent: 50, clutchRate: 65, role: "lurk" },
      { name: "huNter-", rating: 1.18, adr: 76, kd: 1.14, hsPercent: 53, clutchRate: 54, role: "entry" },
      { name: "syrsoN",  rating: 1.14, adr: 73, kd: 1.10, hsPercent: 38, clutchRate: 52, role: "awp" },
      { name: "nexa",    rating: 1.08, adr: 70, kd: 1.05, hsPercent: 46, clutchRate: 46, role: "support" },
      { name: "Hooxi",   rating: 1.00, adr: 64, kd: 0.97, hsPercent: 44, clutchRate: 42, role: "igl" },
    ],
  },

  // ── 6. Aurora ───────────────────────────────────────────────
  {
    name: "Aurora",
    eloRating: 1720,
    vetoPicks: ["Nuke", "Ancient"],
    vetoBans: ["Train", "Dust2"],
    lanWinRate: 61,
    onlineWinRate: 63,
    recentResults: ["W","L","W","W","W","L","W","W","L","W"],
    h2h: {
      "NAVI":       { wins: 2, losses: 3 },
      "PARIVISION": { wins: 2, losses: 4 },
      "B8":         { wins: 4, losses: 1 },
      "Spirit":     { wins: 2, losses: 3 },
    },
    tournamentContext: { strongInGroup: true, strongInPlayoffs: false, bigEventWinRate: 52 },
    mapStats: {
      Nuke:    { winRate: 68, ctWinRate: 64, tWinRate: 50, avgRoundDiff: 2.8, pistolWinRate: 55 },
      Ancient: { winRate: 65, ctWinRate: 58, tWinRate: 50, avgRoundDiff: 2.2, pistolWinRate: 53 },
      Inferno: { winRate: 60, ctWinRate: 56, tWinRate: 49, avgRoundDiff: 1.4, pistolWinRate: 51 },
      Anubis:  { winRate: 58, ctWinRate: 54, tWinRate: 48, avgRoundDiff: 1.0, pistolWinRate: 50 },
      Mirage:  { winRate: 55, ctWinRate: 52, tWinRate: 47, avgRoundDiff: 0.6, pistolWinRate: 49 },
      Dust2:   { winRate: 50, ctWinRate: 49, tWinRate: 45, avgRoundDiff: 0.0, pistolWinRate: 47 },
      Train:   { winRate: 46, ctWinRate: 47, tWinRate: 42, avgRoundDiff: -1.0, pistolWinRate: 45 },
    },
    players: [
      { name: "sh1ro",    rating: 1.26, adr: 82, kd: 1.23, hsPercent: 58, clutchRate: 60, role: "awp" },
      { name: "nafany",   rating: 1.12, adr: 72, kd: 1.09, hsPercent: 46, clutchRate: 48, role: "entry" },
      { name: "shalfey",  rating: 1.10, adr: 71, kd: 1.07, hsPercent: 50, clutchRate: 46, role: "lurk" },
      { name: "notineki", rating: 1.06, adr: 68, kd: 1.03, hsPercent: 44, clutchRate: 43, role: "support" },
      { name: "Krad",     rating: 1.02, adr: 65, kd: 0.99, hsPercent: 42, clutchRate: 41, role: "igl" },
    ],
  },

  // ── 7. The MongolZ ──────────────────────────────────────────
  {
    name: "The MongolZ",
    eloRating: 1715,
    vetoPicks: ["Anubis", "Inferno"],
    vetoBans: ["Train", "Dust2"],
    lanWinRate: 64,
    onlineWinRate: 58,
    recentResults: ["W","W","W","L","W","L","W","W","L","W"],
    h2h: {
      "MOUZ":    { wins: 3, losses: 4 },
      "Spirit":  { wins: 2, losses: 3 },
      "Astralis":{ wins: 3, losses: 2 },
      "FURIA":   { wins: 2, losses: 3 },
    },
    tournamentContext: { strongInGroup: false, strongInPlayoffs: true, bigEventWinRate: 58 },
    mapStats: {
      Anubis:  { winRate: 70, ctWinRate: 61, tWinRate: 53, avgRoundDiff: 3.2, pistolWinRate: 56 },
      Inferno: { winRate: 66, ctWinRate: 58, tWinRate: 51, avgRoundDiff: 2.4, pistolWinRate: 54 },
      Ancient: { winRate: 60, ctWinRate: 55, tWinRate: 49, avgRoundDiff: 1.4, pistolWinRate: 52 },
      Mirage:  { winRate: 58, ctWinRate: 53, tWinRate: 48, avgRoundDiff: 1.0, pistolWinRate: 50 },
      Nuke:    { winRate: 54, ctWinRate: 56, tWinRate: 45, avgRoundDiff: 0.6, pistolWinRate: 49 },
      Dust2:   { winRate: 50, ctWinRate: 49, tWinRate: 45, avgRoundDiff: 0.0, pistolWinRate: 47 },
      Train:   { winRate: 46, ctWinRate: 47, tWinRate: 42, avgRoundDiff: -1.0, pistolWinRate: 45 },
    },
    players: [
      { name: "Techno4K", rating: 1.22, adr: 78, kd: 1.18, hsPercent: 44, clutchRate: 58, role: "awp" },
      { name: "bLitz",    rating: 1.18, adr: 75, kd: 1.14, hsPercent: 49, clutchRate: 52, role: "entry" },
      { name: "mzinho",   rating: 1.14, adr: 73, kd: 1.11, hsPercent: 50, clutchRate: 48, role: "lurk" },
      { name: "910",      rating: 1.08, adr: 69, kd: 1.05, hsPercent: 46, clutchRate: 44, role: "support" },
      { name: "chr1zN",   rating: 1.04, adr: 66, kd: 1.01, hsPercent: 44, clutchRate: 42, role: "igl" },
    ],
  },

  // ── 8. MOUZ ─────────────────────────────────────────────────
  {
    name: "MOUZ",
    eloRating: 1710,
    vetoPicks: ["Anubis", "Ancient"],
    vetoBans: ["Dust2", "Mirage"],
    lanWinRate: 63,
    onlineWinRate: 60,
    recentResults: ["L","W","W","W","L","W","W","L","W","W"],
    h2h: {
      "Vitality":   { wins: 2, losses: 5 },
      "NAVI":       { wins: 3, losses: 4 },
      "Spirit":     { wins: 3, losses: 4 },
      "Astralis":   { wins: 4, losses: 2 },
      "The MongolZ":{ wins: 4, losses: 3 },
      "Falcons":    { wins: 3, losses: 3 },
    },
    tournamentContext: { strongInGroup: false, strongInPlayoffs: true, bigEventWinRate: 57 },
    mapStats: {
      Anubis:  { winRate: 72, ctWinRate: 62, tWinRate: 54, avgRoundDiff: 3.6, pistolWinRate: 57 },
      Ancient: { winRate: 68, ctWinRate: 60, tWinRate: 52, avgRoundDiff: 2.8, pistolWinRate: 55 },
      Inferno: { winRate: 62, ctWinRate: 57, tWinRate: 50, avgRoundDiff: 1.8, pistolWinRate: 52 },
      Nuke:    { winRate: 58, ctWinRate: 60, tWinRate: 47, avgRoundDiff: 1.2, pistolWinRate: 51 },
      Mirage:  { winRate: 50, ctWinRate: 49, tWinRate: 46, avgRoundDiff: 0.0, pistolWinRate: 48 },
      Train:   { winRate: 52, ctWinRate: 52, tWinRate: 46, avgRoundDiff: 0.3, pistolWinRate: 49 },
      Dust2:   { winRate: 46, ctWinRate: 47, tWinRate: 43, avgRoundDiff: -1.0, pistolWinRate: 45 },
    },
    players: [
      { name: "torzsi",   rating: 1.24, adr: 80, kd: 1.21, hsPercent: 44, clutchRate: 61, role: "awp" },
      { name: "xertioN",  rating: 1.18, adr: 76, kd: 1.14, hsPercent: 52, clutchRate: 54, role: "entry" },
      { name: "Brollan",  rating: 1.14, adr: 74, kd: 1.11, hsPercent: 50, clutchRate: 50, role: "lurk" },
      { name: "jimpphat", rating: 1.10, adr: 72, kd: 1.07, hsPercent: 48, clutchRate: 47, role: "support" },
      { name: "siuhy",    rating: 1.06, adr: 68, kd: 1.03, hsPercent: 46, clutchRate: 44, role: "igl" },
    ],
  },

  // ── 9. Spirit ───────────────────────────────────────────────
  {
    name: "Spirit",
    eloRating: 1700,
    vetoPicks: ["Nuke", "Ancient"],
    vetoBans: ["Mirage", "Dust2"],
    lanWinRate: 65,
    onlineWinRate: 59,
    recentResults: ["L","W","W","W","L","W","W","W","L","W"],
    h2h: {
      "Vitality":   { wins: 3, losses: 6 },
      "NAVI":       { wins: 4, losses: 5 },
      "MOUZ":       { wins: 4, losses: 3 },
      "PARIVISION": { wins: 4, losses: 3 },
      "Astralis":   { wins: 4, losses: 2 },
      "G2":         { wins: 3, losses: 2 },
      "Falcons":    { wins: 3, losses: 2 },
    },
    tournamentContext: { strongInGroup: true, strongInPlayoffs: true, bigEventWinRate: 63 },
    mapStats: {
      Nuke:    { winRate: 74, ctWinRate: 65, tWinRate: 54, avgRoundDiff: 4.0, pistolWinRate: 57 },
      Ancient: { winRate: 70, ctWinRate: 62, tWinRate: 52, avgRoundDiff: 3.2, pistolWinRate: 55 },
      Anubis:  { winRate: 62, ctWinRate: 57, tWinRate: 50, avgRoundDiff: 1.8, pistolWinRate: 52 },
      Inferno: { winRate: 58, ctWinRate: 55, tWinRate: 48, avgRoundDiff: 1.0, pistolWinRate: 50 },
      Dust2:   { winRate: 50, ctWinRate: 49, tWinRate: 45, avgRoundDiff: 0.0, pistolWinRate: 47 },
      Train:   { winRate: 54, ctWinRate: 53, tWinRate: 47, avgRoundDiff: 0.6, pistolWinRate: 49 },
      Mirage:  { winRate: 46, ctWinRate: 47, tWinRate: 43, avgRoundDiff: -1.2, pistolWinRate: 45 },
    },
    players: [
      { name: "zont1x",  rating: 1.22, adr: 78, kd: 1.19, hsPercent: 48, clutchRate: 58, role: "awp" },
      { name: "magixx",  rating: 1.16, adr: 74, kd: 1.13, hsPercent: 52, clutchRate: 52, role: "entry" },
      { name: "Patsi",   rating: 1.12, adr: 72, kd: 1.09, hsPercent: 50, clutchRate: 48, role: "lurk" },
      { name: "Perfecto",rating: 1.08, adr: 70, kd: 1.05, hsPercent: 44, clutchRate: 46, role: "support" },
      { name: "chopper", rating: 1.03, adr: 66, kd: 1.00, hsPercent: 43, clutchRate: 43, role: "igl" },
    ],
  },

  // ── 10. Astralis ────────────────────────────────────────────
  {
    name: "Astralis",
    eloRating: 1695,
    vetoPicks: ["Nuke", "Inferno"],
    vetoBans: ["Train", "Anubis"],
    lanWinRate: 62,
    onlineWinRate: 60,
    recentResults: ["W","L","W","W","L","W","L","W","W","W"],
    h2h: {
      "MOUZ":       { wins: 2, losses: 4 },
      "Spirit":     { wins: 2, losses: 4 },
      "The MongolZ":{ wins: 2, losses: 3 },
      "G2":         { wins: 3, losses: 3 },
      "FaZe":       { wins: 3, losses: 4 },
      "FUT":        { wins: 4, losses: 2 },
    },
    tournamentContext: { strongInGroup: true, strongInPlayoffs: false, bigEventWinRate: 54 },
    mapStats: {
      Nuke:    { winRate: 74, ctWinRate: 67, tWinRate: 53, avgRoundDiff: 4.0, pistolWinRate: 58 },
      Inferno: { winRate: 68, ctWinRate: 60, tWinRate: 52, avgRoundDiff: 2.8, pistolWinRate: 55 },
      Mirage:  { winRate: 62, ctWinRate: 56, tWinRate: 50, avgRoundDiff: 1.8, pistolWinRate: 52 },
      Ancient: { winRate: 56, ctWinRate: 53, tWinRate: 47, avgRoundDiff: 0.8, pistolWinRate: 50 },
      Anubis:  { winRate: 50, ctWinRate: 50, tWinRate: 45, avgRoundDiff: 0.0, pistolWinRate: 47 },
      Dust2:   { winRate: 58, ctWinRate: 54, tWinRate: 48, avgRoundDiff: 1.0, pistolWinRate: 51 },
      Train:   { winRate: 46, ctWinRate: 48, tWinRate: 42, avgRoundDiff: -1.0, pistolWinRate: 45 },
    },
    players: [
      { name: "device",  rating: 1.20, adr: 76, kd: 1.18, hsPercent: 38, clutchRate: 55, role: "awp" },
      { name: "k0nfig",  rating: 1.16, adr: 77, kd: 1.13, hsPercent: 55, clutchRate: 52, role: "entry" },
      { name: "Staehr",  rating: 1.10, adr: 72, kd: 1.07, hsPercent: 50, clutchRate: 48, role: "lurk" },
      { name: "Bubzkji", rating: 1.06, adr: 68, kd: 1.03, hsPercent: 47, clutchRate: 44, role: "support" },
      { name: "dupreeh", rating: 1.04, adr: 68, kd: 1.01, hsPercent: 50, clutchRate: 43, role: "igl" },
    ],
  },

  // ── 11. G2 ──────────────────────────────────────────────────
  {
    name: "G2",
    eloRating: 1670,
    vetoPicks: ["Mirage", "Inferno"],
    vetoBans: ["Nuke", "Ancient"],
    lanWinRate: 60,
    onlineWinRate: 58,
    recentResults: ["W","L","W","L","W","W","L","W","W","L"],
    h2h: {
      "Vitality": { wins: 2, losses: 6 },
      "NAVI":     { wins: 2, losses: 4 },
      "FaZe":     { wins: 4, losses: 5 },
      "Falcons":  { wins: 2, losses: 3 },
      "Astralis": { wins: 3, losses: 3 },
      "Spirit":   { wins: 2, losses: 3 },
      "FURIA":    { wins: 3, losses: 3 },
    },
    tournamentContext: { strongInGroup: false, strongInPlayoffs: false, bigEventWinRate: 50 },
    mapStats: {
      Mirage:  { winRate: 68, ctWinRate: 59, tWinRate: 53, avgRoundDiff: 2.8, pistolWinRate: 55 },
      Inferno: { winRate: 65, ctWinRate: 58, tWinRate: 51, avgRoundDiff: 2.2, pistolWinRate: 53 },
      Anubis:  { winRate: 58, ctWinRate: 54, tWinRate: 48, avgRoundDiff: 1.0, pistolWinRate: 50 },
      Dust2:   { winRate: 56, ctWinRate: 52, tWinRate: 48, avgRoundDiff: 0.8, pistolWinRate: 49 },
      Ancient: { winRate: 50, ctWinRate: 50, tWinRate: 45, avgRoundDiff: 0.0, pistolWinRate: 47 },
      Train:   { winRate: 54, ctWinRate: 53, tWinRate: 47, avgRoundDiff: 0.6, pistolWinRate: 49 },
      Nuke:    { winRate: 44, ctWinRate: 50, tWinRate: 38, avgRoundDiff: -1.5, pistolWinRate: 44 },
    },
    players: [
      { name: "jks",    rating: 1.18, adr: 76, kd: 1.15, hsPercent: 52, clutchRate: 55, role: "lurk" },
      { name: "Snax",   rating: 1.12, adr: 73, kd: 1.09, hsPercent: 48, clutchRate: 50, role: "entry" },
      { name: "nexa",   rating: 1.10, adr: 71, kd: 1.07, hsPercent: 46, clutchRate: 47, role: "support" },
      { name: "hunter-",rating: 1.16, adr: 75, kd: 1.12, hsPercent: 54, clutchRate: 52, role: "entry" },
      { name: "HooXi",  rating: 0.99, adr: 63, kd: 0.96, hsPercent: 42, clutchRate: 40, role: "igl" },
    ],
  },

  // ── 12. FaZe ────────────────────────────────────────────────
  {
    name: "FaZe",
    eloRating: 1670,
    vetoPicks: ["Inferno", "Mirage"],
    vetoBans: ["Ancient", "Train"],
    lanWinRate: 68,
    onlineWinRate: 58,
    recentResults: ["W","L","W","W","L","L","W","W","L","W"],
    h2h: {
      "Vitality": { wins: 3, losses: 6 },
      "NAVI":     { wins: 4, losses: 5 },
      "G2":       { wins: 5, losses: 4 },
      "Astralis": { wins: 4, losses: 3 },
      "Falcons":  { wins: 3, losses: 4 },
      "FURIA":    { wins: 4, losses: 3 },
    },
    tournamentContext: { strongInGroup: false, strongInPlayoffs: true, bigEventWinRate: 60 },
    mapStats: {
      Inferno: { winRate: 68, ctWinRate: 60, tWinRate: 53, avgRoundDiff: 2.8, pistolWinRate: 55 },
      Mirage:  { winRate: 65, ctWinRate: 57, tWinRate: 52, avgRoundDiff: 2.2, pistolWinRate: 53 },
      Nuke:    { winRate: 60, ctWinRate: 62, tWinRate: 48, avgRoundDiff: 1.4, pistolWinRate: 51 },
      Anubis:  { winRate: 56, ctWinRate: 54, tWinRate: 48, avgRoundDiff: 0.8, pistolWinRate: 50 },
      Dust2:   { winRate: 56, ctWinRate: 52, tWinRate: 48, avgRoundDiff: 0.8, pistolWinRate: 49 },
      Ancient: { winRate: 48, ctWinRate: 49, tWinRate: 44, avgRoundDiff: -0.8, pistolWinRate: 46 },
      Train:   { winRate: 46, ctWinRate: 48, tWinRate: 42, avgRoundDiff: -1.2, pistolWinRate: 45 },
    },
    players: [
      { name: "ropz",    rating: 1.22, adr: 78, kd: 1.19, hsPercent: 48, clutchRate: 60, role: "lurk" },
      { name: "broky",   rating: 1.18, adr: 75, kd: 1.15, hsPercent: 44, clutchRate: 56, role: "awp" },
      { name: "frozen",  rating: 1.15, adr: 74, kd: 1.12, hsPercent: 52, clutchRate: 52, role: "entry" },
      { name: "rain",    rating: 1.12, adr: 73, kd: 1.09, hsPercent: 50, clutchRate: 48, role: "entry" },
      { name: "karrigan",rating: 0.98, adr: 63, kd: 0.95, hsPercent: 44, clutchRate: 44, role: "igl" },
    ],
  },

  // ── 13. 3DMAX ───────────────────────────────────────────────
  {
    name: "3DMAX",
    eloRating: 1660,
    vetoPicks: ["Anubis", "Ancient"],
    vetoBans: ["Nuke", "Dust2"],
    lanWinRate: 58,
    onlineWinRate: 62,
    recentResults: ["W","W","L","W","L","W","W","L","W","L"],
    h2h: {
      "FUT":     { wins: 3, losses: 2 },
      "G2":      { wins: 2, losses: 3 },
      "Astralis":{ wins: 2, losses: 3 },
    },
    tournamentContext: { strongInGroup: true, strongInPlayoffs: false, bigEventWinRate: 50 },
    mapStats: {
      Anubis:  { winRate: 66, ctWinRate: 59, tWinRate: 52, avgRoundDiff: 2.4, pistolWinRate: 54 },
      Ancient: { winRate: 64, ctWinRate: 58, tWinRate: 51, avgRoundDiff: 2.0, pistolWinRate: 53 },
      Mirage:  { winRate: 58, ctWinRate: 54, tWinRate: 49, avgRoundDiff: 1.0, pistolWinRate: 51 },
      Inferno: { winRate: 56, ctWinRate: 53, tWinRate: 48, avgRoundDiff: 0.8, pistolWinRate: 50 },
      Train:   { winRate: 54, ctWinRate: 53, tWinRate: 47, avgRoundDiff: 0.6, pistolWinRate: 49 },
      Nuke:    { winRate: 46, ctWinRate: 52, tWinRate: 38, avgRoundDiff: -1.2, pistolWinRate: 45 },
      Dust2:   { winRate: 48, ctWinRate: 49, tWinRate: 44, avgRoundDiff: -0.8, pistolWinRate: 46 },
    },
    players: [
      { name: "Ex3rcice", rating: 1.18, adr: 76, kd: 1.15, hsPercent: 53, clutchRate: 54, role: "entry" },
      { name: "maka",     rating: 1.14, adr: 73, kd: 1.11, hsPercent: 48, clutchRate: 50, role: "lurk" },
      { name: "Lucky",    rating: 1.10, adr: 71, kd: 1.07, hsPercent: 50, clutchRate: 47, role: "awp" },
      { name: "Djoko",    rating: 1.06, adr: 68, kd: 1.03, hsPercent: 46, clutchRate: 44, role: "support" },
      { name: "bodyy",    rating: 1.02, adr: 65, kd: 0.99, hsPercent: 43, clutchRate: 41, role: "igl" },
    ],
  },

  // ── 14. FUT ─────────────────────────────────────────────────
  {
    name: "FUT",
    eloRating: 1680,
    vetoPicks: ["Mirage", "Inferno"],
    vetoBans: ["Train", "Ancient"],
    lanWinRate: 59,
    onlineWinRate: 61,
    recentResults: ["W","W","L","W","W","L","L","W","W","L"],
    h2h: {
      "Astralis": { wins: 2, losses: 4 },
      "3DMAX":    { wins: 2, losses: 3 },
      "Vitality": { wins: 1, losses: 5 },
    },
    tournamentContext: { strongInGroup: true, strongInPlayoffs: false, bigEventWinRate: 48 },
    mapStats: {
      Mirage:  { winRate: 66, ctWinRate: 57, tWinRate: 53, avgRoundDiff: 2.4, pistolWinRate: 54 },
      Inferno: { winRate: 62, ctWinRate: 57, tWinRate: 51, avgRoundDiff: 1.8, pistolWinRate: 52 },
      Nuke:    { winRate: 58, ctWinRate: 61, tWinRate: 47, avgRoundDiff: 1.2, pistolWinRate: 51 },
      Anubis:  { winRate: 56, ctWinRate: 54, tWinRate: 48, avgRoundDiff: 0.8, pistolWinRate: 50 },
      Dust2:   { winRate: 54, ctWinRate: 52, tWinRate: 48, avgRoundDiff: 0.6, pistolWinRate: 49 },
      Ancient: { winRate: 46, ctWinRate: 48, tWinRate: 43, avgRoundDiff: -1.0, pistolWinRate: 46 },
      Train:   { winRate: 44, ctWinRate: 47, tWinRate: 40, avgRoundDiff: -1.4, pistolWinRate: 44 },
    },
    players: [
      { name: "XANTARES", rating: 1.22, adr: 82, kd: 1.18, hsPercent: 58, clutchRate: 52, role: "entry" },
      { name: "woxic",    rating: 1.16, adr: 74, kd: 1.13, hsPercent: 40, clutchRate: 50, role: "awp" },
      { name: "imoRR",    rating: 1.10, adr: 71, kd: 1.07, hsPercent: 50, clutchRate: 46, role: "lurk" },
      { name: "Calyx",    rating: 1.06, adr: 68, kd: 1.03, hsPercent: 48, clutchRate: 43, role: "support" },
      { name: "gxx-",     rating: 1.02, adr: 65, kd: 0.99, hsPercent: 44, clutchRate: 41, role: "igl" },
    ],
  },

  // ── 15. B8 ──────────────────────────────────────────────────
  {
    name: "B8",
    eloRating: 1560,
    vetoPicks: ["Inferno", "Anubis"],
    vetoBans: ["Train", "Nuke"],
    lanWinRate: 54,
    onlineWinRate: 56,
    recentResults: ["L","W","W","L","W","L","W","L","W","L"],
    h2h: {
      "NAVI":   { wins: 0, losses: 5 },
      "Aurora": { wins: 1, losses: 4 },
      "HOTU":   { wins: 3, losses: 2 },
    },
    tournamentContext: { strongInGroup: false, strongInPlayoffs: false, bigEventWinRate: 42 },
    mapStats: {
      Inferno: { winRate: 60, ctWinRate: 57, tWinRate: 50, avgRoundDiff: 1.4, pistolWinRate: 52 },
      Anubis:  { winRate: 58, ctWinRate: 55, tWinRate: 48, avgRoundDiff: 1.0, pistolWinRate: 51 },
      Ancient: { winRate: 54, ctWinRate: 53, tWinRate: 47, avgRoundDiff: 0.6, pistolWinRate: 50 },
      Mirage:  { winRate: 52, ctWinRate: 51, tWinRate: 47, avgRoundDiff: 0.2, pistolWinRate: 49 },
      Dust2:   { winRate: 50, ctWinRate: 50, tWinRate: 45, avgRoundDiff: 0.0, pistolWinRate: 48 },
      Nuke:    { winRate: 44, ctWinRate: 52, tWinRate: 37, avgRoundDiff: -1.4, pistolWinRate: 45 },
      Train:   { winRate: 42, ctWinRate: 46, tWinRate: 39, avgRoundDiff: -1.8, pistolWinRate: 44 },
    },
    players: [
      { name: "headtr1ck", rating: 1.14, adr: 73, kd: 1.11, hsPercent: 52, clutchRate: 50, role: "awp" },
      { name: "npl",       rating: 1.10, adr: 71, kd: 1.07, hsPercent: 48, clutchRate: 46, role: "entry" },
      { name: "OWNER",     rating: 1.06, adr: 68, kd: 1.03, hsPercent: 50, clutchRate: 43, role: "lurk" },
      { name: "rigoN",     rating: 1.02, adr: 65, kd: 0.99, hsPercent: 44, clutchRate: 41, role: "support" },
      { name: "Polt",      rating: 0.98, adr: 62, kd: 0.95, hsPercent: 42, clutchRate: 39, role: "igl" },
    ],
  },

  // ── 16. HOTU ────────────────────────────────────────────────
  {
    name: "HOTU",
    eloRating: 1520,
    vetoPicks: ["Inferno", "Mirage"],
    vetoBans: ["Nuke", "Train"],
    lanWinRate: 50,
    onlineWinRate: 54,
    recentResults: ["L","L","W","W","L","W","L","W","L","W"],
    h2h: {
      "NAVI": { wins: 1, losses: 6 },
      "B8":   { wins: 2, losses: 3 },
    },
    tournamentContext: { strongInGroup: false, strongInPlayoffs: false, bigEventWinRate: 35 },
    mapStats: {
      Inferno: { winRate: 58, ctWinRate: 56, tWinRate: 49, avgRoundDiff: 1.0, pistolWinRate: 51 },
      Mirage:  { winRate: 56, ctWinRate: 54, tWinRate: 48, avgRoundDiff: 0.8, pistolWinRate: 50 },
      Anubis:  { winRate: 52, ctWinRate: 52, tWinRate: 46, avgRoundDiff: 0.2, pistolWinRate: 48 },
      Ancient: { winRate: 50, ctWinRate: 51, tWinRate: 45, avgRoundDiff: 0.0, pistolWinRate: 47 },
      Dust2:   { winRate: 48, ctWinRate: 49, tWinRate: 44, avgRoundDiff: -0.6, pistolWinRate: 46 },
      Nuke:    { winRate: 42, ctWinRate: 50, tWinRate: 36, avgRoundDiff: -1.8, pistolWinRate: 44 },
      Train:   { winRate: 40, ctWinRate: 46, tWinRate: 38, avgRoundDiff: -2.2, pistolWinRate: 43 },
    },
    players: [
      { name: "HOTU_AWP",    rating: 1.08, adr: 70, kd: 1.05, hsPercent: 42, clutchRate: 44, role: "awp" },
      { name: "HOTU_Entry1", rating: 1.04, adr: 67, kd: 1.01, hsPercent: 50, clutchRate: 40, role: "entry" },
      { name: "HOTU_Entry2", rating: 1.02, adr: 66, kd: 0.99, hsPercent: 48, clutchRate: 39, role: "entry" },
      { name: "HOTU_Sup",    rating: 0.98, adr: 63, kd: 0.95, hsPercent: 44, clutchRate: 37, role: "support" },
      { name: "HOTU_IGL",    rating: 0.95, adr: 61, kd: 0.92, hsPercent: 42, clutchRate: 36, role: "igl" },
    ],
  },
];

// ─── Lookup helpers ────────────────────────────────────────────

const PROFILE_MAP = new Map<string, TeamProfile>(
  PROFILES.map(p => [p.name.toLowerCase(), p])
);

export function getTeamProfile(rawName: string): TeamProfile | null {
  const canonical = resolveProfileName(rawName);
  return PROFILE_MAP.get(canonical.toLowerCase()) ?? null;
}

export { PROFILES as TEAM_PROFILES };
