import { useState, useCallback, useMemo } from 'react';
import type { Habit, HabitFrequency } from '../models/types';
import { HabitService } from '../services/HabitService';
import { StatisticsService, globalMaxStreak } from '../services/StatisticsService';

export interface HabitsStats {
  done: number;
  total: number;
  pct: number;
  maxStreak: number;
}

export interface UseHabitsReturn extends HabitsStats {
  habits: Habit[];
  addHabit: (name: string, color: string, icon: string, frequency: HabitFrequency) => void;
  toggleHabit: (id: string) => void;
  deleteHabit: (id: string) => void;
}

export function useHabits(): UseHabitsReturn {
  const [habits, setHabits] = useState<Habit[]>(() => HabitService.getAll());

  const addHabit = useCallback(
    (name: string, color: string, icon: string, frequency: HabitFrequency) => {
      setHabits(HabitService.add(name, color, icon, frequency));
    },
    [],
  );

  const toggleHabit = useCallback((id: string) => {
    setHabits(HabitService.toggleToday(id));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits(HabitService.remove(id));
  }, []);

  const stats = useMemo<HabitsStats>(() => {
    const done = habits.filter((h) => StatisticsService.isCompletedToday(h)).length;
    const total = habits.length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    const maxStreak = globalMaxStreak(habits);
    return { done, total, pct, maxStreak };
  }, [habits]);

  return { habits, addHabit, toggleHabit, deleteHabit, ...stats };
}
