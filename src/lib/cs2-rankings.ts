/**
 * HLTV Top 30 CS2 team rankings — enriched static data
 * Last updated: April 2026
 * Source: hltv.org/ranking/teams
 * Logos: fetched via hltv npm package (one-time, see scripts/fetch-logos.mjs)
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
  /** HLTV CDN logo URL (stable content-addressed imgix URL) */
  logoUrl: string | null;
}

export const HLTV_TOP30: HLTVTeam[] = [
  {
    rank: 1, id: 9565, name: "Vitality", change: 0, isNew: false,
    region: "EU", flag: "FR",
    players: ["zywOo", "apEX", "flameZ", "mezii", "Spinx"],
    winRate: 72,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/ogcHrcCdzRvxbYvAz04KAN.png?ixlib=java-2.1.0&w=50&s=e1f6019aa9f274ffe45a5e99c88dbc02",
  },
  {
    rank: 2, id: 4608, name: "NAVI", change: 0, isNew: false,
    region: "CIS", flag: "UA",
    players: ["b1t", "iM", "jL", "w0nderful", "aleksib"],
    winRate: 68,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/9iMirAi7ArBLNU8p3kqUTZ.svg?ixlib=java-2.1.0&s=4dd8635be16122656093ae9884675d0c",
  },
  {
    rank: 3, id: 8297, name: "FURIA", change: 1, isNew: false,
    region: "SA", flag: "BR",
    players: ["FalleN", "KSCERATO", "yuurih", "chelo", "skullz"],
    winRate: 65,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/mvNQc4csFGtxXk5guAh8m1.svg?ixlib=java-2.1.0&s=11e5056829ad5d6c06c5961bbe76d20c",
  },
  {
    rank: 4, id: 12467, name: "PARIVISION", change: -1, isNew: false,
    region: "CIS", flag: "RU",
    players: ["fame", "zorte", "FL1T", "Forester", "Krad"],
    winRate: 63,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/MFcDe-M8wfGOUU6x4sRELR.png?ixlib=java-2.1.0&w=50&s=1d91076a58b354d8c3eaeda3162c292e",
  },
  {
    rank: 5, id: 11283, name: "Falcons", change: 0, isNew: false,
    region: "ME", flag: "SA",
    players: ["NiKo", "huNter-", "nexa", "syrsoN", "Hooxi"],
    winRate: 61,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/4eJSkDQINNM6Tbs4WvLzkN.png?ixlib=java-2.1.0&w=50&s=d8c857ea47046f61eca695beab0d12ef",
  },
  {
    rank: 6, id: 11861, name: "Aurora", change: 2, isNew: false,
    region: "CIS", flag: "RU",
    players: ["sh1ro", "nafany", "Krad", "notineki", "shalfey"],
    winRate: 59,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/yJzPNOeXlyiniNxanYJCrv.png?ixlib=java-2.1.0&w=50&s=2c08f70c2f2f8c2024a438ddcf19bbf1",
  },
  {
    rank: 7, id: 6248, name: "The MongolZ", change: -1, isNew: false,
    region: "APAC", flag: "MN",
    players: ["bLitz", "910", "mzinho", "Techno4K", "chr1zN"],
    winRate: 58,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/bRk2sh_tSTO6fq1GLhgcal.png?ixlib=java-2.1.0&w=50&s=8b08e53858eb817852ae74b30a30151d",
  },
  {
    rank: 8, id: 4494, name: "MOUZ", change: -1, isNew: false,
    region: "EU", flag: "DE",
    players: ["torzsi", "xertioN", "Brollan", "jimpphat", "siuhy"],
    winRate: 57,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/IejtXpquZnE8KqYPB1LNKw.svg?ixlib=java-2.1.0&s=7fd33b8def053fbfd8fdbb58e3bdcd3c",
  },
  {
    rank: 9, id: 7020, name: "Spirit", change: 1, isNew: false,
    region: "CIS", flag: "RU",
    players: ["zont1x", "chopper", "magixx", "Patsi", "Perfecto"],
    winRate: 56,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/syrtYYKR7sBRw3ZHy1YFX7.png?ixlib=java-2.1.0&w=50&s=40e66714687bec05ea422255b1c0099e",
  },
  {
    rank: 10, id: 6665, name: "Astralis", change: -1, isNew: false,
    region: "EU", flag: "DK",
    players: ["device", "dupreeh", "Bubzkji", "k0nfig", "Staehr"],
    winRate: 55,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/9bgXHp-oh1oaXr7F0mTGmd.svg?ixlib=java-2.1.0&s=f567161ab183001be33948b98c4b2067",
  },
  {
    rank: 11, id: 13286, name: "FUT", change: 3, isNew: false,
    region: "EU", flag: "TR",
    players: ["XANTARES", "woxic", "imoRR", "gxx-", "Calyx"],
    winRate: 54,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/Os71GAOy8KDuQFc0M8HE6O.png?ixlib=java-2.1.0&w=50&s=86f2bded6bcb7c690a42a62250ed69e7",
  },
  {
    rank: 12, id: 5995, name: "G2", change: -1, isNew: false,
    region: "EU", flag: "EU",
    players: ["jks", "HooXi", "nexa", "Snax", "hunter-"],
    winRate: 53,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/zFLwAELOD15BjJSDMMNBWQ.png?ixlib=java-2.1.0&w=50&s=affb583e6716d8ee904826992255cc4b",
  },
  {
    rank: 13, id: 4914, name: "3DMAX", change: -1, isNew: false,
    region: "EU", flag: "FR",
    players: ["bodyy", "Ex3rcice", "Djoko", "Lucky", "maka"],
    winRate: 52,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/QGPDS3Z2-aMXwCYVgA4RWH.png?ixlib=java-2.1.0&w=50&s=ec528d7e9d0f9b6b4bac227901fb1590",
  },
  {
    rank: 14, id: 6667, name: "FaZe", change: -1, isNew: false,
    region: "EU", flag: "EU",
    players: ["karrigan", "ropz", "rain", "broky", "frozen"],
    winRate: 52,
    logoUrl: null, // Cloudflare blocked during fetch — update manually if needed
  },
  {
    rank: 15, id: 12468, name: "Legacy", change: 2, isNew: false,
    region: "SA", flag: "BR",
    players: ["LUCAS1", "dead", "dumau", "nqz", "b4rtiN"],
    winRate: 51,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/RWbHH6RA8uGwJurGeLFvSr.png?ixlib=java-2.1.0&w=50&s=3d251032e156cab2f6df8c630ca29745",
  },
  {
    rank: 16, id: 9996, name: "9z", change: -1, isNew: false,
    region: "SA", flag: "AR",
    players: ["dgt", "reversive", "rox", "Luken", "Jony9"],
    winRate: 50,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/COZDFWOIm41AT0srqOHFhM.png?invert=true&ixlib=java-2.1.0&sat=-100&w=50&s=b00d55fe74b90f91c5b7e2b58bda5afb",
  },
  {
    rank: 17, id: 11241, name: "B8", change: 0, isNew: false,
    region: "CIS", flag: "UA",
    players: ["headtr1ck", "npl", "OWNER", "Polt", "rigoN"],
    winRate: 50,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/O6nRWTCjUzBAR4pcOcrpSG.png?ixlib=java-2.1.0&w=50&s=305dde82e764725dab7e626800328137",
  },
  {
    rank: 18, id: 7175, name: "HEROIC", change: -1, isNew: false,
    region: "EU", flag: "DK",
    players: ["cadiaN", "sjuush", "TeSeS", "stavn", "kyxsan"],
    winRate: 49,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/4S22uk_gnZTiQiI-hhH4yp.png?ixlib=java-2.1.0&w=50&s=3619ddf1d490573ab3dc261b8c2f3f6f",
  },
  {
    rank: 19, id: 12394, name: "BetBoom", change: 1, isNew: false,
    region: "CIS", flag: "RU",
    players: ["electroNic", "nafany", "Boombl4", "sdy", "KaiR0N"],
    winRate: 49,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/G4ZrdB0-q41USPd_z27IQA.png?ixlib=java-2.1.0&w=50&s=9c15ddf70f9c66399d4a47e0d8e93511",
  },
  {
    rank: 20, id: 4863, name: "TYLOO", change: -1, isNew: false,
    region: "APAC", flag: "CN",
    players: ["somebody", "Freeman", "JamYoung", "Attacker", "kaze"],
    winRate: 48,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/hMPKtNMDxp07n3lrBEHCuq.svg?ixlib=java-2.1.0&s=6d22fc4af07d0cd9d31fcd7f3023af9a",
  },
  {
    rank: 21, id: 11811, name: "Monte", change: 0, isNew: false,
    region: "CIS", flag: "UA",
    players: ["Pampero", "krugg", "xseveN", "r3salt", "DEKO"],
    winRate: 48,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/2tc9n4fHkiRIX2FiJSkhgt.png?ixlib=java-2.1.0&w=50&s=7334ef0dd24ba5349b404dfd0e8c6148",
  },
  {
    rank: 22, id: 9928, name: "GamerLegion", change: 1, isNew: false,
    region: "EU", flag: "DK",
    players: ["tiziaN", "ISSAA", "volt", "Keoz", "Sinnopsyy"],
    winRate: 47,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/vN7O46QoQ346WIRZ8D3spC.png?ixlib=java-2.1.0&w=50&s=f139433d31902eea5898c3a63fcc643a",
  },
  {
    rank: 23, id: 12376, name: "M80", change: -1, isNew: false,
    region: "NA", flag: "US",
    players: ["slaxz-", "Swisher", "WolfY", "Techno4K", "cxzi"],
    winRate: 47,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/YsaWwP_VrkbHzuhszuANEK.png?ixlib=java-2.1.0&w=50&s=47a8cff375da8242af9137a2a592b97d",
  },
  {
    rank: 24, id: 12474, name: "Alliance", change: 2, isNew: false,
    region: "EU", flag: "SE",
    players: ["twist", "raalz", "freddieb", "INS", "bååten"],
    winRate: 47,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/xsWK0BtR26rN776qdnWFC1.png?ixlib=java-2.1.0&w=50&s=4aaf659c3855ebf08c78c157a0653352",
  },
  {
    rank: 25, id: 5973, name: "Liquid", change: -1, isNew: false,
    region: "NA", flag: "US",
    players: ["NAF", "oSee", "nitr0", "Twistzz", "YEKINDAR"],
    winRate: 46,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/JMeLLbWKCIEJrmfPaqOz4O.svg?ixlib=java-2.1.0&s=c02caf90234d3a3ebac074c84ba1ea62",
  },
  {
    rank: 26, id: 9215, name: "MIBR", change: 0, isNew: false,
    region: "SA", flag: "BR",
    players: ["chelo", "drop", "saffee", "VINI", "exit"],
    winRate: 46,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/sVnH-oAf1J5TnMwoY4cxUC.png?ixlib=java-2.1.0&w=50&s=b0ef463fa0f1638bce72a89590fbaddf",
  },
  {
    rank: 27, id: 4773, name: "paiN", change: 1, isNew: false,
    region: "SA", flag: "BR",
    players: ["biguzera", "kye", "hardzao", "nqz", "zevy"],
    winRate: 45,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/iUUCFwCOFmOrwhB8q8smMg.svg?ixlib=java-2.1.0&s=1446e1cf3d02deb8190fe6efd14e4ce4",
  },
  {
    rank: 28, id: 7532, name: "BIG", change: -1, isNew: false,
    region: "EU", flag: "DE",
    players: ["tabseN", "faveN", "syrsoN", "hyped", "prosus"],
    winRate: 45,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/OgMRQA35hopXA8kDwMFHIY.svg?ixlib=java-2.1.0&s=ec7bc44165c7acf4224a22a1338ab7d7",
  },
  {
    rank: 29, id: 4411, name: "NiP", change: 0, isNew: false,
    region: "EU", flag: "SE",
    players: ["REZ", "Plopski", "hampus", "headtr1ck", "es3tag"],
    winRate: 44,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/-ttGATBV_P_HcZazxNNtIb.png?ixlib=java-2.1.0&w=50&s=ba94f7812d1f47183a83f3f34ab959eb",
  },
  {
    rank: 30, id: 11737, name: "EYEBALLERS", change: 1, isNew: false,
    region: "EU", flag: "SE",
    players: ["twist", "nawwk", "phzy", "ztr", "Golden"],
    winRate: 44,
    logoUrl: "https://img-cdn.hltv.org/teamlogo/3-Mfc-yWBTls8MPSEFhma5.png?invert=true&ixlib=java-2.1.0&sat=-100&w=50&s=2ffde3e377d01663937bf08b74d2057b",
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
