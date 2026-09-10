import { supabase } from "@/lib/supabase";

export type CircuitMode = "official" | "scrims";

export type Tournament = {
  id: string;
  name: string;
  status: string;
  phase: string;
  matches: number;
  teams: number;
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

export type MatchResult = {
  id: string;
  matchId: string;
  teamId: string | null;
  teamName: string | null;
  position: number;
  kills: number;
  points: number;
};

export type PlayerMatchStat = {
  id: string;
  matchId: string;
  playerId: string;
  teamId: string | null;
  kills: number;
  damage: number;
  assists: number;
  placement: number | null;
  points: number;
};

function text(value: unknown): string {
  return String(value ?? "");
}

function num(value: unknown): number {
  return Number(value ?? 0);
}

function nullableText(
  value: unknown,
): string | null {
  return value == null || value === ""
    ? null
    : String(value);
}

function normalizeMode(
  value: unknown,
): CircuitMode | null {
  const v = text(value).toLowerCase().trim();

  if (v === "official") return "official";
  if (v === "scrim" || v === "scrims") {
    return "scrims";
  }

  return null;
}

function mapTournament(
  row: Record<string, unknown>,
): Tournament {
  return {
    id: text(row["id"]),
    name: text(row["name"]),
    status: text(row["status"]).toUpperCase(),
    phase: text(row["stage"]),
    matches: num(row["matches"]),
    teams: num(row["teams"]),
    type: text(row["type"]),
    startDate: nullableText(row["start_date"]),
    endDate: nullableText(row["end_date"]),
    description: text(row["description"]),
    bannerUrl: nullableText(row["banner_url"]),
    logoUrl: nullableText(row["logo_url"]),
    isCurrent: Boolean(row["is_current"]),
    displayOrder: num(row["display_order"]),
  };
}

function mapMatch(
  row: Record<string, unknown>,
): Match {
  return {
    id: text(row["id"]),
    tournamentId: text(row["tournament_id"]),
    number: num(row["match_number"]),
    map: text(row["map"]),
    status: text(row["status"]).toUpperCase(),
    matchDate: nullableText(row["match_date"]),
    matchTime: nullableText(row["match_time"]),
    teams: num(row["teams"]),
    totalKills: num(row["total_kills"]),
    streamUrl: nullableText(row["stream_url"]),
    roomId: nullableText(row["room_id"]),
    roomPassword: nullableText(
      row["room_password"],
    ),
    notes: nullableText(row["notes"]),
  };
}

function mapTeam(
  row: Record<string, unknown>,
): Team {
  return {
    id: text(row["id"]),
    name: text(row["name"]),
    shortName: text(row["short_name"]),
    logoUrl: nullableText(row["logo_url"]),
    manager: nullableText(row["manager"]),
    players: num(row["players"]),
    status: text(row["status"]).toUpperCase(),
    region: nullableText(row["region"]),
    description: nullableText(row["description"]),
  };
}

function mapPlayer(
  row: Record<string, unknown>,
): Player {
  return {
    id: text(row["id"]),
    name: text(row["name"]),
    teamId: nullableText(row["team_id"]),
    teamName: nullableText(row["team_name"]),
    role: text(row["role"]),
    kills: num(row["kills"]),
    matches: num(row["matches"]),
    status: text(row["status"]).toUpperCase(),
    avatarUrl: nullableText(row["avatar_url"]),
    bio: nullableText(row["bio"]),
  };
}

function mapMatchResult(
  row: Record<string, unknown>,
): MatchResult {
  return {
    id: text(row["id"]),
    matchId: text(row["match_id"]),
    teamId: nullableText(row["team_id"]),
    teamName: nullableText(row["team_name"]),
    position: num(row["position"]),
    kills: num(row["kills"]),
    points: num(row["points"]),
  };
}

function mapPlayerMatchStat(
  row: Record<string, unknown>,
): PlayerMatchStat {
  return {
    id: text(row["id"]),
    matchId: text(row["match_id"]),
    playerId: text(row["player_id"]),
    teamId: nullableText(row["team_id"]),
    kills: num(row["kills"]),
    damage: num(row["damage"]),
    assists: num(row["assists"]),
    placement:
      row["placement"] == null
        ? null
        : num(row["placement"]),
    points: num(row["points"]),
  };
}

export async function getTournaments(
  mode: CircuitMode,
): Promise<Tournament[]> {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .order("display_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return (data ?? [])
    .filter(
      (row: Record<string, unknown>) =>
        normalizeMode(row["type"]) === mode,
    )
    .map(mapTournament);
}

export async function getCurrentTournament(
  mode: CircuitMode,
) {
  const tournaments =
    await getTournaments(mode);

  return (
    tournaments.find(
      (t) => t.isCurrent,
    ) ??
    tournaments.find(
      (t) => t.status === "LIVE",
    ) ??
    tournaments[0] ??
    null
  );
}

export async function getMatches(
  tournamentId: string,
): Promise<Match[]> {
  if (!tournamentId) return [];

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq(
      "tournament_id",
      tournamentId,
    )
    .order("match_number", {
      ascending: true,
    });

  if (error) throw error;

  return (data ?? []).map(mapMatch);
}

export async function getTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("name", {
      ascending: true,
    });

  if (error) throw error;

  return (data ?? []).map(mapTeam);
}

export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("kills", {
      ascending: false,
    })
    .order("name", {
      ascending: true,
    });

  if (error) throw error;

  return (data ?? []).map(mapPlayer);
}

export async function getMatchResults(
  matchIds: string[],
): Promise<MatchResult[]> {
  if (matchIds.length === 0) return [];

  const { data, error } = await supabase
    .from("match_results")
    .select("*")
    .in("match_id", matchIds)
    .order("position", {
      ascending: true,
    });

  if (error) throw error;

  return (data ?? []).map(mapMatchResult);
}

export async function getPlayerMatchStats(
  matchIds: string[],
): Promise<PlayerMatchStat[]> {
  if (matchIds.length === 0) return [];

  const { data, error } = await supabase
    .from("player_match_stats")
    .select("*")
    .in("match_id", matchIds);

  if (error) throw error;

  return (data ?? []).map(
    mapPlayerMatchStat,
  );
}

export async function getTournamentData(
  tournamentId: string,
) {
  const matches =
    await getMatches(tournamentId);

  const matchIds = matches.map(
    (match) => match.id,
  );

  const [
    matchResults,
    playerMatchStats,
  ] = await Promise.all([
    getMatchResults(matchIds),
    getPlayerMatchStats(matchIds),
  ]);

  return {
    matches,
    matchResults,
    playerMatchStats,
  };
}
