'use client';

interface GameOverProps {
  score: number;
  wave: number;
  onRestart: () => void;
}

export function GameOver({ score, wave, onRestart }: GameOverProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
      <h1 className="text-5xl font-bold text-red-500 mb-4">
        GAME OVER
      </h1>
      <div className="text-2xl text-gray-300 mb-2">
        Final Score: <span className="text-cyan-400 font-bold">{score}</span>
      </div>
      <div className="text-lg text-gray-400 mb-8">
        Wave Reached: {wave}
      </div>
      <button
        onClick={onRestart}
        className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xl font-bold rounded-lg transition-colors"
      >
        PLAY AGAIN
      </button>
    </div>
  );
}
