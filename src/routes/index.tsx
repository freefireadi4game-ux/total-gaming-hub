import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
    phase: "GROUP STAGE",
    matches: 6,
    teams: 18,
  },
  {
    id: "official-3",
    name: "TEZ FFMIC 2026 FALL",
    status: "UPCOMING",
    phase: "KNOCKOUTS",
    matches: 12,
    teams: 18,
  },
  {
    id: "official-4",
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

  const tournaments =
    mode === "official" ? officialTournaments : scrimTournaments;

  const liveTournament =
    tournaments.find((tournament) => tournament.status === "LIVE") ??
    tournaments[0];

  const stats = useMemo(() => {
    const kills = matches.reduce((sum, match) => sum + match.kills, 0);

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

  return (
    <div className="tg-dashboard">
      {/* BACKGROUND */}

      <div className="tg-background-logo">
        <div className="tg-watermark">TG</div>
        <div className="tg-orbit orbit-one" />
        <div className="tg-orbit orbit-two" />
      </div>

      <div className="tg-background-grid" />

      {/* HEADER */}

      <header className="tg-header">
        <div className="tg-header-inner">

          <button
            className="tg-mobile-menu"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X /> : <Menu />}
          </button>

          <a href="#top" className="tg-brand">

            <div className="tg-brand-logo">
              TG
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
            <a href="#tournaments">Tournaments</a>
            <a href="#matches">Matches</a>
            <a href="#mvp">MVP</a>

          </nav>

          <div className="tg-header-actions">

            <button className="tg-icon-button">
              <Flame size={18} />
            </button>

            <div className="tg-avatar">
              A
            </div>

          </div>

        </div>

        {mobileMenu && (
          <div className="tg-mobile-navigation">

            <a href="#top" onClick={() => setMobileMenu(false)}>
              Dashboard
            </a>

            <a
              href="#tournaments"
              onClick={() => setMobileMenu(false)}
            >
              Tournaments
            </a>

            <a href="#matches" onClick={() => setMobileMenu(false)}>
              Matches
            </a>

            <a href="#mvp" onClick={() => setMobileMenu(false)}>
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
                ● LIVE
              </span>

            </div>

            <h1>
              {liveTournament.name}
            </h1>

            <p className="tg-hero-info">
              LIVE STANDINGS · {liveTournament.phase} ·{" "}
              {liveTournament.matches} MATCHES
            </p>

            {/* TOGGLE */}

            <div className="tg-mode-toggle">

              <button
                className={
                  mode === "scrims"
                    ? "active scrims"
                    : ""
                }
                onClick={() => setMode("scrims")}
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
                onClick={() => setMode("official")}
              >
                <Trophy size={21} />
                OFFICIAL
              </button>

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

          <div className="tg-hero-image">

            <img
              src={teamImage}
              alt="Total Gaming"
            />

            <div className="tg-image-overlay" />

            {/* animated logo */}

            <div className="tg-animated-logo">

              <div className="tg-logo-core">
                TG
              </div>

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
                  ? "Ongoing & upcoming official events"
                  : "Practice · Improvement · Consistency"}
              </p>

            </div>

            <button className="tg-view-all">
              View All
              <ChevronRight size={16} />
            </button>

          </div>

          <div className="tg-tournament-grid">

            {tournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
              />
            ))}

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
                <h2>MATCH HISTORY</h2>
              </div>

              <p>
                Every match · every kill · automatically calculated
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

            {[...matches].reverse().map((match) => (
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
              TG
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
  icon: React.ReactNode;
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

      <strong className={highlight ? "highlight" : ""}>
        {value}
      </strong>

    </div>
  );
}

function TournamentCard({
  tournament,
}: {
  tournament: Tournament;
}) {
  const statusClass =
    tournament.status === "LIVE"
      ? "live"
      : tournament.status === "UPCOMING"
        ? "upcoming"
        : "archived";

  return (
    <article className="tg-tournament-card">

      <div className="tg-tournament-top">

        <span className={`tg-status ${statusClass}`}>
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
          {tournament.status === "LIVE"
            ? "LIVE NOW"
            : tournament.status === "ARCHIVED"
              ? "COMPLETED"
              : "UPCOMING"}
        </span>

      </div>

    </article>
  );
}
