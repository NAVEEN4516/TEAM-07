import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getDefaultDataset } from '../../src/js/data/defaultDataset.js';
import {
  calculateTotalPoints,
  calculateCompletedPoints,
  calculateVariance,
  computeAll,
  idealAt
} from '../../src/js/logic/burndownEngine.js';
import { validateIssue, validateStatusUpdate } from '../../src/js/logic/validationManager.js';

/**
 * Boundary and guard tests for BurndownEngine and ValidationManager
 * (BDC-SR-002, BDC-SR-004, BDC-NF-003; TC-SR-02.1, TC-SR-04.1, TC-SR-04.2).
 *
 * These cover inputs the DataManager normally filters out. The modules are meant
 * to be safe on their own (BDC-NF-005), so each is exercised directly.
 */

/** A fully valid issue to vary one field at a time. */
const validIssue = Object.freeze({
  issueKey: 'PROJ-300',
  summary: 'Boundary guard test',
  issueType: 'Task',
  storyPoints: 3,
  status: 'To Do',
  completedDay: null
});

describe('BurndownEngine boundary guards (BDC-SR-004)', () => {
  test('TC-SR-04.2 - story points that overflow to Infinity give a defined result', () => {
    const huge = [
      { storyPoints: Number.MAX_VALUE, status: 'To Do', completedDay: null },
      { storyPoints: Number.MAX_VALUE, status: 'To Do', completedDay: null }
    ];

    const total = calculateTotalPoints(huge);
    assert.ok(Number.isFinite(total), 'the total must never be Infinity');
    assert.equal(total, 0, 'documented fallback: an unrepresentable total is reported as 0');

    const result = computeAll({ durationDays: 10, currentDay: 4 }, huge);
    for (const field of ['totalPoints', 'completedPoints', 'remainingPoints', 'variance']) {
      assert.ok(Number.isFinite(result[field]), `${field} must stay finite`);
    }
  });

  test('a variance that rounds to negative zero is reported as plain zero', () => {
    const variance = calculateVariance(1, 1.0000000001);

    assert.ok(Object.is(variance, 0), 'negative zero must not leak into the display');
    assert.equal(`${variance}`, '0');
  });

  test('a non-numeric day threshold counts nothing as completed', () => {
    const { issues } = getDefaultDataset();

    for (const day of ['4', NaN, Infinity, null, undefined, {}]) {
      assert.equal(calculateCompletedPoints(issues, day), 0, `threshold ${String(day)} must count no completions`);
    }
  });

  test('a non-numeric day on the ideal line falls back to the start of the sprint', () => {
    for (const day of ['4', NaN, null, undefined]) {
      assert.equal(idealAt(50, day, 10), 50, `day ${String(day)} must read as Day 0`);
    }
  });
});

describe('ValidationManager guards (BDC-NF-003, BDC-SR-002)', () => {
  test('TC-SR-02.1 - non-object issue input is rejected with every required-field error and no exception', () => {
    for (const bad of [null, undefined, 'text', 42, true, []]) {
      let result;
      assert.doesNotThrow(() => {
        result = validateIssue(bad);
      }, `must not throw for ${JSON.stringify(bad)}`);

      assert.equal(result.valid, false);
      assert.ok(result.errors.includes('Issue key is required.'));
      assert.ok(result.errors.includes('Summary is required.'));
      assert.ok(result.errors.includes('Story points must be a non-negative number.'));
    }
  });

  test('TC-F-06.2 - duplicate detection ignores junk entries and understands issue objects', () => {
    const junk = [null, undefined, 5, 'OTHER-1', {}, { issueKey: 7 }];

    assert.equal(validateIssue(validIssue, junk).valid, true, 'unrelated or malformed entries are not duplicates');
    assert.deepEqual(validateIssue(validIssue, [...junk, { issueKey: ' proj-300 ' }]).errors, [
      'An issue with this key already exists.'
    ]);
    assert.deepEqual(validateIssue(validIssue, [...junk, 'PROJ-300']).errors, [
      'An issue with this key already exists.'
    ]);
    assert.equal(validateIssue(validIssue, 'not-a-list').valid, true, 'a non-array key list is treated as empty');
  });

  test('TC-F-07.2 - a Done issue is judged against the Current Day even when the context is missing or unusable', () => {
    const done = { ...validIssue, status: 'Done', completedDay: 2 };

    assert.deepEqual(validateIssue(done).errors, ['No completion day is valid while Current Day is 0.']);
    assert.deepEqual(validateIssue(done, [], null).errors, ['No completion day is valid while Current Day is 0.']);
    assert.deepEqual(validateIssue(done, [], { currentDay: 'x', durationDays: 'x' }).errors, [
      'No completion day is valid while Current Day is 0.'
    ]);
  });

  test('an unusable sprint duration in the context leaves only the Current Day as the limit', () => {
    for (const durationDays of ['x', NaN, null, undefined]) {
      const context = { currentDay: 4, durationDays };

      assert.equal(validateIssue({ ...validIssue, status: 'Done', completedDay: 4 }, [], context).valid, true);
      assert.deepEqual(validateIssue({ ...validIssue, status: 'Done', completedDay: 5 }, [], context).errors, [
        'Completion day must be a whole number between 1 and 4.'
      ]);
    }
  });

  test('validateStatusUpdate treats an unusable Current Day as Day 0 and an unusable duration as unbounded', () => {
    for (const currentDay of [NaN, 'x', 2.5, null, undefined]) {
      assert.deepEqual(validateStatusUpdate('Done', 2, currentDay, 10), {
        valid: false,
        errors: ['No completion day is valid while Current Day is 0.']
      }, `Current Day ${String(currentDay)}`);
    }

    for (const durationDays of ['x', NaN, 0, -3, null]) {
      assert.deepEqual(validateStatusUpdate('Done', 2, 4, durationDays), { valid: true, errors: [] });
      assert.deepEqual(validateStatusUpdate('Done', 5, 4, durationDays), {
        valid: false,
        errors: ['Completion day must be a whole number between 1 and 4.']
      });
    }
  });
});
