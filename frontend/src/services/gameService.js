import api from "./api";

export const gameService = {
  saveGameSession: async (sessionData) =>
    (await api.post("/game/save-session", sessionData)).data,
  saveBoardDrawingSession: async (sessionData) =>
    (await api.post("/game/board-drawing/save-session", sessionData)).data,
  getBoardDrawingSessions: async (userId) => {
    const url = userId ? `/game/board-drawing/sessions/${userId}` : "/game/board-drawing/sessions";
    return (await api.get(url)).data;
  },
  getLevelSpan: async (userId) => {
    const url = userId ? `/game/levelspan/${userId}` : "/game/levelspan";
    return (await api.get(url)).data;
  },
  updateLevelSpan: async (userId, levelspan) =>
    (await api.put(`/game/levelspan/${userId}`, { levelspan })).data,
  getDetailedAnalytics: async (userId) =>
    (await api.get(`/game/analytics/${userId}`)).data,
  getBasicStats: async (userId) => {
    const url = userId ? `/game/stats/${userId}` : "/game/stats";
    return (await api.get(url)).data;
  },
};
