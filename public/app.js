class ScoreboardApp {
  constructor() {
    this.api = new ApiClient();
    this.watchTimer = null;
    this.currentEventId = null;
    this.currentCompetitionId = null;

    this.scoreboardEl = document.getElementById("scoreboard");
    this.weekSelect = document.getElementById("week-select");
    this.yearSelect = document.getElementById("year-select");
    this.refreshBtn = document.getElementById("refresh-btn");
    this.gameDetailEl = document.getElementById("game-detail");
    this.detailTitle = document.getElementById("detail-title");
    this.detailStatus = document.getElementById("detail-status");
    this.detailPlays = document.getElementById("detail-plays");
    this.closeDetailBtn = document.getElementById("close-detail");

    for (let w = 1; w <= 18; w++) {
      const opt = document.createElement("option");
      opt.value = w;
      opt.textContent = `Week ${w}`;
      this.weekSelect.appendChild(opt);
    }

    const currentYear = 2026;
    for (let y = currentYear; y >= currentYear - 3; y--) {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = `${y} Season`;
      this.yearSelect.appendChild(opt);
    }
    this.yearSelect.value = currentYear - 1;
    this.weekSelect.value = 1;

    this.weekSelect.addEventListener("change", () => this.loadScoreboard());
    this.yearSelect.addEventListener("change", () => this.loadScoreboard());
    this.refreshBtn.addEventListener("click", () => this.loadScoreboard());
    this.closeDetailBtn.addEventListener("click", () => this.closeGame());

    this.loadScoreboard();
  }

  // --- scoreboard ---

  async loadScoreboard() {
    this.scoreboardEl.innerHTML = "<p class=\"message\">Loading games...</p>";

    try {
      const data = await this.api.getScoreboard(this.weekSelect.value, 2, this.yearSelect.value);
      const events = data.events || [];

      if (events.length === 0) {
        this.scoreboardEl.innerHTML = "<p class=\"message\">No games found.</p>";
        return;
      }

      this.scoreboardEl.innerHTML = "";
      events.forEach((event) => this.scoreboardEl.appendChild(this.buildGameCard(event)));
    } catch (err) {
      this.scoreboardEl.innerHTML = "<p class=\"message\">Could not load games. Try refreshing.</p>";
      console.error(err);
    }
  }

  buildGameCard(event) {
    const comp = event.competitions[0];
    const home = comp.competitors.find((c) => c.homeAway === "home");
    const away = comp.competitors.find((c) => c.homeAway === "away");

    const status = comp.status.type;
    const isLive = status.state === "in";
    const isFinal = status.state === "post";
    const homeScore = home.score || "-";
    const awayScore = away.score || "-";
    const venue = (comp.venue && comp.venue.fullName) || "";
    const homeRecord = this.getRecord(home);
    const awayRecord = this.getRecord(away);

    const card = document.createElement("div");
    card.className = "game-card";
    card.innerHTML = `
      <div class="status-block">
        <div class="status ${isLive ? "live" : ""}">${isLive ? "LIVE" : status.shortDetail}</div>
        ${venue ? `<div class="venue">${venue}</div>` : ""}
      </div>
      <div class="matchup-row">
        <div class="team-col">
          <img class="team-logo" src="${away.team.logo || ""}" alt="${away.team.abbreviation}" />
          <div class="team-name">${away.team.shortDisplayName}</div>
          <div class="team-record">${awayRecord}</div>
        </div>
        <div class="score-col">
          ${isFinal ? `<span class="wl ${away.winner ? "win" : "loss"}">${away.winner ? "W" : "L"}</span>` : ""}
          <span class="score">${awayScore}</span>
          <span class="vs">vs</span>
          <span class="score">${homeScore}</span>
          ${isFinal ? `<span class="wl ${home.winner ? "win" : "loss"}">${home.winner ? "W" : "L"}</span>` : ""}
        </div>
        <div class="team-col">
          <img class="team-logo" src="${home.team.logo || ""}" alt="${home.team.abbreviation}" />
          <div class="team-name">${home.team.shortDisplayName}</div>
          <div class="team-record">${homeRecord}</div>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      const title = `${away.team.shortDisplayName} @ ${home.team.shortDisplayName}`;
      this.openGame(event.id, comp.id, title);
    });

    return card;
  }

  getRecord(competitor) {
    const records = competitor.records || [];
    const overall = records.find((r) => r.name === "overall" || r.type === "total");
    return overall ? overall.summary : "";
  }

  // --- game detail ---

  async openGame(eventId, competitionId, title) {
    this.scoreboardEl.classList.add("hidden");
    this.gameDetailEl.classList.remove("hidden");
    this.detailTitle.textContent = title;
    this.detailStatus.textContent = "Loading...";
    this.detailPlays.innerHTML = "";

    if (this.watchTimer) clearInterval(this.watchTimer);

    this.currentEventId = eventId;
    this.currentCompetitionId = competitionId;

    this.updateStatus();
    this.watchTimer = setInterval(() => this.updateStatus(), 15000);

    try {
      const data = await this.api.getPlays(eventId, competitionId);
      this.renderPlays(data);
    } catch (err) {
      this.detailPlays.innerHTML = "<p class=\"message\">Could not load play by play.</p>";
      console.error(err);
    }
  }

  async updateStatus() {
    try {
      const status = await this.api.getGameStatus(this.currentEventId, this.currentCompetitionId);
      const period = status.period || "";
      const clock = status.displayClock || "";
      this.detailStatus.textContent = `${status.type.shortDetail} - Q${period} ${clock}`;
    } catch (err) {
      this.detailStatus.textContent = "Status unavailable";
      console.error(err);
    }
  }

  renderPlays(data) {
    const items = data.items || [];
    const recent = items.slice(-25).reverse();

    if (recent.length === 0) {
      this.detailPlays.innerHTML = "<p class=\"message\">No play by play available.</p>";
      return;
    }

    this.detailPlays.innerHTML = recent
      .map((play) => `<div class="play">${play.text || "No detail"}</div>`)
      .join("");
  }

  closeGame() {
    if (this.watchTimer) clearInterval(this.watchTimer);
    this.gameDetailEl.classList.add("hidden");
    this.scoreboardEl.classList.remove("hidden");
  }
}

const app = new ScoreboardApp();