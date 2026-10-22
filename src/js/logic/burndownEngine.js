/**
 * @file burndownEngine.js
 * @description Pure burndown calculation functions for the Agile Burndown Chart Generator.
 * Implements BDC-F-002 (total committed points), BDC-F-010 (ideal burndown),
 * BDC-F-011 (actual burndown) and BDC-F-012 (schedule variance and status),
 * per SRS Section 4.3 and SAD Section 4.1 / 4.3 (Interface 1: BurndownEngine).
 *
 * Architectural contract (BDC-NF-005): this module is pure and self-contained.
 * It imports nothing, touches no DOM and holds no state, so every function is
 * independently testable in a headless environment. Callers own all data.
 *
 * Safety contract (BDC-SR-002, BDC-SR-004): no input produces NaN, Infinity or a
 * thrown error. ValidationManager remains the primary input gate; the guards here
 * are a second line of defence so the chart can never render a broken value.
 */

/** Issue status that marks work as finished, per SRS Appendix C. */
const STATUS_DONE = 'Done';

/**
 * Schedule classifications per SRS BDC-F-012 and SAD Section 4.1.
 * @type {Readonly<{AHEAD: string, ON_TRACK: string, BEHIND: string}>}
 */
export const SCHEDULE_STATUS = Object.freeze({
  AHEAD: 'Ahead of Schedule',
  ON_TRACK: 'On Track',
  BEHIND: 'Behind Schedule'
});

/** Story-point tolerance band for the "On Track" classification (BDC-F-012). */
export const VARIANCE_TOLERANCE = 1;

/** Scaling factor used when clearing IEEE-754 representation noise. */
const PRECISION = 1e6;

/**
 * Removes floating-point representation noise and normalises negative zero.
 * Keeps values chart-safe without distorting their meaning.
 *
 * @param {number} value - Raw computed value
 * @returns {number} Normalised finite number (0 when not finite)
 */
function normalize(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const rounded = Math.round(value * PRECISION) / PRECISION;
  return Object.is(rounded, -0) ? 0 : rounded;
}

/**
 * Coerces a story-point value to a safe, countable number.
 * Non-numeric, negative, NaN and Infinity values contribute zero rather than
 * poisoning the totals (BDC-SR-002, BDC-SR-004).
 *
 * @param {unknown} value - Candidate story-point value
 * @returns {number} Finite, non-negative story points
 */
function sanitizePoints(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return 0;
  }
  return value;
}

/**
 * Returns the backlog as a safe array, tolerating null, undefined and non-array input.
 *
 * @param {unknown} issues - Candidate issue collection
 * @returns {Array<object>} Array of issue-like objects (possibly empty)
 */
function safeIssues(issues) {
  if (!Array.isArray(issues)) {
    return [];
  }
  return issues.filter(issue => issue !== null && typeof issue === 'object');
}

/**
 * Determines whether an issue counts as completed on or before the given day.
 * An issue without a valid completedDay never counts, which is the documented
 * behaviour for In Progress and To Do work (SAD Section 4.1).
 *
 * @param {object} issue - Issue record using the SRS Appendix C schema
 * @param {number} day - Inclusive day threshold
 * @returns {boolean} True when the issue burned down on or before day
 */
function isCompletedBy(issue, day) {
  if (typeof issue.status !== 'string' || issue.status.trim() !== STATUS_DONE) {
    return false;
  }
  const completedDay = issue.completedDay;
  if (typeof completedDay !== 'number' || !Number.isFinite(completedDay)) {
    return false;
  }
  return completedDay <= day;
}

/**
 * Reports whether a sprint duration is usable for timeline calculations.
 * Zero, negative, non-numeric and non-finite durations are rejected so the
 * ideal-burndown division can never produce NaN or Infinity (BDC-SR-004).
 *
 * @param {unknown} durationDays - Candidate sprint length
 * @returns {boolean} True when a burndown timeline can be built
 */
export function isValidDuration(durationDays) {
  return typeof durationDays === 'number' && Number.isFinite(durationDays) && durationDays > 0;
}

/**
 * Clamps the Current Day into the valid range 0..durationDays (SRS Appendix C).
 *
 * @param {unknown} currentDay - Candidate current day
 * @param {unknown} durationDays - Sprint length in working days
 * @returns {number} Current day within range, or 0 when unusable
 */
