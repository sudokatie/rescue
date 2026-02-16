import { Leaderboard } from '../game/Leaderboard';

// Mock localStorage at module level
let mockStorage: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => { mockStorage[key] = value; },
  clear: () => { mockStorage = {}; },
};

beforeEach(() => {
  mockStorage = {};
});

describe('Leaderboard', () => {
  beforeEach(() => {
    Leaderboard.resetCache();
  });

  it('should return empty when no data', () => {
    expect(Leaderboard.load()).toEqual([]);
  });

  it('should record high score', () => {
    const rank = Leaderboard.recordScore('Pilot', 15000, 5, 12);
    expect(rank).toBe(1);
    expect(Leaderboard.getTop()[0].humansSaved).toBe(12);
  });

  it('should sort by score descending', () => {
    Leaderboard.recordScore('Rookie', 5000, 2, 4);
    Leaderboard.recordScore('Ace', 50000, 12, 30);
    Leaderboard.recordScore('Vet', 20000, 6, 15);

    const top = Leaderboard.getTop();
    expect(top[0].name).toBe('Ace');
    expect(top[1].name).toBe('Vet');
    expect(top[2].name).toBe('Rookie');
  });

  it('should limit to max entries', () => {
    for (let i = 0; i < 15; i++) {
      Leaderboard.recordScore(`P${i}`, i * 1000, i, i * 2);
    }
    expect(Leaderboard.getTop().length).toBe(10);
  });

  it('should check wouldRank correctly', () => {
    for (let i = 0; i < 10; i++) {
      Leaderboard.recordScore(`P${i}`, 10000 + i * 1000, i, i);
    }
    expect(Leaderboard.wouldRank(25000)).toBe(true);
    expect(Leaderboard.wouldRank(5000)).toBe(false);
  });

  it('should return best score', () => {
    Leaderboard.recordScore('Second', 20000, 5, 10);
    Leaderboard.recordScore('First', 40000, 10, 25);
    expect(Leaderboard.getBest()?.name).toBe('First');
  });

  it('should clear all data', () => {
    Leaderboard.recordScore('Gone', 10000, 3, 6);
    Leaderboard.clear();
    expect(Leaderboard.getTop().length).toBe(0);
  });
});
