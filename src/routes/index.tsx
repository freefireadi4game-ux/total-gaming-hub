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
    label: "PLAY-INS (6 M)",
    tournamentId: "official-1",
  },
  {
    id: "gs-week-1",
    label: "GS - WEEK 1 (6 M)",
    tournamentId: "official-2",
  },
  {
    id: "gs-week-2",
    label: "GS - WEEK 2 (6 M)",
    tournamentId: "official-3",
  },
  {
    id: "ko-week-1",
    label: "KO - WEEK 1 (12 M)",
    tournamentId: "official-4",
  },
  {
    id: "ko-week-2",
    label: "KO - WEEK 2 - DAY 1 (6 M)",
    tournamentId: "official-5",
  },
];

const scrimFolders = [
  {
    id: "week-1",
    label: "WEEK 1 (6 M)",
    tournamentId: "scrim-4",
  },
  {
    id: "week-2",
    label: "WEEK 2 (6 M)",
    tournamentId: "scrim-1",
  },
  {
    id: "week-3",
    label: "WEEK 3 (6 M)",
    tournamentId: "scrim-2",
  },
  {
    id: "week-4",
    label: "WEEK 4 (6 M)",
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

  /*
   * IMPORTANT:
   * Top heading always shows the currently LIVE tournament.
   */
  const liveTournament =
    tournaments.find(
      (tournament) => tournament.status === "LIVE",
    ) ?? tournaments[0];

  /*
   * Selected folder/event controls the lower dashboard
   * while the live tournament remains the main heading.
   */
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
        sum +
        (placementPoints[match.position] ?? 0),
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
      {/* BACKGROUND LOGO */}

      <div
        className="tg-background-logo"
        aria-hidden="true"
      >
        <div className="tg-background-logo-3d">
          <img
            src="/iqoo-tg-logo.png"
            alt=""
          />
        </div>

        <div className="tg-orbit orbit-one" />
        <div className="tg-orbit orbit-two" />
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
              <X />
            ) : (
              <Menu />
            )}
          </button>

          <a
            href="#top"
            className="tg-brand"
          >
            <div className="tg-brand-logo">
              <img
                src="/iqoo-tg-logo.png"
                alt="TG"
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
              Tournaments
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
              Tournaments
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

      {/* MAIN */}

      <main id="top">

        {/* LIVE HERO */}

        <section className="tg-container tg-hero">

          <div className="tg-hero-content">

            <div className="tg-badges">
              <span className="tg-badge purple">
                {mode === "official"
                  ? "OFFICIAL TOURNAMENT"
                  : "SCRIM TOURNAMENT"}
              </span>

              <span className="tg-badge live">
                ●{" "}
                {liveTournament.status ===
                "LIVE"
                  ? "LIVE"
                  : "ACTIVE"}
              </span>
            </div>

            {/* LIVE TOURNAMENT HEADING */}

            <h1>
              {liveTournament.name}
            </h1>

            <p className="tg-hero-info">
              LIVE STANDINGS ·{" "}
              {liveTournament.phase} ·{" "}
              {liveTournament.matches} MATCHES
            </p>

            {/* SCRIMS / OFFICIAL TOGGLE */}

            <div className="tg-mode-toggle">

              <button
                className={
                  mode === "scrims"
                    ? "active scrims"
                    : ""
                }
                onClick={() =>
                  changeMode("scrims")
                }
              >
                <Gamepad2 size={21} />
                SCRIMS
              </button>

              <button
                className={
                  mode === "official"
                    ? "active official"
                    : ""
                }
                onClick={() =>
                  changeMode("official")
                }
              >
                <Trophy size={21} />
                OFFICIAL
              </button>

            </div>

            {/* WEEK / PHASE FOLDERS */}

            <div className="tg-phase-panel">

              <div className="tg-phase-heading">
                <span className="tg-phase-dot" />

                {mode === "official"
                  ? "WEEK / PHASE"
                  : "SCRIM WEEK"}
              </div>

              <div className="tg-folder-list">

                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    className={
                      selectedFolder ===
                      folder.id
                        ? "tg-folder active"
                        : "tg-folder"
                    }
                    onClick={() =>
                      setSelectedFolder(
                        folder.id,
                      )
                    }
                  >
                    <span className="tg-folder-icon">
                      ▰
                    </span>

                    {folder.label}
                  </button>
                ))}

              </div>
            </div>

            {/* SELECTED EVENT */}

            <div className="tg-selected-event">

              <span>
                SELECTED EVENT
              </span>

              <strong>
                {selectedTournament.name}
              </strong>

              <small>
                {selectedTournament.phase} ·{" "}
                {selectedTournament.matches}{" "}
                MATCHES ·{" "}
                {selectedTournament.teams}{" "}
                TEAMS
              </small>

            </div>

            {/* STATS */}

            <div className="tg-stat-grid">

              <Stat
                icon={<Star />}
                title="TOTAL POINTS"
                value={stats.total}
              />

              <Stat
                icon={<Trophy />}
                title="CURRENT RANK"
                value="#1"
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

            </div>

          </div>

          {/* HERO IMAGE */}

          <div className="tg-hero-image">

            <img
              src={teamImage}
              alt="Total Gaming"
            />

            <div className="tg-image-overlay" />

            {/* REAL iQOO/TG LOGO */}

            <div
              className="tg-animated-logo"
              aria-hidden="true"
            >
              <img
                src="/iqoo-tg-logo.png"
                alt=""
                className="tg-real-logo"
              />

              <div className="tg-logo-ring" />
            </div>

          </div>

        </section>

        {/* TOURNAMENT FOLDERS */}

        <section
          id="tournaments"
          className="tg-container tg-section"
        >

          <div className="tg-section-heading">

            <div>
              <div className="tg-section-title">
                <Trophy />

                <h2>
                  {mode === "official"
                    ? "OFFICIAL TOURNAMENTS"
                    : "SCRIMS TOURNAMENTS"}
                </h2>
              </div>

              <p>
                {mode === "official"
                  ? "Ongoing · upcoming · archived official events"
                  : "Practice · improvement · consistency"}
              </p>
            </div>

            <button className="tg-view-all">
              View All
              <ChevronRight size={16} />
            </button>

          </div>

          <div className="tg-tournament-grid">

            {tournaments.map(
              (tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
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
              <div className="tg-section-title blue">
                <CalendarDays />

                <h2>
                  MATCH HISTORY
                </h2>
              </div>

              <p>
                {selectedTournament.name} ·{" "}
                {selectedTournament.phase}
              </p>
            </div>

            <span className="tg-match-count">
              {matches.length} MATCHES
            </span>

          </div>

          <div className="tg-match-table">

            <div className="tg-table-header">
              <span>MATCH</span>
              <span>KILLS</span>
              <span>POSITION</span>
              <span>POINTS</span>
              <span>MVP</span>
            </div>

            {[...matches]
              .reverse()
              .map((match) => (
                <div
                  key={match.id}
                  className="tg-table-row"
                >
                  <div>
                    <strong>
                      MATCH {match.number}
                    </strong>

                    <small>
                      {match.map}
                    </small>
                  </div>

                  <strong>
                    {match.kills}
                  </strong>

                  <strong>
                    #{match.position}
                  </strong>

                  <strong className="points">
                    {getMatchPoints(match)}
                  </strong>

                  <span>
                    {match.mvp}
                  </span>
                </div>
              ))}

          </div>

        </section>

        {/* BOTTOM DATA */}

        <section className="tg-container tg-bottom-grid">

          <div className="tg-score-card">

            <div className="tg-card-header">

              <div>
                <small>
                  CURRENT TOURNAMENT
                </small>

                <h2>
                  {liveTournament.name}
                </h2>
              </div>

              <span className="tg-live-dot">
                LIVE
              </span>

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

            <small>
              DAILY MVP · DAY 1
            </small>

            <div className="tg-mvp-player">

              <img
                src={mvpImage}
                alt="Daily MVP"
              />

              <div>
                <h3>
                  PLAYER 1
                </h3>

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

      {/* FOOTER */}

      <footer className="tg-footer">

        <div className="tg-container tg-footer-inner">

          <div className="tg-brand">

            <div className="tg-brand-logo">
              <img
                src="/iqoo-tg-logo.png"
                alt="TG"
              />
            </div>

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
}: {
  icon: ReactNode;
  title: string;
  value: string | number;
}) {
  return (
    <div className="tg-stat">
      <div className="tg-stat-icon">
        {icon}
      </div>

      <small>
        {title}
      </small>

      <strong>
        {value}
      </strong>
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
      <small>
        {label}
      </small>

      <strong
        className={
    highlight
            ? "highlight"
            : ""
        }
      >
        {value}
      </strong>
    </div>
  );
}

function TournamentCard({
  tournament,
  selected,
  onSelect,
}: {
  tournament: Tournament;
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
      <div className="tg-tournament-top">

        <span
          className={`tg-status ${statusClass}`}
        >
          {tournament.status}
        </span>

        <ChevronRight
          size={19}
          className="tg-card-arrow"
        />

      </div>

      <h3>
        {tournament.name}
      </h3>

      <div className="tg-card-tags">

        <span>
          {tournament.phase}
        </span>

        <span>
          {tournament.matches} MATCHES
        </span>

      </div>

      <div className="tg-card-bottom">

        <span>
          <Users size={14} />
          {tournament.teams} TEAMS
        </span>

        <span>
          {tournament.status ===
          "LIVE"
            ? "LIVE NOW"
            : tournament.status ===
                "ARCHIVED"
              ? "COMPLETED"
              : "UPCOMING"}
        </span>

      </div>
    </button>
  );
}
