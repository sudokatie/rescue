'use client';

import { useState, useEffect } from 'react';
import { Music } from '@/game/Music';
import { Sound } from '@/game/Sound';
import { todayString } from '@/game/Daily';

interface TitleScreenProps {
  onStart: () => void;
  onStartDaily: () => void;
  onWatchReplay: () => void;
}

export function TitleScreen({ onStart, onStartDaily, onWatchReplay }: TitleScreenProps) {
  const [musicVolume, setMusicVolume] = useState(Music.getVolume());
  const [soundVolume, setSoundVolume] = useState(Sound.getVolume());
  const [musicEnabled, setMusicEnabled] = useState(Music.isEnabled());
  const [soundEnabled, setSoundEnabled] = useState(Sound.isEnabled());

  useEffect(() => {
    Music.setVolume(musicVolume);
  }, [musicVolume]);

  useEffect(() => {
    Sound.setVolume(soundVolume);
  }, [soundVolume]);

  const toggleMusic = () => {
    const newState = !musicEnabled;
    setMusicEnabled(newState);
    Music.setEnabled(newState);
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    Sound.setEnabled(newState);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]">
      {/* Header */}
      <div className="w-full max-w-sm mb-4 px-4">
        <div className="flex items-center justify-between">
          <a href="/games/" className="mc-link">&lt; BACK TO HUB</a>
          <span className="mc-header">MISSION SELECT</span>
        </div>
      </div>

      {/* Main Panel */}
      <div className="mc-panel p-6 w-full max-w-sm mx-4">
        {/* Title Bar */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#2a2a2a]">
          <div className="mc-dot" />
          <h1 className="mc-header-primary text-2xl tracking-wider">RESCUE</h1>
        </div>

        {/* Description */}
        <p className="text-[#555555] text-xs text-center tracking-wider mb-6">
          DEFEND HUMANS FROM ALIEN LANDERS.<br />
          DESTROY ALIENS BEFORE THEY ABDUCT EVERYONE.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 mb-6">
          <button
            onClick={onStart}
            className="w-full py-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm tracking-widest font-medium transition-colors border border-[#dc2626]"
          >
            START MISSION
          </button>
          <div className="pt-3 border-t border-[#2a2a2a]">
            <button
              onClick={onStartDaily}
              className="w-full py-3 bg-transparent border border-[#2a2a2a] text-white text-sm tracking-widest font-medium transition-colors hover:border-[#dc2626]"
            >
              DAILY CHALLENGE
            </button>
            <p className="text-[#555555] text-xs text-center mt-2 font-mono">{todayString()}</p>
          </div>
          <button
            onClick={onWatchReplay}
            className="w-full py-2 bg-transparent border border-[#2a2a2a] text-[#888888] text-xs tracking-widest transition-colors hover:text-white hover:border-[#3a3a3a]"
          >
            WATCH REPLAY
          </button>
        </div>

        {/* Audio Settings */}
        <div className="border-t border-[#2a2a2a] pt-4">
          <span className="mc-header block mb-3">AUDIO SYSTEMS</span>
          
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={toggleMusic}
              className={`w-8 h-8 flex items-center justify-center text-xs font-mono border transition-colors ${
                musicEnabled 
                  ? 'bg-[#dc2626] border-[#dc2626] text-white' 
                  : 'bg-transparent border-[#2a2a2a] text-[#555555]'
              }`}
            >
              {musicEnabled ? 'ON' : 'OFF'}
            </button>
            <span className="text-[#888888] text-xs tracking-wider w-14">MUSIC</span>
            <input
              type="range"
              min="0"
              max="100"
              value={musicVolume * 100}
              onChange={(e) => setMusicVolume(Number(e.target.value) / 100)}
              disabled={!musicEnabled}
              className="flex-1 h-1 bg-[#2a2a2a] appearance-none cursor-pointer disabled:opacity-50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#dc2626]"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSound}
              className={`w-8 h-8 flex items-center justify-center text-xs font-mono border transition-colors ${
                soundEnabled 
                  ? 'bg-[#dc2626] border-[#dc2626] text-white' 
                  : 'bg-transparent border-[#2a2a2a] text-[#555555]'
              }`}
            >
              {soundEnabled ? 'ON' : 'OFF'}
            </button>
            <span className="text-[#888888] text-xs tracking-wider w-14">SFX</span>
            <input
              type="range"
              min="0"
              max="100"
              value={soundVolume * 100}
              onChange={(e) => setSoundVolume(Number(e.target.value) / 100)}
              disabled={!soundEnabled}
              className="flex-1 h-1 bg-[#2a2a2a] appearance-none cursor-pointer disabled:opacity-50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#dc2626]"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-sm mt-4 px-4">
        <div className="flex flex-col items-center gap-1">
          <span className="mc-header text-[10px]">CONTROLS</span>
          <span className="text-[#555555] text-xs font-mono">Arrow keys/WASD move | SPACE fire</span>
        </div>
      </div>
    </div>
  );
}
