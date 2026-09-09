import { supabase } from "@/lib/supabase";

export type CircuitMode = "official" | "scrims";

export type Tournament = {
  id: string;
  name: string;
  status: string;
  phase: string;
  matches: number;
  teams: number | string;
  type: string;
  startDate: string | null;
  endDate: string | null;
  description: string;
  bannerUrl: string | null;
  logoUrl: string | null;
  isCurrent: boolean;
  displayOrder: number;
};

export type Match = {
  id: string;
  tournamentId: string;
  number: number;
  map: string;
  status: string;
  matchDate: string | null;
  matchTime: string | null;
  teams: number;
  totalKills: number;
  streamUrl: string | null;
  roomId: string | null;
  roomPassword: string | null;
  notes: string | null;
};

export type Player = {
  id: string;
  name: string;
  teamId: string | null;
  teamName: string | null;
  role: string;
  kills: number;
  matches: number;
  status: string;
  avatarUrl: string | null;
  bio: string | null;
};

export type Team = {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string | null;
  manager: string | null;
  players: number;
  status: string;
  region: string | null;
  description: string | null;
};

function normalizeMode(value: unknown): CircuitMode | null {
  const normalized = String(value ?? "").toLowerCase().trim();

  if (normalized === "official") {
    return "official";
  }

  if (normalized === "scrims" || normalized === "scrim") {
    return "scrims";
  }

  return null;
}

function normalizeStatus(value: unknown): string {
  return String(value ?? "").toUpperCase();
}

function mapTournament(row: Record<string, unknown>): Tournament {
  return {
    id: String(row.id),
    name: String(row.name ?? "UNTITLED TOURNAMENT"),
    status: normalizeStatus(row.status),
    phase: String(row.stage ?? ""),
    matches: Number(row.matches ?? 0),
    teams: Number(row.teams ?? 0),
    type: String(row.type ?? ""),
    startDate: row.start_date
      ? String(row.start_date)
      : null,
    endDate: row.end_date
      ? String(row.end_date)
      : null,
    description: String(row.description ?? ""),
    bannerUrl: row.banner_url
      ? String(row.banner_url)
      : null,
    logoUrl: row.logo_url
      ? String(row.logo_url)
      : null,
    isCurrent: Boolean(row.is_current),
    displayOrder: Number(row.display_order ?? 0),
  };
}

function mapMatch(row: Record<string, unknown>): Match {
  return {
    id: String(row.id),
    tournamentId: String(row.tournament_id),
    number: Number(row.match_number ?? 0),
    map: String(row.map ?? ""),
    status: normalizeStatus(row.status),
    matchDate: row.match_date
      ? String(row.match_date)
      : null,
    matchTime: row.match_time
      ? String(row.match_time)
      : null,
    teams: Number(row.teams ?? 0),
    totalKills: Number(row.total_kills ?? 0),
    streamUrl: row.stream_url
      ? String(row.stream_url)
      : null,
    roomId: row.room_id
      ? String(row.room_id)
      : null,
    roomPassword: row.room_password
      ? String(row.room_password)
      : null,
    notes: row.notes
      ? String(row.notes)
      : null,
  };
}

function mapPlayer(row: Record<string, unknown>): Player {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    teamId: row.team_id
      ? String(row.team_id)
      : null,
    teamName: row.team_name
      ? String(row.team_name)
      : null,
    role: String(row.role ?? ""),
    kills: Number(row.kills ?? 0),
    matches: Number(row.matches ?? 0),
    status: normalizeStatus(row.status),
    avatarUrl: row.avatar_url
      ? String(row.avatar_url)
      : null,
    bio: row.bio
      ? String(row.bio)
      : null,
  };
}

function mapTeam(row: Record<string, unknown>): Team {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    shortName: String(row.short_name ?? ""),
    logoUrl: row.logo_url
      ? String(row.logo_url)
      : null,
    manager: row.manager
      ? String(row.manager)
      : null,
    players: Number(row.players ?? 0),
    status: normalizeStatus(row.status),
    region: row.region
      ? String(row.region)
      : null,
    description: row.description
      ? String(row.description)
      : null,
  };
}

export async function getTournaments(
  mode: CircuitMode,
): Promise<Tournament[]> {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? [])
    .filter((row) => normalizeMode(row.type) === mode)
    .map(mapTournament);
}

export async function getCurrentTournament(
  mode: CircuitMode,
): Promise<Tournament | null> {
  const tournaments = await getTournaments(mode);

  return (
    tournaments.find((tournament) => tournament.isCurrent) ??
    tournaments.find((tournament) => tournament.status === "LIVE") ??
    tournaments[0] ??
    null
  );
}

export async function getMatches(
  tournamentId: string,
): Promise<Match[]> {
  if (!tournamentId) {
    return [];
  }

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("match_number", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapMatch);
}

export async function getTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapTeam);
}

export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapPlayer);
}
