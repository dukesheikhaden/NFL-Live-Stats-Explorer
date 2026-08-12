class ScoreboardApp {
  constructor() {
    this.api = new ApiClient();
    this.watchTimer = null;
    this.currentEventId = null;
    this.currentCompetitionId = null;
 
    this.scoreboardEl = document.getElementById("scoreboard");
    this.weekSelect = document.getElementById("week-select");
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
 
    this.weekSelect.addEventListener("change", () => this.loadScoreboard());
    this.refreshBtn.addEventListener("click", () => this.loadScoreboard());
    this.closeDetailBtn.addEventListener("click", () => this.closeGame());
 
    this.loadScoreboard();
  }
 
  async loadScoreboard() {
    this.scoreboardEl.innerHTML = "<p>Loading games...</p>";
 
    try {
      const data = await this.api.getScoreboard(this.weekSelect.value, 2, null);
      const events = data.events || [];
 
      if (events.length === 0) {
        this.scoreboardEl.innerHTML = "<p>No games found.</p>";
        return;
      }
 
      this.scoreboardEl.innerHTML = "";
      events.forEach((event) => this.scoreboardEl.appendChild(this.buildGameCard(event)));
    } catch (err) {
      this.scoreboardEl.innerHTML = "<p>Could not load games. Try refreshing.</p>";
      console.error(err);
    }
  }
 
  buildGameCard(event) {
    const comp = event.competitions[0];
    const home = comp.competitors.find((c) => c.homeAway === "home");
    const away = comp.competitors.find((c) => c.homeAway === "away");
 
    const status = comp.status.type;
    const isLive = status.state === "in";
    const homeScore = home.score || "-";
    const awayScore = away.score || "-";
 
    const card = document.createElement("div");
    card.className = "game-card";
    card.innerHTML = `
      <div class="status ${isLive ? "live" : ""}">${isLive ? "LIVE - " : ""}${status.shortDetail}</div>
      <div class="team-row"><span>${away.team.abbreviation}</span><span class="score">${awayScore}</span></div>
      <div class="team-row"><span>${home.team.abbreviation}</span><span class="score">${homeScore}</span></div>
    `;
 
    card.addEventListener("click", () => {
      const title = `${away.team.abbreviation} @ ${home.team.abbreviation}`;
      this.openGame(event.id, comp.id, title);
    });
 
    return card;
  }
 
 
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
      this.detailPlays.innerHTML = "<p>Could not load play by play.</p>";
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