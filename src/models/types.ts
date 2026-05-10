export type HabitFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly';

export const FREQUENCY_LABELS: Record<HabitFrequency, string> = {
  hourly:  'Раз в час',
  daily:   'Раз в день',
  weekly:  'Раз в неделю',
  monthly: 'Раз в месяц',
};

export const FREQUENCY_SHORT: Record<HabitFrequency, string> = {
  hourly:  'Часовая',
  daily:   'Ежедневная',
  weekly:  'Еженедельная',
  monthly: 'Ежемесячная',
};

/** Возвращает читаемый текст частоты для конкретной привычки */
export function frequencyDisplay(freq: HabitFrequency): string {
  return FREQUENCY_SHORT[freq];
}

export function streakUnit(freq: HabitFrequency): string {
  if (freq === 'weekly')  return 'нед';
  if (freq === 'monthly') return 'мес';
  return 'д';
}

export function hotThreshold(freq: HabitFrequency): number {
  if (freq === 'weekly' || freq === 'monthly') return 3;
  return 7;
}

export interface CompletionRecord {
  date: string; // ISO date string "YYYY-MM-DD"
}

export interface Habit {
  id: string;
  name: string;
  color: string;
  icon: string;
  frequency: HabitFrequency;
  createdAt: string;
  completions: CompletionRecord[];
}
