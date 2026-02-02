import { Laser, resetLaserIds } from '../game/Laser';
import { LASER_SPEED, LASER_LIFESPAN, WORLD_WIDTH } from '../game/constants';

describe('Laser', () => {
  beforeEach(() => {
    resetLaserIds();
  });

  describe('initialization', () => {
    it('starts at given position', () => {
      const laser = new Laser(100, 200, 1, 1000);
      expect(laser.x).toBe(100);
      expect(laser.y).toBe(200);
    });

    it('stores direction', () => {
      const laserRight = new Laser(100, 200, 1);
      expect(laserRight.dx).toBe(1);

      const laserLeft = new Laser(100, 200, -1);
      expect(laserLeft.dx).toBe(-1);
    });

    it('assigns unique IDs', () => {
      const laser1 = new Laser(100, 200, 1);
      const laser2 = new Laser(100, 200, 1);
      expect(laser1.id).not.toBe(laser2.id);
    });

    it('stores creation time', () => {
      const now = 5000;
      const laser = new Laser(100, 200, 1, now);
      expect(laser.createdAt).toBe(now);
    });
  });

  describe('update', () => {
    it('moves right when direction is 1', () => {
      const laser = new Laser(100, 200, 1);
      laser.update(0.1);
      expect(laser.x).toBeCloseTo(100 + LASER_SPEED * 0.1);
    });

    it('moves left when direction is -1', () => {
      const laser = new Laser(100, 200, -1);
      laser.update(0.1);
      expect(laser.x).toBeCloseTo(100 - LASER_SPEED * 0.1);
    });

    it('wraps at world boundary going right', () => {
      const laser = new Laser(WORLD_WIDTH - 10, 200, 1);
      laser.update(0.1); // Move more than 10 pixels
      expect(laser.x).toBeLessThan(WORLD_WIDTH);
    });

    it('wraps at world boundary going left', () => {
      const laser = new Laser(10, 200, -1);
      laser.update(0.1); // Move more than 10 pixels left
      expect(laser.x).toBeGreaterThan(0);
    });

    it('maintains y position', () => {
      const laser = new Laser(100, 200, 1);
      laser.update(0.1);
      expect(laser.y).toBe(200);
    });
  });

  describe('isExpired', () => {
    it('returns false when fresh', () => {
      const now = 10000;
      const laser = new Laser(100, 200, 1, now);
      expect(laser.isExpired(now + 100)).toBe(false);
    });

    it('returns false just before lifespan', () => {
      const now = 10000;
      const laser = new Laser(100, 200, 1, now);
      expect(laser.isExpired(now + LASER_LIFESPAN - 1)).toBe(false);
    });

    it('returns true after lifespan', () => {
      const now = 10000;
      const laser = new Laser(100, 200, 1, now);
      expect(laser.isExpired(now + LASER_LIFESPAN + 1)).toBe(true);
    });

    it('returns true exactly at lifespan', () => {
      const now = 10000;
      const laser = new Laser(100, 200, 1, now);
      expect(laser.isExpired(now + LASER_LIFESPAN + 1)).toBe(true);
    });
  });

  describe('getData', () => {
    it('returns plain object with all properties', () => {
      const laser = new Laser(100, 200, 1, 5000);
      const data = laser.getData();
      expect(data.x).toBe(100);
      expect(data.y).toBe(200);
      expect(data.dx).toBe(1);
      expect(data.createdAt).toBe(5000);
      expect(data.id).toBe(laser.id);
    });
  });
});
