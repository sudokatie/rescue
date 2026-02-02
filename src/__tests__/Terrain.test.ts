import { generateTerrain, getHeightAt } from '../game/Terrain';
import {
  WORLD_WIDTH,
  TERRAIN_RESOLUTION,
  TERRAIN_MIN_HEIGHT,
  TERRAIN_MAX_HEIGHT,
} from '../game/constants';

describe('Terrain', () => {
  describe('generateTerrain', () => {
    it('generates correct number of points', () => {
      const terrain = generateTerrain();
      const expectedCount = Math.ceil(WORLD_WIDTH / TERRAIN_RESOLUTION) + 1;
      expect(terrain.length).toBe(expectedCount);
    });

    it('all heights are within bounds', () => {
      const terrain = generateTerrain();
      for (const point of terrain) {
        expect(point.y).toBeGreaterThanOrEqual(TERRAIN_MIN_HEIGHT);
        expect(point.y).toBeLessThanOrEqual(TERRAIN_MAX_HEIGHT);
      }
    });

    it('points are evenly spaced', () => {
      const terrain = generateTerrain();
      for (let i = 0; i < terrain.length - 1; i++) {
        expect(terrain[i + 1].x - terrain[i].x).toBe(TERRAIN_RESOLUTION);
      }
    });

    it('first and last points have same height for seamless wrap', () => {
      const terrain = generateTerrain();
      expect(terrain[0].y).toBe(terrain[terrain.length - 1].y);
    });

    it('starts at x=0', () => {
      const terrain = generateTerrain();
      expect(terrain[0].x).toBe(0);
    });
  });

  describe('getHeightAt', () => {
    let terrain: ReturnType<typeof generateTerrain>;

    beforeEach(() => {
      terrain = generateTerrain();
    });

    it('returns exact height at point x positions', () => {
      const height = getHeightAt(terrain, terrain[5].x);
      expect(height).toBe(terrain[5].y);
    });

    it('interpolates between points', () => {
      const x = terrain[5].x + TERRAIN_RESOLUTION / 2;
      const height = getHeightAt(terrain, x);
      const expectedMid = (terrain[5].y + terrain[6].y) / 2;
      expect(height).toBeCloseTo(expectedMid);
    });

    it('handles wrapped coordinates', () => {
      const height1 = getHeightAt(terrain, 100);
      const height2 = getHeightAt(terrain, WORLD_WIDTH + 100);
      expect(height2).toBeCloseTo(height1);
    });

    it('handles negative coordinates', () => {
      const height1 = getHeightAt(terrain, 100);
      const height2 = getHeightAt(terrain, 100 - WORLD_WIDTH);
      expect(height2).toBeCloseTo(height1);
    });
  });
});
