import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const DrawingPerformancePanel = ({ userId }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const url = userId ? `/game/board-drawing/games?userId=${userId}` : '/game/board-drawing/games';
        const res = await api.get(url);
        setGames(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [userId]);

  if (loading) return <div className="p-4">Loading Drawing Performance...</div>;
  if (!games.length) return null;

  // Aggregate stats
  const totalSessions = games.length;
  const bestScore = Math.max(...games.map(g => g.totalScore || 0), 0);
  const avgSuccessRate = Math.round(
    games.reduce((acc, g) => acc + (g.successRate || 0), 0) / totalSessions
  );

  // Shape Mastery (aggregate shapeBreakdown from gameMetrics)
  const shapeAgg = {};
  games.forEach(g => {
    const breakdown = g.gameMetrics?.shapeBreakdown || {};
    Object.entries(breakdown).forEach(([shape, d]) => {
      if (!shapeAgg[shape]) shapeAgg[shape] = { attempts: 0, successes: 0 };
      shapeAgg[shape].attempts += d.attempts;
      shapeAgg[shape].successes += d.successes;
    });
  });

  const shapeData = Object.entries(shapeAgg).map(([shape, d]) => ({
    name: shape,
    rate: d.attempts ? Math.round((d.successes / d.attempts) * 100) : 0,
    attempts: d.attempts
  })).sort((a, b) => b.rate - a.rate);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Drawing Performance</h3>
        <button 
          onClick={() => navigate('/analytics')}
          className="text-sm bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl transition"
        >
          📊 Open Full Analytics
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total Sessions</p>
          <p className="text-3xl font-black text-gray-800 dark:text-white">{totalSessions}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Best Score</p>
          <p className="text-3xl font-black text-gray-800 dark:text-white">{bestScore}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Avg Success Rate</p>
          <p className="text-3xl font-black text-blue-500">{avgSuccessRate}%</p>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Shape Mastery</h4>
        <div className="space-y-3">
          {shapeData.slice(0, 5).map(s => (
            <div key={s.name} className="flex items-center gap-4">
              <div className="w-20 text-xs font-semibold text-gray-500 dark:text-gray-400 capitalize">{s.name}</div>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${s.rate > 70 ? 'bg-green-500' : s.rate > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                  style={{ width: `${s.rate}%` }}
                ></div>
              </div>
              <div className="w-10 text-xs font-bold text-gray-800 dark:text-white text-right">{s.rate}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-100 dark:border-gray-700 pt-6">
        <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Recent Sessions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {games.slice(0, 4).map(g => (
            <div key={g.gameId} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-white">Game #{g.gameIndex}</p>
                <p className="text-xs text-gray-400">{new Date(g.startedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-green-500">{g.percentComplete}%</p>
                  <p className="text-[10px] text-gray-400">Complete</p>
                </div>
                <button 
                  onClick={() => navigate(`/analytics?gameId=${g.gameId}`)}
                  className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white text-xs px-3 py-1.5 rounded-lg transition"
                >
                  Replay
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DrawingPerformancePanel;
