const mongoose = require('mongoose');

const coordinateSchema = new mongoose.Schema({
  x: Number,
  y: Number,
  screenX: Number,
  screenY: Number,
  timestamp: Number
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
  scoreAfter: { type: Number }
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
  play: [playEntrySchema],

  // New fields for Piano Reaction Game modes
  mode: { type: String, enum: ['laptop', 'mobile'], default: 'laptop' },
  fingerTimeouts: {
    thumb: { type: Number, default: 5 },
    index: { type: Number, default: 5 },
    middle: { type: Number, default: 5 },
    ring: { type: Number, default: 5 },
    pinky: { type: Number, default: 5 },
    leftPinky: { type: Number, default: 5 },
    leftRing: { type: Number, default: 5 },
    leftMiddle: { type: Number, default: 5 },
    leftIndex: { type: Number, default: 5 },
    rightIndex: { type: Number, default: 5 },
    rightMiddle: { type: Number, default: 5 },
    rightRing: { type: Number, default: 5 },
    rightPinky: { type: Number, default: 5 }
  },
  laptopMovements: [{
    fromKey: String,
    toKey: String,
    dx: Number,
    dy: Number,
    distance: Number,
    fromX: Number,
    fromY: Number,
    toX: Number,
    toY: Number
  }],
  mobileMovements: [{
    key: String,
    finger: String,
    expectedFinger: String,
    responsetime: Number,
    correct: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('GameSession', gameSessionSchema);
