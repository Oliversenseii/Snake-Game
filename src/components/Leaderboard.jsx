import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const Leaderboard = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // Simply get scores with username directly from scores table
      const { data, error } = await supabase
        .from('scores')
        .select('high_score, username')
        .order('high_score', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        setScores([]);
      } else if (data) {
        const formattedScores = data.map((score, index) => ({
          rank: index + 1,
          score: score.high_score,
          username: score.username || 'Player'
        }));
        setScores(formattedScores);
      }
    } catch (err) {
      console.error('Leaderboard error:', err);
      setScores([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
      <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
        🏆 Top Players 🏆
      </h2>
      
      {loading ? (
        <div className="text-center text-gray-400">Loading leaderboard...</div>
      ) : (
        <div className="space-y-2">
          {scores.length > 0 ? (
            scores.map((score) => (
              <div
                key={score.rank}
                className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {score.rank === 1 ? '👑' : score.rank === 2 ? '🥈' : score.rank === 3 ? '🥉' : `${score.rank}.`}
                  </span>
                  <span className="text-white font-medium">{score.username}</span>
                </div>
                <span className="text-green-400 font-bold text-xl">{score.score}</span>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8">
              No scores yet. Be the first to play!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;