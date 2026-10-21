import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getDefaultDataset } from '../../src/js/data/defaultDataset.js';
import computeAllDefault, {
  SCHEDULE_STATUS,
  VARIANCE_TOLERANCE,
  isValidDuration,
  sanitizeCurrentDay,
  calculateTotalPoints,
  calculateCompletedPoints,
  calculateRemainingPoints,
  idealAt,
  calculateIdealSeries,
  actualAt,
  calculateActualSeries,
  calculateVariance,
  classifyStatus,
  computeAll
} from '../../src/js/logic/burndownEngine.js';

/** Builds a minimal issue record using the SRS Appendix C schema. */
function issue(issueKey, storyPoints, status, completedDay = null) {
  return { issueKey, summary: `Issue ${issueKey}`, issueType: 'Story', storyPoints, status, completedDay };
}

describe('BurndownEngine (BDC-F-002, BDC-F-010, BDC-F-011, BDC-F-012)', () => {
  describe('Exports & module contract', () => {
    test('exposes named exports and a default computeAll export', () => {
      assert.equal(typeof computeAll, 'function');
      assert.equal(computeAllDefault, computeAll);
      assert.equal(VARIANCE_TOLERANCE, 1);
      assert.deepEqual(SCHEDULE_STATUS, {
        AHEAD: 'Ahead of Schedule',
        ON_TRACK: 'On Track',
        BEHIND: 'Behind Schedule'
      });
    });

    test('SCHEDULE_STATUS is frozen against mutation', () => {
      assert.ok(Object.isFrozen(SCHEDULE_STATUS));
      assert.throws(() => {
        SCHEDULE_STATUS.AHEAD = 'HACK';
      }, TypeError);
    });
  });

  describe('TC-F-02 - Total Committed Story Points (BDC-F-002)', () => {
    test('TC-F-02.1 - default dataset totals exactly 50 points', () => {
      const { issues } = getDefaultDataset();
      assert.equal(calculateTotalPoints(issues), 50);
    });

    test('TC-F-02.1 - total counts every status, not just Done', () => {
      const backlog = [
        issue('PROJ-1', 5, 'Done', 1),
        issue('PROJ-2', 3, 'In Progress'),
        issue('PROJ-3', 8, 'To Do')
      ];
      assert.equal(calculateTotalPoints(backlog), 16);
    });

    test('TC-F-02.2 - total updates immediately on addition and deletion', () => {
      const { issues } = getDefaultDataset();
      assert.equal(calculateTotalPoints(issues), 50);

      const added = [...issues, issue('PROJ-111', 5, 'To Do')];
      assert.equal(calculateTotalPoints(added), 55);

      const removed = added.filter(i => i.issueKey !== 'PROJ-111');
      assert.equal(calculateTotalPoints(removed), 50);
    });
  });

  describe('Completed & remaining points (SAD Section 4.1)', () => {
    test('default dataset on Day 4 reports 29 completed and 21 remaining', () => {
      const { issues } = getDefaultDataset();
      assert.equal(calculateCompletedPoints(issues, 4), 29);
      assert.equal(calculateRemainingPoints(issues, 4), 21);
    });

    test('completion is inclusive of the threshold day', () => {
      const { issues } = getDefaultDataset();
      // PROJ-104 and PROJ-105 both complete on day 4, so day 3 excludes both.
      assert.equal(calculateCompletedPoints(issues, 3), 16);
      assert.equal(calculateCompletedPoints(issues, 4), 29);
    });

    test('issues without a completedDay never count as burned down', () => {
      const backlog = [issue('PROJ-1', 8, 'Done', null), issue('PROJ-2', 5, 'In Progress')];
      assert.equal(calculateCompletedPoints(backlog, 99), 0);
      assert.equal(calculateRemainingPoints(backlog, 99), 13);
    });
  });

  describe('TC-F-10 - Ideal burndown (BDC-F-010)', () => {
    test('TC-F-10.1 - Ideal(0)=50, Ideal(4)=30, Ideal(10)=0 for the default dataset', () => {
      assert.equal(idealAt(50, 0, 10), 50);
      assert.equal(idealAt(50, 4, 10), 30);
      assert.equal(idealAt(50, 10, 10), 0);
    });

    test('TC-F-10.1 - full ideal series is linear across 11 points', () => {
      const series = calculateIdealSeries(50, 10);
      assert.equal(series.length, 11);
      assert.deepEqual(
        series.map(p => p.value),
        [50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0]
      );
      assert.deepEqual(series[0], { day: 0, value: 50 });
      assert.deepEqual(series[10], { day: 10, value: 0 });
    });

    test('TC-F-10.2 - zero duration returns a defined value, never NaN or Infinity', () => {
      const value = idealAt(50, 4, 0);
      assert.equal(value, 0);
      assert.ok(Number.isFinite(value));
      assert.deepEqual(calculateIdealSeries(50, 0), []);
    });

    test('TC-F-10.2 - negative, non-numeric and non-finite durations are rejected safely', () => {
      for (const bad of [-5, NaN, Infinity, -Infinity, '10', null, undefined, {}]) {
        const value = idealAt(50, 4, bad);
        assert.ok(Number.isFinite(value), `idealAt must stay finite for duration ${String(bad)}`);
        assert.equal(value, 0);
        assert.deepEqual(calculateIdealSeries(50, bad), []);
        assert.equal(isValidDuration(bad), false);
      }
    });

    test('fractional ideal values carry no floating-point noise', () => {
      // 50 x (1 - 1/3) = 33.333333..., which must not surface as 33.33333333333333
      assert.equal(idealAt(50, 1, 3), 33.333333);
      assert.ok(Number.isFinite(idealAt(50, 1, 3)));
    });

    test('day is clamped so ideal never goes negative', () => {
      assert.equal(idealAt(50, 15, 10), 0);
      assert.equal(idealAt(50, -5, 10), 50);
    });
  });

  describe('TC-F-11 - Actual burndown (BDC-F-011)', () => {
    test('TC-F-11.1 - Actual(1)=45, Actual(2)=42, Actual(3)=34, Actual(4)=21', () => {
      const { issues } = getDefaultDataset();
      assert.equal(actualAt(issues, 1), 45);
      assert.equal(actualAt(issues, 2), 42);
      assert.equal(actualAt(issues, 3), 34);
      assert.equal(actualAt(issues, 4), 21);
    });

    test('TC-F-11.1 - Actual(0) equals the full committed scope', () => {
      const { issues } = getDefaultDataset();
      assert.equal(actualAt(issues, 0), 50);
    });

    test('TC-F-11.2 - no actual values are plotted beyond the Current Day', () => {
      const { issues } = getDefaultDataset();
      const series = calculateActualSeries(issues, 10, 4);

      assert.equal(series.length, 11);
      for (const point of series) {
        if (point.day <= 4) {
          assert.ok(typeof point.value === 'number', `Day ${point.day} must be plotted`);
        } else {
          assert.equal(point.value, null, `Day ${point.day} must not be plotted beyond Current Day`);
        }
      }
      assert.deepEqual(
        series.filter(p => p.value !== null).map(p => p.value),
        [50, 45, 42, 34, 21]
      );
    });

    test('TC-F-11.2 - moving Current Day to 6 extends the plotted range', () => {
      const { issues } = getDefaultDataset();
      const series = calculateActualSeries(issues, 10, 6);
      const plotted = series.filter(p => p.value !== null);

      assert.equal(plotted.length, 7);
      assert.equal(plotted.at(-1).day, 6);
      // No further work completes after day 4, so the line flattens at 21.
      assert.deepEqual(plotted.map(p => p.value), [50, 45, 42, 34, 21, 21, 21]);
      assert.equal(series[7].value, null);
    });

    test('actual series is empty for an invalid duration', () => {
      const { issues } = getDefaultDataset();
      assert.deepEqual(calculateActualSeries(issues, 0, 4), []);
      assert.deepEqual(calculateActualSeries(issues, -1, 4), []);
    });
  });

  describe('TC-F-12 - Variance & schedule status (BDC-F-012)', () => {
    test('TC-F-12.1 - default dataset at Day 4 gives variance +9, Ahead of Schedule', () => {
      assert.equal(calculateVariance(30, 21), 9);
      assert.equal(classifyStatus(9), SCHEDULE_STATUS.AHEAD);
    });

    test('TC-F-12.1 - Ideal=30 with Actual=28 gives variance +2, Ahead of Schedule', () => {
      assert.equal(calculateVariance(30, 28), 2);
      assert.equal(classifyStatus(2), SCHEDULE_STATUS.AHEAD);
    });

    test('TC-F-12.2 - variance 0, +1 and -1 all classify as On Track', () => {
      for (const variance of [0, 1, -1]) {
        assert.equal(classifyStatus(variance), SCHEDULE_STATUS.ON_TRACK, `variance ${variance}`);
      }
    });

    test('TC-F-12.2 - tolerance boundary is exclusive just outside +/-1', () => {
      assert.equal(classifyStatus(1.000001), SCHEDULE_STATUS.AHEAD);
      assert.equal(classifyStatus(-1.000001), SCHEDULE_STATUS.BEHIND);
    });

    test('TC-F-12.3 - Ideal=30 with Actual=32 and 38 classify as Behind Schedule', () => {
      assert.equal(calculateVariance(30, 32), -2);
      assert.equal(classifyStatus(-2), SCHEDULE_STATUS.BEHIND);
      assert.equal(calculateVariance(30, 38), -8);
      assert.equal(classifyStatus(-8), SCHEDULE_STATUS.BEHIND);
    });

    test('non-finite variance falls back to On Track rather than throwing', () => {
      for (const bad of [NaN, Infinity, -Infinity, 'abc', null, undefined]) {
        assert.equal(classifyStatus(bad), SCHEDULE_STATUS.ON_TRACK);
      }
      assert.equal(calculateVariance(NaN, 21), -21);
      assert.equal(calculateVariance(30, Infinity), 30);
    });
  });

  describe('computeAll - SAD Interface 1', () => {
    test('returns the full documented response shape', () => {
      const { sprint, issues } = getDefaultDataset();
      const result = computeAll(sprint, issues);

      assert.deepEqual(Object.keys(result).sort(), [
        'actual', 'completedPoints', 'daysElapsed', 'daysLeft',
        'ideal', 'remainingPoints', 'status', 'totalPoints', 'variance'
      ]);
    });

    test('default dataset on Day 4 matches SRS Appendix B exactly', () => {
      const { sprint, issues } = getDefaultDataset();
      const result = computeAll(sprint, issues);

      assert.equal(result.totalPoints, 50);
      assert.equal(result.completedPoints, 29);
      assert.equal(result.remainingPoints, 21);
      assert.equal(result.daysElapsed, 4);
      assert.equal(result.daysLeft, 6);
      assert.equal(result.variance, 9);
      assert.equal(result.status, SCHEDULE_STATUS.AHEAD);
      assert.equal(result.ideal.length, 11);
      assert.equal(result.actual.length, 11);
    });

    test('Current Day is clamped into 0..durationDays', () => {
      const { issues } = getDefaultDataset();
      assert.equal(computeAll({ durationDays: 10, currentDay: 99 }, issues).daysElapsed, 10);
      assert.equal(computeAll({ durationDays: 10, currentDay: -4 }, issues).daysElapsed, 0);
      assert.equal(sanitizeCurrentDay(99, 10), 10);
      assert.equal(sanitizeCurrentDay(-1, 10), 0);
    });

    test('is pure - repeated calls agree and inputs are never mutated', () => {
      const { sprint, issues } = getDefaultDataset();
      const snapshot = JSON.stringify({ sprint, issues });

      const first = computeAll(sprint, issues);
      const second = computeAll(sprint, issues);

      assert.deepEqual(first, second);
      assert.equal(JSON.stringify({ sprint, issues }), snapshot, 'inputs must not be mutated');
    });
  });

  describe('TC-SR-04 - Boundary & safe edge-case handling (BDC-SR-004)', () => {
    /** Asserts that no numeric field anywhere in a result is NaN or Infinity. */
    function assertAllFinite(result, label) {
      const scalars = ['totalPoints', 'completedPoints', 'remainingPoints', 'daysElapsed', 'daysLeft', 'variance'];
      for (const field of scalars) {
        assert.ok(Number.isFinite(result[field]), `${label}: ${field} must be finite, got ${result[field]}`);
      }
      for (const point of [...result.ideal, ...result.actual]) {
        assert.ok(Number.isFinite(point.day), `${label}: day must be finite`);
        assert.ok(
          point.value === null || Number.isFinite(point.value),
          `${label}: value must be finite or null, got ${point.value}`
        );
      }
      assert.ok(Object.values(SCHEDULE_STATUS).includes(result.status), `${label}: status must be a known value`);
    }

    test('TC-SR-04.1 - empty backlog yields defined zeros, no NaN or Infinity', () => {
      const result = computeAll({ durationDays: 10, currentDay: 4 }, []);

      assert.equal(result.totalPoints, 0);
      assert.equal(result.completedPoints, 0);
      assert.equal(result.remainingPoints, 0);
      assert.equal(result.variance, 0);
      assert.equal(result.status, SCHEDULE_STATUS.ON_TRACK);
      assert.deepEqual(result.ideal.map(p => p.value), new Array(11).fill(0));
      assertAllFinite(result, 'empty backlog');
    });

    test('TC-SR-04.2 - all-zero story points produce a defined result', () => {
      const backlog = [issue('PROJ-1', 0, 'Done', 2), issue('PROJ-2', 0, 'To Do')];
      const result = computeAll({ durationDays: 10, currentDay: 4 }, backlog);

      assert.equal(result.totalPoints, 0);
      assert.equal(result.remainingPoints, 0);
      assert.equal(result.status, SCHEDULE_STATUS.ON_TRACK);
      assertAllFinite(result, 'zero points');
    });

    test('TC-SR-04.2 - zero and negative durations are rejected without crashing', () => {
      const { issues } = getDefaultDataset();
      for (const durationDays of [0, -1, -10]) {
        const result = computeAll({ durationDays, currentDay: 4 }, issues);

        assert.deepEqual(result.ideal, [], `duration ${durationDays} must yield no ideal series`);
        assert.deepEqual(result.actual, [], `duration ${durationDays} must yield no actual series`);
        assert.equal(result.variance, 0);
        assert.equal(result.status, SCHEDULE_STATUS.ON_TRACK);
        // Point totals do not depend on duration and stay accurate.
        assert.equal(result.totalPoints, 50);
        assert.equal(result.completedPoints, 29);
        assertAllFinite(result, `duration ${durationDays}`);
      }
    });

    test('TC-SR-04.2 - In Progress issues with a null completion date are excluded', () => {
      const { issues } = getDefaultDataset();
      const inProgress = issues.filter(i => i.status === 'In Progress');

      assert.ok(inProgress.length > 0, 'default dataset should contain In Progress work');
      for (const i of inProgress) {
        assert.equal(i.completedDay, null);
      }
      const result = computeAll({ durationDays: 10, currentDay: 10 }, inProgress);
      assert.equal(result.completedPoints, 0);
      assertAllFinite(result, 'in-progress only');
    });

    test('malformed inputs never throw and never leak NaN or Infinity', () => {
      const malformed = [
        [null, null],
        [undefined, undefined],
        ['not-a-sprint', 'not-an-array'],
        [{ durationDays: NaN, currentDay: NaN }, [null, undefined, 42, 'x']],
        [{ durationDays: Infinity, currentDay: Infinity }, [issue('A', Infinity, 'Done', 1)]],
        [{ durationDays: 10, currentDay: 4 }, [issue('A', -5, 'Done', 1), issue('B', NaN, 'Done', 2)]],
        [{ durationDays: 10, currentDay: 4 }, [issue('C', '8', 'Done', 1), issue('D', 5, 'Done', NaN)]]
      ];

      for (const [sprint, issues] of malformed) {
        const label = JSON.stringify({ sprint, issues });
        let result;
        assert.doesNotThrow(() => {
          result = computeAll(sprint, issues);
        }, `computeAll must not throw for ${label}`);
        assertAllFinite(result, label);
      }
    });

    test('negative, non-numeric and non-finite story points contribute zero', () => {
      const backlog = [
        issue('A', 5, 'Done', 1),
        issue('B', -10, 'Done', 1),
        issue('C', NaN, 'Done', 1),
        issue('D', Infinity, 'Done', 1),
        issue('E', '7', 'Done', 1)
      ];
      assert.equal(calculateTotalPoints(backlog), 5);
      assert.equal(calculateCompletedPoints(backlog, 1), 5);
    });
  });

  describe('TC-NF-05 - Modularity & independent testability (BDC-NF-005)', () => {
    test('TC-NF-05.2 - engine runs headless with no DOM available', () => {
      assert.equal(typeof globalThis.window, 'undefined', 'test must run without a DOM');
      assert.equal(typeof globalThis.document, 'undefined', 'test must run without a DOM');

      const { sprint, issues } = getDefaultDataset();
      const result = computeAll(sprint, issues);
      assert.equal(result.status, SCHEDULE_STATUS.AHEAD);
    });

    test('TC-NF-05.1 - module declares no imports, so it cannot form a cycle', async () => {
      const { readFile } = await import('node:fs/promises');
      const source = await readFile(
        new URL('../../src/js/logic/burndownEngine.js', import.meta.url),
        'utf8'
      );
      assert.doesNotMatch(source, /^\s*import\s/m, 'BurndownEngine must not import any module');
      assert.doesNotMatch(source, /\brequire\s*\(/, 'BurndownEngine must not use require()');
      assert.doesNotMatch(source, /\b(document|window)\b/, 'BurndownEngine must not touch the DOM');
    });
  });
});
