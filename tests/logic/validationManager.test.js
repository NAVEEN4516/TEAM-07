import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getDefaultDataset } from '../../src/js/data/defaultDataset.js';
import {
  MIN_SPRINT_DAYS,
  MAX_SPRINT_DAYS,
  validateSprint,
  validateCurrentDay,
  validateStatusUpdate,
  validateStoredState,
  sanitizeStoredState,
  parseStoredState
} from '../../src/js/logic/validationManager.js';

/** A valid sprint configuration to vary one field at a time. */
const validSprint = Object.freeze({
  sprintName: 'Sprint 2',
  durationDays: 10,
  startDate: '2026-10-26',
  endDate: '2026-11-06'
});

describe('ValidationManager - Sprint 2 (BDC-NF-003, BDC-SR-002, BDC-SR-003)', () => {
  describe('validateSprint (BDC-F-001, BDC-SR-002)', () => {
    test('accepts a valid configuration', () => {
      assert.deepEqual(validateSprint(validSprint), { valid: true, errors: [] });
    });

    test('accepts the default dataset sprint', () => {
      assert.equal(validateSprint(getDefaultDataset().sprint).valid, true);
    });

    test('rejects non-object configurations', () => {
      for (const bad of [null, undefined, 42, 'sprint', []]) {
        const result = validateSprint(bad);
        assert.equal(result.valid, false, `must reject ${JSON.stringify(bad)}`);
        assert.deepEqual(result.errors, ['Configuration must be a valid object.']);
      }
    });

    test('rejects an empty or missing sprint name', () => {
      for (const sprintName of ['', '   ', undefined, 42]) {
        const result = validateSprint({ ...validSprint, sprintName });
        assert.equal(result.valid, false);
        assert.ok(result.errors.includes('Sprint name is required and cannot be empty.'));
      }
    });

    test('TC-SR-02.1 - rejects zero, negative, fractional, non-numeric and non-finite durations', () => {
      for (const durationDays of [0, -1, -3, 2.5, 'abc', '10', NaN, Infinity, -Infinity, null]) {
        const result = validateSprint({ ...validSprint, durationDays });
        assert.equal(result.valid, false, `must reject duration ${String(durationDays)}`);
        assert.ok(result.errors.includes('Sprint duration must be a positive integer greater than 0.'));
      }
    });

    test('enforces the 1 to 60 working-day range the configuration form advertises', () => {
      assert.equal(MIN_SPRINT_DAYS, 1);
      assert.equal(MAX_SPRINT_DAYS, 60);
      assert.equal(validateSprint({ ...validSprint, durationDays: 1 }).valid, true);
      assert.equal(validateSprint({ ...validSprint, durationDays: 60 }).valid, true);

      for (const durationDays of [61, 365, 2_000_000, Number.MAX_SAFE_INTEGER]) {
        const result = validateSprint({ ...validSprint, durationDays });
        assert.equal(result.valid, false, `must reject duration ${durationDays}`);
        assert.deepEqual(result.errors, ['Sprint duration cannot exceed 60 working days.']);
      }
    });

    test('TC-F-01.3 - rejects an end date before the start date', () => {
      const result = validateSprint({ ...validSprint, startDate: '2026-10-30', endDate: '2026-10-26' });
      assert.equal(result.valid, false);
      assert.deepEqual(result.errors, ['Sprint end date must follow or equal start date.']);
    });

    test('accepts a one-day sprint whose end equals its start', () => {
      assert.equal(validateSprint({ ...validSprint, startDate: '2026-10-26', endDate: '2026-10-26' }).valid, true);
    });

    test('rejects impossible calendar dates instead of rolling them forward', () => {
      for (const startDate of ['2026-02-30', '2026-02-29', '2026-04-31', '2026-13-01', '2026-00-10', '2026-10-32']) {
        const result = validateSprint({ ...validSprint, startDate, endDate: '2026-12-31' });
        assert.equal(result.valid, false, `must reject ${startDate}`);
        assert.ok(result.errors.includes('Sprint start date is invalid.'));
      }
      // 2028 is a leap year, so 29 February is real.
      assert.equal(validateSprint({ ...validSprint, startDate: '2028-02-29', endDate: '2028-03-10' }).valid, true);
    });

    test('rejects dates that are not YYYY-MM-DD strings', () => {
      for (const endDate of [null, '', 'Oct 30 2026', '30/10/2026', '2026-10-30T00:00:00Z', 20261030]) {
        const result = validateSprint({ ...validSprint, endDate });
        assert.equal(result.valid, false, `must reject ${JSON.stringify(endDate)}`);
        assert.ok(result.errors.includes('Sprint end date is invalid.'));
      }
    });

    test('dates are optional when both are omitted', () => {
      assert.equal(validateSprint({ sprintName: 'No dates', durationDays: 5 }).valid, true);
    });

    test('reports every problem at once so the form can list them all', () => {
      const result = validateSprint({ sprintName: '', durationDays: 0, startDate: 'x', endDate: 'y' });
      assert.equal(result.errors.length, 4);
    });
  });

  describe('validateCurrentDay (BDC-F-003, BDC-SR-002)', () => {
    test('accepts every day from 0 to the duration', () => {
      for (let day = 0; day <= 10; day += 1) {
        assert.deepEqual(validateCurrentDay(day, 10), { valid: true, errors: [] }, `day ${day}`);
      }
    });

    test('day 0 is valid, per SRS Appendix C (0 to durationDays)', () => {
      assert.equal(validateCurrentDay(0, 10).valid, true);
    });

    test('TC-F-03.2 / TC-SR-02.1 - rejects 11, -1, "abc", fractions and non-finite values', () => {
      const cases = [
        [11, 'Current Day (11) cannot exceed sprint duration (10).'],
        [-1, 'Current Day cannot be negative (must be >= 0).'],
        ['abc', 'Current Day must be a finite number.'],
        ['4', 'Current Day must be a finite number.'],
        [NaN, 'Current Day must be a finite number.'],
        [Infinity, 'Current Day must be a finite number.'],
        [3.5, 'Current Day must be an integer.']
      ];
      for (const [day, message] of cases) {
        assert.deepEqual(validateCurrentDay(day, 10), { valid: false, errors: [message] }, `day ${String(day)}`);
      }
    });
  });

  describe('validateStatusUpdate (BDC-F-007, SRS Section 5.2)', () => {
    test('accepts Done with a completion day up to the Current Day', () => {
      for (let day = 1; day <= 4; day += 1) {
        assert.deepEqual(validateStatusUpdate('Done', day, 4, 10), { valid: true, errors: [] }, `day ${day}`);
      }
    });

    test('TC-F-07.2 - rejects a completion day after the Current Day', () => {
      assert.deepEqual(validateStatusUpdate('Done', 5, 4, 10), {
        valid: false,
        errors: ['Completion day must be a whole number between 1 and 4.']
      });
    });

    test('TC-F-07.2 - rejects a completion day after the sprint duration', () => {
      assert.deepEqual(validateStatusUpdate('Done', 11, 10, 10), {
        valid: false,
        errors: ['Completion day must be a whole number between 1 and 10.']
      });
    });

    test('rejects zero, negative, fractional, string and missing completion days', () => {
      for (const completedDay of [0, -1, 2.5, '3', 'abc', null, undefined, NaN, Infinity]) {
        const result = validateStatusUpdate('Done', completedDay, 4, 10);
        assert.equal(result.valid, false, `must reject completion day ${String(completedDay)}`);
      }
    });

    test('rejects any completion while the Current Day is 0', () => {
      assert.deepEqual(validateStatusUpdate('Done', 1, 0, 10), {
        valid: false,
        errors: ['No completion day is valid while Current Day is 0.']
      });
    });

    test('TC-F-07.3 - moving out of Done needs no completion day', () => {
      for (const status of ['To Do', 'In Progress']) {
        assert.deepEqual(validateStatusUpdate(status, null, 4, 10), { valid: true, errors: [] });
        // The caller clears the stored day, so a leftover value is not an error.
        assert.deepEqual(validateStatusUpdate(status, 3, 4, 10), { valid: true, errors: [] });
      }
    });

    test('rejects unknown statuses', () => {
      for (const status of ['done', 'Closed', '', null, undefined]) {
        assert.deepEqual(validateStatusUpdate(status, 2, 4, 10), {
          valid: false,
          errors: ['Status must be To Do, In Progress or Done.']
        });
      }
    });
  });

  describe('validateStoredState / sanitizeStoredState (BDC-SR-003)', () => {
    test('accepts the default dataset', () => {
      assert.deepEqual(validateStoredState(getDefaultDataset()), { valid: true, errors: [] });
    });

    test('accepts an empty backlog, which deleting every issue produces', () => {
      const { sprint } = getDefaultDataset();
      assert.equal(validateStoredState({ sprint, issues: [] }).valid, true);
    });

    test('rejects a missing or malformed top-level structure', () => {
      const { sprint, issues } = getDefaultDataset();
      for (const bad of [null, 'text', 42, [], {}, { sprint }, { issues }, { sprint: [], issues }, { sprint, issues: {} }]) {
        assert.equal(validateStoredState(bad).valid, false, `must reject ${JSON.stringify(bad)}`);
      }
    });

    test('rejects an invalid saved sprint', () => {
      const { sprint, issues } = getDefaultDataset();
      for (const change of [{ durationDays: 0 }, { durationDays: 61 }, { sprintName: '' }, { currentDay: 11 }, { currentDay: -1 }, { currentDay: '4' }]) {
        const result = validateStoredState({ sprint: { ...sprint, ...change }, issues });
        assert.equal(result.valid, false, `must reject sprint change ${JSON.stringify(change)}`);
        assert.ok(result.errors.every(e => e.startsWith('Saved sprint: ')));
      }
    });

    test('rejects saved issues that break the issue rules', () => {
      const { sprint, issues } = getDefaultDataset();
      const breakages = [
        { storyPoints: -3 },
        { storyPoints: 'abc' },
        { storyPoints: '5' },
        { summary: '' },
        { issueKey: '' },
        { issueType: 'Epic' },
        { status: 'Closed' },
        { status: 'Done', completedDay: null },
        { status: 'Done', completedDay: '2' },
        { status: 'Done', completedDay: 0 },
        { status: 'Done', completedDay: 61 },
        { status: 'To Do', completedDay: 3 }
      ];
      for (const change of breakages) {
        const tampered = issues.map((issue, i) => (i === 0 ? { ...issue, ...change } : issue));
        const result = validateStoredState({ sprint, issues: tampered });
        assert.equal(result.valid, false, `must reject issue change ${JSON.stringify(change)}`);
        assert.ok(result.errors.some(e => e.startsWith('Saved issue 1')), JSON.stringify(result.errors));
      }
    });

    test('rejects duplicate issue keys, ignoring case', () => {
      const { sprint, issues } = getDefaultDataset();
      const duplicated = [...issues, { ...issues[0], issueKey: 'proj-101' }];
      const result = validateStoredState({ sprint, issues: duplicated });
      assert.equal(result.valid, false);
      assert.ok(result.errors.includes('Saved issue 11: An issue with this key already exists.'));
    });

    test('rejects a non-object entry in the issue list', () => {
      const { sprint, issues } = getDefaultDataset();
      const result = validateStoredState({ sprint, issues: [...issues, null] });
      assert.deepEqual(result.errors, ['Saved issue 11 is malformed.']);
    });

    test('keeps completion days after the saved Current Day (moving the day back is normal)', () => {
      const { sprint, issues } = getDefaultDataset();
      // The default backlog completes work on days 3 and 4; rewinding to day 2 must not discard it.
      assert.equal(validateStoredState({ sprint: { ...sprint, currentDay: 2 }, issues }).valid, true);
    });

    test('keeps completion days after a shortened duration (history is preserved)', () => {
      const { sprint, issues } = getDefaultDataset();
      assert.equal(validateStoredState({ sprint: { ...sprint, durationDays: 3, currentDay: 3 }, issues }).valid, true);
    });

    test('the clean copy holds only SRS Appendix C fields and recomputes the total', () => {
      const { sprint, issues } = getDefaultDataset();
      const tampered = {
        sprint: { ...sprint, totalStoryPoints: 9999, injected: '<script>' },
        issues: issues.map(issue => ({ ...issue, extra: 'drop me' })),
        unrelated: true
      };
      const { valid, state } = sanitizeStoredState(tampered);

      assert.equal(valid, true);
      assert.equal(state.sprint.totalStoryPoints, 50);
      assert.deepEqual(Object.keys(state.sprint).sort(), ['currentDay', 'durationDays', 'endDate', 'sprintName', 'startDate', 'totalStoryPoints']);
      for (const issue of state.issues) {
        assert.deepEqual(Object.keys(issue).sort(), ['completedDay', 'issueKey', 'issueType', 'status', 'storyPoints', 'summary']);
      }
      assert.deepEqual(Object.keys(state).sort(), ['issues', 'sprint']);
    });

    test('the clean copy does not share references with the input', () => {
      const input = getDefaultDataset();
      const { state } = sanitizeStoredState(input);
      state.issues[0].storyPoints = 999;
      state.sprint.sprintName = 'changed';
      assert.equal(input.issues[0].storyPoints, 5);
      assert.equal(input.sprint.sprintName, 'Sprint 1 - Core Features');
    });

    test('a failed check returns no state', () => {
      assert.deepEqual(sanitizeStoredState(null).state, null);
    });
  });

  describe('parseStoredState (BDC-SR-003, TC-SR-03.1)', () => {
    test('round-trips a serialized default dataset', () => {
      const raw = JSON.stringify(getDefaultDataset());
      const { valid, errors, state } = parseStoredState(raw);
      assert.equal(valid, true);
      assert.deepEqual(errors, []);
      assert.deepEqual(state, getDefaultDataset());
    });

    test('TC-SR-03.1 - malformed JSON fails without throwing', () => {
      for (const raw of ['{', '{"sprint":', 'undefined', 'NaN', "{'sprint': 1}", '\u0000', '<html>']) {
        let result;
        assert.doesNotThrow(() => {
          result = parseStoredState(raw);
        }, `must not throw for ${JSON.stringify(raw)}`);
        assert.equal(result.valid, false);
        assert.deepEqual(result.errors, ['Saved data is not valid JSON.']);
        assert.equal(result.state, null);
      }
    });

    test('TC-SR-03.1 - valid JSON with schema violations fails without throwing', () => {
      for (const raw of ['null', 'true', '42', '"text"', '[]', '{}', '{"sprint":{},"issues":[]}']) {
        const result = parseStoredState(raw);
        assert.equal(result.valid, false, `must reject ${raw}`);
        assert.equal(result.state, null);
      }
    });

    test('empty and non-string input reports that nothing was saved', () => {
      for (const raw of [null, undefined, '', '   ', 42, {}]) {
        assert.deepEqual(parseStoredState(raw), { valid: false, errors: ['No saved data was found.'], state: null });
      }
    });

    test('a __proto__ key in saved JSON cannot pollute object prototypes', () => {
      const { sprint, issues } = getDefaultDataset();
      const raw = JSON.stringify({ sprint, issues }).replace('{"sprint"', '{"__proto__":{"polluted":true},"sprint"');
      const { valid, state } = parseStoredState(raw);
      assert.equal(valid, true);
      assert.equal(Object.prototype.polluted, undefined);
      assert.equal(state.polluted, undefined);
    });
  });
});
