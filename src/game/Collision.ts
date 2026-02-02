import { Ship } from './Ship';
import { Laser } from './Laser';
import { Lander } from './Lander';
import { Human } from './Human';
import { distance } from './World';
import {
  SHIP_WIDTH,
  SHIP_HEIGHT,
  LASER_WIDTH,
  LASER_HEIGHT,
  LANDER_WIDTH,
  LANDER_HEIGHT,
  HUMAN_CATCH_RADIUS,
} from './constants';

/**
 * Check if two rectangles overlap (AABB collision)
 */
function rectsOverlap(
  x1: number, y1: number, w1: number, h1: number,
  x2: number, y2: number, w2: number, h2: number
): boolean {
  return (
    x1 < x2 + w2 &&
    x1 + w1 > x2 &&
    y1 < y2 + h2 &&
    y1 + h1 > y2
  );
}

/**
 * Check if laser hits lander (considering wraparound)
 */
export function laserHitsLander(laser: Laser, lander: Lander): boolean {
  if (!lander.isAlive()) return false;

  // Calculate centered positions
  const laserX = laser.x - LASER_WIDTH / 2;
  const laserY = laser.y - LASER_HEIGHT / 2;
  const landerX = lander.x - LANDER_WIDTH / 2;
  const landerY = lander.y - LANDER_HEIGHT / 2;

  // Check direct overlap
  if (rectsOverlap(
    laserX, laserY, LASER_WIDTH, LASER_HEIGHT,
    landerX, landerY, LANDER_WIDTH, LANDER_HEIGHT
  )) {
    return true;
  }

  // Check if close enough considering wraparound
  const dist = distance(laser.x, lander.x);
  if (dist < (LASER_WIDTH + LANDER_WIDTH) / 2) {
    // Close horizontally, check vertical
    return Math.abs(laser.y - lander.y) < (LASER_HEIGHT + LANDER_HEIGHT) / 2;
  }

  return false;
}

/**
 * Check if ship collides with lander
 */
export function shipHitsLander(ship: Ship, lander: Lander): boolean {
  if (!ship.alive || !lander.isAlive()) return false;

  const dist = distance(ship.x, lander.x);
  if (dist < (SHIP_WIDTH + LANDER_WIDTH) / 2) {
    return Math.abs(ship.y - lander.y) < (SHIP_HEIGHT + LANDER_HEIGHT) / 2;
  }

  return false;
}

/**
 * Check if ship can catch falling human
 */
export function shipCatchesHuman(ship: Ship, human: Human): boolean {
  if (!ship.alive || !human.canBeRescued()) return false;

  const dist = distance(ship.x, human.x);
  const verticalDist = Math.abs(ship.y - human.y);

  return dist < HUMAN_CATCH_RADIUS && verticalDist < HUMAN_CATCH_RADIUS;
}

/**
 * Check if lander has reached human to grab
 */
export function landerReachesHuman(lander: Lander, human: Human): boolean {
  if (!lander.isAlive() || !human.canBeGrabbed()) return false;

  const dist = distance(lander.x, human.x);
  const verticalDist = Math.abs(lander.y - human.y);

  return dist < LANDER_WIDTH && verticalDist < LANDER_HEIGHT;
}

/**
 * Process all collisions for a frame
 */
export interface CollisionResult {
  destroyedLanders: number[];
  destroyedLasers: number[];
  rescuedHumans: number[];
  shipDied: boolean;
}

export function checkAllCollisions(
  ship: Ship,
  lasers: Laser[],
  landers: Lander[],
  humans: Human[]
): CollisionResult {
  const result: CollisionResult = {
    destroyedLanders: [],
    destroyedLasers: [],
    rescuedHumans: [],
    shipDied: false,
  };

  // Check laser-lander collisions
  for (const laser of lasers) {
    for (const lander of landers) {
      if (laserHitsLander(laser, lander)) {
        result.destroyedLanders.push(lander.id);
        result.destroyedLasers.push(laser.id);
      }
    }
  }

  // Check ship-lander collisions
  for (const lander of landers) {
    if (shipHitsLander(ship, lander)) {
      result.shipDied = true;
    }
  }

  // Check ship-human catches
  for (const human of humans) {
    if (shipCatchesHuman(ship, human)) {
      result.rescuedHumans.push(human.id);
    }
  }

  return result;
}
