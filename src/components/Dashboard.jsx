import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Leaderboard from './Leaderboard';
import GameMechanicsButton from './GameMechanicsButton';

const Dashboard = ({ onPlay }) => {
  const { user, highScore, logout } = useAuth();
  const username = user?.user_metadata?.username || user?.email?.split('@')[0];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-green-500/30">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                Welcome, {username}! 🐍
              </h1>
              <p className="text-gray-400 mt-1">Ready to beat your high score?</p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{highScore}</div>
                <div className="text-xs text-gray-400">HIGH SCORE</div>
              </div>
              <button
                onClick={logout}
                className="px-6 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-2xl p-8 border border-green-500/30 flex flex-col items-center justify-center text-center">
            <div className="text-8xl mb-4 animate-bounce">🐍</div>
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Play?</h2>
            <p className="text-gray-300 mb-6">
              Guide the snake, eat the food, and don't hit the walls or yourself!
              Try to beat your high score of{' '}
              <span className="text-green-400 font-bold">{highScore}</span>
            </p>
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={onPlay}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg"
              >
                🎮 Start Game
              </button>
              <GameMechanicsButton />
            </div>
          </div>

          <Leaderboard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;