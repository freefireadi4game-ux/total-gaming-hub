import React, { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  Copy,
  Crown,
  Database,
  Edit3,
  Eye,
  FileText,
  Gamepad2,
  Globe,
  Home,
  KeyRound,
  LayoutDashboard,
  Link2,
  Lock,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Palette,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Trash2,
  Trophy,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";

/* =========================================================
   TOTAL GAMING HUB
   ADMIN MASTER PANEL
   =========================================================

   Single-file admin system.

   Includes:
   - First-time admin setup
   - Admin login
   - Admin invite creation
   - Admin management
   - Dashboard
   - Tournament management
   - Team management
   - Player management
   - Match management
   - Score management
   - Scrim / Official control
   - Content control
   - Site settings
   - Permissions
   - Activity log
   - Search
   - Mobile responsive layout
   - Dark TG-style admin interface

   NOTE:
   This frontend implementation stores demo state locally.
   For production authentication and authorization, connect
   the same actions to your backend/Supabase.
   ========================================================= */

/* =========================================================
   TYPES
   ========================================================= */

type AdminRole = "owner" | "admin" | "editor" | "scorekeeper";

type Section =
  | "dashboard"
  | "tournaments"
  | "matches"
  | "teams"
  | "players"
  | "scrims"
  | "official"
  | "content"
  | "admins"
  | "activity"
  | "settings";

type TournamentStatus = "LIVE" | "UPCOMING" | "COMPLETED" | "ARCHIVED";

type MatchStatus = "LIVE" | "UPCOMING" | "COMPLETED";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  createdAt: string;
  lastLogin: string;
}

interface Invite {
  id: string;
  token: string;
  email: string;
  role: AdminRole;
  createdAt: string;
  expiresAt: string;
  used: boolean;
}

interface Tournament {
  id: string;
  name: string;
  type: "OFFICIAL" | "SCRIM";
  status: TournamentStatus;
  stage: string;
  matches: number;
  teams: number;
  startDate: string;
  endDate: string;
  description: string;
}

interface Match {
  id: string;
  tournamentId: string;
  matchNumber: number;
  map: string;
  status: MatchStatus;
  date: string;
  time: string;
  teams: number;
  totalKills: number;
}

interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  manager: string;
  players: number;
  status: "ACTIVE" | "INACTIVE";
}

interface Player {
  id: string;
  name: string;
  team: string;
  role: string;
  kills: number;
  matches: number;
  status: "ACTIVE" | "BENCHED";
}

interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  officialTitle: string;
  scrimTitle: string;
  footerText: string;
}

interface SiteSettings {
  maintenance: boolean;
  showAdminSetup: boolean;
  publicResults: boolean;
  publicStandings: boolean;
  allowRegistration: boolean;
  liveFeed: boolean;
}

interface ActivityItem {
  id: string;
  action: string;
  description: string;
  admin: string;
  createdAt: string;
}

