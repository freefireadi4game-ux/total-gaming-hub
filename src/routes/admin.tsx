import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Crown,
  Edit3,
  Eye,
  EyeOff,
  Gamepad2,
  Globe,
  Image,
  KeyRound,
  LayoutDashboard,
  Link2,
  Lock,
  LogOut,
  Menu,
  MoreHorizontal,
  Palette,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Shield,
  Trash2,
  Trophy,
  Upload,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminPanel,
  head: () => ({
    meta: [
      { title: "TG Hub Admin" },
      {
        name: "description",
        content: "Total Gaming Hub administration panel",
      },
    ],
  }),
});

/* =========================================================
   TYPES
========================================================= */

type AdminRole = "owner" | "admin" | "editor" | "viewer";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  createdAt: string;
};

type TournamentStatus = "LIVE" | "UPCOMING" | "ARCHIVED";

type Tournament = {
  id: string;
  name: string;
  status: TournamentStatus;
  phase: string;
  matches: number;
  teams: number | string;
  visible: boolean;
};

type Team = {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  players: number;
  points: number;
  kills: number;
  position: number;
  visible: boolean;
};

type Match = {
  id: string;
  number: number;
  map: string;
  status: "UPCOMING" | "LIVE" | "COMPLETED";
  teams: number;
  kills: number;
  points: number;
  date: string;
  visible: boolean;
};

type Player = {
  id: string;
  name: string;
  team: string;
  role: string;
  kills: number;
  matches: number;
  image: string;
  visible: boolean;
};

type SiteSettings = {
  siteName: string;
  tagline: string;
  logo: string;
  backgroundLogo: string;
  backgroundOpacity: number;
  showBackgroundLogo: boolean;
  showAdminSetup: boolean;
  maintenanceMode: boolean;
  primaryColor: string;
  accentColor: string;
};

type AdminState = {
  initialized: boolean;
  admins: AdminUser[];
  tournaments: Tournament[];
  teams: Team[];
  matches: Match[];
  players: Player[];
  settings: SiteSettings;
};

/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "tg_hub_admin_state";
const SESSION_KEY = "tg_hub_admin_session";
const INVITE_KEY = "tg_hub_admin_invites";

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function getInitialState(): AdminState {
  return {
    initialized: false,

    admins: [],

    tournaments: [
      {
        id: "official-1",
        name: "TEZ FFMIC 2026 FALL",
        status: "LIVE",
        phase: "PLAY-INS",
        matches: 6,
        teams: 18,
        visible: true,
      },
      {
        id: "official-2",
        name: "TEZ FFMIC 2026 FALL",
        status: "UPCOMING",
        phase: "GS - WEEK 1",
        matches: 6,
        teams: 18,
        visible: true,
      },
      {
        id: "official-3",
        name: "TEZ FFMIC 2026 FALL",
        status: "UPCOMING",
        phase: "GS - WEEK 2",
        matches: 6,
        teams: 18,
        visible: true,
      },
      {
        id: "official-4",
        name: "TEZ FFMIC 2026 FALL",
        status: "UPCOMING",
        phase: "KO - WEEK 1",
        matches: 12,
        teams: 18,
        visible: true,
      },
      {
        id: "official-5",
        name: "TEZ FFMIC 2026 FALL",
        status: "UPCOMING",
        phase: "KO - WEEK 2 - DAY 1",
        matches: 6,
        teams: 18,
        visible: true,
      },
      {
        id: "official-6",
        name: "TEZ FFMIC 2026 SPRING",
        status: "ARCHIVED",
        phase: "GRAND FINALS",
        matches: 12,
        teams: 18,
        visible: true,
      },
    ],

    teams: [
      {
        id: "team-1",
        name: "Total Gaming",
        shortName: "TG",
        logo: "/iqoo-tg-logo.png",
        players: 4,
        points: 50,
        kills: 24,
        position: 1,
        visible: true,
      },
      {
        id: "team-2",
        name: "Team Alpha",
        shortName: "ALP",
        logo: "",
        players: 4,
        points: 42,
        kills: 21,
        position: 2,
        visible: true,
      },
      {
        id: "team-3",
        name: "Team Nova",
        shortName: "NVA",
        logo: "",
        players: 4,
        points: 38,
        kills: 18,
        position: 3,
        visible: true,
      },
    ],

    matches: [
      {
        id: "match-1",
        number: 1,
        map: "Bermuda",
        status: "COMPLETED",
        teams: 18,
        kills: 10,
        points: 22,
        date: "2026-09-08",
        visible: true,
      },
      {
        id: "match-2",
        number: 2,
        map: "Purgatory",
        status: "COMPLETED",
        teams: 18,
        kills: 8,
        points: 16,
        date: "2026-09-08",
        visible: true,
      },
      {
        id: "match-3",
        number: 3,
        map: "Alpine",
        status: "COMPLETED",
        teams: 18,
        kills: 6,
        points: 12,
        date: "2026-09-08",
        visible: true,
      },
    ],

    players: [
      {
        id: "player-1",
        name: "Player 1",
        team: "Total Gaming",
        role: "Rusher",
        kills: 9,
        matches: 3,
        image: "/total-gaming-mvp.jpg",
        visible: true,
      },
      {
        id: "player-2",
        name: "Player 2",
        team: "Total Gaming",
        role: "IGL",
        kills: 7,
        matches: 3,
        image: "",
        visible: true,
      },
    ],

    settings: {
      siteName: "TOTAL GAMING HUB",
      tagline: "PLAY · COMPETE · BELONG",
      logo: "/iqoo-tg-logo.png",
      backgroundLogo: "/iqoo-tg-logo.png",
      backgroundOpacity: 0.16,
      showBackgroundLogo: true,
      showAdminSetup: true,
      maintenanceMode: false,
      primaryColor: "#8b2cff",
      accentColor: "#18c8ff",
    },
  };
}

function loadState(): AdminState {
  if (typeof window === "undefined") {
    return getInitialState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return getInitialState();
    }

    const parsed = JSON.parse(raw) as AdminState;

    return {
      ...getInitialState(),
      ...parsed,
      settings: {
        ...getInitialState().settings,
        ...(parsed.settings || {}),
      },
    };
  } catch {
    return getInitialState();
  }
}

function saveState(state: AdminState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getSession() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(SESSION_KEY);

    if (!raw) return null;

    return JSON.parse(raw) as {
      adminId: string;
      email: string;
    };
  } catch {
    return null;
  }
}

/* =========================================================
   ROUTE
========================================================= */

