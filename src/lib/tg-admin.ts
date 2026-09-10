import { supabase } from "@/lib/supabase";

export async function createTournament(input: {
  name: string;
  type: string;
  status: string;
  stage: string;
  matches?: number;
  teams?: number;
  start_date?: string | null;
  end_date?: string | null;
  description?: string;
  banner_url?: string | null;
  logo_url?: string | null;
  is_current?: boolean;
  display_order?: number;
}) {
  const { data, error } = await supabase
    .from("tournaments")
    .insert({
      name: input.name,
      type: input.type,
      status: input.status,
      stage: input.stage,
      matches: input.matches ?? 0,
      teams: input.teams ?? 0,
      start_date: input.start_date ?? null,
      end_date: input.end_date ?? null,
      description: input.description ?? "",
      banner_url: input.banner_url ?? null,
      logo_url: input.logo_url ?? null,
      is_current: input.is_current ?? false,
      display_order: input.display_order ?? 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTournament(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("tournaments")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTournament(id: string) {
  const { error } = await supabase.from("tournaments").delete().eq("id", id);

  if (error) throw error;
}

export async function createTeam(input: {
  name: string;
  short_name: string;
  logo_url?: string | null;
  manager?: string | null;
  players?: number;
  status: string;
  region?: string | null;
  description?: string | null;
}) {
  const { data, error } = await supabase
    .from("teams")
    .insert({
      name: input.name,
      short_name: input.short_name,
      logo_url: input.logo_url ?? null,
      manager: input.manager ?? null,
      players: input.players ?? 0,
      status: input.status,
      region: input.region ?? null,
      description: input.description ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTeam(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("teams")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTeam(id: string) {
  const { error } = await supabase.from("teams").delete().eq("id", id);

  if (error) throw error;
}

export async function createPlayer(input: {
  name: string;
  team_id?: string | null;
  team_name?: string | null;
  role: string;
  kills?: number;
  matches?: number;
  status: string;
  avatar_url?: string | null;
  bio?: string | null;
}) {
  const { data, error } = await supabase
    .from("players")
    .insert({
      name: input.name,
      team_id: input.team_id ?? null,
      team_name: input.team_name ?? null,
      role: input.role,
      kills: input.kills ?? 0,
      matches: input.matches ?? 0,
      status: input.status,
      avatar_url: input.avatar_url ?? null,
      bio: input.bio ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePlayer(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("players")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePlayer(id: string) {
  const { error } = await supabase.from("players").delete().eq("id", id);

  if (error) throw error;
}

export async function createMatch(input: {
  tournament_id: string;
  match_number: number;
  map: string;
  status: string;
  match_date?: string | null;
  match_time?: string | null;
  teams?: number;
  total_kills?: number;
  stream_url?: string | null;
  room_id?: string | null;
  room_password?: string | null;
  notes?: string | null;
}) {
  const { data, error } = await supabase
    .from("matches")
    .insert({
      tournament_id: input.tournament_id,
      match_number: input.match_number,
      map: input.map,
      status: input.status,
      match_date: input.match_date ?? null,
      match_time: input.match_time ?? null,
      teams: input.teams ?? 0,
      total_kills: input.total_kills ?? 0,
      stream_url: input.stream_url ?? null,
      room_id: input.room_id ?? null,
      room_password: input.room_password ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMatch(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("matches")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMatch(id: string) {
  const { error } = await supabase.from("matches").delete().eq("id", id);

  if (error) throw error;
}
