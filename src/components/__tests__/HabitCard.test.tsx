import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../services/StatisticsService', () => ({
  StatisticsService: {
    isCompletedToday: vi.fn(),
    currentStreak: vi.fn(),
    completionRate: vi.fn(),
  },
}));

import HabitCard from '../HabitCard';
import { StatisticsService } from '../../services/StatisticsService';
import type { Habit } from '../../models/types';

const HABIT: Habit = {
  id: 'h1',
  name: 'Медитация',
  color: '#6366f1',
  icon: '🧘',
  frequency: 'daily',
  createdAt: '2024-01-01T00:00:00.000Z',
  completions: [],
};

beforeEach(() => {
  vi.mocked(StatisticsService.isCompletedToday).mockReturnValue(false);
  vi.mocked(StatisticsService.currentStreak).mockReturnValue(0);
  vi.mocked(StatisticsService.completionRate).mockReturnValue(50);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('HabitCard', () => {
  it('renders the habit name', () => {
    render(<HabitCard habit={HABIT} index={0} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Медитация')).toBeInTheDocument();
  });

  it('renders the frequency badge', () => {
    render(<HabitCard habit={HABIT} index={0} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Ежедневная')).toBeInTheDocument();
  });

  it('renders the completion percentage', () => {
    render(<HabitCard habit={HABIT} index={0} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('50% выполнения')).toBeInTheDocument();
  });

  it('shows the habit icon when not completed', () => {
    const { container } = render(
      <HabitCard habit={HABIT} index={0} onToggle={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(container.querySelector('.card-icon')!.textContent).toBe('🧘');
  });

  it('shows ✓ icon when completed today', () => {
    vi.mocked(StatisticsService.isCompletedToday).mockReturnValue(true);
    const { container } = render(
      <HabitCard habit={HABIT} index={0} onToggle={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(container.querySelector('.card-icon')!.textContent).toBe('✓');
  });

  it('applies .checked class when completed today', () => {
    vi.mocked(StatisticsService.isCompletedToday).mockReturnValue(true);
    const { container } = render(
      <HabitCard habit={HABIT} index={0} onToggle={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(container.querySelector('.habit-card')!.classList.contains('checked')).toBe(true);
  });

  it('does not apply .checked class when not completed today', () => {
    const { container } = render(
      <HabitCard habit={HABIT} index={0} onToggle={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(container.querySelector('.habit-card')!.classList.contains('checked')).toBe(false);
  });

  it('calls onToggle with habit id when card is clicked', () => {
    const onToggle = vi.fn();
    const { container } = render(
      <HabitCard habit={HABIT} index={0} onToggle={onToggle} onDelete={vi.fn()} />,
    );
    fireEvent.click(container.querySelector('.habit-card')!);
    expect(onToggle).toHaveBeenCalledWith('h1');
  });

  it('calls onDelete with habit id when delete confirmed', () => {
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
    const onDelete = vi.fn();
    render(<HabitCard habit={HABIT} index={0} onToggle={vi.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getByText('✕'));
    expect(onDelete).toHaveBeenCalledWith('h1');
  });

  it('does not call onDelete when delete is cancelled', () => {
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(false));
    const onDelete = vi.fn();
    render(<HabitCard habit={HABIT} index={0} onToggle={vi.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getByText('✕'));
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('does not propagate click when delete button is clicked', () => {
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
    const onToggle = vi.fn();
    render(<HabitCard habit={HABIT} index={0} onToggle={onToggle} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByText('✕'));
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('shows streak badge when streak > 0', () => {
    vi.mocked(StatisticsService.currentStreak).mockReturnValue(5);
    const { container } = render(
      <HabitCard habit={HABIT} index={0} onToggle={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(container.querySelector('.card-streak')).toBeTruthy();
    expect(container.querySelector('.card-streak')!.textContent).toContain('5');
  });

  it('does not show streak badge when streak is 0', () => {
    const { container } = render(
      <HabitCard habit={HABIT} index={0} onToggle={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(container.querySelector('.card-streak')).toBeNull();
  });

  it('adds .hot class when streak meets hot threshold (7 for daily)', () => {
    vi.mocked(StatisticsService.currentStreak).mockReturnValue(7);
    const { container } = render(
      <HabitCard habit={HABIT} index={0} onToggle={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(container.querySelector('.card-streak.hot')).toBeTruthy();
  });
});
