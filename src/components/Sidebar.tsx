import { useState } from 'react';

const QUOTES = [
  'Маленькие действия каждый день создают большие перемены.',
  'Дисциплина — это свобода в долгосрочной перспективе.',
  'Не пропусти дважды. Один раз — случайность, дважды — начало новой привычки.',
  'Ты не растёшь в день, когда решаешь. Ты растёшь в день, когда делаешь.',
];

const CIRCUMFERENCE = 2 * Math.PI * 32; // ≈ 201.1

interface Props {
  pct: number;
  done: number;
  total: number;
  maxStreak: number;
  page: 'habits' | 'stats';
  onNavigate: (page: 'habits' | 'stats') => void;
}

export default function Sidebar({ pct, done, total, maxStreak, page, onNavigate }: Props) {
  const [quoteIdx, setQuoteIdx] = useState(0);

  const monthLabel = capitalize(
    new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-month">{monthLabel}</div>
      <div className="sidebar-title">Привычки</div>

      <div className="sidebar-nav">
        <button
          className={`sidebar-nav-btn${page === 'habits' ? ' active' : ''}`}
          onClick={() => onNavigate('habits')}
        >
          Привычки
        </button>
        <button
          className={`sidebar-nav-btn${page === 'stats' ? ' active' : ''}`}
          onClick={() => onNavigate('stats')}
        >
          Статистика
        </button>
      </div>

      <div className="ring-row">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32" fill="none" stroke="#1E1E1E" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="32" fill="none"
            stroke="#E8445A" strokeWidth="6"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - pct / 100)}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
            className="ring-fill"
          />
          <text x="40" y="46" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="600" fontFamily="DM Sans">
            {pct}%
          </text>
        </svg>
        <div>
          <div className="ring-count">{done}/{total}</div>
          <div className="ring-sub">выполнено</div>
        </div>
      </div>

      <div className="sidebar-stats">
        <div className="sidebar-stat-row">
          <span className="sidebar-stat-label">Макс. серия</span>
          <span className="sidebar-stat-value accent">{maxStreak}д</span>
        </div>
        <div className="sidebar-stat-row">
          <span className="sidebar-stat-label">Всего привычек</span>
          <span className="sidebar-stat-value">{total}</span>
        </div>
        <div className="sidebar-stat-row">
          <span className="sidebar-stat-label">Выполненные сегодня</span>
          <span className="sidebar-stat-value">{done}</span>
        </div>
      </div>

      <div className="quote-card" onClick={() => setQuoteIdx((i) => (i + 1) % QUOTES.length)}>
        <div className="quote-label">Цитата дня</div>
        <div className="quote-text">"{QUOTES[quoteIdx]}"</div>
        <div className="quote-hint">нажми чтобы сменить →</div>
      </div>
    </aside>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
