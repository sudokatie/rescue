import { Sound } from '../game/Sound';

describe('Sound System', () => {
  beforeEach(() => {
    Sound.resetContext();
    Sound.setEnabled(true);
    Sound.setVolume(0.3);
  });

  describe('singleton pattern', () => {
    it('returns the same instance', () => {
      const instance1 = Sound;
      const instance2 = Sound;
      expect(instance1).toBe(instance2);
    });
  });

  describe('enabled state', () => {
    it('can be enabled and disabled', () => {
      Sound.setEnabled(false);
      expect(Sound.isEnabled()).toBe(false);

      Sound.setEnabled(true);
      expect(Sound.isEnabled()).toBe(true);
    });

    it('does not throw when playing while disabled', () => {
      Sound.setEnabled(false);
      expect(() => Sound.play('shoot')).not.toThrow();
    });
  });

  describe('volume control', () => {
    it('can set and get volume', () => {
      Sound.setVolume(0.5);
      expect(Sound.getVolume()).toBe(0.5);
    });

    it('clamps volume to 0-1 range', () => {
      Sound.setVolume(-0.5);
      expect(Sound.getVolume()).toBe(0);

      Sound.setVolume(1.5);
      expect(Sound.getVolume()).toBe(1);
    });
  });

  describe('sound playback', () => {
    it('plays shoot sound without error', () => {
      expect(() => Sound.play('shoot')).not.toThrow();
    });

    it('plays explosion sound without error', () => {
      expect(() => Sound.play('explosion')).not.toThrow();
    });

    it('plays humanRescue sound without error', () => {
      expect(() => Sound.play('humanRescue')).not.toThrow();
    });

    it('plays humanReturn sound without error', () => {
      expect(() => Sound.play('humanReturn')).not.toThrow();
    });

    it('plays humanDeath sound without error', () => {
      expect(() => Sound.play('humanDeath')).not.toThrow();
    });

    it('plays shipDeath sound without error', () => {
      expect(() => Sound.play('shipDeath')).not.toThrow();
    });

    it('plays waveComplete sound without error', () => {
      expect(() => Sound.play('waveComplete')).not.toThrow();
    });

    it('plays gameOver sound without error', () => {
      expect(() => Sound.play('gameOver')).not.toThrow();
    });
  });
});
