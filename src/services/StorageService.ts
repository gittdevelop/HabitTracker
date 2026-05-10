import type { Habit } from '../models/types';

const KEY = 'habits';

export const StorageService = {
  load(): Habit[] {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Habit[];
      // Backwards compat: habits saved before frequency was added default to 'daily'
      return parsed.map((h) => ({ frequency: 'daily' as const, ...h }));
    } catch {
      return [];
    }
  },

  save(habits: Habit[]): void {
    localStorage.setItem(KEY, JSON.stringify(habits));
  },
};
