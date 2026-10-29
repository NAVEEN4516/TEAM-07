/**
 * @file validationManager.js
 * @description Pure validation logic for sprint configuration, backlog issues, the Current Day,
 * status updates and saved state (BDC-F-006, BDC-NF-003, BDC-SR-001, BDC-SR-002, BDC-SR-003).
 * Conforms to SRS Section 4.2, Section 5, Section 5.2 and SAD Section 4.3.
 * Pure functional validation with zero DOM dependencies.
 */

/**
 * Validates candidate issue fields for backlog insertion.
 * Enforces field presence, uniqueness, valid types/statuses, non-negative story points,
 * and valid completion day constraints when marked Done.
 *
 * @param {object} fields - Candidate issue fields
 * @param {string} [fields.issueKey] - Unique issue identifier
 * @param {string} [fields.summary] - Issue description
 * @param {string} [fields.issueType] - Issue type (Story | Task | Bug)
 * @param {number|string} [fields.storyPoints] - Estimated story points
 * @param {string} [fields.status] - Status (To Do | In Progress | Done)
 * @param {number|string|null} [fields.completedDay] - Day issue was completed (if Done)
 * @param {Array<string|object>} [existingKeys=[]] - List of existing keys or issue objects to check uniqueness against
 * @param {object} [context={}] - Sprint context
 * @param {number} [context.currentDay=0] - Current sprint day
 * @param {number} [context.durationDays=Infinity] - Total sprint duration in days
 * @returns {{ valid: boolean, errors: string[] }} Validation result with list of error messages
 */
