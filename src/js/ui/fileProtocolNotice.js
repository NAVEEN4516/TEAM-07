/**
 * @file fileProtocolNotice.js
 * @description Classic non-module script providing immediate user feedback
 * when the application is opened via file:// protocol in modern browsers (BDC-NF-004).
 * Modern browsers block ES module imports on file:// origins due to CORS policy.
 */
(function() {
  if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
    function displayFileProtocolWarning() {
      var container = document.getElementById('messages');
      if (!container) return;

      var alertBox = document.createElement('div');
      alertBox.className = 'form-errors';
      alertBox.setAttribute('role', 'alert');
      alertBox.style.margin = '1rem auto';
      alertBox.style.maxWidth = '1200px';

      var title = document.createElement('div');
      title.className = 'form-errors-header';
      title.textContent = 'Server Required (file:// protocol detected)';

      var desc = document.createElement('div');
      desc.textContent = 'This app must be served over http. Run `npx serve src` (or any static server) and open the printed URL.';

      alertBox.appendChild(title);
      alertBox.appendChild(desc);
      container.appendChild(alertBox);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', displayFileProtocolWarning);
    } else {
      displayFileProtocolWarning();
    }
  }
})();
