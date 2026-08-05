NFL Live Stats Explorer

A lightweight tool that pulls live scores, game stats, and player stats for the NFL using ESPN's public sports API — no API key required.

## What it does

- **Live scores** — current week's games, scores, and status (pre-game, in-progress, final)
- **Game stats** — box scores, drive summaries, and play-by-play for a given game
- **Player stats** — season and game-level stats for individual athletes
- **Standings** — division/conference standings by season and week
- **Team info** — rosters, franchise history, logos

## Data source

Built on ESPN's `sports.core.api.espn.com` endpoint tree, which is unofficial and undocumented but widely used by the sports-dev community. The API is structured as a graph of resources connected by `$ref` links rather than one flat endpoint — you start at the league level and follow links down to the data you need.

```
League (NFL)
 └─ Season (e.g. 2025)
     └─ Season Type (Preseason / Regular / Postseason / Off Season)
         └─ Week
             └─ Events (games)
                 ├─ Competitions → Scores, Status
                 ├─ Box Score → Team & Player Stats
                 └─ Play-by-Play
```

Root endpoint:
```
GET http://sports.core.api.espn.com/v2/sports/football/leagues/nfl
```

Other useful entry points:

| Data | Endpoint pattern |
|---|---|
| Current scoreboard | `site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard` |
| Teams | `.../seasons/{year}/teams` |
| Standings | `.../seasons/{year}/types/{type}/groups/{id}/standings` |
| Athletes | `.../seasons/{year}/athletes` |
| Specific game summary | `site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event={gameId}` |

> Note: `sports.core.api.espn.com` (the "core" API used above) returns deeply linked `$ref` resources — good for exploring the full data graph. `site.api.espn.com` (the "site" API) returns flatter, more consumable JSON and is usually faster to build against for a live scores/stats app. Most projects like this end up using `site.api.espn.com` for the day-to-day calls and dip into the core API only for things the site API doesn't expose.

## How it works

1. Fetch the current week's scoreboard to list live/upcoming/completed games.
2. For a selected game, fetch the game summary endpoint to get box score, team stats, and player stats.
3. Poll the scoreboard/summary endpoints on an interval (e.g. every 30–60s) while a game is live to keep scores current.
4. Cache static data (teams, rosters, historical box scores) locally to avoid redundant calls.

## Tech stack

- [Language/framework — e.g. Python + Flask / Node.js + Express / React]
- `requests` / `fetch` for HTTP calls
- [Your storage choice, if any — SQLite, in-memory, etc.]
- [Your frontend, if any]

## Example usage

```
GET /scores?week=current
→ Returns all games for the current week with live scores and status

GET /game/{gameId}/stats
→ Returns box score and team stats for a specific game

GET /player/{athleteId}/stats?season=2025
→ Returns a player's season stats
```

## Setup

```bash
git clone <repo-url>
cd nfl-live-stats
[install steps]
[run steps]
```

## Roadmap / ideas

- [ ] Push/websocket updates instead of polling
- [ ] Historical trend charts per team/player
- [ ] Fantasy football scoring overlay
- [ ] Combine with the NL-to-SQL project dataset for natural-language querying of live stats

## Disclaimer

This project uses ESPN's public but unofficial API. It is not affiliated with or endorsed by ESPN, and the API's structure/availability may change without notice.
