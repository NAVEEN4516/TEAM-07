/**
 * @file themeManager.js
 * @description Manages Light and Dark theme toggling, persistence, and chart synchronization.
 */

const STORAGE_KEY = 'burndown_theme_pref';

/**
 * Safely accesses local storage in browser or testing environments.
 *
 * @returns {Storage|null} Local storage object or null
 */
function getStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
  } catch {
    // Ignore sandbox or security errors
  }
  return null;
}

/**
 * Gets the current active theme, defaulting to 'light'.
 * Checks localStorage first, then system preference.
 *
 * @returns {'light'|'dark'} Active theme name
 */
export function getStoredTheme() {
  const storage = getStorage();
  if (storage) {
    try {
      const saved = storage.getItem(STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch {
      // Fall through
    }
  }

  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

/**
 * Applies a theme to the document root and persists the selection.
 *
 * @param {'light'|'dark'} theme - Target theme to apply
 * @param {HTMLElement} [toggleBtn] - Optional theme toggle button to update
 */
export function applyTheme(theme, toggleBtn = null) {
  const normalized = theme === 'dark' ? 'dark' : 'light';

  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.setAttribute('data-theme', normalized);
  }

  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, normalized);
    } catch {
      // Ignore private browsing storage quota exceptions
    }
  }

  if (toggleBtn && typeof toggleBtn.setAttribute === 'function') {
    const nextTheme = normalized === 'dark' ? 'light' : 'dark';
    toggleBtn.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
    toggleBtn.setAttribute('title', `Active: ${normalized.toUpperCase()} theme (click to switch to ${nextTheme})`);
    toggleBtn.setAttribute('data-active-theme', normalized);
  }
}

/**
 * Toggles the current theme between 'light' and 'dark'.
 *
 * @param {HTMLElement} [toggleBtn] - Optional toggle button element
 * @returns {'light'|'dark'} The newly active theme
 */
export function toggleTheme(toggleBtn = null) {
  const current = (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme')) === 'dark'
    ? 'dark'
    : 'light';
  const newTheme = current === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme, toggleBtn);
  return newTheme;
}

/**
 * Initializes the theme controller on page load.
 *
 * @param {HTMLElement|null} toggleBtn - Theme button element
 * @param {Function} [onThemeChange] - Callback invoked when theme changes
 * @returns {string} Initial theme
 */
export function initTheme(toggleBtn = null, onThemeChange = null) {
  const theme = getStoredTheme();
  applyTheme(theme, toggleBtn);

  if (toggleBtn && typeof toggleBtn.addEventListener === 'function') {
    toggleBtn.addEventListener('click', () => {
      const updated = toggleTheme(toggleBtn);
      if (typeof onThemeChange === 'function') {
        onThemeChange(updated);
      }
    });
  }

  return theme;
}
