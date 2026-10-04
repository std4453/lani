import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { THEME_STORAGE_KEY } from './bootstrap';
import {
  nextThemeMode,
  readThemeMode,
  resolveTheme,
  saveThemeMode,
  ThemeMode,
  ResolvedTheme,
} from './settings';

const ThemeContext = createContext<{
  mode: ThemeMode;
  theme: ResolvedTheme;
  cycle: () => void;
} | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState(readThemeMode);
  const media = useMemo(
    () => window.matchMedia('(prefers-color-scheme: dark)'),
    [],
  );
  const [systemDark, setSystemDark] = useState(media.matches);
  const theme = resolveTheme(mode, systemDark);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const onSystemChange = () => setSystemDark(media.matches);
    const onStorage = (event: StorageEvent) => {
      if (
        event.storageArea === window.localStorage &&
        (event.key === THEME_STORAGE_KEY || event.key === null)
      ) {
        setMode(readThemeMode());
      }
    };
    onSystemChange();
    media.addEventListener('change', onSystemChange);
    window.addEventListener('storage', onStorage);
    return () => {
      media.removeEventListener('change', onSystemChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [media]);

  const value = useMemo(
    () => ({
      mode,
      theme,
      cycle: () => {
        const next = nextThemeMode(mode);
        saveThemeMode(next);
        setMode(next);
      },
    }),
    [mode, theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used within ThemeProvider');
  return value;
}
