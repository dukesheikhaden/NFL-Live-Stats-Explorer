# NFL Live Stats Explorer

A lightweight, browser-based tool that pulls live scores, game stats, and player stats for the NFL using ESPN's public sports API. Built with vanilla JavaScript and HTML — no backend, no framework, no API key.

## What it does

- **Live scores** — current week's games, scores, and status (pre-game, in-progress, final)
- **Game stats** — box scores, drive summaries, and play-by-play for a given game
- **Player stats** — season and game-level stats for individual athletes
- **Standings** — division/conference standings by season and week
- **Team info** — rosters, franchise history, logos

## How it will work

1. The page will fetch ESPN's scoreboard endpoint to list live/upcoming/completed games for the current week.
2. When a user selects a game, the page will fetch that game's summary data to pull box score, team stats, and player stats.
3. While a game is live, the page will periodically re-fetch scores to keep them current.
4. Static data (teams, rosters) will be cached client-side to avoid redundant calls.

## Setup

```bash
git clone <repo-url>
cd nfl-live-stats
# open index.html directly, or serve locally:
npx serve .
```

## Disclaimer

This project uses ESPN's public but unofficial API. It is not affiliated with or endorsed by ESPN, and the API's structure/availability may change without notice.
