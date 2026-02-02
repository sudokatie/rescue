import { Ship } from '../game/Ship';
import {
  SHIP_THRUST,
  SHIP_MAX_SPEED,
  SHIP_VERTICAL_SPEED,
  SHIP_DRAG,
  WORLD_WIDTH,
  GROUND_Y,
  RADAR_HEIGHT,
} from '../game/constants';

describe('Ship', () => {
  let ship: Ship;

  beforeEach(() => {
    ship = new Ship(1000, 300);
  });

  describe('initialization', () => {
    it('starts at given position', () => {
      expect(ship.x).toBe(1000);
      expect(ship.y).toBe(300);
    });

    it('starts with zero velocity', () => {
      expect(ship.vx).toBe(0);
      expect(ship.vy).toBe(0);
    });

    it('starts facing right', () => {
      expect(ship.facing).toBe(1);
    });

    it('starts alive', () => {
      expect(ship.alive).toBe(true);
    });
  });

  describe('thrust', () => {
    it('accelerates in thrust direction', () => {
      ship.thrust(1, 0.1);
      expect(ship.vx).toBeCloseTo(SHIP_THRUST * 0.1);
    });

    it('accelerates left when thrust direction is -1', () => {
      ship.thrust(-1, 0.1);
      expect(ship.vx).toBeCloseTo(-SHIP_THRUST * 0.1);
    });

    it('sets facing direction', () => {
      ship.thrust(-1, 0.1);
      expect(ship.facing).toBe(-1);
    });

    it('clamps speed at maximum', () => {
      // Apply lots of thrust
      for (let i = 0; i < 100; i++) {
        ship.thrust(1, 0.1);
      }
      expect(ship.vx).toBeLessThanOrEqual(SHIP_MAX_SPEED);
    });

    it('clamps negative speed at maximum', () => {
      for (let i = 0; i < 100; i++) {
        ship.thrust(-1, 0.1);
      }
      expect(ship.vx).toBeGreaterThanOrEqual(-SHIP_MAX_SPEED);
    });
  });

  describe('vertical movement', () => {
    it('sets vertical velocity directly', () => {
      ship.moveVertical(1);
      expect(ship.vy).toBe(SHIP_VERTICAL_SPEED);
    });

    it('moves up with negative direction', () => {
      ship.moveVertical(-1);
      expect(ship.vy).toBe(-SHIP_VERTICAL_SPEED);
    });

    it('stops vertical movement', () => {
      ship.moveVertical(1);
      ship.stopVertical();
      expect(ship.vy).toBe(0);
    });
  });

  describe('update', () => {
    it('applies velocity to position', () => {
      ship.vx = 100;
      ship.vy = 50;
      ship.update(0.1);
      expect(ship.x).toBeCloseTo(1010);
      expect(ship.y).toBeCloseTo(305);
    });

    it('applies drag to horizontal velocity', () => {
      ship.vx = 100;
      ship.update(0.016); // ~60fps
      expect(ship.vx).toBeCloseTo(100 * SHIP_DRAG);
    });

    it('wraps position at world boundary', () => {
      ship.x = WORLD_WIDTH - 10;
      ship.vx = 200;
      ship.update(0.1); // Move 20 pixels
      expect(ship.x).toBeLessThan(WORLD_WIDTH);
      expect(ship.x).toBe((WORLD_WIDTH - 10 + 20) % WORLD_WIDTH);
    });

    it('clamps vertical position at top', () => {
      ship.y = RADAR_HEIGHT + 10;
      ship.vy = -100;
      ship.update(0.1);
      expect(ship.y).toBeGreaterThanOrEqual(RADAR_HEIGHT + 20);
    });

    it('clamps vertical position at ground', () => {
      ship.y = GROUND_Y - 30;
      ship.vy = 200;
      ship.update(0.1);
      expect(ship.y).toBeLessThanOrEqual(GROUND_Y - 20);
    });

    it('does not update when dead', () => {
      ship.destroy();
      ship.vx = 100;
      const oldX = ship.x;
      ship.update(0.1);
      expect(ship.x).toBe(oldX);
    });
  });

  describe('respawn', () => {
    it('resets position', () => {
      ship.x = 100;
      ship.y = 100;
      ship.respawn(500, 250);
      expect(ship.x).toBe(500);
      expect(ship.y).toBe(250);
    });

    it('resets velocity', () => {
      ship.vx = 300;
      ship.vy = 200;
      ship.respawn();
      expect(ship.vx).toBe(0);
      expect(ship.vy).toBe(0);
    });

    it('resets alive status', () => {
      ship.destroy();
      ship.respawn();
      expect(ship.alive).toBe(true);
    });

    it('resets facing to right', () => {
      ship.facing = -1;
      ship.respawn();
      expect(ship.facing).toBe(1);
    });
  });
});
