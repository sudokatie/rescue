import { WaveData } from './types';
import { Lander } from './Lander';
import { Human } from './Human';
import {
  INITIAL_LANDER_COUNT,
  LANDER_COUNT_INCREMENT,
  MAX_LANDER_COUNT,
  INITIAL_LANDER_SPEED,
  LANDER_SPEED_INCREMENT,
  MAX_LANDER_SPEED,
  WORLD_WIDTH,
  WAVE_SPAWN_DURATION,
} from './constants';
import { distance } from './World';

/**
 * Generate wave configuration for a given wave number
 */
export function generateWave(waveNumber: number): WaveData {
  const landerCount = Math.min(
    INITIAL_LANDER_COUNT + (waveNumber - 1) * LANDER_COUNT_INCREMENT,
    MAX_LANDER_COUNT
  );
  
  const landerSpeed = Math.min(
    INITIAL_LANDER_SPEED + (waveNumber - 1) * LANDER_SPEED_INCREMENT,
    MAX_LANDER_SPEED
  );

  return {
    number: waveNumber,
    landerCount,
    landerSpeed,
  };
}

/**
 * Create landers for a wave with staggered spawn times
 */
export function spawnLanders(wave: WaveData, humans: Human[]): { lander: Lander; spawnTime: number }[] {
  const result: { lander: Lander; spawnTime: number }[] = [];
  
  for (let i = 0; i < wave.landerCount; i++) {
    // Random X position
    const x = Math.random() * WORLD_WIDTH;
    
    // Stagger spawn times over WAVE_SPAWN_DURATION seconds
    const spawnTime = (i / wave.landerCount) * WAVE_SPAWN_DURATION;
    
    const lander = new Lander(x, -20, wave.landerSpeed);
    
    // Assign target to nearest human
    if (humans.length > 0) {
      let nearestHuman = humans[0];
      let nearestDist = distance(x, nearestHuman.x);
      
      for (const human of humans) {
        if (human.canBeGrabbed()) {
          const d = distance(x, human.x);
          if (d < nearestDist) {
            nearestHuman = human;
            nearestDist = d;
          }
        }
      }
      
      lander.setTarget(nearestHuman.id);
    }
    
    result.push({ lander, spawnTime });
  }
  
  return result;
}

/**
 * Scoring constants and functions
 */
export const SCORE_LANDER = 150;
export const SCORE_LANDER_WITH_HUMAN = 200;
export const SCORE_CATCH_HUMAN = 250;
export const SCORE_RETURN_HUMAN = 500;
export const SCORE_WAVE_COMPLETE = 1000;

/**
 * Calculate score for destroying a lander
 */
export function scoreLanderDestroyed(wasCarryingHuman: boolean): number {
  return wasCarryingHuman ? SCORE_LANDER_WITH_HUMAN : SCORE_LANDER;
}

/**
 * Calculate score for catching a falling human
 */
export function scoreCatchHuman(): number {
  return SCORE_CATCH_HUMAN;
}

/**
 * Calculate score for returning human to ground
 */
export function scoreReturnHuman(): number {
  return SCORE_RETURN_HUMAN;
}

/**
 * Calculate wave completion bonus
 */
export function scoreWaveComplete(waveNumber: number): number {
  return SCORE_WAVE_COMPLETE * waveNumber;
}