/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE = {
  initialized: "tgh_admin_initialized",
  session: "tgh_admin_session",
  admins: "tgh_admin_users",
  invites: "tgh_admin_invites",
  tournaments: "tgh_admin_tournaments",
  matches: "tgh_admin_matches",
  teams: "tgh_admin_teams",
  players: "tgh_admin_players",
  content: "tgh_admin_content",
  settings: "tgh_admin_settings",
  activity: "tgh_admin_activity",
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function makeId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function now() {
  return new Date().toISOString();
}

function formatDate(value: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function roleLabel(role: AdminRole) {
  switch (role) {
    case "owner":
      return "OWNER";
    case "admin":
      return "ADMIN";
    case "editor":
      return "EDITOR";
    case "scorekeeper":
      return "SCOREKEEPER";
    default:
      return role;
  }
}

/* =========================================================
   DEFAULT DATA
   ========================================================= */

const DEFAULT_ADMINS: AdminUser[] = [];

const DEFAULT_TOURNAMENTS: Tournament[] = [
  {
    id: "t1",
    name: "TEZ FFMIC 2026 FALL",
    type: "OFFICIAL",
    status: "LIVE",
    stage: "PLAY-INS",
    matches: 6,
    teams: 18,
    startDate: "2026-09-01",
    endDate: "2026-09-30",
    description: "Official competitive Free Fire tournament.",
  },
  {
    id: "t2",
    name: "TEZ FFMIC 2026 FALL",
    type: "OFFICIAL",
    status: "UPCOMING",
    stage: "GS - WEEK 1",
    matches: 6,
    teams: 18,
    startDate: "2026-09-15",
    endDate: "2026-09-20",
    description: "Group stage week one.",
  },
  {
    id: "t3",
    name: "TEZ FFMIC 2026 FALL",
    type: "OFFICIAL",
    status: "UPCOMING",
    stage: "GS - WEEK 2",
    matches: 6,
    teams: 18,
    startDate: "2026-09-22",
    endDate: "2026-09-27",
    description: "Group stage week two.",
  },
];

const DEFAULT_MATCHES: Match[] = [
  {
    id: "m1",
    tournamentId: "t1",
    matchNumber: 1,
    map: "Bermuda",
    status: "COMPLETED",
    date: "2026-09-08",
    time: "18:00",
    teams: 18,
    totalKills: 0,
  },
  {
    id: "m2",
    tournamentId: "t1",
    matchNumber: 2,
    map: "Purgatory",
    status: "COMPLETED",
    date: "2026-09-08",
    time: "18:30",
    teams: 18,
    totalKills: 0,
  },
  {
    id: "m3",
    tournamentId: "t1",
    matchNumber: 3,
    map: "Alpine",
    status: "LIVE",
    date: "2026-09-08",
    time: "19:00",
    teams: 18,
    totalKills: 0,
  },
];

const DEFAULT_TEAMS: Team[] = [
  {
    id: "team1",
    name: "TOTAL GAMING",
    shortName: "TG",
    logo: "/iqoo-tg-logo.png",
    manager: "Team Manager",
    players: 4,
    status: "ACTIVE",
  },
];

const DEFAULT_PLAYERS: Player[] = [
  {
    id: "p1",
    name: "PLAYER 1",
    team: "TOTAL GAMING",
    role: "RUSHER",
    kills: 24,
    matches: 3,
    status: "ACTIVE",
  },
];

const DEFAULT_CONTENT: SiteContent = {
  heroTitle: "TEZ FFMIC 2026 FALL",
  heroSubtitle: "OFFICIAL CIRCUIT",
  heroDescription:
    "Real-time tournament intelligence, match results and competitive performance tracking.",
  officialTitle: "OFFICIAL EVENTS",
  scrimTitle: "SCRIM EVENTS",
  footerText: "TOTAL GAMING HUB • PLAY • COMPETE • BELONG",
};

const DEFAULT_SETTINGS: SiteSettings = {
  maintenance: false,
  showAdminSetup: true,
  publicResults: true,
  publicStandings: true,
  allowRegistration: false,
  liveFeed: true,
};

/* =========================================================
   PERMISSIONS
   ========================================================= */

const PERMISSIONS: Record<AdminRole, Record<Section, boolean>> = {
  owner: {
    dashboard: true,
    tournaments: true,
    matches: true,
    teams: true,
    players: true,
    scrims: true,
    official: true,
    content: true,
    admins: true,
    activity: true,
    settings: true,
  },

  admin: {
    dashboard: true,
    tournaments: true,
    matches: true,
    teams: true,
    players: true,
    scrims: true,
    official: true,
    content: true,
    admins: false,
    activity: true,
    settings: true,
  },

  editor: {
    dashboard: true,
    tournaments: false,
    matches: false,
    teams: false,
    players: false,
    scrims: false,
    official: false,
    content: true,
    admins: false,
    activity: true,
    settings: false,
  },

  scorekeeper: {
    dashboard: true,
    tournaments: false,
    matches: true,
    teams: true,
    players: true,
    scrims: false,
    official: true,
    content: false,
    admins: false,
    activity: true,
    settings: false,
  },
};

/* =========================================================
   SMALL COMPONENTS
   ========================================================= */

function Badge({
  children,
  type = "default",
}: {
  children: React.ReactNode;
  type?: "default" | "live" | "warning" | "success" | "danger" | "blue";
}) {
  return (
    <span className={`tg-badge tg-badge-${type}`}>
      {children}
    </span>
  );
}

function IconButton({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  onClick?: () => void;
}) {
  return (
    <button
      className="tg-icon-button"
      title={title}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function Panel({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="tg-panel">
      <div className="tg-panel-header">
        <div className="tg-panel-title">
          {icon}
          <span>{title}</span>
        </div>

        {action}
      </div>

      <div className="tg-panel-body">{children}</div>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className={`tg-stat-card ${accent ? "tg-stat-accent" : ""}`}>
      <div className="tg-stat-icon">{icon}</div>
      <div className="tg-stat-label">{label}</div>
      <div className="tg-stat-value">{value}</div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  onAdd,
}: {
  title: string;
  description: string;
  onAdd?: () => void;
}) {
  return (
    <div className="tg-empty">
      <Database size={38} />
      <h3>{title}</h3>
      <p>{description}</p>

      {onAdd && (
        <button className="tg-primary-button" onClick={onAdd}>
          <Plus size={17} />
          Add New
        </button>
      )}
    </div>
  );
}

/* =========================================================
   MODAL
   ========================================================= */

function Modal({
  title,
  children,
  onClose,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
}) {
  return (
    <div className="tg-modal-backdrop" onMouseDown={onClose}>
      <div
        className="tg-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="tg-modal-header">
          <h2>{title}</h2>

          <IconButton title="Close" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>

        <div className="tg-modal-body">{children}</div>

        {footer && <div className="tg-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

/* =========================================================
   INPUT
   ========================================================= */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="tg-field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="tg-field">
      <span>{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}

/* =========================================================
   LOGIN
   ========================================================= */

function LoginScreen({
  onLogin,
}: {
  onLogin: (email: string, password: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    onLogin(email.trim(), password);
  }

  return (
    <div className="tg-auth-page">
      <div className="tg-auth-grid" />

      <div className="tg-auth-card">
        <div className="tg-auth-brand">
          <div className="tg-auth-logo">
            <ShieldCheck size={34} />
          </div>

          <div>
            <strong>TOTAL GAMING</strong>
            <span>HUB ADMIN</span>
          </div>
        </div>

        <div className="tg-auth-heading">
          <Badge type="live">SECURE ACCESS</Badge>

          <h1>ADMIN CONTROL</h1>

          <p>
            Sign in to manage tournaments, matches, teams, players and
            platform content.
          </p>
        </div>

        <form onSubmit={submit}>
          <Field
            label="EMAIL"
            value={email}
            onChange={setEmail}
            placeholder="admin@example.com"
            type="email"
          />

          <Field
            label="PASSWORD"
            value={password}
            onChange={setPassword}
            placeholder="Enter password"
            type="password"
          />

          {error && <div className="tg-form-error">{error}</div>}

          <button className="tg-primary-button tg-full-button" type="submit">
            <LogIn size={18} />
            ENTER ADMIN
          </button>
        </form>

        <div className="tg-auth-note">
          <Lock size={15} />
          Admin area is hidden from the public website.
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FIRST ADMIN SETUP
   ========================================================= */

function SetupScreen({
  onComplete,
}: {
  onComplete: (
    name: string,
    email: string,
    password: string
  ) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    onComplete(name.trim(), email.trim(), password);
  }

  return (
    <div className="tg-auth-page">
      <div className="tg-auth-grid" />

      <div className="tg-auth-card tg-setup-card">
        <div className="tg-auth-brand">
          <div className="tg-auth-logo">
            <Crown size={34} />
          </div>

          <div>
            <strong>TOTAL GAMING</strong>
            <span>FIRST ADMIN SETUP</span>
          </div>
        </div>

        <div className="tg-auth-heading">
          <Badge type="warning">INITIAL SETUP</Badge>

          <h1>CREATE OWNER</h1>

          <p>
            This screen is shown only before the first admin account is
            created.
          </p>
        </div>

        <form onSubmit={submit}>
          <Field
            label="YOUR NAME"
            value={name}
            onChange={setName}
            placeholder="Owner name"
          />

          <Field
            label="EMAIL"
            value={email}
            onChange={setEmail}
            placeholder="owner@example.com"
            type="email"
          />

          <Field
            label="PASSWORD"
            value={password}
            onChange={setPassword}
            placeholder="Create password"
            type="password"
          />

          <Field
            label="CONFIRM PASSWORD"
            value={confirm}
            onChange={setConfirm}
            placeholder="Repeat password"
            type="password"
          />

          {error && <div className="tg-form-error">{error}</div>}

          <button className="tg-primary-button tg-full-button" type="submit">
            <Crown size={18} />
            CREATE OWNER
          </button>
        </form>

        <div className="tg-auth-note">
          <Shield size={15} />
          After setup, this public setup entry disappears.
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
   ========================================================= */

function Sidebar({
  section,
  setSection,
  currentAdmin,
  mobileOpen,
  onClose,
  onLogout,
}: {
  section: Section;
  setSection: (section: Section) => void;
  currentAdmin: AdminUser;
  mobileOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  const items: {
    id: Section;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={19} />,
    },
    {
      id: "tournaments",
      label: "Tournaments",
      icon: <Trophy size={19} />,
    },
    {
      id: "matches",
      label: "Matches & Scores",
      icon: <Gamepad2 size={19} />,
    },
    {
      id: "teams",
      label: "Teams",
      icon: <Users size={19} />,
    },
    {
      id: "players",
      label: "Players",
      icon: <CircleUserRound size={19} />,
    },
    {
      id: "official",
      label: "Official",
      icon: <Trophy size={19} />,
    },
    {
      id: "scrims",
      label: "Scrims",
      icon: <Zap size={19} />,
    },
    {
      id: "content",
      label: "Website Content",
      icon: <FileText size={19} />,
    },
    {
      id: "admins",
      label: "Admins",
      icon: <Shield size={19} />,
    },
    {
      id: "activity",
      label: "Activity Log",
      icon: <Activity size={19} />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={19} />,
    },
  ];

  return (
    <>
      {mobileOpen && (
        <div className="tg-sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`tg-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="tg-sidebar-brand">
          <div className="tg-mini-logo">
            <ShieldCheck size={25} />
          </div>

          <div>
            <strong>TOTAL GAMING</strong>
            <span>HUB CONTROL</span>
          </div>

          <button
            className="tg-mobile-close"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="tg-sidebar-section-label">CONTROL CENTER</div>

        <nav className="tg-sidebar-nav">
          {items.map((item) => {
            const allowed = PERMISSIONS[currentAdmin.role][item.id];

            if (!allowed) return null;

            return (
              <button
                key={item.id}
                className={`tg-nav-item ${
                  section === item.id ? "active" : ""
                }`}
                onClick={() => {
                  setSection(item.id);
                  onClose();
                }}
                type="button"
              >
                {item.icon}
                <span>{item.label}</span>

                {section === item.id && (
                  <ChevronRight size={15} className="tg-nav-arrow" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="tg-sidebar-bottom">
          <div className="tg-admin-mini">
            <div className="tg-admin-avatar">
              {currentAdmin.name.charAt(0).toUpperCase()}
            </div>

            <div className="tg-admin-mini-info">
              <strong>{currentAdmin.name}</strong>
              <span>{roleLabel(currentAdmin.role)}</span>
            </div>
          </div>

          <button
            className="tg-logout-button"
            onClick={onLogout}
            type="button"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

/* =========================================================
   TOPBAR
   ========================================================= */

function Topbar({
  title,
  subtitle,
  onMenu,
  onRefresh,
}: {
  title: string;
  subtitle: string;
  onMenu: () => void;
  onRefresh: () => void;
}) {
  return (
    <header className="tg-topbar">
      <button
        className="tg-mobile-menu"
        onClick={onMenu}
        type="button"
      >
        <Menu size={23} />
      </button>

      <div className="tg-topbar-title">
        <span>{subtitle}</span>
        <h1>{title}</h1>
      </div>

      <div className="tg-topbar-actions">
        <div className="tg-live-indicator">
          <span />
          SYSTEM ONLINE
        </div>

        <IconButton title="Refresh" onClick={onRefresh}>
          <RefreshCw size={18} />
        </IconButton>

        <IconButton title="Notifications">
          <Bell size={18} />
        </IconButton>
      </div>
    </header>
  );
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function Dashboard({
  tournaments,
  matches,
  teams,
  players,
  admins,
  activities,
  onNavigate,
}: {
  tournaments: Tournament[];
  matches: Match[];
  teams: Team[];
  players: Player[];
  admins: AdminUser[];
  activities: ActivityItem[];
  onNavigate: (section: Section) => void;
}) {
  const liveTournaments = tournaments.filter(
    (item) => item.status === "LIVE"
  ).length;

  const liveMatches = matches.filter(
    (item) => item.status === "LIVE"
  ).length;

  const upcomingMatches = matches.filter(
    (item) => item.status === "UPCOMING"
  ).length;

  return (
    <div className="tg-page">
      <div className="tg-page-intro">
        <div>
          <Badge type="live">LIVE CONTROL</Badge>
          <h2>Command Center</h2>
          <p>
            Manage the entire Total Gaming Hub from one place.
          </p>
        </div>

        <button
          className="tg-secondary-button"
          onClick={() => onNavigate("matches")}
        >
          <Gamepad2 size={17} />
          Open Live Scores
        </button>
      </div>

      <div className="tg-stat-grid">
        <StatCard
          label="LIVE TOURNAMENTS"
          value={liveTournaments}
          icon={<Trophy size={24} />}
          accent
        />

        <StatCard
          label="LIVE MATCHES"
          value={liveMatches}
          icon={<Activity size={24} />}
        />

        <StatCard
          label="UPCOMING MATCHES"
          value={upcomingMatches}
          icon={<CalendarDays size={24} />}
        />

        <StatCard
          label="TOTAL TEAMS"
          value={teams.length}
          icon={<Users size={24} />}
        />

        <StatCard
          label="TOTAL PLAYERS"
          value={players.length}
          icon={<CircleUserRound size={24} />}
        />

        <StatCard
          label="ADMINS"
          value={admins.length}
          icon={<ShieldCheck size={24} />}
        />
      </div>

      <div className="tg-dashboard-columns">
        <Panel
          title="LIVE TOURNAMENTS"
          icon={<Trophy size={18} />}
          action={
            <button
              className="tg-text-button"
              onClick={() => onNavigate("tournaments")}
            >
              VIEW ALL
              <ChevronRight size={15} />
            </button>
          }
        >
          {tournaments
            .filter((item) => item.status === "LIVE")
            .map((tournament) => (
              <div className="tg-list-row" key={tournament.id}>
                <div className="tg-list-icon purple">
                  <Trophy size={18} />
                </div>

                <div className="tg-list-content">
                  <strong>{tournament.name}</strong>
                  <span>
                    {tournament.stage} · {tournament.teams} TEAMS ·{" "}
                    {tournament.matches} MATCHES
                  </span>
                </div>

                <Badge type="live">LIVE</Badge>
              </div>
            ))}

          {liveTournaments === 0 && (
            <EmptyState
              title="No live tournaments"
              description="There are currently no live tournaments."
            />
          )}
        </Panel>

        <Panel
          title="RECENT ACTIVITY"
          icon={<Activity size={18} />}
          action={
            <button
              className="tg-text-button"
              onClick={() => onNavigate("activity")}
            >
              FULL LOG
              <ChevronRight size={15} />
            </button>
          }
        >
          {activities.slice(0, 6).map((activity) => (
            <div className="tg-activity-row" key={activity.id}>
              <div className="tg-activity-dot" />

              <div>
                <strong>{activity.action}</strong>
                <span>{activity.description}</span>
                <small>
                  {activity.admin} · {formatDate(activity.createdAt)}
                </small>
              </div>
            </div>
          ))}

          {activities.length === 0 && (
            <EmptyState
              title="No activity"
              description="Admin actions will appear here."
            />
          )}
        </Panel>
      </div>

      <Panel title="QUICK ACTIONS" icon={<Zap size={18} />}>
        <div className="tg-quick-grid">
          <button
            className="tg-quick-action"
            onClick={() => onNavigate("tournaments")}
          >
            <Trophy size={20} />
            <span>Create Tournament</span>
            <ChevronRight size={16} />
          </button>

          <button
            className="tg-quick-action"
            onClick={() => onNavigate("matches")}
          >
            <Gamepad2 size={20} />
            <span>Manage Scores</span>
            <ChevronRight size={16} />
          </button>

          <button
            className="tg-quick-action"
            onClick={() => onNavigate("teams")}
          >
            <Users size={20} />
            <span>Add Team</span>
            <ChevronRight size={16} />
          </button>

          <button
            className="tg-quick-action"
            onClick={() => onNavigate("admins")}
          >
            <UserPlus size={20} />
            <span>Invite Admin</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </Panel>
    </div>
  );
}

/* =========================================================
   TOURNAMENTS
   ========================================================= */

function TournamentsPage({
  tournaments,
  setTournaments,
  log,
}: {
  tournaments: Tournament[];
  setTournaments: React.Dispatch<React.SetStateAction<Tournament[]>>;
  log: (action: string, description: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Tournament | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState<"OFFICIAL" | "SCRIM">("OFFICIAL");
  const [status, setStatus] = useState<TournamentStatus>("UPCOMING");
  const [stage, setStage] = useState("");
  const [matches, setMatches] = useState("6");
  const [teams, setTeams] = useState("18");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const filtered = tournaments.filter((item) =>
    `${item.name} ${item.stage} ${item.type}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function resetForm() {
    setName("");
    setType("OFFICIAL");
    setStatus("UPCOMING");
    setStage("");
    setMatches("6");
    setTeams("18");
    setStartDate("");
    setEndDate("");
    setDescription("");
    setEditing(null);
  }

  function openCreate() {
    resetForm();
    setShowModal(true);
  }

  function openEdit(item: Tournament) {
    setEditing(item);
    setName(item.name);
    setType(item.type);
    setStatus(item.status);
    setStage(item.stage);
    setMatches(String(item.matches));
    setTeams(String(item.teams));
    setStartDate(item.startDate);
    setEndDate(item.endDate);
    setDescription(item.description);
    setShowModal(true);
  }

  function save() {
    if (!name.trim()) return;

    if (editing) {
      setTournaments((current) =>
        current.map((item) =>
          item.id === editing.id
            ? {
                ...item,
                name,
                type,
                status,
                stage,
                matches: Number(matches) || 0,
                teams: Number(teams) || 0,
                startDate,
                endDate,
                description,
              }
            : item
        )
      );

      log("Tournament updated", `${name} was updated.`);
    } else {
      const item: Tournament = {
        id: makeId("tournament"),
        name,
        type,
        status,
        stage,
        matches: Number(matches) || 0,
        teams: Number(teams) || 0,
        startDate,
        endDate,
        description,
      };

      setTournaments((current) => [item, ...current]);
      log("Tournament created", `${name} was created.`);
    }

    setShowModal(false);
    resetForm();
  }

  function remove(id: string) {
    const item = tournaments.find((x) => x.id === id);

    if (!item) return;

    if (!window.confirm(`Delete ${item.name}?`)) return;

    setTournaments((current) =>
      current.filter((x) => x.id !== id)
    );

    log("Tournament deleted", `${item.name} was deleted.`);
  }

  return (
    <div className="tg-page">
      <PageHeading
        eyebrow="COMPETITION CONTROL"
        title="TOURNAMENTS"
        description="Create, edit and control official tournaments and scrim events."
        button={
          <button className="tg-primary-button" onClick={openCreate}>
            <Plus size={18} />
            NEW TOURNAMENT
          </button>
        }
      />

      <div className="tg-toolbar">
        <div className="tg-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tournaments..."
          />
        </div>

        <div className="tg-toolbar-count">
          {filtered.length} EVENTS
        </div>
      </div>

      <div className="tg-table-wrap">
        <table className="tg-table">
          <thead>
            <tr>
              <th>TOURNAMENT</th>
              <th>TYPE</th>
              <th>STATUS</th>
              <th>STAGE</th>
              <th>MATCHES</th>
              <th>TEAMS</th>
              <th>DATES</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="tg-table-main">
                    <strong>{item.name}</strong>
                    <span>{item.description}</span>
                  </div>
                </td>

                <td>
                  <Badge
                    type={item.type === "OFFICIAL" ? "warning" : "blue"}
                  >
                    {item.type}
                  </Badge>
                </td>

                <td>
                  <Badge
                    type={
                      item.status === "LIVE"
                        ? "live"
                        : item.status === "COMPLETED"
                        ? "success"
                        : "default"
                    }
                  >
                    {item.status}
                  </Badge>
                </td>

                <td>{item.stage || "-"}</td>
                <td>{item.matches}</td>
                <td>{item.teams}</td>

                <td>
                  {formatDate(item.startDate)}
                  <br />
                  <small>{formatDate(item.endDate)}</small>
                </td>

                <td>
                  <div className="tg-row-actions">
                    <IconButton
                      title="Edit"
                      onClick={() => openEdit(item)}
                    >
                      <Edit3 size={16} />
                    </IconButton>

                    <IconButton
                      title="Delete"
                      onClick={() => remove(item.id)}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <EmptyState
            title="No tournaments found"
            description="Create your first tournament or change the search."
            onAdd={openCreate}
          />
        )}
      </div>

      {showModal && (
        <Modal
          title={editing ? "EDIT TOURNAMENT" : "CREATE TOURNAMENT"}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          footer={
            <>
              <button
                className="tg-secondary-button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                CANCEL
              </button>

              <button className="tg-primary-button" onClick={save}>
                <Save size={17} />
                SAVE TOURNAMENT
              </button>
            </>
          }
        >
          <div className="tg-form-grid">
            <Field
              label="TOURNAMENT NAME"
              value={name}
              onChange={setName}
              placeholder="Tournament name"
            />

            <SelectField
              label="TYPE"
              value={type}
              onChange={(value) =>
                setType(value as "OFFICIAL" | "SCRIM")
              }
            >
              <option value="OFFICIAL">OFFICIAL</option>
              <option value="SCRIM">SCRIM</option>
            </SelectField>

            <SelectField
              label="STATUS"
              value={status}
              onChange={(value) =>
                setStatus(value as TournamentStatus)
              }
            >
              <option value="LIVE">LIVE</option>
              <option value="UPCOMING">UPCOMING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </SelectField>

            <Field
              label="STAGE"
              value={stage}
              onChange={setStage}
              placeholder="PLAY-INS"
            />

            <Field
              label="MATCHES"
              value={matches}
              onChange={setMatches}
              type="number"
            />

            <Field
              label="TEAMS"
              value={teams}
              onChange={setTeams}
              type="number"
            />

            <Field
              label="START DATE"
              value={startDate}
              onChange={setStartDate}
              type="date"
            />

            <Field
              label="END DATE"
              value={endDate}
              onChange={setEndDate}
              type="date"
            />

            <label className="tg-field tg-field-full">
              <span>DESCRIPTION</span>
              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Tournament description"
              />
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* =========================================================
   PAGE HEADING
   ========================================================= */

function PageHeading({
  eyebrow,
  title,
  description,
  button,
}: {
  eyebrow: string;
  title: string;
  description: string;
  button?: React.ReactNode;
}) {
  return (
    <div className="tg-page-heading">
      <div>
        <div className="tg-eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      {button}
    </div>
  );
}

/* =========================================================
   MATCHES
   ========================================================= */

function MatchesPage({
  matches,
  setMatches,
  tournaments,
  log,
}: {
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  tournaments: Tournament[];
  log: (action: string, description: string) => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Match | null>(null);

  const [tournamentId, setTournamentId] = useState(
    tournaments[0]?.id || ""
  );
  const [matchNumber, setMatchNumber] = useState("1");
  const [map, setMap] = useState("Bermuda");
  const [status, setStatus] = useState<MatchStatus>("UPCOMING");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [teams, setTeams] = useState("18");
  const [totalKills, setTotalKills] = useState("0");

  function resetForm() {
    setEditing(null);
    setTournamentId(tournaments[0]?.id || "");
    setMatchNumber("1");
    setMap("Bermuda");
    setStatus("UPCOMING");
    setDate("");
    setTime("");
    setTeams("18");
    setTotalKills("0");
  }

  function edit(item: Match) {
    setEditing(item);
    setTournamentId(item.tournamentId);
    setMatchNumber(String(item.matchNumber));
    setMap(item.map);
    setStatus(item.status);
    setDate(item.date);
    setTime(item.time);
    setTeams(String(item.teams));
    setTotalKills(String(item.totalKills));
    setShowModal(true);
  }

  function save() {
    const tournament = tournaments.find(
      (x) => x.id === tournamentId
    );

    if (!tournament) return;

    if (editing) {
      setMatches((current) =>
        current.map((item) =>
          item.id === editing.id
            ? {
                ...item,
                tournamentId,
                matchNumber: Number(matchNumber) || 1,
                map,
                status,
                date,
                time,
                teams: Number(teams) || 0,
                totalKills: Number(totalKills) || 0,
              }
            : item
        )
      );

      log(
        "Match updated",
        `Match ${matchNumber} of ${tournament.name} was updated.`
      );
    } else {
      const item: Match = {
        id: makeId("match"),
        tournamentId,
        matchNumber: Number(matchNumber) || 1,
        map,
        status,
        date,
        time,
        teams: Number(teams) || 0,
        totalKills: Number(totalKills) || 0,
      };

      setMatches((current) => [item, ...current]);

      log(
        "Match created",
        `Match ${matchNumber} of ${tournament.name} was created.`
      );
    }

    setShowModal(false);
    resetForm();
  }

  function deleteMatch(id: string) {
    const match = matches.find((x) => x.id === id);

    if (!match) return;

    if (!window.confirm("Delete this match?")) return;

    setMatches((current) => current.filter((x) => x.id !== id));

    log("Match deleted", `Match ${match.matchNumber} was deleted.`);
  }

  return (
    <div className="tg-page">
      <PageHeading
        eyebrow="LIVE COMPETITION"
        title="MATCHES & SCORES"
        description="Control match schedules, status and live score data."
        button={
          <button
            className="tg-primary-button"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <Plus size={18} />
            NEW MATCH
          </button>
        }
      />

      <div className="tg-match-grid">
        {matches.map((match) => {
          const tournament = tournaments.find(
            (x) => x.id === match.tournamentId
          );

          return (
            <div className="tg-match-card" key={match.id}>
              <div className="tg-match-top">
                <Badge
                  type={
                    match.status === "LIVE"
                      ? "live"
                      : match.status === "COMPLETED"
                      ? "success"
                      : "blue"
                  }
                >
                  {match.status}
                </Badge>

                <span>#{String(match.matchNumber).padStart(2, "0")}</span>
              </div>

              <h3>{match.map}</h3>

              <p>{tournament?.name || "Unknown tournament"}</p>

              <div className="tg-match-info">
                <div>
                  <span>DATE</span>
                  <strong>{formatDate(match.date)}</strong>
                </div>

                <div>
                  <span>TIME</span>
                  <strong>{match.time || "-"}</strong>
                </div>

                <div>
                  <span>TEAMS</span>
                  <strong>{match.teams}</strong>
                </div>
              </div>

              <div className="tg-match-score">
                <span>TOTAL KILLS</span>
                <strong>{match.totalKills}</strong>
              </div>

              <div className="tg-card-actions">
                <button
                  className="tg-secondary-button"
                  onClick={() => edit(match)}
                >
                  <Edit3 size={16} />
                  EDIT
                </button>

                <button
                  className="tg-danger-button"
                  onClick={() => deleteMatch(match.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {matches.length === 0 && (
        <EmptyState
          title="No matches"
          description="Create a match to start managing the competition."
        />
      )}

      {showModal && (
        <Modal
          title={editing ? "EDIT MATCH" : "CREATE MATCH"}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          footer={
            <>
              <button
                className="tg-secondary-button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                CANCEL
              </button>

              <button className="tg-primary-button" onClick={save}>
                <Save size={17} />
                SAVE MATCH
              </button>
            </>
          }
        >
          <div className="tg-form-grid">
            <SelectField
              label="TOURNAMENT"
              value={tournamentId}
              onChange={setTournamentId}
            >
              {tournaments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — {item.stage}
                </option>
              ))}
            </SelectField>

            <Field
              label="MATCH NUMBER"
              value={matchNumber}
              onChange={setMatchNumber}
              type="number"
            />

            <SelectField
              label="MAP"
              value={map}
              onChange={setMap}
            >
              <option value="Bermuda">Bermuda</option>
              <option value="Purgatory">Purgatory</option>
              <option value="Alpine">Alpine</option>
              <option value="NexTerra">NexTerra</option>
              <option value="Kalahari">Kalahari</option>
            </SelectField>

            <SelectField
              label="STATUS"
              value={status}
              onChange={(value) =>
                setStatus(value as MatchStatus)
              }
            >
              <option value="LIVE">LIVE</option>
              <option value="UPCOMING">UPCOMING</option>
              <option value="COMPLETED">COMPLETED</option>
            </SelectField>

            <Field
              label="DATE"
              value={date}
              onChange={setDate}
              type="date"
            />

            <Field
              label="TIME"
              value={time}
              onChange={setTime}
              type="time"
            />

            <Field
              label="TEAMS"
              value={teams}
              onChange={setTeams}
              type="number"
            />

            <Field
              label="TOTAL KILLS"
              value={totalKills}
              onChange={setTotalKills}
              type="number"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

/* =========================================================
   TEAMS
   ========================================================= */

function TeamsPage({
  teams,
  setTeams,
  log,
}: {
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  log: (action: string, description: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [logo, setLogo] = useState("");
  const [manager, setManager] = useState("");
  const [players, setPlayers] = useState("4");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">(
    "ACTIVE"
  );

  const filtered = teams.filter((team) =>
    `${team.name} ${team.shortName} ${team.manager}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function reset() {
    setEditing(null);
    setName("");
    setShortName("");
    setLogo("");
    setManager("");
    setPlayers("4");
    setStatus("ACTIVE");
  }

  function openEdit(team: Team) {
    setEditing(team);
    setName(team.name);
    setShortName(team.shortName);
    setLogo(team.logo);
    setManager(team.manager);
    setPlayers(String(team.players));
    setStatus(team.status);
    setShowModal(true);
  }

  function save() {
    if (!name.trim()) return;

    if (editing) {
      setTeams((current) =>
        current.map((team) =>
          team.id === editing.id
            ? {
                ...team,
                name,
                shortName,
                logo,
                manager,
                players: Number(players) || 0,
                status,
              }
            : team
        )
      );

      log("Team updated", `${name} was updated.`);
    } else {
      const team: Team = {
        id: makeId("team"),
        name,
        shortName,
        logo,
        manager,
        players: Number(players) || 0,
        status,
      };

      setTeams((current) => [team, ...current]);

      log("Team created", `${name} was added.`);
    }

    setShowModal(false);
    reset();
  }

  function remove(id: string) {
    const team = teams.find((x) => x.id === id);

    if (!team) return;

    if (!window.confirm(`Delete ${team.name}?`)) return;

    setTeams((current) => current.filter((x) => x.id !== id));

    log("Team deleted", `${team.name} was deleted.`);
  }

  return (
    <div className="tg-page">
      <PageHeading
        eyebrow="ROSTER CONTROL"
        title="TEAMS"
        description="Manage participating teams, logos, managers and status."
        button={
          <button
            className="tg-primary-button"
            onClick={() => {
              reset();
              setShowModal(true);
            }}
          >
            <Plus size={18} />
            ADD TEAM
          </button>
        }
      />

      <div className="tg-toolbar">
        <div className="tg-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search teams..."
          />
        </div>

        <div className="tg-toolbar-count">
          {filtered.length} TEAMS
        </div>
      </div>

      <div className="tg-team-grid">
        {filtered.map((team) => (
          <div className="tg-team-card" key={team.id}>
            <div className="tg-team-logo">
              {team.logo ? (
                <img src={team.logo} alt={team.name} />
              ) : (
                <Users size={29} />
              )}
            </div>

            <div className="tg-team-main">
              <Badge type={team.status === "ACTIVE" ? "success" : "default"}>
                {team.status}
              </Badge>

              <h3>{team.name}</h3>
              <span>{team.shortName}</span>
            </div>

            <div className="tg-team-meta">
              <div>
                <small>MANAGER</small>
                <strong>{team.manager || "-"}</strong>
              </div>

              <div>
                <small>PLAYERS</small>
                <strong>{team.players}</strong>
              </div>
            </div>

            <div className="tg-card-actions">
              <button
                className="tg-secondary-button"
                onClick={() => openEdit(team)}
              >
                <Edit3 size={16} />
                EDIT
              </button>

              <button
                className="tg-danger-button"
                onClick={() => remove(team.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          title="No teams found"
          description="Add a team to begin building your roster."
          onAdd={() => {
            reset();
            setShowModal(true);
          }}
        />
      )}

      {showModal && (
        <Modal
          title={editing ? "EDIT TEAM" : "ADD TEAM"}
          onClose={() => {
            setShowModal(false);
            reset();
          }}
          footer={
            <>
              <button
                className="tg-secondary-button"
                onClick={() => {
                  setShowModal(false);
                  reset();
                }}
              >
                CANCEL
              </button>

              <button className="tg-primary-button" onClick={save}>
                <Save size={17} />
                SAVE TEAM
              </button>
            </>
          }
        >
          <div className="tg-form-grid">
            <Field
              label="TEAM NAME"
              value={name}
              onChange={setName}
              placeholder="TOTAL GAMING"
            />

            <Field
              label="SHORT NAME"
              value={shortName}
              onChange={setShortName}
              placeholder="TG"
            />

            <Field
              label="LOGO URL"
              value={logo}
              onChange={setLogo}
              placeholder="/team-logo.png"
            />

            <Field
              label="MANAGER"
              value={manager}
              onChange={setManager}
              placeholder="Manager name"
            />

            <Field
              label="PLAYER COUNT"
              value={players}
              onChange={setPlayers}
              type="number"
            />

            <SelectField
              label="STATUS"
              value={status}
              onChange={(value) =>
                setStatus(value as "ACTIVE" | "INACTIVE")
              }
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </SelectField>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* =========================================================
   PLAYERS
   ========================================================= */

function PlayersPage({
  players,
  setPlayers,
  teams,
  log,
}: {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  teams: Team[];
  log: (action: string, description: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);

  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [role, setRole] = useState("RUSHER");
  const [kills, setKills] = useState("0");
  const [matches, setMatches] = useState("0");
  const [status, setStatus] = useState<"ACTIVE" | "BENCHED">(
    "ACTIVE"
  );

  const filtered = players.filter((player) =>
    `${player.name} ${player.team} ${player.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function reset() {
    setEditing(null);
    setName("");
    setTeam(teams[0]?.name || "");
    setRole("RUSHER");
    setKills("0");
    setMatches("0");
    setStatus("ACTIVE");
  }

  function openEdit(player: Player) {
    setEditing(player);
    setName(player.name);
    setTeam(player.team);
    setRole(player.role);
    setKills(String(player.kills));
    setMatches(String(player.matches));
    setStatus(player.status);
    setShowModal(true);
  }

  function save() {
    if (!name.trim()) return;

    if (editing) {
      setPlayers((current) =>
        current.map((player) =>
          player.id === editing.id
            ? {
                ...player,
                name,
                team,
                role,
                kills: Number(kills) || 0,
                matches: Number(matches) || 0,
                status,
              }
            : player
        )
      );

      log("Player updated", `${name} was updated.`);
    } else {
      const player: Player = {
        id: makeId("player"),
        name,
        team,
        role,
        kills: Number(kills) || 0,
        matches: Number(matches) || 0,
        status,
      };

      setPlayers((current) => [player, ...current]);

      log("Player created", `${name} was added.`);
    }

    setShowModal(false);
    reset();
  }

  function remove(id: string) {
    const player = players.find((x) => x.id === id);

    if (!player) return;

    if (!window.confirm(`Delete ${player.name}?`)) return;

    setPlayers((current) =>
      current.filter((x) => x.id !== id)
    );

    log("Player deleted", `${player.name} was deleted.`);
  }

  return (
    <div className="tg-page">
      <PageHeading
        eyebrow="PLAYER CONTROL"
        title="PLAYERS"
        description="Manage player profiles and competitive statistics."
        button={
          <button
            className="tg-primary-button"
            onClick={() => {
              reset();
              setShowModal(true);
            }}
          >
            <Plus size={18} />
            ADD PLAYER
          </button>
        }
      />

      <div className="tg-toolbar">
        <div className="tg-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search players..."
          />
        </div>

        <div className="tg-toolbar-count">
          {filtered.length} PLAYERS
        </div>
      </div>

      <div className="tg-table-wrap">
        <table className="tg-table">
          <thead>
            <tr>
              <th>PLAYER</th>
              <th>TEAM</th>
              <th>ROLE</th>
              <th>KILLS</th>
              <th>MATCHES</th>
              <th>STATUS</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {filtered.map((player) => (
              <tr key={player.id}>
                <td>
                  <div className="tg-player-cell">
                    <div className="tg-player-avatar">
                      {player.name.charAt(0).toUpperCase()}
                    </div>

                    <strong>{player.name}</strong>
                  </div>
                </td>

                <td>{player.team || "-"}</td>
                <td>{player.role}</td>
                <td className="tg-number-highlight">
                  {player.kills}
                </td>
                <td>{player.matches}</td>

                <td>
                  <Badge
                    type={
                      player.status === "ACTIVE"
                        ? "success"
                        : "default"
                    }
                  >
                    {player.status}
                  </Badge>
                </td>

                <td>
                  <div className="tg-row-actions">
                    <IconButton
                      title="Edit"
                      onClick={() => openEdit(player)}
                    >
                      <Edit3 size={16} />
                    </IconButton>

                    <IconButton
                      title="Delete"
                      onClick={() => remove(player.id)}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <EmptyState
            title="No players found"
            description="Add your first player."
          />
        )}
      </div>

      {showModal && (
        <Modal
          title={editing ? "EDIT PLAYER" : "ADD PLAYER"}
          onClose={() => {
            setShowModal(false);
            reset();
          }}
          footer={
            <>
              <button
                className="tg-secondary-button"
                onClick={() => {
                  setShowModal(false);
                  reset();
                }}
              >
                CANCEL
              </button>

              <button className="tg-primary-button" onClick={save}>
                <Save size={17} />
                SAVE PLAYER
              </button>
            </>
          }
        >
          <div className="tg-form-grid">
            <Field
              label="PLAYER NAME"
              value={name}
              onChange={setName}
              placeholder="Player name"
            />

            <SelectField
              label="TEAM"
              value={team}
              onChange={setTeam}
            >
              <option value="">No team</option>
              {teams.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="ROLE"
              value={role}
              onChange={setRole}
            >
              <option value="RUSHER">RUSHER</option>
              <option value="IGL">IGL</option>
              <option value="SUPPORT">SUPPORT</option>
              <option value="SNIPER">SNIPER</option>
              <option value="FRAGGER">FRAGGER</option>
              <option value="COACH">COACH</option>
            </SelectField>

            <SelectField
              label="STATUS"
              value={status}
              onChange={(value) =>
                setStatus(value as "ACTIVE" | "BENCHED")
              }
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="BENCHED">BENCHED</option>
            </SelectField>

            <Field
              label="TOTAL KILLS"
              value={kills}
              onChange={setKills}
              type="number"
            />

            <Field
              label="MATCHES PLAYED"
              value={matches}
              onChange={setMatches}
              type="number"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

/* =========================================================
   OFFICIAL
   ========================================================= */

function OfficialPage({
  tournaments,
  setTournaments,
  log,
}: {
  tournaments: Tournament[];
  setTournaments: React.Dispatch<React.SetStateAction<Tournament[]>>;
  log: (action: string, description: string) => void;
}) {
  const official = tournaments.filter(
    (item) => item.type === "OFFICIAL"
  );

  function changeStatus(
    id: string,
    status: TournamentStatus
  ) {
    setTournaments((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );

    const item = tournaments.find((x) => x.id === id);

    if (item) {
      log(
        "Official status changed",
        `${item.name} changed to ${status}.`
      );
    }
  }

  return (
    <div className="tg-page">
      <PageHeading
        eyebrow="OFFICIAL CIRCUIT"
        title="OFFICIAL CONTROL"
        description="Control which official events appear as live, upcoming or archived."
      />

      <div className="tg-control-grid">
        {official.map((item) => (
          <div className="tg-control-card" key={item.id}>
            <div className="tg-control-card-top">
              <Badge
                type={
                  item.status === "LIVE"
                    ? "live"
                    : item.status === "UPCOMING"
                    ? "blue"
                    : "default"
                }
              >
                {item.status}
              </Badge>

              <span>{item.stage}</span>
            </div>

            <h3>{item.name}</h3>

            <div className="tg-control-stats">
              <div>
                <strong>{item.matches}</strong>
                <span>MATCHES</span>
              </div>

              <div>
                <strong>{item.teams}</strong>
                <span>TEAMS</span>
              </div>
            </div>

            <div className="tg-status-buttons">
              {(
                ["LIVE", "UPCOMING", "COMPLETED", "ARCHIVED"] as const
              ).map((status) => (
                <button
                  key={status}
                  className={
                    item.status === status ? "selected" : ""
                  }
                  onClick={() => changeStatus(item.id, status)}
                  type="button"
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   SCRIMS
   ========================================================= */

function ScrimsPage({
  tournaments,
  setTournaments,
  log,
}: {
  tournaments: Tournament[];
  setTournaments: React.Dispatch<React.SetStateAction<Tournament[]>>;
  log: (action: string, description: string) => void;
}) {
  const scrims = tournaments.filter(
    (item) => item.type === "SCRIM"
  );

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [stage, setStage] = useState("SCRIM");
  const [teams, setTeams] = useState("18");
  const [matches, setMatches] = useState("6");

  function createScrim() {
    if (!name.trim()) return;

    const item: Tournament = {
      id: makeId("scrim"),
      name,
      type: "SCRIM",
      status: "UPCOMING",
      stage,
      matches: Number(matches) || 0,
      teams: Number(teams) || 0,
      startDate: "",
      endDate: "",
      description: "Scrim competition.",
    };

    setTournaments((current) => [item, ...current]);

    log("Scrim created", `${name} was created.`);

    setShowModal(false);
    setName("");
    setStage("SCRIM");
    setTeams("18");
    setMatches("6");
  }

  function remove(id: string) {
    const item = tournaments.find((x) => x.id === id);

    if (!item) return;

    if (!window.confirm(`Delete ${item.name}?`)) return;

    setTournaments((current) =>
      current.filter((x) => x.id !== id)
    );

    log("Scrim deleted", `${item.name} was deleted.`);
  }

  return (
    <div className="tg-page">
      <PageHeading
        eyebrow="COMMUNITY COMPETITION"
        title="SCRIMS"
        description="Create and control private or community scrim events."
        button={
          <button
            className="tg-primary-button"
            onClick={() => setShowModal(true)}
          >
            <Plus size={18} />
            NEW SCRIM
          </button>
        }
      />

      <div className="tg-control-grid">
        {scrims.map((item) => (
          <div className="tg-control-card" key={item.id}>
            <div className="tg-control-card-top">
              <Badge type="blue">SCRIM</Badge>
              <span>{item.status}</span>
            </div>

            <h3>{item.name}</h3>

            <p>{item.description}</p>

            <div className="tg-control-stats">
              <div>
                <strong>{item.matches}</strong>
                <span>MATCHES</span>
              </div>

              <div>
                <strong>{item.teams}</strong>
                <span>TEAMS</span>
              </div>
            </div>

            <button
              className="tg-danger-button tg-full-button"
              onClick={() => remove(item.id)}
            >
              <Trash2 size={16} />
              DELETE SCRIM
            </button>
          </div>
        ))}

        {scrims.length === 0 && (
          <EmptyState
            title="No scrims"
            description="Create a scrim event from the button above."
          />
        )}
      </div>

      {showModal && (
        <Modal
          title="CREATE SCRIM"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button
                className="tg-secondary-button"
                onClick={() => setShowModal(false)}
              >
                CANCEL
              </button>

              <button
                className="tg-primary-button"
                onClick={createScrim}
              >
                <Plus size={17} />
                CREATE
              </button>
            </>
          }
        >
          <div className="tg-form-grid">
            <Field
              label="SCRIM NAME"
              value={name}
              onChange={setName}
              placeholder="TG COMMUNITY SCRIM"
            />

            <Field
              label="STAGE"
              value={stage}
              onChange={setStage}
              placeholder="SCRIM"
            />

            <Field
              label="TEAMS"
              value={teams}
              onChange={setTeams}
              type="number"
            />

            <Field
              label="MATCHES"
              value={matches}
              onChange={setMatches}
              type="number"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

/* =========================================================
   WEBSITE CONTENT
   ========================================================= */

function ContentPage({
  content,
  setContent,
  log,
}: {
  content: SiteContent;
  setContent: React.Dispatch<React.SetStateAction<SiteContent>>;
  log: (action: string, description: string) => void;
}) {
  const [draft, setDraft] = useState(content);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(content);
  }, [content]);

  function save() {
    setContent(draft);
    setSaved(true);

    log("Website content updated", "Public website content was changed.");

    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="tg-page">
      <PageHeading
        eyebrow="PUBLIC WEBSITE"
        title="CONTENT CONTROL"
        description="Change public-facing headings and messages without editing the page."
        button={
          <button className="tg-primary-button" onClick={save}>
            {saved ? <Check size={18} /> : <Save size={18} />}
            {saved ? "SAVED" : "SAVE CHANGES"}
          </button>
        }
      />

      <div className="tg-content-editor">
        <Panel title="HERO SECTION" icon={<Globe size={18} />}>
          <div className="tg-form-grid">
            <Field
              label="HERO TITLE"
              value={draft.heroTitle}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  heroTitle: value,
                }))
              }
            />

            <Field
              label="EYEBROW"
              value={draft.heroSubtitle}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  heroSubtitle: value,
                }))
              }
            />

            <label className="tg-field tg-field-full">
              <span>DESCRIPTION</span>

              <textarea
                value={draft.heroDescription}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    heroDescription: event.target.value,
                  }))
                }
              />
            </label>
          </div>
        </Panel>

        <Panel title="SECTION TITLES" icon={<FileText size={18} />}>
          <div className="tg-form-grid">
            <Field
              label="OFFICIAL SECTION"
              value={draft.officialTitle}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  officialTitle: value,
                }))
              }
            />

            <Field
              label="SCRIM SECTION"
              value={draft.scrimTitle}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  scrimTitle: value,
                }))
              }
            />

            <Field
              label="FOOTER"
              value={draft.footerText}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  footerText: value,
                }))
              }
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* =========================================================
   ADMINS
   ========================================================= */

function AdminsPage({
  admins,
  setAdmins,
  invites,
  setInvites,
  currentAdmin,
  log,
}: {
  admins: AdminUser[];
  setAdmins: React.Dispatch<React.SetStateAction<AdminUser[]>>;
  invites: Invite[];
  setInvites: React.Dispatch<React.SetStateAction<Invite[]>>;
  currentAdmin: AdminUser;
  log: (action: string, description: string) => void;
}) {
  const [showInvite, setShowInvite] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminRole>("admin");

  const [generatedInvite, setGeneratedInvite] =
    useState<string | null>(null);

  function createInvite() {
    if (!inviteEmail.trim()) return;

    const token = crypto.randomUUID
      ? crypto.randomUUID()
      : makeId("token");

    const invite: Invite = {
      id: makeId("invite"),
      token,
      email: inviteEmail.trim(),
      role: inviteRole,
      createdAt: now(),
      expiresAt: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString(),
      used: false,
    };

    setInvites((current) => [invite, ...current]);

    const link = `${window.location.origin}/admin?invite=${token}`;

    setGeneratedInvite(link);

    log(
      "Admin invite created",
      `Invite generated for ${invite.email}.`
    );
  }

  function toggleAdmin(id: string) {
    setAdmins((current) =>
      current.map((admin) =>
        admin.id === id
          ? { ...admin, active: !admin.active }
          : admin
      )
    );

    const admin = admins.find((x) => x.id === id);

    if (admin) {
      log(
        "Admin status changed",
        `${admin.email} was ${
          admin.active ? "disabled" : "enabled"
        }.`
      );
    }
  }

  function deleteAdmin(id: string) {
    const admin = admins.find((x) => x.id === id);

    if (!admin) return;

    if (admin.role === "owner") {
      window.alert("The owner account cannot be deleted.");
      return;
    }

    if (!window.confirm(`Remove ${admin.email} as admin?`)) return;

    setAdmins((current) =>
      current.filter((x) => x.id !== id)
    );

    log("Admin removed", `${admin.email} was removed.`);
  }

  function copyInvite() {
    if (!generatedInvite) return;

    navigator.clipboard?.writeText(generatedInvite);

    window.alert("Invite link copied.");
  }

  return (
    <div className="tg-page">
      <PageHeading
        eyebrow="ACCESS CONTROL"
        title="ADMINS"
        description="Give trusted people controlled access to the admin panel."
        button={
          currentAdmin.role === "owner" ? (
            <button
              className="tg-primary-button"
              onClick={() => {
                setGeneratedInvite(null);
                setShowInvite(true);
              }}
            >
              <UserPlus size={18} />
              INVITE ADMIN
            </button>
          ) : undefined
        }
      />

      <div className="tg-security-banner">
        <div className="tg-security-icon">
          <ShieldCheck size={22} />
        </div>

        <div>
          <strong>ADMIN ACCESS</strong>
          <p>
            Owner controls who can access the admin panel and what
            each role can manage.
          </p>
        </div>
      </div>

      <Panel title="CURRENT ADMINS" icon={<Shield size={18} />}>
        <div className="tg-admin-list">
          {admins.map((admin) => (
            <div className="tg-admin-row" key={admin.id}>
              <div className="tg-admin-avatar large">
                {admin.name.charAt(0).toUpperCase()}
              </div>

              <div className="tg-admin-info">
                <strong>{admin.name}</strong>
                <span>{admin.email}</span>
                <small>
                  Created {formatDate(admin.createdAt)}
                </small>
              </div>

              <Badge
                type={
                  admin.role === "owner"
                    ? "warning"
                    : admin.role === "admin"
                    ? "live"
                    : "blue"
                }
              >
                {roleLabel(admin.role)}
              </Badge>

              <Badge type={admin.active ? "success" : "default"}>
                {admin.active ? "ACTIVE" : "DISABLED"}
              </Badge>

              {admin.role !== "owner" && currentAdmin.role === "owner" && (
                <div className="tg-row-actions">
                  <IconButton
                    title={admin.active ? "Disable" : "Enable"}
                    onClick={() => toggleAdmin(admin.id)}
                  >
                    {admin.active ? (
                      <Lock size={16} />
                    ) : (
                      <ShieldCheck size={16} />
                    )}
                  </IconButton>

                  <IconButton
                    title="Remove admin"
                    onClick={() => deleteAdmin(admin.id)}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </div>
              )}
            </div>
          ))}

          {admins.length === 0 && (
            <EmptyState
              title="No admins"
              description="The first owner account will appear here."
            />
          )}
        </div>
      </Panel>

      <Panel title="ACTIVE INVITES" icon={<Link2 size={18} />}>
        <div className="tg-invite-list">
          {invites
            .filter((invite) => !invite.used)
            .map((invite) => (
              <div className="tg-invite-row" key={invite.id}>
                <div className="tg-invite-icon">
                  <KeyRound size={19} />
                </div>

                <div>
                  <strong>{invite.email}</strong>
                  <span>
                    {roleLabel(invite.role)} · Expires{" "}
                    {formatDate(invite.expiresAt)}
                  </span>
                </div>

                <button
                  className="tg-secondary-button"
                  onClick={() => {
                    const link = `${window.location.origin}/admin?invite=${invite.token}`;
                    navigator.clipboard?.writeText(link);
                    window.alert("Invite link copied.");
                  }}
                >
                  <Copy size={16} />
                  COPY LINK
                </button>
              </div>
            ))}

          {invites.filter((x) => !x.used).length === 0 && (
            <EmptyState
              title="No active invites"
              description="Create an invite when you want to give someone admin access."
            />
          )}
        </div>
      </Panel>

      {showInvite && (
        <Modal
          title="INVITE NEW ADMIN"
          onClose={() => setShowInvite(false)}
          footer={
            <>
              <button
                className="tg-secondary-button"
                onClick={() => setShowInvite(false)}
              >
                CLOSE
              </button>

              {!generatedInvite && (
                <button
                  className="tg-primary-button"
                  onClick={createInvite}
                >
                  <Link2 size={17} />
                  GENERATE LINK
                </button>
              )}
            </>
          }
        >
          {!generatedInvite ? (
            <div className="tg-form-grid">
              <Field
                label="EMAIL"
                value={inviteEmail}
                onChange={setInviteEmail}
                placeholder="newadmin@example.com"
                type="email"
              />

              <SelectField
                label="ROLE"
                value={inviteRole}
                onChange={(value) =>
                  setInviteRole(value as AdminRole)
                }
              >
                <option value="admin">ADMIN</option>
                <option value="editor">EDITOR</option>
                <option value="scorekeeper">SCOREKEEPER</option>
              </SelectField>
            </div>
          ) : (
            <div className="tg-generated-invite">
              <div className="tg-generated-icon">
                <Link2 size={28} />
              </div>

              <h3>INVITE READY</h3>

              <p>
                Send this link to the person. They can open it and
                complete their admin account setup.
              </p>

              <div className="tg-link-box">
                <input value={generatedInvite} readOnly />

                <button
                  className="tg-primary-button"
                  onClick={copyInvite}
                >
                  <Copy size={16} />
                  COPY
                </button>
              </div>

              <div className="tg-invite-warning">
                <Lock size={15} />
                This demo stores invite state locally. Production
                authentication should validate the token server-side.
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

/* =========================================================
   ACTIVITY
   ========================================================= */

function ActivityPage({
  activities,
}: {
  activities: ActivityItem[];
}) {
  const [search, setSearch] = useState("");

  const filtered = activities.filter((item) =>
    `${item.action} ${item.description} ${item.admin}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="tg-page">
      <PageHeading
        eyebrow="SECURITY & AUDIT"
        title="ACTIVITY LOG"
        description="Review important actions performed inside the admin panel."
      />

      <div className="tg-toolbar">
        <div className="tg-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search activity..."
          />
        </div>
      </div>

      <Panel title="AUDIT TRAIL" icon={<Activity size={18} />}>
        <div className="tg-audit-list">
          {filtered.map((item) => (
            <div className="tg-audit-row" key={item.id}>
              <div className="tg-audit-marker">
                <Activity size={17} />
              </div>

              <div className="tg-audit-content">
                <strong>{item.action}</strong>
                <p>{item.description}</p>
                <span>
                  {item.admin} ·{" "}
                  {new Date(item.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <EmptyState
              title="No activity found"
              description="There are no matching audit records."
            />
          )}
        </div>
      </Panel>
    </div>
  );
}

/* =========================================================
   SETTINGS
   ========================================================= */

function SettingsPage({
  settings,
  setSettings,
  log,
}: {
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  log: (action: string, description: string) => void;
}) {
  function toggle(key: keyof SiteSettings) {
    const next = !settings[key];

    setSettings((current) => ({
      ...current,
      [key]: next,
    }));

    log(
      "Setting changed",
      `${String(key)} was ${next ? "enabled" : "disabled"}.`
    );
  }

  return (
    <div className="tg-page">
      <PageHeading
        eyebrow="SYSTEM CONTROL"
        title="SETTINGS"
        description="Control how the public Total Gaming Hub behaves."
      />

      <div className="tg-settings-grid">
        <Panel title="PUBLIC WEBSITE" icon={<Globe size={18} />}>
          <SettingRow
            label="Maintenance mode"
            description="Temporarily show a maintenance state to public visitors."
            value={settings.maintenance}
            onChange={() => toggle("maintenance")}
          />

          <SettingRow
            label="Public results"
            description="Allow visitors to see match results."
            value={settings.publicResults}
            onChange={() => toggle("publicResults")}
          />

          <SettingRow
            label="Public standings"
            description="Allow visitors to see tournament standings."
            value={settings.publicStandings}
            onChange={() => toggle("publicStandings")}
          />

          <SettingRow
            label="Live competition feed"
            description="Show live tournament updates."
            value={settings.liveFeed}
            onChange={() => toggle("liveFeed")}
          />
        </Panel>

        <Panel title="ACCESS" icon={<Lock size={18} />}>
          <SettingRow
            label="Registration"
            description="Allow public users to register for available events."
            value={settings.allowRegistration}
            onChange={() => toggle("allowRegistration")}
          />

          <SettingRow
            label="First admin setup"
            description="Only keep this enabled while the first owner is being created."
            value={settings.showAdminSetup}
            onChange={() => toggle("showAdminSetup")}
          />
        </Panel>
      </div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: () => void;
}) {
  return (
    <div className="tg-setting-row">
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>

      <button
        className={`tg-switch ${value ? "on" : ""}`}
        onClick={onChange}
        type="button"
        aria-label={label}
      >
        <span />
      </button>
    </div>
  );
}

/* =========================================================
   GENERIC NOT IMPLEMENTED PAGE
   ========================================================= */

function PlaceholderPage({
  title,
  eyebrow,
  description,
}: {
  title: string;
  eyebrow: string;
  description: string;
}) {
  return (
    <div className="tg-page">
      <PageHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
      />

      <div className="tg-placeholder">
        <div className="tg-placeholder-icon">
          <BarChart3 size={32} />
        </div>

        <h3>CONTROL MODULE</h3>

        <p>
          This module is connected to the admin navigation and ready
          for your project data layer.
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   ADMIN APP
   ========================================================= */

export default function Admin() {
  const [initialized, setInitialized] = useState<boolean>(() =>
    readStorage(STORAGE.initialized, false)
  );

  const [sessionId, setSessionId] = useState<string | null>(() =>
    readStorage<string | null>(STORAGE.session, null)
  );

  const [admins, setAdmins] = useState<AdminUser[]>(() =>
    readStorage(STORAGE.admins, DEFAULT_ADMINS)
  );

  const [invites, setInvites] = useState<Invite[]>(() =>
    readStorage(STORAGE.invites, [])
  );

  const [tournaments, setTournaments] = useState<Tournament[]>(
    () => readStorage(STORAGE.tournaments, DEFAULT_TOURNAMENTS)
  );

  const [matches, setMatches] = useState<Match[]>(() =>
    readStorage(STORAGE.matches, DEFAULT_MATCHES)
  );

  const [teams, setTeams] = useState<Team[]>(() =>
    readStorage(STORAGE.teams, DEFAULT_TEAMS)
  );

  const [players, setPlayers] = useState<Player[]>(() =>
    readStorage(STORAGE.players, DEFAULT_PLAYERS)
  );

  const [content, setContent] = useState<SiteContent>(() =>
    readStorage(STORAGE.content, DEFAULT_CONTENT)
  );

  const [settings, setSettings] = useState<SiteSettings>(() =>
    readStorage(STORAGE.settings, DEFAULT_SETTINGS)
  );

  const [activities, setActivities] = useState<ActivityItem[]>(
    () => readStorage(STORAGE.activity, [])
  );

  const [section, setSection] = useState<Section>("dashboard");
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  /* =======================================================
     PERSIST EVERYTHING
     ======================================================= */

  useEffect(() => {
    writeStorage(STORAGE.initialized, initialized);
  }, [initialized]);

  useEffect(() => {
    writeStorage(STORAGE.admins, admins);
  }, [admins]);

  useEffect(() => {
    writeStorage(STORAGE.invites, invites);
  }, [invites]);

  useEffect(() => {
    writeStorage(STORAGE.tournaments, tournaments);
  }, [tournaments]);

  useEffect(() => {
    writeStorage(STORAGE.matches, matches);
  }, [matches]);

  useEffect(() => {
    writeStorage(STORAGE.teams, teams);
  }, [teams]);

  useEffect(() => {
    writeStorage(STORAGE.players, players);
  }, [players]);

  useEffect(() => {
    writeStorage(STORAGE.content, content);
  }, [content]);

  useEffect(() => {
    writeStorage(STORAGE.settings, settings);
  }, [settings]);

  useEffect(() => {
    writeStorage(STORAGE.activity, activities);
  }, [activities]);

  /* =======================================================
     CURRENT ADMIN
     ======================================================= */

  const currentAdmin = useMemo(() => {
    if (!sessionId) return null;

    return admins.find((admin) => admin.id === sessionId) || null;
  }, [admins, sessionId]);

  /* =======================================================
     ACTIVITY LOGGER
     ======================================================= */

  function log(action: string, description: string) {
    const adminName = currentAdmin?.name || "System";

    const activity: ActivityItem = {
      id: makeId("activity"),
      action,
      description,
      admin: adminName,
      createdAt: now(),
    };

    setActivities((current) => [activity, ...current].slice(0, 200));
  }

  /* =======================================================
     INITIAL OWNER CREATION
     ======================================================= */

  function createOwner(
    name: string,
    email: string,
    password: string
  ) {
    /*
      Demo password storage.

      IMPORTANT:
      For production, replace this with real authentication.
      Never store plaintext passwords in production.
    */

    const owner: AdminUser & { password?: string } = {
      id: makeId("admin"),
      name,
      email,
      role: "owner",
      active: true,
      createdAt: now(),
      lastLogin: now(),
      password,
    };

    const nextAdmins = [owner];

    setAdmins(nextAdmins);

    writeStorage(STORAGE.admins, nextAdmins);

    setInitialized(true);

    setSessionId(owner.id);

    writeStorage(STORAGE.session, owner.id);

    const activity: ActivityItem = {
      id: makeId("activity"),
      action: "Owner created",
      description: `${email} became the first admin owner.`,
      admin: name,
      createdAt: now(),
    };

    setActivities([activity]);
  }

  /* =======================================================
     LOGIN
     ======================================================= */

  function login(email: string, password: string) {
    const storedAdmins = readStorage<
      (AdminUser & { password?: string })[]
    >(STORAGE.admins, []);

    const admin = storedAdmins.find(
      (item) =>
        item.email.toLowerCase() === email.toLowerCase() &&
        item.password === password &&
        item.active
    );

    if (!admin) {
      window.alert("Invalid email, password or disabled account.");
      return;
    }

    const updated = storedAdmins.map((item) =>
      item.id === admin.id
        ? { ...item, lastLogin: now() }
        : item
    );

    setAdmins(updated);
    setSessionId(admin.id);

    writeStorage(STORAGE.session, admin.id);

    setSection("dashboard");

    const activity: ActivityItem = {
      id: makeId("activity"),
      action: "Admin login",
      description: `${admin.email} signed into the admin panel.`,
      admin: admin.name,
      createdAt: now(),
    };

    setActivities((current) => [activity, ...current]);
  }

  /* =======================================================
     LOGOUT
     ======================================================= */

  function logout() {
    if (currentAdmin) {
      log(
        "Admin logout",
        `${currentAdmin.email} signed out.`
      );
    }

    localStorage.removeItem(STORAGE.session);
    setSessionId(null);
  }

  /* =======================================================
     REFRESH
     ======================================================= */

  function refresh() {
    setRefreshKey((value) => value + 1);
  }

  /* =======================================================
     AUTH FLOW
     ======================================================= */

  if (!initialized || admins.length === 0) {
    return (
      <>
        <AdminStyles />

        <SetupScreen onComplete={createOwner} />
      </>
    );
  }

  if (!currentAdmin) {
    return (
      <>
        <AdminStyles />

        <LoginScreen onLogin={login} />
      </>
    );
  }

  /* =======================================================
     PAGE
     ======================================================= */

  function renderPage() {
    switch (section) {
      case "dashboard":
        return (
          <Dashboard
            tournaments={tournaments}
            matches={matches}
            teams={teams}
            players={players}
            admins={admins}
            activities={activities}
            onNavigate={setSection}
          />
        );

      case "tournaments":
        return (
          <TournamentsPage
            tournaments={tournaments}
            setTournaments={setTournaments}
            log={log}
          />
        );

      case "matches":
        return (
          <MatchesPage
            matches={matches}
            setMatches={setMatches}
            tournaments={tournaments}
            log={log}
          />
        );

      case "teams":
        return (
          <TeamsPage
            teams={teams}
            setTeams={setTeams}
            log={log}
          />
        );

      case "players":
        return (
          <PlayersPage
            players={players}
            setPlayers={setPlayers}
            teams={teams}
            log={log}
          />
        );

      case "official":
        return (
          <OfficialPage
            tournaments={tournaments}
            setTournaments={setTournaments}
            log={log}
          />
        );

      case "scrims":
        return (
          <ScrimsPage
            tournaments={tournaments}
            setTournaments={setTournaments}
            log={log}
          />
        );

      case "content":
        return (
          <ContentPage
            content={content}
            setContent={setContent}
            log={log}
          />
        );

      case "admins":
        return (
          <AdminsPage
            admins={admins}
            setAdmins={setAdmins}
            invites={invites}
            setInvites={setInvites}
            currentAdmin={currentAdmin}
            log={log}
          />
        );

      case "activity":
        return <ActivityPage activities={activities} />;

      case "settings":
        return (
          <SettingsPage
            settings={settings}
            setSettings={setSettings}
            log={log}
          />
        );

      default:
        return null;
    }
  }

  return (
    <>
      <AdminStyles />

      <div className="tg-admin-app" key={refreshKey}>
        <Sidebar
          section={section}
          setSection={setSection}
          currentAdmin={currentAdmin}
          mobileOpen={mobileSidebar}
          onClose={() => setMobileSidebar(false)}
          onLogout={logout}
        />

        <main className="tg-main">
          <Topbar
            title={
              section === "dashboard"
                ? "COMMAND CENTER"
                : section.replace("-", " ").toUpperCase()
            }
            subtitle="TOTAL GAMING HUB / ADMIN"
            onMenu={() => setMobileSidebar(true)}
            onRefresh={refresh}
          />

          <div className="tg-content">{renderPage()}</div>
        </main>
      </div>
    </>
  );
}

/* =========================================================
   ADMIN STYLES
   ========================================================= */

function AdminStyles() {
  return (
    <style>{`
      * {
        box-sizing: border-box;
      }

      :root {
        font-family:
          Inter,
          ui-sans-serif,
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;

        color-scheme: dark;
      }

      html,
      body,
      #root {
        margin: 0;
        min-height: 100%;
        width: 100%;
      }

      body {
        background: #07070c;
        color: #f6f4fa;
      }

      button,
      input,
      textarea,
      select {
        font: inherit;
      }

      button {
        cursor: pointer;
      }

      .tg-admin-app {
        min-height: 100vh;
        background:
          radial-gradient(
            circle at 80% 0%,
            rgba(126, 44, 255, 0.13),
            transparent 30%
          ),
          radial-gradient(
            circle at 10% 100%,
            rgba(0, 188, 255, 0.06),
            transparent 28%
          ),
          #07070c;
      }

      .tg-admin-app::before {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        opacity: 0.22;
        background-image:
          linear-gradient(
            rgba(255,255,255,0.025) 1px,
            transparent 1px
          ),
          linear-gradient(
            90deg,
            rgba(255,255,255,0.025) 1px,
            transparent 1px
          );
        background-size: 42px 42px;
      }

      /* SIDEBAR */

      .tg-sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        width: 258px;
        z-index: 50;
        display: flex;
        flex-direction: column;
        background: rgba(10, 9, 16, 0.97);
        border-right: 1px solid rgba(255,255,255,0.08);
        backdrop-filter: blur(20px);
      }

      .tg-sidebar-brand {
        min-height: 84px;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0 20px;
        border-bottom: 1px solid rgba(255,255,255,0.07);
      }

      .tg-mini-logo,
      .tg-auth-logo {
        display: grid;
        place-items: center;
        flex: 0 0 auto;
        border: 1px solid rgba(180, 93, 255, 0.55);
        background:
          linear-gradient(
            145deg,
            rgba(140, 38, 255, 0.32),
            rgba(255, 193, 52, 0.09)
          );
        box-shadow:
          0 0 28px rgba(141, 43, 255, 0.18);
      }

      .tg-mini-logo {
        width: 44px;
        height: 44px;
        border-radius: 12px;
      }

      .tg-sidebar-brand strong,
      .tg-auth-brand strong {
        display: block;
        font-size: 13px;
        letter-spacing: 1.5px;
      }

      .tg-sidebar-brand span,
      .tg-auth-brand span {
        display: block;
        margin-top: 4px;
        color: #777583;
        font-size: 9px;
        letter-spacing: 2.3px;
      }

      .tg-sidebar-section-label {
        padding: 25px 20px 10px;
        color: #5f5d69;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 2.4px;
      }

      .tg-sidebar-nav {
        display: flex;
        flex-direction: column;
        gap: 3px;
        padding: 0 11px;
        overflow-y: auto;
      }

      .tg-nav-item {
        width: 100%;
        position: relative;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 12px;
        color: #85828e;
        border: 1px solid transparent;
        background: transparent;
        border-radius: 10px;
        text-align: left;
        transition: 0.18s ease;
      }

      .tg-nav-item:hover {
        color: #fff;
        background: rgba(255,255,255,0.035);
      }

      .tg-nav-item.active {
        color: #fff;
        border-color: rgba(166, 72, 255, 0.26);
        background:
          linear-gradient(
            90deg,
            rgba(130, 31, 255, 0.17),
            rgba(255,255,255,0.025)
          );
      }

      .tg-nav-item.active::before {
        content: "";
        position: absolute;
        left: -11px;
        top: 7px;
        bottom: 7px;
        width: 3px;
        border-radius: 0 3px 3px 0;
        background: linear-gradient(
          #bd70ff,
          #ffca38
        );
      }

      .tg-nav-item svg {
        flex: 0 0 auto;
      }

      .tg-nav-arrow {
        margin-left: auto;
      }

      .tg-sidebar-bottom {
        margin-top: auto;
        padding: 14px;
        border-top: 1px solid rgba(255,255,255,0.07);
      }

      .tg-admin-mini {
        display: flex;
        gap: 10px;
        align-items: center;
        padding: 9px;
        border-radius: 10px;
        background: rgba(255,255,255,0.025);
      }

      .tg-admin-avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background:
          linear-gradient(
            145deg,
            #8e31ff,
            #302038
          );
        color: #fff;
        font-weight: 800;
      }

      .tg-admin-avatar.large {
        width: 44px;
        height: 44px;
      }

      .tg-admin-mini-info {
        min-width: 0;
      }

      .tg-admin-mini-info strong,
      .tg-admin-mini-info span {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .tg-admin-mini-info strong {
        font-size: 12px;
      }

      .tg-admin-mini-info span {
        margin-top: 3px;
        color: #8d8997;
        font-size: 9px;
        letter-spacing: 1.4px;
      }

      .tg-logout-button {
        width: 100%;
        margin-top: 9px;
        padding: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        color: #8d8997;
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 9px;
        background: transparent;
      }

      .tg-logout-button:hover {
        color: #fff;
        border-color: rgba(255,255,255,0.15);
      }

      .tg-mobile-close,
      .tg-mobile-menu {
        display: none;
      }

      /* MAIN */

      .tg-main {
        min-height: 100vh;
        margin-left: 258px;
      }

      .tg-topbar {
        height: 84px;
        position: sticky;
        top: 0;
        z-index: 30;
        display: flex;
        align-items: center;
        gap: 18px;
        padding: 0 30px;
        background: rgba(7,7,12,0.84);
        border-bottom: 1px solid rgba(255,255,255,0.07);
        backdrop-filter: blur(20px);
      }

      .tg-topbar-title {
        min-width: 0;
      }

      .tg-topbar-title span {
        color: #5f5d69;
        font-size: 9px;
        letter-spacing: 2px;
      }

      .tg-topbar-title h1 {
        margin: 4px 0 0;
        font-size: 21px;
        letter-spacing: 0.8px;
      }

      .tg-topbar-actions {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 9px;
      }

      .tg-live-indicator {
        display: flex;
        align-items: center;
        gap: 7px;
        margin-right: 5px;
        padding: 7px 10px;
        border: 1px solid rgba(35,220,157,0.18);
        border-radius: 6px;
        color: #44dfa7;
        background: rgba(35,220,157,0.045);
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 1.5px;
      }

      .tg-live-indicator span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #35dfa2;
        box-shadow: 0 0 10px #35dfa2;
      }

      .tg-icon-button {
        width: 37px;
        height: 37px;
        display: grid;
        place-items: center;
        color: #8b8794;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 9px;
        background: rgba(255,255,255,0.025);
      }

      .tg-icon-button:hover {
        color: #fff;
        border-color: rgba(173,76,255,0.4);
      }

      .tg-content {
        position: relative;
        z-index: 1;
        max-width: 1500px;
        margin: 0 auto;
        padding: 34px 30px 70px;
      }

      /* PAGE */

      .tg-page {
        animation: tgFadeIn 0.22s ease;
      }

      @keyframes tgFadeIn {
        from {
          opacity: 0;
          transform: translateY(4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .tg-page-heading,
      .tg-page-intro {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 20px;
        margin-bottom: 28px;
      }

      .tg-eyebrow {
        margin-bottom: 8px;
        color: #ae63ff;
        font-size: 9px;
        font-weight: 900;
        letter-spacing: 2.5px;
      }

      .tg-page-heading h2,
      .tg-page-intro h2 {
        margin: 0;
        font-size: clamp(27px, 4vw, 43px);
        line-height: 1;
        letter-spacing: -1px;
      }

      .tg-page-heading p,
      .tg-page-intro p {
        max-width: 700px;
        margin: 10px 0 0;
        color: #797582;
        font-size: 13px;
        line-height: 1.6;
      }

      /* BUTTONS */

      .tg-primary-button,
      .tg-secondary-button,
      .tg-danger-button {
        min-height: 39px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 15px;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 1.1px;
        transition: 0.18s ease;
      }

      .tg-primary-button {
        color: #fff;
        border: 1px solid rgba(192,111,255,0.7);
        background:
          linear-gradient(
            110deg,
            #7f25ed,
            #b84cff
          );
        box-shadow:
          0 8px 28px rgba(129,35,239,0.22);
      }

      .tg-primary-button:hover {
        transform: translateY(-1px);
        box-shadow:
          0 11px 35px rgba(129,35,239,0.32);
      }

      .tg-secondary-button {
        color: #aaa5b2;
        border: 1px solid rgba(255,255,255,0.11);
        background: rgba(255,255,255,0.035);
      }

      .tg-secondary-button:hover {
        color: #fff;
        border-color: rgba(180,90,255,0.4);
      }

      .tg-danger-button {
        color: #ff707b;
        border: 1px solid rgba(255,90,104,0.2);
        background: rgba(255,70,90,0.055);
      }

      .tg-danger-button:hover {
        color: #fff;
        background: rgba(255,70,90,0.13);
      }

      .tg-full-button {
        width: 100%;
      }

      .tg-text-button {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        color: #a866ff;
        border: 0;
        background: transparent;
        font-size: 9px;
        font-weight: 900;
        letter-spacing: 1.3px;
      }

      /* BADGES */

      .tg-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: fit-content;
        padding: 6px 9px;
        border-radius: 5px;
        border: 1px solid rgba(255,255,255,0.09);
        background: rgba(255,255,255,0.035);
        color: #aaa6b1;
        font-size: 8px;
        font-weight: 900;
        letter-spacing: 1.2px;
      }

      .tg-badge-live {
        color: #39dfa4;
        border-color: rgba(39,220,157,0.22);
        background: rgba(39,220,157,0.065);
      }

      .tg-badge-warning {
        color: #f7c94d;
        border-color: rgba(247,201,77,0.25);
        background: rgba(247,201,77,0.06);
      }

      .tg-badge-success {
        color: #69dca7;
        border-color: rgba(105,220,167,0.2);
        background: rgba(105,220,167,0.05);
      }

      .tg-badge-danger {
        color: #ff737d;
        border-color: rgba(255,115,125,0.2);
        background: rgba(255,115,125,0.05);
      }

      .tg-badge-blue {
        color: #46bfff;
        border-color: rgba(70,191,255,0.2);
        background: rgba(70,191,255,0.05);
      }

      /* STATS */

      .tg-stat-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 11px;
        margin-bottom: 14px;
      }

      .tg-stat-card {
        position: relative;
        min-height: 145px;
        padding: 20px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.08);
        background:
          linear-gradient(
            145deg,
            rgba(255,255,255,0.045),
            rgba(255,255,255,0.012)
          );
      }

      .tg-stat-card::after {
        content: "";
        position: absolute;
        right: -30px;
        bottom: -50px;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: rgba(157,67,255,0.12);
        filter: blur(25px);
      }

      .tg-stat-accent {
        border-color: rgba(176,83,255,0.28);
      }

      .tg-stat-icon {
        color: #89848f;
        margin-bottom: 17px;
      }

      .tg-stat-accent .tg-stat-icon {
        color: #ba70ff;
      }

      .tg-stat-label {
        color: #65616c;
        font-size: 8px;
        font-weight: 900;
        letter-spacing: 1.8px;
      }

      .tg-stat-value {
        margin-top: 5px;
        font-size: 32px;
        font-weight: 900;
      }

      /* PANELS */

      .tg-panel {
        margin-bottom: 14px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(13,13,20,0.76);
      }

      .tg-panel-header {
        min-height: 58px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        padding: 0 19px;
        border-bottom: 1px solid rgba(255,255,255,0.065);
      }

      .tg-panel-title {
        display: flex;
        align-items: center;
        gap: 9px;
        color: #f0edf4;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 1.5px;
      }

      .tg-panel-title svg {
        color: #ae62ff;
      }

      .tg-panel-body {
        padding: 18px;
      }

      .tg-dashboard-columns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }

      /* LISTS */

      .tg-list-row {
        min-height: 64px;
        display: flex;
        align-items: center;
        gap: 12px;
        border-bottom: 1px solid rgba(255,255,255,0.055);
      }

      .tg-list-row:last-child {
        border-bottom: 0;
      }

      .tg-list-icon {
        width: 37px;
        height: 37px;
        display: grid;
        place-items: center;
        border-radius: 8px;
      }

      .tg-list-icon.purple {
        color: #bc70ff;
        background: rgba(160,60,255,0.09);
      }

      .tg-list-content {
        min-width: 0;
        flex: 1;
      }

      .tg-list-content strong,
      .tg-list-content span {
        display: block;
      }

      .tg-list-content strong {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
      }

      .tg-list-content span {
        margin-top: 5px;
        color: #65616d;
        font-size: 9px;
        letter-spacing: 0.5px;
      }

      .tg-activity-row {
        min-height: 66px;
        display: flex;
        gap: 11px;
        padding: 9px 0;
        border-bottom: 1px solid rgba(255,255,255,0.055);
      }

      .tg-activity-row:last-child {
        border-bottom: 0;
      }

      .tg-activity-dot {
        width: 7px;
        height: 7px;
        margin-top: 6px;
        flex: 0 0 auto;
        border-radius: 50%;
        background: #a64fff;
        box-shadow: 0 0 11px rgba(166,79,255,0.7);
      }

      .tg-activity-row strong,
      .tg-activity-row span,
      .tg-activity-row small {
        display: block;
      }

      .tg-activity-row strong {
        font-size: 11px;
      }

      .tg-activity-row span {
        margin-top: 4px;
        color: #76727d;
        font-size: 10px;
      }

      .tg-activity-row small {
        margin-top: 5px;
        color: #4f4c56;
        font-size: 8px;
      }

      /* QUICK */

      .tg-quick-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 9px;
      }

      .tg-quick-action {
        min-height: 68px;
        display: flex;
        align-items: center;
        gap: 11px;
        padding: 0 15px;
        color: #8d8995;
        border: 1px solid rgba(255,255,255,0.07);
        background: rgba(255,255,255,0.018);
        text-align: left;
      }

      .tg-quick-action:hover {
        color: #fff;
        border-color: rgba(171,76,255,0.34);
      }

      .tg-quick-action span {
        flex: 1;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.5px;
      }

      /* TOOLBAR */

      .tg-toolbar {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 14px;
      }

      .tg-search {
        flex: 1;
        max-width: 470px;
        height: 42px;
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 0 13px;
        color: #66626d;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.025);
      }

      .tg-search input {
        width: 100%;
        outline: 0;
        color: #fff;
        border: 0;
        background: transparent;
        font-size: 11px;
      }

      .tg-search input::placeholder {
        color: #55525d;
      }

      .tg-toolbar-count {
        color: #68646f;
        font-size: 9px;
        font-weight: 900;
        letter-spacing: 1.3px;
      }

      /* TABLE */

      .tg-table-wrap {
        overflow-x: auto;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(13,13,20,0.76);
      }

      .tg-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 850px;
      }

      .tg-table th {
        padding: 13px 15px;
        color: #5d5964;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        background: rgba(255,255,255,0.018);
        font-size: 8px;
        text-align: left;
        letter-spacing: 1.5px;
      }

      .tg-table td {
        padding: 14px 15px;
        color: #aaa6b1;
        border-bottom: 1px solid rgba(255,255,255,0.055);
        font-size: 10px;
        vertical-align: middle;
      }

      .tg-table tbody tr:hover {
        background: rgba(157,65,255,0.025);
      }

      .tg-table-main strong,
      .tg-table-main span {
        display: block;
      }

      .tg-table-main strong {
        color: #f3f0f5;
        font-size: 11px;
      }

      .tg-table-main span {
        max-width: 300px;
        margin-top: 5px;
        color: #57535f;
        font-size: 9px;
      }

      .tg-table small {
        color: #5f5b66;
      }

      .tg-number-highlight {
        color: #31baff !important;
        font-weight: 900;
      }

      .tg-row-actions {
        display: flex;
        justify-content: flex-end;
        gap: 5px;
      }

      /* FORM */

      .tg-form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
      }

      .tg-field {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .tg-field-full {
        grid-column: 1 / -1;
      }

      .tg-field > span {
        color: #66626d;
        font-size: 8px;
        font-weight: 900;
        letter-spacing: 1.4px;
      }

      .tg-field input,
      .tg-field select,
      .tg-field textarea {
        width: 100%;
        outline: none;
        color: #eeeaf2;
        border: 1px solid rgba(255,255,255,0.09);
        border-radius: 7px;
        background: #111018;
        padding: 11px 12px;
        font-size: 11px;
      }

      .tg-field input:focus,
      .tg-field select:focus,
      .tg-field textarea:focus {
        border-color: rgba(172,78,255,0.55);
      }

      .tg-field textarea {
        min-height: 100px;
        resize: vertical;
      }

      .tg-form-error {
        margin: 10px 0;
        padding: 10px;
        color: #ff7c85;
        border: 1px solid rgba(255,90,100,0.18);
        background: rgba(255,80,90,0.05);
        font-size: 10px;
      }

      /* MATCH */

      .tg-match-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 13px;
      }

      .tg-match-card {
        position: relative;
        padding: 19px;
        border: 1px solid rgba(255,255,255,0.08);
        background:
          linear-gradient(
            145deg,
            rgba(255,255,255,0.035),
            rgba(255,255,255,0.01)
          );
      }

      .tg-match-card:hover {
        border-color: rgba(170,76,255,0.3);
      }

      .tg-match-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .tg-match-top > span {
        color: #5c5864;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 1px;
      }

      .tg-match-card h3 {
        margin: 22px 0 5px;
        font-size: 25px;
      }

      .tg-match-card > p {
        margin: 0;
        color: #67636e;
        font-size: 10px;
      }

      .tg-match-info {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        margin-top: 20px;
        border-top: 1px solid rgba(255,255,255,0.06);
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }

      .tg-match-info div {
        padding: 12px 7px;
        border-right: 1px solid rgba(255,255,255,0.06);
      }

      .tg-match-info div:last-child {
        border-right: 0;
      }

      .tg-match-info span,
      .tg-match-info strong {
        display: block;
      }

      .tg-match-info span {
        color: #55515c;
        font-size: 7px;
        letter-spacing: 1.2px;
      }

      .tg-match-info strong {
        margin-top: 5px;
        font-size: 10px;
      }

      .tg-match-score {
        padding: 17px 0;
      }

      .tg-match-score span {
        display: block;
        color: #5b5762;
        font-size: 8px;
        letter-spacing: 1.3px;
      }

      .tg-match-score strong {
        display: block;
        margin-top: 2px;
        color: #28baff;
        font-size: 30px;
      }

      .tg-card-actions {
        display: flex;
        gap: 7px;
      }

      /* TEAMS */

      .tg-team-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 13px;
      }

      .tg-team-card {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 14px;
        padding: 18px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(13,13,20,0.76);
      }

      .tg-team-logo {
        width: 66px;
        height: 66px;
        display: grid;
        place-items: center;
        overflow: hidden;
        border: 1px solid rgba(180,85,255,0.25);
        background: #111018;
      }

      .tg-team-logo img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .tg-team-main h3 {
        margin: 9px 0 2px;
        font-size: 16px;
      }

      .tg-team-main > span {
        color: #625e69;
        font-size: 9px;
        letter-spacing: 1.3px;
      }

      .tg-team-meta {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        padding-top: 13px;
        border-top: 1px solid rgba(255,255,255,0.06);
      }

      .tg-team-meta small,
      .tg-team-meta strong {
        display: block;
      }

      .tg-team-meta small {
        color: #57535e;
        font-size: 7px;
        letter-spacing: 1.2px;
      }

      .tg-team-meta strong {
        margin-top: 4px;
        font-size: 10px;
      }

      .tg-team-card .tg-card-actions {
        grid-column: 1 / -1;
      }

      /* PLAYER */

      .tg-player-cell {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .tg-player-avatar {
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        color: #d7b4ff;
        border: 1px solid rgba(177,80,255,0.25);
        background: rgba(153,57,255,0.09);
        font-weight: 900;
      }

      /* CONTROL */

      .tg-control-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 13px;
      }

      .tg-control-card {
        padding: 20px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(13,13,20,0.76);
      }

      .tg-control-card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .tg-control-card-top > span {
        color: #5d5964;
        font-size: 8px;
        font-weight: 900;
        letter-spacing: 1.4px;
      }

      .tg-control-card h3 {
        margin: 22px 0 5px;
        font-size: 20px;
      }

      .tg-control-card p {
        color: #6d6974;
        font-size: 10px;
        line-height: 1.5;
      }

      .tg-control-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        margin: 18px 0;
        border-top: 1px solid rgba(255,255,255,0.06);
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }

      .tg-control-stats div {
        padding: 14px 4px;
        border-right: 1px solid rgba(255,255,255,0.06);
      }

      .tg-control-stats div:last-child {
        border: 0;
      }

      .tg-control-stats strong,
      .tg-control-stats span {
        display: block;
      }

      .tg-control-stats strong {
        font-size: 25px;
      }

      .tg-control-stats span {
        margin-top: 3px;
        color: #57535e;
        font-size: 7px;
        letter-spacing: 1.2px;
      }

      .tg-status-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 5px;
      }

      .tg-status-buttons button {
        padding: 9px 4px;
        color: #696570;
        border: 1px solid rgba(255,255,255,0.07);
        background: rgba(255,255,255,0.018);
        font-size: 7px;
        font-weight: 900;
        letter-spacing: 0.7px;
      }

      .tg-status-buttons button.selected {
        color: #fff;
        border-color: rgba(171,77,255,0.4);
        background: rgba(151,55,255,0.13);
      }

      /* CONTENT */

      .tg-content-editor {
        max-width: 950px;
      }

      /* ADMIN */

      .tg-security-banner {
        display: flex;
        gap: 14px;
        align-items: center;
        margin-bottom: 14px;
        padding: 17px;
        border: 1px solid rgba(168,75,255,0.18);
        background: rgba(145,46,255,0.045);
      }

      .tg-security-icon {
        width: 42px;
        height: 42px;
        display: grid;
        place-items: center;
        color: #ba6cff;
        border: 1px solid rgba(180,84,255,0.25);
        background: rgba(180,84,255,0.08);
      }

      .tg-security-banner strong {
        font-size: 10px;
        letter-spacing: 1.4px;
      }

      .tg-security-banner p {
        margin: 4px 0 0;
        color: #6e6a75;
        font-size: 10px;
      }

      .tg-admin-list,
      .tg-invite-list {
        display: flex;
        flex-direction: column;
      }

      .tg-admin-row,
      .tg-invite-row {
        min-height: 72px;
        display: flex;
        align-items: center;
        gap: 13px;
        padding: 10px 0;
        border-bottom: 1px solid rgba(255,255,255,0.055);
      }

      .tg-admin-row:last-child,
      .tg-invite-row:last-child {
        border-bottom: 0;
      }

      .tg-admin-info {
        flex: 1;
        min-width: 0;
      }

      .tg-admin-info strong,
      .tg-admin-info span,
      .tg-admin-info small {
        display: block;
      }

      .tg-admin-info strong {
        font-size: 11px;
      }

      .tg-admin-info span {
        margin-top: 3px;
        color: #77727e;
        font-size: 10px;
      }

      .tg-admin-info small {
        margin-top: 3px;
        color: #4f4b56;
        font-size: 8px;
      }

      .tg-invite-icon {
        width: 38px;
        height: 38px;
        display: grid;
        place-items: center;
        color: #a85aff;
        border: 1px solid rgba(168,90,255,0.2);
        background: rgba(168,90,255,0.07);
      }

      .tg-invite-row > div:nth-child(2) {
        flex: 1;
      }

      .tg-invite-row strong,
      .tg-invite-row span {
        display: block;
      }

      .tg-invite-row strong {
        font-size: 11px;
      }

      .tg-invite-row span {
        margin-top: 4px;
        color: #67636d;
        font-size: 9px;
      }

      .tg-generated-invite {
        text-align: center;
      }

      .tg-generated-icon {
        width: 58px;
        height: 58px;
        margin: 0 auto 13px;
        display: grid;
        place-items: center;
        color: #c071ff;
        border: 1px solid rgba(190,105,255,0.3);
        background: rgba(190,105,255,0.08);
      }

      .tg-generated-invite h3 {
        margin: 0;
        font-size: 19px;
      }

      .tg-generated-invite p {
        max-width: 500px;
        margin: 8px auto 17px;
        color: #706b77;
        font-size: 10px;
        line-height: 1.6;
      }

      .tg-link-box {
        display: flex;
        gap: 7px;
      }

      .tg-link-box input {
        flex: 1;
        min-width: 0;
        color: #a9a3b0;
        border: 1px solid rgba(255,255,255,0.08);
        background: #0d0c12;
        padding: 0 10px;
        font-size: 10px;
      }

      .tg-invite-warning {
        margin-top: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        color: #6e6974;
        font-size: 8px;
      }

      /* SETTINGS */

      .tg-settings-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }

      .tg-setting-row {
        min-height: 76px;
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 10px 0;
        border-bottom: 1px solid rgba(255,255,255,0.055);
      }

      .tg-setting-row:last-child {
        border-bottom: 0;
      }

      .tg-setting-row > div {
        flex: 1;
      }

      .tg-setting-row strong {
        font-size: 11px;
      }

      .tg-setting-row p {
        margin: 4px 0 0;
        color: #65616c;
        font-size: 9px;
        line-height: 1.5;
      }

      .tg-switch {
        width: 43px;
        height: 24px;
        padding: 2px;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 99px;
        background: #17151d;
      }

      .tg-switch span {
        display: block;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #67626d;
        transition: 0.18s ease;
      }

      .tg-switch.on {
        border-color: rgba(174,78,255,0.45);
        background: rgba(142,42,255,0.22);
      }

      .tg-switch.on span {
        transform: translateX(18px);
        background: #bd6cff;
        box-shadow: 0 0 12px rgba(189,108,255,0.55);
      }

      /* AUDIT */

      .tg-audit-list {
        display: flex;
        flex-direction: column;
      }

      .tg-audit-row {
        display: flex;
        gap: 14px;
        padding: 14px 0;
        border-bottom: 1px solid rgba(255,255,255,0.055);
      }

      .tg-audit-row:last-child {
        border-bottom: 0;
      }

      .tg-audit-marker {
        width: 37px;
        height: 37px;
        display: grid;
        place-items: center;
        flex: 0 0 auto;
        color: #a85aff;
        border: 1px solid rgba(168,90,255,0.2);
        background: rgba(168,90,255,0.07);
      }

      .tg-audit-content strong {
        font-size: 11px;
      }

      .tg-audit-content p {
        margin: 4px 0;
        color: #76717c;
        font-size: 10px;
      }

      .tg-audit-content span {
        color: #4e4a55;
        font-size: 8px;
      }

      /* EMPTY */

      .tg-empty {
        min-height: 220px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 25px;
        color: #55515c;
        text-align: center;
      }

      .tg-empty h3 {
        margin: 12px 0 4px;
        color: #aaa5b0;
        font-size: 12px;
        letter-spacing: 1px;
      }

      .tg-empty p {
        max-width: 390px;
        margin: 0 0 14px;
        color: #5d5964;
        font-size: 9px;
        line-height: 1.5;
      }

      /* PLACEHOLDER */

      .tg-placeholder {
        min-height: 380px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(13,13,20,0.7);
      }

      .tg-placeholder-icon {
        width: 66px;
        height: 66px;
        display: grid;
        place-items: center;
        color: #b065ff;
        border: 1px solid rgba(176,101,255,0.24);
        background: rgba(176,101,255,0.07);
      }

      .tg-placeholder h3 {
        margin: 18px 0 6px;
        font-size: 15px;
        letter-spacing: 1.3px;
      }

      .tg-placeholder p {
        max-width: 480px;
        color: #68636e;
        font-size: 10px;
        line-height: 1.6;
      }

      /* MODAL */

      .tg-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 100;
        display: grid;
        place-items: center;
        padding: 20px;
        background: rgba(0,0,0,0.7);
        backdrop-filter: blur(8px);
      }

      .tg-modal {
        width: min(720px, 100%);
        max-height: 90vh;
        overflow-y: auto;
        border: 1px solid rgba(184,89,255,0.24);
        background: #0e0d14;
        box-shadow: 0 30px 100px rgba(0,0,0,0.55);
      }

      .tg-modal-header {
        min-height: 62px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 19px;
        border-bottom: 1px solid rgba(255,255,255,0.07);
      }

      .tg-modal-header h2 {
        margin: 0;
        font-size: 15px;
        letter-spacing: 1px;
      }

      .tg-modal-body {
        padding: 20px;
      }

      .tg-modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 13px 19px;
        border-top: 1px solid rgba(255,255,255,0.07);
      }

      /* AUTH */

      .tg-auth-page {
        min-height: 100vh;
        display: grid;
        place-items: center;
        position: relative;
        overflow: hidden;
        padding: 25px;
        background:
          radial-gradient(
            circle at 50% 20%,
            rgba(142,43,255,0.16),
            transparent 35%
          ),
          #07070c;
      }

      .tg-auth-grid {
        position: absolute;
        inset: 0;
        opacity: 0.24;
        background-image:
          linear-gradient(
            rgba(255,255,255,0.025) 1px,
            transparent 1px
          ),
          linear-gradient(
            90deg,
            rgba(255,255,255,0.025) 1px,
            transparent 1px
          );
        background-size: 42px 42px;
      }

      .tg-auth-card {
        position: relative;
        width: min(470px, 100%);
        padding: 28px;
        border: 1px solid rgba(177,82,255,0.25);
        background: rgba(13,12,19,0.92);
        box-shadow:
          0 35px 100px rgba(0,0,0,0.5),
          0 0 70px rgba(128,38,235,0.08);
      }

      .tg-auth-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 35px;
      }

      .tg-auth-logo {
        width: 51px;
        height: 51px;
        border-radius: 13px;
      }

      .tg-auth-heading {
        margin-bottom: 22px;
      }

      .tg-auth-heading h1 {
        margin: 15px 0 8px;
        font-size: 31px;
        letter-spacing: -0.8px;
      }

      .tg-auth-heading p {
        margin: 0;
        color: #6c6873;
        font-size: 10px;
        line-height: 1.6;
      }

      .tg-auth-card form {
        display: flex;
        flex-direction: column;
        gap: 13px;
      }

      .tg-auth-card .tg-primary-button {
        margin-top: 6px;
        min-height: 45px;
      }

      .tg-auth-note {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        margin-top: 20px;
        color: #504c57;
        font-size: 8px;
        letter-spacing: 0.5px;
      }

      /* MOBILE */

      @media (max-width: 1200px) {
        .tg-stat-grid {
          grid-template-columns: repeat(3, 1fr);
        }

        .tg-team-grid,
        .tg-control-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .tg-match-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 850px) {
        .tg-sidebar {
          transform: translateX(-100%);
          transition: transform 0.2s ease;
          box-shadow: 20px 0 50px rgba(0,0,0,0.35);
        }

        .tg-sidebar.open {
          transform: translateX(0);
        }

        .tg-sidebar-overlay {
          position: fixed;
          inset: 0;
          z-index: 45;
          background: rgba(0,0,0,0.65);
        }

        .tg-mobile-close {
          display: grid;
          place-items: center;
          margin-left: auto;
          color: #77737e;
          border: 0;
          background: transparent;
        }

        .tg-main {
          margin-left: 0;
        }

        .tg-mobile-menu {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          color: #aaa6b1;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.025);
        }

        .tg-topbar {
          padding: 0 15px;
        }

        .tg-content {
          padding: 24px 15px 50px;
        }

        .tg-live-indicator {
          display: none;
        }

        .tg-dashboard-columns,
        .tg-settings-grid {
          grid-template-columns: 1fr;
        }

        .tg-quick-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 620px) {
        .tg-page-heading,
        .tg-page-intro {
          align-items: flex-start;
          flex-direction: column;
        }

        .tg-page-heading > .tg-primary-button,
        .tg-page-intro > .tg-secondary-button {
          width: 100%;
        }

        .tg-stat-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .tg-team-grid,
        .tg-control-grid,
        .tg-match-grid {
          grid-template-columns: 1fr;
        }

        .tg-form-grid {
          grid-template-columns: 1fr;
        }

        .tg-field-full {
          grid-column: auto;
        }

        .tg-admin-row {
          flex-wrap: wrap;
        }

        .tg-admin-row .tg-admin-info {
          min-width: calc(100% - 60px);
        }

        .tg-invite-row {
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .tg-invite-row .tg-secondary-button {
          width: 100%;
        }

        .tg-link-box {
          flex-direction: column;
        }

        .tg-link-box input {
          min-height: 42px;
        }

        .tg-quick-grid {
          grid-template-columns: 1fr;
        }

        .tg-topbar-title h1 {
          font-size: 16px;
        }

        .tg-auth-card {
          padding: 21px;
        }
      }
    `}</style>
  );
}
export const Route = createFileRoute("/admin")({
  component: Admin,
});
