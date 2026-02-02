import { LanderData, LanderState } from './types';
import { Human } from './Human';
import {
  LANDER_DESCENT_SPEED,
  LANDER_RISE_SPEED,
  LANDER_GRAB_RADIUS,
  GROUND_Y,
} from './constants';
import { direction, distance } from './World';

let nextLanderId = 0;

export class Lander implements LanderData {
  id: number;
  x: number;
  y: number;
  state: LanderState;
  targetHumanId: number | null;
  carryingHumanId: number | null;
  private speed: number;

  constructor(x: number, y: number = -20, speed: number = LANDER_DESCENT_SPEED) {
    this.id = nextLanderId++;
    this.x = x;
    this.y = y;
    this.state = 'descending';
    this.targetHumanId = null;
    this.carryingHumanId = null;
    this.speed = speed;
  }

  /**
   * Set target human to abduct
   */
  setTarget(humanId: number): void {
    this.targetHumanId = humanId;
  }

  /**
   * Update lander based on current state
   */
  update(dt: number, humans: Human[]): void {
    switch (this.state) {
      case 'descending':
        this.updateDescending(dt, humans);
        break;
      case 'grabbing':
        this.updateGrabbing(humans);
        break;
      case 'rising':
        this.updateRising(dt, humans);
        break;
      case 'destroyed':
        // No movement
        break;
    }
  }

  private updateDescending(dt: number, humans: Human[]): void {
    // Find target human
    const target = humans.find(h => h.id === this.targetHumanId);
    
    if (!target || !target.canBeGrabbed()) {
      // Find new target
      const available = humans.filter(h => h.canBeGrabbed());
      if (available.length > 0) {
        // Pick nearest
        let nearest = available[0];
        let nearestDist = distance(this.x, nearest.x);
        for (const h of available) {
          const d = distance(this.x, h.x);
          if (d < nearestDist) {
            nearest = h;
            nearestDist = d;
          }
        }
        this.targetHumanId = nearest.id;
      } else {
        // No targets, just descend
        this.y += this.speed * dt;
        return;
      }
    }

    // Move toward target
    const targetHuman = humans.find(h => h.id === this.targetHumanId);
    if (targetHuman) {
      // Horizontal movement toward target
      const dir = direction(this.x, targetHuman.x);
      this.x += dir * this.speed * 0.5 * dt;

      // Vertical descent
      this.y += this.speed * dt;

      // Check if reached human
      const dist = distance(this.x, targetHuman.x);
      if (dist < LANDER_GRAB_RADIUS && Math.abs(this.y - targetHuman.y) < LANDER_GRAB_RADIUS) {
        this.state = 'grabbing';
      }
    }
  }

  private updateGrabbing(humans: Human[]): void {
    const target = humans.find(h => h.id === this.targetHumanId);
    if (target && target.canBeGrabbed()) {
      target.grab();
      this.carryingHumanId = target.id;
      this.state = 'rising';
    } else {
      // Target gone, go back to descending
      this.state = 'descending';
      this.targetHumanId = null;
    }
  }

  private updateRising(dt: number, humans: Human[]): void {
    // Move upward (slower when carrying)
    this.y -= LANDER_RISE_SPEED * dt;

    // Update carried human position
    const carried = humans.find(h => h.id === this.carryingHumanId);
    if (carried) {
      carried.setPosition(this.x, this.y + 10);
    }
  }

  /**
   * Check if lander has escaped (reached top with human)
   */
  hasEscaped(): boolean {
    return this.state === 'rising' && this.y < -30 && this.carryingHumanId !== null;
  }

  /**
   * Check if lander is above visible area
   */
  isAboveWorld(): boolean {
    return this.y < -50;
  }

  /**
   * Destroy lander (hit by laser)
   */
  destroy(): void {
    this.state = 'destroyed';
  }

  /**
   * Get ID of carried human (if any)
   */
  getCarriedHumanId(): number | null {
    return this.carryingHumanId;
  }

  /**
   * Check if lander is alive (not destroyed)
   */
  isAlive(): boolean {
    return this.state !== 'destroyed';
  }

  /**
   * Get lander data as plain object
   */
  getData(): LanderData {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      state: this.state,
      targetHumanId: this.targetHumanId,
      carryingHumanId: this.carryingHumanId,
    };
  }
}

/**
 * Reset lander ID counter (for testing)
 */
export function resetLanderIds(): void {
  nextLanderId = 0;
}
