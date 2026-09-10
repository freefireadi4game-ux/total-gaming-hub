import React, { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Crown,
  Database,
  Edit3,
  Eye,
  FileText,
  Gamepad2,
  Home,
  KeyRound,
  LayoutDashboard,
  Link2,
  LogIn,
  LogOut,
  Menu,
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

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: AdminRoute,
});

/* =========================================================
   TYPES
========================================================= */

type Role = "owner" | "admin" | "editor" | "scorekeeper";
type CompetitionType = "OFFICIAL" | "SCRIM";
type TournamentStatus =
  | "LIVE"
  | "UPCOMING"
  | "COMPLETED"
  | "ARCHIVED";

type Section =
  | "dashboard"
  | "tournaments"
  | "stages"
  | "matches"
  | "teams"
  | "players"
  | "admins"
  | "activity"
  | "settings";

type Tournament = {
  id: string;
  name: string;
  type: CompetitionType;
  status: TournamentStatus;
  stage: string;
  teams: number;
  matches: number;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  is_current: boolean;
};

type Stage = {
  id: string;
  tournament_id: string;
  name: string;
  display_order: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
};

type Team = {
  id: string;
  name: string;
  short_name?: string | null;
  logo_url?: string | null;
};

type Player = {
  id: string;
  name: string;
  team_id?: string | null;
  avatar_url?: string | null;
  role?: string | null;
};

type Match = {
  id: string;
  tournament_id: string;
  stage_id: string | null;
  match_number: number;
  map: string;
  status: string;
  date?: string | null;
  time?: string | null;
};

type TeamResult = {
  id?: string;
  match_id: string;
  team_id: string;
  team_name?: string | null;
  position: number;
  kills: number;
  points: number;
};

type PlayerStat = {
  id?: string;
  match_id: string;
  player_id: string;
  team_id?: string | null;
  kills: number;
  points?: number;
};

type StageTeam = {
  stage_id: string;
  team_id: string;
  final_rank: number | null;
};

type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  active: boolean;
};

type ActivityItem = {
  id: string;
  action: string;
  description: string;
  admin: string;
  created_at: string;
};

/* =========================================================
   HELPERS
========================================================= */

const LOGO = "/iqoo-tg-logo.png";

const PLACEMENT_POINTS: Record<number, number> = {
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

function placementPoints(position: number) {
  return PLACEMENT_POINTS[position] ?? 0;
}

function id() {
  return crypto.randomUUID();
}

function dateText(value?: string | null) {
  if (!value) return "-";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function points(position: number, kills: number) {
  return placementPoints(position) + kills;
}

function roleLabel(role: Role) {
  return role.toUpperCase();
}

/* =========================================================
   GENERIC UI
========================================================= */

function Badge({
  children,
  kind = "default",
}: {
  children: React.ReactNode;
  kind?: "default" | "live" | "success" | "warning" | "danger" | "blue";
}) {
  return (
    <span className={`tg-badge tg-badge-${kind}`}>
      {children}
    </span>
  );
}

function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`tg-btn tg-btn-${variant}`}
    >
      {children}
    </button>
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
      type="button"
      title={title}
      onClick={onClick}
      className="tg-icon-btn"
    >
      {children}
    </button>
  );
}

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
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="tg-modal-head">
          <div>
            <small>ADMIN CONTROL</small>
            <h2>{title}</h2>
          </div>

          <IconButton title="Close" onClick={onClose}>
            <X size={19} />
          </IconButton>
        </div>

        <div className="tg-modal-body">{children}</div>

        {footer && (
          <div className="tg-modal-foot">{footer}</div>
        )}
      </div>
    </div>
  );
}

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
        onChange={(e) => onChange(e.target.value)}
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
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </label>
  );
}

function Empty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="tg-empty">
      <Database size={34} />
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

/* =========================================================
   LOGIN
========================================================= */

