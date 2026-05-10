import type { Habit, HabitFrequency } from '../models/types';
import { StorageService } from './StorageService';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function uuid(): string {
  return crypto.randomUUID();
}

export const HabitService = {
  getAll(): Habit[] {
    return StorageService.load();
  },

  add(name: string, color: string, icon: string, frequency: HabitFrequency): Habit[] {
    const habits = StorageService.load();
    const habit: Habit = {
      id: uuid(),
      name: name.trim(),
      color,
      icon,
      frequency,
      createdAt: new Date().toISOString(),
      completions: [],
    };
    const updated = [...habits, habit];
    StorageService.save(updated);
    return updated;
  },

  remove(id: string): Habit[] {
    const updated = StorageService.load().filter((h) => h.id !== id);
    StorageService.save(updated);
    return updated;
  },

  toggleToday(id: string): Habit[] {
    const today = todayISO();
    const habits = StorageService.load().map((h) => {
      if (h.id !== id) return h;
      const already = h.completions.some((c) => c.date === today);
      return {
        ...h,
        completions: already
          ? h.completions.filter((c) => c.date !== today)
          : [...h.completions, { date: today }],
      };
    });
    StorageService.save(habits);
    return habits;
  },
};
