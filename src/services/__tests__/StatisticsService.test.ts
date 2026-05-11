import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  StatisticsService,
  isoWeekKey,
  globalCurrentStreak,
  globalMaxStreak,
} from '../StatisticsService';
import type { Habit } from '../../models/types';

// 2024-01-15 is a Monday → ISO week 2024-W03
const TODAY = '2024-01-15';

function makeHabit(
  completionDates: string[],
  frequency: Habit['frequency'] = 'daily',
  createdAt = '2024-01-01T00:00:00.000Z',
): Habit {
  return {
    id: '1',
    name: 'Test',
    color: '#fff',
    icon: '⭐',
    frequency,
    createdAt,
    completions: completionDates.map((date) => ({ date })),
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${TODAY}T12:00:00.000Z`));
});

afterEach(() => {
  vi.useRealTimers();
});

// ─────────────────────────────────────────────────────────────────────────────

describe('isoWeekKey', () => {
  it('returns correct week key for a Monday', () => {
    expect(isoWeekKey('2024-01-15')).toBe('2024-W03');
  });

  it('returns the same week key for a Sunday of the same week', () => {
    expect(isoWeekKey('2024-01-21')).toBe('2024-W03');
  });

  it('returns correct key for the first week of the year', () => {
    expect(isoWeekKey('2024-01-01')).toBe('2024-W01');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('StatisticsService.isCompletedToday', () => {
  it('returns true when habit is completed today', () => {
    expect(StatisticsService.isCompletedToday(makeHabit([TODAY]))).toBe(true);
  });

  it('returns false when habit was completed yesterday but not today', () => {
    expect(StatisticsService.isCompletedToday(makeHabit(['2024-01-14']))).toBe(false);
  });

  it('returns false for habit with no completions', () => {
    expect(StatisticsService.isCompletedToday(makeHabit([]))).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('StatisticsService.currentStreak — daily', () => {
  it('returns 0 for no completions', () => {
    expect(StatisticsService.currentStreak(makeHabit([]))).toBe(0);
  });

  it('returns 1 when only completed today', () => {
    expect(StatisticsService.currentStreak(makeHabit([TODAY]))).toBe(1);
  });

  it('counts consecutive days ending today', () => {
    const habit = makeHabit(['2024-01-13', '2024-01-14', TODAY]);
    expect(StatisticsService.currentStreak(habit)).toBe(3);
  });

  it('breaks streak on a gap', () => {
    // Jan 13 is missing
    const habit = makeHabit(['2024-01-12', '2024-01-14', TODAY]);
    expect(StatisticsService.currentStreak(habit)).toBe(2);
  });

  it('returns 0 when last completion was before today', () => {
    const habit = makeHabit(['2024-01-13', '2024-01-14']);
    expect(StatisticsService.currentStreak(habit)).toBe(0);
  });
});

describe('StatisticsService.currentStreak — weekly', () => {
  it('returns 1 for only current week completion', () => {
    expect(StatisticsService.currentStreak(makeHabit([TODAY], 'weekly'))).toBe(1);
  });

  it('returns 2 for two consecutive weeks ending this week', () => {
    // W02 = Jan 8-14, W03 = Jan 15-21
    const habit = makeHabit(['2024-01-08', TODAY], 'weekly');
    expect(StatisticsService.currentStreak(habit)).toBe(2);
  });

  it('returns 0 when no completion in current week', () => {
    const habit = makeHabit(['2024-01-08'], 'weekly');
    expect(StatisticsService.currentStreak(habit)).toBe(0);
  });
});

describe('StatisticsService.currentStreak — monthly', () => {
  it('returns 1 for only current month', () => {
    expect(StatisticsService.currentStreak(makeHabit([TODAY], 'monthly'))).toBe(1);
  });

  it('returns 2 for current and previous consecutive month', () => {
    const habit = makeHabit(['2023-12-01', TODAY], 'monthly');
    expect(StatisticsService.currentStreak(habit)).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('StatisticsService.maxStreak — daily', () => {
  it('returns 0 for no completions', () => {
    expect(StatisticsService.maxStreak(makeHabit([]))).toBe(0);
  });

  it('returns 1 for a single completion', () => {
    expect(StatisticsService.maxStreak(makeHabit([TODAY]))).toBe(1);
  });

  it('returns the length of the longest run', () => {
    // Run of 3, gap, run of 1
    const habit = makeHabit(['2024-01-05', '2024-01-06', '2024-01-07', '2024-01-10']);
    expect(StatisticsService.maxStreak(habit)).toBe(3);
  });
});

describe('StatisticsService.maxStreak — weekly', () => {
  it('returns 3 for three consecutive ISO weeks', () => {
    // W01, W02, W03
    const habit = makeHabit(['2024-01-01', '2024-01-08', TODAY], 'weekly');
    expect(StatisticsService.maxStreak(habit)).toBe(3);
  });
});

describe('StatisticsService.maxStreak — monthly', () => {
  it('returns 3 for three consecutive months', () => {
    const habit = makeHabit(['2023-11-01', '2023-12-01', '2024-01-01'], 'monthly');
    expect(StatisticsService.maxStreak(habit)).toBe(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('StatisticsService.completionRate — daily', () => {
  it('returns 100 when created today and completed today', () => {
    const habit = makeHabit([TODAY], 'daily', `${TODAY}T00:00:00.000Z`);
    expect(StatisticsService.completionRate(habit)).toBe(100);
  });

  it('calculates rate for multiple days', () => {
    // createdAt Jan 1 → 15 days total; 3 completions → 20%
    const habit = makeHabit(['2024-01-01', '2024-01-08', TODAY]);
    expect(StatisticsService.completionRate(habit)).toBe(20);
  });

  it('never exceeds 100', () => {
    const habit = makeHabit([TODAY], 'daily', `${TODAY}T00:00:00.000Z`);
    expect(StatisticsService.completionRate(habit)).toBeLessThanOrEqual(100);
  });
});

describe('StatisticsService.completionRate — weekly', () => {
  it('returns 100 when completed every week since creation', () => {
    // Jan 1 to Jan 15 = 3 weeks; 3 distinct week completions
    const habit = makeHabit(['2024-01-01', '2024-01-08', TODAY], 'weekly');
    expect(StatisticsService.completionRate(habit)).toBe(100);
  });
});

describe('StatisticsService.completionRate — monthly', () => {
  it('returns 100 when completed in the only active month', () => {
    const habit = makeHabit([TODAY], 'monthly', '2024-01-01T00:00:00.000Z');
    expect(StatisticsService.completionRate(habit)).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('globalCurrentStreak', () => {
  it('returns 0 for an empty habits array', () => {
    expect(globalCurrentStreak([])).toBe(0);
  });

  it('returns 0 when at least one habit is not done today', () => {
    const habits = [makeHabit([TODAY]), makeHabit([])];
    expect(globalCurrentStreak(habits)).toBe(0);
  });

  it('returns 1 when all habits done only today', () => {
    const habits = [makeHabit([TODAY]), makeHabit([TODAY], 'daily', '2024-01-10T00:00:00.000Z')];
    expect(globalCurrentStreak(habits)).toBe(1);
  });

  it('returns consecutive days when all habits done on each day', () => {
    const yesterday = '2024-01-14';
    const habits = [makeHabit([yesterday, TODAY]), makeHabit([yesterday, TODAY])];
    expect(globalCurrentStreak(habits)).toBe(2);
  });
});

describe('globalMaxStreak', () => {
  it('returns 0 for an empty habits array', () => {
    expect(globalMaxStreak([])).toBe(0);
  });

  it('returns 0 when no completions exist', () => {
    expect(globalMaxStreak([makeHabit([]), makeHabit([])])).toBe(0);
  });

  it('returns the longest run where every habit was completed', () => {
    const h1 = makeHabit(['2024-01-05', '2024-01-06', '2024-01-07', '2024-01-10']);
    const h2 = makeHabit(['2024-01-05', '2024-01-06', '2024-01-07', '2024-01-10']);
    expect(globalMaxStreak([h1, h2])).toBe(3);
  });

  it('does not count days where only some habits are completed', () => {
    const h1 = makeHabit(['2024-01-05', '2024-01-06']);
    const h2 = makeHabit(['2024-01-06']); // missing Jan 5
    expect(globalMaxStreak([h1, h2])).toBe(1);
  });
});
