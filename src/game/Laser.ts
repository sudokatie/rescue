import { LaserData } from './types';
import { LASER_SPEED, LASER_LIFESPAN, WORLD_WIDTH } from './constants';
import { wrapX } from './World';

let nextLaserId = 0;

export class Laser implements LaserData {
  id: number;
  x: number;
  y: number;
  dx: number;
  createdAt: number;

  constructor(x: number, y: number, direction: 1 | -1, createdAt: number = Date.now()) {
    this.id = nextLaserId++;
    this.x = x;
    this.y = y;
    this.dx = direction;
    this.createdAt = createdAt;
  }

  /**
   * Update laser position
   */
  update(dt: number): void {
    this.x += this.dx * LASER_SPEED * dt;
    this.x = wrapX(this.x);
  }

  /**
   * Check if laser has expired
   */
  isExpired(now: number = Date.now()): boolean {
    return now - this.createdAt > LASER_LIFESPAN;
  }

  /**
   * Get laser data as plain object
   */
  getData(): LaserData {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      dx: this.dx,
      createdAt: this.createdAt,
    };
  }
}

/**
 * Reset laser ID counter (for testing)
 */
export function resetLaserIds(): void {
  nextLaserId = 0;
}
