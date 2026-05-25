const mongoose = require('mongoose');

const jointCoordinateSchema = new mongoose.Schema({
  x: Number,
  y: Number
}, { _id: false });

const coordinateSchema = new mongoose.Schema({
  x: Number,
  y: Number,
  screenX: Number,
  screenY: Number,
  timestamp: Number,
  zone: String,
  color: String,
  leftShoulder: jointCoordinateSchema,
  rightShoulder: jointCoordinateSchema,
  leftElbow: jointCoordinateSchema,
  rightElbow: jointCoordinateSchema,
  leftWrist: jointCoordinateSchema,
  rightWrist: jointCoordinateSchema,
  palm: jointCoordinateSchema
}, { _id: false });

const boardDrawingAttemptSchema = new mongoose.Schema({
  attemptNumber: { type: Number },
  requestedShape: { type: String },
  shapeType: { type: String },
  hand: { type: String },
  startedAt: { type: Number },
  endedAt: { type: Number },
  canvasWidth: { type: Number },
  canvasHeight: { type: Number },
  targetPath: [coordinateSchema],
  drawnPath: [coordinateSchema],
  pathMatrix: [[Number]],
  hits: { type: Number },
  total: { type: Number },
  completion: { type: Number },
  success: { type: Boolean },
  scoreAfter: { type: Number },
  traceQuality: { type: Number },
  pointsEarned: { type: Number },
  safeZoneRadius: { type: Number },
  warningZoneRadius: { type: Number }
}, { _id: false });

const playEntrySchema = new mongoose.Schema({
  responsetime: { type: Number },
  correct: { type: Number }, // -1, 0, 1 for legacy support
  score: { type: Number },
  accuracy: { type: Number },
  attempts: { type: Number },
  successes: { type: Number },
  eventName: { type: String },
  shapeType: { type: String },
  hand: { type: String }
}, { _id: false });

const systemMetricsSchema = new mongoose.Schema({
  avgFps: { type: Number },
  avgLatency: { type: Number },
  userAgent: { type: String },
  resolution: { type: String }
}, { _id: false });

const gameSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  gameType: { type: String, required: true, index: true },
  gameName: { type: String, required: true },
  time: { type: Date, default: Date.now, required: true },
  levelspan: { type: Number }, // Mainly used for Piano Game
  sessionScore: { type: Number },
  
  // Developer / System Metrics
  systemMetrics: systemMetricsSchema,

  // Interaction / Movement data (e.g. for Board Drawing, Fruit Fetch)
  coordinates: [coordinateSchema],
  boardDrawingAttempts: [boardDrawingAttemptSchema],
  play: [playEntrySchema]

}, { timestamps: true });

module.exports = mongoose.model('GameSession', gameSessionSchema);
