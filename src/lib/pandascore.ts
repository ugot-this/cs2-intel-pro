/**
 * PandaScore CS2 API client
 * Docs: https://developers.pandascore.co
 * Free tier: 1000 req/hour
 */

const BASE = "https://api.pandascore.co";

function apiKey(): string {
  return process.env.PANDASCORE_API_KEY ?? "";
}

// ─── Types ───────────────────────────────────────────────────

export interface PSPlayer {
  id: number;
  name: string;
  first_name: string | null;
  last_name: string | null;
  nationality: string | null;
  image_url: string | null;
}

export interface PSTeam {
  id: number;
  name: string;
  acronym: string | null;
  image_url: string | null;
  location: string | null;
  players: PSPlayer[];
}

export interface PSLeague {
  id: number;
  name: string;
  image_url: string | null;
  url: string | null;
}

export interface PSSerie {
  id: number;
  name: string | null;
  full_name: string;
  season: string | null;
  year: number | null;
}

export interface PSTournament {
  id: number;
  name: string;
  slug: string;
  prizepool: string | null;
}

export interface PSGame {
  id: number;
  position: number;
  status: "not_started" | "running" | "finished";
  winner: { id: number; type: "Team" } | null;
  map: { id: number; name: string; image_url: string | null } | null;
}

export interface PSMatch {
  id: number;
  name: string;
  slug: string;
  status: "not_started" | "running" | "finished" | "canceled";
  scheduled_at: string | null;
  begin_at: string | null;
  end_at: string | null;
  match_type: string; // "best_of"
  number_of_games: number; // 1=BO1, 3=BO3, 5=BO5
  league: PSLeague;
  serie: PSSerie;
  tournament: PSTournament;
  opponents: Array<{ opponent: PSTeam; type: "Team" }>;
  results: Array<{ score: number; team_id: number }>;
  winner: PSTeam | null;
  winner_id: number | null;
  games: PSGame[];
  streams_list: Array<{ raw_url: string; main: boolean; language: string }>;
}

export interface PSTeamStats {
  wins: number;
  losses: number;
  matches_count: number;
}

// ─── Fetch helper ─────────────────────────────────────────────

export function hasPandaScoreKey(): boolean {
  return !!process.env.PANDASCORE_API_KEY;
}