export function validateIssue(fields, existingKeys = [], context = {}) {
  const errors = [];
  const f = (fields && typeof fields === 'object') ? fields : {};

  // 1. Issue Key validation
  const rawKey = f.issueKey;
  if (typeof rawKey !== 'string' || rawKey.trim().length === 0) {
    errors.push('Issue key is required.');
  } else {
    const trimmedKey = rawKey.trim();
    const lowerKey = trimmedKey.toLowerCase();
    const isDuplicate = Array.isArray(existingKeys) && existingKeys.some(k => {
      const kStr = typeof k === 'string' ? k : (k && typeof k.issueKey === 'string' ? k.issueKey : '');
      return kStr.trim().toLowerCase() === lowerKey;
    });
    if (isDuplicate) {
      errors.push('An issue with this key already exists.');
    }
  }

  // 2. Summary validation
  const rawSummary = f.summary;
  if (typeof rawSummary !== 'string' || rawSummary.trim().length === 0) {
    errors.push('Summary is required.');
  }

  // 3. Issue Type validation
  const allowedTypes = ['Story', 'Task', 'Bug'];
  if (!allowedTypes.includes(f.issueType)) {
    errors.push('Issue type must be Story, Task or Bug.');
  }

  // 4. Story Points validation
  const sp = f.storyPoints;
  let validPoints = false;
  if (typeof sp === 'string') {
    const trimmedSp = sp.trim();
    if (/^\d+(\.\d+)?$/.test(trimmedSp)) {
      const n = Number(trimmedSp);
      if (Number.isFinite(n) && n >= 0 && n <= Number.MAX_SAFE_INTEGER) {
        validPoints = true;
      }
    }
  } else if (typeof sp === 'number') {
    if (Number.isFinite(sp) && !isNaN(sp) && sp >= 0 && sp <= Number.MAX_SAFE_INTEGER) {
      validPoints = true;
    }
  }

  if (!validPoints) {
    errors.push('Story points must be a non-negative number.');
  }

  // 5. Status validation
  const allowedStatuses = ['To Do', 'In Progress', 'Done'];
  if (!allowedStatuses.includes(f.status)) {
    errors.push('Status must be To Do, In Progress or Done.');
  }

  // 6. Completion Day validation (only when Status is Done)
  if (f.status === 'Done') {
    const rawDay = f.completedDay;
    const isProvided = rawDay !== null && rawDay !== undefined && (typeof rawDay !== 'string' || rawDay.trim().length > 0);
    if (!isProvided) {
      errors.push('Completion day is required when status is Done.');
    } else {
      const currentDay = (context && typeof context.currentDay === 'number' && Number.isFinite(context.currentDay))
        ? context.currentDay
        : 0;
      const durationDays = (context && typeof context.durationDays === 'number' && Number.isFinite(context.durationDays))
        ? context.durationDays
        : Infinity;
      const N = Math.min(currentDay, durationDays);

      if (currentDay <= 0) {
        errors.push('No completion day is valid while Current Day is 0.');
      } else {
        let isWholeNumber = false;
        let dayNum = NaN;

        if (typeof rawDay === 'string') {
          const trimmed = rawDay.trim();
          if (/^\d+$/.test(trimmed)) {
            dayNum = parseInt(trimmed, 10);
            isWholeNumber = true;
          }
        } else if (typeof rawDay === 'number') {
          if (Number.isFinite(rawDay) && Number.isInteger(rawDay)) {
            dayNum = rawDay;
            isWholeNumber = true;
          }
        }

        if (!isWholeNumber || dayNum < 1 || dayNum > N) {
          errors.push(`Completion day must be a whole number between 1 and ${N}.`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Shortest permitted sprint, in working days (BDC-SR-002).
 * @type {number}
 */
export const MIN_SPRINT_DAYS = 1;

/**
 * Longest permitted sprint, in working days (BDC-SR-002).
 * Matches the 1 to 60 range the sprint configuration form advertises, so the data
 * layer enforces what the UI promises. Without a ceiling, an oversized duration
 * makes BurndownEngine build one chart point per day and stalls the page.
 * @type {number}
 */
export const MAX_SPRINT_DAYS = 60;

/** Workflow states per SRS Appendix C. */
const ISSUE_STATUSES = ['To Do', 'In Progress', 'Done'];

/** Strict calendar-date format produced by date inputs and the default dataset. */
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Reports whether a value is a plain, non-array object.
 *
 * @param {unknown} value - Candidate value
 * @returns {boolean} True for plain objects
 */
function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Reports whether a value is a finite integer number (never a numeric string).
 *
 * @param {unknown} value - Candidate value
 * @returns {boolean} True for whole numbers
 */
function isWholeNumber(value) {
  return typeof value === 'number' && Number.isInteger(value);
}

/**
 * Parses a strict YYYY-MM-DD calendar date.
 * Rejects impossible dates such as 2026-02-30, which the Date constructor would
 * otherwise roll forward silently to 2 March.
 *
 * @param {unknown} value - Candidate date string
 * @returns {number | null} UTC timestamp, or null when the date is invalid
 */
function parseIsoDate(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const match = ISO_DATE_PATTERN.exec(value.trim());
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  const roundTrips = date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
  return roundTrips ? date.getTime() : null;
}

/**
 * Validates a sprint configuration (BDC-F-001, BDC-NF-003, BDC-SR-002).
 * Requires a non-empty name and a whole-number duration from MIN_SPRINT_DAYS to
 * MAX_SPRINT_DAYS. Dates are optional, but when either is supplied both must be
 * real calendar dates in YYYY-MM-DD form and the end must not precede the start.
 *
 * @param {object} config - Candidate sprint configuration
 * @param {string} [config.sprintName] - Human-readable sprint name
 * @param {number} [config.durationDays] - Sprint length in working days
 * @param {string} [config.startDate] - Start date (YYYY-MM-DD)
 * @param {string} [config.endDate] - End date (YYYY-MM-DD)
 * @returns {{ valid: boolean, errors: string[] }} Validation result
 */
export function validateSprint(config) {
  if (!isPlainObject(config)) {
    return { valid: false, errors: ['Configuration must be a valid object.'] };
  }
  const errors = [];

  if (typeof config.sprintName !== 'string' || config.sprintName.trim().length === 0) {
    errors.push('Sprint name is required and cannot be empty.');
  }

  const duration = config.durationDays;
  if (!isWholeNumber(duration) || duration < MIN_SPRINT_DAYS) {
    errors.push('Sprint duration must be a positive integer greater than 0.');
  } else if (duration > MAX_SPRINT_DAYS) {
    errors.push(`Sprint duration cannot exceed ${MAX_SPRINT_DAYS} working days.`);
  }

  if (config.startDate !== undefined || config.endDate !== undefined) {
    const start = parseIsoDate(config.startDate);
    const end = parseIsoDate(config.endDate);
    if (start === null) {
      errors.push('Sprint start date is invalid.');
    }
    if (end === null) {
      errors.push('Sprint end date is invalid.');
    }
    if (start !== null && end !== null && end < start) {
      errors.push('Sprint end date must follow or equal start date.');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a Current Day value against the sprint duration (BDC-F-003, BDC-SR-002).
 * Day 0 is valid: SRS Appendix C and SAD Section 4.1 define the range as
 * 0 to durationDays, with day 0 representing the start of the sprint.
 *
 * @param {unknown} day - Candidate Current Day
 * @param {unknown} durationDays - Sprint length in working days
 * @returns {{ valid: boolean, errors: string[] }} Validation result
 */
export function validateCurrentDay(day, durationDays) {
  if (typeof day !== 'number' || !Number.isFinite(day)) {
    return { valid: false, errors: ['Current Day must be a finite number.'] };
  }
  if (!Number.isInteger(day)) {
    return { valid: false, errors: ['Current Day must be an integer.'] };
  }
  if (day < 0) {
    return { valid: false, errors: ['Current Day cannot be negative (must be >= 0).'] };
  }
  if (typeof durationDays === 'number' && Number.isFinite(durationDays) && day > durationDays) {
    return { valid: false, errors: [`Current Day (${day}) cannot exceed sprint duration (${durationDays}).`] };
  }
  return { valid: true, errors: [] };
}

/**
 * Validates a workflow status change (BDC-F-007, BDC-NF-003, BDC-SR-002).
 * Per SRS Section 5.2 a completion day greater than the Current Day or the sprint
 * duration is rejected, so a Done issue needs a whole-number day from 1 to
 * min(currentDay, durationDays). Moving to any other status needs no day; the
 * caller clears the stored completion day (SAD Section 4.1).
 *
 * The completion day must already be a number. Callers convert form input first,
 * so a numeric string is never stored and later skipped by the calculations.
 *
 * @param {unknown} status - Target status
 * @param {unknown} completedDay - Completion day for a Done issue
 * @param {unknown} currentDay - Current Day of the sprint
 * @param {unknown} durationDays - Sprint length in working days
 * @returns {{ valid: boolean, errors: string[] }} Validation result
 */
export function validateStatusUpdate(status, completedDay, currentDay, durationDays) {
  if (!ISSUE_STATUSES.includes(status)) {
    return { valid: false, errors: ['Status must be To Do, In Progress or Done.'] };
  }
  if (status !== 'Done') {
    return { valid: true, errors: [] };
  }

  const today = isWholeNumber(currentDay) ? currentDay : 0;
  const duration = isWholeNumber(durationDays) && durationDays >= MIN_SPRINT_DAYS ? durationDays : Infinity;
  const lastValidDay = Math.min(today, duration);

  if (lastValidDay < 1) {
    return { valid: false, errors: ['No completion day is valid while Current Day is 0.'] };
  }
  if (!isWholeNumber(completedDay) || completedDay < 1 || completedDay > lastValidDay) {
    return { valid: false, errors: [`Completion day must be a whole number between 1 and ${lastValidDay}.`] };
  }
  return { valid: true, errors: [] };
}

/**
 * Validates a saved sprint state and builds a clean copy of it (BDC-SR-003).
 *
 * Saved records must use exact JSON types: story points and completion days are
 * numbers, never strings. Completion days are checked against MAX_SPRINT_DAYS
 * rather than the saved Current Day, because two normal actions legitimately leave
 * a completion day beyond today: moving the Current Day back, and shortening a
 * sprint (which keeps prior completion history). Rejecting those states would
 * discard a user's real data on reload.
 *
 * The clean copy holds only the SRS Appendix C fields and recomputes
 * totalStoryPoints, so unknown or stale fields never reach the store.
 *
 * @param {unknown} candidate - Parsed saved state
 * @returns {{ valid: boolean, errors: string[], state: {sprint: object, issues: object[]} | null }}
 *   Validation result with the clean state, or null when invalid
 */
export function sanitizeStoredState(candidate) {
  if (!isPlainObject(candidate)) {
    return { valid: false, errors: ['Saved data must be an object with a sprint and an issue list.'], state: null };
  }

  const { sprint, issues } = candidate;
  const errors = [];
  if (!isPlainObject(sprint)) {
    errors.push('Saved sprint configuration is missing or malformed.');
  }
  if (!Array.isArray(issues)) {
    errors.push('Saved issue list is missing or malformed.');
  }
  if (errors.length > 0) {
    return { valid: false, errors, state: null };
  }

  for (const message of validateSprint(sprint).errors) {
    errors.push(`Saved sprint: ${message}`);
  }
  for (const message of validateCurrentDay(sprint.currentDay, sprint.durationDays).errors) {
    errors.push(`Saved sprint: ${message}`);
  }

  const seenKeys = [];
  const historyContext = { currentDay: MAX_SPRINT_DAYS, durationDays: MAX_SPRINT_DAYS };
  issues.forEach((issue, index) => {
    const label = `Saved issue ${index + 1}`;
    if (!isPlainObject(issue)) {
      errors.push(`${label} is malformed.`);
      return;
    }
    if (typeof issue.storyPoints !== 'number') {
      errors.push(`${label}: story points must be saved as a number.`);
    }
    if (issue.completedDay !== null && typeof issue.completedDay !== 'number') {
      errors.push(`${label}: completion day must be saved as a number or null.`);
    }
    if (issue.status !== 'Done' && issue.completedDay !== null) {
      errors.push(`${label}: only Done issues may record a completion day.`);
    }
    for (const message of validateIssue(issue, seenKeys, historyContext).errors) {
      errors.push(`${label}: ${message}`);
    }
    if (typeof issue.issueKey === 'string') {
      seenKeys.push(issue.issueKey);
    }
  });

  if (errors.length > 0) {
    return { valid: false, errors, state: null };
  }

  const cleanIssues = issues.map(issue => ({
    issueKey: issue.issueKey,
    summary: issue.summary,
    issueType: issue.issueType,
    storyPoints: issue.storyPoints,
    status: issue.status,
    completedDay: issue.completedDay
  }));
  const cleanSprint = {
    sprintName: sprint.sprintName,
    durationDays: sprint.durationDays,
    currentDay: sprint.currentDay,
    totalStoryPoints: cleanIssues.reduce((sum, issue) => sum + issue.storyPoints, 0)
  };
  if (sprint.startDate !== undefined) {
    cleanSprint.startDate = sprint.startDate;
  }
  if (sprint.endDate !== undefined) {
    cleanSprint.endDate = sprint.endDate;
  }

  return { valid: true, errors: [], state: { sprint: cleanSprint, issues: cleanIssues } };
}

/**
 * Validates a saved sprint state (SAD Section 4.3, BDC-SR-003).
 * See sanitizeStoredState for the rules; this returns only the verdict.
 *
 * @param {unknown} candidate - Parsed saved state
 * @returns {{ valid: boolean, errors: string[] }} Validation result
 */
export function validateStoredState(candidate) {
  const { valid, errors } = sanitizeStoredState(candidate);
  return { valid, errors };
}

/**
 * Parses and validates a serialized sprint state, such as a localStorage payload
 * (BDC-SR-003). Never throws: empty input, malformed JSON and schema violations
 * all return a failed result the caller can answer by restoring defaults.
 *
 * @param {unknown} raw - Serialized state
 * @returns {{ valid: boolean, errors: string[], state: {sprint: object, issues: object[]} | null }}
 *   Validation result with the clean state, or null when invalid
 */
export function parseStoredState(raw) {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return { valid: false, errors: ['No saved data was found.'], state: null };
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { valid: false, errors: ['Saved data is not valid JSON.'], state: null };
  }
  return sanitizeStoredState(parsed);
}

export default validateIssue;
