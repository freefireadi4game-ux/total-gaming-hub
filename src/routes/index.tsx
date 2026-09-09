import { createFileRoute } from "@tanstack/react-router";
import teamImage from "@/assets/total-gaming-team.jpg";
import mvpImage from "@/assets/total-gaming-mvp.jpg";

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
  { id: "match-1", number: 1, map: "Bermuda", position: 1, kills: 10, mvp: "Player 1" },
  { id: "match-2", number: 2, map: "Purgatory", position: 3, kills: 8, mvp: "Player 1" },
  { id: "match-3", number: 3, map: "Alpine", position: 5, kills: 6, mvp: "Player 2" },
];

function getPoints(match: Match) {
  return match.kills + (placementPoints[match.position] ?? 0);
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Total Gaming Fan Desk — Free Fire Stats" },
      { name: "description", content: "Follow Total Gaming's Free Fire matches, tournament points and daily MVP performances." },
      { property: "og:title", content: "Total Gaming Fan Desk — Free Fire Stats" },
      { property: "og:description", content: "Follow Total Gaming's Free Fire matches, tournament points and daily MVP performances." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const totalKills = matches.reduce((total, match) => total + match.kills, 0);
  const positionPoints = matches.reduce((total, match) => total + (placementPoints[match.position] ?? 0), 0);
  const totalPoints = totalKills + positionPoints;
  const averagePoints = (totalPoints / matches.length).toFixed(1);

  return (
    <div className="dashboard-bg relative min-h-screen overflow-hidden bg-ink font-body text-snow antialiased">
      <div className="beam-cyan beam-float pointer-events-none absolute -left-16 -top-24 h-[520px] w-[360px] rounded-3xl" />
      <div className="beam-lime beam-float-reverse pointer-events-none absolute -right-24 top-40 h-[620px] w-[320px] rounded-3xl" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="#top" className="flex items-center gap-3" aria-label="Total Gaming home">
          <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-accent to-lime font-display text-lg text-ink">T</span>
          <span className="leading-none">
            <span className="block font-display text-lg tracking-wide">TOTAL GAMING</span>
            <span className="block text-[10px] uppercase tracking-[0.3em] text-frost">India · Free Fire</span>
          </span>
        </a>
        <nav className="hidden items-center gap-7 text-sm text-frost md:flex" aria-label="Dashboard sections">
          <a href="#top" className="text-snow transition-colors hover:text-accent">Dashboard</a>
          <a href="#matches" className="transition-colors hover:text-snow">Matches</a>
          <a href="#mvp" className="transition-colors hover:text-snow">MVPs</a>
          <a href="#tournament" className="transition-colors hover:text-snow">Tournament</a>
        </nav>
        <span className="rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-accent">
          Live
        </span>
      </header>

      <main id="top" className="relative z-10">
        <section className="reveal-up mx-auto grid max-w-6xl items-center gap-10 px-6 pt-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-snow/5 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-frost">
              <span className="size-1.5 rounded-full bg-lime shadow-[0_0_10px_2px] shadow-lime/60" />
              Live tournament data · Day 1
            </span>
            <h1 className="mt-5 font-display text-[64px] leading-[0.92] tracking-tight sm:text-[84px]">TOTAL GAMING</h1>
            <p className="mt-3 max-w-md text-frost">
              India&apos;s Free Fire squad, tracked match by match — kills, placement points and MVP performances in one place.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <Stat label="Today kills" value={totalKills.toString()} />
              <Stat label="Best position" value="#1" />
              <Stat label="Tournament pts" value={totalPoints.toString()} highlight />
            </div>
          </div>

          <div className="relative">
            <img src={teamImage} alt="Total Gaming players competing together" width={1080} height={1280} className="aspect-[4/5] w-full rounded-2xl object-cover object-center ring-1 ring-line" />
            <div className="absolute -bottom-5 -left-5 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-[0.2em] text-frost">Season rank</p>
              <p className="font-display text-2xl text-accent">#1</p>
            </div>
          </div>
        </section>

        <section id="matches" className="reveal-up mx-auto max-w-6xl scroll-mt-8 px-6 pt-16 [animation-delay:120ms]">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl tracking-wide">DAILY MATCH FEED</h2>
              <p className="text-sm text-frost">Every match, every kill, auto-tallied.</p>
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-frost">{matches.length} matches</span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-snow/[0.03]">
            <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr] gap-2 border-b border-line bg-snow/[0.04] px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-frost max-[640px]:grid-cols-[1.5fr_0.7fr_0.7fr_0.8fr]">
              <span>Match</span><span>Kills</span><span>Position</span><span>Points</span><span className="max-[640px]:hidden">Match MVP</span>
            </div>
            {[...matches].reverse().map((match) => (
              <div key={match.id} className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr] gap-2 border-b border-line/70 px-5 py-4 transition-colors last:border-b-0 hover:bg-snow/[0.04] max-[640px]:grid-cols-[1.5fr_0.7fr_0.7fr_0.8fr]">
                <div>
                  <p className="font-semibold">Match {match.number}</p>
                  <p className="text-xs text-frost">{match.map}</p>
                </div>
                <p className="font-mono text-lg">{match.kills}</p>
                <p className="font-mono text-lg">#{match.position}</p>
                <p className="font-mono text-lg text-accent">{getPoints(match)}</p>
                <p className="text-sm text-snow max-[640px]:hidden">{match.mvp}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-frost">Points = kills + placement points · Sample match data from the uploaded team structure</p>
        </section>

        <section id="tournament" className="reveal-up mx-auto grid max-w-6xl scroll-mt-8 gap-5 px-6 py-14 lg:grid-cols-[1.5fr_1fr] [animation-delay:220ms]">
          <div className="rounded-2xl border border-line bg-snow/[0.03] p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-frost">Ongoing tournament</p>
                <h2 className="mt-1 font-display text-3xl tracking-wide">FFMIC FALL 2026</h2>
              </div>
              <span className="rounded-full bg-lime/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-lime">Live</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Metric label="Total kills" value={totalKills.toString()} />
              <Metric label="Kills × 1" value={totalKills.toString()} />
              <Metric label="Position pts" value={positionPoints.toString()} />
            </div>
            <div className="mt-6 flex items-center justify-between rounded-xl border border-lime/30 bg-lime/10 px-5 py-4">
              <p className="text-sm uppercase tracking-[0.2em] text-lime">Total score</p>
              <p className="font-mono text-4xl font-bold text-lime">{totalPoints}</p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-frost">
              <span>{matches.length} matches recorded</span>
              <span>{averagePoints} avg / match</span>
            </div>
          </div>

          <div id="mvp" className="relative scroll-mt-8 overflow-hidden rounded-2xl border border-accent/30 bg-accent/10 p-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-accent">Tournament MVP</p>
            <div className="mt-4 flex items-center gap-4">
              <img src={mvpImage} alt="Total Gaming player portrait" width={512} height={512} loading="lazy" className="size-20 shrink-0 rounded-xl object-cover ring-1 ring-line" />
              <div>
                <p className="font-display text-3xl tracking-wide">PLAYER 1</p>
                <p className="text-sm text-frost">Rusher · 9 tournament kills</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg bg-snow/5 py-3">
                <p className="font-mono text-2xl font-bold text-snow">9</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-frost">Kills</p>
              </div>
              <div className="rounded-lg bg-snow/5 py-3">
                <p className="font-mono text-2xl font-bold text-snow">3</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-frost">Matches</p>
              </div>
            </div>
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-lime">Daily MVP · Day 1</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <div>
                  <p className="font-semibold text-snow">PLAYER 1</p>
                  <p className="text-xs text-frost">Top rusher across today&apos;s matches</p>
                </div>
                <p className="font-mono text-xl text-lime">9 kills</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 mx-auto flex max-w-6xl flex-wrap justify-between gap-3 border-t border-line px-6 py-5 text-[10px] uppercase tracking-[0.2em] text-frost">
        <span>Total Gaming · Fan dashboard</span>
        <span>Live-style sample data</span>
      </footer>
    </div>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 backdrop-blur-sm ${highlight ? "border-lime/30 bg-lime/10" : "border-line bg-snow/[0.04]"}`}>
      <p className={`text-[10px] uppercase tracking-[0.2em] ${highlight ? "text-lime" : "text-frost"}`}>{label}</p>
      <p className={`mt-1 font-mono text-4xl font-bold ${highlight ? "text-lime" : "text-snow"}`}>{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-frost">{label}</p>
      <p className="mt-1 font-mono text-3xl font-bold">{value}</p>
    </div>
  );
}