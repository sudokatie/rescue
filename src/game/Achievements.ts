/**
 * Achievement system for Rescue (Defender clone)
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'skill' | 'exploration' | 'mastery' | 'daily';
  hidden?: boolean;
}

export interface AchievementProgress {
  unlockedAt: number;
}

export type AchievementStore = Record<string, AchievementProgress>;

export const ACHIEVEMENTS: Achievement[] = [
  // Skill
  {
    id: 'first_rescue',
    name: 'Hero',
    description: 'Rescue your first humanoid',
    icon: '🦸',
    category: 'skill',
  },
  {
    id: 'first_kill',
    name: 'Hunter',
    description: 'Destroy your first lander',
    icon: '💥',
    category: 'skill',
  },
  {
    id: 'wave_cleared',
    name: 'Wave Cleared',
    description: 'Complete wave 1',
    icon: '🌊',
    category: 'skill',
  },
  {
    id: 'multi_kill',
    name: 'Ace',
    description: 'Destroy 3+ enemies in 2 seconds',
    icon: '🔥',
    category: 'skill',
  },
  {
    id: 'close_save',
    name: 'Close Call',
    description: 'Rescue a humanoid being abducted',
    icon: '😰',
    category: 'skill',
  },
  {
    id: 'safe_deposit',
    name: 'Safe Deposit',
    description: 'Return a humanoid to the ground safely',
    icon: '🏠',
    category: 'skill',
  },

  // Exploration
  {
    id: 'smart_bomb',
    name: 'Nuclear Option',
    description: 'Use a smart bomb',
    icon: '☢️',
    category: 'exploration',
  },
  {
    id: 'hyperspace',
    name: 'Risky Business',
    description: 'Use hyperspace to escape danger',
    icon: '🌀',
    category: 'exploration',
  },
  {
    id: 'full_map',
    name: 'Explorer',
    description: 'Travel the entire width of the map',
    icon: '🗺️',
    category: 'exploration',
  },

  // Mastery
  {
    id: 'wave_5',
    name: 'Veteran',
    description: 'Reach wave 5',
    icon: '🎖️',
    category: 'mastery',
  },
  {
    id: 'wave_10',
    name: 'Commander',
    description: 'Reach wave 10',
    icon: '👑',
    category: 'mastery',
  },
  {
    id: 'score_10000',
    name: 'High Scorer',
    description: 'Score 10,000 points',
    icon: '💯',
    category: 'mastery',
  },
  {
    id: 'score_25000',
    name: 'Elite Pilot',
    description: 'Score 25,000 points',
    icon: '🏆',
    category: 'mastery',
  },
  {
    id: 'score_50000',
    name: 'Legend',
    description: 'Score 50,000 points',
    icon: '🌟',
    category: 'mastery',
  },
  {
    id: 'all_humanoids',
    name: 'Guardian',
    description: 'Complete a wave with all humanoids saved',
    icon: '🛡️',
    category: 'mastery',
  },

  // Daily
  {
    id: 'daily_complete',
    name: 'Daily Defender',
    description: 'Complete a daily challenge',
    icon: '📅',
    category: 'daily',
  },
  {
    id: 'daily_top_10',
    name: 'Daily Contender',
    description: 'Finish in top 10 of daily challenge',
    icon: '🔟',
    category: 'daily',
  },
  {
    id: 'daily_top_3',
    name: 'Daily Champion',
    description: 'Finish in top 3 of daily challenge',
    icon: '🥉',
    category: 'daily',
  },
  {
    id: 'daily_first',
    name: 'Daily Legend',
    description: 'Get first place in daily challenge',
    icon: '🥇',
    category: 'daily',
  },
  {
    id: 'daily_streak_3',
    name: 'Consistent',
    description: 'Complete daily challenges 3 days in a row',
    icon: '🔥',
    category: 'daily',
  },
  {
    id: 'daily_streak_7',
    name: 'Dedicated',
    description: 'Complete daily challenges 7 days in a row',
    icon: '💪',
    category: 'daily',
  },
];

const STORAGE_KEY = 'rescue_achievements';
const STREAK_KEY = 'rescue_daily_streak';

export class AchievementManager {
  private store: AchievementStore;
  private dailyStreak: { lastDate: string; count: number };

  constructor() {
    this.store = this.load();
    this.dailyStreak = this.loadStreak();
  }

  private load(): AchievementStore {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store));
    } catch {}
  }

  private loadStreak(): { lastDate: string; count: number } {
    try {
      const data = localStorage.getItem(STREAK_KEY);
      return data ? JSON.parse(data) : { lastDate: '', count: 0 };
    } catch {
      return { lastDate: '', count: 0 };
    }
  }

  private saveStreak(): void {
    try {
      localStorage.setItem(STREAK_KEY, JSON.stringify(this.dailyStreak));
    } catch {}
  }

  isUnlocked(id: string): boolean {
    return id in this.store;
  }

  getProgress(): AchievementStore {
    return { ...this.store };
  }

  getUnlockedCount(): number {
    return Object.keys(this.store).length;
  }

  getTotalCount(): number {
    return ACHIEVEMENTS.length;
  }

  getAchievement(id: string): Achievement | undefined {
    return ACHIEVEMENTS.find((a) => a.id === id);
  }

  getAllAchievements(): Achievement[] {
    return ACHIEVEMENTS;
  }

  unlock(id: string): Achievement | null {
    if (this.isUnlocked(id)) return null;
    const achievement = this.getAchievement(id);
    if (!achievement) return null;
    this.store[id] = { unlockedAt: Date.now() };
    this.save();
    return achievement;
  }

  checkAndUnlock(ids: string[]): Achievement[] {
    return ids.map((id) => this.unlock(id)).filter((a): a is Achievement => a !== null);
  }

  recordDailyCompletion(rank: number): Achievement[] {
    const unlocked: Achievement[] = [];
    const daily = this.unlock('daily_complete');
    if (daily) unlocked.push(daily);

    if (rank <= 10) {
      const a = this.unlock('daily_top_10');
      if (a) unlocked.push(a);
    }
    if (rank <= 3) {
      const a = this.unlock('daily_top_3');
      if (a) unlocked.push(a);
    }
    if (rank === 1) {
      const a = this.unlock('daily_first');
      if (a) unlocked.push(a);
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (this.dailyStreak.lastDate === yesterday) {
      this.dailyStreak.count++;
    } else if (this.dailyStreak.lastDate !== today) {
      this.dailyStreak.count = 1;
    }
    this.dailyStreak.lastDate = today;
    this.saveStreak();

    if (this.dailyStreak.count >= 3) {
      const a = this.unlock('daily_streak_3');
      if (a) unlocked.push(a);
    }
    if (this.dailyStreak.count >= 7) {
      const a = this.unlock('daily_streak_7');
      if (a) unlocked.push(a);
    }

    return unlocked;
  }

  reset(): void {
    this.store = {};
    this.dailyStreak = { lastDate: '', count: 0 };
    this.save();
    this.saveStreak();
  }
}

let instance: AchievementManager | null = null;

export function getAchievementManager(): AchievementManager {
  if (!instance) {
    instance = new AchievementManager();
  }
  return instance;
}
