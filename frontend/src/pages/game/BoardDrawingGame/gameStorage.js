/**
 * gameStorage.js
 * ──────────────────────────────────────────────────────────────────────────
 * Local-storage persistence layer for BoardDrawingGame.
 *
 * DATA MODEL (one entry per "play-through / sub-play"):
 *
 * GAME  ← one per "Start Therapy" click
 *   ├─ gameId          : string  (uuid-like)
 *   ├─ gameIndex       : number  (1-based across all stored games)
 *   ├─ startedAt       : ISO string
 *   ├─ endedAt         : ISO string | null
 *   ├─ completed       : boolean
 *   ├─ percentComplete : number  (0-100)
 *   ├─ totalScore      : number
 *   ├─ totalReps       : number
 *   ├─ successRate     : number  (0-100)
 *   ├─ bgCoordinates   : Point[] ← shape outline points (normalised 0-1)
 *   ├─ gameMetrics     : { totalAttempts, successes, avgCompletion, shapeBreakdown }
 *   └─ tries           : Try[]
 *
 * TRY  ← one per individual drawing attempt inside a game
 *   ├─ tryId           : string
 *   ├─ tryIndex        : number  (1-based within this game)
 *   ├─ shapeType       : string
 *   ├─ hand            : "Left" | "Right"
 *   ├─ startedAt       : number  (session-seconds)
 *   ├─ endedAt         : number
 *   ├─ completed       : boolean
 *   ├─ percentComplete : number  (0-100)
 *   ├─ hits            : number
 *   ├─ total           : number
 *   ├─ scoreAfter      : number
 *   ├─ bgCoordinates   : Point[] ← the shape points for THIS try (normalised)
 *   └─ gameCoordinates : Point[] ← the yellow drawn path (normalised)
 *
 * Point = { x: number, y: number, timestamp?: number }
 * ──────────────────────────────────────────────────────────────────────────
 */

const STORAGE_KEY = 'boardDrawingGames';

// ── helpers ──────────────────────────────────────────────────────────────

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(games) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  } catch (e) {
    console.warn('[gameStorage] Could not persist to localStorage:', e);
  }
}

// ── public API ────────────────────────────────────────────────────────────

/**
 * Start a new game record. Returns the gameId.
 * @param {object[]} shapePoints  The initial shape's normalised points array.
 */
export function startGame(shapePoints = []) {
  const games = loadAll();
  const game = {
    gameId: uid(),
    gameIndex: games.length + 1,
    startedAt: new Date().toISOString(),
    endedAt: null,
    completed: false,
    percentComplete: 0,
    totalScore: 0,
    totalReps: 0,
    successRate: 0,
    bgCoordinates: shapePoints.map(p => ({ x: p.x, y: p.y })),
    gameMetrics: {
      totalAttempts: 0,
      successes: 0,
      avgCompletion: 0,
      shapeBreakdown: {},
    },
    tries: [],
  };
  games.push(game);
  saveAll(games);
  return game.gameId;
}

/**
 * Record a single drawing attempt (try) inside a game.
 * @param {string}   gameId
 * @param {object}   attempt   ← the boardDrawingAttempt object from the game
 */
export function recordTry(gameId, attempt) {
  const games = loadAll();
  const game = games.find(g => g.gameId === gameId);
  if (!game) return;

  const pct = Math.round((attempt.completion ?? 0) * 100);

  const tryRecord = {
    tryId: uid(),
    tryIndex: game.tries.length + 1,
    shapeType: attempt.shapeType ?? attempt.requestedShape ?? 'unknown',
    hand: attempt.hand ?? 'Right',
    startedAt: attempt.startedAt ?? 0,
    endedAt: attempt.endedAt ?? 0,
    completed: attempt.success ?? false,
    percentComplete: pct,
    hits: attempt.hits ?? 0,
    total: attempt.total ?? 0,
    scoreAfter: attempt.scoreAfter ?? 0,
    // bgCoordinates = the shape outline points for this try
    bgCoordinates: (attempt.targetPath ?? []).map(p => ({ x: p.x, y: p.y })),
    // gameCoordinates = the yellow drawn path
    gameCoordinates: (attempt.drawnPath ?? []).map(p => ({
      x: p.x,
      y: p.y,
      timestamp: p.timestamp,
    })),
  };

  game.tries.push(tryRecord);
  saveAll(games);
}

/**
 * Finalise a game after session ends.
 * @param {string}  gameId
 * @param {object}  summary  { score, reps, successRate, currentShapePoints }
 */
export function finalizeGame(gameId, summary = {}) {
  const games = loadAll();
  const game = games.find(g => g.gameId === gameId);
  if (!game) return;

  const tries = game.tries;
  const successes = tries.filter(t => t.completed).length;
  const total = tries.length;
  const avgCompletion = total > 0
    ? Math.round(tries.reduce((s, t) => s + t.percentComplete, 0) / total)
    : 0;

  // shape breakdown
  const shapeBreakdown = {};
  tries.forEach(t => {
    if (!shapeBreakdown[t.shapeType]) {
      shapeBreakdown[t.shapeType] = { attempts: 0, successes: 0 };
    }
    shapeBreakdown[t.shapeType].attempts++;
    if (t.completed) shapeBreakdown[t.shapeType].successes++;
  });

  game.endedAt = new Date().toISOString();
  game.completed = true;
  game.percentComplete = total > 0 ? Math.round((successes / total) * 100) : 0;
  game.totalScore = summary.score ?? 0;
  game.totalReps = summary.reps ?? 0;
  game.successRate = summary.successRate ?? 0;
  // update bgCoordinates with final shape if provided
  if (summary.currentShapePoints?.length) {
    game.bgCoordinates = summary.currentShapePoints.map(p => ({ x: p.x, y: p.y }));
  }
  game.gameMetrics = { totalAttempts: total, successes, avgCompletion, shapeBreakdown };

  saveAll(games);
}

/**
 * Update bgCoordinates on the active game whenever the shape changes.
 */
export function updateBgCoordinates(gameId, shapePoints = []) {
  const games = loadAll();
  const game = games.find(g => g.gameId === gameId);
  if (!game) return;
  game.bgCoordinates = shapePoints.map(p => ({ x: p.x, y: p.y }));
  saveAll(games);
}

/** Return all stored games (newest first). */
export function getAllGames() {
  return loadAll().slice().reverse();
}

/** Return a single game by id. */
export function getGame(gameId) {
  return loadAll().find(g => g.gameId === gameId) ?? null;
}

/** Delete a single game. */
export function deleteGame(gameId) {
  saveAll(loadAll().filter(g => g.gameId !== gameId));
}

/** Wipe everything. */
export function clearAll() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Export a game as a downloadable JSON file.
 */
export function exportGameJson(gameId) {
  const game = getGame(gameId);
  if (!game) return;
  const blob = new Blob([JSON.stringify(game, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `game_${game.gameIndex}_${game.gameId}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import a game JSON file (returns parsed object or null).
 * Caller is responsible for adding it to storage if desired.
 */
export function importGameJson(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try { resolve(JSON.parse(e.target.result)); }
      catch { reject(new Error('Invalid JSON')); }
    };
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsText(file);
  });
}

/**
 * Add an imported game object into storage (avoids duplicates by gameId).
 */
export function addImportedGame(gameObj) {
  const games = loadAll();
  if (games.find(g => g.gameId === gameObj.gameId)) return false; // already exists
  games.push(gameObj);
  saveAll(games);
  return true;
}
