import type { Habit } from '../models/types';
import { streakUnit, frequencyDisplay } from '../models/types';
import { StatisticsService, isoWeekKey, globalMaxStreak } from '../services/StatisticsService';

interface Props {
  habits: Habit[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayDate(): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d;
}

// ── Completion donut ──────────────────────────────────────────────────────────

function CompletionDonut({ rate, color }: { rate: number; color: string }) {
  const R = 22, CIRC = 2 * Math.PI * R;
  const offset = CIRC * (1 - rate / 100);
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" style={{ flexShrink: 0 }}>
      <circle cx="27" cy="27" r={R} fill="none" stroke="#242424" strokeWidth="6" />
      <circle
        cx="27" cy="27" r={R}
        fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={CIRC} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 27 27)"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text x="27" y="32" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600" fontFamily="DM Sans">
        {rate}%
      </text>
    </svg>
  );
}

// ── Per-habit stats card ──────────────────────────────────────────────────────

function HabitStatsCard({ habit, index }: { habit: Habit; index: number }) {
  const rate   = StatisticsService.completionRate(habit);
  const curStr = StatisticsService.currentStreak(habit);
  const maxStr = StatisticsService.maxStreak(habit);
  const total  = habit.completions.length;
  const unit   = streakUnit(habit.frequency);
  const created = new Date(habit.createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div
      className="habit-stats-card"
      style={{ animationDelay: `${index * 0.06}s`, borderLeft: `3px solid ${habit.color}` }}
    >
      {/* Header */}
      <div className="hsc-header">
        <div className="hsc-icon" style={{ borderColor: habit.color }}>
          {habit.icon ?? '⭐'}
        </div>
        <div className="hsc-name">{habit.name}</div>
        <div className="hsc-freq-badge">{frequencyDisplay(habit.frequency)}</div>
      </div>

      {/* 4 chips in a single row */}
      <div className="hsc-chips-row">
        <div className="hsc-chip">
          <CompletionDonut rate={rate} color={habit.color} />
          <div className="hsc-chip-value" style={{ color: habit.color }}>{rate}%</div>
          <div className="hsc-chip-label">Выполнение</div>
        </div>

        <div className="hsc-chip">
          <div className="hsc-chip-emoji">🔥</div>
          <div className="hsc-chip-value">{curStr}{unit}</div>
          <div className="hsc-chip-label">Текущая серия</div>
        </div>

        <div className="hsc-chip">
          <div className="hsc-chip-emoji">🏆</div>
          <div className="hsc-chip-value">{maxStr}{unit}</div>
          <div className="hsc-chip-label">Макс. серия</div>
        </div>

        <div className="hsc-chip">
          <div className="hsc-chip-emoji">✅</div>
          <div className="hsc-chip-value">{total}</div>
          <div className="hsc-chip-label">Всего раз</div>
        </div>
      </div>

      <div className="hsc-created">Создана: {created}</div>
    </div>
  );
}

// ── Top-level statistics page ─────────────────────────────────────────────────

export default function StatisticsPage({ habits }: Props) {
  if (habits.length === 0) {
    return (
      <div className="stats-page">
        <div className="stats-empty">
          <div className="stats-empty-icon">📊</div>
          <div className="stats-empty-text">Добавьте привычки, чтобы увидеть статистику</div>
        </div>
      </div>
    );
  }

  const today    = todayDate();
  const todayStr = today.toISOString().slice(0, 10);

  const totalCompletions = habits.reduce((s, h) => s + h.completions.length, 0);
  const bestStreak       = globalMaxStreak(habits);
  const avgRate          = Math.round(
    habits.reduce((s, h) => s + StatisticsService.completionRate(h), 0) / habits.length,
  );
  const doneToday = habits.filter((h) => h.completions.some((c) => c.date === todayStr)).length;

  const topHabit = habits.reduce((best, h) =>
    StatisticsService.completionRate(h) > StatisticsService.completionRate(best) ? h : best,
  );

  const allDates   = new Set(habits.flatMap((h) => h.completions.map((c) => c.date)));
  const activeDays = allDates.size;

  const weekKey   = isoWeekKey(todayStr);
  const weekTotal = habits.reduce(
    (s, h) => s + h.completions.filter((c) => isoWeekKey(c.date) === weekKey).length,
    0,
  );

  return (
    <div className="stats-page">
      <div className="stats-topbar">
        <div className="stats-title-label">Статистика</div>
        <div className="stats-subtitle">Подробный анализ всех привычек</div>
      </div>

      <div className="stats-summary-row">
        <div className="stats-summary-card">
          <div className="ssc-icon">✅</div>
          <div className="ssc-value">{doneToday}<span className="ssc-of">/{habits.length}</span></div>
          <div className="ssc-label">Выполнено сегодня</div>
        </div>
        <div className="stats-summary-card">
          <div className="ssc-icon">🔥</div>
          <div className="ssc-value accent">{bestStreak}</div>
          <div className="ssc-label">Лучшая серия (дней)</div>
        </div>
        <div className="stats-summary-card">
          <div className="ssc-icon">📈</div>
          <div className="ssc-value">{avgRate}%</div>
          <div className="ssc-label">Средний % выполнения</div>
        </div>
        <div className="stats-summary-card">
          <div className="ssc-icon">📅</div>
          <div className="ssc-value">{weekTotal}</div>
          <div className="ssc-label">Выполнений за неделю</div>
        </div>
        <div className="stats-summary-card">
          <div className="ssc-icon">🗓️</div>
          <div className="ssc-value">{activeDays}</div>
          <div className="ssc-label">Активных дней всего</div>
        </div>
        <div className="stats-summary-card">
          <div className="ssc-icon">⭐</div>
          <div className="ssc-value">{totalCompletions}</div>
          <div className="ssc-label">Выполнений за всё время</div>
        </div>
      </div>

      <div className="stats-leader">
        <span className="stats-leader-label">Лидер по выполнению</span>
        <span className="stats-leader-icon">{topHabit.icon}</span>
        <span className="stats-leader-name">{topHabit.name}</span>
        <span className="stats-leader-rate" style={{ color: topHabit.color }}>
          {StatisticsService.completionRate(topHabit)}%
        </span>
      </div>

      <div className="stats-habits-header">Детализация по привычкам</div>
      <div className="stats-habits-section">
        {habits.map((h, i) => (
          <HabitStatsCard key={h.id} habit={h} index={i} />
        ))}
      </div>
    </div>
  );
}
