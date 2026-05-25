const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');
const boardDrawingController = require('../controllers/boardDrawing.controller');
const { protect } = require('../middleware/auth.middleware');

const boardDrawingGameController = require('../controllers/boardDrawingGame.controller');

// Legacy board drawing endpoints (keep for backwards compatibility)
router.post('/board-drawing/save-session', protect, boardDrawingController.saveBoardDrawingSession);
router.get('/board-drawing/sessions/:userId?', protect, boardDrawingController.getBoardDrawingSessions);

// New Board Drawing Analytics API
router.post('/board-drawing/games', protect, boardDrawingGameController.startGame);
router.patch('/board-drawing/games/:gameId', protect, boardDrawingGameController.updateGame);
router.post('/board-drawing/games/:gameId/tries', protect, boardDrawingGameController.recordTry);
router.get('/board-drawing/games', protect, boardDrawingGameController.getGames);
router.get('/board-drawing/games/:gameId', protect, boardDrawingGameController.getGame);
router.delete('/board-drawing/games/:gameId', protect, boardDrawingGameController.deleteGame);

router.post('/save-session', protect, gameController.saveGameSession);
router.get('/levelspan/:userId?', protect, gameController.getLevelSpan);
router.put('/levelspan/:userId', protect, gameController.updateLevelSpan);
router.get('/analytics/:userId', protect, gameController.getDetailedAnalytics);
router.get('/stats/:userId?', protect, gameController.getBasicStats);

module.exports = router;
