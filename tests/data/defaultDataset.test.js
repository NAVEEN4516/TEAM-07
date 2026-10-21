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

  describe('Sprint Metadata (SRS Appendix C & SAD §3.1)', () => {
    test('contains canonical sprint properties per SRS Appendix C and SAD', () => {
      const data = getDefaultDataset();
      assert.ok(data.sprint, 'Sprint object should exist');
      assert.equal(data.sprint.sprintName, 'Sprint 1 - Core Features');
      assert.equal(data.sprint.durationDays, 10);
      assert.equal(data.sprint.currentDay, 4);
      assert.equal(data.sprint.totalStoryPoints, 50);
      assert.equal(data.sprint.startDate, '2026-10-05');
      assert.equal(data.sprint.endDate, '2026-10-16');

      // Verify redundant alias keys have been dropped to prevent dual sources of truth
      assert.equal(data.sprint.name, undefined, 'Redundant alias "name" must not be present');
      assert.equal(data.sprint.duration, undefined, 'Redundant alias "duration" must not be present');
    });
  });

  describe('Issue Collection & Canonical Schema', () => {
    test('contains exactly 10 issues with keys PROJ-101 through PROJ-110', () => {
      const data = getDefaultDataset();
      assert.equal(data.issues.length, 10, 'Expected exactly 10 issues');

      const expectedKeys = [
        'PROJ-101', 'PROJ-102', 'PROJ-103', 'PROJ-104', 'PROJ-105',
        'PROJ-106', 'PROJ-107', 'PROJ-108', 'PROJ-109', 'PROJ-110'
      ];
      const actualKeys = data.issues.map(i => i.issueKey);
      assert.deepEqual(actualKeys, expectedKeys, 'Issue keys must match PROJ-101 through PROJ-110 in sequence');
    });

    test('each issue has all canonical fields with valid types and no redundant aliases', () => {
      const data = getDefaultDataset();
      const validTypes = new Set(['Story', 'Task', 'Bug']);
      const validStatuses = new Set(['To Do', 'In Progress', 'Done']);

      for (const issue of data.issues) {
        assert.ok(issue.issueKey && typeof issue.issueKey === 'string', `Invalid issueKey on ${JSON.stringify(issue)}`);
        assert.ok(issue.summary && typeof issue.summary === 'string', `Invalid summary on ${issue.issueKey}`);
        assert.ok(validTypes.has(issue.issueType), `Invalid issueType on ${issue.issueKey}: ${issue.issueType}`);
        assert.ok(typeof issue.storyPoints === 'number' && issue.storyPoints >= 0, `Invalid storyPoints on ${issue.issueKey}`);
        assert.ok(validStatuses.has(issue.status), `Invalid status on ${issue.issueKey}: ${issue.status}`);

        if (issue.status === 'Done') {
          assert.ok(
            typeof issue.completedDay === 'number' && [1, 2, 3, 4].includes(issue.completedDay),
            `Done issue ${issue.issueKey} must have completedDay in [1, 2, 3, 4], got: ${issue.completedDay}`
          );
        } else {
          assert.equal(
            issue.completedDay,
            null,
            `Non-done issue ${issue.issueKey} must have completedDay set to null, got: ${issue.completedDay}`
          );
        }

        // Verify redundant aliases are dropped to prevent desync
        assert.equal(issue.key, undefined, `Alias "key" must not exist on issue ${issue.issueKey}`);
        assert.equal(issue.type, undefined, `Alias "type" must not exist on issue ${issue.issueKey}`);
        assert.equal(issue.completionDay, undefined, `Alias "completionDay" must not exist on issue ${issue.issueKey}`);
      }
    });

    test('individual issue values match SRS Appendix A Table 11 exactly', () => {
      const data = getDefaultDataset();
      const expectedIssues = [
        { issueKey: 'PROJ-101', summary: 'User Authentication & Session Token Service', issueType: 'Story', points: 5, status: 'Done', day: 1 },
        { issueKey: 'PROJ-102', summary: 'Database Schema Migration for User Profiles', issueType: 'Task', points: 3, status: 'Done', day: 2 },
        { issueKey: 'PROJ-103', summary: 'REST API Endpoint for Sprint Backlog Query', issueType: 'Story', points: 8, status: 'Done', day: 3 },
        { issueKey: 'PROJ-104', summary: 'Implement JWT Refresh Token Expiry Logic', issueType: 'Task', points: 5, status: 'Done', day: 4 },
        { issueKey: 'PROJ-105', summary: 'Build Burndown Chart Rendering Canvas UI', issueType: 'Story', points: 8, status: 'Done', day: 4 },
        { issueKey: 'PROJ-106', summary: 'UI Form Validation for Task Addition', issueType: 'Bug', points: 3, status: 'In Progress', day: null },
        { issueKey: 'PROJ-107', summary: 'Automated Unit Tests for Calculation Engine', issueType: 'Task', points: 5, status: 'In Progress', day: null },
        { issueKey: 'PROJ-108', summary: 'CSV/JSON Data Export Module', issueType: 'Story', points: 5, status: 'To Do', day: null },
        { issueKey: 'PROJ-109', summary: 'Error Boundary & Toast Notification Component', issueType: 'Task', points: 3, status: 'To Do', day: null },
        { issueKey: 'PROJ-110', summary: 'Sprint Health Summary & KPI Calculation', issueType: 'Story', points: 5, status: 'To Do', day: null }
      ];

      for (let i = 0; i < expectedIssues.length; i++) {
        const exp = expectedIssues[i];
        const actual = data.issues[i];
        assert.equal(actual.issueKey, exp.issueKey);
        assert.equal(actual.summary, exp.summary);
        assert.equal(actual.issueType, exp.issueType);
        assert.equal(actual.storyPoints, exp.points);
        assert.equal(actual.status, exp.status);
        assert.equal(actual.completedDay, exp.day);
      }
    });
  });

  describe('Mathematical Integrity', () => {
    test('sum of storyPoints across all 10 issues equals 50', () => {
      const data = getDefaultDataset();
      const totalPoints = data.issues.reduce((acc, issue) => acc + issue.storyPoints, 0);
      assert.equal(totalPoints, 50, 'Sum of storyPoints must equal 50');
      assert.equal(totalPoints, data.sprint.totalStoryPoints);
    });

    test('issues completed by Day 4 total exactly 29 points', () => {
      const data = getDefaultDataset();
      const completedByDay4 = data.issues
        .filter(i => i.status === 'Done' && i.completedDay !== null && i.completedDay <= 4)
        .reduce((acc, issue) => acc + issue.storyPoints, 0);

      assert.equal(completedByDay4, 29, 'Completed story points by Day 4 must equal 29');
    });

    test('remaining story points on Day 4 total exactly 21 points', () => {
      const data = getDefaultDataset();
      const totalPoints = data.issues.reduce((acc, i) => acc + i.storyPoints, 0);
      const completedByDay4 = data.issues
        .filter(i => i.status === 'Done' && i.completedDay !== null && i.completedDay <= 4)
        .reduce((acc, i) => acc + i.storyPoints, 0);
      const remainingOnDay4 = totalPoints - completedByDay4;

      assert.equal(remainingOnDay4, 21, 'Remaining story points on Day 4 must equal 21');
    });

    test('completed issues match SRS Appendix A specifications', () => {
      const data = getDefaultDataset();
      const doneIssues = data.issues.filter(i => i.status === 'Done');
      assert.equal(doneIssues.length, 5, 'Exactly 5 issues should be marked Done');

      const expectedDone = [
        { issueKey: 'PROJ-101', points: 5, day: 1 },
        { issueKey: 'PROJ-102', points: 3, day: 2 },
        { issueKey: 'PROJ-103', points: 8, day: 3 },
        { issueKey: 'PROJ-104', points: 5, day: 4 },
        { issueKey: 'PROJ-105', points: 8, day: 4 }
      ];

      for (const exp of expectedDone) {
        const found = doneIssues.find(i => i.issueKey === exp.issueKey);
        assert.ok(found, `Expected ${exp.issueKey} to be Done`);
        assert.equal(found.storyPoints, exp.points);
        assert.equal(found.completedDay, exp.day);
      }
    });
  });

  describe('Isolation & Immutability (Deep Cloning)', () => {
    test('mutating returned dataset does not pollute subsequent calls', () => {
      const firstCall = getDefaultDataset();

      // Mutate returned sprint object
      firstCall.sprint.sprintName = 'MUTATED SPRINT';
      firstCall.sprint.durationDays = 999;
      firstCall.sprint.currentDay = 10;
      firstCall.sprint.totalStoryPoints = 0;

      // Mutate returned issues array and objects
      firstCall.issues[0].storyPoints = 9999;
      firstCall.issues[0].status = 'In Progress';
      firstCall.issues[0].summary = 'Corrupted summary';
      firstCall.issues.push({ issueKey: 'PROJ-999', summary: 'Hacked', storyPoints: 100 });
      delete firstCall.issues[1];

      // Second call must be clean
      const secondCall = getDefaultDataset();
      assert.equal(secondCall.sprint.sprintName, 'Sprint 1 - Core Features');
      assert.equal(secondCall.sprint.durationDays, 10);
      assert.equal(secondCall.sprint.currentDay, 4);
      assert.equal(secondCall.sprint.totalStoryPoints, 50);
      assert.equal(secondCall.issues.length, 10);
      assert.equal(secondCall.issues[0].storyPoints, 5);
      assert.equal(secondCall.issues[0].status, 'Done');
      assert.equal(secondCall.issues[0].summary, 'User Authentication & Session Token Service');
      assert.equal(secondCall.issues[1].issueKey, 'PROJ-102');
    });

    test('getDefaultSprint() and getDefaultIssues() return isolated copies', () => {
      const sprint = getDefaultSprint();
      sprint.sprintName = 'MODIFIED';
      assert.equal(getDefaultSprint().sprintName, 'Sprint 1 - Core Features');

      const issues = getDefaultIssues();
      issues.pop();
      assert.equal(getDefaultIssues().length, 10);
    });

    test('internal constants and all nested objects are deeply frozen against mutation', () => {
      assert.ok(Object.isFrozen(DEFAULT_SPRINT), 'DEFAULT_SPRINT should be frozen');
      assert.ok(Object.isFrozen(DEFAULT_ISSUES), 'DEFAULT_ISSUES should be frozen');
      assert.ok(Object.isFrozen(DEFAULT_DATASET), 'DEFAULT_DATASET should be frozen');

      // Verify that every individual issue object is frozen (deep freeze)
      for (const issue of DEFAULT_ISSUES) {
        assert.ok(Object.isFrozen(issue), `Issue ${issue.issueKey} must be deeply frozen`);
      }
    });

    test('deepFreeze helper recursively seals objects and arrays', () => {
      const obj = { nested: { array: [1, { val: 'text' }] } };
      deepFreeze(obj);
      assert.ok(Object.isFrozen(obj));
      assert.ok(Object.isFrozen(obj.nested));
      assert.ok(Object.isFrozen(obj.nested.array));
      assert.ok(Object.isFrozen(obj.nested.array[1]));
    });

    test('deepFreeze recursively seals Symbol-keyed properties and functions', () => {
      const sym = Symbol('secret');
      const obj = { [sym]: { sub: 'value' }, fn: () => {} };
      deepFreeze(obj);
      assert.ok(Object.isFrozen(obj));
      assert.ok(Object.isFrozen(obj[sym]));
      assert.ok(Object.isFrozen(obj.fn));
    });

    test('deepFreeze safely handles ArrayBuffer views and TypedArrays without throwing', () => {
      const buffer = new ArrayBuffer(16);
      const uint8 = new Uint8Array(buffer);
      const container = { data: uint8 };
      assert.doesNotThrow(() => deepFreeze(container));
      assert.ok(Object.isFrozen(container));
    });

    test('deepFreeze inspects property descriptors and freezes accessors without executing throwing getters', () => {
      const dangerousObj = {};
      Object.defineProperty(dangerousObj, 'explosive', {
        get() {
          throw new Error('Getter was improperly invoked during freeze!');
        },
        configurable: true,
        enumerable: true
      });

      assert.doesNotThrow(() => deepFreeze(dangerousObj));
      assert.ok(Object.isFrozen(dangerousObj));
    });

    test('deepClone creates completely isolated deep clones for objects and arrays', () => {
      const source = {
        name: 'Sprint Alpha',
        list: [{ id: 1 }, { id: 2 }]
      };
      const cloned = deepClone(source);
      assert.deepEqual(cloned, source);
      assert.notEqual(cloned, source);
      assert.notEqual(cloned.list, source.list);
      assert.notEqual(cloned.list[0], source.list[0]);
    });

    test('deepClone safely handles functions, methods, Dates, RegExps, and Symbol keys without crashing', () => {
      const sym = Symbol('id');
      const testDate = new Date('2026-10-05T00:00:00Z');
      const testRegex = /^[A-Z]+-\d+$/gi;
      const testFn = function () { return 42; };

      const complex = {
        [sym]: 'symbol-val',
        date: testDate,
        regex: testRegex,
        fn: testFn
      };

      const cloned = deepClone(complex);
      assert.equal(cloned[sym], 'symbol-val');
      assert.equal(cloned.date.getTime(), testDate.getTime());
      assert.notEqual(cloned.date, testDate);
      assert.equal(cloned.regex.source, testRegex.source);
      assert.equal(cloned.regex.flags, testRegex.flags);
      assert.notEqual(cloned.regex, testRegex);
      // Functions are returned by reference
      assert.equal(cloned.fn, testFn);
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
