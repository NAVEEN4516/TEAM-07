import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DataManager, validateSprintConfig } from '../../src/js/data/dataManager.js';
import { getDefaultDataset } from '../../src/js/data/defaultDataset.js';
import { validateStoredState } from '../../src/js/logic/validationManager.js';

/** A valid issue to vary one field at a time. */
const validIssue = Object.freeze({
  issueKey: 'PROJ-201',
  summary: 'Validation test issue',
  issueType: 'Task',
  storyPoints: 3,
  status: 'To Do',
  completedDay: null
});

describe('DataManager validation & saved state (BDC-NF-003, BDC-SR-002, BDC-SR-003)', () => {
  describe('TC-NF-03.1 - every SRS Section 5.2 invalid case is rejected and nothing is stored', () => {
    const cases = [
      ['negative story points', dm => dm.addIssue({ ...validIssue, storyPoints: -3 })],
      ['non-numeric story points', dm => dm.addIssue({ ...validIssue, storyPoints: 'abc' })],
      ['infinite story points', dm => dm.addIssue({ ...validIssue, storyPoints: Infinity })],
      ['completion day after the Current Day', dm => dm.addIssue({ ...validIssue, status: 'Done', completedDay: 5 })],
      ['completion day after the duration', dm => dm.addIssue({ ...validIssue, status: 'Done', completedDay: 11 })],
      ['empty issue key', dm => dm.addIssue({ ...validIssue, issueKey: '' })],
      ['duplicate issue key', dm => dm.addIssue({ ...validIssue, issueKey: 'PROJ-101' })],
      ['empty summary', dm => dm.addIssue({ ...validIssue, summary: '   ' })],
      ['zero duration', dm => dm.setSprint({ durationDays: 0 })],
      ['negative duration', dm => dm.setSprint({ durationDays: -3 })],
      ['non-numeric duration', dm => dm.setSprint({ durationDays: 'abc' })],
      ['duration beyond 60 days', dm => dm.setSprint({ durationDays: 61 })],
      ['impossible calendar date', dm => dm.setSprint({ startDate: '2026-02-30' })],
      ['Current Day beyond the duration', dm => dm.setCurrentDay(11)],
      ['negative Current Day', dm => dm.setCurrentDay(-1)],
      ['non-numeric Current Day', dm => dm.setCurrentDay('abc')]
    ];

    for (const [label, attempt] of cases) {
      test(`rejects ${label} with a visible message and leaves state unchanged`, () => {
        const dm = new DataManager();
        const before = dm.serialize();
        const result = attempt(dm);

        assert.equal(result.success, false, `${label} must be rejected`);
        const messages = result.errors ?? [result.error];
        assert.ok(messages.length > 0 && messages.every(m => typeof m === 'string' && m.length > 0), 'needs a message to display');
        assert.equal(dm.serialize(), before, `${label} must not change stored state`);
      });
    }

    test('zero story points are allowed, as SRS Section 5.2 requires', () => {
      const dm = new DataManager();
      assert.equal(dm.addIssue({ ...validIssue, storyPoints: 0 }).success, true);
    });

    test('state still passes validation after every invalid attempt', () => {
      const dm = new DataManager();
      for (const [, attempt] of cases) {
        attempt(dm);
      }
      assert.deepEqual(validateStoredState(JSON.parse(dm.serialize())), { valid: true, errors: [] });
    });
  });

  describe('Sprint duration range (BDC-SR-002)', () => {
    test('validateSprintConfig keeps its export and enforces the 60-day ceiling', () => {
      assert.equal(validateSprintConfig({ sprintName: 'S', durationDays: 60 }).valid, true);
      assert.deepEqual(validateSprintConfig({ sprintName: 'S', durationDays: 61 }).errors, [
        'Sprint duration cannot exceed 60 working days.'
      ]);
    });

    test('an oversized duration never reaches the burndown calculation', () => {
      const dm = new DataManager();
      const result = dm.setSprint({ durationDays: 2_000_000 });

      assert.equal(result.success, false);
      assert.equal(dm.getSprint().durationDays, 10);
      assert.equal(dm.getKPIs().ideal.length, 11);
    });

    test('the full 1 to 60 range is accepted', () => {
      const dm = new DataManager();
      assert.equal(dm.setSprint({ durationDays: 60 }).success, true);
      assert.equal(dm.getKPIs().ideal.length, 61);
      assert.equal(dm.setSprint({ durationDays: 1 }).success, true);
    });
  });

  describe('init() validates a supplied dataset (BDC-SR-003)', () => {
    test('a valid dataset is loaded as given', () => {
      const dataset = getDefaultDataset();
      dataset.sprint.sprintName = 'Restored Sprint';
      dataset.issues = dataset.issues.slice(0, 3);

      const dm = new DataManager(dataset);
      assert.deepEqual(dm.loadErrors, []);
      assert.equal(dm.getSprint().sprintName, 'Restored Sprint');
      assert.equal(dm.getIssues().length, 3);
      assert.equal(dm.getSprint().totalStoryPoints, 16);
    });

    test('an invalid dataset is replaced by the default dataset', () => {
      const dm = new DataManager({ sprint: { durationDays: -5, currentDay: 'x' }, issues: [{ storyPoints: -10 }] });

      assert.deepEqual(dm.getSprint(), getDefaultDataset().sprint);
      assert.deepEqual(dm.getIssues(), getDefaultDataset().issues);
      assert.ok(dm.loadErrors.length > 0, 'the reasons are kept for display');
    });

    test('a missing part falls back to the default for that part', () => {
      const issues = getDefaultDataset().issues.slice(0, 2);
      const dm = new DataManager({ issues });
      assert.equal(dm.getIssues().length, 2);
      assert.equal(dm.getSprint().sprintName, 'Sprint 1 - Core Features');
    });

    test('no argument and reset() still load the defaults with no errors', () => {
      const dm = new DataManager();
      assert.deepEqual(dm.loadErrors, []);
      dm.setCurrentDay(7);
      dm.reset();
      assert.deepEqual(dm.loadErrors, []);
      assert.equal(dm.getCurrentDay(), 4);
    });
  });

  describe('restoreFromJSON() - TC-SR-03.1 safe recovery from corrupted storage', () => {
    test('malformed JSON restores the default dataset without throwing', () => {
      const dm = new DataManager();
      dm.setCurrentDay(9);

      let result;
      assert.doesNotThrow(() => {
        result = dm.restoreFromJSON('{"sprint": {');
      });
      assert.deepEqual(result, { success: false, errors: ['Saved data is not valid JSON.'] });
      assert.deepEqual(JSON.parse(dm.serialize()), getDefaultDataset());
      assert.deepEqual(dm.loadErrors, ['Saved data is not valid JSON.']);
    });

    test('valid JSON with schema violations restores the default dataset', () => {
      const tampered = getDefaultDataset();
      tampered.issues[0].storyPoints = -50;
      tampered.sprint.durationDays = 999;

      const dm = new DataManager();
      const result = dm.restoreFromJSON(JSON.stringify(tampered));

      assert.equal(result.success, false);
      assert.ok(result.errors.length >= 2);
      assert.deepEqual(JSON.parse(dm.serialize()), getDefaultDataset());
    });

    test('empty storage restores the default dataset', () => {
      const dm = new DataManager();
      assert.deepEqual(dm.restoreFromJSON(null), { success: false, errors: ['No saved data was found.'] });
      assert.deepEqual(JSON.parse(dm.serialize()), getDefaultDataset());
    });

    test('valid saved state is loaded and subscribers are notified', () => {
      const saved = getDefaultDataset();
      saved.sprint.currentDay = 7;

      const dm = new DataManager();
      let notified = 0;
      dm.subscribe(() => {
        notified += 1;
      });

      assert.deepEqual(dm.restoreFromJSON(JSON.stringify(saved)), { success: true, errors: [] });
      assert.equal(dm.getCurrentDay(), 7);
      assert.deepEqual(dm.loadErrors, []);
      assert.equal(notified, 1);
    });
  });

  describe('serialize() round-trips every state the app can reach', () => {
    test('a realistic session survives save and reload unchanged', () => {
      const dm = new DataManager();
      assert.equal(dm.addIssue({ ...validIssue, issueKey: 'PROJ-111', storyPoints: 5 }).success, true);
      assert.equal(dm.addIssue({ ...validIssue, issueKey: 'PROJ-112', status: 'Done', completedDay: 2 }).success, true);
      assert.equal(dm.setSprint({ sprintName: 'Sprint 2', startDate: '2026-10-26', endDate: '2026-11-06' }).success, true);

      const saved = dm.serialize();
      const reloaded = new DataManager();
      assert.equal(reloaded.restoreFromJSON(saved).success, true);
      assert.equal(reloaded.serialize(), saved);
    });

    test('moving the Current Day back keeps later completion days through a reload', () => {
      const dm = new DataManager();
      assert.equal(dm.setCurrentDay(2).success, true);

      const reloaded = new DataManager();
      assert.equal(reloaded.restoreFromJSON(dm.serialize()).success, true, 'rewinding the day must not lose data');
      assert.equal(reloaded.getKPIs().completedPoints, dm.getKPIs().completedPoints);
    });

    test('shortening the sprint keeps completion history through a reload', () => {
      const dm = new DataManager();
      assert.equal(dm.setSprint({ durationDays: 3 }).success, true);
      assert.ok(dm.getIssues().some(issue => issue.completedDay > 3), 'history beyond the new duration is kept');

      const reloaded = new DataManager();
      assert.equal(reloaded.restoreFromJSON(dm.serialize()).success, true, 'shortening must not lose data');
      assert.equal(reloaded.serialize(), dm.serialize());
    });

    test('an empty backlog survives a reload', () => {
      const dataset = getDefaultDataset();
      dataset.issues = [];
      const dm = new DataManager(dataset);

      const reloaded = new DataManager();
      assert.equal(reloaded.restoreFromJSON(dm.serialize()).success, true);
      assert.equal(reloaded.getIssues().length, 0);
    });
  });
});
