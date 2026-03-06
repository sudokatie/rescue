import { Replay, ReplayData, ReplayFrame } from '../Replay';

describe('Replay', () => {
  describe('recording', () => {
    it('should start recording', () => {
      const replay = new Replay();
      expect(replay.isRecording).toBe(false);
      
      replay.startRecording();
      expect(replay.isRecording).toBe(true);
    });

    it('should record key down events', () => {
      const replay = new Replay();
      replay.startRecording();
      
      replay.recordKeyDown('left');
      replay.recordKeyDown('fire');
      
      const data = replay.stopRecording(100, 5, 3);
      expect(data.frames.length).toBe(2);
      expect(data.frames[0].action).toBe('left');
      expect(data.frames[0].pressed).toBe(true);
      expect(data.frames[1].action).toBe('fire');
      expect(data.frames[1].pressed).toBe(true);
    });

    it('should record key up events', () => {
      const replay = new Replay();
      replay.startRecording();
      
      replay.recordKeyDown('right');
      replay.recordKeyUp('right');
      
      const data = replay.stopRecording(100, 5, 3);
      expect(data.frames.length).toBe(2);
      expect(data.frames[0].pressed).toBe(true);
      expect(data.frames[1].pressed).toBe(false);
    });

    it('should skip duplicate key events', () => {
      const replay = new Replay();
      replay.startRecording();
      
      replay.recordKeyDown('left');
      replay.recordKeyDown('left'); // Should be ignored
      replay.recordKeyUp('left');
      replay.recordKeyUp('left'); // Should be ignored
      
      const data = replay.stopRecording(100, 5, 3);
      expect(data.frames.length).toBe(2);
    });

    it('should not record when not recording', () => {
      const replay = new Replay();
      
      replay.recordKeyDown('left');
      replay.recordKeyUp('left');
      
      replay.startRecording();
      const data = replay.stopRecording(100, 5, 3);
      expect(data.frames.length).toBe(0);
    });

    it('should include final stats in data', () => {
      const replay = new Replay();
      replay.startRecording(true);
      
      const data = replay.stopRecording(5000, 10, 4);
      
      expect(data.finalScore).toBe(5000);
      expect(data.finalWave).toBe(10);
      expect(data.humansAlive).toBe(4);
      expect(data.dailyMode).toBe(true);
    });
  });

  describe('playback', () => {
    it('should start playback', () => {
      const replay = new Replay();
      const data: ReplayData = {
        version: 1,
        timestamp: Date.now(),
        duration: 1000,
        frames: [
          { time: 0, action: 'left', pressed: true },
        ],
        finalScore: 100,
        finalWave: 5,
        humansAlive: 3,
        dailyMode: false,
      };
      
      replay.startPlayback(data);
      expect(replay.isPlaying).toBe(true);
    });

    it('should get ready actions', async () => {
      const replay = new Replay();
      const data: ReplayData = {
        version: 1,
        timestamp: Date.now(),
        duration: 1000,
        frames: [
          { time: 0, action: 'left', pressed: true },
          { time: 10, action: 'fire', pressed: true },
        ],
        finalScore: 100,
        finalWave: 5,
        humansAlive: 3,
        dailyMode: false,
      };
      
      replay.startPlayback(data);
      
      // First action should be ready immediately
      const actions = replay.getReadyActions();
      expect(actions.length).toBeGreaterThanOrEqual(1);
      expect(actions[0].action).toBe('left');
    });

    it('should track playback progress', () => {
      const replay = new Replay();
      const data: ReplayData = {
        version: 1,
        timestamp: Date.now(),
        duration: 1000,
        frames: [
          { time: 0, action: 'left', pressed: true },
          { time: 0, action: 'left', pressed: false },
        ],
        finalScore: 100,
        finalWave: 5,
        humansAlive: 3,
        dailyMode: false,
      };
      
      replay.startPlayback(data);
      expect(replay.playbackProgress).toBe(0);
      
      replay.getReadyActions();
      expect(replay.playbackProgress).toBe(1);
      expect(replay.isPlaybackComplete).toBe(true);
    });

    it('should stop playback', () => {
      const replay = new Replay();
      const data: ReplayData = {
        version: 1,
        timestamp: Date.now(),
        duration: 1000,
        frames: [{ time: 0, action: 'left', pressed: true }],
        finalScore: 100,
        finalWave: 5,
        humansAlive: 3,
        dailyMode: false,
      };
      
      replay.startPlayback(data);
      expect(replay.isPlaying).toBe(true);
      
      replay.stopPlayback();
      expect(replay.isPlaying).toBe(false);
    });
  });

  describe('encode/decode', () => {
    it('should encode and decode replay data', () => {
      const data: ReplayData = {
        version: 1,
        timestamp: 1234567890000,
        duration: 5000,
        frames: [
          { time: 0, action: 'left', pressed: true },
          { time: 100, action: 'fire', pressed: true },
          { time: 200, action: 'left', pressed: false },
          { time: 300, action: 'right', pressed: true },
        ],
        finalScore: 1500,
        finalWave: 8,
        humansAlive: 5,
        dailyMode: true,
      };
      
      const encoded = Replay.encode(data);
      const decoded = Replay.decode(encoded);
      
      expect(decoded).not.toBeNull();
      expect(decoded!.version).toBe(1);
      expect(decoded!.timestamp).toBe(1234567890000);
      expect(decoded!.duration).toBe(5000);
      expect(decoded!.finalScore).toBe(1500);
      expect(decoded!.finalWave).toBe(8);
      expect(decoded!.humansAlive).toBe(5);
      expect(decoded!.dailyMode).toBe(true);
      expect(decoded!.frames.length).toBe(4);
      expect(decoded!.frames[0]).toEqual({ time: 0, action: 'left', pressed: true });
    });

    it('should handle all action types', () => {
      const data: ReplayData = {
        version: 1,
        timestamp: 1000,
        duration: 500,
        frames: [
          { time: 0, action: 'left', pressed: true },
          { time: 50, action: 'right', pressed: true },
          { time: 100, action: 'up', pressed: true },
          { time: 150, action: 'down', pressed: true },
          { time: 200, action: 'fire', pressed: true },
        ],
        finalScore: 100,
        finalWave: 1,
        humansAlive: 6,
        dailyMode: false,
      };
      
      const decoded = Replay.decode(Replay.encode(data));
      
      expect(decoded!.frames[0].action).toBe('left');
      expect(decoded!.frames[1].action).toBe('right');
      expect(decoded!.frames[2].action).toBe('up');
      expect(decoded!.frames[3].action).toBe('down');
      expect(decoded!.frames[4].action).toBe('fire');
    });

    it('should return null for invalid data', () => {
      expect(Replay.decode('invalid')).toBeNull();
      expect(Replay.decode('')).toBeNull();
    });

    it('should handle empty frames', () => {
      const data: ReplayData = {
        version: 1,
        timestamp: 1000,
        duration: 0,
        frames: [],
        finalScore: 0,
        finalWave: 1,
        humansAlive: 6,
        dailyMode: false,
      };
      
      const decoded = Replay.decode(Replay.encode(data));
      expect(decoded!.frames.length).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should calculate input statistics', () => {
      const data: ReplayData = {
        version: 1,
        timestamp: 1000,
        duration: 10000, // 10 seconds
        frames: [
          { time: 0, action: 'left', pressed: true },
          { time: 100, action: 'left', pressed: false },
          { time: 200, action: 'right', pressed: true },
          { time: 300, action: 'right', pressed: false },
          { time: 400, action: 'up', pressed: true },
          { time: 500, action: 'down', pressed: true },
          { time: 600, action: 'fire', pressed: true },
          { time: 700, action: 'fire', pressed: true },
        ],
        finalScore: 500,
        finalWave: 3,
        humansAlive: 4,
        dailyMode: false,
      };
      
      const stats = Replay.getStats(data);
      
      expect(stats.thrustLeft).toBe(1);
      expect(stats.thrustRight).toBe(1);
      expect(stats.moveUp).toBe(1);
      expect(stats.moveDown).toBe(1);
      expect(stats.fireCount).toBe(2);
      expect(stats.totalInputs).toBe(6);
      expect(stats.durationSeconds).toBe(10);
      expect(stats.inputsPerSecond).toBeCloseTo(0.6, 1);
    });

    it('should handle zero duration', () => {
      const data: ReplayData = {
        version: 1,
        timestamp: 1000,
        duration: 0,
        frames: [],
        finalScore: 0,
        finalWave: 1,
        humansAlive: 6,
        dailyMode: false,
      };
      
      const stats = Replay.getStats(data);
      expect(stats.inputsPerSecond).toBe(0);
    });
  });

  describe('generateShareCode', () => {
    it('should generate regular share code', () => {
      const data: ReplayData = {
        version: 1,
        timestamp: new Date('2026-03-06').getTime(),
        duration: 5000,
        frames: [],
        finalScore: 2500,
        finalWave: 7,
        humansAlive: 3,
        dailyMode: false,
      };
      
      const code = Replay.generateShareCode(data);
      expect(code).toBe('RESCUE-20260306-2500-W7');
    });

    it('should generate daily share code', () => {
      const data: ReplayData = {
        version: 1,
        timestamp: new Date('2026-03-06').getTime(),
        duration: 5000,
        frames: [],
        finalScore: 1800,
        finalWave: 5,
        humansAlive: 5,
        dailyMode: true,
      };
      
      const code = Replay.generateShareCode(data);
      expect(code).toBe('RESCUE-D-20260306-1800-W5');
    });
  });
});
