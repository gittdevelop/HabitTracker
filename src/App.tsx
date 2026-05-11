import { useState, useCallback, useMemo } from 'react';
import type { HabitFrequency } from './models/types';
import { useHabits } from './hooks/useHabits';
import Sidebar from './components/Sidebar';
import HabitCard from './components/HabitCard';
import AddModal from './components/AddModal';
import StatisticsPage from './components/StatisticsPage';

type Page = 'habits' | 'stats';

export default function App() {
  const { habits, addHabit, toggleHabit, deleteHabit, done, total, pct, maxStreak } = useHabits();
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState<Page>('habits');

  const openModal  = useCallback(() => setShowModal(true),  []);
  const closeModal = useCallback(() => setShowModal(false), []);

  const handleAdd = useCallback(
    (name: string, color: string, icon: string, frequency: HabitFrequency) => {
      addHabit(name, color, icon, frequency);
    },
    [addHabit],
  );

  const dateLabel = useMemo(
    () =>
      capitalize(
        new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }),
      ),
    [],
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
            <button className="btn-add" onClick={openModal}>
              <span>+</span> Добавить
            </button>
          </div>

          <div className="cards-grid">
            {habits.map((h, i) => (
              <HabitCard
                key={h.id}
                habit={h}
                index={i}
                onToggle={toggleHabit}
                onDelete={deleteHabit}
              />
            ))}
            <div className="card-add-empty" onClick={openModal}>+</div>
          </div>
        </div>
      ) : (
        <StatisticsPage habits={habits} />
      )}

      {showModal && <AddModal onAdd={handleAdd} onClose={closeModal} />}
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
