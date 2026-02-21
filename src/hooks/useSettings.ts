import { useState, useCallback } from 'react';
import type { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';

const STORAGE_KEY = 'gearguru:settings';

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      display: { ...DEFAULT_SETTINGS.display, ...(parsed.display ?? {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export interface UseSettingsReturn {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings(prev => {
      const next: AppSettings = {
        ...prev,
        ...patch,
        display: { ...prev.display, ...(patch.display ?? {}) },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage unavailable — continue with in-memory state
      }
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSettings, resetSettings };
}
