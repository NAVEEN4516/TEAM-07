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

import { validateIssue } from '../logic/validationManager.js';

/**
 * Validates a candidate sprint configuration object.
 * Checks for non-empty name, positive integer duration, and valid date ordering.
 * Conforms to SRS BDC-F-001, BDC-NF-003, and BDC-SR-002.
 *
 * @param {object} config - Candidate configuration object
 * @returns {{ valid: boolean, errors: string[] }} Validation result
 */
export function validateSprintConfig(config) {
  const errors = [];

  if (!config || typeof config !== 'object') {
    return { valid: false, errors: ['Configuration must be a valid object.'] };
  }

  // 1. Validate Sprint Name
  if (typeof config.sprintName !== 'string' || config.sprintName.trim().length === 0) {
    errors.push('Sprint name is required and cannot be empty.');
  }

  // 2. Validate Duration (in days)
  const duration = config.durationDays;
  if (
    typeof duration !== 'number' ||
    !Number.isFinite(duration) ||
    !Number.isInteger(duration) ||
    duration <= 0
  ) {
    errors.push('Sprint duration must be a positive integer greater than 0.');
  }

  // 3. Validate Start and End Dates
  if (config.startDate !== undefined || config.endDate !== undefined) {
    const start = new Date(config.startDate);
    const end = new Date(config.endDate);

    if (isNaN(start.getTime())) {
      errors.push('Sprint start date is invalid.');
    }
    if (isNaN(end.getTime())) {
      errors.push('Sprint end date is invalid.');
    }
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end < start) {
      errors.push('Sprint end date must follow or equal start date.');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates candidate Current Day value against the sprint duration.
 * Conforms to SRS BDC-F-003 and SAD Section 4.1.
 *
 * @param {unknown} day - Candidate day
 * @param {number} durationDays - Total sprint duration
 * @returns {{ valid: boolean, error: string | null }} Validation result
 */
export function validateCurrentDay(day, durationDays) {
  if (typeof day !== 'number' || !Number.isFinite(day)) {
    return { valid: false, error: 'Current Day must be a finite number.' };
  }
  if (!Number.isInteger(day)) {
    return { valid: false, error: 'Current Day must be an integer.' };
  }
  if (day < 0) {
    return { valid: false, error: 'Current Day cannot be negative (must be >= 0).' };
  }
  if (typeof durationDays === 'number' && Number.isFinite(durationDays) && day > durationDays) {
    return { valid: false, error: `Current Day (${day}) cannot exceed sprint duration (${durationDays}).` };
  }
  return { valid: true, error: null };
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
   * @param {object} [dataset] - Dataset to initialize with, defaults to DEFAULT_DATASET
   */
  init(dataset = null) {
    const source = dataset || getDefaultDataset();
    this._sprint = deepClone(source.sprint || DEFAULT_SPRINT);
    this._issues = deepClone(source.issues || DEFAULT_ISSUES);
    this._notify();
  }

  /**
   * Resets entire store to baseline default dataset per SRS BDC-F-009.
   */
  reset() {
    this.init(getDefaultDataset());
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

    this._issues.push(normalised);
    this._sprint.totalStoryPoints = calculateTotalPoints(this._issues);
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
