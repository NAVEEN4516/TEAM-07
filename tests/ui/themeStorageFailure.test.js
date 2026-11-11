import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { getStoredTheme, applyTheme, initTheme } from '../../src/js/ui/themeManager.js';

/**
 * Theme persistence when browser storage is unavailable or the OS prefers dark
 * (BDC-SR-003, TC-SR-03.1 addendum: "test startup when storage throws"; BDC-NF-004).
 *
 * Theme persistence is separate from sprint data, which is never saved
 * automatically. This file runs in its own process, so replacing the globals
 * here cannot affect other test files.
 */

const STORAGE_KEY = 'burndown_theme_pref';
const original = { window: globalThis.window, document: globalThis.document, localStorage: globalThis.localStorage };

/** Installs a fake page with the given storage behaviour and OS colour preference. */
function installPage({ storage, prefersDark = false, withWindow = true }) {
  const attributes = {};
  globalThis.document = {
    documentElement: {
      getAttribute: name => attributes[name] ?? null,
      setAttribute: (name, value) => { attributes[name] = String(value); }
    }
  };
  if (withWindow) {
    globalThis.window = { matchMedia: () => ({ matches: prefersDark }) };
    Object.defineProperty(globalThis.window, 'localStorage', { get: storage, configurable: true });
  } else {
    delete globalThis.window;
    Object.defineProperty(globalThis, 'localStorage', { get: storage, configurable: true });
  }
  return attributes;
}

/** A storage object backed by a plain map. */
function workingStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: key => (key in data ? data[key] : null),
    setItem: (key, value) => { data[key] = String(value); }
  };
}

describe('Theme persistence with unavailable storage', () => {
  beforeEach(() => {
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.localStorage;
  });

  afterEach(() => {
    for (const [name, value] of Object.entries(original)) {
      if (value === undefined) {
        delete globalThis[name];
      } else {
        Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
      }
    }
  });

  test('startup works when merely touching storage throws (private browsing or blocked cookies)', () => {
    const attributes = installPage({ storage: () => { throw new Error('SecurityError: storage is blocked'); } });

    assert.doesNotThrow(() => initTheme(null));
    assert.equal(getStoredTheme(), 'light');
    assert.equal(attributes['data-theme'], 'light', 'the page must still receive a theme');
  });

  test('startup works when reading or writing a stored value throws (quota exceeded)', () => {
    const attributes = installPage({
      storage: () => ({
        getItem: () => { throw new Error('read failed'); },
        setItem: () => { throw new Error('QuotaExceededError'); }
      })
    });

    assert.equal(getStoredTheme(), 'light');
    assert.doesNotThrow(() => applyTheme('dark'));
    assert.equal(attributes['data-theme'], 'dark', 'the theme must still apply even though it cannot be saved');
  });

  test('with storage blocked, an OS set to dark mode still gets the dark theme', () => {
    installPage({ storage: () => { throw new Error('blocked'); }, prefersDark: true });

    assert.equal(getStoredTheme(), 'dark');
  });

  test('on a first visit the OS colour preference decides the theme', () => {
    installPage({ storage: () => workingStorage(), prefersDark: true });
    assert.equal(getStoredTheme(), 'dark');

    installPage({ storage: () => workingStorage(), prefersDark: false });
    assert.equal(getStoredTheme(), 'light');
  });

  test('a saved choice overrides the OS preference in both directions', () => {
    installPage({ storage: () => workingStorage({ [STORAGE_KEY]: 'light' }), prefersDark: true });
    assert.equal(getStoredTheme(), 'light');

    installPage({ storage: () => workingStorage({ [STORAGE_KEY]: 'dark' }), prefersDark: false });
    assert.equal(getStoredTheme(), 'dark');
  });

  test('a corrupted saved value is ignored in favour of the OS preference', () => {
    for (const saved of ['purple', '', '{"theme":"dark"}', 'DARK']) {
      installPage({ storage: () => workingStorage({ [STORAGE_KEY]: saved }), prefersDark: true });
      assert.equal(getStoredTheme(), 'dark', `saved value ${JSON.stringify(saved)}`);
    }
  });

  test('storage is still used when only a global localStorage exists', () => {
    const storage = workingStorage({ [STORAGE_KEY]: 'dark' });
    installPage({ storage: () => storage, withWindow: false });

    assert.equal(getStoredTheme(), 'dark');
    applyTheme('light');
    assert.equal(storage.data[STORAGE_KEY], 'light');
  });

  test('without any window the theme falls back to light and applying one still works', () => {
    delete globalThis.window;
    globalThis.document = { documentElement: { getAttribute: () => null, setAttribute() {} } };

    assert.equal(getStoredTheme(), 'light');
    assert.doesNotThrow(() => applyTheme('dark'));
  });
});
