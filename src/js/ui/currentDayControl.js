/**
 * @file currentDayControl.js
 * @description UI Component for the Current Day Interactive Timeline Control (BDC-F-003).
 * Provides an accessible range slider and increment/decrement buttons to navigate sprint days.
 * Moving the control triggers real-time burndown chart, marker, and KPI recalculations.
 * Conforms to SRS BDC-F-003, BDC-NF-001, BDC-NF-002, and SAD Section 4.4 / 4.5.
 */

import { escapeHTML } from './sprintBanner.js';

/**
 * Renders semantic HTML markup for the Current Day Timeline Slider & Controls.
 *
 * @param {number} currentDay - Current selected sprint day (0..durationDays)
 * @param {number} durationDays - Total sprint duration in days
 * @param {object} [options] - Optional configurations
 * @returns {string} Accessible HTML string
 */
export function renderCurrentDayControlHTML(currentDay, durationDays, options = {}) {
  const safeDuration = typeof durationDays === 'number' && Number.isFinite(durationDays) && durationDays > 0
    ? durationDays
    : 10;
  const safeDay = typeof currentDay === 'number' && Number.isFinite(currentDay)
    ? Math.min(Math.max(currentDay, 0), safeDuration)
    : 0;

  const isPrevDisabled = safeDay <= 0;
  const isNextDisabled = safeDay >= safeDuration;
  const controlId = options.controlId || 'current-day-slider';

  return `
<section class="current-day-panel" aria-label="Sprint Timeline Control" data-testid="current-day-control">
  <div class="current-day-panel__header">
    <div class="current-day-label-group">
      <label for="${controlId}" class="current-day-label">
        <span class="label-icon" aria-hidden="true">&#128197;</span> Current Day:
      </label>
      <span class="current-day-badge" data-testid="current-day-value">
        Day <strong>${safeDay}</strong> of ${safeDuration}
      </span>
    </div>

    <div class="current-day-actions">
      <button
        type="button"
        class="btn btn-stepper btn-prev-day"
        data-testid="btn-prev-day" ${isPrevDisabled ? 'disabled aria-disabled="true"' : ''}
        aria-label="Move to previous day"
      >
        &larr; Prev Day
      </button>

      <button
        type="button"
        class="btn btn-stepper btn-next-day"
        data-testid="btn-next-day" ${isNextDisabled ? 'disabled aria-disabled="true"' : ''}
        aria-label="Move to next day"
      >
        Next Day &rarr;
      </button>
    </div>
  </div>

  <div class="current-day-slider-container">
    <input
      type="range"
      id="${controlId}"
      class="day-slider"
      min="0"
      max="${safeDuration}"
      value="${safeDay}"
      step="1"
      aria-valuemin="0"
      aria-valuemax="${safeDuration}"
      aria-valuenow="${safeDay}"
      aria-valuetext="Day ${safeDay} of ${safeDuration}"
      aria-label="Current sprint day slider"
      data-testid="current-day-slider"
    />
    <div class="slider-ticks" aria-hidden="true">
      <span class="tick tick-start">Day 0 (Start)</span>
      <span class="tick tick-current">Current: Day ${safeDay}</span>
      <span class="tick tick-end">Day ${safeDuration} (End)</span>
    </div>
  </div>
</section>
`.trim();
}

/**
 * Mounts the Current Day control into a DOM container and coordinates with DataManager.
 *
 * @param {HTMLElement} container - Target container element
 * @param {import('../data/dataManager.js').DataManager} dataManager - Data manager instance
 * @returns {{ unmount: Function }} Component lifecycle control
 */
export function mountCurrentDayControl(container, dataManager) {
  if (!container || typeof container !== 'object') {
    return { unmount: () => {} };
  }

  function update() {
    const sprint = dataManager.getSprint();
    const focusedTestId = container.contains(document.activeElement)
      ? document.activeElement.getAttribute('data-testid') : null;
    container.innerHTML = renderCurrentDayControlHTML(sprint.currentDay, sprint.durationDays);

    const slider = container.querySelector('[data-testid="current-day-slider"]');
    const prevBtn = container.querySelector('[data-testid="btn-prev-day"]');
    const nextBtn = container.querySelector('[data-testid="btn-next-day"]');

    if (slider) {
      slider.addEventListener('input', event => {
        const targetDay = Number(event.target.value);
        dataManager.setCurrentDay(targetDay);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const cur = dataManager.getCurrentDay();
        if (cur > 0) dataManager.setCurrentDay(cur - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const cur = dataManager.getCurrentDay();
        const duration = dataManager.getSprint().durationDays;
        if (cur < duration) dataManager.setCurrentDay(cur + 1);
      });
    }
    if (focusedTestId) {
      const replacement = container.querySelector(`[data-testid="${focusedTestId}"]`);
      (replacement && !replacement.disabled ? replacement : slider)?.focus();
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

export default renderCurrentDayControlHTML;
