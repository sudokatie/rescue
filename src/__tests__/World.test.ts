import { wrapX, distance, direction } from '../game/World';
import { WORLD_WIDTH } from '../game/constants';

describe('World', () => {
  describe('wrapX', () => {
    it('returns x unchanged when within bounds', () => {
      expect(wrapX(100)).toBe(100);
      expect(wrapX(0)).toBe(0);
      expect(wrapX(2000)).toBe(2000);
    });

    it('wraps x at WORLD_WIDTH boundary', () => {
      expect(wrapX(WORLD_WIDTH)).toBe(0);
      expect(wrapX(WORLD_WIDTH + 100)).toBe(100);
    });

    it('handles negative values', () => {
      expect(wrapX(-100)).toBe(WORLD_WIDTH - 100);
      expect(wrapX(-WORLD_WIDTH)).toBe(0);
      expect(wrapX(-1)).toBe(WORLD_WIDTH - 1);
    });

    it('handles values much larger than WORLD_WIDTH', () => {
      expect(wrapX(WORLD_WIDTH * 3 + 500)).toBe(500);
    });
  });

  describe('distance', () => {
    it('calculates direct distance when shorter', () => {
      expect(distance(100, 200)).toBe(100);
      expect(distance(200, 100)).toBe(100);
    });

    it('calculates wrapped distance when shorter', () => {
      // 100 to 2500: direct is 2400, wrapped is 160
      expect(distance(100, 2500)).toBe(160);
      expect(distance(2500, 100)).toBe(160);
    });

    it('returns 0 for same position', () => {
      expect(distance(500, 500)).toBe(0);
    });

    it('handles wrapped coordinates', () => {
      expect(distance(WORLD_WIDTH + 100, 200)).toBe(100);
    });
  });

  describe('direction', () => {
    it('returns 1 for rightward direct travel', () => {
      expect(direction(100, 500)).toBe(1);
    });

    it('returns -1 for leftward direct travel', () => {
      expect(direction(500, 100)).toBe(-1);
    });

    it('returns -1 when wrapping left is shorter', () => {
      // From 100 to 2500: direct right is 2400, wrapped left is 160
      expect(direction(100, 2500)).toBe(-1);
    });

    it('returns 1 when wrapping right is shorter', () => {
      // From 2500 to 100: direct left is 2400, wrapped right is 160
      expect(direction(2500, 100)).toBe(1);
    });
  });
});
