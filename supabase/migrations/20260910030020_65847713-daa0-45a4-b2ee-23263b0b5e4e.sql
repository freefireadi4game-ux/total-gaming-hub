CREATE TABLE public.tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'UPCOMING',
  stage text NOT NULL DEFAULT '',
  matches integer NOT NULL DEFAULT 0,
  teams integer NOT NULL DEFAULT 0,
  start_date date,
  end_date date,
  description text NOT NULL DEFAULT '',
  banner_url text,
  logo_url text,
  is_current boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tournaments TO anon, authenticated;
GRANT ALL ON public.tournaments TO service_role;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view tournaments" ON public.tournaments FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text NOT NULL,
  logo_url text,
  manager text,
  players integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'ACTIVE',
  region text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.teams TO anon, authenticated;
GRANT ALL ON public.teams TO service_role;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  team_name text,
  role text NOT NULL DEFAULT 'Player',
  kills integer NOT NULL DEFAULT 0,
  matches integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'ACTIVE',
  avatar_url text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.players TO anon, authenticated;
GRANT ALL ON public.players TO service_role;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view players" ON public.players FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  match_number integer NOT NULL,
  map text NOT NULL,
  status text NOT NULL DEFAULT 'UPCOMING',
  match_date date,
  match_time text,
  teams integer NOT NULL DEFAULT 0,
  total_kills integer NOT NULL DEFAULT 0,
  stream_url text,
  room_id text,
  room_password text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.matches TO anon, authenticated;
GRANT ALL ON public.matches TO service_role;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view matches" ON public.matches FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.match_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  team_name text,
  position integer NOT NULL DEFAULT 0,
  kills integer NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.match_results TO anon, authenticated;
GRANT ALL ON public.match_results TO service_role;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view match results" ON public.match_results FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.player_match_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  kills integer NOT NULL DEFAULT 0,
  damage integer NOT NULL DEFAULT 0,
  assists integer NOT NULL DEFAULT 0,
  placement integer,
  points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.player_match_stats TO anon, authenticated;
GRANT ALL ON public.player_match_stats TO service_role;
ALTER TABLE public.player_match_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view player match stats" ON public.player_match_stats FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.teams (id, name, short_name, players, status, region, description)
VALUES ('10000000-0000-0000-0000-000000000001', 'Total Gaming', 'TG', 4, 'ACTIVE', 'India', 'Total Gaming competitive Free Fire roster');

INSERT INTO public.players (id, name, team_id, team_name, role, kills, matches, status, bio)
VALUES
  ('20000000-0000-0000-0000-000000000001', 'TG Ace', '10000000-0000-0000-0000-000000000001', 'Total Gaming', 'Rusher', 14, 3, 'ACTIVE', 'Aggressive entry fragger'),
  ('20000000-0000-0000-0000-000000000002', 'TG Raistar', '10000000-0000-0000-0000-000000000001', 'Total Gaming', 'Support', 9, 3, 'ACTIVE', 'Clutch support player'),
  ('20000000-0000-0000-0000-000000000003', 'TG Scout', '10000000-0000-0000-0000-000000000001', 'Total Gaming', 'IGL', 8, 3, 'ACTIVE', 'In-game leader'),
  ('20000000-0000-0000-0000-000000000004', 'TG Jonathan', '10000000-0000-0000-0000-000000000001', 'Total Gaming', 'Flex', 7, 3, 'ACTIVE', 'Flexible rifler');

INSERT INTO public.tournaments (id, name, type, status, stage, matches, teams, start_date, end_date, description, is_current, display_order)
VALUES
  ('30000000-0000-0000-0000-000000000001', 'FFMIC Fall 2026', 'OFFICIAL', 'LIVE', 'League Stage', 6, 18, CURRENT_DATE - 2, CURRENT_DATE + 12, 'Official Total Gaming tournament circuit', true, 1),
  ('30000000-0000-0000-0000-000000000002', 'TG Night Scrims', 'SCRIMS', 'LIVE', 'Practice Week 3', 4, 12, CURRENT_DATE - 1, CURRENT_DATE + 6, 'Daily practice lobby results', true, 2);

INSERT INTO public.matches (id, tournament_id, match_number, map, status, match_date, match_time, teams, total_kills, notes)
VALUES
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 1, 'Bermuda', 'COMPLETED', CURRENT_DATE, '18:30', 18, 11, 'Strong opening rotation'),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 2, 'Purgatory', 'LIVE', CURRENT_DATE, '19:15', 18, 8, 'Live match in progress'),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 3, 'Alpine', 'UPCOMING', CURRENT_DATE, '20:00', 18, 0, 'Next official match'),
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', 1, 'Bermuda', 'COMPLETED', CURRENT_DATE, '21:30', 12, 9, 'Scrim lobby result'),
  ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', 2, 'Kalahari', 'UPCOMING', CURRENT_DATE, '22:15', 12, 0, 'Next scrim lobby');

INSERT INTO public.match_results (match_id, team_id, team_name, position, kills, points)
VALUES
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Total Gaming', 2, 11, 20),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Total Gaming', 1, 8, 20),
  ('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Total Gaming', 3, 9, 17);

INSERT INTO public.player_match_stats (match_id, player_id, team_id, kills, damage, assists, placement, points)
VALUES
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 5, 1180, 2, 2, 5),
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 3, 820, 4, 2, 3),
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 2, 670, 3, 2, 2),
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 1, 410, 2, 2, 1),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 4, 950, 3, 1, 4),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 2, 610, 4, 1, 2),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 1, 380, 2, 1, 1),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 1, 290, 1, 1, 1),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 3, 720, 2, 3, 3),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 2, 530, 3, 3, 2),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 2, 440, 2, 3, 2),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 2, 320, 1, 3, 2);