import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';
import store from 'store2';
import { initializeTheme, THEME_STORAGE_KEY } from '../src/theme/bootstrap';
import {
  nextThemeMode,
  normalizeThemeMode,
  readThemeMode,
  resolveTheme,
  saveThemeMode,
} from '../src/theme/settings';
import { tagColors } from '../src/theme/tagColors';

test('missing or invalid local preference follows the system', () => {
  for (const value of [null, undefined, '', 'invalid', {}, false, 'system']) {
    assert.equal(normalizeThemeMode(value), 'system');
  }
  assert.equal(resolveTheme('system', true), 'dark');
  assert.equal(resolveTheme('system', false), 'light');
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
});

test('cycles light -> dark -> system -> light and persists with store2', () => {
  assert.equal(nextThemeMode('light'), 'dark');
  assert.equal(nextThemeMode('dark'), 'system');
  assert.equal(nextThemeMode('system'), 'light');
  for (const mode of ['light', 'dark', 'system'] as const) {
    saveThemeMode(mode);
    assert.equal(readThemeMode(), mode);
    assert.equal(store.get(THEME_STORAGE_KEY), mode);
  }
  store.remove(THEME_STORAGE_KEY);
});

test('storage failures cannot break reading or switching themes', () => {
  const get = store.get;
  const set = store.set;
  try {
    store.get = () => {
      throw new Error('Storage blocked');
    };
    store.set = () => {
      throw new Error('Quota exceeded');
    };
    assert.equal(readThemeMode(), 'system');
    assert.doesNotThrow(() => saveThemeMode('dark'));
  } finally {
    store.get = get;
    store.set = set;
  }
});

test('head bootstrap agrees with runtime and survives malformed/blocked storage', () => {
  for (const dark of [false, true]) {
    for (const saved of [
      null,
      '"light"',
      '"dark"',
      '"system"',
      'broken',
      '{}',
      'blocked',
    ]) {
      const root = { dataset: {}, style: {} };
      vm.runInNewContext(
        `(${initializeTheme.toString()})(${JSON.stringify(THEME_STORAGE_KEY)})`,
        {
          document: { documentElement: root },
          localStorage: {
            getItem: (key: string) => {
              assert.equal(key, THEME_STORAGE_KEY);
              if (saved === 'blocked') throw new Error('Storage blocked');
              return saved;
            },
          },
          window: { matchMedia: () => ({ matches: dark }) },
        },
      );
      const mode =
        saved === '"light"' ? 'light' : saved === '"dark"' ? 'dark' : 'system';
      assert.equal(root.dataset.theme, resolveTheme(mode, dark));
      assert.equal(root.style.colorScheme, resolveTheme(mode, dark));
    }
  }
});

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

test('dark torrent labels remain readable across hues, including hover', () => {
  for (let hue = 0; hue < 360; hue += 5) {
    const colors = tagColors(hue, 'dark');
    for (const state of ['', 'hover-']) {
      const foreground = luminance(colors[`--tag-${state}color`]);
      const background = luminance(colors[`--tag-${state}bg-color`]);
      assert.ok(
        (foreground + 0.05) / (background + 0.05) >= 4.5,
        `hue=${hue}, state=${state}`,
      );
    }
    assert.notEqual(
      colors['--tag-bg-color'],
      tagColors(hue, 'light')['--tag-bg-color'],
    );
  }
});
