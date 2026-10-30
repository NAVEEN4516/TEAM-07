/**
 * @file sprintBanner.js
 * @description UI Component for Sprint Configuration & Overview Banner (BDC-F-001).
 * Displays sprint name, duration, date range, and current progress indicator.
 * Provides accessible sprint editing controls and input validation feedback.
 * Conforms to SRS BDC-F-001, BDC-NF-002, BDC-SR-001, and SAD Section 4.5.
 */

/**
 * Escapes unsafe characters in user-controlled text to prevent Cross-Site Scripting (XSS).
 * Conforms to BDC-SR-001 / TC-SR-01.1.
 *
 * @param {unknown} value - Raw string or value
 * @returns {string} Sanitized text
 */
export function escapeHTML(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Renders semantic HTML for the Sprint Configuration Banner.
 *
 * @param {{
 *   sprintName: string,
 *   durationDays: number,
 *   currentDay: number,
 *   startDate?: string,
 *   endDate?: string
 * }} sprint - Sprint configuration data
 * @param {object} [options] - Optional display settings
 * @param {boolean} [options.editable=true] - Whether to show the configure button
 * @returns {string} HTML string
 */
export function renderSprintBannerHTML(sprint, options = {}) {
  const name = escapeHTML(sprint?.sprintName || 'Untitled Sprint');
  const duration = typeof sprint?.durationDays === 'number' ? sprint.durationDays : 0;
  const currentDay = typeof sprint?.currentDay === 'number' ? sprint.currentDay : 0;
  const startDate = escapeHTML(sprint?.startDate || 'N/A');
  const endDate = escapeHTML(sprint?.endDate || 'N/A');
  const isEditable = options.editable !== false;

  return `
<header class="sprint-banner" role="banner" data-testid="sprint-banner">
  <div class="sprint-banner__header">
    <div class="sprint-banner__identity">
      <span class="sprint-badge">Active Sprint</span>
      <h1 class="sprint-title" data-testid="sprint-name">${name}</h1>
    </div>
    ${
      isEditable
        ? `<button type="button" class="btn btn-secondary btn-configure-sprint" data-testid="btn-configure-sprint" aria-label="Configure Sprint Parameters">
            <span class="icon" aria-hidden="true">&#9881;</span> Configure Sprint
          </button>`
        : ''
    }
  </div>

  <div class="sprint-banner__meta" role="list" aria-label="Sprint Details">
    <div class="meta-pill" role="listitem" data-testid="sprint-duration">
      <span class="meta-label">Duration:</span>
      <span class="meta-value">${duration} working days</span>
    </div>

    <div class="meta-pill" role="listitem" data-testid="sprint-dates">
      <span class="meta-label">Dates:</span>
      <span class="meta-value">${startDate} &mdash; ${endDate}</span>
    </div>

    <div class="meta-pill meta-pill--highlight" role="listitem" data-testid="sprint-day-badge">
      <span class="meta-label">Timeline:</span>
      <span class="meta-value">Day ${currentDay} of ${duration}</span>
    </div>
  </div>
</header>
`.trim();
}

/**
 * Renders the Sprint Configuration Modal/Form markup for editing sprint parameters (BDC-F-001).
 *
 * @param {{
 *   sprintName: string,
 *   durationDays: number,
 *   startDate?: string,
 *   endDate?: string
 * }} sprint - Current sprint data
 * @param {string[]} [errors=[]] - Array of validation error messages to display
 * @returns {string} Form HTML string
 */
export function renderSprintConfigFormHTML(sprint, errors = []) {
  const name = escapeHTML(sprint?.sprintName || '');
  const duration = escapeHTML(sprint?.durationDays ?? 10);
  const startDate = escapeHTML(sprint?.startDate || '');
  const endDate = escapeHTML(sprint?.endDate || '');

  const errorBlock =
    errors.length > 0
      ? `<div class="form-errors" role="alert" data-testid="config-errors">
          <div class="form-errors-header">
            <span class="error-icon" aria-hidden="true">&#9888;&#65039;</span>
            <span class="error-title">Please review and correct the following errors:</span>
          </div>
          <ul class="error-list">
            ${errors.map(err => `<li class="error-item">${escapeHTML(err)}</li>`).join('')}
          </ul>
        </div>`
      : '';

  return `
<form class="sprint-config-form" data-testid="sprint-config-form" novalidate>
  <div class="form-header">
    <div class="form-title-group">
      <span class="form-badge">&#9881; Sprint Settings</span>
      <h2 class="form-heading">Configure Sprint Parameters</h2>
      <p class="form-description">Adjust sprint timeline, working duration, and boundary dates for burndown tracking.</p>
    </div>
  </div>
  ${errorBlock}

  <div class="form-group">
    <label for="input-sprint-name" class="form-label">Sprint Name <span class="required" aria-hidden="true">*</span></label>
    <input
      type="text"
      id="input-sprint-name"
      name="sprintName"
      class="form-control"
      value="${name}"
      placeholder="e.g., Sprint 1 - Core Features"
      required
      data-testid="input-sprint-name"
    />
    <span class="form-hint">Descriptive title identifying this sprint iteration</span>
  </div>

  <div class="form-group">
    <label for="input-duration-days" class="form-label">Duration (working days) <span class="required" aria-hidden="true">*</span></label>
    <input
      type="number"
      id="input-duration-days"
      name="durationDays"
      class="form-control"
      value="${duration}"
      min="1"
      max="60"
      step="1"
      required
      data-testid="input-duration-days"
    />
    <span class="form-hint">Total number of active working days in sprint (1 to 60)</span>
  </div>

  <div class="form-row">
    <div class="form-group col">
      <label for="input-start-date" class="form-label">Start Date</label>
      <input
        type="date"
        id="input-start-date"
        name="startDate"
        class="form-control"
        value="${startDate}"
        data-testid="input-start-date"
      />
      <span class="form-hint">Sprint kick-off date</span>
    </div>

    <div class="form-group col">
      <label for="input-end-date" class="form-label">End Date</label>
      <input
        type="date"
        id="input-end-date"
        name="endDate"
        class="form-control"
        value="${endDate}"
        data-testid="input-end-date"
      />
      <span class="form-hint">Target completion date</span>
    </div>
  </div>

  <div class="form-actions">
    <button type="button" class="btn btn-tertiary btn-cancel" data-testid="btn-cancel-sprint">Cancel</button>
    <button type="submit" class="btn btn-primary" data-testid="btn-save-sprint">Save Configuration</button>
  </div>
</form>
`.trim();
}

/**
 * Mounts Sprint Banner into a DOM container element and binds to DataManager.
 *
 * @param {HTMLElement} container - Target DOM container
 * @param {import('../data/dataManager.js').DataManager} dataManager - Data manager instance
 * @returns {{ unmount: Function }} Component lifecycle control
 */
export function mountSprintBanner(container, dataManager) {
  if (!container || typeof container !== 'object') {
    return { unmount: () => {} };
  }

  function update() {
    const sprint = dataManager.getSprint();
    container.innerHTML = renderSprintBannerHTML(sprint);

    const configBtn = container.querySelector('[data-testid="btn-configure-sprint"]');
    if (configBtn) {
      configBtn.addEventListener('click', () => {
        container.innerHTML = renderSprintConfigFormHTML(sprint);
        bindForm();
        container.querySelector('#input-sprint-name')?.focus();
      });
    }
  }

  function bindForm() {
    const form = container.querySelector('[data-testid="sprint-config-form"]');
    const cancelBtn = container.querySelector('[data-testid="btn-cancel-sprint"]');

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        update();
        container.querySelector('[data-testid="btn-configure-sprint"]')?.focus();
      });
    }

    if (form) {
      form.addEventListener('submit', event => {
        event.preventDefault();
        const formData = new FormData(form);
        const candidate = {
          sprintName: String(formData.get('sprintName') || ''),
          durationDays: Number(formData.get('durationDays')),
          startDate: String(formData.get('startDate') || ''),
          endDate: String(formData.get('endDate') || '')
        };

        const result = dataManager.setSprint(candidate);
        if (!result.success) {
          container.innerHTML = renderSprintConfigFormHTML(candidate, result.errors);
          bindForm();
          const errors = container.querySelector('[data-testid="config-errors"]');
          errors?.setAttribute('tabindex', '-1');
          errors?.focus();
        } else {
          update();
          container.querySelector('[data-testid="btn-configure-sprint"]')?.focus();
        }
      });
    }
  }

  const unsubscribe = dataManager.subscribe(update);
  update();

  return {
    unmount: () => {
      unsubscribe();
      container.innerHTML = '';
    }
  };
}

export default renderSprintBannerHTML;
