import { gameService } from './gameService';

const STORAGE_KEY = 'hci_game_session_buffer';

/**
 * Local game session buffer.
 * Stores session data in localStorage during gameplay,
 * then flushes to the backend when the user clicks "Save & Exit".
 */
const gameSessionBuffer = {
  /**
   * Initialize a new local session buffer for a game.
   * Clears any previous buffer for this game type.
   */
  init(gameType, gameName) {
    const session = {
      gameType,
      gameName,
      startedAt: new Date().toISOString(),
      playData: [],
      coordinates: [],
      systemMetrics: {
        userAgent: navigator.userAgent,
        resolution: `${window.innerWidth}x${window.innerHeight}`
      },
      sessionScore: 0,
      levelspan: null,
      meta: {} // any game-specific metadata
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  },

  /**
   * Get the current buffered session from localStorage.
   * Returns null if no session exists.
   */
  get() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Append a play entry to the local buffer.
   */
  addPlayEntry(entry) {
    const session = this.get();
    if (!session) return;
    session.playData.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  },

  /**
   * Append coordinate data to the local buffer.
   */
  addCoordinates(coords) {
    const session = this.get();
    if (!session) return;
    if (Array.isArray(coords)) {
      session.coordinates.push(...coords);
    } else {
      session.coordinates.push(coords);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  },

  /**
   * Update session-level fields (score, levelspan, meta, etc.)
   */
  update(fields) {
    const session = this.get();
    if (!session) return;
    Object.assign(session, fields);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  },

  /**
   * Flush the buffered session to the backend via gameService,
   * then clear localStorage. Returns the API response.
   */
  async saveAndExit() {
    const session = this.get();
    if (!session) {
      throw new Error('No buffered session to save');
    }

    const payload = {
      gameType: session.gameType,
      gameName: session.gameName,
      sessionScore: session.sessionScore || 0,
      levelspan: session.levelspan,
      playData: session.playData,
      systemMetrics: session.systemMetrics,
      coordinates: session.coordinates.length > 0 ? session.coordinates : undefined
    };

    const response = await gameService.saveGameSession(payload);
    localStorage.removeItem(STORAGE_KEY);
    return response;
  },

  /**
   * Discard the buffered session without saving.
   */
  discard() {
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Check if there is an unsaved session in the buffer.
   */
  hasPending() {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }
};

export default gameSessionBuffer;
