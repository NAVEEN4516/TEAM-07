import assert from 'node:assert/strict';
import { DataManager } from '../../src/js/data/dataManager.js';
import { buildChartConfig } from '../../src/js/ui/chartConfig.js';
import { renderKPICardsHTML } from '../../src/js/ui/kpiCards.js';
import { buildTableRows } from '../../src/js/ui/backlogTable.js';
import { renderCurrentDayControlHTML } from '../../src/js/ui/currentDayControl.js';
import { renderSprintBannerHTML } from '../../src/js/ui/sprintBanner.js';

/**
 * Shared helpers for the cross-layer integration tests (BDC-NF-005, TC-NF-05.2).
 * Not a test file: the name does not match the node:test discovery patterns.
 *
 * The helpers rebuild every view layer from a DataManager the same way the
 * dashboard does (dashboard.js refresh(), mountKPICards, mountCurrentDayControl),
 * but without a DOM, so the data flow
 * DataManager -> BurndownEngine -> chart / table / timeline / KPI cards
 * can be asserted end to end in a headless Node process.
 */

/** Text that must never appear in any rendered output (BDC-SR-004). */
const BROKEN_VALUE_PATTERN = /NaN|Infinity|undefined|null/;

/**
 * Reads one KPI card's displayed value from the rendered markup.
 *
 * @param {string} html - Output of renderKPICardsHTML
 * @param {string} id - Card id, e.g. 'total-scope'
 * @returns {string | null} Displayed text, or null when the card is missing
 */
function readCard(html, id) {
  const match = new RegExp(`data-testid="kpi-${id}"[\\s\\S]*?<span class="kpi-value">([^<]*)</span>`).exec(html);
  return match ? match[1] : null;
}

/**
 * Reads every value the KPI dashboard displays.
 *
 * @param {string} html - Output of renderKPICardsHTML
 * @returns {object} Displayed strings keyed by card
 */
export function readKpiCards(html) {
  return {
    totalScope: readCard(html, 'total-scope'),
    completed: readCard(html, 'completed-points'),
    remaining: readCard(html, 'remaining-points'),
    daysElapsed: readCard(html, 'days-elapsed'),
    daysLeft: readCard(html, 'days-left'),
    statusText: /<span class="status-text">([^<]*)<\/span>/.exec(html)?.[1] ?? null,
    statusClass: /status-badge (status--[a-z-]+)/.exec(html)?.[1] ?? null,
    variance: /data-testid="kpi-variance"[\s\S]*?<strong>([^<]*)<\/strong>/.exec(html)?.[1] ?? null
  };
}

/**
 * Reads what the Current Day control displays.
 *
 * @param {string} html - Output of renderCurrentDayControlHTML
 * @returns {{ day: string | null, duration: string | null, prevDisabled: boolean, nextDisabled: boolean }}
 */
export function readTimeline(html) {
  const badge = /Day <strong>(\d+)<\/strong> of (\d+)/.exec(html);
  return {
    day: badge ? badge[1] : null,
    duration: badge ? badge[2] : null,
    prevDisabled: /data-testid="btn-prev-day" disabled/.test(html),
    nextDisabled: /data-testid="btn-next-day" disabled/.test(html)
  };
}

/**
 * Captures every layer the user sees for the current DataManager state.
 * The result is plain JSON-compatible data, so two snapshots can be compared
 * with deepEqual to prove a state was restored exactly.
 *
 * @param {DataManager} dm - Data manager under test
 * @returns {object} Snapshot of the stored state and each view layer
 */