export function sanitizeCurrentDay(currentDay, durationDays) {
  if (typeof currentDay !== 'number' || !Number.isFinite(currentDay) || currentDay < 0) {
    return 0;
  }
  if (!isValidDuration(durationDays)) {
    return currentDay;
  }
  return Math.min(currentDay, durationDays);
}

/**
 * BDC-F-002 - Total Committed Story Points.
 * Sums the story points of every issue currently in the sprint backlog,
 * regardless of status. An empty backlog totals 0 (BDC-SR-004).
 *
 * @param {Array<object>} issues - Sprint backlog
 * @returns {number} Total committed story points
 */
export function calculateTotalPoints(issues) {
  const total = safeIssues(issues).reduce(
    (sum, issue) => sum + sanitizePoints(issue.storyPoints),
    0
  );
  return normalize(total);
}

/**
 * Completed Story Points: points of issues marked Done on or before the given day.
 *
 * @param {Array<object>} issues - Sprint backlog
 * @param {number} day - Inclusive day threshold
 * @returns {number} Completed story points
 */
export function calculateCompletedPoints(issues, day) {
  const threshold = typeof day === 'number' && Number.isFinite(day) ? day : 0;
  const completed = safeIssues(issues).reduce((sum, issue) => {
    return isCompletedBy(issue, threshold) ? sum + sanitizePoints(issue.storyPoints) : sum;
  }, 0);
  return normalize(completed);
}

/**
 * Remaining Story Points: Total minus Completed on the given day.
 *
 * @param {Array<object>} issues - Sprint backlog
 * @param {number} day - Inclusive day threshold
 * @returns {number} Remaining story points
 */
export function calculateRemainingPoints(issues, day) {
  return normalize(calculateTotalPoints(issues) - calculateCompletedPoints(issues, day));
}

/**
 * BDC-F-010 - Ideal remaining points on a single day.
 * Ideal(d) = TotalPoints x (1 - d / TotalDays), with d clamped to 0..TotalDays so
 * the trajectory never reports negative remaining work.
 *
 * @param {number} totalPoints - Total committed story points
 * @param {number} day - Day index
 * @param {number} durationDays - Sprint length in working days
 * @returns {number} Ideal remaining points, or 0 for an invalid duration
 */
export function idealAt(totalPoints, day, durationDays) {
  if (!isValidDuration(durationDays)) {
    return 0;
  }
  const total = sanitizePoints(totalPoints);
  const safeDay = typeof day === 'number' && Number.isFinite(day)
    ? Math.min(Math.max(day, 0), durationDays)
    : 0;
  return normalize(total * (1 - safeDay / durationDays));
}

/**
 * BDC-F-010 - Ideal burndown trajectory across the whole sprint.
 * Produces durationDays + 1 points covering day 0 through day durationDays,
 * where Ideal(0) = TotalPoints and Ideal(durationDays) = 0.
 *
 * @param {number} totalPoints - Total committed story points
 * @param {number} durationDays - Sprint length in working days
 * @returns {Array<{day: number, value: number}>} Ideal series, empty for an invalid duration
 */
export function calculateIdealSeries(totalPoints, durationDays) {
  if (!isValidDuration(durationDays)) {
    return [];
  }
  const lastDay = Math.floor(durationDays);
  const series = [];
  for (let day = 0; day <= lastDay; day += 1) {
    series.push({ day, value: idealAt(totalPoints, day, durationDays) });
  }
  return series;
}

/**
 * BDC-F-011 - Actual remaining points on a single day.
 * Actual(d) = TotalPoints - sum(points of issues completed on or before d).
 *
 * @param {Array<object>} issues - Sprint backlog
 * @param {number} day - Day index
 * @returns {number} Actual remaining points
 */
export function actualAt(issues, day) {
  return calculateRemainingPoints(issues, day);
}

/**
 * BDC-F-011 - Actual burndown trajectory, truncated at the Current Day.
 * Days after the Current Day carry a null value so the chart leaves them
 * unplotted rather than implying progress that has not happened yet.
 *
 * @param {Array<object>} issues - Sprint backlog
 * @param {number} durationDays - Sprint length in working days
 * @param {number} currentDay - Current Day control value
 * @returns {Array<{day: number, value: number | null}>} Actual series, empty for an invalid duration
 */
