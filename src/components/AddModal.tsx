import { useState, useEffect } from 'react';
import type { HabitFrequency } from '../models/types';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
const ICONS = [
  '🏃', '💪', '📚', '💧', '🧘',
  '✍️', '🎯', '🚴', '🎨', '🎵',
  '🧹', '💊', '🧠', '⭐'
];

const FREQUENCIES: { value: HabitFrequency; icon: string; label: string; sub: string }[] = [
  { value: 'hourly',  icon: '⏰', label: 'Раз в час',    sub: 'Несколько раз в день'  },
  { value: 'daily',   icon: '📅', label: 'Раз в день',   sub: 'Ежедневная привычка'   },
  { value: 'weekly',  icon: '📆', label: 'Раз в неделю', sub: 'Еженедельная привычка' },
  { value: 'monthly', icon: '🗓️', label: 'Раз в месяц',  sub: 'Ежемесячная привычка'  },
];

interface Props {
  onAdd: (name: string, color: string, icon: string, frequency: HabitFrequency) => void;
  onClose: () => void;
}

export default function AddModal({ onAdd, onClose }: Props) {
  const [name, setName]           = useState('');
  const [color, setColor]         = useState(COLORS[0]);
  const [icon, setIcon]           = useState(ICONS[0]);
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleSubmit() {
    if (!name.trim()) return;
    onAdd(name.trim(), color, icon, frequency);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-title">Новая привычка</div>

        <input
          autoFocus
          className="modal-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          placeholder="Например: Медитация 10 мин"
          maxLength={60}
        />

        <div className="modal-icon-picker">
          {ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              className={`icon-btn${icon === ic ? ' selected' : ''}`}
              onClick={() => setIcon(ic)}
            >
              {ic}
            </button>
          ))}
        </div>

        <div className="modal-color-picker">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`color-dot${color === c ? ' selected' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>

        <div className="modal-label">Повторение</div>
        <div className="modal-freq-picker">
          {FREQUENCIES.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`freq-btn${frequency === f.value ? ' selected' : ''}`}
              onClick={() => setFrequency(f.value)}
            >
              <span className="freq-btn-icon">{f.icon}</span>
              <span className="freq-btn-label">{f.label}</span>
              <span className="freq-btn-sub">{f.sub}</span>
            </button>
          ))}
        </div>

        <div className="modal-actions">
          <button className="modal-submit" onClick={handleSubmit}>Добавить</button>
          <button className="modal-cancel" onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
}
