/**
 * @file addIssueForm.js
 * @description UI Component for adding new issues to the sprint backlog (BDC-F-006).
 * Provides accessible, validated form controls with real-time feedback,
 * safe text rendering, and responsive grid layout.
 * Conforms to SRS Section 4.2 (BDC-F-006), BDC-NF-002, BDC-NF-003, BDC-SR-001, and SAD Section 4.5.
 */

import { escapeHTML } from './sprintBanner.js';

/**
 * Extracts and normalizes form values from a FormData or key-value object.
 *
 * @param {FormData|object} formDataLike - Source form data
 * @returns {{
 *   issueKey: string,
 *   summary: string,
 *   issueType: string,
 *   storyPoints: string,
 *   status: string,
 *   completedDay: string
 * }} Parsed field values
 */
export function parseAddIssueFormValues(formDataLike) {
  if (!formDataLike) {
    return {
      issueKey: '',
      summary: '',
      issueType: 'Story',
      storyPoints: '',
      status: 'To Do',
      completedDay: ''
    };
  }

  const getVal = (key) => {
    if (typeof formDataLike.get === 'function') {
      const val = formDataLike.get(key);
      return val !== null ? String(val) : '';
    }
    const val = formDataLike[key];
    return val !== undefined && val !== null ? String(val) : '';
  };

  return {
    issueKey: getVal('issueKey'),
    summary: getVal('summary'),
    issueType: getVal('issueType') || 'Story',
    storyPoints: getVal('storyPoints'),
    status: getVal('status') || 'To Do',
    completedDay: getVal('completedDay')
  };
}

/**
 * Pure helper to render semantic HTML for the Add Issue form.
 * Escapes all user-supplied values and error messages.
 *
 * @param {object} [state={}] - Initial or current form state
 * @param {object} [state.values={}] - Pre-populated field values
 * @param {string[]} [state.errors=[]] - Validation error messages
 * @param {string} [state.successMessage=''] - Success status message
 * @returns {string} HTML markup string
 */