export function snapshot(dm) {
  const sprint = dm.getSprint();
  const issues = dm.getIssues();
  const kpis = dm.getKPIs();
  const chart = buildChartConfig(
    { ideal: kpis.ideal, actual: kpis.actual, durationDays: sprint.durationDays },
    sprint.currentDay,
    'light'
  );
  const kpiHtml = renderKPICardsHTML(kpis);
  const timelineHtml = renderCurrentDayControlHTML(sprint.currentDay, sprint.durationDays);
  const bannerHtml = renderSprintBannerHTML(sprint);

  return {
    stored: dm.serialize(),
    sprint,
    issues,
    kpis,
    rows: buildTableRows(issues),
    chart: {
      labels: chart.data.labels,
      ideal: chart.data.datasets[0].data,
      actual: chart.data.datasets[1].data
    },
    kpiCards: readKpiCards(kpiHtml),
    timeline: readTimeline(timelineHtml),
    bannerHtml,
    renderedText: [kpiHtml, timelineHtml, bannerHtml].join('\n')
  };
}

/**
 * Rounds away floating-point noise so decimal story points compare exactly.
 *
 * @param {number} value - Raw sum
 * @returns {number} Value rounded to 6 decimal places
 */
function round6(value) {
  return Math.round(value * 1e6) / 1e6;
}

/**
 * Asserts that all view layers agree with each other and with the stored state.
 * Run after every operation so a layer that drifts from the others fails the
 * test at the step that caused it.
 *
 * @param {object} snap - Snapshot from snapshot()
 * @param {string} [label] - Step description for failure messages
 */
export function assertLayersConsistent(snap, label = 'state') {
  const { sprint, issues, kpis, rows, chart, kpiCards, timeline } = snap;
  const duration = sprint.durationDays;
  const pointsInTable = round6(rows.reduce((sum, row) => sum + Number(row.storyPoints), 0));

  // Nothing rendered may contain a broken value (BDC-SR-004).
  assert.doesNotMatch(snap.renderedText, BROKEN_VALUE_PATTERN, `${label}: rendered output has a broken value`);
  for (const value of [...chart.ideal, ...chart.actual]) {
    assert.ok(value === null || Number.isFinite(value), `${label}: chart value must be finite or null, got ${value}`);
  }

  // Table <-> store <-> KPI scope (BDC-F-002).
  assert.equal(rows.length, issues.length, `${label}: table must show every issue`);
  assert.equal(kpiCards.totalScope, String(pointsInTable), `${label}: KPI scope must equal the table's points`);
  assert.equal(sprint.totalStoryPoints, pointsInTable, `${label}: stored total must equal the table's points`);
  rows.forEach((row, index) => {
    const doneWithDay = row.status === 'Done' && row.completedDay !== '--';
    const openWithoutDay = row.status !== 'Done' && row.completedDay === '--';
    assert.ok(doneWithDay || openWithoutDay, `${label}: ${row.issueKey} has status ${row.status} but completion day ${row.completedDay}`);
    assert.equal(row.issueKey, issues[index].issueKey, `${label}: table order must follow the store`);
  });

  // KPI arithmetic (SAD Section 4.1).
  assert.equal(
    Number(kpiCards.completed) + Number(kpiCards.remaining),
    pointsInTable,
    `${label}: completed + remaining must equal the scope`
  );
  assert.equal(kpiCards.daysElapsed, String(sprint.currentDay), `${label}: Days Elapsed must equal the Current Day`);
  assert.equal(Number(kpiCards.daysElapsed) + Number(kpiCards.daysLeft), duration, `${label}: elapsed + left must equal the duration`);

  // Status badge must follow the variance and the +/-1 tolerance (BDC-F-012).
  const variance = Number(kpiCards.variance);
  const expectedStatus = variance > 1 ? 'Ahead of Schedule' : variance < -1 ? 'Behind Schedule' : 'On Track';
  assert.equal(kpiCards.statusText, expectedStatus, `${label}: status badge must match variance ${kpiCards.variance}`);
  assert.equal(kpis.status, expectedStatus, `${label}: engine status must match variance`);

  // Chart <-> KPI <-> timeline (BDC-F-010, BDC-F-011, BDC-F-014).
  assert.deepEqual(chart.labels, Array.from({ length: duration + 1 }, (_, day) => day), `${label}: chart labels must run Day 0..duration`);
  assert.equal(chart.ideal[0], pointsInTable, `${label}: Ideal(0) must equal the scope`);
  assert.equal(chart.ideal[duration], 0, `${label}: Ideal(duration) must be 0`);
  for (let day = 1; day <= duration; day += 1) {
    assert.ok(chart.ideal[day] <= chart.ideal[day - 1], `${label}: the ideal line must never rise (Day ${day})`);
  }
  assert.equal(chart.actual[sprint.currentDay], Number(kpiCards.remaining), `${label}: the actual line must end at the KPI's remaining points`);
  assert.ok(
    chart.actual.slice(sprint.currentDay + 1).every(value => value === null),
    `${label}: no actual values may be plotted after the Current Day`
  );
  assert.ok(
    chart.actual.slice(0, sprint.currentDay + 1).every(value => Number.isFinite(value)),
    `${label}: every day up to the Current Day must be plotted`
  );
  assert.equal(timeline.day, String(sprint.currentDay), `${label}: timeline control must show the Current Day`);
  assert.equal(timeline.duration, String(duration), `${label}: timeline control must show the duration`);
  assert.equal(timeline.prevDisabled, sprint.currentDay === 0, `${label}: Prev Day is disabled only at Day 0`);
  assert.equal(timeline.nextDisabled, sprint.currentDay === duration, `${label}: Next Day is disabled only on the final day`);
}

