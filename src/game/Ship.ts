import { ShipData } from './types';
import {
  SHIP_THRUST,
  SHIP_MAX_SPEED,
  SHIP_VERTICAL_SPEED,
  SHIP_DRAG,
  WORLD_WIDTH,
  GROUND_Y,
  RADAR_HEIGHT,
  CANVAS_HEIGHT,
} from './constants';
import { wrapX } from './World';

export class Ship implements ShipData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  alive: boolean;

  constructor(x: number = WORLD_WIDTH / 2, y: number = CANVAS_HEIGHT / 2) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.alive = true;
  }

  /**
   * Apply horizontal thrust in given direction
   * Also sets facing direction
   */
  thrust(direction: 1 | -1, dt: number): void {
    this.facing = direction;
    this.vx += SHIP_THRUST * direction * dt;
    this.clampSpeed();
  }

  /**
   * Move vertically (direct, no momentum)
   */
  moveVertical(direction: 1 | -1): void {
    this.vy = SHIP_VERTICAL_SPEED * direction;
  }

  /**
   * Stop vertical movement
   */
  stopVertical(): void {
    this.vy = 0;
  }

  /**
   * Clamp horizontal speed to maximum
   */
  private clampSpeed(): void {
    if (this.vx > SHIP_MAX_SPEED) {
      this.vx = SHIP_MAX_SPEED;
    } else if (this.vx < -SHIP_MAX_SPEED) {
      this.vx = -SHIP_MAX_SPEED;
    }
  }

  /**
   * Update ship position and apply physics
   */
  update(dt: number): void {
    if (!this.alive) return;

    // Apply velocity
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Apply drag to horizontal velocity
    this.vx *= SHIP_DRAG;

    // Clamp vertical position
    const minY = RADAR_HEIGHT + 20;
    const maxY = GROUND_Y - 20;
    if (this.y < minY) this.y = minY;
    if (this.y > maxY) this.y = maxY;

    // Wrap horizontal position
    this.x = wrapX(this.x);
  }

  /**
   * Reset ship to spawn position
   */
  respawn(x: number = WORLD_WIDTH / 2, y: number = CANVAS_HEIGHT / 2): void {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.alive = true;
  }

  /**
   * Mark ship as destroyed
   */
  destroy(): void {
    this.alive = false;
  }

  /**
   * Get ship data as plain object
   */
  getData(): ShipData {
    return {
      x: this.x,
      y: this.y,
      vx: this.vx,
      vy: this.vy,
      facing: this.facing,
      alive: this.alive,
    };
  }
}