export function renderAddIssueFormHTML(state = {}) {
  const values = state.values || {};
  const errors = Array.isArray(state.errors) ? state.errors : [];
  const successMessage = state.successMessage || '';

  const issueKey = escapeHTML(values.issueKey || '');
  const summary = escapeHTML(values.summary || '');
  const issueType = values.issueType || 'Story';
  const storyPoints = escapeHTML(values.storyPoints !== undefined && values.storyPoints !== null ? String(values.storyPoints) : '');
  const status = values.status || 'To Do';
  const completedDay = escapeHTML(values.completedDay !== undefined && values.completedDay !== null ? String(values.completedDay) : '');

  const isDone = status === 'Done';

  let errorsHTML = '';
  if (errors.length > 0) {
    const errorItems = errors.map(err => `<li class="error-item">${escapeHTML(err)}</li>`).join('');
    errorsHTML = `
      <div class="form-errors" role="alert" data-testid="add-issue-errors">
        <div class="form-errors-header">
          <span class="error-icon" aria-hidden="true">&#9888;</span>
          <span class="error-title">Please correct the following errors:</span>
        </div>
        <ul class="error-list">
          ${errorItems}
        </ul>
      </div>
    `;
  }

  let statusHTML = '';
  if (successMessage) {
    statusHTML = `
      <div class="add-issue-status-msg" role="status" aria-live="polite" data-testid="add-issue-status">
        ${escapeHTML(successMessage)}
      </div>
    `;
  }

  return `
    <form class="add-issue-form" novalidate data-testid="add-issue-form">
      <div class="add-issue-errors-region">${errorsHTML}</div>
      <div class="add-issue-grid">
        <div class="form-group">
          <label for="add-issue-key" class="form-label">
            Issue Key <span class="required" aria-hidden="true">*</span>
          </label>
          <input
            type="text"
            id="add-issue-key"
            name="issueKey"
            class="form-control"
            placeholder="e.g. PROJ-101"
            value="${issueKey}"
            required
            data-testid="input-issue-key"
          >
        </div>

        <div class="form-group">
          <label for="add-issue-type" class="form-label">
            Type <span class="required" aria-hidden="true">*</span>
          </label>
          <select id="add-issue-type" name="issueType" class="form-control" data-testid="select-issue-type">
            <option value="Story" ${issueType === 'Story' ? 'selected' : ''}>Story</option>
            <option value="Task" ${issueType === 'Task' ? 'selected' : ''}>Task</option>
            <option value="Bug" ${issueType === 'Bug' ? 'selected' : ''}>Bug</option>
          </select>
        </div>

        <div class="form-group">
          <label for="add-issue-points" class="form-label">
            Story Points <span class="required" aria-hidden="true">*</span>
          </label>
          <input
            type="text"
            inputmode="decimal"
            id="add-issue-points"
            name="storyPoints"
            class="form-control"
            placeholder="e.g. 5"
            value="${storyPoints}"
            required
            data-testid="input-story-points"
          >
        </div>

        <div class="form-group">
          <label for="add-issue-status" class="form-label">
            Status <span class="required" aria-hidden="true">*</span>
          </label>
          <select id="add-issue-status" name="status" class="form-control" data-testid="select-status">
            <option value="To Do" ${status === 'To Do' ? 'selected' : ''}>To Do</option>
            <option value="In Progress" ${status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Done" ${status === 'Done' ? 'selected' : ''}>Done</option>
          </select>
        </div>

        <div id="add-issue-completed-day-group" class="form-group" data-testid="completed-day-group" ${isDone ? '' : 'hidden'}>
          <label for="add-issue-completed-day" class="form-label">
            Completion Day <span class="required" aria-hidden="true">*</span>
          </label>
          <input
            type="number"
            id="add-issue-completed-day"
            name="completedDay"
            class="form-control"
            min="1"
            step="1"
            placeholder="e.g. 4"
            value="${completedDay}"
            data-testid="input-completed-day"
          >
        </div>

        <div class="form-group form-group-full">
          <label for="add-issue-summary" class="form-label">
            Summary <span class="required" aria-hidden="true">*</span>
          </label>
          <input
            type="text"
            id="add-issue-summary"
            name="summary"
            class="form-control"
            placeholder="Brief issue description"
            value="${summary}"
            required
            data-testid="input-summary"
          >
        </div>
      </div>

      <div class="add-issue-actions">
        <button type="submit" class="btn btn-primary" data-testid="btn-add-issue">
          Add Issue
        </button>
        <div class="add-issue-status-region" role="status" aria-live="polite">${statusHTML}</div>
      </div>
    </form>
  `.trim();
}

/**
 * Mounts the Add Issue form component into a container element.
 * Mounts once and handles submissions without resetting active input state on unrelated notifications.
 *
 * @param {HTMLElement} container - DOM container element
 * @param {object} dataManager - Central DataManager instance
 * @returns {{ unmount: Function }} Unmount controller
 */
