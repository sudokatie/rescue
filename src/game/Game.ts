import { GameState } from './types';
import { Ship } from './Ship';
import { Laser, resetLaserIds } from './Laser';
import { Lander, resetLanderIds } from './Lander';
import { Human, resetHumanIds } from './Human';
import { generateTerrain, getHeightAt } from './Terrain';
import { TerrainPoint } from './types';
import {
  generateWave,
  spawnLanders,
  scoreLanderDestroyed,
  scoreCatchHuman,
  scoreReturnHuman,
  scoreWaveComplete,
} from './Wave';
import { checkAllCollisions } from './Collision';
import {
  WORLD_WIDTH,
  HUMAN_COUNT,
  INITIAL_LIVES,
  LASER_COOLDOWN,
  RESPAWN_INVINCIBILITY,
  GROUND_Y,
} from './constants';

export class Game {
  private _state: GameState;
  private _score: number;
  private _lives: number;
  private _wave: number;
  
  private _ship: Ship;
  private _lasers: Laser[];
  private _landers: Lander[];
  private _humans: Human[];
  private _terrain: TerrainPoint[];
  
  private _pendingSpawns: { lander: Lander; spawnTime: number }[];
  private _waveTimer: number;
  private _lastFireTime: number;
  private _invincibleUntil: number;

  constructor() {
    this._state = GameState.Menu;
    this._score = 0;
    this._lives = INITIAL_LIVES;
    this._wave = 0;
    
    this._ship = new Ship();
    this._lasers = [];
    this._landers = [];
    this._humans = [];
    this._terrain = generateTerrain();
    
    this._pendingSpawns = [];
    this._waveTimer = 0;
    this._lastFireTime = 0;
    this._invincibleUntil = 0;
    
    this.initializeHumans();
  }

  private initializeHumans(): void {
    resetHumanIds();
    this._humans = [];
    for (let i = 0; i < HUMAN_COUNT; i++) {
      const x = (i + 0.5) * (WORLD_WIDTH / HUMAN_COUNT);
      this._humans.push(new Human(x));
    }
  }

  // Getters
  get state(): GameState { return this._state; }
  get score(): number { return this._score; }
  get lives(): number { return this._lives; }
  get wave(): number { return this._wave; }
  get ship(): Ship { return this._ship; }
  get lasers(): Laser[] { return [...this._lasers]; }
  get landers(): Lander[] { return [...this._landers]; }
  get humans(): Human[] { return [...this._humans]; }
  get terrain(): TerrainPoint[] { return this._terrain; }

  /**
   * Start the game
   */
  start(): void {
    this._state = GameState.Playing;
    this._score = 0;
    this._lives = INITIAL_LIVES;
    this._wave = 0;
    this._ship.respawn();
    this._invincibleUntil = Date.now() + RESPAWN_INVINCIBILITY;
    this.startNextWave();
  }

  /**
   * Start the next wave
   */
  private startNextWave(): void {
    this._wave++;
    const waveData = generateWave(this._wave);
    this._pendingSpawns = spawnLanders(waveData, this._humans);
    this._waveTimer = 0;
    resetLanderIds();
    this._landers = [];
  }

  /**
   * Handle keyboard input
   */
  handleInput(keys: Set<string>, dt: number): void {
    if (this._state !== GameState.Playing) return;
    if (!this._ship.alive) return;

    // Horizontal thrust
    if (keys.has('ArrowLeft') || keys.has('KeyA')) {
      this._ship.thrust(-1, dt);
    }
    if (keys.has('ArrowRight') || keys.has('KeyD')) {
      this._ship.thrust(1, dt);
    }

    // Vertical movement
    if (keys.has('ArrowUp') || keys.has('KeyW')) {
      this._ship.moveVertical(-1);
    } else if (keys.has('ArrowDown') || keys.has('KeyS')) {
      this._ship.moveVertical(1);
    } else {
      this._ship.stopVertical();
    }

    // Fire
    if (keys.has('Space')) {
      this.fireLaser();
    }
  }

  /**
   * Fire a laser if cooldown allows
   */
  fireLaser(): void {
    const now = Date.now();
    if (now - this._lastFireTime < LASER_COOLDOWN) return;
    if (!this._ship.alive) return;

    this._lastFireTime = now;
    const laser = new Laser(
      this._ship.x,
      this._ship.y,
      this._ship.facing,
      now
    );
    this._lasers.push(laser);
  }

