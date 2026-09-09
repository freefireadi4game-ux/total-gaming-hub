import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
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

import teamImage from "@/assets/total-gaming-team.jpg";
import mvpImage from "@/assets/total-gaming-mvp.jpg";

type Mode = "official" | "scrims";

type Tournament = {
  id: string;
  name: string;
  status: "LIVE" | "UPCOMING" | "ARCHIVED";
  phase: string;
  matches: number;
  teams: number | string;
};

type Match = {
  id: string;
  number: number;
  map: string;
  position: number;
  kills: number;
  mvp: string;
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

const matches: Match[] = [
  {
    id: "match-1",
    number: 1,
    map: "Bermuda",
    position: 1,
    kills: 10,
    mvp: "Player 1",
  },
  {
    id: "match-2",
    number: 2,
    map: "Purgatory",
    position: 3,
    kills: 8,
    mvp: "Player 1",
  },
  {
    id: "match-3",
    number: 3,
    map: "Alpine",
    position: 5,
    kills: 6,
    mvp: "Player 2",
  },
];

const officialTournaments: Tournament[] = [
  {
    id: "official-1",
    name: "TEZ FFMIC 2026 FALL",
    status: "LIVE",
    phase: "PLAY-INS",
    matches: 6,
    teams: 18,
  },
  {
    id: "official-2",
    name: "TEZ FFMIC 2026 FALL",
    status: "UPCOMING",
    phase: "GS - WEEK 1",
    matches: 6,
    teams: 18,
  },
  {
    id: "official-3",
    name: "TEZ FFMIC 2026 FALL",
    status: "UPCOMING",
    phase: "GS - WEEK 2",
    matches: 6,
    teams: 18,
  },
  {
    id: "official-4",
    name: "TEZ FFMIC 2026 FALL",
    status: "UPCOMING",
    phase: "KO - WEEK 1",
    matches: 12,
    teams: 18,
  },
  {
    id: "official-5",
    name: "TEZ FFMIC 2026 FALL",
    status: "UPCOMING",
    phase: "KO - WEEK 2 - DAY 1",
    matches: 6,
    teams: 18,
  },
  {
    id: "official-6",
    name: "TEZ FFMIC 2026 SPRING",
    status: "ARCHIVED",
    phase: "GRAND FINALS",
    matches: 12,
    teams: 18,
  },
];

const scrimTournaments: Tournament[] = [
  {
    id: "scrim-1",
    name: "TG WEEKLY SCRIMS",
    status: "LIVE",
    phase: "WEEK 2",
    matches: 6,
    teams: 12,
  },
  {
    id: "scrim-2",
    name: "TG WEEKLY SCRIMS",
    status: "UPCOMING",
    phase: "WEEK 3",
    matches: 6,
    teams: 12,
  },
  {
    id: "scrim-3",
    name: "TG CUSTOM SCRIMS",
    status: "UPCOMING",
    phase: "WEEK 4",
    matches: 6,
    teams: "ANY",
  },
  {
    id: "scrim-4",
    name: "COMMUNITY SCRIMS",
    status: "ARCHIVED",
    phase: "WEEK 1",
    matches: 6,
    teams: "ANY",
  },
];

const officialFolders = [
  {
    id: "play-ins",
    label: "PLAY-INS",
    tournamentId: "official-1",
  },
  {
    id: "gs-week-1",
    label: "GS — WEEK 1",
    tournamentId: "official-2",
  },
  {
    id: "gs-week-2",
    label: "GS — WEEK 2",
    tournamentId: "official-3",
  },
  {
    id: "ko-week-1",
    label: "KO — WEEK 1",
    tournamentId: "official-4",
  },
  {
    id: "ko-week-2",
    label: "KO — WEEK 2 · DAY 1",
    tournamentId: "official-5",
  },
];

const scrimFolders = [
  {
    id: "week-1",
    label: "WEEK 1",
    tournamentId: "scrim-4",
  },
  {
    id: "week-2",
    label: "WEEK 2",
    tournamentId: "scrim-1",
  },
  {
    id: "week-3",
    label: "WEEK 3",
    tournamentId: "scrim-2",
  },
  {
    id: "week-4",
    label: "WEEK 4",
    tournamentId: "scrim-3",
  },
];

function getMatchPoints(match: Match) {
  return match.kills + (placementPoints[match.position] ?? 0);
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
  const [mode, setMode] = useState<Mode>("official");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("play-ins");

  const tournaments =
    mode === "official"
      ? officialTournaments
      : scrimTournaments;

  const folders =
    mode === "official"
      ? officialFolders
      : scrimFolders;

  const liveTournament =
    tournaments.find(
      (tournament) => tournament.status === "LIVE",
    ) ?? tournaments[0];

  const selectedTournament = useMemo(() => {
    const folder =
      folders.find(
        (item) => item.id === selectedFolder,
      ) ?? folders[0];

    return (
      tournaments.find(
        (item) => item.id === folder?.tournamentId,
      ) ?? liveTournament
    );
  }, [
    folders,
    selectedFolder,
    tournaments,
    liveTournament,
  ]);

  const stats = useMemo(() => {
    const kills = matches.reduce(
      (sum, match) => sum + match.kills,
      0,
    );

    const placement = matches.reduce(
      (sum, match) =>
        sum + (placementPoints[match.position] ?? 0),
      0,
    );

    return {
      kills,
      placement,
      total: kills + placement,
    };
  }, []);

  function changeMode(nextMode: Mode) {
    setMode(nextMode);

    setSelectedFolder(
      nextMode === "official"
        ? "play-ins"
        : "week-2",
    );
  }

  return (
    <div className="tg-dashboard">
      {/* SINGLE BACKGROUND LOGO */}

      <div
        className="tg-background-logo"
        aria-hidden="true"
      >
        <img
          src="/iqoo-tg-logo.png"
          alt=""
        />
      </div>

      <div className="tg-background-grid" />

      {/* HEADER */}

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
                TOTAL GAMING <span>HUB</span>
              </div>

              <div className="tg-brand-sub">
                PLAY · COMPETE · BELONG
              </div>
            </div>
          </a>

          <nav className="tg-navigation">
            <a href="#top">Dashboard</a>
            <a href="#tournaments">Events</a>
            <a href="#matches">Matches</a>
            <a href="#mvp">MVP</a>
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

        {/* HERO */}

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
              {liveTournament.name}
            </h1>

            <p className="tg-hero-description">
              Real-time tournament intelligence,
              match results and competitive
              performance tracking.
            </p>

            <div className="tg-hero-meta">
              <div>
                <span>STAGE</span>
                <strong>
                  {liveTournament.phase}
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

            {/* UNIQUE MODE SWITCH */}

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
                OFFICIAL
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
                SCRIMS
              </button>

              <div className="tg-switch-line" />
            </div>

          </div>

          {/* HERO VISUAL */}

          <div className="tg-hero-visual">

            <img
              src={teamImage}
              alt="Total Gaming team"
            />

            <div className="tg-hero-shade" />

            <div className="tg-visual-label">
              <span>LIVE</span>
              <strong>FFMC 2026</strong>
            </div>

            <div className="tg-visual-index">
              01
            </div>

          </div>

        </section>

        {/* STAGE NAVIGATION */}

        <section className="tg-container tg-stage-section">

          <div className="tg-section-label">
            <span />
            EVENT TIMELINE
          </div>

          <div className="tg-stage-list">
            {folders.map(
              (folder, index) => (
                <button
                  key={folder.id}
                  className={
                    selectedFolder ===
                    folder.id
                      ? "tg-stage active"
                      : "tg-stage"
                  }
                  onClick={() =>
                    setSelectedFolder(
                      folder.id,
                    )
                  }
                >
                  <span className="tg-stage-number">
                    0{index + 1}
                  </span>

                  <span className="tg-stage-name">
                    {folder.label}
                  </span>

                  <span className="tg-stage-arrow">
                    <ChevronRight size={17} />
                  </span>
                </button>
              ),
            )}
          </div>

        </section>

        {/* PERFORMANCE STRIP */}

        <section className="tg-container tg-performance">

          <div className="tg-performance-head">
            <div>
              <span className="tg-section-label">
                <span />
                PERFORMANCE SNAPSHOT
              </span>

              <h2>
                {selectedTournament.name}
              </h2>
            </div>

            <div className="tg-selected-tag">
              {selectedTournament.phase}
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
              title="PLACEMENT"
              value={stats.placement}
            />

            <Stat
              icon={<Trophy />}
              title="CURRENT RANK"
              value="#1"
            />

          </div>

        </section>

        {/* TOURNAMENTS */}

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

            <button className="tg-view-all">
              ALL EVENTS
              <ChevronRight size={17} />
            </button>

          </div>

          <div className="tg-tournament-list">
            {tournaments.map(
              (tournament, index) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  index={index}
                  selected={
                    selectedTournament.id ===
                    tournament.id
                  }
                  onSelect={() => {
                    const folder =
                      folders.find(
                        (item) =>
                          item.tournamentId ===
                          tournament.id,
                      );

                    if (folder) {
                      setSelectedFolder(
                        folder.id,
                      );
                    }
                  }}
                />
              ),
            )}
          </div>

        </section>

        {/* MATCH HISTORY */}

        <section
          id="matches"
          className="tg-container tg-section"
        >

          <div className="tg-section-heading">

            <div>
              <span className="tg-section-label blue">
                <span />
                MATCH TELEMETRY
              </span>

              <h2>MATCH HISTORY</h2>

              <p>
                {selectedTournament.name} ·{" "}
                {selectedTournament.phase}
              </p>
            </div>

            <div className="tg-match-count">
              {matches.length} MATCHES
            </div>

          </div>

          <div className="tg-match-table">

            <div className="tg-table-header">
              <span>MATCH</span>
              <span>MAP</span>
              <span>KILLS</span>
              <span>POSITION</span>
              <span>SCORE</span>
              <span>MVP</span>
            </div>

            {[...matches]
              .reverse()
              .map((match) => (
                <div
                  key={match.id}
                  className="tg-table-row"
                >
                  <div className="tg-match-id">
                    <span>
                      #{String(
                        match.number,
                      ).padStart(2, "0")}
                    </span>

                    <strong>
                      MATCH {match.number}
                    </strong>
                  </div>

                  <span className="tg-map">
                    {match.map}
                  </span>

                  <strong>
                    {match.kills}
                  </strong>

                  <strong>
                    #{match.position}
                  </strong>

                  <strong className="points">
                    {getMatchPoints(match)}
                  </strong>

                  <span className="tg-mvp-name">
                    {match.mvp}
                  </span>
                </div>
              ))}

          </div>

        </section>

        {/* BOTTOM DATA */}

        <section className="tg-container tg-bottom-grid">

          <div className="tg-score-card">

            <div className="tg-card-accent" />

            <div className="tg-card-header">

              <div>
                <span>
                  CURRENT TOURNAMENT
                </span>

                <h2>
                  {liveTournament.name}
                </h2>
              </div>

              <div className="tg-live-pill">
                <span />
                LIVE
              </div>

            </div>

            <div className="tg-three-metrics">

              <Metric
                label="TOTAL KILLS"
                value={stats.kills}
              />

              <Metric
                label="PLACEMENT PTS"
                value={stats.placement}
              />

              <Metric
                label="TOTAL SCORE"
                value={stats.total}
                highlight
              />

            </div>

            <div className="tg-progress">
              <div />
            </div>

            <div className="tg-progress-text">
              <span>
                {liveTournament.matches} MATCHES
              </span>

              <span>
                LIVE DATA
              </span>
            </div>

          </div>

          {/* MVP */}

          <div
            id="mvp"
            className="tg-mvp-card"
          >

            <div className="tg-mvp-top">
              <span>
                DAILY MVP
              </span>

              <span>
                DAY 01
              </span>
            </div>

            <div className="tg-mvp-player">

              <div className="tg-mvp-image">
                <img
                  src={mvpImage}
                  alt="Daily MVP"
                />
              </div>

              <div>
                <h3>PLAYER 1</h3>

                <p>
                  Rusher · Top Performer
                </p>
              </div>

            </div>

            <div className="tg-mvp-stats">

              <Metric
                label="KILLS"
                value={9}
              />

              <Metric
                label="MATCHES"
                value={3}
              />

            </div>

          </div>

        </section>

      </main>

      <footer className="tg-footer">

        <div className="tg-container tg-footer-inner">

          <div className="tg-footer-brand">
            <img
              src="/iqoo-tg-logo.png"
              alt=""
            />

            <span>
              TOTAL GAMING HUB · 2026
            </span>
          </div>

          <span>
            PLAY · COMPETE · BELONG
          </span>

        </div>

      </footer>

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

      <small>{title}</small>

      <strong>{value}</strong>
    </div>
  );
}

