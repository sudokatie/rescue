import { ACHIEVEMENTS, AchievementManager } from '../game/Achievements';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('Achievements', () => {
  let manager: AchievementManager;

  beforeEach(() => {
    localStorageMock.clear();
    manager = new AchievementManager();
  });

  it('has 21 achievements', () => {
    expect(ACHIEVEMENTS.length).toBe(21);
  });

  it('has unique ids', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('can unlock achievements', () => {
    const result = manager.unlock('first_rescue');
    expect(result?.id).toBe('first_rescue');
    expect(manager.isUnlocked('first_rescue')).toBe(true);
  });

  it('persists to localStorage', () => {
    manager.unlock('first_rescue');
    const manager2 = new AchievementManager();
    expect(manager2.isUnlocked('first_rescue')).toBe(true);
  });

  it('handles daily completion', () => {
    const results = manager.recordDailyCompletion(1);
    expect(results.some((a) => a.id === 'daily_first')).toBe(true);
  });
});
