import { WORLD_WIDTH } from './constants';

/**
 * Wrap x coordinate to world bounds [0, WORLD_WIDTH)
 */
export function wrapX(x: number): number {
  return ((x % WORLD_WIDTH) + WORLD_WIDTH) % WORLD_WIDTH;
}

/**
 * Calculate shortest distance between two x positions considering wraparound
 * Always returns a positive value
 */
export function distance(x1: number, x2: number): number {
  const wrapped1 = wrapX(x1);
  const wrapped2 = wrapX(x2);
  const direct = Math.abs(wrapped2 - wrapped1);
  const wrapped = WORLD_WIDTH - direct;
  return Math.min(direct, wrapped);
}

/**
 * Get direction to travel from x1 to x2 via shortest path
 * Returns -1 (left) or 1 (right)
 */
export function direction(from: number, to: number): -1 | 1 {
  const wrappedFrom = wrapX(from);
  const wrappedTo = wrapX(to);
  
  const directDist = wrappedTo - wrappedFrom;
  const directAbs = Math.abs(directDist);
  
  // If direct is shorter or equal, use it
  if (directAbs <= WORLD_WIDTH / 2) {
    return directDist >= 0 ? 1 : -1;
  }
  
  // Wrapped path is shorter
  return directDist >= 0 ? -1 : 1;
}
