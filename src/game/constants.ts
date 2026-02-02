// Canvas dimensions
export const CANVAS_WIDTH = 640;
export const CANVAS_HEIGHT = 480;
export const CANVAS_SCALE = 2;
export const DISPLAY_WIDTH = CANVAS_WIDTH * CANVAS_SCALE;
export const DISPLAY_HEIGHT = CANVAS_HEIGHT * CANVAS_SCALE;

// World dimensions
export const WORLD_WIDTH = 2560;
export const GROUND_Y = 420;
export const RADAR_HEIGHT = 40;

// Ship parameters
export const SHIP_THRUST = 600;
export const SHIP_MAX_SPEED = 400;
export const SHIP_VERTICAL_SPEED = 300;
export const SHIP_DRAG = 0.98;
export const SHIP_WIDTH = 20;
export const SHIP_HEIGHT = 12;

// Laser parameters
export const LASER_SPEED = 800;
export const LASER_COOLDOWN = 200;
export const LASER_LIFESPAN = 500;
export const LASER_WIDTH = 12;
export const LASER_HEIGHT = 4;

// Lander parameters
export const LANDER_DESCENT_SPEED = 80;
export const LANDER_RISE_SPEED = 60;
export const LANDER_WIDTH = 16;
export const LANDER_HEIGHT = 16;
export const LANDER_GRAB_RADIUS = 15;

// Human parameters
export const HUMAN_WALK_SPEED = 30;
export const HUMAN_FALL_SPEED = 200;
export const HUMAN_CATCH_RADIUS = 30;
export const HUMAN_WIDTH = 10;
export const HUMAN_HEIGHT = 16;
export const HUMAN_COUNT = 10;

// Wave parameters
export const INITIAL_LANDER_COUNT = 4;
export const LANDER_COUNT_INCREMENT = 2;
export const MAX_LANDER_COUNT = 16;
export const INITIAL_LANDER_SPEED = 80;
export const LANDER_SPEED_INCREMENT = 10;
export const MAX_LANDER_SPEED = 160;
export const WAVE_SPAWN_DURATION = 5;

// Scoring
export const SCORE_LANDER = 150;
export const SCORE_LANDER_WITH_HUMAN = 200;
export const SCORE_CATCH_HUMAN = 250;
export const SCORE_RETURN_HUMAN = 500;
export const SCORE_WAVE_COMPLETE = 1000;

// Terrain
export const TERRAIN_RESOLUTION = 20;
export const TERRAIN_MIN_HEIGHT = 380;
export const TERRAIN_MAX_HEIGHT = 420;

// Lives
export const INITIAL_LIVES = 3;
export const RESPAWN_INVINCIBILITY = 2000;

// Colors
export const COLORS = {
  background: '#000011',
  stars: '#ffffff',
  terrain: '#00aa00',
  ship: '#00ffff',
  laser: '#ffffff',
  lander: '#ff4400',
  human: '#ffff00',
  humanGrabbed: '#ff8800',
  radarBg: '#001100',
  radarShip: '#ffffff',
  radarLander: '#ff0000',
  radarHuman: '#0088ff',
  radarHumanCarried: '#ffff00',
  explosion: '#ff8800',
};
