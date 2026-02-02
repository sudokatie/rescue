import { Lander, resetLanderIds } from '../game/Lander';
import { Human, resetHumanIds } from '../game/Human';
import { LANDER_DESCENT_SPEED, LANDER_RISE_SPEED, GROUND_Y } from '../game/constants';

describe('Lander', () => {
  beforeEach(() => {
    resetLanderIds();
    resetHumanIds();
  });

  describe('initialization', () => {
    it('starts at given position', () => {
      const lander = new Lander(500, -20);
      expect(lander.x).toBe(500);
      expect(lander.y).toBe(-20);
    });

    it('starts in descending state', () => {
      const lander = new Lander(500);
      expect(lander.state).toBe('descending');
    });

    it('assigns unique IDs', () => {
      const lander1 = new Lander(100);
      const lander2 = new Lander(200);
      expect(lander1.id).not.toBe(lander2.id);
    });

    it('starts with no target', () => {
      const lander = new Lander(500);
      expect(lander.targetHumanId).toBeNull();
    });

    it('starts not carrying anyone', () => {
      const lander = new Lander(500);
      expect(lander.carryingHumanId).toBeNull();
    });
  });

  describe('setTarget', () => {
    it('sets target human ID', () => {
      const lander = new Lander(500);
      lander.setTarget(5);
      expect(lander.targetHumanId).toBe(5);
    });
  });

  describe('descending', () => {
    it('moves downward', () => {
      const lander = new Lander(500, 100);
      const humans: Human[] = [];
      lander.update(0.1, humans);
      expect(lander.y).toBeGreaterThan(100);
    });

    it('moves toward target human', () => {
      const lander = new Lander(500, 100);
      const human = new Human(600);
      lander.setTarget(human.id);
      lander.update(0.1, [human]);
      expect(lander.x).toBeGreaterThan(500);
    });

    it('finds new target if current unavailable', () => {
      const lander = new Lander(500, 100);
      const human1 = new Human(600);
      human1.kill();
      const human2 = new Human(400);
      lander.setTarget(human1.id);
      lander.update(0.1, [human1, human2]);
      expect(lander.targetHumanId).toBe(human2.id);
    });

    it('transitions to grabbing when reaching human', () => {
      const lander = new Lander(500, GROUND_Y - 5);
      const human = new Human(500);
      lander.setTarget(human.id);
      lander.update(0.1, [human]);
      expect(lander.state).toBe('grabbing');
    });
  });

  describe('grabbing', () => {
    it('grabs human and transitions to rising', () => {
      const lander = new Lander(500, GROUND_Y);
      const human = new Human(500);
      lander.state = 'grabbing';
      lander.targetHumanId = human.id;
      lander.update(0, [human]);
      expect(human.state).toBe('grabbed');
      expect(lander.carryingHumanId).toBe(human.id);
      expect(lander.state).toBe('rising');
    });

    it('goes back to descending if target gone', () => {
      const lander = new Lander(500, GROUND_Y);
      lander.state = 'grabbing';
      lander.targetHumanId = 999; // Non-existent
      lander.update(0, []);
      expect(lander.state).toBe('descending');
      expect(lander.targetHumanId).toBeNull();
    });
  });

  describe('rising', () => {
    it('moves upward', () => {
      const lander = new Lander(500, 200);
      lander.state = 'rising';
      lander.update(0.1, []);
      expect(lander.y).toBeLessThan(200);
    });

    it('carries human along', () => {
      const lander = new Lander(500, 200);
      const human = new Human(500);
      human.grab();
      lander.state = 'rising';
      lander.carryingHumanId = human.id;
      lander.update(0.1, [human]);
      expect(human.y).toBeCloseTo(lander.y + 10);
    });
  });

  describe('hasEscaped', () => {
    it('returns true when rising with human above screen', () => {
      const lander = new Lander(500, -40);
      lander.state = 'rising';
      lander.carryingHumanId = 0;
      expect(lander.hasEscaped()).toBe(true);
    });

    it('returns false when rising without human', () => {
      const lander = new Lander(500, -40);
      lander.state = 'rising';
      expect(lander.hasEscaped()).toBe(false);
    });

    it('returns false when not high enough', () => {
      const lander = new Lander(500, 100);
      lander.state = 'rising';
      lander.carryingHumanId = 0;
      expect(lander.hasEscaped()).toBe(false);
    });
  });

  describe('destroy', () => {
    it('sets state to destroyed', () => {
      const lander = new Lander(500);
      lander.destroy();
      expect(lander.state).toBe('destroyed');
    });

    it('isAlive returns false when destroyed', () => {
      const lander = new Lander(500);
      lander.destroy();
      expect(lander.isAlive()).toBe(false);
    });
  });

  describe('getCarriedHumanId', () => {
    it('returns null when not carrying', () => {
      const lander = new Lander(500);
      expect(lander.getCarriedHumanId()).toBeNull();
    });

    it('returns human ID when carrying', () => {
      const lander = new Lander(500);
      lander.carryingHumanId = 5;
      expect(lander.getCarriedHumanId()).toBe(5);
    });
  });
});
