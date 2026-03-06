/**
 * Key actions that can be recorded
 */
export type KeyAction = 'left' | 'right' | 'up' | 'down' | 'fire';

/**
 * A single recorded input event with timestamp
 */
export interface ReplayFrame {
  time: number;     // ms since replay start
  action: KeyAction;
  pressed: boolean; // true = key down, false = key up
}

/**
 * Complete replay data for a game session
 */
export interface ReplayData {
  version: number;
  timestamp: number;   // Unix timestamp when recorded
  duration: number;    // Total replay duration in ms
  frames: ReplayFrame[];
  finalScore: number;
  finalWave: number;
  humansAlive: number;
  dailyMode: boolean;
}

/**
 * Encodes a key action to a single character
 */
function encodeAction(action: KeyAction): string {
  switch (action) {
    case 'left': return 'l';
    case 'right': return 'r';
    case 'up': return 'u';
    case 'down': return 'd';
    case 'fire': return 'f';
  }
}

/**
 * Decodes a single character back to KeyAction
 */
function decodeAction(char: string): KeyAction | null {
  switch (char) {
    case 'l': return 'left';
    case 'r': return 'right';
    case 'u': return 'up';
    case 'd': return 'down';
    case 'f': return 'fire';
    default: return null;
  }
}

/**
 * Replay recorder and player for Rescue
 */
export class Replay {
  private _frames: ReplayFrame[] = [];
  private _startTime: number = 0;
  private _isRecording: boolean = false;
  private _isPlaying: boolean = false;
  private _playbackIndex: number = 0;
  private _playbackStartTime: number = 0;
  private _dailyMode: boolean = false;
  
  // Track key state to avoid duplicate records
  private _keyState: Map<KeyAction, boolean> = new Map();

  /**
   * Start recording inputs
   */
  startRecording(dailyMode: boolean = false): void {
    this._frames = [];
    this._startTime = Date.now();
    this._isRecording = true;
    this._isPlaying = false;
    this._dailyMode = dailyMode;
    this._keyState.clear();
  }

  /**
   * Record a key press event
   */
  recordKeyDown(action: KeyAction): void {
    if (!this._isRecording) return;
    
    // Skip if key already pressed
    if (this._keyState.get(action)) return;
    this._keyState.set(action, true);
    
    this._frames.push({
      time: Date.now() - this._startTime,
      action,
      pressed: true,
    });
  }

  /**
   * Record a key release event
   */
  recordKeyUp(action: KeyAction): void {
    if (!this._isRecording) return;
    
    // Skip if key not pressed
    if (!this._keyState.get(action)) return;
    this._keyState.set(action, false);
    
    this._frames.push({
      time: Date.now() - this._startTime,
      action,
      pressed: false,
    });
  }

  /**
   * Stop recording and return the replay data
   */
  stopRecording(finalScore: number, finalWave: number, humansAlive: number): ReplayData {
    this._isRecording = false;
    
    return {
      version: 1,
      timestamp: this._startTime,
      duration: Date.now() - this._startTime,
      frames: [...this._frames],
      finalScore,
      finalWave,
      humansAlive,
      dailyMode: this._dailyMode,
    };
  }

  /**
   * Check if currently recording
   */
  get isRecording(): boolean {
    return this._isRecording;
  }

  /**
   * Start playback of a replay
   */
  startPlayback(data: ReplayData): void {
    this._frames = [...data.frames];
    this._playbackIndex = 0;
    this._playbackStartTime = Date.now();
    this._isPlaying = true;
    this._isRecording = false;
    this._dailyMode = data.dailyMode;
  }

  /**
   * Get all actions ready for current time
   * Returns array of actions to apply (may be empty)
   */
  getReadyActions(): ReplayFrame[] {
    if (!this._isPlaying) return [];
    
    const ready: ReplayFrame[] = [];
    const elapsed = Date.now() - this._playbackStartTime;
    
    while (this._playbackIndex < this._frames.length) {
      const frame = this._frames[this._playbackIndex];
      if (elapsed >= frame.time) {
        ready.push(frame);
        this._playbackIndex++;
      } else {
        break;
      }
    }
    
    return ready;
  }

