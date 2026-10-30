// Classic script runs before CSS to avoid a flash of the wrong theme under CSP.
(function () {
  let theme = 'light';
  try {
    const saved = localStorage.getItem('burndown_theme_pref');
    if (saved === 'dark' || (saved !== 'light' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)) {
      theme = 'dark';
    }
  } catch (_) { /* Storage restrictions must not prevent dashboard startup. */ }
  document.documentElement.setAttribute('data-theme', theme);
})();
