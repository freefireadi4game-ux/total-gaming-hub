import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Crosshair,
  Gamepad2,
  Layers3,
  Medal,
  Shield,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";

import {
  getPlayers,
  getTeams,
  getTournamentData,
  getTournaments,
  type CircuitMode,
  type Match,
  type MatchResult,
  type Player,
  type PlayerMatchStat,
  type Team,
  type Tournament,
} from "@/lib/tg-data";

type TournamentData = {
  matches: Match[];
  matchResults: MatchResult[];
  playerMatchStats: PlayerMatchStat[];
};

const emptyTournamentData: TournamentData = {
  matches: [],
  matchResults: [],
  playerMatchStats: [],
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Total Gaming Match Center" },
      {
        name: "description",
        content:
          "Follow Total Gaming official tournaments and scrims with live standings, match history, and player statistics.",
      },
      { property: "og:title", content: "Total Gaming Match Center" },
      {
        property: "og:description",
        content:
          "Live Total Gaming tournament standings, match history, and player statistics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [mode, setMode] = useState<CircuitMode>("official");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [tournamentData, setTournamentData] = useState<TournamentData>(emptyTournamentData);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoadingEvents(true);
    setError(null);

    getTournaments(mode)
      .then((items) => {
        if (cancelled) return;
        setTournaments(items);
        const live = items.find((item) => item.isCurrent || item.status === "LIVE") ?? items[0];
        setSelectedEvent(live?.name ?? null);
        setSelectedTournamentId(live?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setError("Tournament data could not be loaded right now.");
      })
      .finally(() => {
        if (!cancelled) setLoadingEvents(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mode]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getTeams(), getPlayers()])
      .then(([teamItems, playerItems]) => {
        if (cancelled) return;
        setTeams(teamItems);
        setPlayers(playerItems);
      })
      .catch(() => {
        if (!cancelled) setError("Player data could not be loaded right now.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const eventNames = useMemo(
    () => Array.from(new Set(tournaments.map((tournament) => tournament.name))),
    [tournaments],
  );

  const activeEventName = selectedEvent && eventNames.includes(selectedEvent)
    ? selectedEvent
    : eventNames[0] ?? null;

  const eventTournaments = useMemo(
    () => tournaments.filter((tournament) => tournament.name === activeEventName),
    [activeEventName, tournaments],
  );

  const selectedTournament = useMemo(() => {
    return (
      eventTournaments.find((tournament) => tournament.id === selectedTournamentId) ??
      eventTournaments.find((tournament) => tournament.isCurrent || tournament.status === "LIVE") ??
      eventTournaments[0] ??
      null
    );
  }, [eventTournaments, selectedTournamentId]);

  useEffect(() => {
    if (!selectedTournament) {
      setTournamentData(emptyTournamentData);
      return;
    }

    let cancelled = false;
    setLoadingData(true);
    setError(null);
    setSelectedMatchId(null);

    getTournamentData(selectedTournament.id)
      .then((data) => {
        if (!cancelled) setTournamentData(data);
      })
      .catch(() => {
        if (!cancelled) {
          setTournamentData(emptyTournamentData);
          setError("Match data could not be loaded right now.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingData(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedTournament]);

  const resultTeam = useMemo(() => {
    const knownTeam = teams.find((team) => team.name.toLowerCase().includes("total gaming"));
    if (knownTeam) return { id: knownTeam.id, name: knownTeam.name };

    const result = tournamentData.matchResults.find((item) =>
      item.teamName?.toLowerCase().includes("total gaming"),
    );
    return result?.teamName ? { id: result.teamId, name: result.teamName } : null;
  }, [teams, tournamentData.matchResults]);

  const teamResults = useMemo(
    () => tournamentData.matchResults.filter((result) => {
      if (!resultTeam) return false;
      return resultTeam.id
        ? result.teamId === resultTeam.id
        : result.teamName === resultTeam.name;
    }),
    [resultTeam, tournamentData.matchResults],
  );

  const standings = useMemo(() => {
    const rows = new Map<string, { id: string | null; name: string; points: number; kills: number }>();

    for (const result of tournamentData.matchResults) {
      const key = result.teamId ?? result.teamName ?? result.id;
      const current = rows.get(key) ?? {
        id: result.teamId,
        name: result.teamName ?? "Unnamed team",
        points: 0,
        kills: 0,
      };
      current.points += result.points;
      current.kills += result.kills;
      rows.set(key, current);
    }

    return Array.from(rows.values()).sort((a, b) => b.points - a.points || b.kills - a.kills);
  }, [tournamentData.matchResults]);

  const rank = resultTeam
    ? standings.findIndex((standing) =>
        resultTeam.id ? standing.id === resultTeam.id : standing.name === resultTeam.name,
      ) + 1
    : 0;

  const totalKills = teamResults.reduce((sum, result) => sum + result.kills, 0);
  const totalPoints = teamResults.reduce((sum, result) => sum + result.points, 0);
  const placementPoints = Math.max(0, totalPoints - totalKills);
  const averagePoints = teamResults.length ? (totalPoints / teamResults.length).toFixed(1) : "—";

  const topFraggers = useMemo(() => {
    const stats = new Map<string, { player: Player; kills: number; damage: number; assists: number; points: number; matches: number }>();
    const playerMap = new Map(players.map((player) => [player.id, player]));

    for (const stat of tournamentData.playerMatchStats) {
      const player = playerMap.get(stat.playerId);
      if (!player) continue;
      const current = stats.get(stat.playerId) ?? {
        player,
        kills: 0,
        damage: 0,
        assists: 0,
        points: 0,
        matches: 0,
      };
      current.kills += stat.kills;
      current.damage += stat.damage;
      current.assists += stat.assists;
      current.points += stat.points;
      current.matches += 1;
      stats.set(stat.playerId, current);
    }

    return Array.from(stats.values()).sort((a, b) => b.kills - a.kills || b.points - a.points);
  }, [players, tournamentData.playerMatchStats]);

  const selectedMatch = tournamentData.matches.find((match) => match.id === selectedMatchId) ?? null;

  function changeMode(nextMode: CircuitMode) {
    if (nextMode === mode) return;
    setMode(nextMode);
    setSelectedEvent(null);
    setSelectedTournamentId(null);
  }

  function selectEvent(name: string) {
    const next = tournaments.filter((tournament) => tournament.name === name);
    const first = next.find((tournament) => tournament.isCurrent || tournament.status === "LIVE") ?? next[0];
    setSelectedEvent(name);
    setSelectedTournamentId(first?.id ?? null);
  }

  return (
    <div className="tg-dashboard-v2">
      <div className="tg-watermark" aria-hidden="true">
        <img src="/iqoo-tg-logo.png" alt="" />
      </div>

      <header className="tg-topbar">
        <a className="tg-logo-lockup" href="#top" aria-label="Total Gaming Match Center home">
          <span className="tg-logo-mark"><img src="/iqoo-tg-logo.png" alt="" /></span>
          <span>
            <strong>TOTAL GAMING <em>HUB</em></strong>
            <small>FAN MATCH CENTER</small>
          </span>
        </a>
        <nav className="tg-main-nav" aria-label="Main navigation">
          <a href="#events">Events</a>
          <a href="#history">Match history</a>
          <a href="#fraggers">Top fraggers</a>
        </nav>
        <div className="tg-live-chip"><span /> LIVE DATA</div>
      </header>

      <main id="top">
        <section className="tg-current-hero tg-page-width">
          <div className="tg-hero-content">
            <p className="tg-overline"><span className="tg-pulse" /> CURRENT TOURNAMENT</p>
            <p className="tg-circuit-label">{mode === "official" ? "OFFICIAL CIRCUIT" : "SCRIMS CIRCUIT"}</p>
            <h1>{loadingEvents ? "Loading tournament" : selectedTournament?.name ?? "No active tournament"}</h1>
            <p className="tg-hero-note">
              {selectedTournament
                ? `${selectedTournament.status === "LIVE" || selectedTournament.isCurrent ? "Live now" : "Selected event"} · ${selectedTournament.phase || "Stage details pending"}`
                : "Live tournament information will appear here when it is published."}
            </p>
            <div className="tg-hero-facts">
              <Fact label="STAGE" value={selectedTournament?.phase || "—"} />
              <Fact label="MATCHES" value={selectedTournament ? String(selectedTournament.matches) : "—"} />
              <Fact label="TEAMS" value={selectedTournament ? String(selectedTournament.teams) : "—"} />
            </div>
          </div>
          <div className="tg-hero-badge" aria-hidden="true">
            <Trophy size={34} />
            <span>{mode === "official" ? "OFFICIAL" : "SCRIMS"}</span>
            <strong>{selectedTournament?.status ?? "WAITING"}</strong>
          </div>
        </section>

        <section className="tg-control-band tg-page-width" id="events">
          <div className="tg-control-heading">
            <div>
              <p className="tg-overline"><span /> CIRCUIT SELECTOR</p>
              <h2>Choose your view</h2>
            </div>
            <span className="tg-record-count">{eventNames.length} {eventNames.length === 1 ? "EVENT" : "EVENTS"}</span>
          </div>
          <div className="tg-mode-switch" role="tablist" aria-label="Competition mode">
            <button type="button" role="tab" aria-selected={mode === "official"} className={mode === "official" ? "is-active" : ""} onClick={() => changeMode("official")}>
              <Trophy size={17} /> Official
            </button>
            <button type="button" role="tab" aria-selected={mode === "scrims"} className={mode === "scrims" ? "is-active" : ""} onClick={() => changeMode("scrims")}>
              <Gamepad2 size={17} /> Scrims
            </button>
          </div>
          {error && (
            <div className="tg-inline-error" role="alert"><CircleAlert size={17} /> {error}</div>
          )}
          <div className="tg-event-list">
            {loadingEvents ? <LoadingLine label="Loading published events" /> : eventNames.length === 0 ? <EmptyState label={`No ${mode} events have been published yet.`} /> : eventNames.map((name) => {
              const eventStages = tournaments.filter((tournament) => tournament.name === name);
              const live = eventStages.some((tournament) => tournament.isCurrent || tournament.status === "LIVE");
              return (
                <button type="button" className={`tg-event-button ${activeEventName === name ? "is-active" : ""}`} key={name} onClick={() => selectEvent(name)}>
                  <span className="tg-event-icon"><Layers3 size={18} /></span>
                  <span className="tg-event-copy"><strong>{name}</strong><small>{eventStages.length} {eventStages.length === 1 ? "stage" : "stages"}</small></span>
                  {live && <span className="tg-mini-live">LIVE</span>}
                  <ChevronRight size={17} />
                </button>
              );
            })}
          </div>
          {eventTournaments.length > 0 && (
            <div className="tg-stage-strip">
              <div className="tg-stage-strip-label"><CalendarDays size={16} /> STAGES / DAYS</div>
              <div className="tg-stage-options">
                {eventTournaments.map((tournament) => (
                  <button type="button" key={tournament.id} className={`tg-stage-button ${selectedTournament?.id === tournament.id ? "is-active" : ""}`} onClick={() => setSelectedTournamentId(tournament.id)}>
                    <span>{tournament.phase || "Stage"}</span>
                    {tournament.status === "LIVE" || tournament.isCurrent ? <i>LIVE</i> : null}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="tg-stage-summary tg-page-width" aria-labelledby="summary-title">
          <div className="tg-section-topline">
            <div>
              <p className="tg-overline"><span /> SELECTED STAGE</p>
              <h2 id="summary-title">{selectedTournament?.phase || "Stage summary"}</h2>
            </div>
            <span className="tg-status-pill">{selectedTournament?.status ?? "NO DATA"}</span>
          </div>

          {loadingData ? <LoadingLine label="Loading stage performance" /> : (
            <div className="tg-summary-grid">
              <MetricCard icon={Trophy} label="TOTAL POINTS" value={totalPoints ? totalPoints.toString() : "—"} accent detail={teamResults.length ? `${teamResults.length} matches scored` : "No team results published"} />
              <MetricCard icon={Medal} label="CURRENT RANK" value={rank ? `#${rank}` : "—"} detail={rank ? (selectedTournament?.description || "Live standings") : "Ranking appears after results"} />
              <MetricCard icon={Crosshair} label="KILLS" value={teamResults.length ? totalKills.toString() : "—"} detail={teamResults.length ? `${averagePoints} points / match` : "No team results published"} />
              <MetricCard icon={Shield} label="PLACEMENT POINTS" value={teamResults.length ? placementPoints.toString() : "—"} detail={teamResults.length ? "Calculated from team score" : "No team results published"} />
            </div>
          )}
        </section>

        <section className="tg-history tg-page-width" id="history" aria-labelledby="history-title">
          <div className="tg-section-topline">
            <div>
              <p className="tg-overline"><span /> PERFORMANCE LOG</p>
              <h2 id="history-title">Match history</h2>
            </div>
            <span className="tg-record-count">{tournamentData.matches.length} MATCHES</span>
          </div>
          {loadingData ? <LoadingLine label="Loading matches" /> : tournamentData.matches.length === 0 ? <EmptyState label="No matches have been published for this stage yet." /> : (
            <div className="tg-match-list">
              <div className="tg-match-list-head"><span>MATCH</span><span>MAP</span><span>KILLS</span><span>POSITION</span><span>POINTS</span><span /></div>
              {tournamentData.matches.map((match) => {
                const result = teamResults.find((item) => item.matchId === match.id);
                return <MatchRow key={match.id} match={match} result={result} onStats={() => setSelectedMatchId(match.id)} />;
              })}
            </div>
          )}
        </section>

        <section className="tg-fraggers tg-page-width" id="fraggers" aria-labelledby="fraggers-title">
          <div className="tg-section-topline">
            <div>
              <p className="tg-overline"><span /> PLAYER PERFORMANCE</p>
              <h2 id="fraggers-title">Top fraggers</h2>
            </div>
            <Sparkles size={21} className="tg-section-mark" />
          </div>
          {loadingData ? <LoadingLine label="Loading player performance" /> : topFraggers.length === 0 ? <EmptyState label="Player statistics have not been published for this stage yet." /> : (
            <div className="tg-fragger-list">
              {topFraggers.map((entry, index) => <FraggerRow key={entry.player.id} entry={entry} index={index} />)}
            </div>
          )}
        </section>

        <footer className="tg-footer-v2 tg-page-width"><span>TOTAL GAMING HUB</span><small>Official results · Scrims · Player stats</small></footer>
      </main>

      {selectedMatch && <StatsModal match={selectedMatch} stats={tournamentData.playerMatchStats.filter((stat) => stat.matchId === selectedMatch.id)} players={players} onClose={() => setSelectedMatchId(null)} />}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="tg-fact"><span>{label}</span><strong>{value}</strong></div>;
}

function MetricCard({ icon: Icon, label, value, detail, accent = false }: { icon: LucideIcon; label: string; value: string; detail: string; accent?: boolean }) {
  return <article className={`tg-metric-card ${accent ? "is-accent" : ""}`}><span className="tg-metric-icon"><Icon size={18} /></span><span className="tg-metric-label">{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

function MatchRow({ match, result, onStats }: { match: Match; result?: MatchResult; onStats: () => void }) {
  return <div className="tg-match-row"><div className="tg-match-number"><span>#{String(match.number).padStart(2, "0")}</span><strong>{match.status}</strong></div><span className="tg-map-name">{match.map || "Map pending"}</span><strong>{result ? result.kills : "—"}</strong><strong>{result?.position ? `#${result.position}` : "—"}</strong><strong className="tg-points-value">{result ? result.points : "—"}</strong><button type="button" className="tg-stats-button" onClick={onStats}>Full stats <ArrowUpRight size={15} /></button></div>;
}

function FraggerRow({ entry, index }: { entry: { player: Player; kills: number; damage: number; assists: number; points: number; matches: number }; index: number }) {
  return <div className="tg-fragger-row"><span className="tg-rank-number">{String(index + 1).padStart(2, "0")}</span><Avatar player={entry.player} /><div className="tg-fragger-name"><strong>{entry.player.name}</strong><small>{entry.player.role} · {entry.matches} matches</small></div><div className="tg-fragger-stat"><span>KILLS</span><strong>{entry.kills}</strong></div><div className="tg-fragger-stat tg-fragger-damage"><span>DAMAGE</span><strong>{entry.damage}</strong></div><div className="tg-fragger-stat"><span>POINTS</span><strong>{entry.points}</strong></div></div>;
}

function Avatar({ player }: { player: Player }) {
  const initials = player.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <span className="tg-player-avatar">{player.avatarUrl ? <img src={player.avatarUrl} alt={`${player.name} portrait`} /> : initials}</span>;
}

function StatsModal({ match, stats, players, onClose }: { match: Match; stats: PlayerMatchStat[]; players: Player[]; onClose: () => void }) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const playerMap = new Map(players.map((player) => [player.id, player]));

  return <div className="tg-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="tg-stats-modal" role="dialog" aria-modal="true" aria-labelledby="stats-modal-title"><div className="tg-modal-head"><div><p className="tg-overline"><span /> MATCH #{String(match.number).padStart(2, "0")}</p><h2 id="stats-modal-title">{match.map || "Match stats"}</h2></div><button type="button" className="tg-close-button" aria-label="Close full stats" onClick={onClose}><X size={19} /></button></div><div className="tg-player-stat-list">{stats.length === 0 ? <EmptyState label="Individual player stats have not been published for this match." /> : stats.map((stat) => { const player = playerMap.get(stat.playerId); if (!player) return null; return <div className="tg-player-stat" key={stat.id}><Avatar player={player} /><div className="tg-player-stat-name"><strong>{player.name}</strong><small>{player.role}</small></div><span><b>{stat.kills}</b><small>KILLS</small></span><span><b>{stat.damage}</b><small>DAMAGE</small></span><span><b>{stat.assists}</b><small>ASSISTS</small></span><span><b>{stat.points}</b><small>POINTS</small></span></div>; })}</div></section></div>;
}

function LoadingLine({ label }: { label: string }) {
  return <div className="tg-loading"><span /> {label}</div>;
}

function EmptyState({ label }: { label: string }) {
  return <div className="tg-empty-state"><Users size={18} /> {label}</div>;
}