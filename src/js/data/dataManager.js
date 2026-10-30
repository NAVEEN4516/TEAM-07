/**
 * @file dataManager.js
 * @description Centralized data and state management for Agile Burndown Chart Generator.
 * Implements BDC-F-001 (Sprint configuration), BDC-F-003 (Current Day control state),
 * BDC-F-004 (Default dataset state), and BDC-F-015 (Live KPI metrics computation).
 * Conforms to SRS Section 4, SAD Section 4.1 / 4.3, and maintains clean modular separation.
 */

import {
  getDefaultDataset,
  DEFAULT_SPRINT,
  DEFAULT_ISSUES,
  deepClone
} from './defaultDataset.js';

import {
  computeAll,
  calculateTotalPoints,
  calculateCompletedPoints,
  calculateRemainingPoints,
  calculateVariance,
  classifyStatus,
  SCHEDULE_STATUS
} from '../logic/burndownEngine.js';

import {
  validateIssue,
  validateStatusUpdate,
  validateSprint,
  validateCurrentDay as checkCurrentDay,
  sanitizeStoredState,
  parseStoredState
} from '../logic/validationManager.js';

/**
 * Validates a candidate sprint configuration object.
 * Delegates to ValidationManager.validateSprint (SAD Section 4.3), which enforces a
 * non-empty name, a whole-number duration of 1 to 60 working days, and real
 * calendar dates in order. Kept as an export for existing callers.
 * Conforms to SRS BDC-F-001, BDC-NF-003, and BDC-SR-002.
 *
 * @param {object} config - Candidate configuration object
 * @returns {{ valid: boolean, errors: string[] }} Validation result
 */
export function validateSprintConfig(config) {
  return validateSprint(config);
}

/**
 * Validates candidate Current Day value against the sprint duration.
 * Delegates to ValidationManager.validateCurrentDay and keeps this module's
 * single-error result shape for existing callers.
 * Conforms to SRS BDC-F-003 and SAD Section 4.1.
 *
 * @param {unknown} day - Candidate day
 * @param {number} durationDays - Total sprint duration
 * @returns {{ valid: boolean, error: string | null }} Validation result
 */
export function validateCurrentDay(day, durationDays) {
  const { valid, errors } = checkCurrentDay(day, durationDays);
  return { valid, error: valid ? null : errors[0] };
}

/**
 * Central State Store for Sprint Backlog & Timeline.
 */
export class DataManager {
  /**
   * Initializes DataManager instance with default dataset.
   * @param {object} [initialDataset] - Optional custom initial dataset
   */
  constructor(initialDataset = null) {
    /** @type {Set<Function>} */
    this._listeners = new Set();
    this.init(initialDataset);
  }

  /**
   * Initializes or reloads state.
   * A supplied dataset is validated before it is stored (BDC-NF-003, BDC-SR-003).
   * A missing sprint or issue list falls back to the default for that part; if the
   * result is still invalid, the whole default dataset is loaded instead and the
   * reasons are kept on `loadErrors`.
   *
   * @param {object} [dataset] - Dataset to initialize with, defaults to DEFAULT_DATASET
   */
  init(dataset = null) {
    /** @type {string[]} */
    this.loadErrors = [];
    let source = getDefaultDataset();

    if (dataset) {
      const result = sanitizeStoredState({
        sprint: dataset.sprint || DEFAULT_SPRINT,
        issues: dataset.issues || DEFAULT_ISSUES
      });
      if (result.valid) {
        source = result.state;
      } else {
        this.loadErrors = result.errors;
      }
    }

    this._sprint = deepClone(source.sprint);
    this._issues = deepClone(source.issues);
    this._notify();
  }

  /**
   * Resets entire store to baseline default dataset per SRS BDC-F-009.
   */
  reset() {
    this.init(getDefaultDataset());
  }

  /**
   * Serializes the current sprint and backlog, for example to save in localStorage.
   * Every value in the store has already passed validation, so the result is
   * accepted by restoreFromJSON.
   *
   * @returns {string} JSON text holding `{sprint, issues}`
   */
  serialize() {
    return JSON.stringify({ sprint: this._sprint, issues: this._issues });
  }

