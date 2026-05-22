const User = require('../models/user.model');
const GameSession = require('../models/gameSession.model');

const toNumber = (value, fallback = undefined) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const normalizePoint = (point) => ({
  x: toNumber(point?.x, 0),
  y: toNumber(point?.y, 0),
  screenX: toNumber(point?.screenX),
  screenY: toNumber(point?.screenY),
  timestamp: toNumber(point?.timestamp, 0)
});

const normalizePath = (path) => {
  if (!Array.isArray(path)) return [];
  return path
    .filter((point) => point && point.x !== undefined && point.y !== undefined)
    .map(normalizePoint);
};

const normalizeAttempt = (attempt, index) => {
  const drawnPath = normalizePath(attempt?.drawnPath);
  const targetPath = normalizePath(attempt?.targetPath);
  const total = toNumber(attempt?.total, targetPath.length);
  const hits = toNumber(attempt?.hits, 0);
  const completion = toNumber(
    attempt?.completion,
    total > 0 ? hits / total : 0
  );

  return {
    attemptNumber: toNumber(attempt?.attemptNumber, index + 1),
    requestedShape: attempt?.requestedShape || attempt?.shapeType || 'shape',
    shapeType: attempt?.shapeType || attempt?.requestedShape || 'shape',
    hand: attempt?.hand,
    startedAt: toNumber(attempt?.startedAt, 0),
    endedAt: toNumber(attempt?.endedAt, 0),
    canvasWidth: toNumber(attempt?.canvasWidth, 0),
    canvasHeight: toNumber(attempt?.canvasHeight, 0),
    targetPath,
    drawnPath,
    pathMatrix: Array.isArray(attempt?.pathMatrix)
      ? attempt.pathMatrix
          .filter((row) => Array.isArray(row))
          .map((row) => row.map((value) => toNumber(value, 0)))
      : drawnPath.map((point) => [
          point.screenX ?? point.x,
          point.screenY ?? point.y,
          point.timestamp ?? 0
        ]),
    hits,
    total,
    completion,
    success: Boolean(attempt?.success),
    scoreAfter: toNumber(attempt?.scoreAfter, 0)
  };
};

const normalizePlayData = (playData) => {
  if (!Array.isArray(playData)) return [];
  return playData.map((entry) => ({
    responsetime: toNumber(entry?.responsetime, 0),
    correct: toNumber(entry?.correct),
    score: toNumber(entry?.score),
    accuracy: toNumber(entry?.accuracy),
    attempts: toNumber(entry?.attempts),
    successes: toNumber(entry?.successes),
    eventName: entry?.eventName,
    shapeType: entry?.shapeType,
    hand: entry?.hand
  }));
};

exports.saveBoardDrawingSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      gameName,
      sessionScore,
      playData,
      systemMetrics,
      coordinates,
      boardDrawingAttempts
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const attempts = Array.isArray(boardDrawingAttempts)
      ? boardDrawingAttempts
          .map(normalizeAttempt)
          .filter((attempt) => attempt.drawnPath.length > 1)
      : [];

    const newSession = new GameSession({
      user: userId,
      gameType: 'board_drawing',
      gameName: gameName || 'Board Drawing',
      time: new Date(),
      sessionScore: toNumber(sessionScore, 0),
      systemMetrics: systemMetrics || undefined,
      coordinates: normalizePath(coordinates),
      boardDrawingAttempts: attempts,
      play: normalizePlayData(playData),
      mode: 'laptop'
    });

    await newSession.save();

    user.totalScore += newSession.sessionScore || 0;
    user.level = user.calculateLevel();
    await user.save();

    res.json({
      success: true,
      message: 'Board Drawing session saved successfully',
      sessionScore: newSession.sessionScore || 0,
      totalScore: user.totalScore,
      level: user.level,
      attemptsSaved: attempts.length,
      session: newSession
    });
  } catch (error) {
    console.error('Save board drawing session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving Board Drawing session',
      error: error.message
    });
  }
};

exports.getBoardDrawingSessions = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const sessions = await GameSession.find({
      user: userId,
      gameType: 'board_drawing'
    }).sort({ time: -1 });

    res.json({
      success: true,
      sessions,
      totalSessions: sessions.length
    });
  } catch (error) {
    console.error('Get board drawing sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching Board Drawing sessions',
      error: error.message
    });
  }
};
