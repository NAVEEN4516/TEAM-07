import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DataManager } from '../../src/js/data/dataManager.js';
import { getDefaultDataset } from '../../src/js/data/defaultDataset.js';

describe('BDC-F-007/008/009: Sprint 2 workflow and recovery', () => {
  test('Done updates publish once, refresh KPIs and return isolated copies', () => {
    const dm = new DataManager();
    let calls = 0;
    dm.subscribe(() => calls++);
    const result = dm.updateIssue('PROJ-106', { status: 'Done', completedDay: 4 });
    assert.equal(result.success, true);
    assert.equal(calls, 1);
    assert.equal(dm.getKPIs().completedPoints, 32);
    assert.equal(dm.getKPIs().remainingPoints, 18);
    result.issue.status = 'To Do';
    assert.equal(dm.getIssues()[5].status, 'Done');
  });
  for (const status of ['To Do', 'In Progress']) {
    test(`reopening to ${status} clears completion history`, () => {
      const dm = new DataManager();
      assert.equal(dm.updateIssue('PROJ-101', { status, completedDay: 99 }).success, true);
      assert.equal(dm.getIssues()[0].completedDay, null);
      assert.equal(dm.getKPIs().completedPoints, 24);
      assert.equal(dm.updateIssue('PROJ-101', { status: 'Done' }).success, false);
    });
  }
  for (const completedDay of [null, '', '4', 0, -1, 11, 1.5, NaN, Infinity]) {
    test(`rejects completion day ${String(completedDay)} without publishing or mutating`, () => {
      const dm = new DataManager();
      const before = dm.getIssues();
      let calls = 0;
      dm.subscribe(() => calls++);
      assert.equal(dm.updateIssue('PROJ-106', { status: 'Done', completedDay }).success, false);
      assert.deepEqual(dm.getIssues(), before);
      assert.equal(calls, 0);
    });
  }
  test('TC-F-07.2: future completion is rejected atomically at Current Day 4', () => {
    const dm = new DataManager();
    const before = dm.serialize();
    let calls = 0;
    dm.subscribe(() => calls++);
    for (const completedDay of [5, 10]) {
      const result = dm.updateIssue('PROJ-107', { status: 'Done', completedDay });
      assert.equal(result.success, false);
      assert.deepEqual(result.errors, ['Completion day must be a whole number between 1 and 4.']);
      assert.equal(dm.serialize(), before);
    }
    assert.equal(calls, 0);
    assert.equal(dm.getKPIs().completedPoints, 29);
  });
  test('completion is valid once that day is reached and survives rewinding', () => {
    const dm = new DataManager();
    dm.setCurrentDay(10);
    assert.equal(dm.updateIssue('PROJ-106', { status: 'Done', completedDay: 10 }).success, true);
    assert.equal(dm.getKPIs().completedPoints, 32);
    dm.setCurrentDay(4);
    const restored = new DataManager();
    assert.equal(restored.restoreFromJSON(dm.serialize()).success, true);
    assert.equal(restored.getIssues()[5].completedDay, 10);
    assert.equal(restored.getKPIs().completedPoints, 29);
  });
  test('Day 0 rejects Done but allows reopening without a completion day', () => {
    const dm = new DataManager();
    dm.setCurrentDay(0);
    const before = dm.serialize();
    const result = dm.updateIssue('PROJ-106', { status: 'Done', completedDay: 1 });
    assert.equal(result.success, false);
    assert.deepEqual(result.errors, ['No completion day is valid while Current Day is 0.']);
    assert.equal(dm.serialize(), before);
    assert.equal(dm.updateIssue('PROJ-101', { status: 'To Do' }).success, true);
    assert.equal(dm.getIssues()[0].completedDay, null);
  });
  test('rejects unknown issues, invalid workflow and malformed changes', () => {
    const dm = new DataManager();
    const before = dm.getIssues();
    for (const changes of [null, [], 3, { status: 'Closed' }]) {
      assert.equal(dm.updateIssue('PROJ-101', changes).success, false);
    }
    assert.equal(dm.updateIssue('missing', { status: 'Done', completedDay: 1 }).success, false);
    assert.equal(dm.deleteIssue('missing').success, false);
    assert.deepEqual(dm.getIssues(), before);
  });
  test('deleting completed and incomplete issues recalculates scope and notifies once each', () => {
    const dm = new DataManager();
    let calls = 0;
    dm.subscribe(() => calls++);
    dm.deleteIssue('PROJ-101');
    assert.equal(dm.getSprint().totalStoryPoints, 45);
    assert.equal(dm.getKPIs().completedPoints, 24);
    assert.equal(dm.getKPIs().remainingPoints, 21);
    dm.deleteIssue('PROJ-110');
    assert.equal(dm.getKPIs().remainingPoints, 16);
    assert.equal(calls, 2);
  });
  test('empty backlog is finite and reset restores exact canonical dataset', () => {
    const dm = new DataManager();
    for (const issue of dm.getIssues()) dm.deleteIssue(issue.issueKey);
    const metrics = dm.getKPIs();
    for (const field of ['totalPoints', 'completedPoints', 'remainingPoints', 'variance']) assert.equal(metrics[field], 0);
    assert.ok(metrics.ideal.every(point => point.value === 0));
    assert.ok(metrics.actual.every(point => point.value === 0 || point.value === null));
    dm.setSprint({ sprintName: 'Changed', durationDays: 1 });
    dm.setCurrentDay(0);
    dm.reset();
    assert.deepEqual({ sprint: dm.getSprint(), issues: dm.getIssues() }, getDefaultDataset());
  });
  test('single-day zero-point sprint supports boundary days and rejects zero duration', () => {
    const dataset = getDefaultDataset();
    dataset.sprint.durationDays = 1;
    dataset.sprint.currentDay = 0;
    dataset.issues = [{ ...dataset.issues[0], storyPoints: 0, status: 'To Do', completedDay: null }];
    const dm = new DataManager(dataset);
    dm.setCurrentDay(1);
    assert.equal(dm.updateIssue('PROJ-101', { status: 'Done', completedDay: 1 }).success, true);
    assert.equal(dm.getKPIs().remainingPoints, 0);
    assert.equal(dm.getKPIs().variance, 0);
    assert.equal(dm.setSprint({ durationDays: 0 }).success, false);
    assert.equal(dm.getSprint().durationDays, 1);
  });
});
