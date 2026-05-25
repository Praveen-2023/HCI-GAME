const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const User = require('../backend/src/models/user.model');
const BoardDrawingSession = require('../backend/src/models/boardDrawingSession.model');
const boardDrawingController = require('../backend/src/controllers/boardDrawing.controller');

async function test() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Database connected successfully!');

    // Find any user
    const user = await User.findOne({ type: 'patient' });
    if (!user) {
      console.error('No patient user found in database to test with!');
      process.exit(1);
    }
    console.log(`Found test user: ${user.name || user.email} (ID: ${user._id})`);

    // Prepare a mock request body simulating SaveExitButton payload
    const req = {
      user: { id: user._id.toString() },
      body: {
        gameType: 'board_drawing',
        gameName: 'Board Drawing Test',
        sessionScore: 10,
        playData: [
          {
            responsetime: 1500,
            correct: 1,
            score: 10,
            accuracy: 0.9,
            attempts: 1,
            successes: 1,
            eventName: 'attempt_success',
            shapeType: 'circle',
            hand: 'right'
          }
        ],
        systemMetrics: {
          avgFps: 60,
          avgLatency: 5,
          userAgent: 'Mozilla/5.0 ...',
          resolution: '1920x1080'
        },
        coordinates: [
          { x: 100, y: 100, screenX: 100, screenY: 100, timestamp: 1000 },
          { x: 105, y: 105, screenX: 105, screenY: 105, timestamp: 1100 }
        ],
        boardDrawingAttempts: [
          {
            attemptNumber: 1,
            requestedShape: 'circle',
            shapeType: 'circle',
            hand: 'right',
            startedAt: 1000,
            endedAt: 2500,
            canvasWidth: 800,
            canvasHeight: 600,
            targetPath: [
              { x: 100, y: 100, screenX: 100, screenY: 100, timestamp: 1000 }
            ],
            drawnPath: [
              { x: 100, y: 100, screenX: 100, screenY: 100, timestamp: 1000 },
              { x: 105, y: 105, screenX: 105, screenY: 105, timestamp: 1100 }
            ],
            pathMatrix: [
              [100, 100, 1000],
              [105, 105, 1100]
            ],
            hits: 1,
            total: 1,
            completion: 1,
            success: true,
            scoreAfter: 10
          }
        ]
      }
    };

    const res = {
      statusCode: 200,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        console.log(`Response Status: ${this.statusCode}`);
        console.log('Response Data:', JSON.stringify(data, null, 2));
      }
    };

    console.log('Invoking saveBoardDrawingSession controller function...');
    await boardDrawingController.saveBoardDrawingSession(req, res);

  } catch (error) {
    console.error('Test execution error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
  }
}

test();
