// CS2 тоглоомын mock өгөгдөл — дараа нь бодит API-аар солигдоно

export type Team = {
  id: string;
  name: string;
  tag: string;
  region: "EU" | "NA" | "CIS" | "APAC";
  rating: number;
  winRate: number; // percentage
  recentForm: ("W" | "L")[]; // last 5 matches
  players: string[];
  logo: string; // emoji placeholder
  mapsWinRate: Record<string, number>;
};

export type Match = {
  id: string;
  tournament: string;
  tournamentLogo: string;
  teamA: Team;
  teamB: Team;
  startTime: string; // ISO date string
  format: "BO1" | "BO3" | "BO5";
  prediction: {
    winner: "teamA" | "teamB";
    confidence: number; // 0-100
    teamAWinPct: number;
    analysis: string;
    keyFactors: string[];
    mapPredictions: Array<{
      map: string;
      teamAWinPct: number;
    }>;
  };
  odds: {
    teamA: number; // decimal odds
    teamB: number;
  };
  planRequired: "free" | "pro" | "vip";
};

export type Signal = {
  id: string;
  match: Match;
  type: "MONEYLINE" | "MAP_HANDICAP" | "OVER_UNDER" | "FIRST_MAP";
  description: string;
  recommendation: string;
  odds: number;
  confidence: number;
  expectedValue: number; // percentage
  stake: "LOW" | "MEDIUM" | "HIGH"; // suggested stake
  createdAt: string;
};

// ─── Teams ───────────────────────────────────────────────────

export const TEAMS: Team[] = [
  {
    id: "navi",
    name: "Natus Vincere",
    tag: "NAVI",
    region: "CIS",
    rating: 2143,
    winRate: 67,
    recentForm: ["W", "W", "W", "L", "W"],
    players: ["s1mple", "electronic", "b1t", "Perfecto", "npl"],
    logo: "⚡",
    mapsWinRate: { Mirage: 72, Inferno: 68, Ancient: 64, Nuke: 71, Anubis: 58 },
  },
  {
    id: "faze",
    name: "FaZe Clan",
    tag: "FaZe",
    region: "EU",
    rating: 2089,
    winRate: 63,
    recentForm: ["W", "L", "W", "W", "L"],
    players: ["karrigan", "rain", "broky", "NiKo", "ropz"],
    logo: "💎",
    mapsWinRate: { Mirage: 65, Inferno: 70, Ancient: 61, Nuke: 66, Anubis: 63 },
  },
  {
    id: "vitality",
    name: "Team Vitality",
    tag: "VIT",
    region: "EU",
    rating: 2067,
    winRate: 61,
    recentForm: ["L", "W", "W", "W", "L"],
    players: ["ZywOo", "apEX", "Magisk", "dupreeh", "misutaaa"],
    logo: "🐝",
    mapsWinRate: { Mirage: 63, Inferno: 66, Ancient: 69, Nuke: 60, Anubis: 65 },
  },
  {
    id: "g2",
    name: "G2 Esports",
    tag: "G2",
    region: "EU",
    rating: 2045,
    winRate: 59,
    recentForm: ["W", "W", "L", "W", "W"],
    players: ["NiKo", "huNter", "m0NESY", "jks", "nexa"],
    logo: "🔱",
    mapsWinRate: { Mirage: 61, Inferno: 63, Ancient: 58, Nuke: 57, Anubis: 67 },
  },
  {
    id: "mouz",
    name: "MOUZ",
    tag: "MOUZ",
    region: "EU",
    rating: 2032,
    winRate: 62,
    recentForm: ["W", "W", "W", "L", "W"],
    players: ["torzsi", "frozen", "xertioN", "dexter", "siuhy"],
    logo: "🖱️",
    mapsWinRate: { Mirage: 67, Inferno: 61, Ancient: 70, Nuke: 63, Anubis: 60 },
  },
  {
    id: "liquid",
    name: "Team Liquid",
    tag: "TL",
    region: "NA",
    rating: 1987,
    winRate: 58,
    recentForm: ["L", "W", "L", "W", "W"],
    players: ["NAF", "oSee", "Twistzz", "nitr0", "YEKINDAR"],
    logo: "💧",
    mapsWinRate: { Mirage: 59, Inferno: 62, Ancient: 55, Nuke: 61, Anubis: 57 },
  },
  {
    id: "astralis",
    name: "Astralis",
    tag: "AST",
    region: "EU",
    rating: 1956,
    winRate: 55,
    recentForm: ["W", "L", "W", "L", "W"],
    players: ["device", "dupreeh", "Magisk", "gla1ve", "Xyp9x"],
    logo: "⭐",
    mapsWinRate: { Mirage: 60, Inferno: 58, Ancient: 54, Nuke: 65, Anubis: 52 },
  },
  {
    id: "cloud9",
    name: "Cloud9",
    tag: "C9",
    region: "CIS",
    rating: 1978,
    winRate: 57,
    recentForm: ["W", "L", "W", "W", "L"],
    players: ["Ax1Le", "sh1ro", "Hobbit", "interz", "nafany"],
    logo: "☁️",
    mapsWinRate: { Mirage: 58, Inferno: 55, Ancient: 61, Nuke: 53, Anubis: 59 },
  },
  {
    id: "nip",
    name: "Ninjas in Pyjamas",
    tag: "NIP",
    region: "EU",
    rating: 1934,
    winRate: 54,
    recentForm: ["L", "L", "W", "W", "L"],
    players: ["REZ", "Brollan", "hampus", "es3tag", "headtr1ck"],
    logo: "👤",
    mapsWinRate: { Mirage: 55, Inferno: 52, Ancient: 57, Nuke: 51, Anubis: 54 },
  },
  {
    id: "ence",
    name: "ENCE",
    tag: "ENCE",
    region: "EU",
    rating: 1901,
    winRate: 52,
    recentForm: ["L", "W", "L", "W", "L"],
    players: ["Snappi", "SunPayus", "dycha", "maden", "NertZ"],
    logo: "🦅",
    mapsWinRate: { Mirage: 53, Inferno: 50, Ancient: 56, Nuke: 48, Anubis: 55 },
  },
];

