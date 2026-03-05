/**
 * Daily Challenge System for Rescue
 *
 * Provides date-based seeded gameplay so everyone faces the same
 * enemy patterns each day.
 */

/** Seeded random number generator using mulberry32 algorithm */
export class SeededRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  /** Get next random number between 0 and 1 */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Get random integer in range [min, max) */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /** Get random float in range [min, max) */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /** Pick random item from array */
  pick<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length)];
  }
}

/** Get today's date as YYYY-MM-DD string */
export function todayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Generate a seed from a date string */
export function seedForDate(dateStr: string): number {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return 0;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  // Combine with prime multipliers - different for each game
  return Math.abs(
    (year * 51361 + month * 1721 + day * 53) | 0
  );
}

/** Get seed for today's daily challenge */
export function todaySeed(): number {
  return seedForDate(todayString());
}

/** Daily high score entry */
export interface DailyScore {
  name: string;
  score: number;
  wave: number;
  rescued: number;
  completedAt: string;
}

const DAILY_STORAGE_KEY = 'rescue_daily_leaderboard';
const MAX_DAILY_ENTRIES = 10;

/** Daily leaderboard - separate from regular high scores */
export class DailyLeaderboard {
  private static cache: Map<string, DailyScore[]> = new Map();

  private static loadForDate(date: string): DailyScore[] {
    if (this.cache.has(date)) return this.cache.get(date)!;

    if (typeof window === 'undefined') {
      this.cache.set(date, []);
      return [];
    }

    try {
      const stored = localStorage.getItem(DAILY_STORAGE_KEY);
      if (!stored) {
        this.cache.set(date, []);
        return [];
      }
      const all: Record<string, DailyScore[]> = JSON.parse(stored);
      const entries = all[date] || [];
      this.cache.set(date, entries);
      return entries;
    } catch {
      this.cache.set(date, []);
      return [];
    }
  }

  private static saveForDate(date: string, entries: DailyScore[]): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(DAILY_STORAGE_KEY);
      const all: Record<string, DailyScore[]> = stored ? JSON.parse(stored) : {};
      all[date] = entries;

      // Prune old dates (keep last 30 days)
      const dates = Object.keys(all).sort().reverse();
      if (dates.length > 30) {
        for (const oldDate of dates.slice(30)) {
          delete all[oldDate];
        }
      }

      localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(all));
    } catch {}
  }

  /** Record a score for today's challenge */
  static recordScore(
    name: string,
    score: number,
    wave: number,
    rescued: number
  ): number | null {
    const date = todayString();
    const entries = this.loadForDate(date);
    const now = new Date().toISOString();

    entries.push({ name, score, wave, rescued, completedAt: now });
    entries.sort((a, b) => b.score - a.score);

    const rank = entries.findIndex((e) => e.completedAt === now);
    const trimmed = entries.slice(0, MAX_DAILY_ENTRIES);
    this.cache.set(date, trimmed);
    this.saveForDate(date, trimmed);

    return rank >= 0 && rank < MAX_DAILY_ENTRIES ? rank + 1 : null;
  }

  /** Get today's leaderboard */
  static getToday(): DailyScore[] {
    return this.loadForDate(todayString());
  }

  /** Check if a score would rank on today's board */
  static wouldRank(score: number): boolean {
    const entries = this.getToday();
    if (entries.length < MAX_DAILY_ENTRIES) return true;
    return score > entries[entries.length - 1].score;
  }

  /** Clear cache (for testing) */
  static resetCache(): void {
    this.cache.clear();
  }
}

/** Generate a shareable code for a daily score */
export function generateShareCode(date: string, score: number): string {
  const dateCompact = date.replace(/-/g, '');
  return `RESCUE-${dateCompact}-${score}`;
}

/** Parse a share code */
export function parseShareCode(code: string): { date: string; score: number } | null {
  const parts = code.split('-');
  if (parts.length !== 3 || parts[0] !== 'RESCUE') return null;

  const dateCompact = parts[1];
  if (dateCompact.length !== 8) return null;

  const year = dateCompact.slice(0, 4);
  const month = dateCompact.slice(4, 6);
  const day = dateCompact.slice(6, 8);
  const date = `${year}-${month}-${day}`;

  const score = parseInt(parts[2], 10);
  if (isNaN(score)) return null;

  return { date, score };
}
