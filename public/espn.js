class ApiClient {
  constructor() {
    this.base = "https://site.api.espn.com/apis/site/v2/sports/football/nfl";
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
    if (year) params.push(`dates=${year}`);

    const query = params.length > 0 ? `?${params.join("&")}` : "";
    return this.getJSON(`${this.base}/scoreboard${query}`);
  }

  getSummary(eventId) {
    return this.getJSON(`${this.base}/summary?event=${eventId}`);
  }

  async getPlays(eventId) {
    const data = await this.getSummary(eventId);
    return { items: data.plays || [] };
  }

  async getGameStatus(eventId) {
    const data = await this.getSummary(eventId);
    const competition = (data.header && data.header.competitions && data.header.competitions[0]) || {};
    const status = competition.status || {};
    return {
      type: status.type || {},
      period: status.period,
      displayClock: status.displayClock,
    };
  }
}