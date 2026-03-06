'use client';

import { ReplayData, Replay } from '../game/Replay';

interface ReplayViewProps {
  replayData: ReplayData;
  onClose: () => void;
  onWatch: () => void;
}

export function ReplayView({ replayData, onClose, onWatch }: ReplayViewProps) {
  const stats = Replay.getStats(replayData);
  const shareCode = Replay.generateShareCode(replayData);
  const replayCode = Replay.encode(replayData);

  const copyShareCode = async () => {
    try {
      await navigator.clipboard.writeText(shareCode);
    } catch {
      // Clipboard API not available
    }
  };

  const copyReplayCode = async () => {
    try {
      await navigator.clipboard.writeText(replayCode);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-green-500 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-green-400 mb-4">Replay Stats</h2>

        <div className="space-y-2 text-green-300 mb-6">
          <div className="flex justify-between">
            <span>Final Score:</span>
            <span className="text-green-400 font-bold">{replayData.finalScore.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Waves Survived:</span>
            <span>{replayData.finalWave}</span>
          </div>
          <div className="flex justify-between">
            <span>Humans Saved:</span>
            <span>{replayData.humansAlive}</span>
          </div>
          <div className="flex justify-between">
            <span>Duration:</span>
            <span>{Math.floor(stats.durationSeconds)}s</span>
          </div>
          <hr className="border-green-700" />
          <div className="flex justify-between">
            <span>Total Inputs:</span>
            <span>{stats.totalInputs}</span>
          </div>
          <div className="flex justify-between">
            <span>Fire Count:</span>
            <span>{stats.fireCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Thrust (L/R):</span>
            <span>{stats.thrustLeft} / {stats.thrustRight}</span>
          </div>
          <div className="flex justify-between">
            <span>Vertical (U/D):</span>
            <span>{stats.moveUp} / {stats.moveDown}</span>
          </div>
          <div className="flex justify-between">
            <span>Inputs/sec:</span>
            <span>{stats.inputsPerSecond.toFixed(1)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareCode}
              className="flex-1 bg-gray-800 border border-green-600 rounded px-3 py-2 text-green-300 text-sm"
            />
            <button
              onClick={copyShareCode}
              className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded"
            >
              Copy
            </button>
          </div>

          <button
            onClick={copyReplayCode}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded"
          >
            Copy Replay Code
          </button>

          <button
            onClick={onWatch}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
          >
            Watch Replay
          </button>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
