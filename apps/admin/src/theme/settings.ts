import store from 'store2';
import { THEME_STORAGE_KEY } from './bootstrap';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = Exclude<ThemeMode, 'system'>;

export function normalizeThemeMode(value: unknown): ThemeMode {
  return value === 'light' || value === 'dark' ? value : 'system';
}

export function readThemeMode(): ThemeMode {
  try {
    return normalizeThemeMode(store.get(THEME_STORAGE_KEY));
  } catch {
    return 'system';
  }
}

export function saveThemeMode(mode: ThemeMode) {
  try {
    store.set(THEME_STORAGE_KEY, mode);
  } catch {
    // Theme switching still works for this session when storage is unavailable.
  }
}

export function nextThemeMode(mode: ThemeMode): ThemeMode {
  return { light: 'dark', dark: 'system', system: 'light' }[mode] as ThemeMode;
}

export function resolveTheme(
  mode: ThemeMode,
  systemDark: boolean,
): ResolvedTheme {
  return mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;
}