export function mountAddIssueForm(container, dataManager) {
  if (!container || typeof container !== 'object') {
    return { unmount: () => {} };
  }

  container.innerHTML = renderAddIssueFormHTML();

  const form = container.querySelector('form');
  if (!form) {
    return { unmount: () => { container.innerHTML = ''; } };
  }

  const keyInput = form.querySelector('#add-issue-key');
  const summaryInput = form.querySelector('#add-issue-summary');
  const typeSelect = form.querySelector('#add-issue-type');
  const pointsInput = form.querySelector('#add-issue-points');
  const statusSelect = form.querySelector('#add-issue-status');
  const completedDayGroup = form.querySelector('#add-issue-completed-day-group');
  const completedDayInput = form.querySelector('#add-issue-completed-day');
  const errorRegion = form.querySelector('.add-issue-errors-region');
  const statusRegion = form.querySelector('.add-issue-status-region');

  // Toggle Completion Day visibility based on Status selection
  const updateCompletedDayVisibility = () => {
    if (statusSelect && completedDayGroup) {
      if (statusSelect.value === 'Done') {
        completedDayGroup.removeAttribute('hidden');
        completedDayGroup.style.display = '';
      } else {
        completedDayGroup.setAttribute('hidden', '');
        completedDayGroup.style.display = 'none';
      }
    }
  };

  // Synchronize initial visibility on mount
  updateCompletedDayVisibility();

  if (statusSelect) {
    statusSelect.addEventListener('change', updateCompletedDayVisibility);
  }

  const inputsInOrder = [
    { name: 'issueKey', el: keyInput },
    { name: 'issueType', el: typeSelect },
    { name: 'storyPoints', el: pointsInput },
    { name: 'status', el: statusSelect },
    { name: 'completedDay', el: completedDayInput },
    { name: 'summary', el: summaryInput }
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    if (statusRegion) statusRegion.innerHTML = '';

    const fields = parseAddIssueFormValues(new FormData(form));
    const result = dataManager.addIssue(fields);

    if (!result.success) {
      // Build accessible error display with textContent to prevent unescaped HTML
      if (errorRegion) {
        errorRegion.innerHTML = '';
        const errorBox = document.createElement('div');
        errorBox.className = 'form-errors';
        errorBox.setAttribute('role', 'alert');
        errorBox.setAttribute('data-testid', 'add-issue-errors');

        const header = document.createElement('div');
        header.className = 'form-errors-header';
        const icon = document.createElement('span');
        icon.className = 'error-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = '⚠';
        const title = document.createElement('span');
        title.className = 'error-title';
        title.textContent = 'Please correct the following errors:';
        header.appendChild(icon);
        header.appendChild(title);
        errorBox.appendChild(header);

        const list = document.createElement('ul');
        list.className = 'error-list';
        result.errors.forEach(errText => {
          const li = document.createElement('li');
          li.className = 'error-item';
          li.textContent = errText;
          list.appendChild(li);
        });
        errorBox.appendChild(list);
        errorRegion.appendChild(errorBox);
      }

      // Track invalid inputs for aria-invalid and autofocus
      const fieldErrorMap = {
        issueKey: result.errors.some(e => e.includes('Issue key') || e.includes('key already exists')),
        summary: result.errors.some(e => e.includes('Summary')),
        issueType: result.errors.some(e => e.includes('Issue type')),
        storyPoints: result.errors.some(e => e.includes('Story points')),
        status: result.errors.some(e => e.includes('Status must be')),
        completedDay: result.errors.some(e => e.includes('Completion day') || e.includes('No completion day'))
      };

      let firstInvalid = null;
      for (const item of inputsInOrder) {
        if (!item.el) continue;
        if (fieldErrorMap[item.name]) {
          item.el.setAttribute('aria-invalid', 'true');
          if (!firstInvalid) firstInvalid = item.el;
        } else {
          item.el.setAttribute('aria-invalid', 'false');
        }
      }

      if (firstInvalid && typeof firstInvalid.focus === 'function') {
        firstInvalid.focus();
      }
    } else {
      // Success path
      if (errorRegion) errorRegion.innerHTML = '';
      inputsInOrder.forEach(item => {
        if (item.el) item.el.setAttribute('aria-invalid', 'false');
      });

      form.reset();
      if (typeSelect) typeSelect.value = 'Story';
      if (statusSelect) statusSelect.value = 'To Do';
      updateCompletedDayVisibility();

      if (statusRegion) {
        statusRegion.innerHTML = '';
        const msgEl = document.createElement('div');
        msgEl.className = 'add-issue-status-msg';
        msgEl.setAttribute('role', 'status');
        msgEl.setAttribute('aria-live', 'polite');
        msgEl.setAttribute('data-testid', 'add-issue-status');
        msgEl.textContent = 'Issue added.';
        statusRegion.appendChild(msgEl);
      }

      if (keyInput && typeof keyInput.focus === 'function') {
        keyInput.focus();
      }
    }
  };

  form.addEventListener('submit', handleSubmit);

  return {
    unmount: () => {
      form.removeEventListener('submit', handleSubmit);
      if (statusSelect) {
        statusSelect.removeEventListener('change', updateCompletedDayVisibility);
      }
      container.innerHTML = '';
    }
  };
}

export default mountAddIssueForm;
