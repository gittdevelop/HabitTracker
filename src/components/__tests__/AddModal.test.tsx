import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import AddModal from '../AddModal';

describe('AddModal', () => {
  it('renders the modal title', () => {
    render(<AddModal onAdd={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText('Новая привычка')).toBeInTheDocument();
  });

  it('renders the name input with placeholder', () => {
    render(<AddModal onAdd={vi.fn()} onClose={vi.fn()} />);
    expect(
      screen.getByPlaceholderText('Например: Медитация 10 мин'),
    ).toBeInTheDocument();
  });

  it('renders submit and cancel buttons', () => {
    render(<AddModal onAdd={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText('Добавить')).toBeInTheDocument();
    expect(screen.getByText('Отмена')).toBeInTheDocument();
  });

  it('does not call onAdd when name is empty', () => {
    const onAdd = vi.fn();
    render(<AddModal onAdd={onAdd} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Добавить'));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('does not call onAdd when name is only whitespace', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddModal onAdd={onAdd} onClose={vi.fn()} />);
    await user.type(screen.getByPlaceholderText('Например: Медитация 10 мин'), '   ');
    fireEvent.click(screen.getByText('Добавить'));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('calls onAdd and onClose with correct args when submitted', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const onClose = vi.fn();
    render(<AddModal onAdd={onAdd} onClose={onClose} />);
    await user.type(screen.getByPlaceholderText('Например: Медитация 10 мин'), 'Бег');
    await user.click(screen.getByText('Добавить'));
    expect(onAdd).toHaveBeenCalledWith(
      'Бег',
      expect.any(String),
      expect.any(String),
      expect.any(String),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Отмена is clicked', () => {
    const onClose = vi.fn();
    render(<AddModal onAdd={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByText('Отмена'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose on Escape key press', () => {
    const onClose = vi.fn();
    render(<AddModal onAdd={vi.fn()} onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('submits on Enter key when name is filled', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddModal onAdd={onAdd} onClose={vi.fn()} />);
    const input = screen.getByPlaceholderText('Например: Медитация 10 мин');
    await user.type(input, 'Медитация');
    await user.keyboard('{Enter}');
    expect(onAdd).toHaveBeenCalled();
  });

  it('calls onClose when overlay background is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<AddModal onAdd={vi.fn()} onClose={onClose} />);
    const overlay = container.querySelector('.modal-overlay')!;
    // Simulate click where target === currentTarget (direct overlay click)
    fireEvent.click(overlay, { target: overlay });
    expect(onClose).toHaveBeenCalled();
  });

  it('shows frequency options', () => {
    render(<AddModal onAdd={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText('Раз в день')).toBeInTheDocument();
    expect(screen.getByText('Раз в неделю')).toBeInTheDocument();
    expect(screen.getByText('Раз в месяц')).toBeInTheDocument();
  });

  it('selecting a frequency changes the selected option', async () => {
    const user = userEvent.setup();
    render(<AddModal onAdd={vi.fn()} onClose={vi.fn()} />);
    const weeklyBtn = screen.getByText('Раз в неделю').closest('button')!;
    await user.click(weeklyBtn);
    expect(weeklyBtn.classList.contains('selected')).toBe(true);
  });
});