  /**
   * Loads a serialized sprint state, such as a localStorage payload (BDC-SR-003).
   * Malformed JSON or a schema violation never reaches the store: the default
   * dataset is restored instead, and the reasons are returned for display.
   * Never throws.
   *
   * @param {unknown} raw - Serialized state, usually from serialize()
   * @returns {{ success: boolean, errors: string[] }} success is false when defaults were restored
   */
  restoreFromJSON(raw) {
    const result = parseStoredState(raw);
    if (result.valid) {
      this.init(result.state);
      return { success: true, errors: [] };
    }
    this.init(null);
    this.loadErrors = result.errors;
    return { success: false, errors: result.errors };
  }

  /**
   * Returns an isolated deep-clone of the current sprint configuration.
   * @returns {{
   *   sprintName: string,
   *   durationDays: number,
   *   currentDay: number,
   *   totalStoryPoints: number,
   *   startDate?: string,
   *   endDate?: string
   * }} Current sprint config
   */
  getSprint() {
    return deepClone(this._sprint);
  }

  /**
   * Updates sprint configuration (BDC-F-001).
   * Validates parameters before saving. Rejects invalid input and retains
   * the previous valid configuration without state corruption (TC-F-01.2, TC-F-01.3).
   *
   * @param {object} candidateConfig - New configuration values
   * @returns {{ success: boolean, sprint: object, errors: string[] }} Result object
   */
  setSprint(candidateConfig) {
    const merged = {
      ...this._sprint,
      ...candidateConfig
    };

    const validation = validateSprintConfig(merged);
    if (!validation.valid) {
      return {
        success: false,
        sprint: this.getSprint(),
        errors: validation.errors
      };
    }

    // Apply valid configuration
    this._sprint.sprintName = merged.sprintName.trim();
    this._sprint.durationDays = merged.durationDays;
    if (merged.startDate) this._sprint.startDate = merged.startDate;
    if (merged.endDate) this._sprint.endDate = merged.endDate;

    // Adjust Current Day if it now exceeds the new duration
    if (this._sprint.currentDay > this._sprint.durationDays) {
      this._sprint.currentDay = this._sprint.durationDays;
    }

    // Recalculate total story points on sprint
    this._sprint.totalStoryPoints = calculateTotalPoints(this._issues);

    this._notify();

    return {
      success: true,
      sprint: this.getSprint(),
      errors: []
    };
  }

  /**
   * Returns current sprint day index (0..durationDays).
   * @returns {number} Current day
   */
  getCurrentDay() {
    return this._sprint.currentDay;
  }

  /**
   * Updates Current Day timeline value (BDC-F-003).
   * Rejects out-of-range values (< 0 or > durationDays) and non-numeric inputs.
   *
   * @param {number} day - Desired sprint day
   * @returns {{ success: boolean, currentDay: number, error: string | null }} Result
   */
  setCurrentDay(day) {
    const validation = validateCurrentDay(day, this._sprint.durationDays);
    if (!validation.valid) {
      return {
        success: false,
        currentDay: this._sprint.currentDay,
        error: validation.error
      };
    }

    this._sprint.currentDay = day;
    this._notify();

    return {
      success: true,
      currentDay: this._sprint.currentDay,
      error: null
    };
  }

  /**
   * Returns an isolated deep-clone of the current issues collection.
   * @returns {Array<object>} Backlog issues
   */
  getIssues() {
    return deepClone(this._issues);
  }

