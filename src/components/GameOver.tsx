'use client';

import { DailyLeaderboard, generateShareCode, todayString } from '@/game/Daily';

interface GameOverProps {
  score: number;
  wave: number;
  onRestart: () => void;
  dailyMode: boolean;
}

export function GameOver({ score, wave, onRestart, dailyMode }: GameOverProps) {
  const dailyScores = dailyMode ? DailyLeaderboard.getToday() : [];
  const shareCode = dailyMode ? generateShareCode(todayString(), score) : '';
  const dailyRank = dailyMode ? dailyScores.findIndex(s => s.score === score) + 1 : 0;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
      <h1 className="text-5xl font-bold text-red-500 mb-4">
        GAME OVER
      </h1>
      <div className="text-2xl text-gray-300 mb-2">
        Final Score: <span className="text-cyan-400 font-bold">{score}</span>
      </div>
      <div className="text-lg text-gray-400 mb-4">
        Wave Reached: {wave}
      </div>
      
      {dailyMode && (
        <div className="text-center mb-4">
          <p className="text-purple-400 mb-2">Daily Challenge - {todayString()}</p>
          {dailyRank > 0 && dailyRank <= 10 && (
            <p className="text-yellow-400 mb-2">Daily Rank: #{dailyRank}</p>
          )}
          <p className="text-gray-400 text-sm">
            Share: <span className="text-purple-300 font-mono">{shareCode}</span>
          </p>
          
          {dailyScores.length > 0 && (
            <div className="bg-black/50 p-3 rounded mt-3 max-h-32 overflow-y-auto">
              <p className="text-purple-300 text-sm mb-2">Today&apos;s Top Scores:</p>
              {dailyScores.slice(0, 5).map((entry, i) => (
                <p key={i} className="text-gray-300 text-sm">
                  {i + 1}. {entry.name} - {entry.score}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
      
      <button
        onClick={onRestart}
        className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xl font-bold rounded-lg transition-colors"
      >
        PLAY AGAIN
      </button>
    </div>
  );
}
