import type { Habit } from '../models/types';
import { streakUnit, hotThreshold, frequencyDisplay } from '../models/types';
import { StatisticsService } from '../services/StatisticsService';

interface Props {
  habit: Habit;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function HabitCard({ habit, index, onToggle, onDelete }: Props) {
  const isChecked = StatisticsService.isCompletedToday(habit);
  const streak    = StatisticsService.currentStreak(habit);
  const prog      = StatisticsService.completionRate(habit);
  const unit      = streakUnit(habit.frequency);
  const hot       = streak >= hotThreshold(habit.frequency);

  return (
    <div
      className={`habit-card${isChecked ? ' checked' : ''}`}
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => onToggle(habit.id)}
    >
      <button
        className="card-delete"
        onClick={(e) => {
          e.stopPropagation();
          if (confirm(`Удалить привычку «${habit.name}»?`)) onDelete(habit.id);
        }}
      >
        ✕
      </button>

      <div className="card-top">
        <div className="card-icon" style={{ borderColor: habit.color }}>
          {isChecked ? '✓' : (habit.icon ?? '⭐')}
        </div>
        {streak > 0 && (
          <div className={`card-streak${hot ? ' hot' : ''}`}>
            {hot ? '🔥' : ''}{streak}{unit}
          </div>
        )}
      </div>

      <div className="card-name">{habit.name}</div>

      <div className="card-freq-badge">{frequencyDisplay(habit.frequency)}</div>

      <div className="card-progress-track">
        <div className="card-progress-fill" style={{ width: `${prog}%` }} />
      </div>
      <div className="card-prog-label">{prog}% выполнения</div>
    </div>
  );
}
