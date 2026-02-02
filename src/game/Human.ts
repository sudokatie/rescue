import { HumanData, HumanState } from './types';
import {
  HUMAN_WALK_SPEED,
  HUMAN_FALL_SPEED,
  WORLD_WIDTH,
  GROUND_Y,
} from './constants';
import { wrapX } from './World';

let nextHumanId = 0;

export class Human implements HumanData {
  id: number;
  x: number;
  y: number;
  state: HumanState;
  walkDirection: 1 | -1;
  private directionChangeTimer: number;

  constructor(x: number, y: number = GROUND_Y) {
    this.id = nextHumanId++;
    this.x = x;
    this.y = y;
    this.state = 'walking';
    this.walkDirection = Math.random() > 0.5 ? 1 : -1;
    this.directionChangeTimer = Math.random() * 5 + 2; // 2-7 seconds
  }

  /**
   * Update human based on current state
   */
  update(dt: number): void {
    switch (this.state) {
      case 'walking':
        this.updateWalking(dt);
        break;
      case 'falling':
        this.updateFalling(dt);
        break;
      case 'grabbed':
      case 'rescued':
      case 'dead':
        // No autonomous movement
        break;
    }
  }

  private updateWalking(dt: number): void {
    // Move in walk direction
    this.x += this.walkDirection * HUMAN_WALK_SPEED * dt;
    this.x = wrapX(this.x);

    // Random direction change
    this.directionChangeTimer -= dt;
    if (this.directionChangeTimer <= 0) {
      this.walkDirection = this.walkDirection === 1 ? -1 : 1;
      this.directionChangeTimer = Math.random() * 5 + 2;
    }
  }

  private updateFalling(dt: number): void {
    this.y += HUMAN_FALL_SPEED * dt;

    // Check if landed
    if (this.y >= GROUND_Y) {
      this.y = GROUND_Y;
      this.state = 'dead';
    }
  }

  /**
   * Set position (used when grabbed by lander)
   */
  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  /**
   * Human is grabbed by a lander
   */
  grab(): void {
    if (this.state === 'walking') {
      this.state = 'grabbed';
    }
  }

  /**
   * Human is dropped (lander destroyed while carrying)
   */
  drop(): void {
    if (this.state === 'grabbed') {
      this.state = 'falling';
    }
  }

  /**
   * Human is caught by player while falling
   */
  rescue(): void {
    if (this.state === 'falling') {
      this.state = 'rescued';
    }
  }

  /**
   * Human is returned to ground after rescue
   */
  returnToGround(): void {
    if (this.state === 'rescued') {
      this.y = GROUND_Y;
      this.state = 'walking';
      this.directionChangeTimer = Math.random() * 5 + 2;
    }
  }

  /**
   * Human mutates (reached top with lander) or falls to death
   */
  kill(): void {
    this.state = 'dead';
  }

  /**
   * Check if human is alive and can be interacted with
   */
  isAlive(): boolean {
    return this.state !== 'dead';
  }

  /**
   * Check if human can be grabbed by lander
   */
  canBeGrabbed(): boolean {
    return this.state === 'walking';
  }

  /**
   * Check if human can be rescued by player
   */
  canBeRescued(): boolean {
    return this.state === 'falling';
  }

  /**
   * Get human data as plain object
   */
  getData(): HumanData {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      state: this.state,
      walkDirection: this.walkDirection,
    };
  }
}

/**
 * Reset human ID counter (for testing)
 */
export function resetHumanIds(): void {
  nextHumanId = 0;
}