// ─── Helper ───────────────────────────────────────────────────

function getTeam(id: string): Team {
  return TEAMS.find((t) => t.id === id)!;
}

function relativeTime(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  const hours = Math.round(diff / 3_600_000);
  if (hours < 0) return "Эхэлсэн";
  if (hours === 0) return "Удахгүй";
  if (hours < 24) return `${hours} цагийн дараа`;
  return `${Math.ceil(hours / 24)} өдрийн дараа`;
}

export { relativeTime };

// ─── Upcoming Matches ─────────────────────────────────────────

const now = new Date();
const h = (hours: number) => new Date(now.getTime() + hours * 3_600_000).toISOString();

export const UPCOMING_MATCHES: Match[] = [
  {
    id: "m1",
    tournament: "ESL Pro League S21",
    tournamentLogo: "🏆",
    teamA: getTeam("navi"),
    teamB: getTeam("faze"),
    startTime: h(3),
    format: "BO3",
    prediction: {
      winner: "teamA",
      confidence: 72,
      teamAWinPct: 65,
      analysis:
        "NAVI's recent form is exceptional with 3 consecutive wins. Their Mirage dominance vs FaZe's inconsistent map pool gives them the edge in this BO3.",
      keyFactors: [
        "NAVI 5-0 on Mirage last 5 matches",
        "FaZe lost 2 of last 3 away matches",
        "s1mple averaging 1.24 rating this month",
        "FaZe struggling on Ancient (38% win rate)",
      ],
      mapPredictions: [
        { map: "Mirage", teamAWinPct: 72 },
        { map: "Inferno", teamAWinPct: 55 },
        { map: "Ancient", teamAWinPct: 70 },
      ],
    },
    odds: { teamA: 1.58, teamB: 2.35 },
    planRequired: "free",
  },
  {
    id: "m2",
    tournament: "ESL Pro League S21",
    tournamentLogo: "🏆",
    teamA: getTeam("vitality"),
    teamB: getTeam("g2"),
    startTime: h(6),
    format: "BO3",
    prediction: {
      winner: "teamA",
      confidence: 61,
      teamAWinPct: 58,
      analysis:
        "Vitality's ZywOo has been in top form. G2 has home advantage but their Ancient struggles should give Vitality the map pool advantage.",
      keyFactors: [
        "ZywOo 1.31 rating vs G2 historically",
        "G2 only 2-3 on Ancient this month",
        "Vitality won 4 of last 6 EU matches",
        "Close rivalry — previous 5 meetings: 3-2 Vitality",
      ],
      mapPredictions: [
        { map: "Inferno", teamAWinPct: 62 },
        { map: "Ancient", teamAWinPct: 66 },
        { map: "Mirage", teamAWinPct: 55 },
      ],
    },
    odds: { teamA: 1.72, teamB: 2.10 },
    planRequired: "free",
  },
  {
    id: "m3",
    tournament: "IEM Katowice 2026",
    tournamentLogo: "🎯",
    teamA: getTeam("mouz"),
    teamB: getTeam("liquid"),
    startTime: h(24),
    format: "BO3",
    prediction: {
      winner: "teamA",
      confidence: 68,
      teamAWinPct: 62,
      analysis:
        "MOUZ's dominant Ancient record and torzsi's recent 1.28 rating make them heavy favorites. Liquid's NA-style play struggles against MOUZ's methodical EU approach.",
      keyFactors: [
        "MOUZ 7-1 on Ancient this season",
        "torzsi averaging 1.28 rating last 10 maps",
        "Liquid 1-4 vs EU top-5 teams recently",
        "MOUZ eliminated Liquid at last 2 LANs",
      ],
      mapPredictions: [
        { map: "Ancient", teamAWinPct: 76 },
        { map: "Mirage", teamAWinPct: 63 },
        { map: "Nuke", teamAWinPct: 58 },
      ],
    },
    odds: { teamA: 1.65, teamB: 2.20 },
    planRequired: "pro",
  },
  {
    id: "m4",
    tournament: "BLAST Premier Spring 2026",
    tournamentLogo: "💥",
    teamA: getTeam("astralis"),
    teamB: getTeam("cloud9"),
    startTime: h(27),
    format: "BO3",
    prediction: {
      winner: "teamA",
      confidence: 58,
      teamAWinPct: 54,
      analysis:
        "Slight Astralis edge due to their Nuke mastery. However Cloud9's Ax1Le can single-handedly change the series — high variance match.",
      keyFactors: [
        "Astralis 70%+ Nuke win rate all-time",
        "Cloud9 Ax1Le top-5 world rating",
        "Astralis 3-1 vs Cloud9 last 4 meetings",
        "Both teams in similar recent form",
      ],
      mapPredictions: [
        { map: "Nuke", teamAWinPct: 68 },
        { map: "Inferno", teamAWinPct: 55 },
        { map: "Ancient", teamAWinPct: 52 },
      ],
    },
    odds: { teamA: 1.88, teamB: 1.92 },
    planRequired: "pro",
  },
  {
    id: "m5",
    tournament: "ESL Challenger League",
    tournamentLogo: "🎪",
    teamA: getTeam("nip"),
    teamB: getTeam("ence"),
    startTime: h(30),
    format: "BO3",
    prediction: {
      winner: "teamA",
      confidence: 63,
      teamAWinPct: 60,
      analysis:
        "NIP's recent upswing with REZ carrying has them as moderate favorites. ENCE's fragile map pool outside of Ancient is exploitable.",
      keyFactors: [
        "NIP won 3 of last 4 vs ENCE",
        "REZ 1.19 rating this month",
        "ENCE 0-3 on Mirage last 5 matches",
        "NIP improved IGL calls under hampus",
      ],
      mapPredictions: [
        { map: "Mirage", teamAWinPct: 72 },
        { map: "Ancient", teamAWinPct: 48 },
        { map: "Inferno", teamAWinPct: 61 },
      ],
    },
    odds: { teamA: 1.75, teamB: 2.05 },
    planRequired: "vip",
  },
];