  /**
   * Main update loop
   */
  update(dt: number): void {
    if (this._state !== GameState.Playing) return;

    const now = Date.now();

    // Spawn pending landers
    this._waveTimer += dt;
    while (this._pendingSpawns.length > 0 && this._waveTimer >= this._pendingSpawns[0].spawnTime) {
      const spawn = this._pendingSpawns.shift()!;
      this._landers.push(spawn.lander);
    }

    // Update ship
    this._ship.update(dt);

    // Update lasers
    for (const laser of this._lasers) {
      laser.update(dt);
    }
    this._lasers = this._lasers.filter(l => !l.isExpired(now));

    // Update landers
    for (const lander of this._landers) {
      lander.update(dt, this._humans);
    }

    // Update humans
    for (const human of this._humans) {
      human.update(dt);
    }

    // Check collisions
    const isInvincible = now < this._invincibleUntil;
    const collisions = checkAllCollisions(this._ship, this._lasers, this._landers, this._humans);

    // Process lander destruction
    for (const landerId of collisions.destroyedLanders) {
      const lander = this._landers.find(l => l.id === landerId);
      if (lander) {
        const wasCarrying = lander.getCarriedHumanId() !== null;
        
        // Drop carried human
        if (wasCarrying) {
          const human = this._humans.find(h => h.id === lander.getCarriedHumanId());
          if (human) {
            human.drop();
          }
        }
        
        lander.destroy();
        this._score += scoreLanderDestroyed(wasCarrying);
      }
    }

    // Remove destroyed lasers
    this._lasers = this._lasers.filter(l => !collisions.destroyedLasers.includes(l.id));

    // Process human rescues
    for (const humanId of collisions.rescuedHumans) {
      const human = this._humans.find(h => h.id === humanId);
      if (human) {
        human.rescue();
        this._score += scoreCatchHuman();
      }
    }

    // Return rescued humans to ground when ship is near ground
    for (const human of this._humans) {
      if (human.state === 'rescued' && this._ship.y > GROUND_Y - 50) {
        human.returnToGround();
        this._score += scoreReturnHuman();
      }
    }

    // Check lander escapes (human mutates)
    for (const lander of this._landers) {
      if (lander.hasEscaped()) {
        const human = this._humans.find(h => h.id === lander.getCarriedHumanId());
        if (human) {
          human.kill();
        }
        lander.destroy();
      }
    }

    // Remove destroyed landers
    this._landers = this._landers.filter(l => l.isAlive());

    // Check ship death
    if (collisions.shipDied && !isInvincible) {
      this._ship.destroy();
      this._lives--;
      
      if (this._lives > 0) {
        // Respawn after brief delay
        setTimeout(() => {
          if (this._state === GameState.Playing) {
            this._ship.respawn();
            this._invincibleUntil = Date.now() + RESPAWN_INVINCIBILITY;
          }
        }, 1000);
      } else {
        this._state = GameState.GameOver;
      }
    }

    // Check wave completion
    if (this._landers.length === 0 && this._pendingSpawns.length === 0) {
      this._score += scoreWaveComplete(this._wave);
      this._state = GameState.WaveEnd;
    }
  }

  /**
   * Continue to next wave after wave end
   */
  continueToNextWave(): void {
    if (this._state !== GameState.WaveEnd) return;
    this._state = GameState.Playing;
    this.startNextWave();
  }

  /**
   * Reset game to initial state
   */
  reset(): void {
    this._state = GameState.Menu;
    this._score = 0;
    this._lives = INITIAL_LIVES;
    this._wave = 0;
    
    this._ship.respawn();
    this._lasers = [];
    this._landers = [];
    this._pendingSpawns = [];
    this._waveTimer = 0;
    this._lastFireTime = 0;
    
    resetLaserIds();
    resetLanderIds();
    this.initializeHumans();
    this._terrain = generateTerrain();
  }

  /**
   * Get count of alive humans
   */
  getAliveHumanCount(): number {
    return this._humans.filter(h => h.isAlive()).length;
  }
}
