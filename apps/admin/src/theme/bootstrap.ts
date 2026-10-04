export const THEME_STORAGE_KEY = 'lani:theme';

// Serialized into a blocking head script by Umi. Keep this function self-contained
// and use the same JSON storage format as store2, before any page can paint.
export function initializeTheme(storageKey: string) {
  let mode = 'system';
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(storageKey) ?? 'null',
    );
    if (saved === 'light' || saved === 'dark') mode = saved;
  } catch {
    // Blocked storage or malformed settings must not prevent startup.
  }
  const dark =
    mode === 'dark' ||
    (mode === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}
