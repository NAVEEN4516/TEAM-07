/**
 * @file defaultDataset.js
 * @description Default simulated Jira dataset for Agile Burndown Chart Generator.
 * Conforms to SRS Appendix A and System Architecture Document (SAD) specifications.
 * Provides immutable baseline sprint configuration and 10 default issues.
 */

/**
 * Deep clones an object, array, or primitive value with complete reference isolation.
 * Uses native structuredClone when possible, and provides a resilient recursive fallback
 * for functions, methods, Symbols, Dates, RegExps, and non-serializable objects.
 * Ensures returned datasets are completely isolated from external mutations.
 *
 * @template T
 * @param {T} data - Object, array, primitive, or function to clone
 * @returns {T} Clean deep clone
 */
export function deepClone(data) {
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(data);
    } catch {
      // Fallback for data structures structuredClone cannot serialize (e.g., functions, methods, symbols)
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
 * Default Sprint configuration per SRS Appendix A.
 * Includes both standardized and aliased property keys for compatibility across modules.
 */
export const DEFAULT_SPRINT = deepFreeze({
  name: 'Sprint 1 - Core Features',
  sprintName: 'Sprint 1 - Core Features',
  duration: 10,
  durationDays: 10,
  currentDay: 4,
  totalCommittedPoints: 50,
  totalStoryPoints: 50,
  startDate: '2026-10-05',
  endDate: '2026-10-16'
});

/**
 * Exactly 10 simulated Jira issues per SRS Appendix A (PROJ-101 to PROJ-110).
 * Total Story Points: 50.
 * Completed by Day 4: 29 points (PROJ-101 to PROJ-105).
 * Remaining on Day 4: 21 points.
 */
export const DEFAULT_ISSUES = deepFreeze([
  {
    key: 'PROJ-101',
    issueKey: 'PROJ-101',
    summary: 'User Authentication & Session Token Service',
    issueType: 'Story',
    type: 'Story',
    storyPoints: 5,
    status: 'Done',
    completionDay: 1,
    completedDay: 1
  },
  {
    key: 'PROJ-102',
    issueKey: 'PROJ-102',
    summary: 'Database Schema Migration for User Profiles',
    issueType: 'Task',
    type: 'Task',
    storyPoints: 3,
    status: 'Done',
    completionDay: 2,
    completedDay: 2
  },
  {
    key: 'PROJ-103',
    issueKey: 'PROJ-103',
    summary: 'REST API Endpoint for Sprint Backlog Query',
    issueType: 'Story',
    type: 'Story',
    storyPoints: 8,
    status: 'Done',
    completionDay: 3,
    completedDay: 3
  },
  {
    key: 'PROJ-104',
    issueKey: 'PROJ-104',
    summary: 'Implement JWT Refresh Token Expiry Logic',
    issueType: 'Task',
    type: 'Task',
    storyPoints: 5,
    status: 'Done',
    completionDay: 4,
    completedDay: 4
  },
  {
    key: 'PROJ-105',
    issueKey: 'PROJ-105',
    summary: 'Build Burndown Chart Rendering Canvas UI',
    issueType: 'Story',
    type: 'Story',
    storyPoints: 8,
    status: 'Done',
    completionDay: 4,
    completedDay: 4
  },
  {
    key: 'PROJ-106',
    issueKey: 'PROJ-106',
    summary: 'UI Form Validation for Task Addition',
    issueType: 'Bug',
    type: 'Bug',
    storyPoints: 3,
    status: 'In Progress',
    completionDay: null,
    completedDay: null
  },
  {
    key: 'PROJ-107',
    issueKey: 'PROJ-107',
    summary: 'Automated Unit Tests for Calculation Engine',
    issueType: 'Task',
    type: 'Task',
    storyPoints: 5,
    status: 'In Progress',
    completionDay: null,
    completedDay: null
  },
  {
    key: 'PROJ-108',
    issueKey: 'PROJ-108',
    summary: 'CSV/JSON Data Export Module',
    issueType: 'Story',
    type: 'Story',
    storyPoints: 5,
    status: 'To Do',
    completionDay: null,
    completedDay: null
  },
  {
    key: 'PROJ-109',
    issueKey: 'PROJ-109',
    summary: 'Error Boundary & Toast Notification Component',
    issueType: 'Task',
    type: 'Task',
    storyPoints: 3,
    status: 'To Do',
    completionDay: null,
    completedDay: null
  },
  {
    key: 'PROJ-110',
    issueKey: 'PROJ-110',
    summary: 'Sprint Health Summary & KPI Calculation',
    issueType: 'Story',
    type: 'Story',
    storyPoints: 5,
    status: 'To Do',
    completionDay: null,
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
 *     name: string,
 *     sprintName: string,
 *     duration: number,
 *     durationDays: number,
 *     currentDay: number,
 *     totalCommittedPoints: number,
 *     totalStoryPoints: number,
 *     startDate?: string,
 *     endDate?: string
 *   },
 *   issues: Array<{
 *     key: string,
 *     issueKey: string,
 *     summary: string,
 *     issueType: string,
 *     storyPoints: number,
 *     status: string,
 *     completionDay: number | null,
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
