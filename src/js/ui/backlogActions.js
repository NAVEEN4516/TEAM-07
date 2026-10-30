/** Workflow editor and reset controls (BDC-F-007/008/009, BDC-NF-002).
 * User strings are assigned with textContent/value, never interpreted as markup.
 */
export function createBacklogActions(dataManager, editor, messages, table, resetButton) {
  let activeKey = null;

  function announce(message) {
    messages.textContent = message;
  }

  function focusAction(key, action = 'edit') {
    const button = [...table.querySelectorAll('button')].find(node =>
      node.dataset.issueKey === key && node.dataset.action === action);
    (button || resetButton).focus();
  }

  function close() {
    editor.replaceChildren();
    editor.hidden = true;
    activeKey = null;
  }

  function updateCompletionBounds(day, label) {
    const sprint = dataManager.getSprint();
    const lastValidDay = Math.min(sprint.currentDay, sprint.durationDays);
    day.max = String(lastValidDay);
    label.textContent = lastValidDay > 0
      ? `Completion day (1 to ${lastValidDay})`
      : 'Completion day (unavailable while Current Day is 0)';
  }

  function edit(key) {
    const issue = dataManager.getIssues().find(item => item.issueKey === key);
    if (!issue) return;
    activeKey = key;
    editor.hidden = false;
    editor.replaceChildren();
    const heading = document.createElement('h3');
    heading.id = 'issue-editor-title';
    heading.textContent = `Edit ${key}`;
    const form = document.createElement('form');
    form.className = 'issue-edit-form';
    form.noValidate = true;
    form.setAttribute('aria-labelledby', heading.id);
    const statusLabel = document.createElement('label');
    statusLabel.htmlFor = 'edit-issue-status';
    statusLabel.textContent = 'Status';
    const status = document.createElement('select');
    status.id = statusLabel.htmlFor;
    status.className = 'form-control';
    for (const value of ['To Do', 'In Progress', 'Done']) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      status.appendChild(option);
    }
    status.value = issue.status;
    const dayLabel = document.createElement('label');
    dayLabel.htmlFor = 'edit-completed-day';
    const day = document.createElement('input');
    day.id = dayLabel.htmlFor;
    day.className = 'form-control';
    day.type = 'number';
    day.min = '1';
    updateCompletionBounds(day, dayLabel);
    day.step = '1';
    day.value = issue.completedDay === null ? '' : String(issue.completedDay);
    const errors = document.createElement('p');
    errors.id = 'issue-edit-errors';
    errors.className = 'form-errors';
    errors.setAttribute('role', 'alert');
    errors.hidden = true;
    day.setAttribute('aria-describedby', errors.id);
    function syncDay() {
      day.disabled = status.value !== 'Done';
      day.required = !day.disabled;
      if (day.disabled) day.value = '';
      dayLabel.hidden = day.hidden = day.disabled;
    }
    status.addEventListener('change', syncDay);
    syncDay();
    const save = document.createElement('button');
    save.type = 'submit';
    save.className = 'btn btn-primary';
    save.textContent = 'Save issue';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'btn btn-secondary';
    cancel.textContent = 'Cancel';
    function cancelEdit() {
      close();
      focusAction(key);
    }
    cancel.addEventListener('click', cancelEdit);
    form.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); cancelEdit(); }
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const result = dataManager.updateIssue(key, {
        status: status.value,
        completedDay: day.value === '' ? null : Number(day.value)
      });
      if (!result.success) {
        errors.textContent = result.errors.join(' ');
        errors.hidden = false;
        day.setAttribute('aria-invalid', 'true');
        day.focus();
        return;
      }
      close();
      announce(`${key} updated. Chart and sprint metrics refreshed.`);
      focusAction(key);
    });
    form.append(statusLabel, status, dayLabel, day, errors, save, cancel);
    editor.append(heading, form);
    status.focus();
  }

  resetButton.addEventListener('click', () => {
    close();
    // Reset uses immutable defaults. It never trusts a cached dataset.
    dataManager.reset();
    announce('Data reset: 10 sample issues, 50 points, Current Day 4.');
    resetButton.focus();
  });

  // Keep editor bounds up to date after a timeline or sprint configuration change.
  dataManager.subscribe(() => {
    if (!activeKey) return;
    if (!dataManager.getIssues().some(issue => issue.issueKey === activeKey)) { close(); return; }
    const day = editor.querySelector('#edit-completed-day');
    if (day) {
      updateCompletionBounds(day, editor.querySelector('label[for="edit-completed-day"]'));
    }
  });

  return {
    edit,
    delete(key) {
      const issues = dataManager.getIssues();
      const index = issues.findIndex(issue => issue.issueKey === key);
      const nextKey = issues[index + 1]?.issueKey ?? issues[index - 1]?.issueKey;
      const result = dataManager.deleteIssue(key);
      if (!result.success) { announce(result.errors.join(' ')); return; }
      if (activeKey === key) close();
      announce(`${key} deleted. Chart and sprint metrics refreshed.`);
      focusAction(nextKey, 'delete');
    }
  };
}
