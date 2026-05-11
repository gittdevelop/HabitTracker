import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../StorageService';
import type { Habit } from '../../models/types';

const HABIT: Habit = {
  id: '1',
  name: 'Test',
  color: '#fff',
  icon: '⭐',
  frequency: 'daily',
  createdAt: '2024-01-01T00:00:00.000Z',
  completions: [],
};

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('load', () => {
    it('returns [] when localStorage is empty', () => {
      expect(StorageService.load()).toEqual([]);
    });

    it('parses stored habits correctly', () => {
      localStorage.setItem('habits', JSON.stringify([HABIT]));
      expect(StorageService.load()).toEqual([HABIT]);
    });

    it('adds default daily frequency for legacy habits without frequency field', () => {
      const legacy = [
        { id: '1', name: 'Old', color: '#fff', icon: '⭐', createdAt: '2024-01-01T00:00:00.000Z', completions: [] },
      ];
      localStorage.setItem('habits', JSON.stringify(legacy));
      expect(StorageService.load()[0].frequency).toBe('daily');
    });

    it('preserves existing frequency values', () => {
      const weekly: Habit = { ...HABIT, frequency: 'weekly' };
      localStorage.setItem('habits', JSON.stringify([weekly]));
      expect(StorageService.load()[0].frequency).toBe('weekly');
    });

    it('returns [] when localStorage contains invalid JSON', () => {
      localStorage.setItem('habits', 'not valid json{{');
      expect(StorageService.load()).toEqual([]);
    });
  });

  describe('save', () => {
    it('writes habits to localStorage', () => {
      StorageService.save([HABIT]);
      const raw = localStorage.getItem('habits');
      expect(JSON.parse(raw!)).toEqual([HABIT]);
    });

    it('overwrites previous data', () => {
      StorageService.save([HABIT]);
      StorageService.save([]);
      expect(JSON.parse(localStorage.getItem('habits')!)).toEqual([]);
    });
  });
});
