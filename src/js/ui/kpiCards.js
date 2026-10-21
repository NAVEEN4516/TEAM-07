/**
 * @file kpiCards.js
 * @description UI Component for the Sprint KPI Summary Dashboard Cards (BDC-F-015).
 * Renders live metrics for Total Scope, Completed Points, Remaining Points, Days Elapsed,
 * Days Left, and Schedule Status with variance tracking.
 * Conforms to SRS BDC-F-015, BDC-NF-001, BDC-NF-002, and SAD Section 4.5.
 */

import { escapeHTML } from './sprintBanner.js';
import { SCHEDULE_STATUS } from '../logic/burndownEngine.js';

/**
 * Returns CSS class modifier and visual indicator corresponding to schedule status.
 * Ensures status is conveyed with both clear text and distinct styling (BDC-NF-002).
 *
 * @param {string} status - Schedule classification
 * @returns {{ cssModifier: string, icon: string, label: string }} Status metadata
 */
export function getStatusBadgeMetadata(status) {
  switch (status) {
    case SCHEDULE_STATUS.AHEAD:
      return {
        cssModifier: 'status--ahead',
        icon: '&#9650;', // Up triangle / positive
        label: SCHEDULE_STATUS.AHEAD
      };
    case SCHEDULE_STATUS.BEHIND:
      return {
        cssModifier: 'status--behind',
        icon: '&#9660;', // Down triangle / warning
        label: SCHEDULE_STATUS.BEHIND
      };
    case SCHEDULE_STATUS.ON_TRACK:
    default:
      return {
        cssModifier: 'status--on-track',
        icon: '&#9644;', // Neutral dash
        label: SCHEDULE_STATUS.ON_TRACK
      };
  }
}

/**
 * Formats variance number with explicit +/- sign for display.
 *
 * @param {number} variance - Story point variance
 * @returns {string} Formatted variance string
 */
export function formatVariance(variance) {
  if (typeof variance !== 'number' || !Number.isFinite(variance)) {
    return '0';
  }
  return variance > 0 ? `+${variance}` : `${variance}`;
}

/**
 * Renders semantic HTML markup for all 6 live Sprint KPI cards (BDC-F-015).
 *
 * @param {{
 *   totalScope?: number,
 *   totalPoints?: number,
 *   completedPoints?: number,
 *   remainingPoints?: number,
 *   daysElapsed?: number,
 *   daysLeft?: number,
 *   variance?: number,
 *   scheduleStatus?: string,
 *   status?: string
 * }} metrics - Current computed sprint metrics
 * @returns {string} Accessible HTML string
 */