  /**
   * Adds a new issue to the sprint backlog (BDC-F-006).
   * Validates parameters, rejects duplicate or invalid inputs,
   * updates sprint commitment, and notifies subscribers.
   *
   * @param {object} issue - Candidate issue fields
   * @returns {{ success: boolean, issue: object | null, errors: string[] }} Result
   */
  addIssue(issue) {
    const existingKeys = this._issues.map(i => i.issueKey);
    const context = {
      currentDay: this._sprint.currentDay,
      durationDays: this._sprint.durationDays
    };

    const validation = validateIssue(issue, existingKeys, context);
    if (!validation.valid) {
      return {
        success: false,
        issue: null,
        errors: validation.errors
      };
    }

    const normalised = {
      issueKey: String(issue.issueKey).trim(),
      summary: String(issue.summary).trim(),
      issueType: issue.issueType,
      storyPoints: Number(issue.storyPoints),
      status: issue.status,
      completedDay: issue.status === 'Done' ? parseInt(issue.completedDay, 10) : null
    };

    // Ensure calculated aggregate values remain finite before storing the new issue
    const candidateIssues = [...this._issues, normalised];
    const candidateTotal = calculateTotalPoints(candidateIssues);
    if (!Number.isFinite(candidateTotal) || candidateTotal < 0 || candidateTotal > Number.MAX_SAFE_INTEGER) {
      return {
        success: false,
        issue: null,
        errors: ['Story points must be a non-negative number.']
      };
    }

    this._issues.push(normalised);
    this._sprint.totalStoryPoints = candidateTotal;
    this._notify();

    return {
      success: true,
      issue: deepClone(normalised),
      errors: []
    };
  }

  /**
   * Computes and returns the complete live KPI metrics per SRS BDC-F-015 and SAD Section 4.1.
   * Aggregates total scope, completed points, remaining points, timeline progress,
   * schedule variance, and status classification.
   *
   * @returns {{
   *   totalScope: number,
   *   totalPoints: number,
   *   completedPoints: number,
   *   remainingPoints: number,
   *   daysElapsed: number,
   *   daysLeft: number,
   *   variance: number,
   *   scheduleStatus: string,
   *   status: string,
   *   ideal: Array<{day: number, value: number}>,
   *   actual: Array<{day: number, value: number | null}>
   * }} Complete live metrics
   */
  getKPIs() {
    const raw = computeAll(this._sprint, this._issues);
    return {
      ...raw,
      totalScope: raw.totalPoints,
      scheduleStatus: raw.status
    };
  }

  /** BDC-F-007: update workflow fields atomically; reopening clears completion. */
  updateIssue(issueKey, changes) {
    const index = this._issues.findIndex(issue => issue.issueKey === issueKey);
    if (index < 0) return { success: false, errors: ['Issue was not found.'] };
    if (!changes || typeof changes !== 'object' || Array.isArray(changes)) {
      return { success: false, errors: ['Provide status and completion day.'] };
    }
    const current = this._issues[index];
    const status = changes.status ?? current.status;
    const completedDay = status === 'Done'
      ? (changes.completedDay === undefined ? current.completedDay : changes.completedDay)
      : null;
    const validation = validateStatusUpdate(status, completedDay,
      this._sprint.currentDay, this._sprint.durationDays);
    if (!validation.valid) return { success: false, errors: validation.errors };
    this._issues[index] = { ...current, status, completedDay };
    this._sprint.totalStoryPoints = calculateTotalPoints(this._issues);
    this._notify();
    return { success: true, errors: [], issue: deepClone(this._issues[index]) };
  }

  /** BDC-F-008: remove exactly one issue and publish the recalculated scope. */
  deleteIssue(issueKey) {
    const index = this._issues.findIndex(issue => issue.issueKey === issueKey);
    if (index < 0) return { success: false, errors: ['Issue was not found.'] };
    this._issues.splice(index, 1);
    this._sprint.totalStoryPoints = calculateTotalPoints(this._issues);
    this._notify();
    return { success: true, errors: [] };
  }

  /**
   * Subscribes a listener callback to state change events.
   * @param {Function} listener - Function called with current dataManager state on change
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    if (typeof listener === 'function') {
      this._listeners.add(listener);
    }
    return () => this._listeners.delete(listener);
  }

  /**
   * Notifies all registered subscribers of state change.
   * @private
   */
  _notify() {
    const hasPerf = typeof performance !== 'undefined';
    if (hasPerf) {
      this.lastNotifyStartedAt = performance.now();
    }
    for (const listener of this._listeners) {
      try {
        listener(this);
      } catch (err) {
        // Prevent subscriber exception from breaking state pipeline
        console.error('Error in DataManager subscriber:', err);
      }
    }
    if (hasPerf) {
      this.lastNotifyMs = performance.now() - this.lastNotifyStartedAt;
    }
  }
}

// Global default singleton instance
export const defaultDataManager = new DataManager();
export default defaultDataManager;
