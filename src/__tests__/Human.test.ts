import { Human, resetHumanIds } from '../game/Human';
import { HUMAN_WALK_SPEED, HUMAN_FALL_SPEED, GROUND_Y, WORLD_WIDTH } from '../game/constants';

describe('Human', () => {
  beforeEach(() => {
    resetHumanIds();
  });

  describe('initialization', () => {
    it('starts at given position', () => {
      const human = new Human(500);
      expect(human.x).toBe(500);
      expect(human.y).toBe(GROUND_Y);
    });

    it('starts in walking state', () => {
      const human = new Human(500);
      expect(human.state).toBe('walking');
    });

    it('assigns unique IDs', () => {
      const human1 = new Human(100);
      const human2 = new Human(200);
      expect(human1.id).not.toBe(human2.id);
    });

    it('has random walk direction', () => {
      // Create many humans, should get mix of directions
      const directions = new Set<number>();
      for (let i = 0; i < 20; i++) {
        const human = new Human(100);
        directions.add(human.walkDirection);
      }
      expect(directions.size).toBe(2);
    });
  });

  describe('walking', () => {
    it('moves in walk direction', () => {
      const human = new Human(500);
      human.walkDirection = 1;
      human.update(0.1);
      expect(human.x).toBeCloseTo(500 + HUMAN_WALK_SPEED * 0.1);
    });

    it('moves left when direction is -1', () => {
      const human = new Human(500);
      human.walkDirection = -1;
      human.update(0.1);
      expect(human.x).toBeCloseTo(500 - HUMAN_WALK_SPEED * 0.1);
    });

    it('wraps at world boundary', () => {
      const human = new Human(WORLD_WIDTH - 1);
      human.walkDirection = 1;
      human.update(1); // Walk a full second
      expect(human.x).toBeLessThan(WORLD_WIDTH);
    });

    it('stays at ground level', () => {
      const human = new Human(500);
      human.update(1);
      expect(human.y).toBe(GROUND_Y);
    });
  });

  describe('grab', () => {
    it('transitions from walking to grabbed', () => {
      const human = new Human(500);
      human.grab();
      expect(human.state).toBe('grabbed');
    });

    it('does not transition if not walking', () => {
      const human = new Human(500);
      human.state = 'falling';
      human.grab();
      expect(human.state).toBe('falling');
    });

    it('can be grabbed check returns true when walking', () => {
      const human = new Human(500);
      expect(human.canBeGrabbed()).toBe(true);
    });

    it('can be grabbed check returns false when not walking', () => {
      const human = new Human(500);
      human.grab();
      expect(human.canBeGrabbed()).toBe(false);
    });
  });

  describe('drop and falling', () => {
    it('transitions from grabbed to falling', () => {
      const human = new Human(500);
      human.grab();
      human.setPosition(500, 200);
      human.drop();
      expect(human.state).toBe('falling');
    });

    it('falls downward when in falling state', () => {
      const human = new Human(500);
      human.state = 'falling';
      human.y = 200;
      human.update(0.1);
      expect(human.y).toBeCloseTo(200 + HUMAN_FALL_SPEED * 0.1);
    });

    it('dies when hitting ground', () => {
      const human = new Human(500);
      human.state = 'falling';
      human.y = GROUND_Y - 10;
      human.update(1); // Should hit ground
      expect(human.state).toBe('dead');
      expect(human.y).toBe(GROUND_Y);
    });
  });

  describe('rescue', () => {
    it('transitions from falling to rescued', () => {
      const human = new Human(500);
      human.state = 'falling';
      human.y = 200;
      human.rescue();
      expect(human.state).toBe('rescued');
    });

    it('can be rescued check returns true when falling', () => {
      const human = new Human(500);
      human.state = 'falling';
      expect(human.canBeRescued()).toBe(true);
    });

    it('can be rescued check returns false when not falling', () => {
      const human = new Human(500);
      expect(human.canBeRescued()).toBe(false);
    });
  });

  describe('returnToGround', () => {
    it('transitions from rescued to walking', () => {
      const human = new Human(500);
      human.state = 'rescued';
      human.y = 200;
      human.returnToGround();
      expect(human.state).toBe('walking');
      expect(human.y).toBe(GROUND_Y);
    });

    it('does not transition if not rescued', () => {
      const human = new Human(500);
      human.returnToGround();
      expect(human.state).toBe('walking');
    });
  });

  describe('setPosition', () => {
    it('updates position', () => {
      const human = new Human(500);
      human.setPosition(300, 150);
      expect(human.x).toBe(300);
      expect(human.y).toBe(150);
    });
  });

  describe('isAlive', () => {
    it('returns true for walking', () => {
      const human = new Human(500);
      expect(human.isAlive()).toBe(true);
    });

    it('returns true for grabbed', () => {
      const human = new Human(500);
      human.grab();
      expect(human.isAlive()).toBe(true);
    });

    it('returns true for falling', () => {
      const human = new Human(500);
      human.state = 'falling';
      expect(human.isAlive()).toBe(true);
    });

    it('returns false for dead', () => {
      const human = new Human(500);
      human.kill();
      expect(human.isAlive()).toBe(false);
    });
  });
});
