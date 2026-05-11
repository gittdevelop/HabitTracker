import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../services/HabitService', () => ({
  HabitService: {
    getAll: vi.fn(),
    add: vi.fn(),
    remove: vi.fn(),
    toggleToday: vi.fn(),
  },
}));

vi.mock('../../services/StatisticsService', () => ({
  StatisticsService: {
    isCompletedToday: vi.fn(),
    currentStreak: vi.fn(),
    completionRate: vi.fn(),
  },
  globalMaxStreak: vi.fn(),
  globalCurrentStreak: vi.fn(),
}));

import { useHabits } from '../useHabits';
import { HabitService } from '../../services/HabitService';
import { StatisticsService, globalMaxStreak } from '../../services/StatisticsService';
import type { Habit } from '../../models/types';

const HABIT: Habit = {
  id: '1',
  name: 'Медитация',
  color: '#6366f1',
  icon: '🧘',
  frequency: 'daily',
  createdAt: '2024-01-01T00:00:00.000Z',
  completions: [],
};

const HABIT_DONE: Habit = { ...HABIT, completions: [{ date: '2024-01-15' }] };

beforeEach(() => {
  vi.mocked(HabitService.getAll).mockReturnValue([HABIT]);
  vi.mocked(HabitService.add).mockReturnValue([HABIT]);
  vi.mocked(HabitService.remove).mockReturnValue([]);
  vi.mocked(HabitService.toggleToday).mockReturnValue([HABIT_DONE]);
  vi.mocked(StatisticsService.isCompletedToday).mockReturnValue(false);
  vi.mocked(globalMaxStreak).mockReturnValue(0);
});

describe('useHabits', () => {
  it('loads habits from HabitService on mount', () => {
    const { result } = renderHook(() => useHabits());
    expect(result.current.habits).toEqual([HABIT]);
  });

  it('addHabit delegates to HabitService.add and updates state', () => {
    const { result } = renderHook(() => useHabits());
    act(() => {
      result.current.addHabit('Бег', '#f00', '🏃', 'daily');
    });
    expect(vi.mocked(HabitService.add)).toHaveBeenCalledWith('Бег', '#f00', '🏃', 'daily');
    expect(result.current.habits).toEqual([HABIT]);
  });

  it('toggleHabit delegates to HabitService.toggleToday and updates state', () => {
    const { result } = renderHook(() => useHabits());
    act(() => {
      result.current.toggleHabit('1');
    });
    expect(vi.mocked(HabitService.toggleToday)).toHaveBeenCalledWith('1');
    expect(result.current.habits).toEqual([HABIT_DONE]);
  });

  it('deleteHabit delegates to HabitService.remove and updates state', () => {
    const { result } = renderHook(() => useHabits());
    act(() => {
      result.current.deleteHabit('1');
    });
    expect(vi.mocked(HabitService.remove)).toHaveBeenCalledWith('1');
    expect(result.current.habits).toEqual([]);
  });

  it('computes done/total/pct stats via useMemo', () => {
    vi.mocked(StatisticsService.isCompletedToday).mockReturnValue(true);
    vi.mocked(globalMaxStreak).mockReturnValue(7);
    const { result } = renderHook(() => useHabits());
    expect(result.current.done).toBe(1);
    expect(result.current.total).toBe(1);
    expect(result.current.pct).toBe(100);
    expect(result.current.maxStreak).toBe(7);
  });

  it('returns pct = 0 when there are no habits', () => {
    vi.mocked(HabitService.getAll).mockReturnValue([]);
    const { result } = renderHook(() => useHabits());
    expect(result.current.pct).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it('addHabit is referentially stable across renders (useCallback)', () => {
    const { result, rerender } = renderHook(() => useHabits());
    const first = result.current.addHabit;
    rerender();
    expect(result.current.addHabit).toBe(first);
  });

  it('toggleHabit is referentially stable across renders (useCallback)', () => {
    const { result, rerender } = renderHook(() => useHabits());
    const first = result.current.toggleHabit;
    rerender();
    expect(result.current.toggleHabit).toBe(first);
  });

  it('deleteHabit is referentially stable across renders (useCallback)', () => {
    const { result, rerender } = renderHook(() => useHabits());
    const first = result.current.deleteHabit;
    rerender();
    expect(result.current.deleteHabit).toBe(first);
  });
});
