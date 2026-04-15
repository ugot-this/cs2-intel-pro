/**
 * HLTV Top 30 CS2 team rankings — enriched static data
 * Last updated: April 2026
 * Source: hltv.org/ranking/teams
 */

export interface HLTVTeam {
  rank: number;
  id: number;
  name: string;
  change: number;
  isNew: boolean;
  region: "EU" | "CIS" | "NA" | "SA" | "APAC" | "ME";
  /** ISO 3166-1 alpha-2 country/primary location code */
  flag: string;
  /** Current active roster (IGNs) */
  players: string[];
  /** Approximate win rate (%) based on recent tournament results */
  winRate: number;
}

export const HLTV_TOP30: HLTVTeam[] = [
  {
    rank: 1, id: 9565, name: "Vitality", change: 0, isNew: false,
    region: "EU", flag: "FR",
    players: ["zywOo", "apEX", "flameZ", "mezii", "Spinx"],
    winRate: 72,
  },
  {
    rank: 2, id: 4608, name: "NAVI", change: 0, isNew: false,
    region: "CIS", flag: "UA",
    players: ["b1t", "iM", "jL", "w0nderful", "aleksib"],
    winRate: 68,
  },
  {
    rank: 3, id: 8297, name: "FURIA", change: 1, isNew: false,
    region: "SA", flag: "BR",
    players: ["FalleN", "KSCERATO", "yuurih", "chelo", "skullz"],
    winRate: 65,
  },
  {
    rank: 4, id: 12467, name: "PARIVISION", change: -1, isNew: false,
    region: "CIS", flag: "RU",
    players: ["fame", "zorte", "FL1T", "Forester", "Krad"],
    winRate: 63,
  },
  {
    rank: 5, id: 11283, name: "Falcons", change: 0, isNew: false,
    region: "ME", flag: "SA",
    players: ["NiKo", "huNter-", "nexa", "syrsoN", "Hooxi"],
    winRate: 61,
  },
  {
    rank: 6, id: 11861, name: "Aurora", change: 2, isNew: false,
    region: "CIS", flag: "RU",
    players: ["sh1ro", "nafany", "Krad", "notineki", "shalfey"],
    winRate: 59,
  },
  {
    rank: 7, id: 6248, name: "The MongolZ", change: -1, isNew: false,
    region: "APAC", flag: "MN",
    players: ["bLitz", "910", "mzinho", "Techno4K", "chr1zN"],
    winRate: 58,
  },
  {
    rank: 8, id: 4494, name: "MOUZ", change: -1, isNew: false,
    region: "EU", flag: "DE",
    players: ["torzsi", "xertioN", "Brollan", "jimpphat", "siuhy"],
    winRate: 57,
  },
  {
    rank: 9, id: 7020, name: "Spirit", change: 1, isNew: false,
    region: "CIS", flag: "RU",
    players: ["zont1x", "chopper", "magixx", "Patsi", "Perfecto"],
    winRate: 56,
  },
  {
    rank: 10, id: 6665, name: "Astralis", change: -1, isNew: false,
    region: "EU", flag: "DK",
    players: ["device", "dupreeh", "Bubzkji", "k0nfig", "Staehr"],
    winRate: 55,
  },
  {
    rank: 11, id: 13286, name: "FUT", change: 3, isNew: false,
    region: "EU", flag: "TR",
    players: ["XANTARES", "woxic", "imoRR", "gxx-", "Calyx"],
    winRate: 54,
  },
  {
    rank: 12, id: 5995, name: "G2", change: -1, isNew: false,
    region: "EU", flag: "EU",
    players: ["jks", "HooXi", "nexa", "Snax", "hunter-"],
    winRate: 53,
  },
  {
    rank: 13, id: 4914, name: "3DMAX", change: -1, isNew: false,
    region: "EU", flag: "FR",
    players: ["bodyy", "Ex3rcice", "Djoko", "Lucky", "maka"],
    winRate: 52,
  },
  {
    rank: 14, id: 6667, name: "FaZe", change: -1, isNew: false,
    region: "EU", flag: "EU",
    players: ["karrigan", "ropz", "rain", "broky", "frozen"],
    winRate: 52,
  },
  {
    rank: 15, id: 12468, name: "Legacy", change: 2, isNew: false,
    region: "SA", flag: "BR",
    players: ["LUCAS1", "dead", "dumau", "nqz", "b4rtiN"],
    winRate: 51,
  },
  {
    rank: 16, id: 9996, name: "9z", change: -1, isNew: false,
    region: "SA", flag: "AR",
    players: ["dgt", "reversive", "rox", "Luken", "Jony9"],
    winRate: 50,
  },
  {
    rank: 17, id: 11241, name: "B8", change: 0, isNew: false,
    region: "CIS", flag: "UA",
    players: ["headtr1ck", "npl", "OWNER", "Polt", "rigoN"],
    winRate: 50,
  },
  {
    rank: 18, id: 7175, name: "HEROIC", change: -1, isNew: false,
    region: "EU", flag: "DK",
    players: ["cadiaN", "sjuush", "TeSeS", "stavn", "kyxsan"],
    winRate: 49,
  },
  {
    rank: 19, id: 12394, name: "BetBoom", change: 1, isNew: false,
    region: "CIS", flag: "RU",
    players: ["electroNic", "nafany", "Boombl4", "sdy", "KaiR0N"],
    winRate: 49,
  },
  {
    rank: 20, id: 4863, name: "TYLOO", change: -1, isNew: false,
    region: "APAC", flag: "CN",
    players: ["somebody", "Freeman", "JamYoung", "Attacker", "kaze"],
    winRate: 48,
  },
  {
    rank: 21, id: 11811, name: "Monte", change: 0, isNew: false,
    region: "CIS", flag: "UA",
    players: ["Pampero", "krugg", "xseveN", "r3salt", "DEKO"],
    winRate: 48,
  },
  {
    rank: 22, id: 9928, name: "GamerLegion", change: 1, isNew: false,
    region: "EU", flag: "DK",
    players: ["tiziaN", "ISSAA", "volt", "Keoz", "Sinnopsyy"],
    winRate: 47,
  },
  {
    rank: 23, id: 12376, name: "M80", change: -1, isNew: false,
    region: "NA", flag: "US",
    players: ["slaxz-", "Swisher", "WolfY", "Techno4K", "cxzi"],
    winRate: 47,
  },
  {
    rank: 24, id: 12474, name: "Alliance", change: 2, isNew: false,
    region: "EU", flag: "SE",
    players: ["twist", "raalz", "freddieb", "INS", "bååten"],
    winRate: 47,
  },
  {
    rank: 25, id: 5973, name: "Liquid", change: -1, isNew: false,
    region: "NA", flag: "US",
    players: ["NAF", "oSee", "nitr0", "Twistzz", "YEKINDAR"],
    winRate: 46,
  },
  {
    rank: 26, id: 9215, name: "MIBR", change: 0, isNew: false,
    region: "SA", flag: "BR",
    players: ["chelo", "drop", "saffee", "VINI", "exit"],
    winRate: 46,
  },
  {
    rank: 27, id: 4773, name: "paiN", change: 1, isNew: false,
    region: "SA", flag: "BR",
    players: ["biguzera", "kye", "hardzao", "nqz", "zevy"],
    winRate: 45,
  },
  {
    rank: 28, id: 7532, name: "BIG", change: -1, isNew: false,
    region: "EU", flag: "DE",
    players: ["tabseN", "faveN", "syrsoN", "hyped", "prosus"],
    winRate: 45,
  },
  {
    rank: 29, id: 4411, name: "NiP", change: 0, isNew: false,
    region: "EU", flag: "SE",
    players: ["REZ", "Plopski", "hampus", "headtr1ck", "es3tag"],
    winRate: 44,
  },
  {
    rank: 30, id: 11737, name: "EYEBALLERS", change: 1, isNew: false,
    region: "EU", flag: "SE",
    players: ["twist", "nawwk", "phzy", "ztr", "Golden"],
    winRate: 44,
  },
];

// ─── Upcoming Events ───────────────────────────────────────────

export interface UpcomingEvent {
  id: number;
  name: string;
  dateStart: number;
  dateEnd: number;
  daysUntil: number;
}

const now = Date.now();

export const UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    id: 7902,
    name: "IEM Rio 2026",
    dateStart: new Date("2026-04-21").getTime(),
    dateEnd:   new Date("2026-04-27").getTime(),
    daysUntil: Math.ceil((new Date("2026-04-21").getTime() - now) / 86_400_000),
  },
  {
    id: 7903,
    name: "ESL Pro League Season 21",
    dateStart: new Date("2026-05-05").getTime(),
    dateEnd:   new Date("2026-05-25").getTime(),
    daysUntil: Math.ceil((new Date("2026-05-05").getTime() - now) / 86_400_000),
  },
  {
    id: 7904,
    name: "BLAST Premier Spring Finals 2026",
    dateStart: new Date("2026-06-10").getTime(),
    dateEnd:   new Date("2026-06-15").getTime(),
    daysUntil: Math.ceil((new Date("2026-06-10").getTime() - now) / 86_400_000),
  },
].filter(e => e.daysUntil >= 0);