function AdminPanel() {
  const navigate = useNavigate();

  const [state, setState] = useState<AdminState>(() =>
    loadState(),
  );

  const [session, setSession] = useState(getSession());

  const [setupMode, setSetupMode] = useState(false);
  const [loginMode, setLoginMode] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [activePage, setActivePage] =
    useState("overview");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [search, setSearch] = useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [notice, setNotice] = useState("");

  const [inviteEmail, setInviteEmail] =
    useState("");

  const [inviteRole, setInviteRole] =
    useState<AdminRole>("admin");

  const [generatedInvite, setGeneratedInvite] =
    useState("");

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const current = getSession();

    if (current) {
      setSession(current);
      setLoginMode(false);
      setSetupMode(false);
    } else if (!state.initialized) {
      setSetupMode(true);
    } else {
      setLoginMode(true);
    }
  }, [state.initialized]);

  function showNotice(message: string) {
    setNotice(message);

    window.setTimeout(() => {
      setNotice("");
    }, 2500);
  }

  function createFirstAdmin() {
    if (!name.trim()) {
      showNotice("Enter admin name.");
      return;
    }

    if (!email.trim()) {
      showNotice("Enter email.");
      return;
    }

    if (password.length < 6) {
      showNotice(
        "Password must contain at least 6 characters.",
      );
      return;
    }

    const admin: AdminUser = {
      id: makeId("admin"),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: "owner",
      active: true,
      createdAt: new Date().toISOString(),
    };

    const nextState = {
      ...state,
      initialized: true,
      admins: [admin],
    };

    setState(nextState);

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        adminId: admin.id,
        email: admin.email,
      }),
    );

    setSession({
      adminId: admin.id,
      email: admin.email,
    });

    showNotice("Owner account created.");
  }

  function login() {
    const admin = state.admins.find(
      (item) =>
        item.email.toLowerCase() ===
          email.trim().toLowerCase() &&
        item.active,
    );

    if (!admin) {
      showNotice("Admin account not found.");
      return;
    }

    if (password.length < 6) {
      showNotice("Enter your password.");
      return;
    }

    /*
      IMPORTANT:
      This is a frontend-only session.
      For real password authentication across devices,
      connect this layer to Supabase/Auth or another backend.
    */

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        adminId: admin.id,
        email: admin.email,
      }),
    );

    setSession({
      adminId: admin.id,
      email: admin.email,
    });

    showNotice("Welcome back.");
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setLoginMode(true);
  }

  function updateState<K extends keyof AdminState>(
    key: K,
    value: AdminState[K],
  ) {
    setState((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function updateSettings(
    patch: Partial<SiteSettings>,
  ) {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...patch,
      },
    }));
  }

  function deleteTournament(id: string) {
    if (!confirm("Delete this tournament?")) return;

    updateState(
      "tournaments",
      state.tournaments.filter(
        (item) => item.id !== id,
      ),
    );

    showNotice("Tournament deleted.");
  }

  function deleteTeam(id: string) {
    if (!confirm("Delete this team?")) return;

    updateState(
      "teams",
      state.teams.filter(
        (item) => item.id !== id,
      ),
    );

    showNotice("Team deleted.");
  }

  function deleteMatch(id: string) {
    if (!confirm("Delete this match?")) return;

    updateState(
      "matches",
      state.matches.filter(
        (item) => item.id !== id,
      ),
    );

    showNotice("Match deleted.");
  }

  function deletePlayer(id: string) {
    if (!confirm("Delete this player?")) return;

    updateState(
      "players",
      state.players.filter(
        (item) => item.id !== id,
      ),
    );

    showNotice("Player deleted.");
  }

  function addTournament() {
    const tournament: Tournament = {
      id: makeId("tournament"),
      name: "NEW TOURNAMENT",
      status: "UPCOMING",
      phase: "NEW PHASE",
      matches: 6,
      teams: 18,
      visible: true,
    };

    updateState("tournaments", [
      ...state.tournaments,
      tournament,
    ]);

    setEditingId(tournament.id);
    showNotice("Tournament added.");
  }

  function addTeam() {
    const team: Team = {
      id: makeId("team"),
      name: "NEW TEAM",
      shortName: "NEW",
      logo: "",
      players: 4,
      points: 0,
      kills: 0,
      position: state.teams.length + 1,
      visible: true,
    };

    updateState("teams", [
      ...state.teams,
      team,
    ]);

    setEditingId(team.id);
    showNotice("Team added.");
  }

  function addMatch() {
    const match: Match = {
      id: makeId("match"),
      number: state.matches.length + 1,
      map: "Bermuda",
      status: "UPCOMING",
      teams: 18,
      kills: 0,
      points: 0,
      date: new Date()
        .toISOString()
        .slice(0, 10),
      visible: true,
    };

    updateState("matches", [
      ...state.matches,
      match,
    ]);

    setEditingId(match.id);
    showNotice("Match added.");
  }

  function addPlayer() {
    const player: Player = {
      id: makeId("player"),
      name: "NEW PLAYER",
      team:
        state.teams[0]?.name || "Unassigned",
      role: "Player",
      kills: 0,
      matches: 0,
      image: "",
      visible: true,
    };

    updateState("players", [
      ...state.players,
      player,
    ]);

    setEditingId(player.id);
    showNotice("Player added.");
  }

  function updateTournament(
    id: string,
    patch: Partial<Tournament>,
  ) {
    updateState(
      "tournaments",
      state.tournaments.map((item) =>
        item.id === id
          ? { ...item, ...patch }
          : item,
      ),
    );
  }

  function updateTeam(
    id: string,
    patch: Partial<Team>,
  ) {
    updateState(
      "teams",
      state.teams.map((item) =>
        item.id === id
          ? { ...item, ...patch }
          : item,
      ),
    );
  }

  function updateMatch(
    id: string,
    patch: Partial<Match>,
  ) {
    updateState(
      "matches",
      state.matches.map((item) =>
        item.id === id
          ? { ...item, ...patch }
          : item,
      ),
    );
  }

  function updatePlayer(
    id: string,
    patch: Partial<Player>,
  ) {
    updateState(
      "players",
      state.players.map((item) =>
        item.id === id
          ? { ...item, ...patch }
          : item,
      ),
    );
  }

  function createInvite() {
    if (!inviteEmail.trim()) {
      showNotice("Enter email for invitation.");
      return;
    }

    const token = `${crypto.randomUUID()}-${Date.now()}`;

    const invite = {
      token,
      email: inviteEmail
        .trim()
        .toLowerCase(),
      role: inviteRole,
      createdAt: new Date().toISOString(),
    };

    const existing = JSON.parse(
      localStorage.getItem(INVITE_KEY) || "[]",
    );

    localStorage.setItem(
      INVITE_KEY,
      JSON.stringify([
        ...existing,
        invite,
      ]),
    );

    /*
      The actual production invitation should be generated
      by the backend so the token works on another device.
      This creates the URL structure now.
    */

    const url =
      `${window.location.origin}/admin?invite=${encodeURIComponent(token)}`;

    setGeneratedInvite(url);

    showNotice("Invitation link created.");
  }

  async function copyInvite() {
    if (!generatedInvite) return;

    await navigator.clipboard.writeText(
      generatedInvite,
    );

    showNotice("Invite link copied.");
  }

  function resetLocalAdmin() {
    if (
      !confirm(
        "This will remove the local admin session and admin data. Continue?",
      )
    ) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(INVITE_KEY);

    window.location.reload();
  }

  const currentAdmin = state.admins.find(
    (item) =>
      item.id === session?.adminId,
  );

  const filteredTournaments =
    state.tournaments.filter((item) =>
      `${item.name} ${item.phase}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );

  const filteredTeams =
    state.teams.filter((item) =>
      `${item.name} ${item.shortName}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );

  const filteredMatches =
    state.matches.filter((item) =>
      `${item.map} ${item.status} ${item.number}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );

  const filteredPlayers =
    state.players.filter((item) =>
      `${item.name} ${item.team} ${item.role}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );

  const totalPoints = useMemo(
    () =>
      state.teams.reduce(
        (sum, team) =>
          sum + Number(team.points || 0),
        0,
      ),
    [state.teams],
  );

  /* =========================================================
     FIRST TIME SETUP
  ========================================================= */

  if (!session && !state.initialized) {
    return (
      <>
        <AdminStyles />

        <div className="tg-admin-auth">
          <div className="tg-auth-grid" />

          <div className="tg-auth-card">
            <div className="tg-auth-brand">
              <div className="tg-auth-logo">
                <img
                  src={
                    state.settings.logo ||
                    "/iqoo-tg-logo.png"
                  }
                  alt=""
                />
              </div>

              <div>
                <strong>
                  TOTAL GAMING HUB
                </strong>
                <span>ADMIN CONTROL</span>
              </div>
            </div>

            <div className="tg-auth-line" />

            <div className="tg-auth-label">
              INITIAL ADMIN SETUP
            </div>

            <h1>
              Create
              <br />
              <span>Owner Access.</span>
            </h1>

            <p>
              This screen appears only before
              the first admin account is created.
            </p>

            <label>OWNER NAME</label>

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Your name"
            />

            <label>EMAIL</label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="owner@email.com"
            />

            <label>PASSWORD</label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Minimum 6 characters"
            />

            <button
              className="tg-auth-submit"
              onClick={createFirstAdmin}
            >
              <Crown size={18} />
              CREATE OWNER
            </button>

            <div className="tg-auth-warning">
              <Shield size={15} />
              <span>
                After setup, the admin entry will
                no longer be shown on the public
                website.
              </span>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* =========================================================
     LOGIN
  ========================================================= */

  if (!session && state.initialized) {
    return (
      <>
        <AdminStyles />

        <div className="tg-admin-auth">
          <div className="tg-auth-grid" />

          <div className="tg-auth-card">
            <div className="tg-auth-brand">
              <div className="tg-auth-logo">
                <img
                  src={
                    state.settings.logo ||
                    "/iqoo-tg-logo.png"
                  }
                  alt=""
              />
              </div>

              <div>
                <strong>
                  TOTAL GAMING HUB
                </strong>
                <span>ADMIN CONTROL</span>
              </div>
            </div>

            <div className="tg-auth-line" />

            <div className="tg-auth-label">
              SECURE ACCESS
            </div>

            <h1>
              Welcome
              <br />
              <span>Back.</span>
            </h1>

            <p>
              Sign in with an authorized admin
              account.
            </p>

            <label>EMAIL</label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="admin@email.com"
            />

            <label>PASSWORD</label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Your password"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  login();
                }
              }}
            />

            <button
              className="tg-auth-submit"
              onClick={login}
            >
              <Lock size={18} />
              ENTER ADMIN
            </button>

            <button
              className="tg-back-public"
              onClick={() =>
                navigate({
                  to: "/",
                })
              }
            >
              ← BACK TO WEBSITE
            </button>
          </div>
        </div>
      </>
    );
  }

  /* =========================================================
     ADMIN DASHBOARD
  ========================================================= */

  return (
    <>
      <AdminStyles />

      <div className="tg-admin-app">
        {/* BACKGROUND */}
        <div className="tg-admin-bg-grid" />

        {/* MOBILE OVERLAY */}
        {sidebarOpen && (
          <div
            className="tg-sidebar-overlay"
            onClick={() =>
              setSidebarOpen(false)
            }
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`tg-sidebar ${
            sidebarOpen
              ? "open"
              : ""
          }`}
        >
          <div className="tg-sidebar-top">
            <div className="tg-admin-logo">
              <img
                src={
                  state.settings.logo ||
                  "/iqoo-tg-logo.png"
                }
                alt=""
              />
            </div>

            <div>
              <strong>
                TG HUB
              </strong>
              <span>CONTROL CENTER</span>
            </div>

            <button
              className="tg-sidebar-close"
              onClick={() =>
                setSidebarOpen(false)
              }
            >
              <X size={20} />
            </button>
          </div>

          <div className="tg-owner-box">
            <div className="tg-owner-avatar">
              {currentAdmin?.name
                ?.slice(0, 1)
                .toUpperCase() || "A"}
            </div>

            <div>
              <strong>
                {currentAdmin?.name ||
                  "Administrator"}
              </strong>

              <span>
                {currentAdmin?.role?.toUpperCase() ||
                  "ADMIN"}
              </span>
            </div>
          </div>

          <div className="tg-nav-title">
            CONTROL
          </div>

          <AdminNavButton
            icon={<LayoutDashboard />}
            label="Overview"
            active={
              activePage === "overview"
            }
            onClick={() => {
              setActivePage("overview");
              setSidebarOpen(false);
            }}
          />

          <AdminNavButton
            icon={<Trophy />}
            label="Tournaments"
            active={
              activePage === "tournaments"
            }
            onClick={() => {
              setActivePage("tournaments");
              setSidebarOpen(false);
            }}
          />

          <AdminNavButton
            icon={<Users />}
            label="Teams"
            active={activePage === "teams"}
            onClick={() => {
              setActivePage("teams");
              setSidebarOpen(false);
            }}
          />

          <AdminNavButton
            icon={<Gamepad2 />}
            label="Matches"
            active={
              activePage === "matches"
            }
            onClick={() => {
              setActivePage("matches");
              setSidebarOpen(false);
            }}
          />

          <AdminNavButton
            icon={<Crown />}
            label="Players / MVP"
            active={
              activePage === "players"
            }
            onClick={() => {
              setActivePage("players");
              setSidebarOpen(false);
            }}
          />

          <AdminNavButton
            icon={<BarChart3 />}
            label="Analytics"
            active={
              activePage === "analytics"
            }
            onClick={() => {
              setActivePage("analytics");
              setSidebarOpen(false);
            }}
          />

          <div className="tg-nav-title">
            MANAGEMENT
          </div>

          <AdminNavButton
            icon={<UserPlus />}
            label="Admins"
            active={
              activePage === "admins"
            }
            onClick={() => {
              setActivePage("admins");
              setSidebarOpen(false);
            }}
          />

          <AdminNavButton
            icon={<Link2 />}
            label="Admin Invites"
            active={
              activePage === "invites"
            }
            onClick={() => {
              setActivePage("invites");
              setSidebarOpen(false);
            }}
          />

          <AdminNavButton
            icon={<Palette />}
            label="Site Control"
            active={
              activePage === "settings"
            }
            onClick={() => {
              setActivePage("settings");
              setSidebarOpen(false);
            }}
          />

          <div className="tg-sidebar-bottom">
            <button
              className="tg-public-button"
              onClick={() =>
                navigate({
                  to: "/",
                })
              }
            >
              <Globe size={17} />
              VIEW WEBSITE
            </button>

            <button
              className="tg-logout"
              onClick={logout}
            >
              <LogOut size={17} />
              LOG OUT
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="tg-admin-main">
          <header className="tg-admin-header">
            <button
              className="tg-mobile-menu-button"
              onClick={() =>
                setSidebarOpen(true)
              }
            >
              <Menu size={22} />
            </button>

            <div>
              <div className="tg-admin-header-kicker">
                TOTAL GAMING HUB
              </div>

              <h1>
                {getPageTitle(activePage)}
              </h1>
            </div>

            <div className="tg-header-right">
              <div className="tg-live-system">
                <span />
                SYSTEM ONLINE
              </div>

              <button
                className="tg-refresh"
                onClick={() => {
                  setState(loadState());
                  showNotice(
                    "Data refreshed.",
                  );
                }}
              >
                <RefreshCw size={17} />
              </button>

              <div className="tg-mini-avatar">
                {currentAdmin?.name
                  ?.slice(0, 1)
                  .toUpperCase() || "A"}
              </div>
            </div>
          </header>

          <main className="tg-admin-content">
            {/* SEARCH */}
            {[
              "tournaments",
              "teams",
              "matches",
              "players",
            ].includes(activePage) && (
              <div className="tg-toolbar">
                <div className="tg-search">
                  <Search size={17} />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value,
                      )
                    }
                    placeholder={`Search ${activePage}...`}
                  />
                </div>
              </div>
            )}

            {/* =================================================
                OVERVIEW
            ================================================= */}

            {activePage === "overview" && (
              <Overview
                state={state}
                totalPoints={totalPoints}
                onNavigate={setActivePage}
              />
            )}

            {/* =================================================
                TOURNAMENTS
            ================================================= */}

            {activePage ===
              "tournaments" && (
              <section>
                <SectionHeader
                  eyebrow="EVENT CONTROL"
                  title="TOURNAMENTS"
                  description="Create, edit, publish or archive every tournament."
                  action={
                    <button
                      className="tg-primary-button"
                      onClick={
                        addTournament
                      }
                    >
                      <Plus size={17} />
                      NEW TOURNAMENT
                    </button>
                  }
                />

                <div className="tg-admin-list">
                  {filteredTournaments.map(
                    (tournament) => (
                      <TournamentEditor
                        key={
                          tournament.id
                        }
                        tournament={
                          tournament
                        }
                        editing={
                          editingId ===
                          tournament.id
                        }
                        onEdit={() =>
                          setEditingId(
                            tournament.id,
                          )
                        }
                        onClose={() =>
                          setEditingId(null)
                        }
                        onUpdate={(
                          patch,
                        ) =>
                          updateTournament(
                            tournament.id,
                            patch,
                          )
                        }
                        onDelete={() =>
                          deleteTournament(
                            tournament.id,
                          )
                        }
                      />
                    ),
                  )}
                </div>
              </section>
            )}

            {/* =================================================
                TEAMS
            ================================================= */}

            {activePage === "teams" && (
              <section>
                <SectionHeader
                  eyebrow="ROSTER CONTROL"
                  title="TEAMS"
                  description="Manage team names, logos, players and live points."
                  action={
                    <button
                      className="tg-primary-button"
                      onClick={addTeam}
                    >
                      <Plus size={17} />
                      ADD TEAM
                    </button>
                  }
                />

                <div className="tg-admin-list">
                  {filteredTeams.map(
                    (team) => (
                      <TeamEditor
                        key={team.id}
                        team={team}
                        editing={
                          editingId ===
                          team.id
                        }
                        onEdit={() =>
                          setEditingId(
                            team.id,
                          )
                        }
                        onClose={() =>
                          setEditingId(null)
                        }
                        onUpdate={(
                          patch,
                        ) =>
                          updateTeam(
                            team.id,
                            patch,
                          )
                        }
                        onDelete={() =>
                          deleteTeam(
                            team.id,
                          )
                        }
                      />
                    ),
                  )}
                </div>
              </section>
            )}

            {/*
              =================================================
                MATCHES
            ================================================= */}

            {activePage ===
              "matches" && (
              <section>
                <SectionHeader
                  eyebrow="LIVE DATA CONTROL"
                  title="MATCHES"
                  description="Control match schedule, map, status, kills and points."
                  action={
                    <button
                      className="tg-primary-button"
                      onClick={addMatch}
                    >
                      <Plus size={17} />
                      ADD MATCH
                    </button>
                  }
                />

                <div className="tg-admin-list">
                  {filteredMatches.map(
                    (match) => (
                      <MatchEditor
                        key={match.id}
                        match={match}
                        editing={
                          editingId ===
                          match.id
                        }
                        onEdit={() =>
                          setEditingId(
                            match.id,
                          )
                        }
                        onClose={() =>
                          setEditingId(null)
                        }
                        onUpdate={(
                          patch,
                        ) =>
                          updateMatch(
                            match.id,
                            patch,
                          )
                        }
                        onDelete={() =>
                          deleteMatch(
                            match.id,
                          )
                        }
                      />
                    ),
                  )}
                </div>
              </section>
            )}

            {/* =================================================
                PLAYERS
            ================================================= */}

            {activePage ===
              "players" && (
              <section>
                <SectionHeader
                  eyebrow="PLAYER CONTROL"
                  title="PLAYERS / MVP"
                  description="Manage player profiles, roles, kills and MVP data."
                  action={
                    <button
                      className="tg-primary-button"
                      onClick={addPlayer}
                    >
                      <Plus size={17} />
                      ADD PLAYER
                    </button>
                  }
                />

                <div className="tg-admin-list">
                  {filteredPlayers.map(
                    (player) => (
                      <PlayerEditor
                        key={
                          player.id
                        }
                        player={
                          player
                        }
                        teams={
                          state.teams
                        }
                        editing={
                          editingId ===
                          player.id
                        }
                        onEdit={() =>
                          setEditingId(
                            player.id,
                          )
                        }
                        onClose={() =>
                          setEditingId(null)
                        }
                        onUpdate={(
                          patch,
                        ) =>
                          updatePlayer(
                            player.id,
                            patch,
                          )
                        }
                        onDelete={() =>
                          deletePlayer(
                            player.id,
                          )
                        }
                      />
                    ),
                  )}
                </div>
              </section>
            )}

            {/* =================================================
                ANALYTICS
            ================================================= */}

            {activePage ===
              "analytics" && (
              <Analytics state={state} />
            )}

            {/* =================================================
                ADMINS
            ================================================= */}

            {activePage === "admins" && (
              <Admins
                state={state}
                currentAdmin={
                  currentAdmin
                }
                setState={setState}
                showNotice={
                  showNotice
                }
              />
            )}

            {/* =================================================
                INVITES
            ================================================= */}

            {activePage ===
              "invites" && (
              <section>
                <SectionHeader
                  eyebrow="ACCESS MANAGEMENT"
                  title="ADMIN INVITES"
                  description="Generate a private admin invitation link."
                />

                <div className="tg-two-column">
                  <div className="tg-control-card">
                    <div className="tg-card-icon">
                      <Link2 />
                    </div>

                    <h3>
                      CREATE ADMIN LINK
                    </h3>

                    <p>
                      Send this link to the
                      person you want to give
                      admin access to.
                    </p>

                    <label>
                      INVITED EMAIL
                    </label>

                    <input
                      value={
                        inviteEmail
                      }
                      onChange={(e) =>
                        setInviteEmail(
                          e.target.value,
                        )
                      }
                      placeholder="admin@example.com"
                    />

                    <label>
                      ACCESS LEVEL
                    </label>

                    <select
                      value={
                        inviteRole
                      }
                      onChange={(e) =>
                        setInviteRole(
                          e.target
                            .value as AdminRole,
                        )
                      }
                    >
                      <option value="admin">
                        ADMIN
                      </option>

                      <option value="editor">
                        EDITOR
                      </option>

                      <option value="viewer">
                        VIEWER
                      </option>
                    </select>

                    <button
                      className="tg-primary-button full"
                      onClick={
                        createInvite
                      }
                    >
                      <Link2 size={17} />
                      GENERATE LINK
                    </button>
                  </div>

                  <div className="tg-control-card">
                    <div className="tg-card-icon">
                      <Shield />
                    </div>

                    <h3>
                      INVITATION
                    </h3>

                    <p>
                      The generated link is
                      intended to open the
                      admin onboarding flow.
                    </p>

                    {generatedInvite ? (
                      <div className="tg-invite-result">
                        <div>
                          {generatedInvite}
                        </div>

                        <button
                          onClick={
                            copyInvite
                          }
                        >
                          <Copy size={17} />
                        </button>
                      </div>
                    ) : (
                      <div className="tg-empty-box">
                        No invitation generated.
                      </div>
                    )}

                    <div className="tg-security-note">
                      <Lock size={15} />
                      Production version should
                      validate the invitation
                      server-side.
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* =================================================
                SITE CONTROL
            ================================================= */}

            {activePage ===
              "settings" && (
              <section>
                <SectionHeader
                  eyebrow="GLOBAL CONTROL"
                  title="SITE CONTROL"
                  description="Control the public website from one place."
                  action={
                    <button
                      className="tg-save-button"
                      onClick={() => {
                        saveState(
                          state,
                        );
                        showNotice(
                          "All settings saved.",
                        );
                      }}
                    >
                      <Save size={17} />
                      SAVE CHANGES
                    </button>
                  }
                />

                <div className="tg-settings-grid">
                  <div className="tg-control-card">
                    <div className="tg-card-heading">
                      <Palette />
                      <div>
                        <h3>
                          BRANDING
                        </h3>
                        <span>
                          Public identity
                        </span>
                      </div>
                    </div>

                    <label>
                      SITE NAME
                    </label>

                    <input
                      value={
                        state.settings
                          .siteName
                      }
                      onChange={(e) =>
                        updateSettings({
                          siteName:
                            e.target
                              .value,
                        })
                      }
                    />

                    <label>
                      TAGLINE
                    </label>

                    <input
                      value={
                        state.settings
                          .tagline
                      }
                      onChange={(e) =>
                        updateSettings({
                          tagline:
                            e.target
                              .value,
                        })
                      }
                    />

                    <label>
                      LOGO PATH
                    </label>

                    <input
                      value={
                        state.settings
                          .logo
                      }
                      onChange={(e) =>
                        updateSettings({
                          logo:
                            e.target
                              .value,
                        })
                      }
                    />

                    <label>
                      BACKGROUND LOGO PATH
                    </label>

                    <input
                      value={
                        state.settings
                          .backgroundLogo
                      }
                      onChange={(e) =>
                        updateSettings({
                          backgroundLogo:
                            e.target
                              .value,
                        })
                      }
                    />
                  </div>

                  <div className="tg-control-card">
                    <div className="tg-card-heading">
                      <Image />
                      <div>
                        <h3>
                          BACKGROUND
                        </h3>
                        <span>
                          Watermark control
                        </span>
                      </div>
                    </div>

                    <ToggleRow
                      label="SHOW BACKGROUND LOGO"
                      value={
                        state.settings
                          .showBackgroundLogo
                      }
                      onChange={(
                        value,
                      ) =>
                        updateSettings({
                          showBackgroundLogo:
                            value,
                        })
                      }
                    />

                    <div className="tg-range">
                      <div>
                        <label>
                          LOGO OPACITY
                        </label>

                        <strong>
                          {Math.round(
                            state.settings
                              .backgroundOpacity *
                              100,
                          )}
                          %
                        </strong>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="0.5"
                        step="0.01"
                        value={
                          state.settings
                            .backgroundOpacity
                        }
                        onChange={(e) =>
                          updateSettings({
                            backgroundOpacity:
                              Number(
                                e
                                  .target
                                  .value,
                              ),
                          })
                        }
                      />
                    </div>

                    <div className="tg-preview-watermark">
                      <img
                        src={
                          state.settings
                            .backgroundLogo
                        }
                        alt=""
                        style={{
                          opacity:
                            state.settings
                              .backgroundOpacity,
                        }}
                      />
                    </div>
                  </div>

                  <div className="tg-control-card">
                    <div className="tg-card-heading">
                      <Settings />
                      <div>
                        <h3>
                          SYSTEM
                        </h3>
                        <span>
                          Website behaviour
                        </span>
                      </div>
                    </div>

                    <ToggleRow
                      label="SHOW FIRST-TIME ADMIN SETUP"
                      value={
                        state.settings
                          .showAdminSetup
                      }
                      onChange={(
                        value,
                      ) =>
                        updateSettings({
                          showAdminSetup:
                            value,
                        })
                      }
                    />

                    <ToggleRow
                      label="MAINTENANCE MODE"
                      value={
                        state.settings
                          .maintenanceMode
                      }
                      onChange={(
                        value,
                      ) =>
                        updateSettings({
                          maintenanceMode:
                            value,
                        })
                      }
                    />
                  </div>

                  <div className="tg-control-card danger-card">
                    <div className="tg-card-heading">
                      <KeyRound />
                      <div>
                        <h3>
                          LOCAL RESET
                        </h3>
                        <span>
                          Development only
                        </span>
                      </div>
                    </div>

                    <p>
                      Remove local admin data
                      and return the site to
                      first-time setup.
                    </p>

                    <button
                      className="tg-danger-button"
                      onClick={
                        resetLocalAdmin
                      }
                    >
                      <Trash2 size={16} />
                      RESET ADMIN DATA
                    </button>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>

        {/* NOTICE */}
        {notice && (
          <div className="tg-notice">
            <Check size={17} />
            {notice}
          </div>
        )}
      </div>
    </>
  );
}

/* =========================================================
   OVERVIEW
========================================================= */

function Overview({
  state,
  totalPoints,
  onNavigate,
}: {
  state: AdminState;
  totalPoints: number;
  onNavigate: (page: string) => void;
}) {
  const live =
    state.tournaments.filter(
      (item) =>
        item.status === "LIVE",
    ).length;

  const upcoming =
    state.tournaments.filter(
      (item) =>
        item.status === "UPCOMING",
    ).length;

  const completed =
    state.matches.filter(
      (item) =>
        item.status === "COMPLETED",
    ).length;

  return (
    <section>
      <div className="tg-overview-hero">
        <div>
          <div className="tg-overline">
            <span />
            COMMAND CENTER
          </div>

          <h2>
            CONTROL
            <br />
            <em>EVERYTHING.</em>
          </h2>

          <p>
            Tournament operations,
            standings, players, matches and
            website settings — all from one
            place.
          </p>
        </div>

        <div className="tg-command-mark">
          <Zap size={52} />
        </div>
      </div>

      <div className="tg-dashboard-stats">
        <DashboardStat
          icon={<Trophy />}
          label="TOURNAMENTS"
          value={state.tournaments.length}
          sub={`${live} live · ${upcoming} upcoming`}
          onClick={() =>
            onNavigate(
              "tournaments",
            )
          }
        />

        <DashboardStat
          icon={<Users />}
          label="TEAMS"
          value={state.teams.length}
          sub="Registered teams"
          onClick={() =>
            onNavigate("teams")
          }
        />

        <DashboardStat
          icon={<Gamepad2 />}
          label="MATCHES"
          value={state.matches.length}
          sub={`${completed} completed`}
          onClick={() =>
            onNavigate(
              "matches",
            )
          }
        />

        <DashboardStat
          icon={<Crown />}
          label="PLAYERS"
          value={state.players.length}
          sub={`${totalPoints} team points`}
          onClick={() =>
           onNavigate(
              "players",
            )
          }
        />
      </div>

      <div className="tg-overview-grid">
        <div className="tg-panel">
          <PanelTitle
            title="LIVE EVENTS"
            icon={<Activity />}
          />

          {state.tournaments
            .filter(
              (item) =>
                item.status === "LIVE",
            )
            .map((item) => (
              <div
                className="tg-live-event"
                key={item.id}
              >
                <div className="tg-live-dot" />

                <div>
                  <strong>
                    {item.name}
                  </strong>

                  <span>
                    {item.phase} ·{" "}
                    {item.matches} MATCHES
                  </span>
                </div>

                <div className="tg-live-pill">
                  LIVE
                </div>
              </div>
            ))}

          {live === 0 && (
            <div className="tg-empty-box">
              No live events.
            </div>
          )}
        </div>

        <div className="tg-panel">
          <PanelTitle
            title="QUICK ACTIONS"
            icon={<Zap />}
          />

          <QuickAction
            label="Create tournament"
            icon={<Trophy />}
            onClick={() =>
              onNavigate(
                "tournaments",
              )
            }
          />

          <QuickAction
            label="Update match"
            icon={<Gamepad2 />}
            onClick={() =>
              onNavigate(
                "matches",
              )
            }
          />

          <QuickAction
            label="Manage teams"
            icon={<Users />}
            onClick={() =>
              onNavigate("teams")
            }
          />

          <QuickAction
            label="Invite admin"
            icon={<UserPlus />}
            onClick={() =>
              onNavigate(
                "invites",
              )
            }
          />
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   TOURNAMENT EDITOR
========================================================= */

function TournamentEditor({
  tournament,
  editing,
  onEdit,
  onClose,
  onUpdate,
  onDelete,
}: {
  tournament: Tournament;
  editing: boolean;
  onEdit: () => void;
  onClose: () => void;
  onUpdate: (
    patch: Partial<Tournament>,
  ) => void;
  onDelete: () => void;
}) {
  if (!editing) {
    return (
      <div className="tg-data-row">
        <div className="tg-row-main">
          <div className="tg-row-icon">
            <Trophy />
          </div>

          <div>
            <strong>
              {tournament.name}
            </strong>

            <span>
              {tournament.phase} ·{" "}
              {tournament.matches} MATCHES ·{" "}
              {tournament.teams} TEAMS
            </span>
          </div>
        </div>

        <div className="tg-row-status">
          <StatusBadge
            status={
              tournament.status
            }
          />

          <VisibilityButton
            visible={
              tournament.visible
            }
            onClick={() =>
              onUpdate({
                visible:
                  !tournament.visible,
              })
            }
          />

          <button
            className="tg-row-button"
            onClick={onEdit}
          >
            <Edit3 size={16} />
          </button>

          <button
            className="tg-row-button danger"
            onClick={onDelete}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tg-edit-card">
      <div className="tg-edit-head">
        <div>
          <span>EDIT TOURNAMENT</span>
          <strong>
            {tournament.id}
          </strong>
        </div>

        <button
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>

      <div className="tg-form-grid">
        <Field
          label="NAME"
          value={
            tournament.name
          }
          onChange={(value) =>
            onUpdate({
              name: value,
            })
          }
        />

        <Field
          label="PHASE"
          value={
            tournament.phase
          }
          onChange={(value) =>
            onUpdate({
              phase: value,
            })
          }
        />

        <div>
          <label>STATUS</label>

          <select
            value={
              tournament.status
            }
            onChange={(e) =>
              onUpdate({
                status:
                  e.target
                    .value as TournamentStatus,
              })
            }
          >
            <option>
              LIVE
            </option>

            <option>
              UPCOMING
            </option>

            <option>
              ARCHIVED
            </option>
          </select>
        </div>

        <NumberField
          label="MATCHES"
          value={
            tournament.matches
          }
          onChange={(value) =>
            onUpdate({
              matches: value,
            })
          }
        />

        <Field
          label="TEAMS"
          value={String(
            tournament.teams,
          )}
          onChange={(value) =>
            onUpdate({
              teams: value,
            })
          }
        />
      </div>

      <div className="tg-edit-actions">
        <ToggleRow
          label="VISIBLE ON WEBSITE"
          value={
            tournament.visible
          }
          onChange={(value) =>
            onUpdate({
              visible: value,
            })
          }
        />

        <button
          className="tg-save-button"
          onClick={onClose}
        >
          <Save size={16} />
          DONE
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   TEAM EDITOR
========================================================= */

function TeamEditor({
  team,
  editing,
  onEdit,
  onClose,
  onUpdate,
  onDelete,
}: {
  team: Team;
  editing: boolean;
  onEdit: () => void;
  onClose: () => void;
  onUpdate: (
    patch: Partial<Team>,
  ) => void;
  onDelete: () => void;
}) {
  if (!editing) {
    return (
      <div className="tg-data-row">
        <div className="tg-row-main">
          <div className="tg-team-logo">
            {team.logo ? (
              <img
                src={team.logo}
                alt=""
              />
            ) : (
              team.shortName
                .slice(0, 2)
            )}
          </div>

          <div>
            <strong>
              {team.name}
            </strong>

            <span>
              {team.shortName} ·{" "}
              {team.players} PLAYERS
            </span>
          </div>
        </div>

        <div className="tg-team-numbers">
          <div>
            <small>RANK</small>
            <strong>
              #{team.position}
            </strong>
          </div>

          <div>
            <small>KILLS</small>
            <strong>
              {team.kills}
            </strong>
          </div>

          <div>
            <small>POINTS</small>
            <strong>
              {team.points}
            </strong>
          </div>

          <VisibilityButton
            visible={
              team.visible
            }
            onClick={() =>
              onUpdate({
                visible:
                  !team.visible,
              })
            }
          />

          <button
            className="tg-row-button"
            onClick={onEdit}
          >
            <Edit3 size={16} />
          </button>

          <button
            className="tg-row-button danger"
            onClick={onDelete}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tg-edit-card">
      <div className="tg-edit-head">
        <div>
          <span>EDIT TEAM</span>
          <strong>
            {team.id}
          </strong>
        </div>

        <button
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>

      <div className="tg-form-grid">
        <Field
          label="TEAM NAME"
          value={team.name}
          onChange={(value) =>
            onUpdate({
              name: value,
            })
          }
        />

        <Field
          label="SHORT NAME"
          value={
            team.shortName
          }
          onChange={(value) =>
            onUpdate({
              shortName: value,
            })
          }
        />

        <Field
          label="LOGO PATH"
          value={team.logo}
          onChange={(value) =>
            onUpdate({
              logo: value,
            })
          }
        />

        <NumberField
          label="PLAYERS"
          value={team.players}
          onChange={(value) =>
            onUpdate({
              players: value,
            })
          }
        />

        <NumberField
          label="KILLS"
          value={team.kills}
          onChange={(value) =>
            onUpdate({
              kills: value,
            })
          }
        />

        <NumberField
          label="POINTS"
          value={team.points}
          onChange={(value) =>
            onUpdate({
              points: value,
            })
          }
        />

        <NumberField
          label="CURRENT RANK"
          value={team.position}
          onChange={(value) =>
            onUpdate({
              position: value,
            })
          }
        />
      </div>

      <div className="tg-edit-actions">
        <ToggleRow
          label="VISIBLE ON WEBSITE"
          value={
            team.visible
          }
          onChange={(value) =>
            onUpdate({
              visible: value,
            })
          }
        />

        <button
          className="tg-save-button"
          onClick={onClose}
        >
          <Save size={16} />
          DONE
        </button>
      </div>
    </div>
  );
}

/*
=========================================================
   MATCH EDITOR
========================================================= */

function MatchEditor({
  match,
  editing,
  onEdit,
  onClose,
  onUpdate,
  onDelete,
}: {
  match: Match;
  editing: boolean;
  onEdit: () => void;
  onClose: () => void;
  onUpdate: (
    patch: Partial<Match>,
  ) => void;
  onDelete: () => void;
}) {
  if (!editing) {
    return (
      <div className="tg-data-row">
        <div className="tg-row-main">
          <div className="tg-match-number">
            {String(
              match.number,
            ).padStart(2, "0")}
          </div>

          <div>
            <strong>
              MATCH {match.number}
            </strong>

            <span>
              {match.map} ·{" "}
              {match.date}
            </span>
          </div>
        </div>

        <div className="tg-team-numbers">
          <div>
            <small>STATUS</small>
            <StatusBadge
              status={
                match.status
              }
            />
          </div>

          <div>
            <small>KILLS</small>
            <strong>
              {match.kills}
            </strong>
          </div>

          <div>
            <small>POINTS</small>
            <strong>
              {match.points}
            </strong>
          </div>

          <VisibilityButton
            visible={
              match.visible
            }
            onClick={() =>
              onUpdate({
                visible:
                  !match.visible,
              })
            }
          />

          <button
            className="tg-row-button"
            onClick={onEdit}
          >
            <Edit3 size={16} />
          </button>

          <button
            className="tg-row-button danger"
            onClick={onDelete}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tg-edit-card">
      <div className="tg-edit-head">
        <div>
          <span>EDIT MATCH</span>
          <strong>
            MATCH {match.number}
          </strong>
        </div>

        <button
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>

      <div className="tg-form-grid">
        <NumberField
          label="MATCH NUMBER"
          value={match.number}
          onChange={(value) =>
            onUpdate({
              number: value,
            })
          }
        />

        <Field
          label="MAP"
          value={match.map}
          onChange={(value) =>
            onUpdate({
              map: value,
            })
          }
        />

        <div>
          <label>STATUS</label>

          <select
            value={
              match.status
            }
            onChange={(e) =>
              onUpdate({
                status:
                  e.target
                    .value as Match["status"],
              })
            }
          >
            <option>
              UPCOMING
            </option>

            <option>
              LIVE
            </option>

            <option>
              COMPLETED
            </option>
          </select>
        </div>

        <NumberField
          label="TEAMS"
          value={match.teams}
          onChange={(value) =>
            onUpdate({
              teams: value,
            })
          }
        />

        <NumberField
          label="KILLS"
          value={match.kills}
          onChange={(value) =>
            onUpdate({
              kills: value,
            })
          }
        />

        <NumberField
          label="POINTS"
          value={match.points}
          onChange={(value) =>
            onUpdate({
              points: value,
            })
          }
        />

        <Field
          label="DATE"
          value={match.date}
          onChange={(value) =>
            onUpdate({
              date: value,
            })
          }
        />
      </div>

      <div className="tg-edit-actions">
        <ToggleRow
          label="VISIBLE ON WEBSITE"
          value={
            match.visible
          }
          onChange={(value) =>
            onUpdate({
              visible: value,
            })
          }
        />

        <button
          className="tg-save-button"
          onClick={onClose}
        >
          <Save size={16} />
          DONE
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   PLAYER EDITOR
========================================================= */

function PlayerEditor({
  player,
  teams,
  editing,
  onEdit,
  onClose,
  onUpdate,
  onDelete,
}: {
  player: Player;
  teams: Team[];
  editing: boolean;
  onEdit: () => void;
  onClose: () => void;
  onUpdate: (
    patch: Partial<Player>,
  ) => void;
  onDelete: () => void;
}) {
  if (!editing) {
    return (
      <div className="tg-data-row">
        <div className="tg-row-main">
          <div className="tg-player-image">
            {player.image ? (
              <img
                src={player.image}
                alt=""
              />
            ) : (
              player.name
                .slice(0, 1)
                .toUpperCase()
            )}
          </div>

          <div>
            <strong>
              {player.name}
            </strong>

            <span>
              {player.role} ·{" "}
              {player.team}
            </span>
          </div>
        </div>

        <div className="tg-team-numbers">
          <div>
            <small>KILLS</small>
            <strong>
              {player.kills}
            </strong>
          </div>

          <div>
            <small>MATCHES</small>
            <strong>
              {player.matches}
            </strong>
          </div>

          <VisibilityButton
            visible={
              player.visible
            }
            onClick={() =>
              onUpdate({
                visible:
                  !player.visible,
              })
            }
          />

          <button
            className="tg-row-button"
            onClick={onEdit}
          >
            <Edit3 size={16} />
          </button>

          <button
            className="tg-row-button danger"
            onClick={onDelete}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tg-edit-card">
      <div className="tg-edit-head">
        <div>
          <span>EDIT PLAYER</span>
          <strong>
            {player.id}
          </strong>
        </div>

        <button
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>

      <div className="tg-form-grid">
        <Field
          label="PLAYER NAME"
          value={
            player.name
          }
          onChange={(value) =>
            onUpdate({
              name: value,
            })
          }
        />

        <div>
          <label>TEAM</label>

          <select
            value={
              player.team
            }
            onChange={(e) =>
              onUpdate({
                team:
                  e.target
                    .value,
              })
            }
          >
            {teams.map(
              (team) => (
                <option
                  key={
                    team.id
                  }
                >
                  {team.name}
                </option>
              ),
            )}
          </select>
        </div>

        <Field
          label="ROLE"
          value={
            player.role
          }
          onChange={(value) =>
            onUpdate({
              role: value,
            })
          }
        />

        <Field
          label="IMAGE PATH"
          value={
            player.image
          }
          onChange={(value) =>
            onUpdate({
              image: value,
            })
          }
        />

        <NumberField
          label="KILLS"
          value={
            player.kills
          }
          onChange={(value) =>
            onUpdate({
              kills: value,
            })
          }
        />

        <NumberField
          label="MATCHES"
          value={
            player.matches
          }
          onChange={(value) =>
            onUpdate({
              matches: value,
            })
          }
        />
      </div>

      <div className="tg-edit-actions">
        <ToggleRow
          label="VISIBLE ON WEBSITE"
          value={
            player.visible
          }
          onChange={(value) =>
            onUpdate({
              visible: value,
            })
          }
        />

        <button
          className="tg-save-button"
          onClick={onClose}
        >
          <Save size={16} />
          DONE
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   ADMINS
========================================================= */

function Admins({
  state,
  currentAdmin,
  setState,
  showNotice,
}: {
  state: AdminState;
  currentAdmin?: AdminUser;
  setState: React.Dispatch<
    React.SetStateAction<AdminState>
  >;
  showNotice: (
    message: string,
  ) => void;
}) {
  function toggleAdmin(id: string) {
    if (
      id === currentAdmin?.id
    ) {
      showNotice(
        "You cannot disable your own account.",
      );
      return;
    }

    setState((prev) => ({
      ...prev,
      admins:
        prev.admins.map(
          (admin) =>
            admin.id === id
              ? {
                  ...admin,
                  active:
                    !admin.active,
                }
              : admin,
        ),
    }));
  }

  function changeRole(
    id: string,
    role: AdminRole,
  ) {
    setState((prev) => ({
      ...prev,
      admins:
        prev.admins.map(
          (admin) =>
            admin.id === id
              ? {
                  ...admin,
                  role,
                }
              : admin,
        ),
    }));
  }

  function deleteAdmin(
    id: string,
  ) {
    if (
      id === currentAdmin?.id
    ) {
      showNotice(
        "You cannot delete yourself.",
      );
      return;
    }

    if (
      !confirm(
        "Remove this admin?",
      )
    ) {
      return;
    }

    setState((prev) => ({
      ...prev,
      admins:
        prev.admins.filter(
          (admin) =>
            admin.id !== id,
        ),
    }));

    showNotice(
      "Admin removed.",
    );
  }

  return (
    <section>
      <SectionHeader
        eyebrow="ACCESS CONTROL"
        title="ADMINS"
        description="Control who can access the management system."
      />

      <div className="tg-admin-list">
        {state.admins.map(
          (admin) => (
            <div
              className="tg-data-row"
              key={admin.id}
            >
              <div className="tg-row-main">
                <div className="tg-admin-avatar-large">
                  {admin.name
                    .slice(0, 1)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {admin.name}
                  </strong>

                  <span>
                    {admin.email}
                  </span>
                </div>
              </div>

              <div className="tg-admin-controls">
                <select
                  value={
                    admin.role
                  }
                  disabled={
                    admin.role ===
                    "owner"
                  }
                  onChange={(e) =>
                    changeRole(
                      admin.id,
                      e.target
                        .value as AdminRole,
                    )
                  }
                >
                  <option value="owner">
                    OWNER
                  </option>

                  <option value="admin">
                    ADMIN
                  </option>

                  <option value="editor">
                    EDITOR
                  </option>

                  <option value="viewer">
                    VIEWER
                  </option>
                </select>

                <button
                  className={`tg-status-toggle ${
                    admin.active
                      ? "on"
                      : ""
                  }`}
                  onClick={() =>
                    toggleAdmin(
                      admin.id,
                    )
                  }
                >
                  {admin.active
                    ? "ACTIVE"
                    : "DISABLED"}
                </button>

                <button
                  className="tg-row-button danger"
                  onClick={() =>
                    deleteAdmin(
                      admin.id,
                    )
                  }
                >
                  <Trash2
                    size={16}
                  />
                </button>
              </div>
            </div>
          ),
        )}
      </div>

      <div className="tg-info-card">
        <Shield size={20} />

        <div>
          <strong>
            OWNER
          </strong>

          <p>
            The owner is the highest-level
            account and cannot be removed from
            this panel.
          </p>
        </div>
      </div>
    </section>
  );
}

/*
=========================================================
   ANALYTICS
========================================================= */

function Analytics({
  state,
}: {
  state: AdminState;
}) {
  const completed =
    state.matches.filter(
      (match) =>
        match.status ===
        "COMPLETED",
    );

  const kills =
    completed.reduce(
      (sum, match) =>
        sum + match.kills,
      0,
    );

  const points =
    completed.reduce(
      (sum, match) =>
        sum + match.points,
      0,
    );

  const average =
    completed.length
      ? (
          points /
          completed.length
        ).toFixed(1)
      : "0.0";

  const topTeam =
    [...state.teams].sort(
      (a, b) =>
        b.points -
        a.points,
    )[0];

  return (
    <section>
      <SectionHeader
        eyebrow="PERFORMANCE DATA"
        title="ANALYTICS"
        description="Quick overview of competition performance."
      />

      <div className="tg-dashboard-stats">
        <DashboardStat
          icon={<Gamepad2 />}
          label="COMPLETED MATCHES"
          value={
            completed.length
          }
          sub="Finished matches"
        />

        <DashboardStat
          icon={<Zap />}
          label="TOTAL KILLS"
          value={kills}
          sub="Across completed matches"
        />

        <DashboardStat
          icon={<BarChart3 />}
          label="TOTAL POINTS"
          value={points}
          sub="Recorded points"
        />

        <DashboardStat
          icon={<Activity />}
          label="AVG POINTS"
          value={average}
          sub="Per completed match"
        />
      </div>

      <div className="tg-panel">
        <PanelTitle
          title="TOP TEAM"
          icon={<Trophy />}
        />

        {topTeam ? (
          <div className="tg-top-team">
            <div className="tg-rank-big">
              #{topTeam.position}
            </div>

            <div className="tg-team-logo huge">
              {topTeam.logo ? (
                <img
                  src={
                    topTeam.logo
                  }
                  alt=""
                />
              ) : (
                topTeam.shortName
              )}
            </div>

            <div>
              <strong>
                {topTeam.name}
              </strong>

              <span>
                {topTeam.kills} KILLS ·{" "}
                {topTeam.points} POINTS
              </span>
            </div>
          </div>
        ) : (
          <div className="tg-empty-box">
            No team data.
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function AdminNavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`tg-nav-button ${
        active ? "active" : ""
      }`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>

      {active && (
        <ChevronRight
          size={15}
        />
      )}
    </button>
  );
}

function SectionHeader({
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
    <div className="tg-section-header">
      <div>
        <div className="tg-overline">
          <span />
          {eyebrow}
        </div>

        <h2>{title}</h2>

        <p>
          {description}
        </p>
      </div>

      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
}

function DashboardStat({
  icon,
  label,
  value,
  sub,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub: string;
  onClick?: () => void;
}) {
  return (
    <button
      className="tg-dashboard-stat"
      onClick={onClick}
    >
      <div className="tg-stat-icon">
        {icon}
      </div>

      <span>{label}</span>

      <strong>{value}</strong>

      <small>{sub}</small>

      <ChevronRight
        className="stat-arrow"
        size={17}
      />
    </button>
  );
}

function PanelTitle({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="tg-panel-title">
      <div>
        {icon}
        <span>{title}</span>
      </div>

      <MoreHorizontal
        size={19}
      />
    </div>
  );
}

function QuickAction({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className="tg-quick-action"
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
      <ChevronRight size={16} />
    </button>
  );
}

function StatusBadge
