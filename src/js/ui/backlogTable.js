/**
 * Backlog Table UI Component
 * Handles pure data transformation and secure DOM rendering for sprint backlog issues.
 */

/**
 * Returns a CSS class name for a given issue status string.
 *
 * @param {string} status - Issue status
 * @returns {string} Status CSS class
 */
function getStatusClass(status) {
  const normalized = String(status || '').toLowerCase().trim();
  if (normalized === 'done') {
    return 'status-done';
  }
  if (normalized === 'in progress') {
    return 'status-in-progress';
  }
  return 'status-to-do';
}

/**
 * Pure function: Transforms raw issue objects into display-ready strings.
 * Guarantees plain string output without DOM mutation.
 *
 * @param {Array<Object>} issues - Array of issue objects
 * @returns {Array<Object>} Array of formatted row objects with display strings
 */
export function buildTableRows(issues = []) {
  if (!Array.isArray(issues)) {
    return [];
  }

  return issues.map(issue => {
    const rawCompletedDay = issue?.completedDay;
    const completedDayStr = (rawCompletedDay !== null && rawCompletedDay !== undefined && rawCompletedDay !== '')
      ? String(rawCompletedDay)
      : '--';

    return {
      issueKey: String(issue?.issueKey ?? ''),
      summary: String(issue?.summary ?? ''),
      issueType: String(issue?.issueType ?? ''),
      storyPoints: (issue?.storyPoints !== null && issue?.storyPoints !== undefined)
        ? String(issue.storyPoints)
        : '',
      status: String(issue?.status ?? ''),
      completedDay: completedDayStr
    };
  });
}

/**
 * DOM rendering function: Renders the sprint backlog table securely.
 * Complies with BDC-SR-001 by using textContent and createElement exclusively (no innerHTML).
 *
 * @param {HTMLElement} container - Table element or parent container
 * @param {Array<Object>} issues - Array of issue objects
 */
export function renderTable(container, issues = [], actions = null) {
  if (!container) {
    return;
  }

  const table = container.tagName === 'TABLE' ? container : (container.querySelector('table') || container);
  table.textContent = '';

  const fragment = document.createDocumentFragment();

  // 1. Visually hidden caption for accessibility
  const caption = document.createElement('caption');
  caption.className = 'visually-hidden';
  caption.textContent = 'Sprint Backlog Issues';
  fragment.appendChild(caption);

  // 2. Thead with accessible headers
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const headers = [
    { label: 'Key', className: 'col-key' },
    { label: 'Summary', className: 'col-summary' },
    { label: 'Type', className: 'col-type' },
    { label: 'Points', className: 'col-points cell-number' },
    { label: 'Status', className: 'col-status' },
    { label: 'Completion Day', className: 'col-day cell-number' }
  ];
  if (actions) headers.push({ label: 'Actions', className: 'col-actions' });

  headers.forEach(h => {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = h.label;
    if (h.className) {
      th.className = h.className;
    }
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  fragment.appendChild(thead);

  // 3. Tbody with rows
  const tbody = document.createElement('tbody');
  const rows = buildTableRows(issues);

  if (rows.length === 0) {
    const emptyRow = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = headers.length;
    emptyCell.className = 'table-empty-cell';
    emptyCell.textContent = 'No issues in backlog. Reset Data restores the sample sprint.';
    emptyRow.appendChild(emptyCell);
    tbody.appendChild(emptyRow);
  } else {
    rows.forEach(row => {
      const tr = document.createElement('tr');

      // Key
      const tdKey = document.createElement('td');
      tdKey.className = 'cell-key';
      tdKey.textContent = row.issueKey;
      tr.appendChild(tdKey);

      // Summary
      const tdSummary = document.createElement('td');
      tdSummary.className = 'cell-summary';
      tdSummary.textContent = row.summary;
      tr.appendChild(tdSummary);

      // Type
      const tdType = document.createElement('td');
      tdType.className = 'cell-type';
      tdType.textContent = row.issueType;
      tr.appendChild(tdType);

      // Points
      const tdPoints = document.createElement('td');
      tdPoints.className = 'cell-number';
      tdPoints.textContent = row.storyPoints;
      tr.appendChild(tdPoints);

      // Status
      const tdStatus = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = `status-badge ${getStatusClass(row.status)}`;
      badge.textContent = row.status;
      tdStatus.appendChild(badge);
      tr.appendChild(tdStatus);

      // Completion Day
      const tdDay = document.createElement('td');
      tdDay.className = 'cell-number';
      tdDay.textContent = row.completedDay;
      tr.appendChild(tdDay);

      if (actions) {
        const cell = document.createElement('td');
        cell.className = 'issue-actions';
        for (const [label, handler] of [['Edit', actions.edit], ['Delete', actions.delete]]) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'btn btn-secondary';
          button.textContent = label;
          button.setAttribute('aria-label', `${label} ${row.issueKey}`);
          button.dataset.issueKey = row.issueKey;
          button.dataset.action = label.toLowerCase();
          button.addEventListener('click', () => handler(row.issueKey));
          cell.appendChild(button);
        }
        tr.appendChild(cell);
      }

      tbody.appendChild(tr);
    });
  }

  fragment.appendChild(tbody);
  table.appendChild(fragment);
}
