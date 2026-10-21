import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getStoredTheme, applyTheme, toggleTheme, initTheme } from '../../src/js/ui/themeManager.js';

describe('UI: ThemeManager (Light / Dark Theme Toggle & Persistence)', () => {
  let mockStorage = {};
  let mockAttributes = {};
  let mockElement = null;

  beforeEach(() => {
    mockStorage = {};
    mockAttributes = {};

    globalThis.localStorage = {
      getItem: (key) => mockStorage[key] || null,
      setItem: (key, val) => { mockStorage[key] = String(val); },
      removeItem: (key) => { delete mockStorage[key]; }
    };

    globalThis.window = {
      localStorage: globalThis.localStorage,
      matchMedia: () => ({ matches: false })
    };

    globalThis.document = {
      documentElement: {
        getAttribute: (attr) => mockAttributes[attr] || null,
        setAttribute: (attr, val) => { mockAttributes[attr] = String(val); }
      }
    };

    mockElement = {
      attributes: {},
      listeners: {},
      getAttribute(attr) { return this.attributes[attr] || null; },
      setAttribute(attr, val) { this.attributes[attr] = String(val); },
      addEventListener(event, fn) { this.listeners[event] = fn; }
    };
  });

  test('defaults to light theme when no stored preference exists', () => {
    assert.equal(getStoredTheme(), 'light');
  });

  test('reads saved theme preference from storage', () => {
    mockStorage['burndown_theme_pref'] = 'dark';
    assert.equal(getStoredTheme(), 'dark');

    mockStorage['burndown_theme_pref'] = 'light';
    assert.equal(getStoredTheme(), 'light');
  });

  test('applyTheme sets data-theme attribute on documentElement and saves to storage', () => {
    applyTheme('dark', mockElement);
    assert.equal(mockAttributes['data-theme'], 'dark');
    assert.equal(mockStorage['burndown_theme_pref'], 'dark');
    assert.equal(mockElement.attributes['data-active-theme'], 'dark');

    applyTheme('light', mockElement);
    assert.equal(mockAttributes['data-theme'], 'light');
    assert.equal(mockStorage['burndown_theme_pref'], 'light');
    assert.equal(mockElement.attributes['data-active-theme'], 'light');
  });

  test('toggleTheme alternates between light and dark themes cleanly', () => {
    mockAttributes['data-theme'] = 'light';
    const newTheme1 = toggleTheme(mockElement);
    assert.equal(newTheme1, 'dark');
    assert.equal(mockAttributes['data-theme'], 'dark');

    const newTheme2 = toggleTheme(mockElement);
    assert.equal(newTheme2, 'light');
    assert.equal(mockAttributes['data-theme'], 'light');
  });

  test('initTheme binds click listener and triggers callback on theme change', () => {
    let notifiedTheme = null;
    initTheme(mockElement, (t) => { notifiedTheme = t; });

    assert.ok(typeof mockElement.listeners['click'] === 'function');
    mockElement.listeners['click']();

    assert.equal(notifiedTheme, 'dark');
    assert.equal(mockAttributes['data-theme'], 'dark');
  });
});