async function get<T>(
  path: string,
  params: Record<string, string> = {},
  revalidate = 300
): Promise<T> {
  const key = apiKey();
  if (!key) throw new Error("NO_API_KEY");

  const url = new URL(`${BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
    next: { revalidate },
  });

  if (res.status === 401) throw new Error("PandaScore API key буруу байна");
  if (res.status === 429) throw new Error("PandaScore rate limit хэтэрлээ");
  if (!res.ok) throw new Error(`PandaScore ${res.status}: ${path}`);

  return res.json() as T;
}

// ─── Public functions ─────────────────────────────────────────

/** Удахгүй болох тоглоомууд — /csgo болон /cs2 хоёуланг туршина */
export async function getUpcomingMatches(perPage = 20): Promise<PSMatch[]> {
  // CS2 шинэ endpoint-г эхлээд туршина, дараа нь csgo fallback
  const [cs2, csgo] = await Promise.allSettled([
    get<PSMatch[]>("/cs2/matches/upcoming", {
      per_page: String(perPage),
      sort: "scheduled_at",
    }, 300),
    get<PSMatch[]>("/csgo/matches/upcoming", {
      per_page: String(perPage),
      sort: "scheduled_at",
    }, 300),
  ]);

  const cs2List = cs2.status === "fulfilled" ? cs2.value : [];
  const csgoList = csgo.status === "fulfilled" ? csgo.value : [];

  // Давхардлыг арилган нэгтгэнэ
  const seen = new Set<number>();
  const merged: PSMatch[] = [];
  for (const m of [...cs2List, ...csgoList]) {
    if (!seen.has(m.id)) { seen.add(m.id); merged.push(m); }
  }
  return merged.sort((a, b) =>
    new Date(a.scheduled_at ?? a.begin_at ?? 0).getTime() -
    new Date(b.scheduled_at ?? b.begin_at ?? 0).getTime()
  );
}

/** Одоо явагдаж байгаа тоглоомууд — 1 минут кэш */
export async function getRunningMatches(): Promise<PSMatch[]> {
  const [cs2, csgo] = await Promise.allSettled([
    get<PSMatch[]>("/cs2/matches/running", { per_page: "10" }, 60),
    get<PSMatch[]>("/csgo/matches/running", { per_page: "10" }, 60),
  ]);
  const cs2List = cs2.status === "fulfilled" ? cs2.value : [];
  const csgoList = csgo.status === "fulfilled" ? csgo.value : [];
  const seen = new Set<number>();
  return [...cs2List, ...csgoList].filter(m => {
    if (seen.has(m.id)) return false;
    seen.add(m.id); return true;
  });
}

/**
 * Өргөн хайлт: upcoming хоосон үед scheduled + not_started тоглоомуудыг авна.
 * /csgo болон /cs2 хоёуланг туршина.
 */
export async function getAllMatches(perPage = 20): Promise<PSMatch[]> {
  const paths = [
    "/cs2/matches",
    "/csgo/matches",
  ];
  const params = {
    per_page: String(perPage),
    "filter[status]": "not_started",
    sort: "scheduled_at",
  };
  const results = await Promise.allSettled(
    paths.map(p => get<PSMatch[]>(p, params, 300))
  );
  const seen = new Set<number>();
  const merged: PSMatch[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") {
      for (const m of r.value) {
        if (!seen.has(m.id)) { seen.add(m.id); merged.push(m); }
      }
    }
  }
  return merged.sort((a, b) =>
    new Date(a.scheduled_at ?? a.begin_at ?? 0).getTime() -
    new Date(b.scheduled_at ?? b.begin_at ?? 0).getTime()
  );
}

/** Дэлхийн шилдэг багууд — 1 цаг кэш */
export async function getTopTeams(perPage = 30): Promise<PSTeam[]> {
  return get<PSTeam[]>("/csgo/teams", {
    per_page: String(perPage),
    "filter[location]": "",
  }, 3600);
}

/** Тодорхой багийн сүүлийн тоглоомын үр дүн — 1 цаг кэш */
export async function getTeamRecentMatches(teamId: number, perPage = 10): Promise<PSMatch[]> {
  return get<PSMatch[]>(`/csgo/teams/${teamId}/matches`, {
    per_page: String(perPage),
    sort: "-scheduled_at",
    "filter[status]": "finished",
  }, 3600);
}

/** Тоглоомын дэлгэрэнгүй мэдээлэл */
export async function getMatch(matchId: number): Promise<PSMatch> {
  return get<PSMatch>(`/csgo/matches/${matchId}`, {}, 60);
}

// ─── Helpers ──────────────────────────────────────────────────

/** BO format текст */
export function formatBO(n: number): string {
  return n === 1 ? "BO1" : n === 3 ? "BO3" : n === 5 ? "BO5" : `BO${n}`;
}

/** Тоглоомын эхлэх хугацаа */
export function matchStartTime(m: PSMatch): string {
  return m.scheduled_at ?? m.begin_at ?? new Date().toISOString();
}

/** Цаг хэдэн цагийн дараа эхлэх */
export function relativeTime(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  const hours = Math.round(diff / 3_600_000);
  if (diff < 0) return "Явагдаж байна";
  if (hours === 0) return "Удахгүй";
  if (hours < 24) return `${hours} цагийн дараа`;
  return `${Math.ceil(hours / 24)} өдрийн дараа`;
}

/**
 * Багийн ялалтын хувийг тооцоолох
 * Сүүлийн тоглоомуудаас тооцно
 */
export function computeWinRate(matches: PSMatch[], teamId: number): number {
  const finished = matches.filter(m => m.status === "finished" && m.winner_id !== null);
  if (!finished.length) return 50;
  const wins = finished.filter(m => m.winner_id === teamId).length;
  return Math.round((wins / finished.length) * 100);
}

/**
 * 2 багийн харьцуулалтад үндэслэн ялах магадлал тооцоолох
 * Энгийн ELO-д суурилсан алгоритм
 */
export function predictWinProbability(
  winRateA: number,
  winRateB: number
): { teamAWinPct: number; confidence: number } {
  const ratingA = winRateA / 100;
  const ratingB = winRateB / 100;
  const total = ratingA + ratingB;
  const teamAWinPct = total > 0 ? Math.round((ratingA / total) * 100) : 50;

  // Ялгаа их байх тусам итгэл өндөр
  const diff = Math.abs(winRateA - winRateB);
  const confidence = Math.min(80, 50 + diff);

  return { teamAWinPct, confidence };
}

/**
 * Сүүлийн тоглоомуудаас хэлбэр (W/L) гаргах
 */
export function computeRecentForm(
  matches: PSMatch[],
  teamId: number,
  count = 5
): ("W" | "L")[] {
  return matches
    .filter(m => m.status === "finished" && m.winner_id !== null)
    .slice(0, count)
    .map(m => (m.winner_id === teamId ? "W" : "L"));
}

/**
 * Байршлаас region авах
 */
export function regionFromLocation(location: string | null): string {
  if (!location) return "EU";
  const code = location.toUpperCase();
  const naCountries = ["US", "CA", "MX", "BR", "AR", "CL", "CO"];
  const cisCountries = ["RU", "UA", "KZ", "BY", "GE", "AZ", "UZ"];
  const apacCountries = ["CN", "KR", "AU", "JP", "TH", "SG", "PH", "MN"];
  if (naCountries.includes(code)) return "NA";
  if (cisCountries.includes(code)) return "CIS";
  if (apacCountries.includes(code)) return "APAC";
  return "EU";
}

/**
 * Коэффициент тооцоолох (win probability-оос)
 */
export function oddsFromProbability(winPct: number): number {
  if (winPct <= 0 || winPct >= 100) return 2.0;
  return Math.round((100 / winPct) * 100) / 100;
}
