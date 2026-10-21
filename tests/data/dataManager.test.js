import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  DataManager,
  defaultDataManager,
  validateSprintConfig,
  validateCurrentDay
} from '../../src/js/data/dataManager.js';

import { DEFAULT_SPRINT } from '../../src/js/data/defaultDataset.js';
import { SCHEDULE_STATUS } from '../../src/js/logic/burndownEngine.js';

describe('DataManager (BDC-F-001, BDC-F-003, BDC-F-015)', () => {
  let dm;

  beforeEach(() => {
    dm = new DataManager();
  });

  describe('Module Contracts & Defaults', () => {
    test('instantiates with deep-cloned default sprint and issues', () => {
      const sprint = dm.getSprint();
      assert.equal(sprint.sprintName, 'Sprint 1 - Core Features');
      assert.equal(sprint.durationDays, 10);
      assert.equal(sprint.currentDay, 4);
      assert.equal(sprint.totalStoryPoints, 50);

      const issues = dm.getIssues();
      assert.equal(issues.length, 10);
    });

    test('defaultDataManager singleton instance is exported and functional', () => {
      assert.ok(defaultDataManager instanceof DataManager);
      assert.equal(defaultDataManager.getCurrentDay(), 4);
    });

    test('reset() restores baseline state', () => {
      dm.setCurrentDay(2);
      dm.setSprint({ sprintName: 'Custom Sprint', durationDays: 5 });
      assert.equal(dm.getCurrentDay(), 2);
      assert.equal(dm.getSprint().sprintName, 'Custom Sprint');

      dm.reset();
      assert.equal(dm.getSprint().sprintName, 'Sprint 1 - Core Features');
      assert.equal(dm.getSprint().durationDays, 10);
      assert.equal(dm.getCurrentDay(), 4);
    });
  });

  describe('TC-F-01 - Sprint Configuration (BDC-F-001)', () => {
    test('TC-F-01.1 - accepts and saves a valid sprint configuration', () => {
      const validConfig = {
        sprintName: 'Sprint 2',
        durationDays: 5,
        startDate: '2026-10-26',
        endDate: '2026-10-30'
      };

      const result = dm.setSprint(validConfig);
      assert.equal(result.success, true);
      assert.equal(result.errors.length, 0);

      const saved = dm.getSprint();
      assert.equal(saved.sprintName, 'Sprint 2');
      assert.equal(saved.durationDays, 5);
      assert.equal(saved.startDate, '2026-10-26');
      assert.equal(saved.endDate, '2026-10-30');
    });

    test('TC-F-01.1 - adjusts Current Day if new duration is shorter than current day', () => {
      // Baseline Current Day is 4
      assert.equal(dm.getCurrentDay(), 4);

      dm.setSprint({
        sprintName: 'Short Sprint',
        durationDays: 3
      });

      assert.equal(dm.getSprint().durationDays, 3);
      assert.equal(dm.getCurrentDay(), 3, 'Current Day must be clamped to new duration');
    });

    test('TC-F-01.2 - rejects invalid duration (0, negative, non-numeric) and retains previous valid config', () => {
      const initialSprint = dm.getSprint();

      // Zero duration
      const resZero = dm.setSprint({ durationDays: 0 });
      assert.equal(resZero.success, false);
      assert.ok(resZero.errors.length > 0);
      assert.deepEqual(dm.getSprint(), initialSprint, 'Previous valid config must be retained on duration 0');

      // Negative duration
      const resNeg = dm.setSprint({ durationDays: -3 });
      assert.equal(resNeg.success, false);
      assert.deepEqual(dm.getSprint(), initialSprint, 'Previous valid config must be retained on negative duration');

      // Non-numeric duration
      const resStr = dm.setSprint({ durationDays: 'abc' });
      assert.equal(resStr.success, false);
      assert.deepEqual(dm.getSprint(), initialSprint, 'Previous valid config must be retained on string duration');

      // Floating-point duration
      const resFloat = dm.setSprint({ durationDays: 5.5 });
      assert.equal(resFloat.success, false);
      assert.deepEqual(dm.getSprint(), initialSprint, 'Previous valid config must be retained on float duration');
    });

    test('TC-F-01.3 - rejects end date preceding start date and retains previous valid config', () => {
      const initialSprint = dm.getSprint();

      const resInverted = dm.setSprint({
        startDate: '2026-10-30',
        endDate: '2026-10-26'
      });

      assert.equal(resInverted.success, false);
      assert.ok(resInverted.errors.some(e => e.includes('end date must follow')));
      assert.deepEqual(dm.getSprint(), initialSprint, 'Previous valid config must be retained on inverted dates');
    });

    test('rejects empty or whitespace-only sprint name', () => {
      const initial = dm.getSprint();
      const resEmpty = dm.setSprint({ sprintName: '   ' });
      assert.equal(resEmpty.success, false);
      assert.ok(resEmpty.errors.some(e => e.includes('Sprint name is required')));
      assert.equal(dm.getSprint().sprintName, initial.sprintName);
    });
  });

  describe('TC-F-03 - Current Day Timeline Control (BDC-F-003)', () => {
    test('TC-F-03.1 - moving control to valid day updates Current Day and notifies subscribers', () => {
      let notified = false;
      const unsubscribe = dm.subscribe(() => {
        notified = true;
      });

      const res = dm.setCurrentDay(7);
      assert.equal(res.success, true);
      assert.equal(dm.getCurrentDay(), 7);
      assert.equal(notified, true);

      unsubscribe();
    });

    test('TC-F-03.1 - supports boundary days 0 and durationDays', () => {
      assert.equal(dm.setCurrentDay(0).success, true);
      assert.equal(dm.getCurrentDay(), 0);

      const maxDay = dm.getSprint().durationDays;
      assert.equal(dm.setCurrentDay(maxDay).success, true);
      assert.equal(dm.getCurrentDay(), maxDay);
    });

    test('TC-F-03.2 - out-of-range values (< 0 or > durationDays) are rejected safely without state mutation', () => {
      const initialDay = dm.getCurrentDay();

      // Negative day
      const resNeg = dm.setCurrentDay(-1);
      assert.equal(resNeg.success, false);
      assert.equal(dm.getCurrentDay(), initialDay);

      // Day beyond duration
      const resExceed = dm.setCurrentDay(11);
      assert.equal(resExceed.success, false);
      assert.equal(dm.getCurrentDay(), initialDay);

      // Non-numeric / NaN
      const resNaN = dm.setCurrentDay('five');
      assert.equal(resNaN.success, false);
      assert.equal(dm.getCurrentDay(), initialDay);
    });
  });

  describe('TC-F-15 - Live Sprint KPI Dashboard (BDC-F-015)', () => {
    test('TC-F-15.1 - default dataset at Day 4 produces exact SRS Appendix A & B KPI values', () => {
      const kpis = dm.getKPIs();

      // 1. Total Scope: 50
      assert.equal(kpis.totalScope, 50, 'Total scope must be 50 story points');
      assert.equal(kpis.totalPoints, 50);

      // 2. Completed Story Points: 29 (PROJ-101..105)
      assert.equal(kpis.completedPoints, 29, 'Completed points on Day 4 must equal 29');

      // 3. Remaining Story Points: 21 (50 - 29)
      assert.equal(kpis.remainingPoints, 21, 'Remaining points on Day 4 must equal 21');

      // 4. Days Elapsed: 4
      assert.equal(kpis.daysElapsed, 4, 'Days elapsed on Day 4 must equal 4');

      // 5. Days Left: 6 (10 - 4)
      assert.equal(kpis.daysLeft, 6, 'Days left on Day 4 must equal 6');

      // 6. Variance: +9 (30 ideal - 21 actual)
      assert.equal(kpis.variance, 9, 'Schedule variance must be +9');

      // 7. Schedule Status: Ahead of Schedule
      assert.equal(kpis.scheduleStatus, SCHEDULE_STATUS.AHEAD, 'Status must be Ahead of Schedule');
    });

    test('TC-F-15.2 - moving Current Day updates all KPIs live and deterministically', () => {
      // Day 0: No work completed yet
      dm.setCurrentDay(0);
      const kpi0 = dm.getKPIs();
      assert.equal(kpi0.daysElapsed, 0);
      assert.equal(kpi0.daysLeft, 10);
      assert.equal(kpi0.completedPoints, 0);
      assert.equal(kpi0.remainingPoints, 50);
      assert.equal(kpi0.variance, 0);
      assert.equal(kpi0.scheduleStatus, SCHEDULE_STATUS.ON_TRACK);

      // Day 1: PROJ-101 Done (5 pts) -> Ideal = 45, Actual = 45 -> Variance = 0 (On Track)
      dm.setCurrentDay(1);
      const kpi1 = dm.getKPIs();
      assert.equal(kpi1.daysElapsed, 1);
      assert.equal(kpi1.daysLeft, 9);
      assert.equal(kpi1.completedPoints, 5);
      assert.equal(kpi1.remainingPoints, 45);
      assert.equal(kpi1.variance, 0);
      assert.equal(kpi1.scheduleStatus, SCHEDULE_STATUS.ON_TRACK);

      // Day 2: PROJ-101 (5) + PROJ-102 (3) Done = 8 pts -> Ideal = 40, Actual = 42 -> Variance = -2 (Behind Schedule)
      dm.setCurrentDay(2);
      const kpi2 = dm.getKPIs();
      assert.equal(kpi2.daysElapsed, 2);
      assert.equal(kpi2.daysLeft, 8);
      assert.equal(kpi2.completedPoints, 8);
      assert.equal(kpi2.remainingPoints, 42);
      assert.equal(kpi2.variance, -2);
      assert.equal(kpi2.scheduleStatus, SCHEDULE_STATUS.BEHIND);

      // Day 3: PROJ-101(5)+102(3)+103(8)=16 pts -> Ideal = 35, Actual = 34 -> Variance = +1 (On Track)
      dm.setCurrentDay(3);
      const kpi3 = dm.getKPIs();
      assert.equal(kpi3.daysElapsed, 3);
      assert.equal(kpi3.daysLeft, 7);
      assert.equal(kpi3.completedPoints, 16);
      assert.equal(kpi3.remainingPoints, 34);
      assert.equal(kpi3.variance, 1);
      assert.equal(kpi3.scheduleStatus, SCHEDULE_STATUS.ON_TRACK);

      // Day 10 (End): 29 completed, 21 remaining -> Ideal = 0, Actual = 21 -> Variance = -21 (Behind Schedule)
      dm.setCurrentDay(10);
      const kpi10 = dm.getKPIs();
      assert.equal(kpi10.daysElapsed, 10);
      assert.equal(kpi10.daysLeft, 0);
      assert.equal(kpi10.completedPoints, 29);
      assert.equal(kpi10.remainingPoints, 21);
      assert.equal(kpi10.variance, -21);
      assert.equal(kpi10.scheduleStatus, SCHEDULE_STATUS.BEHIND);
    });

    test('subscribers are notified when sprint configuration or current day changes', () => {
      let callCount = 0;
      const unsubscribe = dm.subscribe(() => {
        callCount += 1;
      });

      dm.setCurrentDay(1);
      dm.setCurrentDay(2);
      dm.setSprint({ sprintName: 'Updated' });

      assert.equal(callCount, 3);
      unsubscribe();

      dm.setCurrentDay(3);
      assert.equal(callCount, 3, 'Unsubscribed listener must not be called');
    });
  });

  describe('Validation Helpers', () => {
    test('validateSprintConfig handles valid and invalid payloads', () => {
      assert.equal(validateSprintConfig(null).valid, false);
      assert.equal(validateSprintConfig({}).valid, false);
      assert.equal(
        validateSprintConfig({ sprintName: 'Test', durationDays: 10, startDate: '2026-10-01', endDate: '2026-10-10' }).valid,
        true
      );
    });

    test('validateCurrentDay validates boundaries correctly', () => {
      assert.equal(validateCurrentDay(0, 10).valid, true);
      assert.equal(validateCurrentDay(10, 10).valid, true);
      assert.equal(validateCurrentDay(5, 10).valid, true);
      assert.equal(validateCurrentDay(-1, 10).valid, false);
      assert.equal(validateCurrentDay(11, 10).valid, false);
      assert.equal(validateCurrentDay(3.5, 10).valid, false);
      assert.equal(validateCurrentDay('abc', 10).valid, false);
    });
  });
});
