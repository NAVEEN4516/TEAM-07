/**
 * @file defaultDataset.js
 * @description Default simulated Jira dataset for Agile Burndown Chart Generator.
 * Conforms to SRS Appendix A, Appendix C (Data Model), and System Architecture Document (SAD) specifications.
 * Provides immutable baseline sprint configuration and 10 default issues with canonical schema attributes.
 */

/**
 * Deep clones an object, array, or primitive value with reference isolation.
 * Uses native structuredClone when possible, with recursive fallback for Dates, RegExps,
 * arrays, and plain objects.
 *
 * Note: Functions, methods, and symbols pass through by reference (not deeply copied).
 *
 * @template T
 * @param {T} data - Object, array, primitive, or function (functions pass through by reference)
 * @returns {T} Isolated deep clone
 */
export function deepClone(data) {
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(data);
    } catch {
      // Fallback for non-cloneable objects
    }
  }
  if (data instanceof Date) {
    return new Date(data.getTime());
  }
  if (data instanceof RegExp) {
    return new RegExp(data.source, data.flags);
  }
  if (Array.isArray(data)) {
    return data.map(item => deepClone(item));
  }
  const copy = {};
  for (const key of Reflect.ownKeys(data)) {
    copy[key] = deepClone(data[key]);
  }
  return copy;
}

/**
 * Recursively freezes an object, array, or function and all nested properties to guarantee immutability.
 * Protects complex objects and arrays against nested member mutation, including Symbol-keyed properties,
 * while safely ignoring ArrayBuffer views and freezing accessor functions without invoking throwing getters.
 *
 * @template T
 * @param {T} obj - Object, array, or function to deep freeze
 * @returns {T} Deeply frozen object
 */
export function deepFreeze(obj) {
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return obj;
  }
  // TypedArray and ArrayBuffer views cannot be frozen in JavaScript
  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView(obj)) {
    return obj;
  }
  Object.freeze(obj);
  for (const key of Reflect.ownKeys(obj)) {
    let desc;
    try {
      desc = Object.getOwnPropertyDescriptor(obj, key);
    } catch {
      continue;
    }
    if (!desc) continue;

    // Freeze accessor functions safely without invoking getters that could have side-effects or throw
    if (desc.get && typeof desc.get === 'function' && !Object.isFrozen(desc.get)) {
      deepFreeze(desc.get);
    }
    if (desc.set && typeof desc.set === 'function' && !Object.isFrozen(desc.set)) {
      deepFreeze(desc.set);
    }

    // Freeze property values for data descriptors
    if ('value' in desc) {
      const val = desc.value;
      if (val !== null && (typeof val === 'object' || typeof val === 'function') && !Object.isFrozen(val)) {
        deepFreeze(val);
      }
    }
  }
  return obj;
}

/**
 * Default Sprint configuration conforming strictly to SRS Appendix C and SAD §3.1.
 *
 * Note on Schedule & Calendar Span:
 * - durationDays (10) represents 10 active working days spanning Monday 2026-10-05
 *   to Friday 2026-10-16 (excluding the intervening 2-day weekend).
 * - Timeline metrics (currentDay, completedDay) are working-day indices (1 to 10).
 * - Total committed scope is 50 story points.
 */
export const DEFAULT_SPRINT = deepFreeze({
  sprintName: 'Sprint 1 - Core Features',
  durationDays: 10,
  currentDay: 4,
  totalStoryPoints: 50,
  startDate: '2026-10-05',
  endDate: '2026-10-16'
});

/**
 * Exactly 10 simulated Jira issues per SRS Appendix A and Appendix C (PROJ-101 to PROJ-110).
 * Canonical schema: issueKey, summary, issueType, storyPoints, status, completedDay.
 * Total Story Points: 50.
 * Completed by Day 4: 29 points (PROJ-101 to PROJ-105).
 * Remaining on Day 4: 21 points.
 */
export const DEFAULT_ISSUES = deepFreeze([
  {
    issueKey: 'PROJ-101',
    summary: 'User Authentication & Session Token Service',
    issueType: 'Story',
    storyPoints: 5,
    status: 'Done',
    completedDay: 1
  },
  {
    issueKey: 'PROJ-102',
    summary: 'Database Schema Migration for User Profiles',
    issueType: 'Task',
    storyPoints: 3,
    status: 'Done',
    completedDay: 2
  },
  {
    issueKey: 'PROJ-103',
    summary: 'REST API Endpoint for Sprint Backlog Query',
    issueType: 'Story',
    storyPoints: 8,
    status: 'Done',
    completedDay: 3
  },
  {
    issueKey: 'PROJ-104',
    summary: 'Implement JWT Refresh Token Expiry Logic',
    issueType: 'Task',
    storyPoints: 5,
    status: 'Done',
    completedDay: 4
  },
  {
    issueKey: 'PROJ-105',
    summary: 'Build Burndown Chart Rendering Canvas UI',
    issueType: 'Story',
    storyPoints: 8,
    status: 'Done',
    completedDay: 4
  },
  {
    issueKey: 'PROJ-106',
    summary: 'UI Form Validation for Task Addition',
    issueType: 'Bug',
    storyPoints: 3,
    status: 'In Progress',
    completedDay: null
  },
  {
    issueKey: 'PROJ-107',
    summary: 'Automated Unit Tests for Calculation Engine',
    issueType: 'Task',
    storyPoints: 5,
    status: 'In Progress',
    completedDay: null
  },
  {
    issueKey: 'PROJ-108',
    summary: 'CSV/JSON Data Export Module',
    issueType: 'Story',
    storyPoints: 5,
    status: 'To Do',
    completedDay: null
  },
  {
    issueKey: 'PROJ-109',
    summary: 'Error Boundary & Toast Notification Component',
    issueType: 'Task',
    storyPoints: 3,
    status: 'To Do',
    completedDay: null
  },
  {
    issueKey: 'PROJ-110',
    summary: 'Sprint Health Summary & KPI Calculation',
    issueType: 'Story',
    storyPoints: 5,
    status: 'To Do',
    completedDay: null
  }
]);

/**
 * Complete default sprint dataset structure.
 */
export const DEFAULT_DATASET = deepFreeze({
  sprint: DEFAULT_SPRINT,
  issues: DEFAULT_ISSUES
});

/**
 * Returns a clean, deeply cloned copy of the default simulated Jira dataset.
 * Mutating the returned object has zero effect on subsequent calls or internal defaults.
 *
 * @returns {{
 *   sprint: {
 *     sprintName: string,
 *     durationDays: number,
 *     currentDay: number,
 *     totalStoryPoints: number,
 *     startDate?: string,
 *     endDate?: string
 *   },
 *   issues: Array<{
 *     issueKey: string,
 *     summary: string,
 *     issueType: string,
 *     storyPoints: number,
 *     status: string,
 *     completedDay: number | null
 *   }>
 * }} Deeply cloned dataset
 */
export function getDefaultDataset() {
  return deepClone(DEFAULT_DATASET);
}

/**
 * Returns a clean, deeply cloned copy of the default sprint configuration.
 *
 * @returns {typeof DEFAULT_SPRINT}
 */
export function getDefaultSprint() {
  return deepClone(DEFAULT_SPRINT);
}

/**
 * Returns a clean, deeply cloned copy of the default issue list.
 *
 * @returns {typeof DEFAULT_ISSUES}
 */
export function getDefaultIssues() {
  return deepClone(DEFAULT_ISSUES);
}

export default getDefaultDataset;
