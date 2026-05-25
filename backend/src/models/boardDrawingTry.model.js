const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  timestamp: { type: Number }
}, { _id: false });

const boardDrawingTrySchema = new mongoose.Schema({
  tryId: { type: String, required: true, unique: true },
  gameId: { type: String, required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tryIndex: { type: Number, required: true },
  shapeType: { type: String, required: true },
  hand: { type: String, enum: ['Left', 'Right', 'unknown'], required: true },
  startedAt: { type: Number },
  endedAt: { type: Number },
  completed: { type: Boolean, required: true, default: false },
  percentComplete: { type: Number, required: true, default: 0 },
  hits: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 },
  scoreAfter: { type: Number, required: true, default: 0 },
  bgCoordinates: [pointSchema],
  gameCoordinates: [pointSchema]
}, { timestamps: true });

module.exports = mongoose.model('BoardDrawingTry', boardDrawingTrySchema);