function Login({
  onSuccess,
}: {
  onSuccess: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password required.");
      return;
    }

    setBusy(true);

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    setBusy(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (!data.user) {
      setError("Login failed.");
      return;
    }

    onSuccess(data.user.email ?? email);
  }

  return (
    <div className="tg-login-page">
      <div className="tg-login-glow tg-glow-one" />
      <div className="tg-login-glow tg-glow-two" />

      <div className="tg-login-card">
        <div className="tg-login-brand">
          <img src={LOGO} alt="Total Gaming" />

          <div>
            <strong>TOTAL GAMING</strong>
            <span>HUB ADMIN</span>
          </div>
        </div>

        <div className="tg-login-title">
          <small>SECURE CONTROL PANEL</small>
          <h1>ADMIN LOGIN</h1>
          <p>
            Manage tournaments, stages, matches, teams,
            players and live results.
          </p>
        </div>

        <div className="tg-login-form">
          <Field
            label="ADMIN EMAIL"
            value={email}
            onChange={setEmail}
            placeholder="admin@example.com"
          />

          <Field
            label="PASSWORD"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
          />

          {error && (
            <div className="tg-error">
              {error}
            </div>
          )}

          <Button onClick={submit} disabled={busy}>
            <LogIn size={17} />
            {busy ? "AUTHENTICATING..." : "ENTER ADMIN"}
          </Button>
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
  role,
  mobile,
  close,
}: {
  section: Section;
  setSection: (section: Section) => void;
  role: Role;
  mobile: boolean;
  close: () => void;
}) {
  const items: {
    id: Section;
    label: string;
    icon: React.ReactNode;
    roles: Role[];
  }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      roles: ["owner", "admin", "editor", "scorekeeper"],
    },
    {
      id: "tournaments",
      label: "Tournaments",
      icon: <Trophy size={18} />,
      roles: ["owner", "admin"],
    },
    {
      id: "stages",
      label: "Stages / Phases",
      icon: <BarChart3 size={18} />,
      roles: ["owner", "admin", "scorekeeper"],
    },
    {
      id: "matches",
      label: "Matches & Scores",
      icon: <Gamepad2 size={18} />,
      roles: ["owner", "admin", "scorekeeper"],
    },
    {
      id: "teams",
      label: "Teams",
      icon: <Users size={18} />,
      roles: ["owner", "admin", "scorekeeper"],
    },
    {
      id: "players",
      label: "Players",
      icon: <Shield size={18} />,
      roles: ["owner", "admin", "scorekeeper"],
    },
    {
      id: "admins",
      label: "Admins",
      icon: <UserPlus size={18} />,
      roles: ["owner"],
    },
    {
      id: "activity",
      label: "Activity",
      icon: <Activity size={18} />,
      roles: ["owner", "admin", "editor", "scorekeeper"],
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={18} />,
      roles: ["owner", "admin"],
    },
  ];

  const visible = items.filter((item) =>
    item.roles.includes(role),
  );

  return (
    <aside className={`tg-sidebar ${mobile ? "tg-sidebar-open" : ""}`}>
      <div className="tg-sidebar-brand">
        <img src={LOGO} alt="" />

        <div>
          <strong>TOTAL GAMING</strong>
          <span>HUB CONTROL</span>
        </div>

        {mobile && (
          <IconButton title="Close" onClick={close}>
            <X size={18} />
          </IconButton>
        )}
      </div>

      <div className="tg-sidebar-label">
        CONTROL
      </div>

      <nav className="tg-sidebar-nav">
        {visible.map((item) => (
          <button
            type="button"
            key={item.id}
            className={
              section === item.id
                ? "tg-nav-active"
                : ""
            }
            onClick={() => {
              setSection(item.id);
              close();
            }}
          >
            {item.icon}
            <span>{item.label}</span>
            {section === item.id && (
              <ChevronRight size={15} />
            )}
          </button>
        ))}
      </nav>

      <div className="tg-sidebar-bottom">
        <div className="tg-security">
          <ShieldCheck size={17} />
          <div>
            <strong>SECURE MODE</strong>
            <span>{roleLabel(role)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* =========================================================
   HEADER
========================================================= */

function Header({
  onMenu,
  email,
  onLogout,
  onRefresh,
  refreshing,
}: {
  onMenu: () => void;
  email: string;
  onLogout: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <header className="tg-header">
      <button
        type="button"
        className="tg-mobile-menu"
        onClick={onMenu}
      >
        <Menu size={20} />
      </button>

      <div className="tg-header-title">
        <span>CONTROL CENTER</span>
        <strong>ADMIN PANEL</strong>
      </div>

      <div className="tg-header-actions">
        <button
          type="button"
          className="tg-refresh"
          onClick={onRefresh}
        >
          <RefreshCw
            size={17}
            className={
              refreshing ? "tg-spin" : ""
            }
          />
          <span>SYNC</span>
        </button>

        <div className="tg-admin-user">
          <div className="tg-admin-avatar">
            {email.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{email}</strong>
            <span>ADMIN</span>
          </div>
        </div>

        <IconButton title="Logout" onClick={onLogout}>
          <LogOut size={17} />
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
  stages,
  matches,
  teams,
  players,
  onNavigate,
}: {
  tournaments: Tournament[];
  stages: Stage[];
  matches: Match[];
  teams: Team[];
  players: Player[];
  onNavigate: (section: Section) => void;
}) {
  const live = tournaments.filter(
    (x) => x.status === "LIVE",
  ).length;

  const official = tournaments.filter(
    (x) => x.type === "OFFICIAL",
  ).length;

  const scrims = tournaments.filter(
    (x) => x.type === "SCRIM",
  ).length;

  return (
    <div className="tg-page">
      <div className="tg-page-heading">
        <div>
          <small>MASTER CONTROL</small>
          <h1>COMMAND CENTER</h1>
          <p>
            Complete Total Gaming Hub competition
            management from one place.
          </p>
        </div>
      </div>

      <div className="tg-stat-grid">
        <Stat
          label="TOURNAMENTS"
          value={tournaments.length}
          icon={<Trophy size={20} />}
        />

        <Stat
          label="LIVE EVENTS"
          value={live}
          icon={<Zap size={20} />}
          live
        />

        <Stat
          label="STAGES"
          value={stages.length}
          icon={<BarChart3 size={20} />}
        />

        <Stat
          label="MATCHES"
          value={matches.length}
          icon={<Gamepad2 size={20} />}
        />

        <Stat
          label="TEAMS"
          value={teams.length}
          icon={<Users size={20} />}
        />

        <Stat
          label="PLAYERS"
          value={players.length}
          icon={<Shield size={20} />}
        />
      </div>

      <div className="tg-two-column">
        <Panel
          title="CURRENT EVENTS"
          icon={<Trophy size={17} />}
        >
          {tournaments
            .filter((x) => x.is_current || x.status === "LIVE")
            .slice(0, 5)
            .map((t) => (
              <button
                key={t.id}
                className="tg-event-row"
                onClick={() =>
                  onNavigate("tournaments")
                }
              >
                <div className="tg-event-logo">
                  <img src={LOGO} alt="" />
                </div>

                <div>
                  <strong>{t.name}</strong>
                  <span>
                    {t.type} · {t.stage || "MAIN EVENT"}
                  </span>
                </div>

                <Badge
                  kind={
                    t.status === "LIVE"
                      ? "live"
                      : "default"
                  }
                >
                  {t.status}
                </Badge>
              </button>
            ))}

          {tournaments.filter(
            (x) =>
              x.is_current ||
              x.status === "LIVE",
          ).length === 0 && (
            <Empty
              title="No current tournament"
              description="Set a tournament as current from tournament control."
            />
          )}
        </Panel>

        <Panel
          title="COMPETITION SPLIT"
          icon={<BarChart3 size={17} />}
        >
          <div className="tg-split-card">
            <div>
              <span>OFFICIAL</span>
              <strong>{official}</strong>
            </div>

            <div>
              <span>SCRIMS</span>
              <strong>{scrims}</strong>
            </div>
          </div>

          <div className="tg-dashboard-actions">
            <button
              onClick={() =>
                onNavigate("tournaments")
              }
            >
              <Trophy size={18} />
              Manage Tournaments
            </button>

            <button
              onClick={() =>
                onNavigate("stages")
              }
            >
              <BarChart3 size={18} />
              Manage Stages
            </button>

            <button
              onClick={() =>
                onNavigate("matches")
              }
            >
              <Gamepad2 size={18} />
              Enter Scores
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  live,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  live?: boolean;
}) {
  return (
    <div className={`tg-stat ${live ? "tg-stat-live" : ""}`}>
      <div className="tg-stat-top">
        <span>{label}</span>
        <div>{icon}</div>
      </div>

      <strong>{value}</strong>

      {live && <small>LIVE NOW</small>}
    </div>
  );
}

/* =========================================================
   TOURNAMENTS
========================================================= */

function Tournaments({
  tournaments,
  setTournaments,
  stages,
  onOpenStages,
  log,
}: {
  tournaments: Tournament[];
  setTournaments: React.Dispatch<
    React.SetStateAction<Tournament[]>
  >;
  stages: Stage[];
  onOpenStages: (t: Tournament) => void;
  log: (a: string, d: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] =
    useState<Tournament | null>(null);

  const [name, setName] = useState("");
  const [type, setType] =
    useState<CompetitionType>("OFFICIAL");
  const [status, setStatus] =
    useState<TournamentStatus>("UPCOMING");
  const [description, setDescription] =
    useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [current, setCurrent] = useState(false);

  const filtered = tournaments.filter((t) =>
    `${t.name} ${t.type} ${t.stage}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  function reset() {
    setName("");
    setType("OFFICIAL");
    setStatus("UPCOMING");
    setDescription("");
    setStart("");
    setEnd("");
    setCurrent(false);
    setEditing(null);
  }

  function openCreate() {
    reset();
    setModal(true);
  }

  function openEdit(t: Tournament) {
    setEditing(t);
    setName(t.name);
    setType(t.type);
    setStatus(t.status);
    setDescription(t.description ?? "");
    setStart(t.start_date ?? "");
    setEnd(t.end_date ?? "");
    setCurrent(t.is_current);
    setModal(true);
  }

  async function save() {
    if (!name.trim()) return;

    if (editing) {
      if (current) {
        await supabase
          .from("tournaments")
          .update({ is_current: false })
          .neq("id", editing.id);
      }

      const { data, error } =
        await supabase
          .from("tournaments")
          .update({
            name: name.trim(),
            type,
            status,
            description,
            start_date: start || null,
            end_date: end || null,
            is_current: current,
          })
          .eq("id", editing.id)
          .select()
          .single();

      if (error) {
        alert(error.message);
        return;
      }

      if (data) {
        setTournaments((old) =>
          old.map((x) =>
            x.id === editing.id ? data : x,
          ),
        );
      }

      log(
        "Tournament updated",
        `${name} was updated.`,
      );
    } else {
      if (current) {
        await supabase
          .from("tournaments")
          .update({ is_current: false })
          .neq("id", "00000000-0000-0000-0000-000000000000");
      }

      const { data, error } =
        await supabase
          .from("tournaments")
          .insert({
            id: id(),
            name: name.trim(),
            type,
            status,
            stage: "",
            teams: 0,
            matches: 0,
            start_date: start || null,
            end_date: end || null,
            description,
            is_current: current,
          })
          .select()
          .single();

      if (error) {
        alert(error.message);
        return;
      }

      if (data) {
        setTournaments((old) => [
          data,
          ...old,
        ]);
      }

      log(
        "Tournament created",
        `${name} was created.`,
      );
    }

    setModal(false);
    reset();
  }

  async function remove(t: Tournament) {
    if (!confirm(`Delete ${t.name}?`)) return;

    const { error } = await supabase
      .from("tournaments")
      .delete()
      .eq("id", t.id);

    if (error) {
      alert(error.message);
      return;
    }

    setTournaments((old) =>
      old.filter((x) => x.id !== t.id),
    );

    log(
      "Tournament deleted",
      `${t.name} was deleted.`,
    );
  }

  async function makeCurrent(t: Tournament) {
    const { error: clearError } =
      await supabase
        .from("tournaments")
        .update({ is_current: false })
        .neq(
          "id",
          "00000000-0000-0000-0000-000000000000",
        );

    if (clearError) {
      alert(clearError.message);
      return;
    }

    const { data, error } =
      await supabase
        .from("tournaments")
        .update({ is_current: true })
        .eq("id", t.id)
        .select()
        .single();

    if (error) {
      alert(error.message);
      return;
    }

    if (data) {
      setTournaments((old) =>
        old.map((x) =>
          x.id === t.id
            ? data
            : { ...x, is_current: false },
        ),
      );
    }
  }

  return (
    <div className="tg-page">
      <Heading
        eyebrow="COMPETITION CONTROL"
        title="TOURNAMENTS"
        description="Create and control every official event and scrim tournament."
        action={
          <Button onClick={openCreate}>
            <Plus size={17} />
            NEW TOURNAMENT
          </Button>
        }
      />

      <div className="tg-toolbar">
        <div className="tg-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search tournaments..."
          />
        </div>

        <span>{filtered.length} EVENTS</span>
      </div>

      <div className="tg-card-grid">
        {filtered.map((t) => {
          const stageCount = stages.filter(
            (s) =>
              s.tournament_id === t.id,
          ).length;

          return (
            <div
              key={t.id}
              className="tg-tournament-card"
            >
              <div className="tg-card-top">
                <Badge
                  kind={
                    t.type === "OFFICIAL"
                      ? "warning"
                      : "blue"
                  }
                >
                  {t.type}
                </Badge>

                <Badge
                  kind={
                    t.status === "LIVE"
                      ? "live"
                      : t.status ===
                          "COMPLETED"
                        ? "success"
                        : "default"
                  }
                >
                  {t.status}
                </Badge>
              </div>

              <div className="tg-card-logo">
                <img src={LOGO} alt="" />
              </div>

              <h3>{t.name}</h3>

              <p>
                {t.description ||
                  "No tournament description."}
              </p>

              <div className="tg-card-stats">
                <span>
                  <b>{stageCount}</b>
                  STAGES
                </span>

                <span>
                  <b>{t.matches}</b>
                  MATCHES
                </span>

                <span>
                  <b>{t.teams}</b>
                  TEAMS
                </span>
              </div>

              <div className="tg-card-actions">
                <Button
                  variant="secondary"
                  onClick={() =>
                    onOpenStages(t)
                  }
                >
                  <ChevronRight size={16} />
                  STAGES
                </Button>

                <IconButton
                  title="Edit"
                  onClick={() =>
                    openEdit(t)
                  }
                >
                  <Edit3 size={16} />
                </IconButton>

                <IconButton
                  title="Delete"
                  onClick={() =>
                    remove(t)
                  }
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>

              <button
                className={`tg-current-toggle ${
                  t.is_current
                    ? "tg-current-active"
                    : ""
                }`}
                onClick={() =>
                  makeCurrent(t)
                }
              >
                <span />
                {t.is_current
                  ? "CURRENT TOURNAMENT"
                  : "MAKE CURRENT"}
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Empty
          title="No tournaments"
          description="Create your first tournament."
        />
      )}

      {modal && (
        <Modal
          title={
            editing
              ? "EDIT TOURNAMENT"
              : "CREATE TOURNAMENT"
          }
          onClose={() => {
            setModal(false);
            reset();
          }}
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setModal(false);
                  reset();
                }}
              >
                CANCEL
              </Button>

              <Button onClick={save}>
                <Save size={16} />
                SAVE TOURNAMENT
              </Button>
            </>
          }
        >
          <div className="tg-form-grid">
            <Field
              label="TOURNAMENT NAME"
              value={name}
              onChange={setName}
              placeholder="FFMIC FALL 2026"
            />

            <SelectField
              label="TYPE"
              value={type}
              onChange={(v) =>
                setType(
                  v as CompetitionType,
                )
              }
            >
              <option value="OFFICIAL">
                OFFICIAL
              </option>
              <option value="SCRIM">
                SCRIM
              </option>
            </SelectField>

            <SelectField
              label="STATUS"
              value={status}
              onChange={(v) =>
                setStatus(
                  v as TournamentStatus,
                )
              }
            >
              <option value="UPCOMING">
                UPCOMING
              </option>
              <option value="LIVE">
                LIVE
              </option>
              <option value="COMPLETED">
                COMPLETED
              </option>
              <option value="ARCHIVED">
                ARCHIVED
              </option>
            </SelectField>

            <Field
              label="START DATE"
              type="date"
              value={start}
              onChange={setStart}
            />

            <Field
              label="END DATE"
              type="date"
              value={end}
              onChange={setEnd}
            />

            <label className="tg-field">
              <span>CURRENT TOURNAMENT</span>

              <button
                type="button"
                className={`tg-switch ${
                  current
                    ? "tg-switch-on"
                    : ""
                }`}
                onClick={() =>
                  setCurrent(!current)
                }
              >
                <span />
                {current
                  ? "VISIBLE AS CURRENT"
                  : "NOT CURRENT"}
              </button>
            </label>

            <label className="tg-field tg-full">
              <span>DESCRIPTION</span>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value,
                  )
                }
                placeholder="Tournament description..."
              />
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* =========================================================
   STAGES
========================================================= */

function Stages({
  tournament,
  stages,
  setStages,
  matches,
  onBack,
  onOpenMatch,
  log,
}: {
  tournament: Tournament;
  stages: Stage[];
  setStages: React.Dispatch<
    React.SetStateAction<Stage[]>
  >;
  matches: Match[];
  onBack: () => void;
  onOpenMatch: (stage: Stage) => void;
  log: (a: string, d: string) => void;
}) {
  const [name, setName] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] =
    useState<Stage | null>(null);

  const tournamentStages = stages
    .filter(
      (s) =>
        s.tournament_id ===
        tournament.id,
    )
    .sort(
      (a, b) =>
        a.display_order -
        b.display_order,
    );

  function openCreate() {
    setEditing(null);
    setName("");
    setModal(true);
  }

  function openEdit(stage: Stage) {
    setEditing(stage);
    setName(stage.name);
    setModal(true);
  }

  async function saveStage() {
    if (!name.trim()) return;

    if (editing) {
      const { data, error } =
        await supabase
          .from("tournament_stages")
          .update({
            name: name.trim(),
          })
          .eq("id", editing.id)
          .select()
          .single();

      if (error) {
        alert(error.message);
        return;
      }

      if (data) {
        setStages((old) =>
          old.map((x) =>
            x.id === editing.id
              ? data
              : x,
          ),
        );
      }

      log(
        "Stage updated",
        `${name} updated in ${tournament.name}.`,
      );
    } else {
      const nextOrder =
        tournamentStages.length + 1;

      const { data, error } =
        await supabase
          .from("tournament_stages")
          .insert({
            id: id(),
            tournament_id:
              tournament.id,
            name: name.trim(),
            display_order:
              nextOrder,
            status: "UPCOMING",
          })
          .select()
          .single();

      if (error) {
        alert(error.message);
        return;
      }

      if (data) {
        setStages((old) => [
          ...old,
          data,
        ]);
      }

      log(
        "Stage created",
        `${name} created in ${tournament.name}.`,
      );
    }

    setModal(false);
    setName("");
    setEditing(null);
  }

  async function deleteStage(stage: Stage) {
    if (
      !confirm(
        `Delete ${stage.name}? All matches inside it will be deleted.`,
      )
    )
      return;

    const { error } =
      await supabase
        .from("tournament_stages")
        .delete()
        .eq("id", stage.id);

    if (error) {
      alert(error.message);
      return;
    }

    setStages((old) =>
      old.filter(
        (x) => x.id !== stage.id,
      ),
    );

    log(
      "Stage deleted",
      `${stage.name} deleted.`,
    );
  }

  return (
    <div className="tg-page">
      <button
        className="tg-back"
        onClick={onBack}
      >
        <ArrowLeft size={17} />
        BACK TO TOURNAMENTS
      </button>

      <Heading
        eyebrow={tournament.type}
        title={tournament.name}
        description="Create phases, weeks or stages inside this tournament."
        action={
          <Button onClick={openCreate}>
            <Plus size={17} />
            NEW STAGE
          </Button>
        }
      />

      <div className="tg-stage-list">
        {tournamentStages.map(
          (stage, index) => {
            const count =
              matches.filter(
                (m) =>
                  m.stage_id ===
                  stage.id,
              ).length;

            return (
              <div
                key={stage.id}
                className="tg-stage-card"
              >
                <div className="tg-stage-number">
                  {String(index + 1).padStart(
                    2,
                    "0",
                  )}
                </div>

                <div className="tg-stage-main">
                  <div>
                    <Badge>
                      {stage.status}
                    </Badge>
                  </div>

                  <h3>{stage.name}</h3>

                  <span>
                    {count} MATCHES
                  </span>
                </div>

                <div className="tg-stage-actions">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      onOpenMatch(stage)
                    }
                  >
                    MANAGE MATCHES
                    <ChevronRight
                      size={16}
                    />
                  </Button>

                  <IconButton
                    title="Edit stage"
                    onClick={() =>
                      openEdit(stage)
                    }
                  >
                    <Edit3 size={16} />
                  </IconButton>

                  <IconButton
                    title="Delete stage"
                    onClick={() =>
                      deleteStage(stage)
                    }
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </div>
              </div>
            );
          },
        )}
      </div>

      {tournamentStages.length === 0 && (
        <Empty
          title="No stages yet"
          description="Create PLAY-INS, LEAGUE STAGE, WEEK 1, FINALS or any custom phase."
        />
      )}

      {modal && (
        <Modal
          title={
            editing
              ? "EDIT STAGE"
              : "CREATE STAGE"
          }
          onClose={() =>
            setModal(false)
          }
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() =>
                  setModal(false)
                }
              >
                CANCEL
              </Button>

              <Button
                onClick={saveStage}
              >
                <Save size={16} />
                SAVE STAGE
              </Button>
            </>
          }
        >
          <Field
            label="STAGE / PHASE NAME"
            value={name}
            onChange={setName}
            placeholder="LEAGUE STAGE - WEEK 1"
          />
        </Modal>
      )}
    </div>
  );
}

/* =========================================================
   MATCHES
========================================================= */

function Matches({
  tournament,
  stage,
  matches,
  setMatches,
  teams,
  players,
  onBack,
  log,
}: {
  tournament: Tournament;
  stage: Stage;
  matches: Match[];
  setMatches: React.Dispatch<
    React.SetStateAction<Match[]>
  >;
  teams: Team[];
  players: Player[];
  onBack: () => void;
  log: (a: string, d: string) => void;
}) {
  const stageMatches = matches
    .filter(
      (m) => m.stage_id === stage.id,
    )
    .sort(
      (a, b) =>
        a.match_number -
        b.match_number,
    );

  const [showCreate, setShowCreate] =
    useState(false);

  const [matchNumber, setMatchNumber] =
    useState(
      String(
        stageMatches.length + 1,
      ),
    );

  const [map, setMap] =
    useState("Bermuda");

  const [selectedMatch, setSelectedMatch] =
    useState<Match | null>(null);

  async function createMatch() {
    const number =
      Number(matchNumber) || 1;

    const { data, error } =
      await supabase
        .from("matches")
        .insert({
          id: id(),
          tournament_id:
            tournament.id,
          stage_id: stage.id,
          match_number: number,
          map,
          status: "UPCOMING",
        })
        .select()
        .single();

    if (error) {
      alert(error.message);
      return;
    }

    if (data) {
      setMatches((old) => [
        ...old,
        data,
      ]);
    }

    setShowCreate(false);

    log(
      "Match created",
      `Match ${number} created in ${stage.name}.`,
    );
  }

  async function deleteMatch(
    match: Match,
  ) {
    if (
      !confirm(
        `Delete Match #${match.match_number}?`,
      )
    )
      return;

    const { error } =
      await supabase
        .from("matches")
        .delete()
        .eq("id", match.id);

    if (error) {
      alert(error.message);
      return;
    }

    setMatches((old) =>
      old.filter(
        (x) => x.id !== match.id,
      ),
    );

    log(
      "Match deleted",
      `Match ${match.match_number} deleted.`,
    );
  }

  if (selectedMatch) {
    return (
      <ScoreEditor
        tournament={tournament}
        stage={stage}
        match={selectedMatch}
        teams={teams}
        players={players}
        onBack={() =>
          setSelectedMatch(null)
        }
        log={log}
      />
    );
  }

  return (
    <div className="tg-page">
      <button
        className="tg-back"
        onClick={onBack}
      >
        <ArrowLeft size={17} />
        BACK TO STAGES
      </button>

      <Heading
        eyebrow={`${tournament.name} · ${stage.name}`}
        title="MATCH CONTROL"
        description="Create matches and enter team positions, kills and individual player kills."
        action={
          <Button
            onClick={() =>
              setShowCreate(true)
            }
          >
            <Plus size={17} />
            ADD MATCH
          </Button>
        }
      />

      <div className="tg-match-list">
        {stageMatches.map(
          (match) => (
            <div
              className="tg-match-card"
              key={match.id}
            >
              <div className="tg-match-number">
                #{match.match_number}
              </div>

              <div className="tg-match-info">
                <small>MATCH</small>
                <h3>
                  {match.map}
                </h3>
                <span>
                  {match.status}
                </span>
              </div>

              <div className="tg-match-actions">
                <Button
                  onClick={() =>
                    setSelectedMatch(
                      match,
                    )
                  }
                >
                  <Edit3 size={16} />
                  ENTER RESULT
                </Button>

                <IconButton
                  title="Delete"
                  onClick={() =>
                    deleteMatch(
                      match,
                    )
                  }
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </div>
          ),
        )}
      </div>

      {stageMatches.length === 0 && (
        <Empty
          title="No matches"
          description="Add the first match for this stage."
        />
      )}

      {showCreate && (
        <Modal
          title="ADD MATCH"
          onClose={() =>
            setShowCreate(false)
          }
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() =>
                  setShowCreate(false)
                }
              >
                CANCEL
              </Button>

              <Button
                onClick={createMatch}
              >
                <Plus size={16} />
                CREATE MATCH
              </Button>
            </>
          }
        >
          <div className="tg-form-grid">
            <Field
              label="MATCH NUMBER"
              type="number"
              value={matchNumber}
              onChange={
                setMatchNumber
              }
            />

            <SelectField
              label="MAP"
              value={map}
              onChange={setMap}
            >
              <option>
                Bermuda
              </option>
              <option>
                Purgatory
              </option>
              <option>
                Alpine
              </option>
              <option>
                Kalahari
              </option>
              <option>
                NexTerra
              </option>
              <option>
                Solara
              </option>
            </SelectField>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* =========================================================
   SCORE EDITOR
========================================================= */

function ScoreEditor({
  tournament,
  stage,
  match,
  teams,
  players,
  onBack,
  log,
}: {
  tournament: Tournament;
  stage: Stage;
  match: Match;
  teams: Team[];
  players: Player[];
  onBack: () => void;
  log: (a: string, d: string) => void;
}) {
  const [results, setResults] =
    useState<
      Record<
        string,
        {
          position: number;
          kills: number;
        }
      >
    >({});

  const [kills, setKills] =
    useState<Record<string, number>>(
      {},
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    loadResults();
  }, [match.id]);

  async function loadResults() {
    setLoading(true);

    const [
      teamRes,
      playerRes,
    ] = await Promise.all([
      supabase
        .from("match_results")
        .select("*")
        .eq("match_id", match.id),

      supabase
        .from("player_match_stats")
        .select("*")
        .eq("match_id", match.id),
    ]);

    const teamMap: Record<
      string,
      {
        position: number;
        kills: number;
      }
    > = {};

    for (const row of
      (teamRes.data ?? []) as TeamResult[]) {
      teamMap[row.team_id] = {
        position:
          row.position ?? 0,
        kills:
          row.kills ?? 0,
      };
    }

    const playerMap: Record<
      string,
      number
    > = {};

    for (const row of
      (playerRes.data ?? []) as PlayerStat[]) {
      playerMap[row.player_id] =
        row.kills ?? 0;
    }

    setResults(teamMap);
    setKills(playerMap);
    setLoading(false);
  }

  const sortedTeams = useMemo(
    () =>
      [...teams].sort(
        (a, b) =>
          (results[a.id]?.position ||
            999) -
          (results[b.id]?.position ||
            999),
      ),
    [teams, results],
  );

  async function save() {
    setSaving(true);

    const teamRows =
      Object.entries(results)
        .filter(
          ([, value]) =>
            value.position > 0 ||
            value.kills > 0,
        )
        .map(
          ([teamId, value]) => ({
            match_id: match.id,
            team_id: teamId,
            team_name:
              teams.find(
                (t) =>
                  t.id === teamId,
              )?.name ?? "",
            position:
              Number(
                value.position,
              ) || 0,
            kills:
              Number(
                value.kills,
              ) || 0,
            points: points(
              Number(
                value.position,
              ) || 0,
              Number(
                value.kills,
              ) || 0,
            ),
          }),
        );

    const playerRows =
      Object.entries(kills)
        .filter(
          ([, value]) =>
            Number(value) > 0,
        )
        .map(
          ([playerId, value]) => {
            const player =
              players.find(
                (p) =>
                  p.id ===
                  playerId,
              );

            return {
              match_id: match.id,
              player_id: playerId,
              team_id:
                player?.team_id ??
                null,
              kills:
                Number(value) || 0,
              points:
                Number(value) || 0,
            };
          },
        );

    if (teamRows.length) {
      const { error } =
        await supabase
          .from("match_results")
          .upsert(
            teamRows,
            {
              onConflict:
                "match_id,team_id",
            },
          );

      if (error) {
        setSaving(false);
        alert(error.message);
        return;
      }
    }

    if (playerRows.length) {
      const { error } =
        await supabase
          .from(
            "player_match_stats",
          )
          .upsert(
            playerRows,
            {
              onConflict:
                "match_id,player_id",
            },
          );

      if (error) {
        setSaving(false);
        alert(error.message);
        return;
      }
    }

    const { error: matchError } =
      await supabase
        .from("matches")
        .update({
          status: "COMPLETED",
        })
        .eq("id", match.id);

    if (matchError) {
      setSaving(false);
      alert(matchError.message);
      return;
    }

    setSaving(false);

    log(
      "Match result saved",
      `Match #${match.match_number} in ${stage.name} was saved.`,
    );

    alert("MATCH RESULT SAVED");
  }

  function updateTeam(
    teamId: string,
    field: "position" | "kills",
    value: number,
  ) {
    setResults((old) => ({
      ...old,
      [teamId]: {
        position:
          old[teamId]?.position ??
          0,
        kills:
          old[teamId]?.kills ??
          0,
        [field]: value,
      },
    }));
  }

  if (loading) {
    return (
      <div className="tg-loading">
        <RefreshCw className="tg-spin" />
        Loading match data...
      </div>
    );
  }

  return (
    <div className="tg-page">
      <button
        className="tg-back"
        onClick={onBack}
      >
        <ArrowLeft size={17} />
        BACK TO MATCHES
      </button>

      <Heading
        eyebrow={`${tournament.name} · ${stage.name}`}
        title={`MATCH #${match.match_number}`}
        description={`${match.map} · Enter the complete team and player result.`}
        action={
          <Button
            onClick={save}
            disabled={saving}
          >
            <Save size={17} />
            {saving
              ? "SAVING..."
              : "SAVE MATCH"}
          </Button>
        }
      />

      <Panel
        title="TEAM RESULTS"
        icon={<Trophy size={17} />}
      >
        <div className="tg-score-head">
          <span>TEAM</span>
          <span>POSITION</span>
          <span>KILLS</span>
          <span>POINTS</span>
        </div>

        <div className="tg-score-list">
          {sortedTeams.map(
            (team) => {
              const result =
                results[
                  team.id
                ] ?? {
                  position: 0,
                  kills: 0,
                };

              const total =
                points(
                  result.position,
                  result.kills,
                );

              return (
                <div
                  key={team.id}
                  className="tg-score-row"
                >
                  <div className="tg-score-team">
                    <img
                      src={
                        team.logo_url ||
                        LOGO
                      }
                      alt=""
                    />

                    <div>
                      <strong>
                        {team.name}
                      </strong>

                      <span>
                        {team.short_name ||
                          ""}
                      </span>
                    </div>
                  </div>

                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={
                      result.position ||
                      ""
                    }
                    placeholder="#"
                    onChange={(e) =>
                      updateTeam(
                        team.id,
                        "position",
                        Number(
                          e.target.value,
                        ),
                      )
                    }
                  />

                  <input
                    type="number"
                    min="0"
                    value={
                      result.kills ||
                      ""
                    }
                    placeholder="0"
                    onChange={(e) =>
                      updateTeam(
                        team.id,
                        "kills",
                        Number(
                          e.target.value,
                        ),
                      )
                    }
                  />

                  <strong className="tg-total-points">
                    {total}
                  </strong>
                </div>
              );
            },
          )}
        </div>
      </Panel>

      <Panel
        title="INDIVIDUAL PLAYER KILLS"
        icon={<Users size={17} />}
      >
        <p className="tg-help">
          Enter kills for every player who
          participated in this match.
        </p>

        <div className="tg-player-grid">
          {players.map(
            (player) => (
              <div
                className="tg-player-score"
                key={player.id}
              >
                <img
                  src={
                    player.avatar_url ||
                    LOGO
                  }
                  alt=""
                />

                <div>
                  <strong>
                    {player.name}
                  </strong>

                  <span>
                    {player.role ||
                      "PLAYER"}
                  </span>
                </div>

                <input
                  type="number"
                  min="0"
                  value={
                    kills[
                      player.id
                    ] ?? ""
                  }
                  placeholder="0"
                  onChange={(e) =>
                    setKills({
                      ...kills,
                      [player.id]:
                        Number(
                          e.target.value,
                        ),
                    })
                  }
                />

                <small>KILLS</small>
              </div>
            ),
          )}
        </div>
      </Panel>
    </div>
  );
}

/* =========================================================
   STAGE RANKING
========================================================= */

function StageRanking({
  stage,
  teams,
  log,
}: {
  stage: Stage;
  teams: Team[];
  log: (a: string, d: string) => void;
}) {
  const [ranking, setRanking] =
    useState<Record<string, number>>(
      {},
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    load();
  }, [stage.id]);

  async function load() {
    setLoading(true);

    const { data } =
      await supabase
        .from("stage_teams")
        .select("*")
        .eq("stage_id", stage.id);

    const map: Record<
      string,
      number
    > = {};

    for (const row of
      (data ?? []) as StageTeam[]) {
      if (row.final_rank) {
        map[row.team_id] =
          row.final_rank;
      }
    }

    setRanking(map);
    setLoading(false);
  }

  async function save() {
    const rows = Object.entries(
      ranking,
    )
      .filter(
        ([, rank]) => Number(rank) > 0,
      )
      .map(
        ([teamId, rank]) => ({
          stage_id: stage.id,
          team_id: teamId,
          final_rank:
            Number(rank),
        }),
      );

    if (!rows.length) return;

    const { error } =
      await supabase
        .from("stage_teams")
        .upsert(rows, {
          onConflict:
            "stage_id,team_id",
        });

    if (error) {
      alert(error.message);
      return;
    }

    log(
      "Stage ranking saved",
      `Final ranking saved for ${stage.name}.`,
    );

    alert("STAGE RANKING SAVED");
  }

  if (loading)
    return (
      <div className="tg-loading">
        Loading ranking...
      </div>
    );

  return (
    <Panel
      title="FINAL STAGE RANK"
      icon={<Crown size={17} />}
      action={
        <Button onClick={save}>
          <Save size={16} />
          SAVE RANK
        </Button>
      }
    >
      <div className="tg-ranking-list">
        {teams.map(
          (team) => (
            <div
              className="tg-ranking-row"
              key={team.id}
            >
              <img
                src={
                  team.logo_url ||
                  LOGO
                }
                alt=""
              />

              <strong>
                {team.name}
              </strong>

              <input
                type="number"
                min="1"
                placeholder="Rank"
                value={
                  ranking[
                    team.id
                  ] ?? ""
                }
                onChange={(e) =>
                  setRanking({
                    ...ranking,
                    [team.id]:
                      Number(
                        e.target.value,
                      ),
                  })
                }
              />
            </div>
          ),
        )}
      </div>
    </Panel>
  );
}

/* =========================================================
   TEAMS
========================================================= */

function Teams({
  teams,
  players,
}: {
  teams: Team[];
  players: Player[];
}) {
  return (
    <div className="tg-page">
      <Heading
        eyebrow="ROSTER CONTROL"
        title="TEAMS"
        description="Teams currently available to competition management."
      />

      <div className="tg-card-grid">
        {teams.map((team) => {
          const count =
            players.filter(
              (p) =>
                p.team_id ===
                team.id,
            ).length;

          return (
            <div
              className="tg-team-card"
              key={team.id}
            >
              <img
                src={
                  team.logo_url ||
                  LOGO
                }
                alt=""
              />

              <div>
                <h3>{team.name}</h3>
                <span>
                  {team.short_name ||
                    "TEAM"}
                </span>
              </div>

              <strong>
                {count} PLAYERS
              </strong>
            </div>
          );
        })}
      </div>

      {teams.length === 0 && (
        <Empty
          title="No teams"
          description="No teams are available."
        />
      )}
    </div>
  );
}

/* =========================================================
   PLAYERS
========================================================= */

function Players({
  players,
  teams,
}: {
  players: Player[];
  teams: Team[];
}) {
  function teamName(idValue?: string | null) {
    return (
      teams.find(
        (t) => t.id === idValue,
      )?.name || "UNASSIGNED"
    );
  }

  return (
    <div className="tg-page">
      <Heading
        eyebrow="PLAYER CONTROL"
        title="PLAYERS"
        description="Manage the player pool used for individual match statistics."
      />

      <div className="tg-table-wrap">
        <table className="tg-table">
          <thead>
            <tr>
              <th>PLAYER</th>
              <th>TEAM</th>
              <th>ROLE</th>
              <th>ID</th>
            </tr>
          </thead>

          <tbody>
            {players.map(
              (player) => (
                <tr key={player.id}>
                  <td>
                    <div className="tg-person">
                      <img
                        src={
                          player.avatar_url ||
                          LOGO
                        }
                        alt=""
                      />

                      <strong>
                        {player.name}
                      </strong>
                    </div>
                  </td>

                  <td>
                    {teamName(
                      player.team_id,
                    )}
                  </td>

                  <td>
                    {player.role ||
                      "PLAYER"}
                  </td>

                  <td>
                    {player.id.slice(
                      0,
                      8,
                    )}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>

        {players.length === 0 && (
          <Empty
            title="No players"
            description="No players are available."
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================
   ADMINS
========================================================= */

function AdminManagement() {
  const [admins, setAdmins] =
    useState<AdminUser[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [email, setEmail] =
    useState("");

  const [name, setName] =
    useState("");

  const [role, setRole] =
    useState<Role>("admin");

  const [busy, setBusy] =
    useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    const { data, error } =
      await supabase
        .from("admin_users")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (!error && data) {
      setAdmins(data as AdminUser[]);
    }

    setLoading(false);
  }

  async function createAdmin() {
    if (!email.trim()) return;

    setBusy(true);

    /*
      The admin record is stored in Supabase.
      User account/password creation should be
      performed through your Supabase Auth flow
      or secure Edge Function.
    */

    const { data, error } =
      await supabase
        .from("admin_users")
        .insert({
          id: id(),
          email:
            email.trim().toLowerCase(),
          name:
            name.trim() || null,
          role,
          active: true,
        })
        .select()
        .single();

    setBusy(false);

    if (error) {
      alert(error.message);
      return;
    }

    if (data) {
      setAdmins((old) => [
        data as AdminUser,
        ...old,
      ]);
    }

    setEmail("");
    setName("");

    alert(
      "Admin record created. The user must have a Supabase Auth account with this email.",
    );
  }

  async function toggle(
    admin: AdminUser,
  ) {
    const { data, error } =
      await supabase
        .from("admin_users")
        .update({
          active: !admin.active,
        })
        .eq("id", admin.id)
        .select()
        .single();

    if (error) {
      alert(error.message);
      return;
    }

    if (data) {
      setAdmins((old) =>
        old.map((x) =>
          x.id === admin.id
            ? (data as AdminUser)
            : x,
        ),
      );
    }
  }

  async function remove(
    admin: AdminUser,
  ) {
    if (
      !confirm(
        `Remove ${admin.email}?`,
      )
    )
      return;

    const { error } =
      await supabase
        .from("admin_users")
        .delete()
        .eq("id", admin.id);

    if (error) {
      alert(error.message);
      return;
    }

    setAdmins((old) =>
      old.filter(
        (x) => x.id !== admin.id,
      ),
    );
  }

  if (loading)
    return (
      <div className="tg-loading">
        Loading admins...
      </div>
    );

  return (
    <div className="tg-page">
      <Heading
        eyebrow="ACCESS CONTROL"
        title="ADMINS"
        description="Control who can access the Total Gaming Hub administration panel."
      />

      <Panel
        title="ADD ADMIN"
        icon={<UserPlus size={17} />}
      >
        <div className="tg-form-grid">
          <Field
            label="NAME"
            value={name}
            onChange={setName}
            placeholder="Admin name"
          />

          <Field
            label="EMAIL"
            value={email}
            onChange={setEmail}
            placeholder="admin@example.com"
          />

          <SelectField
            label="ROLE"
            value={role}
            onChange={(v) =>
              setRole(v as Role)
            }
          >
            <option value="admin">
              ADMIN
            </option>
            <option value="editor">
              EDITOR
            </option>
            <option value="scorekeeper">
              SCOREKEEPER
            </option>
          </SelectField>

          <div className="tg-field tg-field-button">
            <span>&nbsp;</span>

            <Button
              onClick={createAdmin}
              disabled={busy}
            >
              <UserPlus size={16} />
              CREATE ADMIN
            </Button>
          </div>
        </div>
      </Panel>

      <Panel
        title="ADMIN USERS"
        icon={<ShieldCheck size={17} />}
      >
        <div className="tg-admin-list">
          {admins.map(
            (admin) => (
              <div
                className="tg-admin-row"
                key={admin.id}
              >
                <div className="tg-admin-avatar">
                  {(
                    admin.name ||
                    admin.email
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {admin.name ||
                      "Unnamed Admin"}
                  </strong>

                  <span>
                    {admin.email}
                  </span>
                </div>

                <Badge
                  kind={
                    admin.role ===
                    "owner"
                      ? "warning"
                      : "blue"
                  }
                >
                  {roleLabel(
                    admin.role,
                  )}
                </Badge>

                <Badge
                  kind={
                    admin.active
                      ? "success"
                      : "danger"
                  }
                >
                  {admin.active
                    ? "ACTIVE"
                    : "DISABLED"}
                </Badge>

                <Button
                  variant="secondary"
                  onClick={() =>
                    toggle(admin)
                  }
                >
                  {admin.active
                    ? "DISABLE"
                    : "ENABLE"}
                </Button>

                {admin.role !==
                  "owner" && (
                  <IconButton
                    title="Delete admin"
                    onClick={() =>
                      remove(
                        admin,
                      )
                    }
                  >
                    <Trash2
                      size={16}
                    />
                  </IconButton>
                )}
              </div>
            ),
          )}
        </div>

        {admins.length === 0 && (
          <Empty
            title="No admin records"
            description="Create an admin record after configuring your Supabase Auth user."
          />
        )}
      </Panel>
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
  return (
    <div className="tg-page">
      <Heading
        eyebrow="AUDIT LOG"
        title="ACTIVITY"
        description="Recent administrator actions."
      />

      <Panel
        title="ACTIVITY LOG"
        icon={<Activity size={17} />}
      >
        <div className="tg-activity-list">
          {activities.map(
            (item) => (
              <div
                className="tg-activity"
                key={item.id}
              >
                <div className="tg-activity-dot" />

                <div>
                  <strong>
                    {item.action}
                  </strong>

                  <span>
                    {item.description}
                  </span>

                  <small>
                    {item.admin} ·{" "}
                    {dateText(
                      item.created_at,
                    )}
                  </small>
                </div>
              </div>
            ),
          )}
        </div>

        {activities.length === 0 && (
          <Empty
            title="No activity"
            description="Admin actions will appear here."
          />
        )}
      </Panel>
    </div>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function SettingsPage() {
  const [publicResults, setPublicResults] =
    useState(true);

  const [publicStandings, setPublicStandings] =
    useState(true);

  const [liveFeed, setLiveFeed] =
    useState(true);

  const [maintenance, setMaintenance] =
    useState(false);

  return (
    <div className="tg-page">
      <Heading
        eyebrow="SYSTEM"
        title="SETTINGS"
        description="Control public visibility and system behaviour."
      />

      <Panel
        title="PUBLIC WEBSITE"
        icon={<Eye size={17} />}
      >
        <SettingRow
          title="PUBLIC RESULTS"
          description="Show saved match results on the public website."
          value={publicResults}
          onChange={setPublicResults}
        />

        <SettingRow
          title="PUBLIC STANDINGS"
          description="Show stage and tournament standings publicly."
          value={publicStandings}
          onChange={setPublicStandings}
        />

        <SettingRow
          title="LIVE FEED"
          description="Allow live competition data to appear on the dashboard."
          value={liveFeed}
          onChange={setLiveFeed}
        />

        <SettingRow
          title="MAINTENANCE MODE"
          description="Temporarily restrict the public website."
          value={maintenance}
          onChange={setMaintenance}
        />
      </Panel>
    </div>
  );
}

function SettingRow({
  title,
  description,
  value,
  onChange,
}: {
  title: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="tg-setting-row">
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <button
        type="button"
        className={`tg-switch ${
          value
            ? "tg-switch-on"
            : ""
        }`}
        onClick={() =>
          onChange(!value)
        }
      >
        <span />
      </button>
    </div>
  );
}

/* =========================================================
   HEADING / PANEL
========================================================= */

function Heading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="tg-page-heading">
      <div>
        <small>{eyebrow}</small>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      {action}
    </div>
  );
}

function Panel({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="tg-panel">
      <div className="tg-panel-head">
        <div>
          {icon}
          <strong>{title}</strong>
        </div>

        {action}
      </div>

      <div className="tg-panel-body">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   MAIN ADMIN
========================================================= */

function AdminRoute() {
  const [session, setSession] =
    useState<any>(null);

  const [email, setEmail] =
    useState("");

  const [section, setSection] =
    useState<Section>("dashboard");

  const [mobileSidebar, setMobileSidebar] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [tournaments, setTournaments] =
    useState<Tournament[]>([]);

  const [stages, setStages] =
    useState<Stage[]>([]);

  const [matches, setMatches] =
    useState<Match[]>([]);

  const [teams, setTeams] =
    useState<Team[]>([]);

  const [players, setPlayers] =
    useState<Player[]>([]);

  const [activities, setActivities] =
    useState<ActivityItem[]>([]);

  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);

  const [selectedStage, setSelectedStage] =
    useState<Stage | null>(null);

  const [role, setRole] =
    useState<Role>("owner");

  useEffect(() => {
    checkAuth();

    const {
      data: listener,
    } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);

        if (currentSession?.user?.email) {
          setEmail(
            currentSession.user.email,
          );
        }
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session) loadData();
  }, [session]);

  async function checkAuth() {
    const {
      data: { session: current },
    } = await supabase.auth.getSession();

    setSession(current);

    if (current?.user?.email) {
      setEmail(
        current.user.email,
      );
    }

    setLoading(false);
  }

  async function loadData() {
    setRefreshing(true);

    const [
      tournamentRes,
      stageRes,
      matchRes,
      teamRes,
      playerRes,
      activityRes,
    ] = await Promise.all([
      supabase
        .from("tournaments")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false,
          },
        ),

      supabase
        .from("tournament_stages")
        .select("*")
        .order(
          "display_order",
          {
            ascending: true,
          },
        ),

      supabase
        .from("matches")
        .select("*")
        .order(
          "match_number",
          {
            ascending: true,
          },
        ),

      supabase
        .from("teams")
        .select("*")
        .order("name"),

      supabase
        .from("players")
        .select("*")
        .order("name"),

      supabase
        .from("activity_logs")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false,
          },
        )
        .limit(100),
    ]);

    if (tournamentRes.data) {
      setTournaments(
        tournamentRes.data as Tournament[],
      );
    }

    if (stageRes.data) {
      setStages(
        stageRes.data as Stage[],
      );
    }

    if (matchRes.data) {
      setMatches(
        matchRes.data as Match[],
      );
    }

    if (teamRes.data) {
      setTeams(
        teamRes.data as Team[],
      );
    }

    if (playerRes.data) {
      setPlayers(
        playerRes.data as Player[],
      );
    }

    if (activityRes.data) {
      setActivities(
        activityRes.data as ActivityItem[],
      );
    }

    setRefreshing(false);
  }

  async function logout() {
    await supabase.auth.signOut();

    setSession(null);
    setEmail("");
  }

  async function log(
    action: string,
    description: string,
  ) {
    const item = {
      id: id(),
      action,
      description,
      admin: email || "ADMIN",
      created_at:
        new Date().toISOString(),
    };

    setActivities((old) => [
      item,
      ...old,
    ]);

    await supabase
      .from("activity_logs")
      .insert(item);
  }

  function openStages(
    tournament: Tournament,
  ) {
    setSelectedTournament(
      tournament,
    );
    setSection("stages");
  }

  function openMatches(stage: Stage) {
    setSelectedStage(stage);
    setSection("matches");
  }

  if (loading) {
    return (
      <div className="tg-loading">
        <RefreshCw className="tg-spin" />
        Loading Total Gaming Hub...
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <Login
          onSuccess={(mail) => {
            setEmail(mail);
          }}
        />
      </>
    );
  }

  return (
    <div className="tg-admin-shell">
      <Sidebar
        section={section}
        setSection={setSection}
        role={role}
        mobile={mobileSidebar}
        close={() =>
          setMobileSidebar(false)
        }
      />

      {mobileSidebar && (
        <div
          className="tg-mobile-overlay"
          onClick={() =>
            setMobileSidebar(false)
          }
        />
      )}

      <div className="tg-main">
        <Header
          email={email}
          onMenu={() =>
            setMobileSidebar(true)
          }
          onLogout={logout}
          onRefresh={loadData}
          refreshing={refreshing}
        />

        <main>
          {section ===
            "dashboard" && (
            <Dashboard
              tournaments={
                tournaments
              }
              stages={stages}
              matches={matches}
              teams={teams}
              players={players}
              onNavigate={setSection}
            />
          )}

          {section ===
            "tournaments" && (
            <Tournaments
              tournaments={
                tournaments
              }
              setTournaments={
                setTournaments
              }
              stages={stages}
              onOpenStages={
                openStages
              }
              log={log}
            />
          )}

          {section === "stages" &&
            selectedTournament && (
              <Stages
                tournament={
                  selectedTournament
                }
                stages={stages}
                setStages={setStages}
                matches={matches}
                onBack={() => {
                  setSelectedTournament(
                    null,
                  );
                  setSection(
                    "tournaments",
                  );
                }}
                onOpenMatch={
                  openMatches
                }
                log={log}
              />
            )}

          {section === "matches" &&
            selectedTournament &&
            selectedStage && (
              <Matches
                tournament={
                  selectedTournament
                }
                stage={selectedStage}
                matches={matches}
                setMatches={setMatches}
                teams={teams}
                players={players}
                onBack={() =>
                  setSection(
                    "stages",
                  )
                }
                log={log}
              />
            )}

          {section === "teams" && (
            <Teams
              teams={teams}
              players={players}
            />
          )}

          {section === "players" && (
            <Players
              players={players}
              teams={teams}
            />
          )}

          {section === "admins" && (
            <AdminManagement />
          )}

          {section === "activity" && (
            <ActivityPage
              activities={
                activities
              }
            />
          )}

          {section === "settings" && (
            <SettingsPage />
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminRoute;
