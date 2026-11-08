import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DataManager } from '../../src/js/data/dataManager.js';
import { getDefaultDataset } from '../../src/js/data/defaultDataset.js';
import {
  snapshot,
  assertLayersConsistent,
  makeIssue,
  recordNotifications,
  SRS_APPENDIX_A_ISSUES
} from './pipelineHelpers.js';

/**
 * Cross-layer integration and regression tests (BDC-NF-005, TC-NF-05.2).
 *
 * Each scenario drives DataManager and then checks every layer the user sees:
 * stored state, BurndownEngine results, the chart series, the backlog table rows,
 * the Current Day control and the KPI cards. Expected values are fixed numbers
 * from SRS Appendix A/B and the testing-phase addendum, not recomputed from the
 * engine, so the tests stay independent of the code they verify.
 *
 * Default data at Day 4: total 50, completed 29, remaining 21, Ideal(4) 30,
 * variance +9. Actual(0..4) = 50, 45, 42, 34, 21.
 */

/** Ideal line for the default 50-point, 10-day sprint. */
const DEFAULT_IDEAL = [50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0];

/** Expected default Actual series for Days 0 to 4; later days are not plotted. */
const DEFAULT_ACTUAL_TO_DAY_4 = [50, 45, 42, 34, 21];

describe('Dashboard pipeline: DataManager -> calculations -> chart / table / timeline / KPIs', () => {
  describe('Default data (TC-F-02.1, TC-F-04.1, TC-F-05.1, TC-F-10.1, TC-F-11.1, TC-F-15.1)', () => {
    test('a fresh load shows the 10 original issues with every field and the exact SRS Appendix B results', () => {
      const snap = snapshot(new DataManager());

      assert.equal(snap.rows.length, 10);
      SRS_APPENDIX_A_ISSUES.forEach(([issueKey, summary, issueType, points, status, day], index) => {
        assert.deepEqual(snap.rows[index], {
          issueKey,
          summary,
          issueType,
          storyPoints: String(points),
          status,
          completedDay: day === null ? '--' : String(day)
        }, `row ${index + 1} (${issueKey}) must match SRS Appendix A`);
      });

      assert.deepEqual(snap.kpiCards, {
        totalScope: '50',
        completed: '29',
        remaining: '21',
        daysElapsed: '4',
        daysLeft: '6',
        statusText: 'Ahead of Schedule',
        statusClass: 'status--ahead',
        variance: '+9'
      });
      assert.deepEqual(snap.chart.ideal, DEFAULT_IDEAL);
      assert.deepEqual(snap.chart.actual, [...DEFAULT_ACTUAL_TO_DAY_4, null, null, null, null, null, null]);
      assert.equal(snap.sprint.sprintName, 'Sprint 1 - Core Features');
      assertLayersConsistent(snap, 'default load');
    });
  });

  describe('Sprint configuration (TC-F-01.1)', () => {
    test('TC-F-01.1 - configuring "Sprint 2" for 5 days re-renders every layer for Total Days = 5', () => {
      const dm = new DataManager();
      const result = dm.setSprint({ sprintName: 'Sprint 2', durationDays: 5, startDate: '2026-10-26', endDate: '2026-10-30' });
      assert.equal(result.success, true);
      const snap = snapshot(dm);

      assert.match(snap.bannerHtml, />Sprint 2</);
      assert.match(snap.bannerHtml, /5 working days/);
      assert.match(snap.bannerHtml, /2026-10-26 &mdash; 2026-10-30/);
      assert.equal(snap.sprint.currentDay, 4, 'Day 4 is still inside a 5-day sprint, so it is kept');
      assert.deepEqual(snap.chart.labels, [0, 1, 2, 3, 4, 5]);
      assert.deepEqual(snap.chart.ideal, [50, 40, 30, 20, 10, 0]);
      assert.deepEqual(snap.chart.actual, [50, 45, 42, 34, 21, null]);
      assert.equal(snap.timeline.duration, '5');
      // Ideal(4) is now 10 against 21 remaining, so the sprint reads as behind.
      assert.equal(snap.kpiCards.daysLeft, '1');
      assert.equal(snap.kpiCards.variance, '-11');
      assert.equal(snap.kpiCards.statusText, 'Behind Schedule');
      assertLayersConsistent(snap, 'configured 5-day sprint');
    });
  });

  describe('Adding an issue (TC-F-02.2, TC-F-06.1)', () => {
    test('adding PROJ-111 (5 points) updates scope, ideal line, actual line, table and KPIs together', () => {
      const dm = new DataManager();
      const notifications = recordNotifications(dm);

      assert.equal(dm.addIssue(makeIssue('PROJ-111', 5)).success, true);
      const snap = snapshot(dm);

      assert.equal(notifications.count(), 1, 'one change must publish exactly one update');
      assert.equal(snap.rows.length, 11);
      assert.deepEqual(snap.rows[10], {
        issueKey: 'PROJ-111',
        summary: 'Integration issue PROJ-111',
        issueType: 'Task',
        storyPoints: '5',
        status: 'To Do',
        completedDay: '--'
      });
      // 55 x (1 - d/10); Actual = 55 minus the work completed by each day.
      assert.deepEqual(snap.chart.ideal, [55, 49.5, 44, 38.5, 33, 27.5, 22, 16.5, 11, 5.5, 0]);
      assert.deepEqual(snap.chart.actual.slice(0, 5), [55, 50, 47, 39, 26]);
      assert.deepEqual(snap.kpiCards, {
        totalScope: '55',
        completed: '29',
        remaining: '26',
        daysElapsed: '4',
        daysLeft: '6',
        statusText: 'Ahead of Schedule',
        statusClass: 'status--ahead',
        variance: '+7'
      });
      assertLayersConsistent(snap, 'after add');
    });

    test('deleting the added issue returns every layer to the default snapshot', () => {
      const dm = new DataManager();
      const before = snapshot(dm);

      dm.addIssue(makeIssue('PROJ-111', 5));
      assert.equal(dm.deleteIssue('PROJ-111').success, true);

      assert.deepEqual(snapshot(dm), before);
    });

    test('TC-F-06.4 - a zero-point issue appears in the table but changes no total, line or KPI', () => {
      const dm = new DataManager();
      const before = snapshot(dm);

      assert.equal(dm.addIssue(makeIssue('PROJ-120', 0)).success, true);
      const snap = snapshot(dm);

      assert.equal(snap.rows.length, 11);
      assert.equal(snap.rows[10].storyPoints, '0');
      assert.deepEqual(snap.kpiCards, before.kpiCards);
      assert.deepEqual(snap.chart, before.chart);
      assertLayersConsistent(snap, 'zero-point add');
    });

    test('a Done issue added at the Current Day burns down immediately', () => {
      const dm = new DataManager();
      assert.equal(dm.addIssue(makeIssue('PROJ-112', 4, 'Done', 4)).success, true);
      const snap = snapshot(dm);

      // Scope 54, completed 29 + 4 = 33, remaining 21; Ideal(4) = 32.4, so variance +11.4.
      assert.equal(snap.kpiCards.totalScope, '54');
      assert.equal(snap.kpiCards.completed, '33');
      assert.equal(snap.kpiCards.remaining, '21');
      assert.equal(snap.kpiCards.variance, '+11.4');
      assert.equal(snap.chart.actual[4], 21);
      assert.equal(snap.chart.actual[3], 54 - 16, 'earlier days must not include work finished on Day 4');
      assertLayersConsistent(snap, 'add Done issue');
    });
  });

  describe('Changing status and completion day (TC-F-07.1, TC-F-07.3, TC-F-15.2)', () => {
    test('marking PROJ-106 Done on Day 4 gives completed 32, remaining 18 in every layer', () => {
      const dm = new DataManager();
      assert.equal(dm.updateIssue('PROJ-106', { status: 'Done', completedDay: 4 }).success, true);
      const snap = snapshot(dm);

      assert.deepEqual(snap.rows[5], {
        issueKey: 'PROJ-106',
        summary: 'UI Form Validation for Task Addition',
        issueType: 'Bug',
        storyPoints: '3',
        status: 'Done',
        completedDay: '4'
      });
      assert.deepEqual(snap.chart.actual.slice(0, 5), [50, 45, 42, 34, 18], 'only Day 4 changes');
      assert.deepEqual(snap.kpiCards, {
        totalScope: '50',
        completed: '32',
        remaining: '18',
        daysElapsed: '4',
        daysLeft: '6',
        statusText: 'Ahead of Schedule',
        statusClass: 'status--ahead',
        variance: '+12'
      });
      assertLayersConsistent(snap, 'after Done');
    });

    test('changing the completion day of a Done issue recalculates every earlier day', () => {
      const dm = new DataManager();
      dm.updateIssue('PROJ-106', { status: 'Done', completedDay: 4 });
      assert.equal(dm.updateIssue('PROJ-106', { completedDay: 2 }).success, true);
      const snap = snapshot(dm);

      // PROJ-106 (3 points) now burns down on Day 2, so Days 2 and 3 drop by 3.
      assert.deepEqual(snap.chart.actual.slice(0, 5), [50, 45, 39, 31, 18]);
      assert.equal(snap.rows[5].completedDay, '2');
      assert.equal(snap.kpiCards.remaining, '18');
      assertLayersConsistent(snap, 'completion day moved');
    });

    for (const reopenedStatus of ['In Progress', 'To Do']) {
      test(`reopening Done work to ${reopenedStatus} clears the completion day in every layer`, () => {
        const dm = new DataManager();
        dm.updateIssue('PROJ-106', { status: 'Done', completedDay: 4 });
        assert.equal(dm.updateIssue('PROJ-106', { status: reopenedStatus }).success, true);
        const snap = snapshot(dm);

        assert.equal(snap.issues[5].completedDay, null);
        assert.equal(snap.rows[5].completedDay, '--');
        assert.equal(snap.rows[5].status, reopenedStatus);
        assert.deepEqual(snap.chart.actual.slice(0, 5), DEFAULT_ACTUAL_TO_DAY_4);
        assert.equal(snap.kpiCards.completed, '29');
        assert.equal(snap.kpiCards.remaining, '21');
        assert.equal(snap.kpiCards.variance, '+9');
        assertLayersConsistent(snap, `reopened to ${reopenedStatus}`);
      });
    }

    test('reopening to In Progress returns the exact default snapshot', () => {
      const dm = new DataManager();
      const before = snapshot(dm);

      dm.updateIssue('PROJ-106', { status: 'Done', completedDay: 4 });
      dm.updateIssue('PROJ-106', { status: 'In Progress' });

      assert.deepEqual(snapshot(dm), before);
    });

    test('moving a Done issue out of Done and back keeps the history consistent', () => {
      const dm = new DataManager();
      dm.updateIssue('PROJ-105', { status: 'To Do' });
      let snap = snapshot(dm);
      // PROJ-105 (8 points, Day 4) is open again: completed 21, remaining 29, variance +1.
      assert.equal(snap.kpiCards.completed, '21');
      assert.equal(snap.kpiCards.remaining, '29');
      assert.equal(snap.kpiCards.variance, '+1');
      assert.equal(snap.kpiCards.statusText, 'On Track', '+1 is inside the +/-1 tolerance');
      assertLayersConsistent(snap, 'reopened PROJ-105');

      assert.equal(dm.updateIssue('PROJ-105', { status: 'Done', completedDay: 4 }).success, true);
      snap = snapshot(dm);
      assert.equal(snap.kpiCards.completed, '29');
      assert.equal(snap.kpiCards.statusText, 'Ahead of Schedule');
      assertLayersConsistent(snap, 'completed PROJ-105 again');
    });
  });

  describe('Deleting issues (TC-F-08.1, TC-SR-04.1)', () => {
    test('deleting PROJ-110 only gives total 45, completed 29, remaining 16, Ideal(4) 27, variance +11', () => {
      const dm = new DataManager();
      assert.equal(dm.deleteIssue('PROJ-110').success, true);
      const snap = snapshot(dm);

      assert.equal(snap.rows.length, 9);
      assert.equal(snap.rows.some(row => row.issueKey === 'PROJ-110'), false);
      assert.deepEqual(snap.chart.ideal, [45, 40.5, 36, 31.5, 27, 22.5, 18, 13.5, 9, 4.5, 0]);
      assert.deepEqual(snap.chart.actual.slice(0, 5), [45, 40, 37, 29, 16]);
      assert.deepEqual(snap.kpiCards, {
        totalScope: '45',
        completed: '29',
        remaining: '16',
        daysElapsed: '4',
        daysLeft: '6',
        statusText: 'Ahead of Schedule',
        statusClass: 'status--ahead',
        variance: '+11'
      });
      assertLayersConsistent(snap, 'after delete');
    });

    test('deleting a completed issue removes its burn-down from the actual line', () => {
      const dm = new DataManager();
      assert.equal(dm.deleteIssue('PROJ-103').success, true);
      const snap = snapshot(dm);

      // PROJ-103 (8 points, Day 3) is gone: scope 42, completed 21, remaining 21, Ideal(4) 25.2.
      assert.equal(snap.kpiCards.totalScope, '42');
      assert.equal(snap.kpiCards.completed, '21');
      assert.equal(snap.kpiCards.remaining, '21');
      assert.equal(snap.kpiCards.variance, '+4.2');
      assert.deepEqual(snap.chart.actual.slice(0, 5), [42, 37, 34, 34, 21]);
      assertLayersConsistent(snap, 'delete completed issue');
    });

    test('deleting every issue gives defined zero results in every layer, then Reset restores the defaults', () => {
      const dm = new DataManager();
      const before = snapshot(dm);

      for (const { issueKey } of dm.getIssues()) {
        assert.equal(dm.deleteIssue(issueKey).success, true);
        assertLayersConsistent(snapshot(dm), `after deleting ${issueKey}`);
      }
      const empty = snapshot(dm);

      assert.deepEqual(empty.rows, []);
      assert.deepEqual(empty.kpiCards, {
        totalScope: '0',
        completed: '0',
        remaining: '0',
        daysElapsed: '4',
        daysLeft: '6',
        statusText: 'On Track',
        statusClass: 'status--on-track',
        variance: '0'
      });
      assert.deepEqual(empty.chart.ideal, new Array(11).fill(0));
      assert.deepEqual(empty.chart.actual.slice(0, 5), [0, 0, 0, 0, 0]);

      dm.reset();
      assert.deepEqual(snapshot(dm), before, 'Reset must restore the exact default state');
    });

    test('an emptied backlog accepts a new issue and reports a sensible schedule', () => {
      const dm = new DataManager();
      for (const { issueKey } of dm.getIssues()) {
        dm.deleteIssue(issueKey);
      }
      assert.equal(dm.addIssue(makeIssue('NEW-1', 4)).success, true);
      const snap = snapshot(dm);

      // Scope 4, nothing done: remaining 4 against Ideal(4) = 2.4, so variance -1.6.
      assert.equal(snap.kpiCards.totalScope, '4');
      assert.equal(snap.kpiCards.remaining, '4');
      assert.equal(snap.kpiCards.variance, '-1.6');
      assert.equal(snap.kpiCards.statusText, 'Behind Schedule');
      assertLayersConsistent(snap, 'first issue after emptying');
    });
  });

  describe('Reset restores the exact defaults (TC-F-04.1, TC-F-09.1)', () => {
    test('Reset after issue, status, day and configuration changes restores the canonical dataset', () => {
      const dm = new DataManager();
      const before = snapshot(dm);

      dm.addIssue(makeIssue('PROJ-111', 5, 'Done', 3));
      dm.updateIssue('PROJ-107', { status: 'Done', completedDay: 4 });
      dm.deleteIssue('PROJ-101');
      dm.setSprint({ sprintName: 'Edited sprint', durationDays: 7, startDate: '2027-01-04', endDate: '2027-01-12' });
      dm.setCurrentDay(2);
      assert.notDeepEqual(snapshot(dm), before, 'the scenario must really change the state');

      dm.reset();

      assert.deepEqual(snapshot(dm), before);
      assert.deepEqual({ sprint: dm.getSprint(), issues: dm.getIssues() }, getDefaultDataset());
    });

    test('mutating copies returned by the store never changes what Reset restores or what the views show', () => {
      const dm = new DataManager();
      const before = snapshot(dm);

      const issues = dm.getIssues();
      issues[0].storyPoints = 999;
      issues.pop();
      const sprint = dm.getSprint();
      sprint.durationDays = 1;

      assert.deepEqual(snapshot(dm), before, 'the store must hand out isolated copies');
      dm.reset();
      assert.deepEqual(snapshot(dm), before);
    });
  });

  describe('Current Day and timeline boundaries (TC-F-03.1, TC-F-03.2, TC-F-12, TC-F-14.1)', () => {
    // Hand-calculated: Actual(d) from SRS Appendix A, Ideal(d) = 50 - 5d, variance = Ideal - Actual.
    const ACTUAL_BY_DAY = [50, 45, 42, 34, 21, 21, 21, 21, 21, 21, 21];
    const EXPECTED_BY_DAY = [
      { variance: '0', status: 'On Track' },
      { variance: '0', status: 'On Track' },
      { variance: '-2', status: 'Behind Schedule' },
      { variance: '+1', status: 'On Track' },
      { variance: '+9', status: 'Ahead of Schedule' },
      { variance: '+4', status: 'Ahead of Schedule' },
      { variance: '-1', status: 'On Track' },
      { variance: '-6', status: 'Behind Schedule' },
      { variance: '-11', status: 'Behind Schedule' },
      { variance: '-16', status: 'Behind Schedule' },
      { variance: '-21', status: 'Behind Schedule' }
    ];

    for (let day = 0; day <= 10; day += 1) {
      test(`Day ${day}: marker, actual endpoint, KPIs, status and timeline control all agree`, () => {
        const dm = new DataManager();
        assert.equal(dm.setCurrentDay(day).success, true);
        const snap = snapshot(dm);

        assert.equal(snap.chart.actual[day], ACTUAL_BY_DAY[day]);
        assert.equal(snap.chart.actual.filter(value => value !== null).length, day + 1);
        assert.equal(snap.kpiCards.remaining, String(ACTUAL_BY_DAY[day]));
        assert.equal(snap.kpiCards.variance, EXPECTED_BY_DAY[day].variance);
        assert.equal(snap.kpiCards.statusText, EXPECTED_BY_DAY[day].status);
        assert.equal(snap.kpiCards.daysElapsed, String(day));
        assert.equal(snap.kpiCards.daysLeft, String(10 - day));
        assert.equal(snap.timeline.prevDisabled, day === 0);
        assert.equal(snap.timeline.nextDisabled, day === 10);
        assertLayersConsistent(snap, `Day ${day}`);
      });
    }

    test('moving Day 4 to Day 6 updates the marker, actual endpoint and status without a reload', () => {
      const dm = new DataManager();
      const notifications = recordNotifications(dm);

      assert.equal(dm.setCurrentDay(6).success, true);
      const snap = snapshot(dm);

      assert.equal(notifications.count(), 1);
      assert.deepEqual(snap.chart.actual.slice(0, 7), [50, 45, 42, 34, 21, 21, 21]);
      assert.equal(snap.timeline.day, '6');
      assert.equal(snap.kpiCards.statusText, 'On Track');
      assert.equal(snap.kpiCards.variance, '-1');
    });

    test('Day 0 plots only the starting point and the final day plots the whole actual line', () => {
      const dm = new DataManager();
      dm.setCurrentDay(0);
      assert.deepEqual(snapshot(dm).chart.actual, [50, ...new Array(10).fill(null)]);

      dm.setCurrentDay(10);
      assert.deepEqual(snapshot(dm).chart.actual, [50, 45, 42, 34, 21, 21, 21, 21, 21, 21, 21]);
    });
  });

  describe('Single-day sprints and zero-point work (TC-SR-04.1, TC-SR-04.2)', () => {
    test('shortening to a one-day sprint clamps the Current Day and keeps every layer consistent', () => {
      const dm = new DataManager();
      const result = dm.setSprint({ durationDays: 1, startDate: '2026-10-26', endDate: '2026-10-26' });
      assert.equal(result.success, true);
      const snap = snapshot(dm);

      assert.equal(snap.sprint.currentDay, 1);
      assert.deepEqual(snap.chart.labels, [0, 1]);
      assert.deepEqual(snap.chart.ideal, [50, 0]);
      assert.deepEqual(snap.chart.actual, [50, 45]);
      assert.equal(snap.kpiCards.daysLeft, '0');
      assert.equal(snap.timeline.nextDisabled, true);
      assert.equal(snap.kpiCards.statusText, 'Behind Schedule');
      assertLayersConsistent(snap, 'one-day sprint, final day');

      dm.setCurrentDay(0);
      const dayZero = snapshot(dm);
      assert.deepEqual(dayZero.chart.actual, [50, null]);
      assert.equal(dayZero.timeline.prevDisabled, true);
      assertLayersConsistent(dayZero, 'one-day sprint, Day 0');
    });

    test('a backlog made only of zero-point work stays finite in every layer', () => {
      const { sprint } = getDefaultDataset();
      const issues = [makeIssue('Z-1', 0, 'Done', 2), makeIssue('Z-2', 0, 'In Progress'), makeIssue('Z-3', 0)];
      const dm = new DataManager({ sprint, issues });
      assert.deepEqual(dm.loadErrors, []);
      const snap = snapshot(dm);

      assert.equal(snap.rows.length, 3);
      assert.deepEqual(snap.kpiCards.totalScope, '0');
      assert.deepEqual(snap.kpiCards.remaining, '0');
      assert.equal(snap.kpiCards.statusText, 'On Track');
      assert.deepEqual(snap.chart.ideal, new Array(11).fill(0));
      assertLayersConsistent(snap, 'zero-point backlog');
    });

    test('a one-day sprint with zero-point work and an empty backlog stays defined', () => {
      const dm = new DataManager();
      dm.setSprint({ durationDays: 1 });
      for (const { issueKey } of dm.getIssues()) {
        dm.deleteIssue(issueKey);
      }
      const snap = snapshot(dm);

      assert.deepEqual(snap.chart.ideal, [0, 0]);
      assert.deepEqual(snap.chart.actual, [0, 0]);
      assertLayersConsistent(snap, 'empty one-day sprint');
    });
  });

  describe('Documented design: shortening a sprint keeps history (system validation OBS-03)', () => {
    test('the table keeps Done issues beyond the new duration while the KPIs count only days inside it', () => {
      const dm = new DataManager();
      assert.equal(dm.setSprint({ durationDays: 3 }).success, true);
      const snap = snapshot(dm);

      // PROJ-104 and PROJ-105 stay Done on Day 4, which is now outside the 3-day sprint.
      assert.equal(snap.rows.filter(row => row.status === 'Done').length, 5);
      assert.equal(snap.rows[3].completedDay, '4');
      assert.equal(snap.rows[4].completedDay, '4');
      // Only work finished on Days 1 to 3 (5 + 3 + 8) counts as burned down.
      assert.equal(snap.kpiCards.completed, '16');
      assert.equal(snap.kpiCards.remaining, '34');
      assert.equal(snap.kpiCards.totalScope, '50');
      assert.equal(snap.sprint.currentDay, 3);
      assertLayersConsistent(snap, 'shortened sprint');
    });
  });
});