function Metric({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="tg-metric">
           <small>{label}</small>

      <strong
        className={
          highlight ? "highlight" : ""
        }
      >
        {value}
      </strong>
    </div>
  );
}

function TournamentCard({
  tournament,
  index,
  selected,
  onSelect,
}: {
  tournament: Tournament;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const statusClass =
    tournament.status === "LIVE"
      ? "live"
      : tournament.status ===
          "UPCOMING"
        ? "upcoming"
        : "archived";

  return (
    <button
      className={`tg-tournament-card ${
        selected ? "selected" : ""
      }`}
      onClick={onSelect}
    >

      <div className="tg-event-number">
        {String(index + 1).padStart(2, "0")}
      </div>

      <div className="tg-event-main">

        <div className="tg-event-top">
          <span
            className={`tg-status ${statusClass}`}
          >
            {tournament.status}
          </span>

          <span className="tg-event-phase">
            {tournament.phase}
          </span>
        </div>

        <h3>{tournament.name}</h3>

        <div className="tg-event-meta">
          <span>
            <CalendarDays size={14} />
            {tournament.matches} MATCHES
          </span>

          <span>
            <Users size={14} />
            {tournament.teams} TEAMS
          </span>
        </div>

      </div>

      <div className="tg-event-action">
        <ChevronRight size={20} />
      </div>

    </button>
  );
}