/**
 * Builds a valid issue record using the SRS Appendix C schema.
 *
 * @param {string} issueKey - Unique key
 * @param {number} storyPoints - Story points
 * @param {string} [status='To Do'] - Workflow status
 * @param {number | null} [completedDay=null] - Completion day for Done issues
 * @returns {object} Issue record
 */
export function makeIssue(issueKey, storyPoints, status = 'To Do', completedDay = null) {
  return { issueKey, summary: `Integration issue ${issueKey}`, issueType: 'Task', storyPoints, status, completedDay };
}

/**
 * Records every notification a DataManager publishes.
 *
 * @param {DataManager} dm - Data manager to observe
 * @returns {{ count: () => number, states: () => string[] }} Notification recorder
 */
export function recordNotifications(dm) {
  const seen = [];
  dm.subscribe(manager => {
    seen.push(manager.serialize());
  });
  return { count: () => seen.length, states: () => seen };
}

/**
 * The 10 original sample issues from SRS Appendix A, hard-coded so the tests do
 * not depend on the dataset module they verify.
 * Columns: key, summary, type, story points, status, completed day.
 */
export const SRS_APPENDIX_A_ISSUES = Object.freeze([
  ['PROJ-101', 'User Authentication & Session Token Service', 'Story', 5, 'Done', 1],
  ['PROJ-102', 'Database Schema Migration for User Profiles', 'Task', 3, 'Done', 2],
  ['PROJ-103', 'REST API Endpoint for Sprint Backlog Query', 'Story', 8, 'Done', 3],
  ['PROJ-104', 'Implement JWT Refresh Token Expiry Logic', 'Task', 5, 'Done', 4],
  ['PROJ-105', 'Build Burndown Chart Rendering Canvas UI', 'Story', 8, 'Done', 4],
  ['PROJ-106', 'UI Form Validation for Task Addition', 'Bug', 3, 'In Progress', null],
  ['PROJ-107', 'Automated Unit Tests for Calculation Engine', 'Task', 5, 'In Progress', null],
  ['PROJ-108', 'CSV/JSON Data Export Module', 'Story', 5, 'To Do', null],
  ['PROJ-109', 'Error Boundary & Toast Notification Component', 'Task', 3, 'To Do', null],
  ['PROJ-110', 'Sprint Health Summary & KPI Calculation', 'Story', 5, 'To Do', null]
]);
