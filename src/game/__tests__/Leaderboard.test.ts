/**
 * @jest-environment jsdom
 */

import { Leaderboard } from '../Leaderboard';

describe('Leaderboard', () => {
  beforeEach(() => {
    localStorage.clear();
    Leaderboard.resetCache();
  });

  it('should return empty data when no scores', () => {
    expect(Leaderboard.load()).toEqual([]);
  });

  it('should record a high score', () => {
    const rank = Leaderboard.recordScore('Defender', 5000, 10, 25);
    expect(rank).toBe(1);
    expect(Leaderboard.getTop()[0].score).toBe(5000);
  });

  it('should sort by score descending', () => {
    Leaderboard.recordScore('Low', 1000, 3, 5);
    Leaderboard.recordScore('High', 8000, 15, 40);
    Leaderboard.recordScore('Mid', 4000, 8, 20);

    const scores = Leaderboard.getTop();
    expect(scores[0].name).toBe('High');
    expect(scores[1].name).toBe('Mid');
    expect(scores[2].name).toBe('Low');
  });

  it('should limit to max entries', () => {
    for (let i = 0; i < 15; i++) {
      Leaderboard.recordScore(`P${i}`, i * 500, i, i * 2);
    }
    expect(Leaderboard.getTop().length).toBe(10);
  });

  it('should persist to localStorage', () => {
    Leaderboard.recordScore('Saved', 3000, 6, 15);
    const stored = JSON.parse(localStorage.getItem('rescue_leaderboard')!);
    expect(stored[0].name).toBe('Saved');
  });

  it('should check if score would rank', () => {
    Leaderboard.recordScore('First', 5000, 10, 25);
    expect(Leaderboard.wouldRank(6000)).toBe(true);
    expect(Leaderboard.wouldRank(1000)).toBe(true); // still under max
  });

  it('should return best score', () => {
    Leaderboard.recordScore('Second', 3000, 6, 15);
    Leaderboard.recordScore('First', 7000, 12, 35);
    expect(Leaderboard.getBest()?.name).toBe('First');
  });

  it('should clear all data', () => {
    Leaderboard.recordScore('Gone', 2000, 4, 10);
    Leaderboard.clear();
    expect(Leaderboard.getTop().length).toBe(0);
  });

  it('should track wave and humans saved', () => {
    Leaderboard.recordScore('Hero', 4500, 9, 22);
    const entry = Leaderboard.getTop()[0];
    expect(entry.wave).toBe(9);
    expect(entry.humansSaved).toBe(22);
  });
});
