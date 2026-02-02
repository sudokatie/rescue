// Game state
export enum GameState {
  Menu = 'menu',
  Playing = 'playing',
  WaveEnd = 'wave_end',
  GameOver = 'game_over',
}

// Position
export interface Position {
  x: number;
  y: number;
}

// Ship data
export interface ShipData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  alive: boolean;
}

// Laser data
export interface LaserData {
  id: number;
  x: number;
  y: number;
  dx: number;
  createdAt: number;
}

// Lander states
export type LanderState = 'descending' | 'grabbing' | 'rising' | 'destroyed';

// Lander data
export interface LanderData {
  id: number;
  x: number;
  y: number;
  state: LanderState;
  targetHumanId: number | null;
  carryingHumanId: number | null;
}

// Human states
export type HumanState = 'walking' | 'grabbed' | 'falling' | 'rescued' | 'dead';

// Human data
export interface HumanData {
  id: number;
  x: number;
  y: number;
  state: HumanState;
  walkDirection: 1 | -1;
}

// Wave configuration
export interface WaveData {
  number: number;
  landerCount: number;
  landerSpeed: number;
}

// Terrain point
export interface TerrainPoint {
  x: number;
  y: number;
}
