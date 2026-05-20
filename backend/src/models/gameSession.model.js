const mongoose = require('mongoose');

const coordinateSchema = new mongoose.Schema({
  x: Number,
  y: Number,
  timestamp: Number
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
  play: [playEntrySchema]
}, { timestamps: true });

module.exports = mongoose.model('GameSession', gameSessionSchema);
