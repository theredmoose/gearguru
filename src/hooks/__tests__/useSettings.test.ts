import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings } from '../useSettings';
import type { AppSettings } from '../../types';

const STORAGE_KEY = 'gearguru:settings';

const DEFAULT: AppSettings = {
  heightUnit: 'cm',
  weightUnit: 'kg',
  skiLengthUnit: 'cm',
  defaultSport: 'alpine',
  display: { showFoot: true, showHand: true, separateFeetHands: false },
  sizingModel: 'generic',
  sizingDisplay: 'range',
  bootUnit: 'mp',
};

// localStorage mock
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
};

vi.stubGlobal('localStorage', localStorageMock);

beforeEach(() => {
  vi.clearAllMocks();
  // Clear the backing store
  Object.keys(store).forEach(k => delete store[k]);
  // Re-bind fns so they still reference store
  localStorageMock.getItem.mockImplementation((key: string) => store[key] ?? null);
  localStorageMock.setItem.mockImplementation((key: string, value: string) => { store[key] = value; });
  localStorageMock.removeItem.mockImplementation((key: string) => { delete store[key]; });
});

describe('useSettings', () => {
  describe('initial state', () => {
    it('returns default settings when localStorage is empty', () => {
      const { result } = renderHook(() => useSettings());
      expect(result.current.settings).toEqual(DEFAULT);
    });

    it('loads settings from localStorage', () => {
      const saved: AppSettings = { ...DEFAULT, weightUnit: 'lbs', defaultSport: 'snowboard' };
      store[STORAGE_KEY] = JSON.stringify(saved);
      const { result } = renderHook(() => useSettings());
      expect(result.current.settings.weightUnit).toBe('lbs');
      expect(result.current.settings.defaultSport).toBe('snowboard');
    });

    it('merges partial display settings from localStorage with defaults', () => {
      store[STORAGE_KEY] = JSON.stringify({ display: { showFoot: false } });
      const { result } = renderHook(() => useSettings());
      expect(result.current.settings.display.showFoot).toBe(false);
      expect(result.current.settings.display.showHand).toBe(true);
    });

    it('falls back to defaults when localStorage has invalid JSON', () => {
      store[STORAGE_KEY] = 'not-json}}}';
      const { result } = renderHook(() => useSettings());
      expect(result.current.settings).toEqual(DEFAULT);
    });
  });

  describe('updateSettings', () => {
    it('merges a partial patch into settings', () => {
      const { result } = renderHook(() => useSettings());
      act(() => { result.current.updateSettings({ weightUnit: 'lbs' }); });
      expect(result.current.settings.weightUnit).toBe('lbs');
      expect(result.current.settings.heightUnit).toBe('cm');
    });

    it('deeply merges display sub-object', () => {
      const { result } = renderHook(() => useSettings());
      act(() => { result.current.updateSettings({ display: { showFoot: false, showHand: true } }); });
      expect(result.current.settings.display.showFoot).toBe(false);
      expect(result.current.settings.display.showHand).toBe(true);
    });

    it('persists updated settings to localStorage', () => {
      const { result } = renderHook(() => useSettings());
      act(() => { result.current.updateSettings({ skiLengthUnit: 'in' }); });
      const stored = JSON.parse(store[STORAGE_KEY] ?? '{}');
      expect(stored.skiLengthUnit).toBe('in');
    });

    it('handles localStorage setItem failure gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => { throw new Error('storage full'); });
      const { result } = renderHook(() => useSettings());
      expect(() => {
        act(() => { result.current.updateSettings({ weightUnit: 'lbs' }); });
      }).not.toThrow();
      expect(result.current.settings.weightUnit).toBe('lbs');
    });
  });

  describe('resetSettings', () => {
    it('restores default settings', () => {
      const { result } = renderHook(() => useSettings());
      act(() => { result.current.updateSettings({ weightUnit: 'lbs', defaultSport: 'hockey' }); });
      act(() => { result.current.resetSettings(); });
      expect(result.current.settings).toEqual(DEFAULT);
    });

    it('removes settings from localStorage', () => {
      const { result } = renderHook(() => useSettings());
      act(() => { result.current.updateSettings({ weightUnit: 'lbs' }); });
      act(() => { result.current.resetSettings(); });
      expect(store[STORAGE_KEY]).toBeUndefined();
    });
  });
});
