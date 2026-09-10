# Total Gaming dashboard refresh

## User-facing result
- Vercel deployment serves the TanStack app instead of showing a platform 404.
- The first screen clearly shows the currently live Official or Scrims tournament.
- Official/Scrims switching updates the event list and current tournament.
- Compact event and stage selectors let fans drill into a stage without wasting space.
- Selected-stage cards show total points, rank/qualification status, kills, and placement points.
- Match history shows map, kills, position, points, and a Full stats action.
- Full stats opens a compact modal with the four players, photos, kills, damage, assists, and points.
- Top Fraggers ranks players from the selected stage.

## Implementation
- Add the missing Vercel/Nitro deployment configuration and keep the root route discoverable on direct loads.
- Extend the public data loading on the dashboard to include match results and player-match statistics.
- Recompose the home route around compact circuit controls, event/stage selection, summary cards, match rows, a player leaderboard, and an accessible details modal.
- Replace the old page-specific visual rules with a restrained professional esports system using the existing TG logo and image assets.
- Preserve the existing read-only public data model and admin route; use current tournament rows as event/stage records so the interface works with the existing data immediately.

## Validation
- Check direct preview navigation and the Vercel-style production output configuration.
- Verify Official/Scrims switching, stage selection, modal open/close, and responsive layouts in the browser.
- Run the project checks and confirm no new console errors.