export function renderKPICardsHTML(metrics = {}) {
  const total = metrics.totalScope ?? metrics.totalPoints ?? 0;
  const completed = metrics.completedPoints ?? 0;
  const remaining = metrics.remainingPoints ?? 0;
  const daysElapsed = metrics.daysElapsed ?? 0;
  const daysLeft = metrics.daysLeft ?? 0;
  const statusStr = metrics.scheduleStatus ?? metrics.status ?? SCHEDULE_STATUS.ON_TRACK;
  const variance = metrics.variance ?? 0;

  const badgeMeta = getStatusBadgeMetadata(statusStr);
  const formattedVariance = formatVariance(variance);

  return `
<section class="kpi-dashboard" role="region" aria-label="Sprint KPI Metrics" data-testid="kpi-dashboard">
  <div class="kpi-grid">
    <!-- 1. Total Scope -->
    <article class="kpi-card" data-testid="kpi-total-scope" aria-live="polite">
      <div class="kpi-card__header">
        <span class="kpi-label">Total Scope</span>
        <span class="kpi-icon" aria-hidden="true">&#128203;</span>
      </div>
      <div class="kpi-card__body">
        <span class="kpi-value">${total}</span>
        <span class="kpi-unit">pts</span>
      </div>
      <div class="kpi-card__footer">
        <span class="kpi-subtext">Total committed story points</span>
      </div>
    </article>

    <!-- 2. Completed Story Points -->
    <article class="kpi-card" data-testid="kpi-completed-points" aria-live="polite">
      <div class="kpi-card__header">
        <span class="kpi-label">Completed</span>
        <span class="kpi-icon" aria-hidden="true">&#9989;</span>
      </div>
      <div class="kpi-card__body">
        <span class="kpi-value">${completed}</span>
        <span class="kpi-unit">pts</span>
      </div>
      <div class="kpi-card__footer">
        <span class="kpi-subtext">Burned down by Current Day</span>
      </div>
    </article>

    <!-- 3. Remaining Story Points -->
    <article class="kpi-card" data-testid="kpi-remaining-points" aria-live="polite">
      <div class="kpi-card__header">
        <span class="kpi-label">Remaining</span>
        <span class="kpi-icon" aria-hidden="true">&#9203;</span>
      </div>
      <div class="kpi-card__body">
        <span class="kpi-value">${remaining}</span>
        <span class="kpi-unit">pts</span>
      </div>
      <div class="kpi-card__footer">
        <span class="kpi-subtext">Work left to burn down</span>
      </div>
    </article>

    <!-- 4. Days Elapsed -->
    <article class="kpi-card" data-testid="kpi-days-elapsed" aria-live="polite">
      <div class="kpi-card__header">
        <span class="kpi-label">Days Elapsed</span>
        <span class="kpi-icon" aria-hidden="true">&#128337;</span>
      </div>
      <div class="kpi-card__body">
        <span class="kpi-value">${daysElapsed}</span>
        <span class="kpi-unit">days</span>
      </div>
      <div class="kpi-card__footer">
        <span class="kpi-subtext">Current timeline progress</span>
      </div>
    </article>

    <!-- 5. Days Left -->
    <article class="kpi-card" data-testid="kpi-days-left" aria-live="polite">
      <div class="kpi-card__header">
        <span class="kpi-label">Days Left</span>
        <span class="kpi-icon" aria-hidden="true">&#9200;</span>
      </div>
      <div class="kpi-card__body">
        <span class="kpi-value">${daysLeft}</span>
        <span class="kpi-unit">days</span>
      </div>
      <div class="kpi-card__footer">
        <span class="kpi-subtext">Working days remaining in sprint</span>
      </div>
    </article>

    <!-- 6. Schedule Status & Variance -->
    <article class="kpi-card kpi-card--status" data-testid="kpi-schedule-status" aria-live="polite">
      <div class="kpi-card__header">
        <span class="kpi-label">Schedule Status</span>
        <span class="kpi-icon" aria-hidden="true">&#127919;</span>
      </div>
      <div class="kpi-card__body">
        <span class="status-badge ${badgeMeta.cssModifier}" data-testid="status-badge">
          <span class="status-indicator" aria-hidden="true">${badgeMeta.icon}</span>
          <span class="status-text">${escapeHTML(badgeMeta.label)}</span>
        </span>
      </div>
      <div class="kpi-card__footer">
        <span class="kpi-variance-detail" data-testid="kpi-variance">
          Variance: <strong>${formattedVariance}</strong> pts
        </span>
      </div>
    </article>
  </div>
</section>
`.trim();
}

/**
 * Mounts KPI Cards into a DOM container and coordinates with DataManager for real-time updates.
 *
 * @param {HTMLElement} container - Target container element
 * @param {import('../data/dataManager.js').DataManager} dataManager - Data manager instance
 * @returns {{ unmount: Function }} Component lifecycle control
 */
export function mountKPICards(container, dataManager) {
  if (!container || typeof container !== 'object') {
    return { unmount: () => {} };
  }

  function update() {
    const kpis = dataManager.getKPIs();
    container.innerHTML = renderKPICardsHTML(kpis);
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

export default renderKPICardsHTML;
