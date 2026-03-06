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
  spawnSeededLanders,
  scoreLanderDestroyed,
  scoreCatchHuman,
  scoreReturnHuman,
  scoreWaveComplete,
} from './Wave';
import { SeededRNG, todaySeed, todayString, DailyLeaderboard } from './Daily';
import { checkAllCollisions } from './Collision';
import { Sound } from './Sound';
import { Replay, ReplayData, KeyAction, ReplayFrame } from './Replay';
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

  // Daily challenge state
  private _dailyMode: boolean = false;
  private _dailySeed: number = 0;
  private _dailyDate: string = '';
  private _dailyRng: SeededRNG | null = null;

  // Replay state
  private _replay: Replay = new Replay();
  private _isPlayback: boolean = false;
  private _lastReplayData: ReplayData | null = null;
  private _recordingEnabled: boolean = true;
  private _playbackKeys: Set<KeyAction> = new Set();

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
    this._dailyMode = false;
    this._dailyRng = null;
    this._ship.respawn();
    this._invincibleUntil = Date.now() + RESPAWN_INVINCIBILITY;
    this._isPlayback = false;
    this._playbackKeys.clear();
    if (this._recordingEnabled) {
      this._replay.startRecording(false);
    }
    this.startNextWave();
  }

  /** Start a daily challenge run */
  startDaily(): void {
    this._state = GameState.Playing;
    this._score = 0;
    this._lives = INITIAL_LIVES;
    this._wave = 0;
    this._dailyMode = true;
    this._dailySeed = todaySeed();
    this._dailyDate = todayString();
    this._dailyRng = new SeededRNG(this._dailySeed);
    this._ship.respawn();
    this._invincibleUntil = Date.now() + RESPAWN_INVINCIBILITY;
    this._isPlayback = false;
    this._playbackKeys.clear();
    if (this._recordingEnabled) {
      this._replay.startRecording(true);
    }
    this.startNextWave();
  }

  /** Check if currently in daily mode */
  isDailyMode(): boolean {
    return this._dailyMode;
  }

  /** Get today's daily leaderboard */
  getDailyLeaderboard(): ReturnType<typeof DailyLeaderboard.getToday> {
    return DailyLeaderboard.getToday();
  }

  /**
   * Start the next wave
   */
  private startNextWave(): void {
    this._wave++;
    const waveData = generateWave(this._wave);
    
    // Use seeded spawns in daily mode
    if (this._dailyMode && this._dailyRng) {
      this._pendingSpawns = spawnSeededLanders(waveData, this._humans, this._dailyRng);
    } else {
      this._pendingSpawns = spawnLanders(waveData, this._humans);
    }
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

    // In playback mode, use playback keys instead
    const activeKeys = this._isPlayback ? this._playbackKeys : keys;

    // Map key names to actions and record state changes
    const leftPressed = activeKeys.has('ArrowLeft') || activeKeys.has('KeyA') || activeKeys.has('left');
    const rightPressed = activeKeys.has('ArrowRight') || activeKeys.has('KeyD') || activeKeys.has('right');
    const upPressed = activeKeys.has('ArrowUp') || activeKeys.has('KeyW') || activeKeys.has('up');
    const downPressed = activeKeys.has('ArrowDown') || activeKeys.has('KeyS') || activeKeys.has('down');
    const firePressed = activeKeys.has('Space') || activeKeys.has('fire');

    // Record key events (only when not in playback)
    if (!this._isPlayback && this._recordingEnabled) {
      this.recordKeyState('left', leftPressed);
      this.recordKeyState('right', rightPressed);
      this.recordKeyState('up', upPressed);
      this.recordKeyState('down', downPressed);
      this.recordKeyState('fire', firePressed);
    }

    // Horizontal thrust
    if (leftPressed) {
      this._ship.thrust(-1, dt);
    }
    if (rightPressed) {
      this._ship.thrust(1, dt);
    }

    // Vertical movement
    if (upPressed) {
      this._ship.moveVertical(-1);
    } else if (downPressed) {
      this._ship.moveVertical(1);
    } else {
      this._ship.stopVertical();
    }

    // Fire
    if (firePressed) {
      this.fireLaser();
    }
  }

  /** Track and record key state changes */
  private _keyWasPressed: Map<KeyAction, boolean> = new Map();
  
  private recordKeyState(action: KeyAction, pressed: boolean): void {
    const wasPressed = this._keyWasPressed.get(action) || false;
    if (pressed && !wasPressed) {
      this._replay.recordKeyDown(action);
    } else if (!pressed && wasPressed) {
      this._replay.recordKeyUp(action);
    }
    this._keyWasPressed.set(action, pressed);
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
    Sound.play('shoot');
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
        Sound.play('explosion');
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
        Sound.play('humanRescue');
      }
    }

    // Return rescued humans to ground when ship is near ground
    for (const human of this._humans) {
      if (human.state === 'rescued' && this._ship.y > GROUND_Y - 50) {
        human.returnToGround();
        this._score += scoreReturnHuman();
        Sound.play('humanReturn');
      }
    }

    // Check lander escapes (human mutates)
    for (const lander of this._landers) {
      if (lander.hasEscaped()) {
        const human = this._humans.find(h => h.id === lander.getCarriedHumanId());
        if (human) {
          human.kill();
          Sound.play('humanDeath');
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
      Sound.play('shipDeath');
      
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
        Sound.play('gameOver');
        
        // Stop recording and save replay
        if (this._replay.isRecording) {
          this._lastReplayData = this._replay.stopRecording(
            this._score,
            this._wave,
            this.getAliveHumanCount()
          );
        }
        
        // Record to daily leaderboard if in daily mode
        if (this._dailyMode) {
          DailyLeaderboard.recordScore(
            'Player',
            this._score,
            this._wave,
            this.getAliveHumanCount()
          );
        }
      }
    }

    // Check wave completion
    if (this._landers.length === 0 && this._pendingSpawns.length === 0) {
      this._score += scoreWaveComplete(this._wave);
      Sound.play('waveComplete');
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
    
    // Clear daily mode state
    this._dailyMode = false;
    this._dailySeed = 0;
    this._dailyDate = '';
    this._dailyRng = null;
    
    // Clear replay state
    this._isPlayback = false;
    this._recordingEnabled = true;
    this._playbackKeys.clear();
    this._keyWasPressed.clear();
    
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

  toggleSound(): boolean {
    const newState = !Sound.isEnabled();
    Sound.setEnabled(newState);
    return newState;
  }

  isSoundEnabled(): boolean {
    return Sound.isEnabled();
  }

  // ==================
  // Replay Methods
  // ==================

  /** Start playback of a replay */
  startPlayback(data: ReplayData): void {
    // Reset game state for playback
    this.reset();
    this._state = GameState.Playing;
    this._score = 0;
    this._lives = INITIAL_LIVES;
    this._wave = 0;
    this._dailyMode = data.dailyMode;
    if (this._dailyMode) {
      this._dailySeed = todaySeed();
      this._dailyRng = new SeededRNG(this._dailySeed);
    }
    
    this._isPlayback = true;
    this._recordingEnabled = false;
    this._playbackKeys.clear();
    this._keyWasPressed.clear();
    
    this._ship.respawn();
    this._invincibleUntil = Date.now() + RESPAWN_INVINCIBILITY;
    this._replay.startPlayback(data);
    this.startNextWave();
  }

  /** Stop replay playback */
  stopPlayback(): void {
    this._replay.stopPlayback();
    this._isPlayback = false;
    this._recordingEnabled = true;
    this._playbackKeys.clear();
    this.reset();
  }

  /** Update playback state - call in game loop */
  updatePlayback(): void {
    if (!this._isPlayback) return;
    
    // Get all ready actions and update playback key state
    const actions = this._replay.getReadyActions();
    for (const frame of actions) {
      if (frame.pressed) {
        this._playbackKeys.add(frame.action);
      } else {
        this._playbackKeys.delete(frame.action);
      }
    }
    
    // Check if playback complete
    if (this._replay.isPlaybackComplete && this._state === GameState.Playing) {
      // Playback done - let game continue until natural end
    }
  }

  /** Check if currently in playback mode */
  isPlayback(): boolean {
    return this._isPlayback;
  }

  /** Get playback progress (0-1) */
  getPlaybackProgress(): number {
    return this._replay.playbackProgress;
  }

  /** Check if playback is complete */
  isPlaybackComplete(): boolean {
    return this._replay.isPlaybackComplete;
  }

  /** Get the last recorded replay data */
  getLastReplayData(): ReplayData | null {
    return this._lastReplayData;
  }

  /** Check if recording is enabled */
  isRecording(): boolean {
    return this._replay.isRecording;
  }
}
