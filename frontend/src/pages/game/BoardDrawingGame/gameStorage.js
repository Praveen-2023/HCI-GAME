/**
 * gameStorage.js
 * ──────────────────────────────────────────────────────────────────────────
 * Backend-connected persistence layer for BoardDrawingGame.
 * Uses the existing API service for authenticated requests.
 * ──────────────────────────────────────────────────────────────────────────
 */

import api from '../../../services/api';

// ── public API ────────────────────────────────────────────────────────────

/**
 * Start a new game record. Returns the gameId.
 * @param {object[]} shapePoints  The initial shape's normalised points array.
 */
export async function startGame(shapePoints = []) {
  try {
    const payload = {
      startedAt: new Date().toISOString(),
      bgCoordinates: shapePoints.map(p => ({ x: p.x, y: p.y })),
      gameIndex: 1, // Let backend or another logic handle numbering
    };
    const response = await api.post('/game/board-drawing/games', payload);
    return response.data.gameId;
  } catch (error) {
    console.error('[gameStorage] Failed to start game:', error);
    return null;
  }
}

/**
 * Record a single drawing attempt (try) inside a game.
 * @param {string}   gameId
 * @param {object}   attempt   ← the boardDrawingAttempt object from the game
 */
export async function recordTry(gameId, attempt) {
  if (!gameId) return;
  try {
    const pct = Math.round((attempt.completion ?? 0) * 100);
    const tryData = {
      tryIndex: attempt.attemptNumber ?? 1,
      shapeType: attempt.shapeType ?? attempt.requestedShape ?? 'unknown',
      hand: attempt.hand ?? 'Right',
      startedAt: attempt.startedAt ?? 0,
      endedAt: attempt.endedAt ?? 0,
      completed: attempt.success ?? false,
      percentComplete: pct,
      hits: attempt.hits ?? 0,
      total: attempt.total ?? 0,
      scoreAfter: attempt.scoreAfter ?? 0,
      bgCoordinates: (attempt.targetPath ?? []).map(p => ({ x: p.x, y: p.y })),
      gameCoordinates: (attempt.drawnPath ?? []).map(p => ({
        x: p.x,
        y: p.y,
        timestamp: p.timestamp,
      })),
    };
    await api.post(`/game/board-drawing/games/${gameId}/tries`, tryData);
  } catch (error) {
    console.error('[gameStorage] Failed to record try:', error);
  }
}

/**
 * Finalise a game after session ends.
 * @param {string}  gameId
 * @param {object}  summary  { score, reps, successRate, currentShapePoints, metrics }
 */
export async function finalizeGame(gameId, summary = {}) {
  if (!gameId) return;
  try {
    const payload = {
      endedAt: new Date().toISOString(),
      completed: true,
      totalScore: summary.score ?? 0,
      totalReps: summary.reps ?? 0,
      successRate: summary.successRate ?? 0,
    };
    
    // The previous local storage logic computed metrics on the frontend. 
    // Now we pass the gameMetrics object if provided or let the backend compute it if preferred.
    if (summary.gameMetrics) {
      payload.gameMetrics = summary.gameMetrics;
      payload.percentComplete = summary.gameMetrics.avgCompletion ?? 0;
    }
    
    if (summary.currentShapePoints?.length) {
      payload.bgCoordinates = summary.currentShapePoints.map(p => ({ x: p.x, y: p.y }));
    }
    
    await api.patch(`/game/board-drawing/games/${gameId}`, payload);
  } catch (error) {
    console.error('[gameStorage] Failed to finalize game:', error);
  }
}

/**
 * Update bgCoordinates on the active game whenever the shape changes.
 */
export async function updateBgCoordinates(gameId, shapePoints = []) {
  if (!gameId) return;
  try {
    const payload = {
      bgCoordinates: shapePoints.map(p => ({ x: p.x, y: p.y })),
    };
    await api.patch(`/game/board-drawing/games/${gameId}`, payload);
  } catch (error) {
    console.error('[gameStorage] Failed to update bg coordinates:', error);
  }
}

/** Return all stored games (newest first). */
export async function getAllGames(userId = null) {
  try {
    const url = userId ? `/game/board-drawing/games?userId=${userId}` : '/game/board-drawing/games';
    const response = await api.get(url);
    return response.data || [];
  } catch (error) {
    console.error('[gameStorage] Failed to get all games:', error);
    return [];
  }
}

/** Return a single game by id. */
export async function getGame(gameId) {
  if (!gameId) return null;
  try {
    const response = await api.get(`/game/board-drawing/games/${gameId}`);
    return response.data;
  } catch (error) {
    console.error('[gameStorage] Failed to get game:', error);
    return null;
  }
}

/** Delete a single game. */
export async function deleteGame(gameId) {
  if (!gameId) return;
  try {
    await api.delete(`/game/board-drawing/games/${gameId}`);
  } catch (error) {
    console.error('[gameStorage] Failed to delete game:', error);
  }
}

/** Wipe everything. */
export async function clearAll() {
  try {
    const games = await getAllGames();
    for (const game of games) {
      await deleteGame(game.gameId);
    }
  } catch (error) {
    console.error('[gameStorage] Failed to clear all:', error);
  }
}

/**
 * Export a game as a downloadable JSON file.
 */
export async function exportGameJson(gameId) {
  try {
    const game = await getGame(gameId);
    if (!game) return;
    const blob = new Blob([JSON.stringify(game, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game_${game.gameIndex || 1}_${game.gameId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('[gameStorage] Failed to export game json:', error);
  }
}

/**
 * Import a game JSON file (returns parsed object or null).
 * Caller is responsible for adding it to storage if desired.
 */
export async function importGameJson(file) {
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
export async function addImportedGame(gameObj) {
  try {
    // Send full object to POST endpoint or create an import endpoint.
    // Assuming backend POST /api/board-drawing/games supports full objects.
    await api.post('/game/board-drawing/games', gameObj);
    return true;
  } catch (error) {
    console.error('[gameStorage] Failed to import game:', error);
    return false;
  }
}
