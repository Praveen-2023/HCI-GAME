const User = require('../models/user.model');
const GameSession = require('../models/gameSession.model');

// Update level span (editable by doctor and caretaker)
exports.updateLevelSpan = async (req, res) => {
  try {
    const { userId } = req.params;
    const { levelspan } = req.body;
    const requesterId = req.user.id;

    if (!levelspan || levelspan < 1 || levelspan > 10) {
      return res.status(400).json({
        success: false,
        message: 'Level span must be between 1 and 10 seconds'
      });
    }

    const requester = await User.findById(requesterId);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Only doctor or caretaker can update
    if (requester.type !== 'doctor' && requester.type !== 'caretaker') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors and caretakers can update level span'
      });
    }

    targetUser.currentlevelspan = levelspan;
    await targetUser.save();

    res.json({
      success: true,
      message: 'Level span updated successfully',
      currentlevelspan: targetUser.currentlevelspan
    });
  } catch (error) {
    console.error('Update level span error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating level span',
      error: error.message
    });
  }
};

// Get level span
exports.getLevelSpan = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const user = await User.findById(userId).select('currentlevelspan');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      currentlevelspan: user.currentlevelspan
    });
  } catch (error) {
    console.error('Get level span error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching level span',
      error: error.message
    });
  }
};

// Save game session
exports.saveGameSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      gameType,
      gameName,
      levelspan, 
      playData,
      systemMetrics,
      coordinates,
      sessionScore: clientSessionScore
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const type = gameType || 'type1';
    const name = gameName || 'Reaction Game';

    // Calculate score: correct = +10, incorrect = -5 (For legacy Piano game)
    let sessionScore = clientSessionScore || 0;
    if (clientSessionScore === undefined && playData && type === 'type1') {
      playData.forEach(entry => {
        if (entry.correct === 1) sessionScore += 10;
        else if (entry.correct === -1) sessionScore -= 5;
      });
      if (sessionScore < 0) sessionScore = 0;
    }

    const newSession = new GameSession({
      user: userId,
      gameType: type,
      gameName: name,
      time: new Date(),
      levelspan: levelspan,
      sessionScore: sessionScore,
      systemMetrics: systemMetrics || undefined,
      coordinates: coordinates || undefined,
      play: playData || []
    });

    await newSession.save();

    user.totalScore += sessionScore;
    user.level = user.calculateLevel();

    await user.save();

    res.json({
      success: true,
      message: 'Game session saved successfully',
      sessionScore,
      totalScore: user.totalScore,
      level: user.level
    });
  } catch (error) {
    console.error('Save session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving game session',
      error: error.message
    });
  }
};

// Get detailed analytics (for doctors only)
exports.getDetailedAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user.id;

    const requester = await User.findById(requesterId);

    if (requester.type !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can view detailed analytics'
      });
    }

    const user = await User.findById(userId).select('-password -resetOTP -resetOTPExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const sessions = await GameSession.find({ user: userId }).sort({ time: 1 });
    
    // Group by game type
    const grouped = sessions.reduce((acc, session) => {
      if (!acc[session.gameType]) {
        acc[session.gameType] = { type: session.gameType, name: session.gameName, eachGameStats: [] };
      }
      acc[session.gameType].eachGameStats.push(session);
      return acc;
    }, {});
    
    const games = Object.values(grouped);

    // Get game stats for all games
    const gamesData = games.map(gameObj => {
      const sessions = gameObj.eachGameStats || [];
      let totalCorrect = 0;
      let totalIncorrect = 0;
      let totalNotDone = 0;
      let totalResponseTime = 0;
      let validResponseCount = 0;
      let totalScore = 0;

      sessions.forEach(session => {
        totalScore += session.sessionScore || 0;
        session.play.forEach(entry => {
          if (entry.correct === 1) {
            totalCorrect++;
            if (entry.responsetime !== -1 && entry.responsetime !== undefined) {
              totalResponseTime += entry.responsetime;
              validResponseCount++;
            }
          } else if (entry.correct === -1) {
            totalIncorrect++;
            if (entry.responsetime !== -1 && entry.responsetime !== undefined) {
              totalResponseTime += entry.responsetime;
              validResponseCount++;
            }
          } else if (entry.correct === 0) {
            totalNotDone++;
          }
        });
      });

      const avgResponseTime = validResponseCount > 0 
        ? (totalResponseTime / validResponseCount).toFixed(2)
        : 0;

      const accuracy = (totalCorrect + totalIncorrect) > 0
        ? ((totalCorrect / (totalCorrect + totalIncorrect)) * 100).toFixed(2)
        : 0;

      return {
        type: gameObj.type,
        name: gameObj.name,
        overallStats: {
          totalSessions: sessions.length,
          totalScore,
          totalCorrect,
          totalIncorrect,
          totalNotDone,
          avgResponseTime: parseFloat(avgResponseTime),
          accuracy: parseFloat(accuracy)
        },
        sessions: sessions.slice(-10) // Last 10 sessions
      };
    });

    res.json({
      success: true,
      analytics: {
        user: {
          email: user.email,
          type: user.type,
          totalScore: user.totalScore,
          level: user.level,
          currentlevelspan: user.currentlevelspan
        },
        games: gamesData
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

// Get basic stats (for patients and caretakers)
exports.getBasicStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const user = await User.findById(userId).select('email type totalScore level currentlevelspan game');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const sessions = await GameSession.find({ user: userId }).sort({ time: 1 });
    
    // Group by game type
    const grouped = sessions.reduce((acc, session) => {
      if (!acc[session.gameType]) {
        acc[session.gameType] = { type: session.gameType, name: session.gameName, eachGameStats: [] };
      }
      acc[session.gameType].eachGameStats.push(session);
      return acc;
    }, {});
    
    const games = Object.values(grouped);

    const gamesData = games.map(gameObj => {
      const sessions = gameObj.eachGameStats ? gameObj.eachGameStats.slice(-30) : [];
      const basicSessions = sessions.map(session => {
        const correct = session.play.filter(p => p.correct === 1).length;
        const incorrect = session.play.filter(p => p.correct === -1).length;
        const notDone = session.play.filter(p => p.correct === 0).length;
        const responsetime = session.play.reduce((sum, p) => sum + (p.responsetime || 0), 0);

        return {
          session: session,
          time: session.time,
          correct,
          incorrect,
          responsetime,
          notDone,
          total: session.play.length,
          sessionScore: session.sessionScore,
          systemMetrics: session.systemMetrics
        };
      });

      return {
        type: gameObj.type,
        name: gameObj.name,
        recentSessions: basicSessions
      };
    });

    res.json({
      success: true,
      stats: {
        email: user.email,
        type: user.type,
        totalScore: user.totalScore,
        level: user.level,
        currentlevelspan: user.currentlevelspan,
        games: gamesData,
        // Legacy support mapping type1 to root recentSessions just in case
        recentSessions: gamesData.find(g => g.type === 'type1')?.recentSessions || []
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};
