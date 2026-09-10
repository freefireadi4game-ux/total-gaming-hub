import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Crosshair,
  Flame,
  Gamepad2,
  Menu,
  Play,
  Shield,
  Target,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";

import {
  getPlayers,
  getTournamentData,
  getTournaments,
  type CircuitMode,
  type Match,
  type Player,
  type PlayerMatchStat,
  type Tournament,
  type MatchResult,
} from "@/lib/tg-data";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

type Stage = {
  id: string;
  label: string;
  shortLabel: string;
  tournamentId: string;
};

type MatchView = Match & {
  result?: MatchResult;
};

type FragEntry = {
  id: string;
  name: string;
  team: string;
  avatar: string | null;
  kills: number;
  matches: number;
  points: number;
};

function Dashboard() {
  const [mode, setMode] = useState<CircuitMode>("official");
  const [mobileNav, setMobileNav] = useState(false);

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  const [selectedTournamentId, setSelectedTournamentId] = useState<
    string | null
  >(null);

  const [selectedStage, setSelectedStage] = useState<string>("all");

  const [matches, setMatches] = useState<Match[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerMatchStat[]>([]);

  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingTournament, setLoadingTournament] = useState(false);

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const [eventMenuOpen, setEventMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      setLoadingEvents(true);

      try {
        const data = await getTournaments(mode);

        if (!active) return;

        setTournaments(data);

        const current =
          data.find((t) => t.isCurrent) ??
          data.find((t) => t.status === "LIVE") ??
          data[0] ??
          null;

        setSelectedTournamentId(current?.id ?? null);
        setSelectedStage("all");
      } catch (error) {
        console.error("Tournament loading error:", error);
        setTournaments([]);
        setSelectedTournamentId(null);
      } finally {
        if (active) setLoadingEvents(false);
      }
    }

    void loadEvents();

    return () => {
      active = false;
    };
  }, [mode]);

  useEffect(() => {
    let active = true;

    async function loadTournament() {
      if (!selectedTournamentId) {
        setMatches([]);
        setResults([]);
        setPlayerStats([]);
        return;
      }

      setLoadingTournament(true);

      try {
        const data = await getTournamentData(selectedTournamentId);

        if (!active) return;

        setMatches(data.matches);
        setResults(data.matchResults);
        setPlayerStats(data.playerMatchStats);
      } catch (error) {
        console.error("Tournament data error:", error);
        setMatches([]);
        setResults([]);
        setPlayerStats([]);
      } finally {
        if (active) setLoadingTournament(false);
      }
    }

    void loadTournament();

    return () => {
      active = false;
    };
  }, [selectedTournamentId]);

  useEffect(() => {
    let active = true;

    async function loadPlayerDirectory() {
      try {
        const data = await getPlayers();

        if (active) setPlayers(data);
      } catch (error) {
        console.error("Players loading error:", error);
      }
    }

    void loadPlayerDirectory();

    return () => {
      active = false;
    };
  }, []);

  const selectedTournament = useMemo(() => {
    return (
      tournaments.find((t) => t.id === selectedTournamentId) ??
      tournaments.find((t) => t.isCurrent) ??
      tournaments.find((t) => t.status === "LIVE") ??
      tournaments[0] ??
      null
    );
  }, [tournaments, selectedTournamentId]);

  /*
   * The database currently stores stage/phase on tournaments.
   * If an event is split into multiple tournament records,
   * each record naturally becomes a selectable stage.
   */
  const stages = useMemo<Stage[]>(() => {
    if (!selectedTournament) return [];

    const sameEvent = tournaments.filter((t) => {
      const normalizedSelected = selectedTournament.name
        .toLowerCase()
        .replace(/\s+(stage|week|day)\s*\d+/gi, "")
        .trim();

      const normalizedCurrent = t.name
        .toLowerCase()
        .replace(/\s+(stage|week|day)\s*\d+/gi, "")
        .trim();

      return (
        normalizedCurrent === normalizedSelected ||
        t.id === selectedTournament.id
      );
    });

    const source = sameEvent.length > 1 ? sameEvent : [selectedTournament];

    return source.map((t, index) => ({
      id: t.id,
      tournamentId: t.id,
      label:
        t.phase ||
        (source.length > 1 ? `Stage ${index + 1}` : "Overall Stage"),
      shortLabel:
        t.phase ||
        (source.length > 1 ? `S${index + 1}` : "OVERALL"),
    }));
  }, [selectedTournament, tournaments]);

  const activeTournament =
    selectedStage !== "all"
      ? tournaments.find((t) => t.id === selectedStage) ??
        selectedTournament
      : selectedTournament;

  const activeMatches = useMemo(() => {
    if (!selectedTournament) return [];

    if (
      selectedStage !== "all" &&
      activeTournament &&
      activeTournament.id !== selectedTournament.id
    ) {
      return matches;
    }

    return matches;
  }, [matches, selectedStage, selectedTournament, activeTournament]);

  const matchResultsByMatch = useMemo(() => {
    const map = new Map<string, MatchResult[]>();

    for (const result of results) {
      const current = map.get(result.matchId) ?? [];
      current.push(result);
      map.set(result.matchId, current);
    }

    return map;
  }, [results]);

  const teamResults = useMemo(() => {
    const totals = new Map<
      string,
      {
        team: string;
        points: number;
        kills: number;
        placement: number;
        matches: number;
      }
    >();

    for (const result of results) {
      const key = result.teamId ?? result.teamName ?? result.id;

      const current = totals.get(key) ?? {
        team: result.teamName || "Unknown Team",
        points: 0,
        kills: 0,
        placement: 0,
        matches: 0,
      };

      current.points += Number(result.points ?? 0);
      current.kills += Number(result.kills ?? 0);
      current.placement += Math.max(
        0,
        Number(result.points ?? 0) - Number(result.kills ?? 0)
      );
      current.matches += 1;

      totals.set(key, current);
    }

    return [...totals.values()].sort((a, b) => b.points - a.points);
  }, [results]);

  const topTeam = teamResults[0] ?? null;

  const selectedTeamRank = topTeam ? 1 : null;

  const selectedTeamResult = topTeam;

  const stageStats = useMemo(() => {
    const selectedMatchIds = new Set(activeMatches.map((m) => m.id));

    let kills = 0;
    let placementPoints = 0;
    let totalPoints = 0;

    for (const result of results) {
      if (!selectedMatchIds.has(result.matchId)) continue;

      const k = Number(result.kills ?? 0);
      const p = Number(result.points ?? 0);

      kills += k;
      totalPoints += p;
      placementPoints += Math.max(0, p - k);
    }

    if (selectedTeamResult) {
      return {
        kills: selectedTeamResult.kills,
        placementPoints: selectedTeamResult.placement,
        totalPoints: selectedTeamResult.points,
      };
    }

    return {
      kills,
      placementPoints,
      totalPoints,
    };
  }, [activeMatches, results, selectedTeamResult]);

  const fraggers = useMemo<FragEntry[]>(() => {
    const playerMap = new Map<string, FragEntry>();

    for (const stat of playerStats) {
      const player = players.find((p) => p.id === stat.playerId);

      const existing = playerMap.get(stat.playerId) ?? {
        id: stat.playerId,
        name: player?.name ?? "Unknown Player",
        team: player?.teamName ?? "Unknown Team",
        avatar: player?.avatarUrl ?? null,
        kills: 0,
        matches: 0,
        points: 0,
      };

      existing.kills += Number(stat.kills ?? 0);
      existing.points += Number(stat.points ?? 0);
      existing.matches += 1;

      playerMap.set(stat.playerId, existing);
    }

    if (playerMap.size === 0) {
      for (const player of players) {
        playerMap.set(player.id, {
          id: player.id,
          name: player.name,
          team: player.teamName ?? "Unknown Team",
          avatar: player.avatarUrl,
          kills: Number(player.kills ?? 0),
          matches: Number(player.matches ?? 0),
          points: 0,
        });
      }
    }

    return [...playerMap.values()]
      .sort((a, b) => b.kills - a.kills)
      .slice(0, 10);
  }, [playerStats, players]);

  const modalPlayers = useMemo(() => {
    if (!selectedMatch) return [];

    const stats = playerStats.filter(
      (stat) => stat.matchId === selectedMatch.id
    );

    return stats
      .map((stat) => {
        const player = players.find((p) => p.id === stat.playerId);

        return {
          stat,
          player,
        };
      })
      .sort((a, b) => b.stat.kills - a.stat.kills);
  }, [selectedMatch, playerStats, players]);

  const visibleTournaments = showAllEvents
    ? tournaments
    : tournaments.slice(0, 6);

  const changeMode = (next: CircuitMode) => {
    setMode(next);
    setSelectedTournamentId(null);
    setSelectedStage("all");
    setEventMenuOpen(false);
  };

  const chooseTournament = (id: string) => {
    setSelectedTournamentId(id);
    setSelectedStage("all");
    setEventMenuOpen(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#05070d] text-white">
    
      {/* TG animated background */}
<div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
  <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/[0.10] blur-[140px]" />

  <div className="tg-logo-background absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
    <img
      src="/iqoo-tg-logo.png"
      alt=""
      aria-hidden="true"
      className="h-[420px] w-[420px] object-contain opacity-[0.13] sm:h-[560px] sm:w-[560px] lg:h-[680px] lg:w-[680px]"
    />
  </div>

  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:55px_55px]" />

  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#05070d_82%)]" />
</div>

        

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#05070d]/85 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="mr-1 rounded-xl border border-white/10 bg-white/5 p-2 md:hidden"
              onClick={() => setMobileNav((v) => !v)}
            >
              {mobileNav ? <X size={19} /> : <Menu size={19} />}
            </button>

            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.05]">
              <img
                src="/iqoo-tg-logo.png"
                alt="Total Gaming"
                className="h-full w-full object-contain p-1.5"
              />
            </div>

            <div className="hidden sm:block">
              <div className="text-[15px] font-black tracking-tight">
                TOTAL GAMING
              </div>
              <div className="text-[8px] font-bold tracking-[0.35em] text-purple-400">
                COMPETITIVE HUB
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#dashboard"
              className="text-[12px] font-bold text-white"
            >
              DASHBOARD
            </a>
            <a
              href="#events"
              className="text-[12px] font-bold text-white/45 transition hover:text-white"
            >
              EVENTS
            </a>
            <a
              href="#matches"
              className="text-[12px] font-bold text-white/45 transition hover:text-white"
            >
              MATCHES
            </a>
            <a
              href="#fraggers"
              className="text-[12px] font-bold text-white/45 transition hover:text-white"
            >
              TOP FRAGGERS
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 sm:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
              <span className="text-[9px] font-black tracking-wider text-white/55">
                LIVE DATA
              </span>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10 text-xs font-black text-purple-300">
              TG
            </div>
          </div>
        </div>

        {mobileNav && (
          <div className="border-t border-white/[0.07] bg-[#080b13] px-5 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <a href="#dashboard" onClick={() => setMobileNav(false)}>
                DASHBOARD
              </a>
              <a href="#events" onClick={() => setMobileNav(false)}>
                EVENTS
              </a>
              <a href="#matches" onClick={() => setMobileNav(false)}>
                MATCHES
              </a>
              <a href="#fraggers" onClick={() => setMobileNav(false)}>
                TOP FRAGGERS
              </a>
            </div>
          </div>
        )}
      </header>

      <main id="dashboard" className="relative z-10">
        {/* Current tournament hero */}
        <section className="mx-auto max-w-[1500px] px-4 pb-7 pt-8 sm:px-6 lg:px-8 lg:pt-10">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] shadow-2xl">
            {activeTournament?.bannerUrl && (
              <img
                src={activeTournament.bannerUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-20"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-[#080b13] via-[#080b13]/95 to-[#080b13]/60" />

            <div className="relative grid min-h-[290px] items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:p-10">
              <div>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[9px] font-black tracking-[0.18em] text-red-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                    {activeTournament?.status === "LIVE"
                      ? "LIVE NOW"
                      : "CURRENT TOURNAMENT"}
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-black tracking-[0.15em] text-white/45">
                    {mode === "official" ? "OFFICIAL CIRCUIT" : "SCRIMS"}
                  </span>
                </div>

                <p className="mb-2 text-[10px] font-black tracking-[0.3em] text-purple-400">
                  CURRENT COMPETITION
                </p>

                <h1 className="max-w-4xl text-3xl font-black tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                  {loadingEvents
                    ? "LOADING..."
                    : activeTournament?.name || "NO ACTIVE EVENT"}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
                  {activeTournament?.description ||
                    "Follow live competitive results, match performance and player statistics."}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <MetaPill
                    icon={<Trophy size={13} />}
                    label="STAGE"
                    value={activeTournament?.phase || "—"}
                  />

                  <MetaPill
                    icon={<Users size={13} />}
                    label="TEAMS"
                    value={String(activeTournament?.teams ?? 0)}
                  />

                  <MetaPill
                    icon={<Gamepad2 size={13} />}
                    label="MATCHES"
                    value={String(activeTournament?.matches ?? 0)}
                  />
                </div>
              </div>

              <div className="hidden lg:flex lg:justify-end">
                <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-purple-500/20 bg-purple-500/[0.04]">
                  <div className="absolute inset-4 animate-pulse rounded-full border border-purple-500/10" />

                  <img
                    src="/iqoo-tg-logo.png"
                    alt=""
                    className="h-28 w-28 object-contain opacity-80"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main controls */}
        <section className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            {/* Circuit switch */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-2">
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => changeMode("official")}
                  className={`group relative flex min-h-[86px] flex-col items-center justify-center gap-2 rounded-xl transition ${
                    mode === "official"
                      ? "bg-gradient-to-br from-purple-600/25 to-blue-600/10 text-white shadow-lg shadow-purple-900/10"
                      : "text-white/35 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Trophy
                    size={20}
                    className={
                      mode === "official"
                        ? "text-purple-400"
                        : "text-white/30"
                    }
                  />
                  <span className="text-[10px] font-black tracking-[0.18em]">
                    OFFICIAL
                  </span>

                  {mode === "official" && (
                    <span className="absolute bottom-2 h-0.5 w-7 rounded-full bg-purple-400" />
                  )}
                </button>

                <button
                  onClick={() => changeMode("scrims")}
                  className={`group relative flex min-h-[86px] flex-col items-center justify-center gap-2 rounded-xl transition ${
                    mode === "scrims"
                      ? "bg-gradient-to-br from-purple-600/25 to-blue-600/10 text-white shadow-lg shadow-purple-900/10"
                      : "text-white/35 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Gamepad2
                    size={20}
                    className={
                      mode === "scrims"
                        ? "text-purple-400"
                        : "text-white/30"
                    }
                  />
                  <span className="text-[10px] font-black tracking-[0.18em]">
                    SCRIMS
                  </span>

                  {mode === "scrims" && (
                    <span className="absolute bottom-2 h-0.5 w-7 rounded-full bg-purple-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Event selector */}
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black tracking-[0.25em] text-white/30">
                    {mode === "official"
                      ? "OFFICIAL EVENTS"
                      : "SCRIM EVENTS"}
                  </p>
                  <p className="mt-1 text-xs font-bold text-white/60">
                    Select competition
                  </p>
                </div>

                <button
                  onClick={() => setEventMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black"
                >
                  {selectedTournament?.name || "SELECT EVENT"}
                  <ChevronDown size={14} />
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {visibleTournaments.map((tournament) => (
                  <button
                    key={tournament.id}
                    onClick={() => chooseTournament(tournament.id)}
                    className={`min-w-[180px] rounded-xl border px-4 py-3 text-left transition ${
                      selectedTournament?.id === tournament.id
                        ? "border-purple-500/40 bg-purple-500/10"
                        : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          tournament.status === "LIVE"
                            ? "animate-pulse bg-red-400"
                            : "bg-white/20"
                        }`}
                      />

                      <span className="text-[8px] font-black text-white/25">
                        {tournament.phase || "EVENT"}
                      </span>
                    </div>

                    <p className="mt-2 truncate text-xs font-black">
                      {tournament.name}
                    </p>

                    <p className="mt-1 text-[9px] text-white/30">
                      {tournament.teams} TEAMS · {tournament.matches} MATCHES
                    </p>
                  </button>
                ))}
              </div>

              {tournaments.length > 6 && (
                <button
                  onClick={() => setShowAllEvents((v) => !v)}
                  className="mt-3 text-[9px] font-black tracking-widest text-purple-400 hover:text-purple-300"
                >
                  {showAllEvents ? "SHOW LESS" : "VIEW ALL EVENTS"}
                </button>
              )}

              {eventMenuOpen && (
                <div className="absolute right-4 top-[72px] z-40 w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f18] p-2 shadow-2xl">
                  {tournaments.map((tournament) => (
                    <button
                      key={tournament.id}
                      onClick={() => chooseTournament(tournament.id)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-white/5"
                    >
                      <div>
                        <p className="text-xs font-bold">
                          {tournament.name}
                        </p>
                        <p className="mt-1 text-[9px] text-white/30">
                          {tournament.phase || "EVENT"}
                        </p>
                      </div>

                      {tournament.status === "LIVE" && (
                        <span className="text-[8px] font-black text-red-400">
                          LIVE
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Compact stage selector */}
        <section className="mx-auto max-w-[1500px] px-4 pt-5 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-3 py-3">
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
              <div className="flex shrink-0 items-center gap-2 border-r border-white/10 pr-4">
                <CalendarDays size={14} className="text-purple-400" />
                <span className="text-[9px] font-black tracking-[0.2em] text-white/35">
                  STAGE
                </span>
              </div>

              <button
                onClick={() => setSelectedStage("all")}
                className={`shrink-0 rounded-lg px-4 py-2 text-[9px] font-black transition ${
                  selectedStage === "all"
                    ? "bg-white text-black"
                    : "bg-white/5 text-white/40 hover:text-white"
                }`}
              >
                OVERALL
              </button>

              {stages.map((stage, index) => (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStage(stage.tournamentId)}
                  className={`shrink-0 rounded-lg px-4 py-2 text-[9px] font-black transition ${
                    selectedStage === stage.tournamentId
                      ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                      : "bg-white/5 text-white/40 hover:text-white"
                  }`}
                >
                  {stage.label || `STAGE ${index + 1}`}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mx-auto max-w-[1500px] px-4 pb-7 pt-5 sm:px-6 lg:px-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <BigStat
              label="TOTAL POINTS"
              value={stageStats.totalPoints}
              icon={<Trophy size={20} />}
              description={
                selectedTeamRank
                  ? "Current leading result"
                  : "Tournament points"
              }
              highlight
            />

            <BigStat
              label="CURRENT RANK"
              value={selectedTeamRank ? `#${selectedTeamRank}` : "—"}
              icon={<BarChart3 size={20} />}
              description={
                selectedTeamRank === 1
                  ? "Qualified / leading position"
                  : "Rank unavailable"
              }
            />

            <BigStat
              label="ELIMINATIONS"
              value={stageStats.kills}
              icon={<Crosshair size={20} />}
              description="Total kills"
            />

            <BigStat
              label="PLACEMENT POINTS"
              value={stageStats.placementPoints}
              icon={<Shield size={20} />}
              description="Position points"
            />
          </div>
        </section>

        {/* Match history */}
        <section
          id="matches"
          className="mx-auto max-w-[1500px] px-4 pb-10 sm:px-6 lg:px-8"
        >
          <SectionTitle
            eyebrow="COMPETITIVE RECORD"
            title="MATCH HISTORY"
            right={`${activeMatches.length} MATCHES`}
          />

          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
            <div className="hidden grid-cols-[90px_1fr_130px_110px_110px_130px] border-b border-white/10 bg-white/[0.025] px-5 py-3 text-[8px] font-black tracking-[0.18em] text-white/25 md:grid">
              <span>MATCH</span>
              <span>MAP / STATUS</span>
              <span>POSITION</span>
              <span>KILLS</span>
              <span>POINTS</span>
              <span className="text-right">DETAILS</span>
            </div>

            {loadingTournament ? (
              <LoadingRows />
            ) : activeMatches.length > 0 ? (
              <div>
                {[...activeMatches].reverse().map((match, index) => {
                  const result =
                    matchResultsByMatch.get(match.id)?.[0] ?? undefined;

                  return (
                    <MatchHistoryRow
                      key={match.id}
                      match={match}
                      result={result}
                      index={index}
                      onOpen={() => setSelectedMatch(match)}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyBox text="NO MATCH DATA AVAILABLE FOR THIS STAGE" />
            )}
          </div>
        </section>

        {/* Top fraggers */}
        <section
          id="fraggers"
          className="mx-auto max-w-[1500px] px-4 pb-14 sm:px-6 lg:px-8"
        >
          <SectionTitle
            eyebrow="PLAYER PERFORMANCE"
            title="TOP FRAGGERS"
            right="TOP 10"
          />

          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
            <div className="hidden grid-cols-[70px_1fr_180px_120px_120px] border-b border-white/10 bg-white/[0.025] px-5 py-3 text-[8px] font-black tracking-[0.18em] text-white/25 md:grid">
              <span>RANK</span>
              <span>PLAYER</span>
              <span>TEAM</span>
              <span>MATCHES</span>
              <span>KILLS</span>
            </div>

            {fraggers.length > 0 ? (
              fraggers.map((player, index) => (
                <FragRow
                  key={player.id}
                  player={player}
                  rank={index + 1}
                />
              ))
            ) : (
              <EmptyBox text="NO PLAYER STATISTICS AVAILABLE" />
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/[0.07] bg-black/20">
          <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div>
              <p className="text-sm font-black">TOTAL GAMING HUB</p>
              <p className="mt-1 text-[9px] font-bold tracking-[0.2em] text-white/25">
                PLAY · COMPETE · BELONG
              </p>
            </div>

            <p className="text-[9px] font-bold text-white/20">
              COMPETITIVE ESPORTS PLATFORM
            </p>
          </div>
        </footer>
      </main>

      {/* Full stats modal */}
      {selectedMatch && (
        <MatchStatsModal
          match={selectedMatch}
          players={modalPlayers}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
}

function BigStat({
  label,
  value,
  icon,
  description,
  highlight = false,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 ${
        highlight
          ? "border-purple-500/30 bg-gradient-to-br from-purple-600/15 to-white/[0.025]"
          : "border-white/10 bg-white/[0.025]"
      }`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            highlight
              ? "bg-purple-500/15 text-purple-400"
              : "bg-white/5 text-white/40"
          }`}
        >
          {icon}
        </span>

        {highlight && (
          <span className="text-[8px] font-black tracking-widest text-purple-400">
            LEADER
          </span>
        )}
      </div>

      <p className="mt-5 text-[9px] font-black tracking-[0.2em] text-white/30">
        {label}
      </p>

      <p className="mt-1 text-4xl font-black tracking-[-0.04em]">
        {value}
      </p>

      <p className="mt-2 text-[10px] font-medium text-white/30">
        {description}
      </p>

      <div
        className={`absolute -bottom-10 -right-10 h-28 w-28 rounded-full blur-3xl transition group-hover:scale-125 ${
          highlight ? "bg-purple-600/15" : "bg-white/5"
        }`}
      />
    </div>
  );
}

function MetaPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
      <span className="text-purple-400">{icon}</span>
      <div>
        <span className="block text-[7px] font-black tracking-widest text-white/25">
          {label}
        </span>
        <span className="block text-[10px] font-black text-white/70">
          {value}
        </span>
      </div>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  right,
}: {
  eyebrow: string;
  title: string;
  right?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
          <p className="text-[9px] font-black tracking-[0.25em] text-purple-400">
            {eyebrow}
          </p>
        </div>

        <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] sm:text-3xl">
          {title}
        </h2>
      </div>

      {right && (
        <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[8px] font-black tracking-widest text-white/35">
          {right}
        </span>
      )}
    </div>
  );
}

function MatchHistoryRow({
  match,
  result,
  index,
  onOpen,
}: {
  match: Match;
  result?: MatchResult;
  index: number;
  onOpen: () => void;
}) {
  const kills = Number(result?.kills ?? match.totalKills ?? 0);
  const points = Number(result?.points ?? 0);
  const position = result?.position ?? null;

  return (
    <div
      className="group grid items-center gap-3 border-b border-white/[0.06] px-4 py-4 transition last:border-b-0 hover:bg-white/[0.035] md:grid-cols-[90px_1fr_130px_110px_110px_130px] md:px-5"
      style={{
        animationDelay: `${index * 35}ms`,
      }}
    >
      <div>
        <span className="text-[8px] font-black tracking-widest text-purple-400">
          MATCH
        </span>
        <p className="mt-1 text-sm font-black">
          #{match.number}
        </p>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-black">
            {match.map || "UNKNOWN MAP"}
          </span>

          {match.status === "LIVE" && (
            <span className="rounded-md bg-red-500/10 px-2 py-1 text-[7px] font-black text-red-400">
              LIVE
            </span>
          )}
        </div>

        <p className="mt-1 text-[9px] text-white/25">
          {match.teams || 0} TEAMS
          {match.matchTime ? ` · ${match.matchTime}` : ""}
        </p>
      </div>

      <div className="mt-3 flex justify-between md:mt-0 md:block">
        <span className="text-[8px] font-black text-white/25 md:hidden">
          POSITION
        </span>

        <span className="text-sm font-black">
          {position ? `#${position}` : "—"}
        </span>
      </div>

      <div className="flex justify-between md:block">
        <span className="text-[8px] font-black text-white/25 md:hidden">
          KILLS
        </span>

        <span className="text-sm font-black text-red-300">
          {kills}
        </span>
      </div>

      <div className="flex justify-between md:block">
        <span className="text-[8px] font-black text-white/25 md:hidden">
          POINTS
        </span>

        <span className="text-sm font-black text-purple-300">
          {points}
        </span>
      </div>

      <div className="mt-3 md:mt-0 md:text-right">
        <button
          onClick={onOpen}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[8px] font-black tracking-wider text-white/55 transition hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-white"
        >
          FULL STATS
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

function FragRow({
  player,
  rank,
}: {
  player: FragEntry;
  rank: number;
}) {
  const rankClass =
    rank === 1
      ? "bg-yellow-500/15 text-yellow-300 border-yellow-500/20"
      : rank === 2
        ? "bg-white/10 text-white border-white/10"
        : rank === 3
          ? "bg-orange-500/10 text-orange-300 border-orange-500/20"
          : "bg-white/5 text-white/35 border-white/5";

  return (
    <div className="grid items-center gap-3 border-b border-white/[0.06] px-4 py-4 transition last:border-b-0 hover:bg-white/[0.035] md:grid-cols-[70px_1fr_180px_120px_120px] md:px-5">
      <div className="flex">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg border text-[10px] font-black ${rankClass}`}
        >
          {String(rank).padStart(2, "0")}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
          {player.avatar ? (
            <img
              src={player.avatar}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-black text-purple-300">
              {player.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-black">
            {player.name}
          </p>

          <p className="mt-1 text-[8px] font-bold tracking-wider text-white/25">
            {player.matches} MATCHES
          </p>
        </div>
      </div>

      <div className="hidden md:block">
        <span className="text-xs font-bold text-white/45">
          {player.team}
        </span>
      </div>

      <div className="flex justify-between md:block">
        <span className="text-[8px] text-white/25 md:hidden">
          MATCHES
        </span>
        <span className="text-sm font-black">
          {player.matches}
        </span>
      </div>

      <div className="flex items-center justify-between md:block md:text-right">
        <span className="flex items-center gap-1 text-[8px] text-white/25 md:hidden">
          <Crosshair size={10} />
          KILLS
        </span>

        <span className="text-base font-black text-red-300">
          {player.kills}
        </span>
      </div>
    </div>
  );
}

function MatchStatsModal({
  match,
  players,
  onClose,
}: {
  match: Match;
  players: {
    stat: PlayerMatchStat;
    player?: Player;
  }[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[760px] overflow-hidden rounded-3xl border border-white/10 bg-[#0a0e17] shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-purple-500/10 px-2 py-1 text-[8px] font-black tracking-widest text-purple-400">
                FULL STATS
              </span>

              <span className="text-[9px] font-bold text-white/25">
                MATCH #{match.number}
              </span>
            </div>

            <h3 className="mt-2 text-xl font-black">
              {match.map || "MATCH"}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid max-h-[70vh] gap-3 overflow-y-auto p-4 sm:grid-cols-2 sm:p-6">
          {players.length > 0 ? (
            players.map(({ stat, player }) => (
              <div
                key={stat.id}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-3"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  {player?.avatarUrl ? (
                    <img
                      src={player.avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-black text-purple-300">
                      {player?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black">
                    {player?.name || "Unknown Player"}
                  </p>

                  <p className="mt-1 truncate text-[8px] font-bold uppercase tracking-wider text-white/25">
                    {player?.role || "PLAYER"}
                  </p>

                  <div className="mt-2 flex gap-3 text-[9px] font-bold">
                    <span className="text-red-300">
                      {stat.kills} KILLS
                    </span>

                    <span className="text-white/35">
                      {stat.damage} DMG
                    </span>

                    <span className="text-white/35">
                      {stat.assists} AST
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[7px] font-black tracking-widest text-white/25">
                    POINTS
                  </p>

                  <p className="mt-1 text-lg font-black text-purple-300">
                    {stat.points}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-10 text-center">
              <Activity className="mx-auto text-white/15" size={30} />

              <p className="mt-3 text-[10px] font-black tracking-widest text-white/25">
                NO INDIVIDUAL STATS AVAILABLE
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 bg-white/[0.02] px-5 py-3 sm:px-6">
          <div className="flex items-center justify-between text-[9px] font-bold text-white/25">
            <span>{match.teams} TEAMS</span>
            <span>{match.totalKills} TOTAL KILLS</span>
            <span>{match.status || "COMPLETED"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-2 p-3">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-16 animate-pulse rounded-xl bg-white/[0.035]"
        />
      ))}
    </div>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center px-5 text-center">
      <Target size={30} className="text-white/10" />

      <p className="mt-3 text-[9px] font-black tracking-[0.2em] text-white/20">
        {text}
      </p>
    </div>
  );
}
