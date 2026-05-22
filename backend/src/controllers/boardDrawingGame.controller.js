const BoardDrawingGame = require('../models/boardDrawingGame.model');
const BoardDrawingTry = require('../models/boardDrawingTry.model');

// POST /api/board-drawing/games
exports.startGame = async (req, res) => {
  try {
    const { startedAt, bgCoordinates, gameIndex } = req.body;
    const gameId = req.body.gameId || require('crypto').randomUUID();

    const newGame = new BoardDrawingGame({
      gameId,
      user: req.user.id,
      gameIndex,
      startedAt: startedAt || new Date(),
      bgCoordinates: bgCoordinates || []
    });

    await newGame.save();
    res.status(201).json({ gameId });
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({ error: 'Failed to start game' });
  }
};

// PATCH /api/board-drawing/games/:gameId
exports.updateGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const updateData = req.body;
    
    await BoardDrawingGame.findOneAndUpdate(
      { gameId, user: req.user.id },
      { $set: updateData },
      { new: true }
    );
    
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({ error: 'Failed to update game' });
  }
};

// POST /api/board-drawing/games/:gameId/tries
exports.recordTry = async (req, res) => {
  try {
    const { gameId } = req.params;
    const tryData = req.body;
    const tryId = tryData.tryId || require('crypto').randomUUID();

    const newTry = new BoardDrawingTry({
      ...tryData,
      tryId,
      gameId,
      user: req.user.id
    });

    await newTry.save();
    res.status(201).json({ tryId });
  } catch (error) {
    console.error('Error recording try:', error);
    res.status(500).json({ error: 'Failed to record try' });
  }
};

// GET /api/board-drawing/games
exports.getGames = async (req, res) => {
  try {
    const userId = req.query.userId && req.user.role === 'therapist' 
      ? req.query.userId 
      : req.user.id;
      
    // Without tries[] for list performance
    const games = await BoardDrawingGame.find({ user: userId })
      .sort({ startedAt: -1 })
      .limit(Number(req.query.limit) || 20)
      .skip(Number(req.query.offset) || 0)
      .lean();
      
    res.status(200).json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
};

// GET /api/board-drawing/games/:gameId
exports.getGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const game = await BoardDrawingGame.findOne({ gameId }).lean();
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Auth check: only user or therapist can view
    if (game.user.toString() !== req.user.id && req.user.role !== 'therapist') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const tries = await BoardDrawingTry.find({ gameId }).sort({ tryIndex: 1 }).lean();
    
    res.status(200).json({ ...game, tries });
  } catch (error) {
    console.error('Error fetching game details:', error);
    res.status(500).json({ error: 'Failed to fetch game details' });
  }
};

// DELETE /api/board-drawing/games/:gameId
exports.deleteGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    // Auth check
    const game = await BoardDrawingGame.findOne({ gameId, user: req.user.id });
    if (!game) {
      return res.status(404).json({ error: 'Game not found or forbidden' });
    }

    await BoardDrawingGame.deleteOne({ gameId });
    await BoardDrawingTry.deleteMany({ gameId });
    
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({ error: 'Failed to delete game' });
  }
};