// ─── VIP Signals ──────────────────────────────────────────────

export const VIP_SIGNALS: Signal[] = [
  {
    id: "s1",
    match: UPCOMING_MATCHES[0],
    type: "MONEYLINE",
    description: "NAVI ялах (ML)",
    recommendation: "NAVI to Win",
    odds: 1.58,
    confidence: 72,
    expectedValue: 14.8,
    stake: "HIGH",
    createdAt: new Date().toISOString(),
  },
  {
    id: "s2",
    match: UPCOMING_MATCHES[2],
    type: "MAP_HANDICAP",
    description: "MOUZ -1.5 map handicap",
    recommendation: "MOUZ -1.5 Maps",
    odds: 2.10,
    confidence: 65,
    expectedValue: 11.5,
    stake: "MEDIUM",
    createdAt: new Date().toISOString(),
  },
  {
    id: "s3",
    match: UPCOMING_MATCHES[1],
    type: "FIRST_MAP",
    description: "Vitality 1-р газрыг авах",
    recommendation: "Vitality Win Map 1",
    odds: 1.85,
    confidence: 68,
    expectedValue: 10.2,
    stake: "MEDIUM",
    createdAt: new Date().toISOString(),
  },
  {
    id: "s4",
    match: UPCOMING_MATCHES[3],
    type: "OVER_UNDER",
    description: "2.5 газраас дээш (Over)",
    recommendation: "Over 2.5 Maps",
    odds: 1.70,
    confidence: 61,
    expectedValue: 7.8,
    stake: "LOW",
    createdAt: new Date().toISOString(),
  },
];