export function calculateActualSeries(issues, durationDays, currentDay) {
  if (!isValidDuration(durationDays)) {
    return [];
  }
  const lastDay = Math.floor(durationDays);
  const today = sanitizeCurrentDay(currentDay, durationDays);
  const series = [];
  for (let day = 0; day <= lastDay; day += 1) {
    series.push({ day, value: day <= today ? actualAt(issues, day) : null });
  }
  return series;
}

/**
 * BDC-F-012 - Schedule variance on the Current Day.
 * Variance = IdealRemaining - ActualRemaining. A positive variance means less
 * work remains than planned, so the team is ahead.
 *
 * @param {number} idealRemaining - Ideal remaining points on the Current Day
 * @param {number} actualRemaining - Actual remaining points on the Current Day
 * @returns {number} Schedule variance in story points
 */
export function calculateVariance(idealRemaining, actualRemaining) {
  const ideal = typeof idealRemaining === 'number' && Number.isFinite(idealRemaining) ? idealRemaining : 0;
  const actual = typeof actualRemaining === 'number' && Number.isFinite(actualRemaining) ? actualRemaining : 0;
  return normalize(ideal - actual);
}

/**
 * BDC-F-012 - Classifies sprint health from the schedule variance, using the
 * plus/minus 1 story-point tolerance band defined in the SRS.
 *
 * @param {number} variance - Schedule variance in story points
 * @returns {string} One of SCHEDULE_STATUS
 */
export function classifyStatus(variance) {
  if (typeof variance !== 'number' || !Number.isFinite(variance)) {
    return SCHEDULE_STATUS.ON_TRACK;
  }
  if (variance > VARIANCE_TOLERANCE) {
    return SCHEDULE_STATUS.AHEAD;
  }
  if (variance < -VARIANCE_TOLERANCE) {
    return SCHEDULE_STATUS.BEHIND;
  }
  return SCHEDULE_STATUS.ON_TRACK;
}

/**
 * SAD Interface 1 - BurndownEngine.computeAll(sprint, issues).
 * Single entry point returning every quantity the chart and KPI dashboard need.
 *
 * An invalid sprint duration yields empty ideal and actual series, zero variance
 * and an "On Track" classification: with no usable timeline the engine reports a
 * neutral result rather than implying the sprint is ahead or behind (BDC-SR-004).
 * Point totals do not depend on duration and stay accurate in that case.
 *
 * @param {{durationDays?: number, currentDay?: number}} sprint - Sprint configuration
 * @param {Array<object>} issues - Sprint backlog using the SRS Appendix C schema
 * @returns {{
 *   totalPoints: number,
 *   completedPoints: number,
 *   remainingPoints: number,
 *   daysElapsed: number,
 *   daysLeft: number,
 *   ideal: Array<{day: number, value: number}>,
 *   actual: Array<{day: number, value: number | null}>,
 *   variance: number,
 *   status: string
 * }} Complete burndown result, free of NaN and Infinity
 */
export function computeAll(sprint, issues) {
  const config = sprint !== null && typeof sprint === 'object' ? sprint : {};
  const durationDays = config.durationDays;
  const validDuration = isValidDuration(durationDays);
  const currentDay = sanitizeCurrentDay(config.currentDay, durationDays);

  const totalPoints = calculateTotalPoints(issues);
  const completedPoints = calculateCompletedPoints(issues, currentDay);
  const remainingPoints = normalize(totalPoints - completedPoints);

  const ideal = calculateIdealSeries(totalPoints, durationDays);
  const actual = calculateActualSeries(issues, durationDays, currentDay);

  const variance = validDuration
    ? calculateVariance(idealAt(totalPoints, currentDay, durationDays), remainingPoints)
    : 0;

  return {
    totalPoints,
    completedPoints,
    remainingPoints,
    daysElapsed: validDuration ? currentDay : 0,
    daysLeft: validDuration ? normalize(Math.floor(durationDays) - currentDay) : 0,
    ideal,
    actual,
    variance,
    status: classifyStatus(variance)
  };
}

export default computeAll;
