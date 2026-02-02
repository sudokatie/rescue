import { Game } from '../game/Game';
import { GameState } from '../game/types';
import { INITIAL_LIVES, HUMAN_COUNT, INITIAL_LANDER_COUNT } from '../game/constants';

describe('Game', () => {
  let game: Game;

  beforeEach(() => {
    game = new Game();
  });

  describe('initialization', () => {
    it('starts in Menu state', () => {
      expect(game.state).toBe(GameState.Menu);
    });

    it('starts with zero score', () => {
      expect(game.score).toBe(0);
    });

    it('starts with initial lives', () => {
      expect(game.lives).toBe(INITIAL_LIVES);
    });

    it('starts with wave 0', () => {
      expect(game.wave).toBe(0);
    });

    it('creates humans', () => {
      expect(game.humans.length).toBe(HUMAN_COUNT);
    });

    it('creates terrain', () => {
      expect(game.terrain.length).toBeGreaterThan(0);
    });

    it('has alive ship', () => {
      expect(game.ship.alive).toBe(true);
    });
  });

  describe('start', () => {
    it('transitions to Playing state', () => {
      game.start();
      expect(game.state).toBe(GameState.Playing);
    });

    it('resets score', () => {
      game.start();
      expect(game.score).toBe(0);
    });

    it('sets wave to 1', () => {
      game.start();
      expect(game.wave).toBe(1);
    });

    it('respawns ship', () => {
      game.start();
      expect(game.ship.alive).toBe(true);
    });
  });

  describe('handleInput', () => {
    beforeEach(() => {
      game.start();
    });

    it('does not process input when not playing', () => {
      game.reset();
      const initialX = game.ship.x;
      game.handleInput(new Set(['ArrowRight']), 0.1);
      expect(game.ship.x).toBe(initialX);
    });

    it('thrusts right on ArrowRight', () => {
      const initialVx = game.ship.vx;
      game.handleInput(new Set(['ArrowRight']), 0.1);
      expect(game.ship.vx).toBeGreaterThan(initialVx);
    });

    it('thrusts left on ArrowLeft', () => {
      game.handleInput(new Set(['ArrowLeft']), 0.1);
      expect(game.ship.vx).toBeLessThan(0);
    });

    it('moves up on ArrowUp', () => {
      game.handleInput(new Set(['ArrowUp']), 0.1);
      expect(game.ship.vy).toBeLessThan(0);
    });

    it('moves down on ArrowDown', () => {
      game.handleInput(new Set(['ArrowDown']), 0.1);
      expect(game.ship.vy).toBeGreaterThan(0);
    });
  });

  describe('fireLaser', () => {
    beforeEach(() => {
      game.start();
    });

    it('creates a laser', () => {
      expect(game.lasers.length).toBe(0);
      game.fireLaser();
      expect(game.lasers.length).toBe(1);
    });

    it('respects cooldown', () => {
      game.fireLaser();
      game.fireLaser();
      expect(game.lasers.length).toBe(1);
    });

    it('laser starts at ship position', () => {
      game.fireLaser();
      const laser = game.lasers[0];
      expect(laser.x).toBe(game.ship.x);
      expect(laser.y).toBe(game.ship.y);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      game.start();
    });

    it('updates ship position', () => {
      game.ship.vx = 100;
      const initialX = game.ship.x;
      game.update(0.1);
      expect(game.ship.x).not.toBe(initialX);
    });

    it('spawns landers over time', () => {
      expect(game.landers.length).toBe(0);
      game.update(5); // Advance past spawn duration
      expect(game.landers.length).toBeGreaterThan(0);
    });

    it('removes expired lasers', () => {
      game.fireLaser();
      expect(game.lasers.length).toBe(1);
      // Simulate time passing
      game.update(0.6); // Laser lifespan is 500ms
    });
  });

  describe('wave progression', () => {
    beforeEach(() => {
      game.start();
    });

    it('transitions to WaveEnd when all landers destroyed', () => {
      // Spawn landers
      game.update(6);
      
      // Destroy all landers
      for (const lander of game.landers) {
        lander.destroy();
      }
      
      game.update(0.1);
      expect(game.state).toBe(GameState.WaveEnd);
    });

    it('increments wave on continueToNextWave', () => {
      // Complete wave 1
      game.update(6);
      for (const lander of game.landers) {
        lander.destroy();
      }
      game.update(0.1);
      
      const wave1 = game.wave;
      game.continueToNextWave();
      expect(game.wave).toBe(wave1 + 1);
    });
  });

  describe('scoring', () => {
    beforeEach(() => {
      game.start();
    });

    it('awards points for wave completion', () => {
      game.update(6);
      for (const lander of game.landers) {
        lander.destroy();
      }
      const scoreBefore = game.score;
      game.update(0.1);
      expect(game.score).toBeGreaterThan(scoreBefore);
    });
  });

  describe('reset', () => {
    it('returns to Menu state', () => {
      game.start();
      game.reset();
      expect(game.state).toBe(GameState.Menu);
    });

    it('resets score', () => {
      game.start();
      (game as any)._score = 5000;
      game.reset();
      expect(game.score).toBe(0);
    });

    it('resets lives', () => {
      game.start();
      (game as any)._lives = 1;
      game.reset();
      expect(game.lives).toBe(INITIAL_LIVES);
    });

    it('clears landers', () => {
      game.start();
      game.update(6);
      game.reset();
      expect(game.landers.length).toBe(0);
    });

    it('resets humans', () => {
      game.start();
      game.reset();
      expect(game.humans.length).toBe(HUMAN_COUNT);
    });
  });

  describe('getAliveHumanCount', () => {
    it('returns count of living humans', () => {
      expect(game.getAliveHumanCount()).toBe(HUMAN_COUNT);
    });

    it('decreases when human dies', () => {
      game.humans[0].kill();
      expect(game.getAliveHumanCount()).toBe(HUMAN_COUNT - 1);
    });
  });
});
