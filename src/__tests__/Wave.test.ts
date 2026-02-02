import {
  generateWave,
  spawnLanders,
  scoreLanderDestroyed,
  scoreCatchHuman,
  scoreReturnHuman,
  scoreWaveComplete,
  SCORE_LANDER,
  SCORE_LANDER_WITH_HUMAN,
  SCORE_CATCH_HUMAN,
  SCORE_RETURN_HUMAN,
  SCORE_WAVE_COMPLETE,
} from '../game/Wave';
import { Human, resetHumanIds } from '../game/Human';
import { resetLanderIds } from '../game/Lander';
import {
  INITIAL_LANDER_COUNT,
  LANDER_COUNT_INCREMENT,
  MAX_LANDER_COUNT,
  INITIAL_LANDER_SPEED,
  LANDER_SPEED_INCREMENT,
  MAX_LANDER_SPEED,
  WAVE_SPAWN_DURATION,
} from '../game/constants';

describe('Wave', () => {
  beforeEach(() => {
    resetHumanIds();
    resetLanderIds();
  });

  describe('generateWave', () => {
    it('wave 1 has initial lander count', () => {
      const wave = generateWave(1);
      expect(wave.landerCount).toBe(INITIAL_LANDER_COUNT);
    });

    it('wave 1 has initial lander speed', () => {
      const wave = generateWave(1);
      expect(wave.landerSpeed).toBe(INITIAL_LANDER_SPEED);
    });

    it('lander count increases each wave', () => {
      const wave1 = generateWave(1);
      const wave2 = generateWave(2);
      expect(wave2.landerCount).toBe(wave1.landerCount + LANDER_COUNT_INCREMENT);
    });

    it('lander speed increases each wave', () => {
      const wave1 = generateWave(1);
      const wave2 = generateWave(2);
      expect(wave2.landerSpeed).toBe(wave1.landerSpeed + LANDER_SPEED_INCREMENT);
    });

    it('lander count caps at maximum', () => {
      const wave = generateWave(100);
      expect(wave.landerCount).toBe(MAX_LANDER_COUNT);
    });

    it('lander speed caps at maximum', () => {
      const wave = generateWave(100);
      expect(wave.landerSpeed).toBe(MAX_LANDER_SPEED);
    });

    it('stores wave number', () => {
      const wave = generateWave(5);
      expect(wave.number).toBe(5);
    });
  });

  describe('spawnLanders', () => {
    it('creates correct number of landers', () => {
      const wave = generateWave(1);
      const humans = [new Human(500)];
      const spawns = spawnLanders(wave, humans);
      expect(spawns.length).toBe(wave.landerCount);
    });

    it('staggers spawn times', () => {
      const wave = generateWave(3);
      const humans = [new Human(500)];
      const spawns = spawnLanders(wave, humans);
      
      // First should spawn at time 0
      expect(spawns[0].spawnTime).toBe(0);
      
      // Times should increase
      for (let i = 1; i < spawns.length; i++) {
        expect(spawns[i].spawnTime).toBeGreaterThan(spawns[i - 1].spawnTime);
      }
      
      // Last spawn time should be close to WAVE_SPAWN_DURATION
      const lastTime = spawns[spawns.length - 1].spawnTime;
      expect(lastTime).toBeLessThan(WAVE_SPAWN_DURATION);
    });

    it('assigns targets to landers', () => {
      const wave = generateWave(1);
      const humans = [new Human(500), new Human(1000)];
      const spawns = spawnLanders(wave, humans);
      
      for (const spawn of spawns) {
        expect(spawn.lander.targetHumanId).not.toBeNull();
      }
    });

    it('handles empty human list', () => {
      const wave = generateWave(1);
      const spawns = spawnLanders(wave, []);
      expect(spawns.length).toBe(wave.landerCount);
    });
  });

  describe('scoring', () => {
    it('scoreLanderDestroyed returns base score without human', () => {
      expect(scoreLanderDestroyed(false)).toBe(SCORE_LANDER);
    });

    it('scoreLanderDestroyed returns bonus score with human', () => {
      expect(scoreLanderDestroyed(true)).toBe(SCORE_LANDER_WITH_HUMAN);
    });

    it('scoreCatchHuman returns correct score', () => {
      expect(scoreCatchHuman()).toBe(SCORE_CATCH_HUMAN);
    });

    it('scoreReturnHuman returns correct score', () => {
      expect(scoreReturnHuman()).toBe(SCORE_RETURN_HUMAN);
    });

    it('scoreWaveComplete scales with wave number', () => {
      expect(scoreWaveComplete(1)).toBe(SCORE_WAVE_COMPLETE);
      expect(scoreWaveComplete(5)).toBe(SCORE_WAVE_COMPLETE * 5);
    });
  });
});
