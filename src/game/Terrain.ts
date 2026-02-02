import { TerrainPoint } from './types';
import {
  WORLD_WIDTH,
  TERRAIN_RESOLUTION,
  TERRAIN_MIN_HEIGHT,
  TERRAIN_MAX_HEIGHT,
} from './constants';

/**
 * Generate terrain points with smooth random variation
 */
export function generateTerrain(): TerrainPoint[] {
  const points: TerrainPoint[] = [];
  const count = Math.ceil(WORLD_WIDTH / TERRAIN_RESOLUTION) + 1;
  
  // Use a simple noise-like approach
  let height = (TERRAIN_MIN_HEIGHT + TERRAIN_MAX_HEIGHT) / 2;
  const variance = (TERRAIN_MAX_HEIGHT - TERRAIN_MIN_HEIGHT) / 2;
  
  for (let i = 0; i < count; i++) {
    const x = i * TERRAIN_RESOLUTION;
    
    // Random walk with tendency toward center
    const centerPull = ((TERRAIN_MIN_HEIGHT + TERRAIN_MAX_HEIGHT) / 2 - height) * 0.1;
    const change = (Math.random() - 0.5) * variance * 0.5 + centerPull;
    height = Math.max(TERRAIN_MIN_HEIGHT, Math.min(TERRAIN_MAX_HEIGHT, height + change));
    
    points.push({ x, y: height });
  }
  
  // Ensure seamless wrap by averaging first and last point
  const avgHeight = (points[0].y + points[points.length - 1].y) / 2;
  points[0].y = avgHeight;
  points[points.length - 1].y = avgHeight;
  
  return points;
}

/**
 * Get interpolated terrain height at any x position
 */
export function getHeightAt(terrain: TerrainPoint[], x: number): number {
  // Wrap x to world bounds
  const wrappedX = ((x % WORLD_WIDTH) + WORLD_WIDTH) % WORLD_WIDTH;
  
  // Find surrounding points
  const index = Math.floor(wrappedX / TERRAIN_RESOLUTION);
  const nextIndex = (index + 1) % terrain.length;
  
  if (index >= terrain.length) {
    return TERRAIN_MAX_HEIGHT;
  }
  
  const p1 = terrain[index];
  const p2 = terrain[nextIndex];
  
  // Linear interpolation
  const t = (wrappedX - p1.x) / TERRAIN_RESOLUTION;
  return p1.y + (p2.y - p1.y) * t;
}
