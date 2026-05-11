import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../StorageService', () => ({
  StorageService: {
    load: vi.fn(),
    save: vi.fn(),
  },
}));

import { HabitService } from '../HabitService';
import { StorageService } from '../StorageService';
import type { Habit } from '../../models/types';

const TODAY = '2024-01-15';

const BASE_HABIT: Habit = {
  id: 'a',
  name: 'Бег',
  color: '#f00',
  icon: '🏃',
  frequency: 'daily',
  createdAt: '2024-01-01T00:00:00.000Z',
  completions: [],
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${TODAY}T12:00:00.000Z`));
  vi.stubGlobal('crypto', { randomUUID: vi.fn().mockReturnValue('test-uuid') });
  vi.mocked(StorageService.load).mockReturnValue([]);
  vi.mocked(StorageService.save).mockReturnValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('HabitService', () => {
  describe('getAll', () => {
    it('returns habits from StorageService', () => {
      vi.mocked(StorageService.load).mockReturnValue([BASE_HABIT]);
      expect(HabitService.getAll()).toEqual([BASE_HABIT]);
    });
  });

  describe('add', () => {
    it('creates a new habit with correct fields', () => {
      const result = HabitService.add('Бег', '#f00', '🏃', 'daily');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'test-uuid',
        name: 'Бег',
        color: '#f00',
        icon: '🏃',
        frequency: 'daily',
        completions: [],
      });
    });

    it('trims whitespace from name', () => {
      const result = HabitService.add('  Бег  ', '#f00', '🏃', 'daily');
      expect(result[0].name).toBe('Бег');
    });

    it('appends to existing habits', () => {
      vi.mocked(StorageService.load).mockReturnValue([BASE_HABIT]);
      const result = HabitService.add('Чтение', '#00f', '📚', 'weekly');
      expect(result).toHaveLength(2);
    });

    it('calls StorageService.save with the updated list', () => {
      const result = HabitService.add('Бег', '#f00', '🏃', 'daily');
      expect(vi.mocked(StorageService.save)).toHaveBeenCalledWith(result);
    });
  });

  describe('remove', () => {
    it('removes the habit with given id', () => {
      const habits: Habit[] = [
        { ...BASE_HABIT, id: '1' },
        { ...BASE_HABIT, id: '2' },
      ];
      vi.mocked(StorageService.load).mockReturnValue(habits);
      const result = HabitService.remove('1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('returns unchanged list when id not found', () => {
      vi.mocked(StorageService.load).mockReturnValue([BASE_HABIT]);
      const result = HabitService.remove('nonexistent');
      expect(result).toHaveLength(1);
    });

    it('calls StorageService.save', () => {
      vi.mocked(StorageService.load).mockReturnValue([BASE_HABIT]);
      HabitService.remove(BASE_HABIT.id);
      expect(vi.mocked(StorageService.save)).toHaveBeenCalled();
    });
  });

  describe('toggleToday', () => {
    it('adds today completion when habit not yet completed today', () => {
      vi.mocked(StorageService.load).mockReturnValue([BASE_HABIT]);
      const result = HabitService.toggleToday(BASE_HABIT.id);
      expect(result[0].completions).toContainEqual({ date: TODAY });
    });

    it('removes today completion when habit already completed today', () => {
      const done: Habit = { ...BASE_HABIT, completions: [{ date: TODAY }] };
      vi.mocked(StorageService.load).mockReturnValue([done]);
      const result = HabitService.toggleToday(BASE_HABIT.id);
      expect(result[0].completions).not.toContainEqual({ date: TODAY });
    });

    it('does not affect other habits', () => {
      const h2: Habit = { ...BASE_HABIT, id: 'b', name: 'Чтение' };
      vi.mocked(StorageService.load).mockReturnValue([BASE_HABIT, h2]);
      const result = HabitService.toggleToday(BASE_HABIT.id);
      expect(result[1].id).toBe('b');
      expect(result[1].completions).toEqual([]);
    });

    it('calls StorageService.save', () => {
      vi.mocked(StorageService.load).mockReturnValue([BASE_HABIT]);
      HabitService.toggleToday(BASE_HABIT.id);
      expect(vi.mocked(StorageService.save)).toHaveBeenCalled();
    });
  });
});
