import { createFileRoute } from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CalendarDays,
  ChevronRight,
  Crosshair,
  Flame,
  Gamepad2,
  Menu,
  Shield,
  Star,
  Trophy,
  Users,
  X,
} from "lucide-react";

import mvpImage from "@/assets/total-gaming-mvp.jpg";
import {
  getMatches,
  getPlayers,
  getTournaments,
  type CircuitMode,
  type Match,
  type Player,
  type Tournament,
} from "@/lib/tg-data";

type DisplayMatch = Match & {
  position?: number | null;
  kills?: number;
};

const placementPoints: Record<number, number> = {
  1: 12,
  2: 9,
  3: 8,
  4: 7,
  5: 6,
  6: 5,
  7: 4,
  8: 3,
  9: 2,
  10: 1,
};

function getMatchPoints(match: DisplayMatch) {
  const kills = Number(match.kills ?? match.totalKills ?? 0);
  const placement =
    match.position != null
      ? placementPoints[match.position] ?? 0
      : 0;

  return kills + placement;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Total Gaming Hub",
      },
      {
        name: "description",
        content:
          "Total Gaming Free Fire tournament, match and MVP dashboard.",
      },
    ],
  }),

  component: Dashboard,
});

function Dashboard() {
  const [mode, setMode] = useState<CircuitMode>("official");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedTournamentId, setSelectedTournamentId] =
    useState<string | null>(null);

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  const [loadingTournaments, setLoadingTournaments] =
    useState(true);
  const [loadingMatches, setLoadingMatches] =
    useState(false);
  const [loadingPlayers, setLoadingPlayers] =
    useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTournaments() {
      setLoadingTournaments(true);
      setError(null);

      try {
        const data = await getTournaments(mode);

        if (cancelled) return;

        setTournaments(data);

        const current =
          data.find((item) => item.isCurrent) ??
          data.find((item) => item.status === "LIVE") ??
          data[0] ??
          null;

        setSelectedTournamentId(
          current?.id ?? null,
        );
      } catch (err) {
        if (cancelled) return;

        console.error(err);
        setTournaments([]);
        setSelectedTournamentId(null);
        setError(
          "Unable to load tournament data.",
        );
      } finally {
        if (!cancelled) {
          setLoadingTournaments(false);
        }
      }
    }

    void loadTournaments();

    return () => {
      cancelled = true;
    };
  }, [mode]);

  const selectedTournament = useMemo(() => {
    if (selectedTournamentId) {
      return (
        tournaments.find(
          (item) =>
            item.id === selectedTournamentId,
        ) ?? null
      );
    }

    return (
      tournaments.find(
        (item) => item.isCurrent,
      ) ??
      tournaments.find(
        (item) => item.status === "LIVE",
      ) ??
      tournaments[0] ??
      null
    );
  }, [
    selectedTournamentId,
    tournaments,
  ]);

  const liveTournament = useMemo(() => {
    return (
      tournaments.find(
        (item) => item.isCurrent,
      ) ??
      tournaments.find(
        (item) => item.status === "LIVE",
      ) ??
      tournaments[0] ??
      null
    );
  }, [tournaments]);

  useEffect(() => {
    let cancelled = false;

    async function loadMatches() {
      if (!selectedTournament?.id) {
        setMatches([]);
        setLoadingMatches(false);
        return;
      }

      setLoadingMatches(true);

      try {
        const data = await getMatches(
          selectedTournament.id,
        );

        if (!cancelled) {
          setMatches(data);
        }
      } catch (err) {
        if (cancelled) return;

        console.error(err);
        setMatches([]);
        setError(
          "Unable to load match data.",
        );
      } finally {
        if (!cancelled) {
          setLoadingMatches(false);
        }
      }
    }

    void loadMatches();

    return () => {
      cancelled = true;
    };
  }, [selectedTournament?.id]);

  useEffect(() => {
    let cancelled = false;

    async function loadPlayers() {
      setLoadingPlayers(true);

      try {
        const data = await getPlayers();

        if (!cancelled) {
          setPlayers(data);
        }
      } catch (err) {
        if (cancelled) return;

        console.error(err);
        setPlayers([]);
      } finally {
        if (!cancelled) {
          setLoadingPlayers(false);
        }
      }
    }

    void loadPlayers();

    return () => {
      cancelled = true;
    };
  }, []);

  const folders = useMemo(() => {
    return tournaments.map(
      (tournament) => ({
        id: tournament.id,
        label:
          tournament.phase ||
          tournament.name,
        tournamentId: tournament.id,
      }),
    );
  }, [tournaments]);

  const stats = useMemo(() => {
    const kills = matches.reduce(
      (sum, match) =>
        sum + Number(match.totalKills ?? 0),
      0,
    );

    /*
     * The current `matches` database table stores
     * total_kills but does not contain a placement
     * column. Therefore we never invent placement
     * points here.
     *
     * Placement points will be calculated once
     * match-result data is available through the
     * match_results table.
     */
    const placement = 0;

    return {
      kills,
      placement,
      total: kills + placement,
    };
  }, [matches]);

  const averagePoints =
    matches.length > 0
      ? Math.round(
          (stats.total / matches.length) * 10,
        ) / 10
      : 0;

  const mvpPlayer = useMemo(() => {
    if (players.length === 0) {
      return null;
    }

    return [...players].sort(
      (a, b) =>
        Number(b.kills ?? 0) -
        Number(a.kills ?? 0),
    )[0];
  }, [players]);

  const currentRank =
    selectedTournament &&
    matches.length > 0
      ? "#1"
      : "—";

  function changeMode(
    nextMode: CircuitMode,
  ) {
    setMode(nextMode);
    setSelectedTournamentId(null);
  }

  function selectTournament(
    tournamentId: string,
  ) {
    setSelectedTournamentId(tournamentId);
  }

  return (
    <div className="tg-dashboard">
      <div
        className="tg-background-logo"
        aria-hidden="true"
      >
        <img
          src="/iqoo-tg-logo.png"
          alt=""
        />
      </div>

      <div
        className="tg-background-grid"
        aria-hidden="true"
      />

      <header className="tg-header">
        <div className="tg-header-inner">
          <button
            className="tg-mobile-menu"
            onClick={() =>
              setMobileMenu(!mobileMenu)
            }
            aria-label="Menu"
          >
            {mobileMenu ? (
              <X size={25} />
            ) : (
              <Menu size={25} />
            )}
          </button>

          <a
            href="#top"
            className="tg-brand"
          >
            <div className="tg-brand-logo">
              <img
                src="/iqoo-tg-logo.png"
                alt="Total Gaming"
              />
            </div>

            <div>
              <div className="tg-brand-name">
                TOTAL GAMING{" "}
                <span>HUB</span>
              </div>

              <div className="tg-brand-sub">
                PLAY · COMPETE · BELONG
              </div>
            </div>
          </a>

          <nav className="tg-navigation">
            <a href="#top">
              Dashboard
            </a>

            <a href="#tournaments">
              Events
            </a>

            <a href="#matches">
              Matches
            </a>

            <a href="#mvp">
              MVP
            </a>
          </nav>

          <div className="tg-header-actions">
            <button
              className="tg-icon-button"
              aria-label="Highlights"
            >
              <Flame size={18} />
            </button>

            <div className="tg-avatar">
              A
            </div>
          </div>
        </div>

        {mobileMenu && (
          <div className="tg-mobile-navigation">
            <a
              href="#top"
              onClick={() =>
                setMobileMenu(false)
              }
            >
              Dashboard
            </a>

            <a
              href="#tournaments"
              onClick={() =>
                setMobileMenu(false)
              }
            >
              Events
            </a>

            <a
              href="#matches"
              onClick={() =>
                setMobileMenu(false)
              }
            >
              Matches
            </a>

            <a
              href="#mvp"
              onClick={() =>
                setMobileMenu(false)
              }
            >
              MVP
            </a>
          </div>
        )}
      </header>

      <main id="top">
        <section className="tg-hero tg-container">
          <div className="tg-hero-copy">
            <div className="tg-eyebrow">
              <span className="tg-live-marker" />
              LIVE COMPETITION FEED
            </div>

            <div className="tg-title-kicker">
              {mode === "official"
                ? "OFFICIAL CIRCUIT"
                : "COMMUNITY CIRCUIT"}
            </div>

            <h1>
              {loadingTournaments
                ? "LOADING..."
                : liveTournament?.name ??
                  "NO ACTIVE TOURNAMENT"}
            </h1>

            <p className="tg-hero-description">
              Real-time tournament intelligence,
              match results and competitive
              performance tracking.
            </p>

            {liveTournament && (
              <div className="tg-hero-meta">
                <div>
                  <span>STAGE</span>
                  <strong>
                    {liveTournament.phase ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>MATCHES</span>
                  <strong>
                    {liveTournament.matches}
                  </strong>
                </div>

                <div>
                  <span>TEAMS</span>
                  <strong>
                    {liveTournament.teams}
                  </strong>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="tg-container tg-performance">
          <div className="tg-performance-head">
            <div>
              <span className="tg-section-label">
                <span />
                CURRENT TOURNAMENT
              </span>

              <h2>
                {selectedTournament?.name ??
                  "NO TOURNAMENT SELECTED"}
              </h2>

              {selectedTournament && (
                <p className="tg-performance-subtitle">
                  {selectedTournament.phase ||
                    "—"}
                  {" · "}
                  {selectedTournament.matches}
                  {" MATCHES · "}
                  {selectedTournament.teams}
                  {" TEAMS"}
                </p>
              )}
            </div>

            <div className="tg-selected-tag">
              <span className="tg-live-marker" />
              {selectedTournament?.status ??
                "NO DATA"}
            </div>
          </div>

          <div className="tg-stat-grid">
            <Stat
              icon={<Star />}
              title="TOTAL SCORE"
              value={stats.total}
              accent
            />

            <Stat
              icon={<Crosshair />}
              title="ELIMINATIONS"
              value={stats.kills}
            />

            <Stat
              icon={<Shield />}
              title="PLACEMENT PTS"
              value={stats.placement}
            />

            <Stat
              icon={<Trophy />}
              title="CURRENT RANK"
              value={currentRank}
            />
          </div>

          <div className="tg-performance-footer">
            <div>
              <span>
                AVERAGE / MATCH
              </span>
              <strong>
                {averagePoints}
              </strong>
            </div>

            <div>
              <span>PLAYED</span>
              <strong>
                {loadingMatches
                  ? "..."
                  : `${matches.length}/${
                      selectedTournament?.matches ??
                      0
                    }`}
              </strong>
            </div>

            <div>
              <span>STATUS</span>
              <strong>
                {selectedTournament?.status ??
                  "NO DATA"}
              </strong>
            </div>
          </div>
        </section>

        <section className="tg-container tg-circuit-section">
          <div className="tg-circuit-heading">
            <div>
              <span className="tg-section-label">
                <span />
                COMPETITION MODE
              </span>

              <h2>
                SELECT CIRCUIT
              </h2>
            </div>

            <div className="tg-circuit-count">
              {tournaments.length} EVENTS
            </div>
          </div>

          <div className="tg-circuit-switch">
            <button
              className={
                mode === "official"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeMode("official")
              }
            >
              <Trophy size={18} />
              <span>OFFICIAL</span>
            </button>

            <button
              className={
                mode === "scrims"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeMode("scrims")
              }
            >
              <Gamepad2 size={18} />
              <span>SCRIMS</span>
            </button>

            <div className="tg-switch-line" />
          </div>
        </section>

        <section className="tg-container tg-stage-section">
          <div className="tg-section-label">
            <span />
            EVENT TIMELINE
          </div>

          {folders.length > 0 ? (
            <div className="tg-stage-list">
              {folders.map(
                (folder, index) => {
                  const tournament =
                    tournaments.find(
                      (item) =>
                        item.id ===
                        folder.tournamentId,
                    );

                  return (
                    <button
                      key={folder.id}
                      className={
                        selectedTournamentId ===
                        folder.tournamentId
                          ? "tg-stage active"
                          : "tg-stage"
                      }
                      onClick={() =>
                        selectTournament(
                          folder.tournamentId,
                        )
                      }
                    >
                      <span className="tg-stage-number">
                        {String(
                          index + 1,
                        ).padStart(2, "0")}
                      </span>

                      <span className="tg-stage-name">
                        {folder.label}
                      </span>

                      <span className="tg-stage-status">
                        {tournament?.status ===
                        "LIVE"
                          ? "LIVE"
                          : "VIEW"}
                      </span>

                      <span className="tg-stage-arrow">
                        <ChevronRight
                          size={17}
                        />
                      </span>
                    </button>
                  );
                },
              )}
            </div>
          ) : (
            <EmptyState
              text={
                loadingTournaments
                  ? "LOADING EVENTS..."
                  : "NO EVENTS AVAILABLE"
              }
            />
          )}
        </section>

        <section
          id="tournaments"
          className="tg-container tg-section"
        >
          <div className="tg-section-heading">
            <div>
              <span className="tg-section-label">
                <span />
                COMPETITIVE CALENDAR
              </span>

              <h2>
                {mode === "official"
                  ? "OFFICIAL EVENTS"
                  : "SCRIM EVENTS"}
              </h2>
            </div>

            <div className="tg-heading-icon">
              <CalendarDays size={24} />
            </div>
          </div>

          {error && (
            <div className="tg-empty-message">
              {error}
            </div>
          )}

          {tournaments.length > 0 ? (
            <div className="tg-tournament-grid">
              {tournaments.map(
                (tournament, index) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    index={index}
                    selected={
                      tournament.id ===
                      selectedTournament?.id
                    }
                    onClick={() =>
                      selectTournament(
                        tournament.id,
                      )
                    }
                  />
                ),
              )}
            </div>
          ) : (
            <EmptyState
              text={
                loadingTournaments
                  ? "LOADING TOURNAMENTS..."
                  : "NO TOURNAMENTS AVAILABLE"
              }
            />
          )}
        </section>

        <section
          id="matches"
          className="tg-container tg-section"
        >
          <div className="tg-section-heading">
            <div>
              <span className="tg-section-label">
                <span />
                PERFORMANCE LOG
              </span>

              <h2>
                MATCH HISTORY
              </h2>
            </div>

            <div className="tg-match-count">
              {matches.length} MATCHES
            </div>
          </div>

          {matches.length > 0 ? (
            <div className="tg-match-table">
              <div className="tg-match-header">
                <span>MATCH</span>
                <span>KILLS</span>
                <span>POSITION</span>
                <span>POINTS</span>
              </div>

              {[...matches]
                .reverse()
                .map((match) => (
                  <MatchRow
                    key={match.id}
                    match={match}
                  />
                ))}
            </div>
          ) : (
            <EmptyState
              text={
                loadingMatches
                  ? "LOADING MATCHES..."
                  : "NO MATCH RESULTS AVAILABLE"
              }
            />
          )}
        </section>

        <section
          id="mvp"
          className="tg-container tg-mvp-section"
        >
          <div className="tg-section-heading">
            <div>
              <span className="tg-section-label">
                <span />
                PLAYER PERFORMANCE
              </span>

              <h2>
                DAILY MVP
              </h2>
            </div>

            <span className="tg-mvp-day">
              {mvpPlayer
                ? "TOP PLAYER"
                : "NO DATA"}
            </span>
          </div>

          {mvpPlayer ? (
            <div className="tg-mvp-card">
              <div className="tg-mvp-image">
                <img
                  src={
                    mvpPlayer.avatarUrl ||
                    mvpImage
                  }
                  alt="Daily MVP"
                />
              </div>

              <div className="tg-mvp-info">
                <span className="tg-mvp-role">
                  {mvpPlayer.role ||
                    "TOP PERFORMER"}
                </span>

                <h3>
                  {mvpPlayer.name}
                </h3>

                <p>
                  {mvpPlayer.bio ||
                    "Leading player performance from the available tournament data."}
                </p>
              </div>

              <div className="tg-mvp-stats">
                <div>
                  <span>KILLS</span>
                  <strong>
                    {mvpPlayer.kills}
                  </strong>
                </div>

                <div>
                  <span>MATCHES</span>
                  <strong>
                    {mvpPlayer.matches}
                  </strong>
                </div>

                <div>
                  <span>K/D</span>
                  <strong>
                    {mvpPlayer.matches > 0
                      ? (
                          mvpPlayer.kills /
                          mvpPlayer.matches
                        ).toFixed(1)
                      : "0.0"}
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              text={
                loadingPlayers
                  ? "LOADING PLAYER DATA..."
                  : "NO PLAYER DATA AVAILABLE"
              }
            />
          )}
        </section>

        <footer className="tg-footer tg-container">
          <div className="tg-footer-brand">
            TOTAL GAMING HUB
          </div>

          <div className="tg-footer-line" />

          <div className="tg-footer-meta">
            PLAY · COMPETE · BELONG
          </div>
        </footer>
      </main>
    </div>
  );
}

function MatchRow({
  match,
}: {
  match: Match;
}) {
  const displayMatch =
    match as DisplayMatch;

  const kills = Number(
    displayMatch.kills ??
      displayMatch.totalKills ??
      0,
  );

  const position =
    displayMatch.position ?? null;

  return (
    <div className="tg-match-row">
      <div>
        <strong>
          MATCH {match.number}
        </strong>

        <span>
          {match.map || "MAP"}
        </span>
      </div>

      <strong>
        {kills}
      </strong>

      <strong>
        {position != null
          ? `#${position}`
          : "—"}
      </strong>

      <strong className="tg-match-points">
        {getMatchPoints(
          displayMatch,
        )}
      </strong>
    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="tg-empty-state">
      {text}
    </div>
  );
}

function Stat({
  icon,
  title,
  value,
  accent = false,
}: {
  icon: ReactNode;
  title: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? "tg-stat accent"
          : "tg-stat"
      }
    >
      <div className="tg-stat-icon">
        {icon}
      </div>

      <span className="tg-stat-title">
        {title}
      </span>

      <strong className="tg-stat-value">
        {value}
      </strong>
    </div>
  );
}

function TournamentCard({
  tournament,
  index,
  selected,
  onClick,
}: {
  tournament: Tournament;
  index: number;
  selected: boolean;
  onClick: () => void;
}) {
  const statusClass =
    tournament.status
      .toLowerCase();

  return (
    <button
      className={
        selected
          ? "tg-tournament-card selected"
          : "tg-tournament-card"
      }
      onClick={onClick}
    >
      <div className="tg-card-top">
        <span
          className={`tg-tournament-status ${statusClass}`}
        >
          {tournament.status ||
            "UPCOMING"}
        </span>

        <span className="tg-card-index">
          {String(index + 1).padStart(
            2,
            "0",
          )}
        </span>
      </div>

      <div className="tg-card-content">
        <span className="tg-card-phase">
          {tournament.phase ||
            "EVENT"}
        </span>

        <h3>
          {tournament.name}
        </h3>
      </div>

      <div className="tg-card-footer">
        <span>
          <CalendarDays size={15} />
          {tournament.matches} MATCHES
        </span>

        <span>
          <Users size={15} />
          {tournament.teams} TEAMS
        </span>

        <ChevronRight size={18} />
      </div>
    </button>
  );
}