  /**
   * Check if playback is complete
   */
  get isPlaybackComplete(): boolean {
    return this._isPlaying && this._playbackIndex >= this._frames.length;
  }

  /**
   * Check if currently playing back
   */
  get isPlaying(): boolean {
    return this._isPlaying;
  }

  /**
   * Stop playback
   */
  stopPlayback(): void {
    this._isPlaying = false;
    this._playbackIndex = 0;
  }

  /**
   * Get playback progress (0-1)
   */
  get playbackProgress(): number {
    if (!this._isPlaying || this._frames.length === 0) return 0;
    return this._playbackIndex / this._frames.length;
  }

  /**
   * Get daily mode flag for current replay
   */
  get dailyMode(): boolean {
    return this._dailyMode;
  }

  /**
   * Encode replay data to a shareable string
   * Format: version|timestamp|duration|score|wave|humans|daily|frames
   * Frames: time,action,pressed;...
   */
  static encode(data: ReplayData): string {
    const framesStr = data.frames
      .map(f => `${f.time},${encodeAction(f.action)},${f.pressed ? 1 : 0}`)
      .join(';');
    
    const parts = [
      data.version,
      data.timestamp,
      data.duration,
      data.finalScore,
      data.finalWave,
      data.humansAlive,
      data.dailyMode ? 1 : 0,
      framesStr,
    ];
    
    return btoa(parts.join('|'));
  }

  /**
   * Decode a replay string back to ReplayData
   */
  static decode(encoded: string): ReplayData | null {
    try {
      const decoded = atob(encoded);
      const parts = decoded.split('|');
      
      if (parts.length < 8) return null;
      
      const [version, timestamp, duration, score, wave, humans, daily, framesStr] = parts;
      
      const frames: ReplayFrame[] = framesStr
        .split(';')
        .filter(f => f.length > 0)
        .map(f => {
          const [time, actionChar, pressed] = f.split(',');
          const action = decodeAction(actionChar);
          if (!action) return null;
          return { 
            time: parseInt(time, 10), 
            action, 
            pressed: pressed === '1' 
          };
        })
        .filter((f): f is ReplayFrame => f !== null);
      
      return {
        version: parseInt(version, 10),
        timestamp: parseInt(timestamp, 10),
        duration: parseInt(duration, 10),
        frames,
        finalScore: parseInt(score, 10),
        finalWave: parseInt(wave, 10),
        humansAlive: parseInt(humans, 10),
        dailyMode: daily === '1',
      };
    } catch {
      return null;
    }
  }

  /**
   * Get replay statistics
   */
  static getStats(data: ReplayData): {
    totalInputs: number;
    inputsPerSecond: number;
    thrustLeft: number;
    thrustRight: number;
    moveUp: number;
    moveDown: number;
    fireCount: number;
    durationSeconds: number;
  } {
    let thrustLeft = 0;
    let thrustRight = 0;
    let moveUp = 0;
    let moveDown = 0;
    let fireCount = 0;
    
    // Only count key presses, not releases
    for (const frame of data.frames) {
      if (!frame.pressed) continue;
      switch (frame.action) {
        case 'left': thrustLeft++; break;
        case 'right': thrustRight++; break;
        case 'up': moveUp++; break;
        case 'down': moveDown++; break;
        case 'fire': fireCount++; break;
      }
    }
    
    const durationSec = data.duration / 1000;
    const totalPresses = thrustLeft + thrustRight + moveUp + moveDown + fireCount;
    
    return {
      totalInputs: totalPresses,
      inputsPerSecond: durationSec > 0 ? totalPresses / durationSec : 0,
      thrustLeft,
      thrustRight,
      moveUp,
      moveDown,
      fireCount,
      durationSeconds: durationSec,
    };
  }

  /**
   * Generate share code for a replay
   */
  static generateShareCode(data: ReplayData): string {
    const dateStr = new Date(data.timestamp).toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = data.dailyMode ? 'RESCUE-D' : 'RESCUE';
    return `${prefix}-${dateStr}-${data.finalScore}-W${data.finalWave}`;
  }
}
