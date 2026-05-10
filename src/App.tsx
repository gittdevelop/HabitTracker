import { useState } from 'react';
import type { Habit, HabitFrequency } from './models/types';
import { HabitService } from './services/HabitService';
import { StatisticsService, globalMaxStreak } from './services/StatisticsService';
import Sidebar from './components/Sidebar';
import HabitCard from './components/HabitCard';
import AddModal from './components/AddModal';
import StatisticsPage from './components/StatisticsPage';

type Page = 'habits' | 'stats';

export default function App() {
  const [habits, setHabits]       = useState<Habit[]>(() => HabitService.getAll());
  const [showModal, setShowModal] = useState(false);
  const [page, setPage]           = useState<Page>('habits');

  function handleAdd(name: string, color: string, icon: string, frequency: HabitFrequency) {
    setHabits(HabitService.add(name, color, icon, frequency));
  }

  function handleToggle(id: string) {
    setHabits(HabitService.toggleToday(id));
  }

  function handleDelete(id: string) {
    setHabits(HabitService.remove(id));
  }

  const done      = habits.filter((h) => StatisticsService.isCompletedToday(h)).length;
  const total     = habits.length;
  const pct       = total === 0 ? 0 : Math.round((done / total) * 100);
  const maxStreak = globalMaxStreak(habits);

  const dateLabel = capitalize(
    new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }),
  );

  return (
    <div className="app">
      <Sidebar
        pct={pct} done={done} total={total} maxStreak={maxStreak}
        page={page} onNavigate={setPage}
      />

      {page === 'habits' ? (
        <div className="main">
          <div className="topbar">
            <span className="date-label">{dateLabel}</span>
            <button className="btn-add" onClick={() => setShowModal(true)}>
              <span>+</span> Добавить
            </button>
          </div>

          <div className="cards-grid">
            {habits.map((h, i) => (
              <HabitCard
                key={h.id}
                habit={h}
                index={i}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
            <div className="card-add-empty" onClick={() => setShowModal(true)}>+</div>
          </div>
        </div>
      ) : (
        <StatisticsPage habits={habits} />
      )}

      {showModal && (
        <AddModal onAdd={handleAdd} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
