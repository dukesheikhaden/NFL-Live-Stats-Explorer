class ApiClient {
  constructor() {
    this.functionsBase = "/.netlify/functions";
  }
 
  async getJSON(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}: ${url}`);
      }
      return res.json();
    } catch (err) {
      console.error("ApiClient error:", err.message);
      throw err;
    }
  }
 
  getScoreboard(week, seasontype, year) {
    const params = [];
    if (week) params.push(`week=${week}`);
    if (seasontype) params.push(`seasontype=${seasontype}`);
    if (year) params.push(`year=${year}`);
 
    const query = params.length > 0 ? `?${params.join("&")}` : "";
    return this.getJSON(`${this.functionsBase}/scoreboard${query}`);
  }
 
  getPlays(eventId, competitionId) {
    return this.getJSON(`${this.functionsBase}/plays?eventId=${eventId}&competitionId=${competitionId}`);
  }
 
  getGameStatus(eventId, competitionId) {
    return this.getJSON(`${this.functionsBase}/game-status?eventId=${eventId}&competitionId=${competitionId}`);
  }
}