/**
 * Dashboard UI Entry Controller
 * Coordinates dataset loading, burndown computation, chart rendering, and table display.
 * Integrates with DataManager, live sprint UI components, and theme management.
 */

import { defaultDataManager } from '../data/dataManager.js';
import { getDefaultDataset } from '../data/defaultDataset.js';
import { computeAll } from '../logic/burndownEngine.js';
import { renderTable } from './backlogTable.js';
import { renderChart, updateChartTheme } from './chart.js';
import { mountSprintBanner } from './sprintBanner.js';
import { mountCurrentDayControl } from './currentDayControl.js';
import { mountKPICards } from './kpiCards.js';
import { initTheme } from './themeManager.js';
import { createBacklogActions } from './backlogActions.js';

let backlogActions = null;

/**
 * State reference cache.
 * @type {Object|null}
 */
let currentState = null;

/**
 * Refreshes all dashboard components with the given state.
 * Supports silent high-resolution performance timing when ?perf URL parameter is present.
 *
 * @param {Object} state - Application state
 * @param {Object} state.sprint - Sprint metadata
 * @param {Array<Object>} state.issues - List of sprint issues
 */
export function refresh(state) {
  if (!state) {
    return;
  }
  currentState = state;

  // Defensive compute of burndown engine metrics (SAD §4.3)
  const sprint = state.sprint || {};
  const issues = Array.isArray(state.issues) ? state.issues : [];
  const metrics = computeAll(sprint, issues);

  // Update header sprint name badge if available
  const sprintNameEl = document.getElementById('sprint-name');
  if (sprintNameEl && sprint.sprintName) {
    sprintNameEl.textContent = sprint.sprintName;
  }

  // 1. Render burndown chart
  const chartCanvas = document.getElementById('burndown-chart');
  if (chartCanvas) {
    const activeTheme = (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark')
      ? 'dark'
      : 'light';
    const seriesData = {
      ideal: metrics.ideal,
      actual: metrics.actual,
      durationDays: sprint.durationDays
    };
    renderChart(chartCanvas, seriesData, sprint.currentDay, activeTheme);
  }

  // 2. Render sprint backlog table
  const tableEl = document.getElementById('backlog-table');
  if (tableEl) {
    renderTable(tableEl, issues, backlogActions);
  }
  const emptyState = document.getElementById('backlog-empty-state');
  if (emptyState) {
    emptyState.hidden = issues.length > 0 && metrics.totalPoints > 0;
    emptyState.textContent = issues.length === 0
      ? 'Your backlog is empty. All point totals are zero. Reset Data restores the sample sprint.'
      : 'This backlog has zero story points. Point totals and burndown lines remain at zero.';
  }
  if (chartCanvas) {
    chartCanvas.setAttribute('aria-label', `Burndown chart, Day ${sprint.currentDay} of ${sprint.durationDays}: ideal remaining ${metrics.ideal?.[sprint.currentDay]?.value ?? 0}, actual remaining ${metrics.remainingPoints} points. ${metrics.status}.`);
  }
}

/**
 * Initializes the dashboard on application startup.
 * Loads the dataset, mounts live components, binds state subscriptions, and sets up themes.
 */
export function initDashboard() {
  const dm = defaultDataManager || null;
  const initialDataset = dm ? { sprint: dm.getSprint(), issues: dm.getIssues() } : getDefaultDataset();

  // Initialize theme toggle controller
  if (typeof document !== 'undefined') {
    const editor = document.getElementById('issue-editor');
    const messages = document.getElementById('messages');
    const table = document.getElementById('backlog-table');
    const resetButton = document.getElementById('reset-data-btn');
    if (dm && editor && messages && table && resetButton) {
      backlogActions = createBacklogActions(dm, editor, messages, table, resetButton);
    }
    const themeBtn = document.getElementById('theme-toggle-btn');
    initTheme(themeBtn, (newTheme) => {
      updateChartTheme(newTheme);
    });
  }

  // Dev-only helper flags: enabled only via ?dev / ?day URL query parameters
  if (typeof window !== 'undefined' && window.location) {
    const params = new URLSearchParams(window.location.search);
    const dayParam = params.get('day');
    if (dayParam !== null && !isNaN(Number(dayParam))) {
      const parsedDay = Number(dayParam);
      if (dm) {
        dm.setCurrentDay(parsedDay);
      } else {
        initialDataset.sprint.currentDay = parsedDay;
      }
    }

    if (params.has('dev')) {
      window.__setDay = (n) => {
        if (dm) {
          dm.setCurrentDay(Number(n));
        } else if (currentState) {
          currentState.sprint.currentDay = Number(n);
          refresh(currentState);
        }
      };
    }
  }

  // Mount teammate components into their placeholder containers if present
  if (typeof document !== 'undefined') {
    const sprintConfigEl = document.getElementById('sprint-config');
    if (sprintConfigEl && typeof mountSprintBanner === 'function' && dm) {
      mountSprintBanner(sprintConfigEl, dm);
    }

    const kpiCardsEl = document.getElementById('kpi-cards');
    if (kpiCardsEl && typeof mountKPICards === 'function' && dm) {
      mountKPICards(kpiCardsEl, dm);
    }

    const currentDayControlEl = document.getElementById('current-day-control');
    if (currentDayControlEl && typeof mountCurrentDayControl === 'function' && dm) {
      mountCurrentDayControl(currentDayControlEl, dm);
    }
  }

  // Subscribe to DataManager changes for reactive updates across the dashboard
  if (dm && typeof dm.subscribe === 'function') {
    dm.subscribe(updatedDm => {
      refresh({
        sprint: updatedDm.getSprint(),
        issues: updatedDm.getIssues()
      });
    });
  }

  const activeSprint = dm ? dm.getSprint() : initialDataset.sprint;
  const activeIssues = dm ? dm.getIssues() : initialDataset.issues;
  refresh({ sprint: activeSprint, issues: activeIssues });
}

// Auto-initialize on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
  } else {
    initDashboard();
  }
}
