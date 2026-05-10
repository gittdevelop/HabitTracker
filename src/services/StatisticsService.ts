import type { Habit } from '../models/types';

// ── Date helpers ──────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function sortedUniqueDates(habit: Habit): string[] {
  return [...new Set(habit.completions.map((c) => c.date))].sort();
}

/** ISO week key "YYYY-Www" for a date string */
export function isoWeekKey(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay() || 7; // Mon=1..Sun=7
  d.setDate(d.getDate() + 4 - day); // nearest Thursday (uniquely identifies ISO week)
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const wk = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${String(wk).padStart(2, '0')}`;
}

/** Monday Date for a given ISO week key */
function weekKeyToMonday(weekKey: string): Date {
  const [yearStr, wkStr] = weekKey.split('-W');
  const year = parseInt(yearStr);
  const wk   = parseInt(wkStr);
  const jan4 = new Date(year, 0, 4, 12);
  const dow  = jan4.getDay() || 7;
  const mondayWk1 = new Date(jan4);
  mondayWk1.setDate(jan4.getDate() - dow + 1);
  const result = new Date(mondayWk1);
  result.setDate(mondayWk1.getDate() + (wk - 1) * 7);
  return result;
}

// ── Streak helpers ────────────────────────────────────────────────────────────

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // "YYYY-MM"
}

function monthlyCurrentStreak(dates: string[]): number {
  const monthSet = new Set(dates.map(monthKey));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  while (monthSet.has(cursor.toISOString().slice(0, 7))) {
    streak++;
    cursor.setMonth(cursor.getMonth() - 1);
  }
  return streak;
}

function monthlyMaxStreak(dates: string[]): number {
  const months = [...new Set(dates.map(monthKey))].sort();
  if (months.length === 0) return 0;
  let max = 1, cur = 1;
  for (let i = 1; i < months.length; i++) {
    const [y0, m0] = months[i - 1].split('-').map(Number);
    const [y1, m1] = months[i].split('-').map(Number);
    if (y1 * 12 + m1 === y0 * 12 + m0 + 1) { cur++; max = Math.max(max, cur); }
    else cur = 1;
  }
  return max;
}

function weeklyCurrentStreak(dates: string[]): number {
  const weekSet = new Set(dates.map(isoWeekKey));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  while (weekSet.has(isoWeekKey(cursor.toISOString().slice(0, 10)))) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

function weeklyMaxStreak(dates: string[]): number {
  const weeks = [...new Set(dates.map(isoWeekKey))].sort();
  if (weeks.length === 0) return 0;
  let max = 1, cur = 1;
  for (let i = 1; i < weeks.length; i++) {
    const diffDays = Math.round(
      (weekKeyToMonday(weeks[i]).getTime() - weekKeyToMonday(weeks[i - 1]).getTime()) / 86400000,
    );
    if (diffDays === 7) { cur++; max = Math.max(max, cur); }
    else cur = 1;
  }
  return max;
}

// ── Global streak (all habits done on same day) ───────────────────────────────

/** Consecutive days ending today where every active habit was completed. */
export function globalCurrentStreak(habits: Habit[]): number {
  if (habits.length === 0) return 0;
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  while (true) {
    const dateStr = cursor.toISOString().slice(0, 10);
    const active = habits.filter((h) => h.createdAt.slice(0, 10) <= dateStr);
    if (active.length === 0) break;
    const allDone = active.every((h) => h.completions.some((c) => c.date === dateStr));
    if (!allDone) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Longest run of consecutive days where every active habit was completed. */
export function globalMaxStreak(habits: Habit[]): number {
  if (habits.length === 0) return 0;
  const allDates = [...new Set(habits.flatMap((h) => h.completions.map((c) => c.date)))].sort();
  if (allDates.length === 0) return 0;
  let max = 0, cur = 0, prevDate: string | null = null;
  for (const dateStr of allDates) {
    const active = habits.filter((h) => h.createdAt.slice(0, 10) <= dateStr);
    if (active.length === 0 || !active.every((h) => h.completions.some((c) => c.date === dateStr))) {
      cur = 0; prevDate = null; continue;
    }
    const diff = prevDate
      ? Math.round((new Date(dateStr + 'T12:00:00').getTime() - new Date(prevDate + 'T12:00:00').getTime()) / 86400000)
      : 0;
    cur = prevDate && diff === 1 ? cur + 1 : 1;
    max = Math.max(max, cur);
    prevDate = dateStr;
  }
  return max;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const StatisticsService = {
  currentStreak(habit: Habit): number {
    const dates = sortedUniqueDates(habit);
    if (dates.length === 0) return 0;

    if (habit.frequency === 'weekly')  return weeklyCurrentStreak(dates);
    if (habit.frequency === 'monthly') return monthlyCurrentStreak(dates);

    // daily / hourly — day-based streak
    const dateSet = new Set(dates);
    let streak = 0;
    const cursor = new Date(todayStr() + 'T12:00:00');
    while (dateSet.has(cursor.toISOString().slice(0, 10))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  },

  maxStreak(habit: Habit): number {
    const dates = sortedUniqueDates(habit);
    if (dates.length === 0) return 0;

    if (habit.frequency === 'weekly')  return weeklyMaxStreak(dates);
    if (habit.frequency === 'monthly') return monthlyMaxStreak(dates);

    // daily / hourly
    let max = 1, cur = 1;
    for (let i = 1; i < dates.length; i++) {
      const diff = Math.round(
        (new Date(dates[i] + 'T12:00:00').getTime() -
          new Date(dates[i - 1] + 'T12:00:00').getTime()) / 86400000,
      );
      if (diff === 1) { cur++; max = Math.max(max, cur); }
      else cur = 1;
    }
    return max;
  },

  completionRate(habit: Habit): number {
    const created   = new Date(habit.createdAt.slice(0, 10) + 'T12:00:00');
    const todayDate = new Date(todayStr() + 'T12:00:00');

    if (habit.frequency === 'weekly') {
      const totalWeeks = Math.max(
        1,
        Math.round((todayDate.getTime() - created.getTime()) / (7 * 86400000)) + 1,
      );
      const doneWeeks = new Set(habit.completions.map((c) => isoWeekKey(c.date))).size;
      return Math.min(100, Math.round((doneWeeks / totalWeeks) * 100));
    }

    if (habit.frequency === 'monthly') {
      const totalMonths = Math.max(
        1,
        (todayDate.getFullYear() - created.getFullYear()) * 12 +
          (todayDate.getMonth() - created.getMonth()) + 1,
      );
      const doneMonths = new Set(habit.completions.map((c) => monthKey(c.date))).size;
      return Math.min(100, Math.round((doneMonths / totalMonths) * 100));
    }

    // daily / hourly
    const totalDays = Math.max(
      1,
      Math.round((todayDate.getTime() - created.getTime()) / 86400000) + 1,
    );
    return Math.min(100, Math.round((habit.completions.length / totalDays) * 100));
  },

  isCompletedToday(habit: Habit): boolean {
    return habit.completions.some((c) => c.date === todayStr());
  },
};
