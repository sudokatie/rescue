import {
  laserHitsLander,
  shipHitsLander,
  shipCatchesHuman,
  landerReachesHuman,
  checkAllCollisions,
} from '../game/Collision';
import { Ship } from '../game/Ship';
import { Laser, resetLaserIds } from '../game/Laser';
import { Lander, resetLanderIds } from '../game/Lander';
import { Human, resetHumanIds } from '../game/Human';
import { HUMAN_CATCH_RADIUS } from '../game/constants';

describe('Collision', () => {
  beforeEach(() => {
    resetLaserIds();
    resetLanderIds();
    resetHumanIds();
  });

  describe('laserHitsLander', () => {
    it('returns true when overlapping', () => {
      const laser = new Laser(500, 200, 1);
      const lander = new Lander(500, 200);
      expect(laserHitsLander(laser, lander)).toBe(true);
    });

    it('returns false when far apart', () => {
      const laser = new Laser(100, 200, 1);
      const lander = new Lander(500, 200);
      expect(laserHitsLander(laser, lander)).toBe(false);
    });

    it('returns false when lander destroyed', () => {
      const laser = new Laser(500, 200, 1);
      const lander = new Lander(500, 200);
      lander.destroy();
      expect(laserHitsLander(laser, lander)).toBe(false);
    });

    it('detects hit at edge of hitbox', () => {
      const laser = new Laser(500, 200, 1);
      const lander = new Lander(510, 200); // Close but should hit
      expect(laserHitsLander(laser, lander)).toBe(true);
    });
  });

  describe('shipHitsLander', () => {
    it('returns true when overlapping', () => {
      const ship = new Ship(500, 200);
      const lander = new Lander(500, 200);
      expect(shipHitsLander(ship, lander)).toBe(true);
    });

    it('returns false when far apart', () => {
      const ship = new Ship(100, 200);
      const lander = new Lander(500, 200);
      expect(shipHitsLander(ship, lander)).toBe(false);
    });

    it('returns false when ship dead', () => {
      const ship = new Ship(500, 200);
      ship.destroy();
      const lander = new Lander(500, 200);
      expect(shipHitsLander(ship, lander)).toBe(false);
    });

    it('returns false when lander destroyed', () => {
      const ship = new Ship(500, 200);
      const lander = new Lander(500, 200);
      lander.destroy();
      expect(shipHitsLander(ship, lander)).toBe(false);
    });
  });

  describe('shipCatchesHuman', () => {
    it('returns true when ship near falling human', () => {
      const ship = new Ship(500, 200);
      const human = new Human(500);
      human.state = 'falling';
      human.y = 200;
      expect(shipCatchesHuman(ship, human)).toBe(true);
    });

    it('returns false when human not falling', () => {
      const ship = new Ship(500, 200);
      const human = new Human(500);
      human.y = 200;
      expect(shipCatchesHuman(ship, human)).toBe(false);
    });

    it('returns false when too far away', () => {
      const ship = new Ship(500, 200);
      const human = new Human(600);
      human.state = 'falling';
      human.y = 200;
      expect(shipCatchesHuman(ship, human)).toBe(false);
    });

    it('returns false when ship dead', () => {
      const ship = new Ship(500, 200);
      ship.destroy();
      const human = new Human(500);
      human.state = 'falling';
      human.y = 200;
      expect(shipCatchesHuman(ship, human)).toBe(false);
    });

    it('catches within radius', () => {
      const ship = new Ship(500, 200);
      const human = new Human(500 + HUMAN_CATCH_RADIUS - 5);
      human.state = 'falling';
      human.y = 200;
      expect(shipCatchesHuman(ship, human)).toBe(true);
    });
  });

  describe('landerReachesHuman', () => {
    it('returns true when lander at human', () => {
      const lander = new Lander(500, 420);
      const human = new Human(500);
      expect(landerReachesHuman(lander, human)).toBe(true);
    });

    it('returns false when human not walking', () => {
      const lander = new Lander(500, 420);
      const human = new Human(500);
      human.grab();
      expect(landerReachesHuman(lander, human)).toBe(false);
    });

    it('returns false when far apart', () => {
      const lander = new Lander(500, 100);
      const human = new Human(500);
      expect(landerReachesHuman(lander, human)).toBe(false);
    });
  });

  describe('checkAllCollisions', () => {
    it('detects laser-lander collision', () => {
      const ship = new Ship(100, 100);
      const laser = new Laser(500, 200, 1);
      const lander = new Lander(500, 200);
      const result = checkAllCollisions(ship, [laser], [lander], []);
      expect(result.destroyedLanders).toContain(lander.id);
      expect(result.destroyedLasers).toContain(laser.id);
    });

    it('detects ship-lander collision', () => {
      const ship = new Ship(500, 200);
      const lander = new Lander(500, 200);
      const result = checkAllCollisions(ship, [], [lander], []);
      expect(result.shipDied).toBe(true);
    });

    it('detects human rescue', () => {
      const ship = new Ship(500, 200);
      const human = new Human(500);
      human.state = 'falling';
      human.y = 200;
      const result = checkAllCollisions(ship, [], [], [human]);
      expect(result.rescuedHumans).toContain(human.id);
    });

    it('returns empty results when no collisions', () => {
      const ship = new Ship(100, 100);
      const result = checkAllCollisions(ship, [], [], []);
      expect(result.destroyedLanders).toHaveLength(0);
      expect(result.destroyedLasers).toHaveLength(0);
      expect(result.rescuedHumans).toHaveLength(0);
      expect(result.shipDied).toBe(false);
    });
  });
});
