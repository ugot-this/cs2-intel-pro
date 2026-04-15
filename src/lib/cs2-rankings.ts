/**
 * HLTV Top 30 CS2 team rankings — hardcoded static data
 * Last updated: April 2026
 * Source: hltv.org/ranking/teams
 */

export interface HLTVTeam {
  rank: number;
  id: number;
  name: string;
  change: number;
  isNew: boolean;
}

export const HLTV_TOP30: HLTVTeam[] = [
  { rank: 1,  id: 9565,  name: "Vitality",      change: 0,  isNew: false },
  { rank: 2,  id: 4608,  name: "NAVI",           change: 0,  isNew: false },
  { rank: 3,  id: 8297,  name: "FURIA",          change: 1,  isNew: false },
  { rank: 4,  id: 12467, name: "PARIVISION",     change: -1, isNew: false },
  { rank: 5,  id: 11283, name: "Falcons",        change: 0,  isNew: false },
  { rank: 6,  id: 11861, name: "Aurora",         change: 2,  isNew: false },
  { rank: 7,  id: 6248,  name: "The MongolZ",    change: -1, isNew: false },
  { rank: 8,  id: 4494,  name: "MOUZ",           change: -1, isNew: false },
  { rank: 9,  id: 7020,  name: "Spirit",         change: 1,  isNew: false },
  { rank: 10, id: 6665,  name: "Astralis",       change: -1, isNew: false },
  { rank: 11, id: 13286, name: "FUT",            change: 3,  isNew: false },
  { rank: 12, id: 5995,  name: "G2",             change: -1, isNew: false },
  { rank: 13, id: 4914,  name: "3DMAX",          change: -1, isNew: false },
  { rank: 14, id: 6667,  name: "FaZe",           change: -1, isNew: false },
  { rank: 15, id: 12468, name: "Legacy",         change: 2,  isNew: false },
  { rank: 16, id: 9996,  name: "9z",             change: -1, isNew: false },
  { rank: 17, id: 11241, name: "B8",             change: 0,  isNew: false },
  { rank: 18, id: 7175,  name: "HEROIC",         change: -1, isNew: false },
  { rank: 19, id: 12394, name: "BetBoom",        change: 1,  isNew: false },
  { rank: 20, id: 4863,  name: "TYLOO",          change: -1, isNew: false },
  { rank: 21, id: 11811, name: "Monte",          change: 0,  isNew: false },
  { rank: 22, id: 9928,  name: "GamerLegion",    change: 1,  isNew: false },
  { rank: 23, id: 12376, name: "M80",            change: -1, isNew: false },
  { rank: 24, id: 12474, name: "Alliance",       change: 2,  isNew: false },
  { rank: 25, id: 5973,  name: "Liquid",         change: -1, isNew: false },
  { rank: 26, id: 9215,  name: "MIBR",           change: 0,  isNew: false },
  { rank: 27, id: 4773,  name: "paiN",           change: 1,  isNew: false },
  { rank: 28, id: 7532,  name: "BIG",            change: -1, isNew: false },
  { rank: 29, id: 4411,  name: "NiP",            change: 0,  isNew: false },
  { rank: 30, id: 11737, name: "EYEBALLERS",     change: 1,  isNew: false },
];

/** Upcoming CS2 events — hardcoded for current cycle */
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
