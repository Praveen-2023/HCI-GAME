const mongoose = require('mongoose');

const playEntrySchema = new mongoose.Schema({
  responsetime: { type: Number },
  correct: { type: Number },
  score: { type: Number },
  accuracy: { type: Number },
  attempts: { type: Number },
  successes: { type: Number },
  eventName: { type: String },
  shapeType: { type: String },
  hand: { type: String }
}, { _id: false });

const coordinateSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  timestamp: { type: Number, required: true }
}, { _id: false });

const systemMetricsSchema = new mongoose.Schema({
  avgFps: { type: Number },
  avgLatency: { type: Number },
  userAgent: { type: String },
  resolution: { type: String }
}, { _id: false });

const pianoSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  gameType: { type: String, required: true, default: 'type1', index: true },
  gameName: { type: String, required: true, default: 'Piano Reaction Game' },
  time: { type: Date, default: Date.now, required: true },
  levelspan: { type: Number },
  sessionScore: { type: Number },
  
  systemMetrics: systemMetricsSchema,

  play: [playEntrySchema],

  coordinates: [coordinateSchema],

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

module.exports = mongoose.model('PianoSession', pianoSessionSchema);
