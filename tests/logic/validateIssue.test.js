import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateIssue } from '../../src/js/logic/validationManager.js';

describe('validateIssue (BDC-F-006, BDC-NF-003, BDC-SR-001, BDC-SR-002)', () => {
  const validContext = { currentDay: 4, durationDays: 10 };

  const validBase = {
    issueKey: 'PROJ-105',
    summary: 'Implement export functionality',
    issueType: 'Story',
    storyPoints: 5,
    status: 'To Do',
    completedDay: null
  };

  it('accepts a completely valid issue object', () => {
    const res = validateIssue(validBase, ['PROJ-101', 'PROJ-102'], validContext);
    assert.equal(res.valid, true);
    assert.deepEqual(res.errors, []);
  });

  describe('issueKey validation', () => {
    it('rejects empty or whitespace-only key', () => {
      const res1 = validateIssue({ ...validBase, issueKey: '' }, [], validContext);
      assert.equal(res1.valid, false);
      assert.ok(res1.errors.includes('Issue key is required.'));

      const res2 = validateIssue({ ...validBase, issueKey: '   ' }, [], validContext);
      assert.equal(res2.valid, false);
      assert.ok(res2.errors.includes('Issue key is required.'));

      const res3 = validateIssue({ ...validBase, issueKey: null }, [], validContext);
      assert.equal(res3.valid, false);
      assert.ok(res3.errors.includes('Issue key is required.'));
    });

    it('rejects case-insensitive duplicate keys', () => {
      const existing = ['PROJ-101', 'PROJ-102'];
      const res1 = validateIssue({ ...validBase, issueKey: 'PROJ-101' }, existing, validContext);
      assert.equal(res1.valid, false);
      assert.ok(res1.errors.includes('An issue with this key already exists.'));

      const res2 = validateIssue({ ...validBase, issueKey: 'proj-101' }, existing, validContext);
      assert.equal(res2.valid, false);
      assert.ok(res2.errors.includes('An issue with this key already exists.'));

      const res3 = validateIssue({ ...validBase, issueKey: '  PROJ-102  ' }, existing, validContext);
      assert.equal(res3.valid, false);
      assert.ok(res3.errors.includes('An issue with this key already exists.'));
    });

    it('accepts keys containing XSS injection payloads (TC-SR-01.1)', () => {
      const xssKey = '<script>alert(1)</script>';
      const res = validateIssue({ ...validBase, issueKey: xssKey }, [], validContext);
      assert.equal(res.valid, true);
      assert.deepEqual(res.errors, []);
    });
  });

  describe('summary validation', () => {
    it('rejects empty or whitespace-only summary', () => {
      const res1 = validateIssue({ ...validBase, summary: '' }, [], validContext);
      assert.equal(res1.valid, false);
      assert.ok(res1.errors.includes('Summary is required.'));

      const res2 = validateIssue({ ...validBase, summary: '   \t  ' }, [], validContext);
      assert.equal(res2.valid, false);
      assert.ok(res2.errors.includes('Summary is required.'));

      const res3 = validateIssue({ ...validBase, summary: undefined }, [], validContext);
      assert.equal(res3.valid, false);
      assert.ok(res3.errors.includes('Summary is required.'));
    });

    it('accepts summary containing HTML/XSS payloads as literal text', () => {
      const xssSummary = '<img src=x onerror=alert(1)>';
      const res = validateIssue({ ...validBase, summary: xssSummary }, [], validContext);
      assert.equal(res.valid, true);
    });
  });

  describe('issueType validation', () => {
    it('accepts Story, Task, and Bug', () => {
      ['Story', 'Task', 'Bug'].forEach(type => {
        const res = validateIssue({ ...validBase, issueType: type }, [], validContext);
        assert.equal(res.valid, true);
      });
    });

    it('rejects invalid issue types', () => {
      ['Epic', 'Feature', '', null, 'story'].forEach(type => {
        const res = validateIssue({ ...validBase, issueType: type }, [], validContext);
        assert.equal(res.valid, false);
        assert.ok(res.errors.includes('Issue type must be Story, Task or Bug.'));
      });
    });
  });

  describe('storyPoints validation', () => {
    it('accepts non-negative numbers and decimal strings', () => {
      [0, 5, 2.5, '0', '5', '2.5', '  8  '].forEach(pts => {
        const res = validateIssue({ ...validBase, storyPoints: pts }, [], validContext);
        assert.equal(res.valid, true, `Expected valid for storyPoints: ${pts}`);
      });
    });

    it('rejects negative, non-numeric, Infinity, and NaN story points', () => {
      ['-3', -3, 'abc', 'Infinity', Infinity, NaN, null, undefined, '', '1e3'].forEach(pts => {
        const res = validateIssue({ ...validBase, storyPoints: pts }, [], validContext);
        assert.equal(res.valid, false, `Expected invalid for storyPoints: ${pts}`);
        assert.ok(res.errors.includes('Story points must be a non-negative number.'));
      });
    });

    it('rejects numbers exceeding safe numeric range like 1 followed by 303 zeros (P2 bugfix)', () => {
      const hugeSp = '1' + '0'.repeat(303);
      const res = validateIssue({ ...validBase, storyPoints: hugeSp }, [], validContext);
      assert.equal(res.valid, false);
      assert.ok(res.errors.includes('Story points must be a non-negative number.'));

      const resNum = validateIssue({ ...validBase, storyPoints: 1e303 }, [], validContext);
      assert.equal(resNum.valid, false);
      assert.ok(resNum.errors.includes('Story points must be a non-negative number.'));

      const resSafePlusOne = validateIssue({ ...validBase, storyPoints: Number.MAX_SAFE_INTEGER + 1000 }, [], validContext);
      assert.equal(resSafePlusOne.valid, false);
      assert.ok(resSafePlusOne.errors.includes('Story points must be a non-negative number.'));
    });
  });

  describe('status validation', () => {
    it('accepts To Do, In Progress, and Done', () => {
      ['To Do', 'In Progress'].forEach(status => {
        const res = validateIssue({ ...validBase, status }, [], validContext);
        assert.equal(res.valid, true);
      });
      const resDone = validateIssue({ ...validBase, status: 'Done', completedDay: 4 }, [], validContext);
      assert.equal(resDone.valid, true);
    });

    it('rejects invalid statuses', () => {
      ['Closed', 'Resolved', '', null, 'done'].forEach(status => {
        const res = validateIssue({ ...validBase, status }, [], validContext);
        assert.equal(res.valid, false);
        assert.ok(res.errors.includes('Status must be To Do, In Progress or Done.'));
      });
    });
  });

  describe('completedDay validation when Status is Done', () => {
    it('requires completedDay when status is Done', () => {
      const res1 = validateIssue({ ...validBase, status: 'Done', completedDay: null }, [], validContext);
      assert.equal(res1.valid, false);
      assert.ok(res1.errors.includes('Completion day is required when status is Done.'));

      const res2 = validateIssue({ ...validBase, status: 'Done', completedDay: '' }, [], validContext);
      assert.equal(res2.valid, false);
      assert.ok(res2.errors.includes('Completion day is required when status is Done.'));
    });

    it('accepts valid completedDay within 1 and min(currentDay, durationDays)', () => {
      // currentDay 4, durationDays 10 -> N = 4
      [1, 2, 3, 4, '1', '4'].forEach(day => {
        const res = validateIssue({ ...validBase, status: 'Done', completedDay: day }, [], validContext);
        assert.equal(res.valid, true, `Expected valid for completedDay ${day}`);
      });
    });

    it('rejects completedDay exceeding min(currentDay, durationDays) or invalid whole numbers', () => {
      // currentDay 4, durationDays 10 -> N = 4
      [0, 5, 11, -1, 1.5, '5', 'abc'].forEach(day => {
        const res = validateIssue({ ...validBase, status: 'Done', completedDay: day }, [], validContext);
        assert.equal(res.valid, false, `Expected invalid for completedDay ${day}`);
        assert.ok(res.errors.includes('Completion day must be a whole number between 1 and 4.'));
      });
    });

    it('uses specific error when Current Day is 0', () => {
      const res = validateIssue({ ...validBase, status: 'Done', completedDay: 1 }, [], { currentDay: 0, durationDays: 10 });
      assert.equal(res.valid, false);
      assert.ok(res.errors.includes('No completion day is valid while Current Day is 0.'));
    });

    it('ignores completedDay when status is not Done', () => {
      // Even if invalid completedDay supplied, status To Do / In Progress ignores it
      const res = validateIssue({ ...validBase, status: 'To Do', completedDay: 999 }, [], validContext);
      assert.equal(res.valid, true);
    });
  });

  describe('field order and multiple errors', () => {
    it('returns all applicable errors in exact field order without throwing', () => {
      const invalidAll = {
        issueKey: '',
        summary: '',
        issueType: 'InvalidType',
        storyPoints: 'invalid',
        status: 'InvalidStatus',
        completedDay: null
      };

      const res = validateIssue(invalidAll, [], validContext);
      assert.equal(res.valid, false);
      assert.deepEqual(res.errors, [
        'Issue key is required.',
        'Summary is required.',
        'Issue type must be Story, Task or Bug.',
        'Story points must be a non-negative number.',
        'Status must be To Do, In Progress or Done.'
      ]);
    });
  });
});
