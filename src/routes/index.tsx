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

  const averagePoints =
    matches.length > 0
      ? Math.round(
          (stats.total / matches.length) * 10,
        ) / 10
      : 0;

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

      {/* =====================================================
          BACKGROUND LOGO
          CENTERED + BRIGHT + BEHIND ALL CONTENT
      ===================================================== */}

      <div
        className="tg-background-logo"
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: "0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <img
          src="/iqoo-tg-logo.png"
          alt=""
          style={{
            width: "min(72vw, 760px)",
            height: "auto",
            opacity: 0.24,
            filter:
              "brightness(2.1) saturate(1.35) contrast(1.15) drop-shadow(0 0 35px rgba(120,70,255,.55)) drop-shadow(0 0 80px rgba(40,100,255,.28))",
            transform: "translateY(3vh)",
          }}
        />
      </div>

      <div
        className="tg-background-grid"
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* =====================================================
          GLOBAL STYLE OVERRIDES
      ===================================================== */}

      <style>{`
        .tg-dashboard {
          position: relative;
          isolation: isolate;
        }

        .tg-dashboard > *:not(.tg-background-logo):not(.tg-background-grid) {
          position: relative;
          z-index: 2;
        }

        .tg-header,
        .tg-container,
        .tg-section,
        .tg-performance,
        .tg-circuit-section,
        .tg-stage-section,
        .tg-mvp-section,
        .tg-footer {
          background-color: rgba(7, 8, 14, 0.58) !important;
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }

        .tg-stat-grid {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 18px !important;
        }

        .tg-stat {
          background: rgba(12, 13, 21, 0.64) !important;
          backdrop-filter: blur(7px);
          -webkit-backdrop-filter: blur(7px);
        }

        .tg-stat.accent {
          background:
            linear-gradient(
              135deg,
              rgba(55, 18, 95, 0.68),
              rgba(12, 13, 21, 0.62)
            ) !important;
        }

        .tg-circuit-switch {
          display: flex !important;
          align-items: center;
          width: fit-content !important;
          min-width: 0 !important;
          height: 52px !important;
          padding: 4px !important;
          border-radius: 16px !important;
          background: rgba(18, 18, 27, 0.64) !important;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .tg-circuit-switch button {
          height: 42px !important;
          min-height: 42px !important;
          padding: 0 22px !important;
          border-radius: 12px !important;
        }

        .tg-stage-section {
          display: none !important;
        }

        .tg-tournament-grid {
          display: flex !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          gap: 18px !important;
          padding: 8px 4px 20px !important;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
        }

        .tg-tournament-grid::-webkit-scrollbar {
          display: none;
        }

        .tg-tournament-card {
          flex: 0 0 min(340px, 82vw) !important;
          scroll-snap-align: start;
          transition:
            transform .35s ease,
            opacity .35s ease,
            border-color .35s ease,
            box-shadow .35s ease;
          background: rgba(13, 13, 22, 0.64) !important;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .tg-tournament-card:hover {
          transform: translateY(-7px);
        }

        .tg-tournament-card.selected {
          box-shadow:
            0 0 0 1px rgba(150, 80, 255, .55),
            0 18px 50px rgba(70, 20, 130, .22);
        }

        @media (max-width: 700px) {
          .tg-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;
          }

          .tg-stat {
            min-height: 145px !important;
          }

          .tg-circuit-switch {
            width: 100% !important;
            justify-content: center;
          }

          .tg-circuit-switch button {
            flex: 1 !important;
            padding: 0 12px !important;
          }

          .tg-tournament-card {
            flex-basis: 82vw !important;
          }

          .tg-background-logo img {
            width: 105vw !important;
            opacity: .19 !important;
          }
        }

        @media (min-width: 701px) {
          .tg-tournament-grid {
            display: grid !important;
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            overflow: visible !important;
          }

          .tg-tournament-card {
            flex-basis: auto !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* =====================================================
          HEADER
      ===================================================== */}

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
                style={{
                  filter:
                    "brightness(1.45) saturate(1.25) drop-shadow(0 0 12px rgba(110,70,255,.45))",
                }}
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

        {/* =====================================================
            HERO
        ===================================================== */}

        <section
          className="tg-hero tg-container"
          style={{
            backgroundColor:
              "rgba(7, 8, 14, 0.42)",
            backdropFilter: "blur(3px)",
            WebkitBackdropFilter:
              "blur(3px)",
          }}
        >

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

          </div>

        </section>

        {/* =====================================================
            CURRENT TOURNAMENT / 4 STAT CARDS
        ===================================================== */}

        <section
          className="tg-container tg-performance"
          style={{
            backgroundColor:
              "rgba(8, 9, 15, 0.56)",
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter:
              "blur(5px)",
          }}
        >

          <div className="tg-performance-head">

            <div>

              <span className="tg-section-label">
                <span />
                CURRENT TOURNAMENT
              </span>

              <h2>
                {selectedTournament.name}
              </h2>

              <p className="tg-performance-subtitle">
                {selectedTournament.phase}
                {" · "}
                {selectedTournament.matches}
                {" MATCHES · "}
                {selectedTournament.teams}
                {" TEAMS"}
              </p>

            </div>

            <div className="tg-selected-tag">
              <span className="tg-live-marker" />
              {selectedTournament.status}
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

          <div className="tg-performance-footer">

            <div>
              <span>AVERAGE / MATCH</span>
              <strong>
                {averagePoints}
              </strong>
            </div>

            <div>
              <span>PLAYED</span>
              <strong>
                {matches.length}/{selectedTournament.matches}
              </strong>
            </div>

            <div>
              <span>STATUS</span>
              <strong>
                {selectedTournament.status}
              </strong>
            </div>

          </div>

        </section>

        {/* =====================================================
            OFFICIAL / SCRIMS THIN TOGGLE
        ===================================================== */}

        <section
          className="tg-container tg-circuit-section"
          style={{
            backgroundColor:
              "rgba(8, 9, 15, 0.50)",
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter:
              "blur(5px)",
          }}
        >

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

          </div>

        </section>

        {/* =====================================================
            TOURNAMENTS
            HORIZONTAL SCROLL + ANIMATION
        ===================================================== */}

        <section
          id="tournaments"
          className="tg-container tg-section"
          style={{
            backgroundColor:
              "rgba(7, 8, 14, 0.46)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter:
              "blur(4px)",
          }}
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

          <div className="tg-tournament-grid">

            {tournaments.map(
              (tournament, index) => (

                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  index={index}
                  selected={
                    tournament.id ===
                    selectedTournament.id
                  }
                  onClick={() => {

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

        {/* =====================================================
            MATCH HISTORY
        ===================================================== */}

        <section
          id="matches"
          className="tg-container tg-section"
          style={{
            backgroundColor:
              "rgba(7, 8, 14, 0.48)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter:
              "blur(4px)",
          }}
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

                <div
                  className="tg-match-row"
                  key={match.id}
                >

                  <div>

                    <strong>
                      MATCH {match.number}
                    </strong>

                    <span>
                      {match.map}
                    </span>

                  </div>

                  <strong>
                    {match.kills}
                  </strong>

                  <strong>
                    #{match.position}
                  </strong>

                  <strong className="tg-match-points">
                    {getMatchPoints(match)}
                  </strong>

                </div>

              ))}

          </div>

        </section>

        {/* =====================================================
            MVP
        ===================================================== */}

        <section
          id="mvp"
          className="tg-container tg-mvp-section"
          style={{
            backgroundColor:
              "rgba(7, 8, 14, 0.48)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter:
              "blur(4px)",
          }}
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
              DAY 01
            </span>

          </div>

          <div className="tg-mvp-card">

            <div className="tg-mvp-image">
              <img
                src={mvpImage}
                alt="Daily MVP"
              />
            </div>

            <div className="tg-mvp-info">

              <span className="tg-mvp-role">
                RUSHER · TOP PERFORMER
              </span>

              <h3>
                PLAYER 1
              </h3>

              <p>
                Leading the current
                tournament performance.
              </p>

            </div>

            <div className="tg-mvp-stats">

              <div>
                <span>KILLS</span>
                <strong>9</strong>
              </div>

              <div>
                <span>MATCHES</span>
                <strong>3</strong>
              </div>

              <div>
                <span>K/D</span>
                <strong>3.0</strong>
              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer
          className="tg-footer tg-container"
          style={{
            backgroundColor:
              "rgba(7, 8, 14, 0.52)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter:
              "blur(4px)",
          }}
        >

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

/* =========================================================
   STAT COMPONENT
========================================================= */

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
      style={{
        backgroundColor:
          "rgba(12, 13, 21, 0.62)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter:
          "blur(8px)",
      }}
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

/* =========================================================
   TOURNAMENT CARD
========================================================= */

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
    tournament.status.toLowerCase();

  return (
    <button
      className={
        selected
          ? "tg-tournament-card selected"
          : "tg-tournament-card"
      }
      onClick={onClick}
      style={{
        background:
          "rgba(13, 13, 22, 0.62)",
        backdropFilter: "blur(9px)",
        WebkitBackdropFilter:
          "blur(9px)",
      }}
    >

      <div className="tg-card-top">

        <span
          className={`tg-tournament-status ${statusClass}`}
        >
          {tournament.status}
        </span>

        <span className="tg-card-index">
          {String(index + 1).padStart(2, "0")}
        </span>

      </div>

      <div className="tg-card-content">

        <span className="tg-card-phase">
          {tournament.phase}
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
