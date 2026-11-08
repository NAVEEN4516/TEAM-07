import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { DataManager } from '../../src/js/data/dataManager.js';
import { getDefaultDataset, deepClone, deepFreeze } from '../../src/js/data/defaultDataset.js';
import { snapshot, assertLayersConsistent, makeIssue, recordNotifications } from '../integration/pipelineHelpers.js';

/**
 * Data-layer limits and fallbacks (BDC-SR-002, BDC-SR-004, BDC-NF-003, BDC-F-009).
 */

/**
 * Asserts that every number nested anywhere in a value is finite.
 *
 * @param {unknown} value - Value to walk
 * @param {string} path - Location used in failure messages
 */
function assertAllNumbersFinite(value, path) {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `${path} must be finite, got ${value}`);
  } else if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      assertAllNumbersFinite(child, `${path}.${key}`);
    }
  }
}

describe('Aggregate story-point limit (BDC-SR-002, TC-SR-02.1)', () => {
  const HEADROOM = Number.MAX_SAFE_INTEGER - 50;

  test('a single issue whose points push the total past the safe-integer range is rejected', () => {
    const dm = new DataManager();
    const before = snapshot(dm);
    const notifications = recordNotifications(dm);

    const result = dm.addIssue(makeIssue('HUGE-1', Number.MAX_SAFE_INTEGER));

    assert.equal(result.success, false);
    assert.deepEqual(result.errors, ['Story points must be a non-negative number.']);
    assert.equal(notifications.count(), 0);
    assert.deepEqual(snapshot(dm), before);
  });

  test('the largest total that still fits is accepted and every layer stays finite; one more point is rejected', () => {
    const dm = new DataManager();

    assert.equal(dm.addIssue(makeIssue('BIG-1', HEADROOM)).success, true);
    assert.equal(dm.getSprint().totalStoryPoints, Number.MAX_SAFE_INTEGER);
    assertAllNumbersFinite(dm.getKPIs(), 'KPIs');

    const before = snapshot(dm);
    const result = dm.addIssue(makeIssue('BIG-2', 1));

    assert.equal(result.success, false);
    assert.deepEqual(snapshot(dm), before, 'the rejected issue must change nothing');
  });
});

describe('Cloning without structuredClone (BDC-F-009, BDC-NF-004)', () => {
  const nativeStructuredClone = globalThis.structuredClone;

  afterEach(() => {
    globalThis.structuredClone = nativeStructuredClone;
  });

  test('every DataManager operation still works and isolates its copies when structuredClone is unavailable', () => {
    globalThis.structuredClone = undefined;
    const dm = new DataManager();
    const before = snapshot(dm);

    dm.addIssue(makeIssue('PROJ-111', 5));
    dm.updateIssue('PROJ-106', { status: 'Done', completedDay: 4 });
    dm.deleteIssue('PROJ-110');
    dm.setCurrentDay(6);
    assertLayersConsistent(snapshot(dm), 'edited without structuredClone');

    const issues = dm.getIssues();
    issues[0].storyPoints = 999;
    assert.equal(dm.getIssues()[0].storyPoints, 5, 'returned copies must stay isolated');

    dm.reset();
    assert.deepEqual(snapshot(dm), before, 'Reset must restore the exact defaults');
    assert.equal(dm.restoreFromJSON(dm.serialize()).success, true);
  });

  test('the fallback clones the default dataset exactly and independently', () => {
    globalThis.structuredClone = undefined;
    const original = getDefaultDataset();
    const copy = deepClone(original);

    assert.deepEqual(copy, original);
    assert.notEqual(copy.issues, original.issues);
    assert.notEqual(copy.issues[0], original.issues[0]);
    copy.issues[0].storyPoints = 999;
    assert.equal(original.issues[0].storyPoints, 5);
  });

  /** A value covering every branch of the fallback: dates, patterns, arrays, symbol keys and a function. */
  function makeAwkwardValue() {
    const marker = Symbol('marker');
    return {
      marker,
      value: {
        handler: () => 'ok',
        when: new Date('2026-11-08T10:00:00Z'),
        pattern: /^PROJ-\d+$/gi,
        list: [1, { nested: [2, 3] }],
        [marker]: { tagged: true }
      }
    };
  }

  /** Asserts the copy has equal content, no shared objects, and the same function. */
  function assertIndependentCopy(copy, original, marker) {
    assert.notEqual(copy, original);
    assert.equal(copy.handler, original.handler, 'functions pass through by reference');
    assert.ok(copy.when instanceof Date && copy.when !== original.when);
    assert.equal(copy.when.getTime(), original.when.getTime());
    assert.ok(copy.pattern instanceof RegExp && copy.pattern !== original.pattern);
    assert.equal(copy.pattern.source, '^PROJ-\\d+$');
    assert.equal(copy.pattern.flags, 'gi');
    assert.deepEqual(copy.list, [1, { nested: [2, 3] }]);
    assert.notEqual(copy.list, original.list);
    assert.notEqual(copy.list[1], original.list[1]);
    assert.deepEqual(copy[marker], { tagged: true });
    assert.notEqual(copy[marker], original[marker]);
  }

  test('a function inside the data forces the fallback even when structuredClone exists', () => {
    // structuredClone throws a DataCloneError for functions, so deepClone must recover by copying key by key.
    const { marker, value } = makeAwkwardValue();

    assertIndependentCopy(deepClone(value), value, marker);
  });

  test('without structuredClone the fallback copies dates, patterns, arrays and symbol keys itself', () => {
    globalThis.structuredClone = undefined;
    const { marker, value } = makeAwkwardValue();

    assertIndependentCopy(deepClone(value), value, marker);
  });
});

describe('deepFreeze edge cases (BDC-F-004)', () => {
  test('primitives and null are returned unchanged', () => {
    for (const value of [5, 'text', true, null, undefined]) {
      assert.equal(deepFreeze(value), value);
    }
  });

  test('both halves of an accessor property are frozen without being invoked', () => {
    let invoked = false;
    const target = {
      get value() {
        invoked = true;
        return 1;
      },
      set value(next) {
        invoked = true;
      }
    };

    deepFreeze(target);
    const descriptor = Object.getOwnPropertyDescriptor(target, 'value');

    assert.equal(invoked, false);
    assert.ok(Object.isFrozen(descriptor.get));
    assert.ok(Object.isFrozen(descriptor.set));
  });
});
