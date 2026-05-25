const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  timestamp: { type: Number }
}, { _id: false });

const shapeBreakdownSchema = new mongoose.Schema({
  attempts: { type: Number, default: 0 },
  successes: { type: Number, default: 0 }
}, { _id: false });

const gameMetricsSchema = new mongoose.Schema({
  totalAttempts: { type: Number, default: 0 },
  successes: { type: Number, default: 0 },
  avgCompletion: { type: Number, default: 0 },
  shapeBreakdown: {
    type: Map,
    of: shapeBreakdownSchema,
    default: {}
  }
}, { _id: false });

const boardDrawingGameSchema = new mongoose.Schema({
  gameId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  gameIndex: { type: Number, required: true },
  startedAt: { type: Date, required: true },
  endedAt: { type: Date },
  completed: { type: Boolean, required: true, default: false },
  percentComplete: { type: Number, required: true, default: 0 },
  totalScore: { type: Number, required: true, default: 0 },
  totalReps: { type: Number, required: true, default: 0 },
  successRate: { type: Number, required: true, default: 0 },
  bgCoordinates: [pointSchema],
  gameMetrics: { type: gameMetricsSchema, default: () => ({}) }
}, { timestamps: true });

module.exports = mongoose.model('BoardDrawingGame', boardDrawingGameSchema);
