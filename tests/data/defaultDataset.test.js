import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import defaultGetter, {
  getDefaultDataset,
  getDefaultSprint,
  getDefaultIssues,
  deepFreeze,
  deepClone,
  DEFAULT_DATASET,
  DEFAULT_SPRINT,
  DEFAULT_ISSUES
} from '../../src/js/data/defaultDataset.js';

describe('R1: Default Simulated Jira Dataset (defaultDataset.js)', () => {
  describe('Import Styles & Exports', () => {
    test('supports default export and named export interchangeably', () => {
      assert.equal(typeof defaultGetter, 'function');
      assert.equal(typeof getDefaultDataset, 'function');
      assert.deepEqual(defaultGetter(), getDefaultDataset());
    });

    test('exports DEFAULT_DATASET, DEFAULT_SPRINT, and DEFAULT_ISSUES constants', () => {
      assert.ok(DEFAULT_DATASET);
      assert.ok(DEFAULT_SPRINT);
      assert.ok(Array.isArray(DEFAULT_ISSUES));
    });

    test('exports deepClone and deepFreeze helper utilities', () => {
      assert.equal(typeof deepClone, 'function');
      assert.equal(typeof deepFreeze, 'function');
    });
  });

  describe('Sprint Metadata', () => {
    test('contains required sprint properties per SRS Appendix A', () => {
      const data = getDefaultDataset();
      assert.ok(data.sprint, 'Sprint object should exist');
      assert.equal(data.sprint.name, 'Sprint 1 - Core Features');
      assert.equal(data.sprint.duration, 10);
      assert.equal(data.sprint.currentDay, 4);
      assert.equal(data.sprint.totalCommittedPoints, 50);

      // Verify compatibility aliases
      assert.equal(data.sprint.sprintName, 'Sprint 1 - Core Features');
      assert.equal(data.sprint.durationDays, 10);
      assert.equal(data.sprint.totalStoryPoints, 50);
    });
  });

  describe('Issue Collection & Schema', () => {
    test('contains exactly 10 issues with keys PROJ-101 through PROJ-110', () => {
      const data = getDefaultDataset();
      assert.equal(data.issues.length, 10, 'Expected exactly 10 issues');

      const expectedKeys = [
        'PROJ-101', 'PROJ-102', 'PROJ-103', 'PROJ-104', 'PROJ-105',
        'PROJ-106', 'PROJ-107', 'PROJ-108', 'PROJ-109', 'PROJ-110'
      ];
      const actualKeys = data.issues.map(i => i.key);
      assert.deepEqual(actualKeys, expectedKeys, 'Issue keys must match PROJ-101 through PROJ-110 in sequence');
    });

    test('each issue has all required fields with valid types', () => {
      const data = getDefaultDataset();
      const validTypes = new Set(['Story', 'Task', 'Bug']);
      const validStatuses = new Set(['To Do', 'In Progress', 'Done']);

      for (const issue of data.issues) {
        assert.ok(issue.key && typeof issue.key === 'string', `Invalid key on ${JSON.stringify(issue)}`);
        assert.ok(issue.summary && typeof issue.summary === 'string', `Invalid summary on ${issue.key}`);
        assert.ok(validTypes.has(issue.issueType), `Invalid issueType on ${issue.key}: ${issue.issueType}`);
        assert.ok(typeof issue.storyPoints === 'number' && issue.storyPoints >= 0, `Invalid storyPoints on ${issue.key}`);
        assert.ok(validStatuses.has(issue.status), `Invalid status on ${issue.key}: ${issue.status}`);

        if (issue.status === 'Done') {
          assert.ok(
            typeof issue.completionDay === 'number' && [1, 2, 3, 4].includes(issue.completionDay),
            `Done issue ${issue.key} must have completionDay in [1, 2, 3, 4], got: ${issue.completionDay}`
          );
        } else {
          assert.equal(
            issue.completionDay,
            null,
            `Non-done issue ${issue.key} must have completionDay set to null, got: ${issue.completionDay}`
          );
        }

        // Aliases
        assert.equal(issue.issueKey, issue.key);
        assert.equal(issue.completedDay, issue.completionDay);
        assert.equal(issue.type, issue.issueType);
      }
    });

    test('individual issue values match SRS Appendix A Table 11 exactly', () => {
      const data = getDefaultDataset();
      const expectedIssues = [
        { key: 'PROJ-101', summary: 'User Authentication & Session Token Service', type: 'Story', points: 5, status: 'Done', day: 1 },
        { key: 'PROJ-102', summary: 'Database Schema Migration for User Profiles', type: 'Task', points: 3, status: 'Done', day: 2 },
        { key: 'PROJ-103', summary: 'REST API Endpoint for Sprint Backlog Query', type: 'Story', points: 8, status: 'Done', day: 3 },
        { key: 'PROJ-104', summary: 'Implement JWT Refresh Token Expiry Logic', type: 'Task', points: 5, status: 'Done', day: 4 },
        { key: 'PROJ-105', summary: 'Build Burndown Chart Rendering Canvas UI', type: 'Story', points: 8, status: 'Done', day: 4 },
        { key: 'PROJ-106', summary: 'UI Form Validation for Task Addition', type: 'Bug', points: 3, status: 'In Progress', day: null },
        { key: 'PROJ-107', summary: 'Automated Unit Tests for Calculation Engine', type: 'Task', points: 5, status: 'In Progress', day: null },
        { key: 'PROJ-108', summary: 'CSV/JSON Data Export Module', type: 'Story', points: 5, status: 'To Do', day: null },
        { key: 'PROJ-109', summary: 'Error Boundary & Toast Notification Component', type: 'Task', points: 3, status: 'To Do', day: null },
        { key: 'PROJ-110', summary: 'Sprint Health Summary & KPI Calculation', type: 'Story', points: 5, status: 'To Do', day: null }
      ];

      for (let i = 0; i < expectedIssues.length; i++) {
        const exp = expectedIssues[i];
        const actual = data.issues[i];
        assert.equal(actual.key, exp.key);
        assert.equal(actual.summary, exp.summary);
        assert.equal(actual.issueType, exp.type);
        assert.equal(actual.storyPoints, exp.points);
        assert.equal(actual.status, exp.status);
        assert.equal(actual.completionDay, exp.day);
      }
    });
  });

  describe('Mathematical Integrity', () => {
    test('sum of storyPoints across all 10 issues equals 50', () => {
      const data = getDefaultDataset();
      const totalPoints = data.issues.reduce((acc, issue) => acc + issue.storyPoints, 0);
      assert.equal(totalPoints, 50, 'Sum of storyPoints must equal 50');
      assert.equal(totalPoints, data.sprint.totalCommittedPoints);
    });

    test('issues completed by Day 4 total exactly 29 points', () => {
      const data = getDefaultDataset();
      const completedByDay4 = data.issues
        .filter(i => i.status === 'Done' && i.completionDay !== null && i.completionDay <= 4)
        .reduce((acc, issue) => acc + issue.storyPoints, 0);

      assert.equal(completedByDay4, 29, 'Completed story points by Day 4 must equal 29');
    });

    test('remaining story points on Day 4 total exactly 21 points', () => {
      const data = getDefaultDataset();
      const totalPoints = data.issues.reduce((acc, i) => acc + i.storyPoints, 0);
      const completedByDay4 = data.issues
        .filter(i => i.status === 'Done' && i.completionDay !== null && i.completionDay <= 4)
        .reduce((acc, i) => acc + i.storyPoints, 0);
      const remainingOnDay4 = totalPoints - completedByDay4;

      assert.equal(remainingOnDay4, 21, 'Remaining story points on Day 4 must equal 21');
    });

    test('completed issues match SRS Appendix A specifications', () => {
      const data = getDefaultDataset();
      const doneIssues = data.issues.filter(i => i.status === 'Done');
      assert.equal(doneIssues.length, 5, 'Exactly 5 issues should be marked Done');

      const expectedDone = [
        { key: 'PROJ-101', points: 5, day: 1 },
        { key: 'PROJ-102', points: 3, day: 2 },
        { key: 'PROJ-103', points: 8, day: 3 },
        { key: 'PROJ-104', points: 5, day: 4 },
        { key: 'PROJ-105', points: 8, day: 4 }
      ];

      for (const exp of expectedDone) {
        const found = doneIssues.find(i => i.key === exp.key);
        assert.ok(found, `Expected ${exp.key} to be Done`);
        assert.equal(found.storyPoints, exp.points);
        assert.equal(found.completionDay, exp.day);
      }
    });
  });

  describe('Isolation & Immutability (Deep Cloning)', () => {
    test('mutating returned dataset does not pollute subsequent calls', () => {
      const firstCall = getDefaultDataset();

      // Mutate returned sprint object
      firstCall.sprint.name = 'MUTATED SPRINT';
      firstCall.sprint.duration = 999;
      firstCall.sprint.currentDay = 10;
      firstCall.sprint.totalCommittedPoints = 0;

      // Mutate returned issues array and objects
      firstCall.issues[0].storyPoints = 9999;
      firstCall.issues[0].status = 'In Progress';
      firstCall.issues[0].summary = 'Corrupted summary';
      firstCall.issues.push({ key: 'PROJ-999', summary: 'Hacked', storyPoints: 100 });
      delete firstCall.issues[1];

      // Second call must be clean
      const secondCall = getDefaultDataset();
      assert.equal(secondCall.sprint.name, 'Sprint 1 - Core Features');
      assert.equal(secondCall.sprint.duration, 10);
      assert.equal(secondCall.sprint.currentDay, 4);
      assert.equal(secondCall.sprint.totalCommittedPoints, 50);
      assert.equal(secondCall.issues.length, 10);
      assert.equal(secondCall.issues[0].storyPoints, 5);
      assert.equal(secondCall.issues[0].status, 'Done');
      assert.equal(secondCall.issues[0].summary, 'User Authentication & Session Token Service');
      assert.equal(secondCall.issues[1].key, 'PROJ-102');
    });

    test('getDefaultSprint() and getDefaultIssues() return isolated copies', () => {
      const sprint = getDefaultSprint();
      sprint.name = 'MODIFIED';
      assert.equal(getDefaultSprint().name, 'Sprint 1 - Core Features');

      const issues = getDefaultIssues();
      issues.pop();
      assert.equal(getDefaultIssues().length, 10);
    });

    test('internal constants and all nested objects are deeply frozen against mutation', () => {
      assert.ok(Object.isFrozen(DEFAULT_SPRINT), 'DEFAULT_SPRINT should be frozen');
      assert.ok(Object.isFrozen(DEFAULT_ISSUES), 'DEFAULT_ISSUES should be frozen');
      assert.ok(Object.isFrozen(DEFAULT_DATASET), 'DEFAULT_DATASET should be frozen');

      // Crucial: verify that every individual issue object is frozen (deep freeze)
      for (const issue of DEFAULT_ISSUES) {
        assert.ok(Object.isFrozen(issue), `Issue ${issue.key} must be deeply frozen`);
      }
      for (const issue of DEFAULT_DATASET.issues) {
        assert.ok(Object.isFrozen(issue), `Dataset issue ${issue.key} must be deeply frozen`);
      }

      // In strict mode, modifying frozen top-level or nested properties throws TypeError
      assert.throws(() => {
        DEFAULT_SPRINT.name = 'HACK';
      }, TypeError);

      assert.throws(() => {
        DEFAULT_ISSUES[0] = null;
      }, TypeError);

      // Verify that mutating inner issue properties is prevented and throws TypeError
      assert.throws(() => {
        DEFAULT_ISSUES[0].storyPoints = 999;
      }, TypeError);

      assert.throws(() => {
        DEFAULT_DATASET.issues[0].storyPoints = 999;
      }, TypeError);

      assert.throws(() => {
        DEFAULT_DATASET.sprint.currentDay = 99;
      }, TypeError);

      // Verify dataset remains completely intact after attempted mutations
      const freshData = getDefaultDataset();
      assert.equal(freshData.issues[0].storyPoints, 5);
      assert.equal(freshData.sprint.currentDay, 4);
    });

    test('deepFreeze helper recursively seals objects and arrays', () => {
      assert.equal(typeof deepFreeze, 'function');
      const sample = { nested: { array: [1, 2, { value: 3 }] } };
      const frozen = deepFreeze(sample);
      assert.equal(frozen, sample);
      assert.ok(Object.isFrozen(frozen));
      assert.ok(Object.isFrozen(frozen.nested));
      assert.ok(Object.isFrozen(frozen.nested.array));
      assert.ok(Object.isFrozen(frozen.nested.array[2]));

      assert.throws(() => {
        frozen.nested.array[2].value = 42;
      }, TypeError);
    });

    test('deepFreeze recursively seals Symbol-keyed properties and functions', () => {
      const sym = Symbol('secret');
      const target = {
        [sym]: { inner: 'protected' },
        fn: function dummy() {}
      };
      target.fn.customProp = { nested: 100 };

      const frozen = deepFreeze(target);
      assert.ok(Object.isFrozen(frozen));
      assert.ok(Object.isFrozen(frozen[sym]), 'Symbol-keyed property object must be deeply frozen');
      assert.ok(Object.isFrozen(frozen.fn), 'Function object must be frozen');
      assert.ok(Object.isFrozen(frozen.fn.customProp), 'Properties on function must be deeply frozen');

      assert.throws(() => {
        frozen[sym].inner = 'corrupted';
      }, TypeError);

      assert.throws(() => {
        frozen.fn.customProp.nested = 999;
      }, TypeError);
    });

    test('deepFreeze safely handles ArrayBuffer views and TypedArrays without throwing', () => {
      const target = {
        buffer: new Uint8Array([1, 2, 3]),
        nested: { inner: 'val' }
      };
      const frozen = deepFreeze(target);
      assert.ok(Object.isFrozen(frozen));
      assert.ok(Object.isFrozen(frozen.nested));
      assert.equal(frozen.buffer[0], 1);
    });

    test('deepFreeze inspects property descriptors and freezes accessors without executing throwing getters', () => {
      const target = {};
      let getterExecuted = false;
      Object.defineProperty(target, 'dangerousGetter', {
        get() {
          getterExecuted = true;
          throw new Error('Getter execution should never happen during deepFreeze');
        },
        configurable: true,
        enumerable: true
      });

      // Freezing should succeed without invoking the throwing getter
      assert.doesNotThrow(() => {
        deepFreeze(target);
      });
      assert.equal(getterExecuted, false, 'Property getter must not be invoked during deepFreeze');
      assert.ok(Object.isFrozen(target));

      // Also verify normal getter/setter functions themselves get frozen
      const accessors = {
        _secret: 42,
        get secret() { return this._secret; },
        set secret(val) { this._secret = val; }
      };
      deepFreeze(accessors);
      const desc = Object.getOwnPropertyDescriptor(accessors, 'secret');
      assert.ok(Object.isFrozen(desc.get), 'Getter function must be deeply frozen');
      assert.ok(Object.isFrozen(desc.set), 'Setter function must be deeply frozen');
    });

    test('deepClone creates completely isolated deep clones for objects and arrays', () => {
      assert.equal(deepClone(null), null);
      assert.equal(deepClone(undefined), undefined);
      assert.equal(deepClone(42), 42);
      assert.equal(deepClone('hello'), 'hello');

      const original = { a: 1, b: [2, 3, { c: 4 }] };
      const clone = deepClone(original);

      assert.deepEqual(clone, original);
      assert.notEqual(clone, original);
      assert.notEqual(clone.b, original.b);
      assert.notEqual(clone.b[2], original.b[2]);

      clone.b[2].c = 999;
      assert.equal(original.b[2].c, 4);
    });

    test('deepClone safely handles functions, methods, Dates, RegExps, and Symbol keys without crashing', () => {
      const sym = Symbol('meta');
      const testFn = () => 'test-result';
      const original = {
        [sym]: 'sym-val',
        handler: testFn,
        created: new Date('2026-10-19T12:00:00Z'),
        regex: /^PROJ-\d+$/i,
        nested: { count: 10 }
      };

      const clone = deepClone(original);
      assert.notEqual(clone, original);
      assert.equal(clone[sym], 'sym-val');
      assert.equal(clone.handler, testFn);
      assert.equal(clone.handler(), 'test-result');
      assert.ok(clone.created instanceof Date);
      assert.notEqual(clone.created, original.created);
      assert.equal(clone.created.getTime(), original.created.getTime());
      assert.ok(clone.regex instanceof RegExp);
      assert.notEqual(clone.regex, original.regex);
      assert.equal(clone.regex.source, '^PROJ-\\d+$');
      assert.notEqual(clone.nested, original.nested);

      // Verify pass-through for standalone function
      assert.equal(deepClone(testFn), testFn);
    });

    test('consecutive calls to getDefaultDataset return distinct object references', () => {
      const call1 = getDefaultDataset();
      const call2 = getDefaultDataset();

      assert.notEqual(call1, call2);
      assert.notEqual(call1.sprint, call2.sprint);
      assert.notEqual(call1.issues, call2.issues);
      assert.notEqual(call1.issues[0], call2.issues[0]);
    });
  });
});
