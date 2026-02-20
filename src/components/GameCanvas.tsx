'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { Game } from '@/game/Game';
import { Renderer } from '@/game/Renderer';
import { Input } from '@/game/Input';
import { GameState } from '@/game/types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  CANVAS_SCALE,
  DISPLAY_WIDTH,
  DISPLAY_HEIGHT,
} from '@/game/constants';
import { TitleScreen } from './TitleScreen';
import { GameOver } from './GameOver';
import { Music } from '@/game/Music';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const inputRef = useRef<Input | null>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const [gameState, setGameState] = useState<GameState>(GameState.Menu);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);

  // Game loop
  const loop = useCallback((timestamp: number) => {
    if (!gameRef.current || !rendererRef.current || !inputRef.current) return;

    const dt = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0;
    lastTimeRef.current = timestamp;

    // Cap delta time
    const cappedDt = Math.min(dt, 0.1);

    const game = gameRef.current;
    const input = inputRef.current;

    // Handle input
    game.handleInput(input.getPressed(), cappedDt);

    // Track landers before update for explosion detection
    const landersBefore = new Map(game.landers.map(l => [l.id, { x: l.x, y: l.y }]));
    const shipAliveBefore = game.ship.alive;

    // Update game state
    game.update(cappedDt);

    // Check for destroyed landers and add explosions
    const renderer = rendererRef.current;
    landersBefore.forEach((pos, id) => {
      if (!game.landers.find(l => l.id === id)) {
        renderer.addExplosion(pos.x, pos.y, 25);
      }
    });

    // Check for ship death
    if (shipAliveBefore && !game.ship.alive) {
      renderer.addExplosion(game.ship.x, game.ship.y, 40);
    }

    // Sync React state
    setGameState(game.state);
    setScore(game.score);
    setWave(game.wave);

    // Render
    renderer.render(
      game.ship,
      game.lasers,
      game.landers,
      game.humans,
      game.terrain,
      game.score,
      game.lives,
      game.wave,
      cappedDt
    );

    animationRef.current = requestAnimationFrame(loop);
  }, []);

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale for retina
    ctx.scale(CANVAS_SCALE, CANVAS_SCALE);

    // Create game objects
    gameRef.current = new Game();
    rendererRef.current = new Renderer(ctx);
    inputRef.current = new Input();

    // Attach input
    inputRef.current.attach();

    // Start loop
    animationRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationRef.current);
      inputRef.current?.detach();
    };
  }, [loop]);

  // Handle wave end - auto continue after delay
  useEffect(() => {
    if (gameState === GameState.WaveEnd) {
      const timer = setTimeout(() => {
        gameRef.current?.continueToNextWave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Switch music tracks based on game state
  useEffect(() => {
    switch (gameState) {
      case GameState.Menu:
        Music.play('menu');
        break;
      case GameState.Playing:
        Music.play('gameplay');
        break;
      case GameState.WaveEnd:
        Music.play('victory');
        break;
      case GameState.GameOver:
        Music.play('gameover');
        break;
    }
  }, [gameState]);

  const handleStart = useCallback(() => {
    gameRef.current?.start();
  }, []);

  const handleRestart = useCallback(() => {
    gameRef.current?.reset();
    gameRef.current?.start();
  }, []);

  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        width={DISPLAY_WIDTH}
        height={DISPLAY_HEIGHT}
        className="block"
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          imageRendering: 'pixelated',
        }}
        tabIndex={0}
      />

      {gameState === GameState.Menu && (
        <TitleScreen onStart={handleStart} />
      )}

      {gameState === GameState.GameOver && (
        <GameOver score={score} wave={wave} onRestart={handleRestart} />
      )}

      {gameState === GameState.WaveEnd && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-3xl font-bold text-cyan-400 animate-pulse">
            WAVE {wave} COMPLETE
          </div>
        </div>
      )}
    </div>
  );
}
