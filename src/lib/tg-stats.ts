import type {
  Match,
  MatchResult,
  Player,
  PlayerMatchStat,
} from "@/lib/tg-data";

export type TournamentStats = {
  matchesPlayed: number;
  totalKills: number;
  placementPoints: number;
  totalPoints: number;
};

export function calculateTournamentStats(
  matches: Match[],
  results: MatchResult[],
): TournamentStats {
  const totalKills = matches.reduce(
    (sum, match) =>
      sum + Number(match.totalKills ?? 0),
    0,
  );

  const placementPoints =
    results.reduce(
      (sum, result) =>
        sum + Number(result.points ?? 0),
      0,
    ) - totalKills;

  const safePlacementPoints =
    Math.max(0, placementPoints);

  return {
    matchesPlayed: matches.length,
    totalKills,
    placementPoints:
      safePlacementPoints,
    totalPoints:
      totalKills + safePlacementPoints,
  };
}

export function calculatePlayerStats(
  players: Player[],
  playerMatchStats: PlayerMatchStat[],
) {
  return players
    .map((player) => {
      const stats =
        playerMatchStats.filter(
          (item) =>
            item.playerId === player.id,
        );

      const kills = stats.reduce(
        (sum, item) =>
          sum + Number(item.kills ?? 0),
        0,
      );

      const points = stats.reduce(
        (sum, item) =>
          sum + Number(item.points ?? 0),
        0,
      );

      const matches =
        stats.length > 0
          ? stats.length
          : Number(player.matches ?? 0);

      return {
        ...player,
        kills:
          stats.length > 0
            ? kills
            : Number(player.kills ?? 0),
        matches,
        points,
        kd:
          matches > 0
            ? kills / matches
            : 0,
      };
    })
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.kills - a.kills,
    );
}

export function getTopPlayer(
  players: Player[],
  playerMatchStats: PlayerMatchStat[],
) {
  return (
    calculatePlayerStats(
      players,
      playerMatchStats,
    )[0] ?? null
  );
}
