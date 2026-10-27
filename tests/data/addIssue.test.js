import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DataManager } from '../../src/js/data/dataManager.js';

describe('DataManager.addIssue (BDC-F-006, BDC-F-002, BDC-SR-001, BDC-SR-002, BDC-NF-003)', () => {
  let dm;

  beforeEach(() => {
    dm = new DataManager();
  });

  it('TC-F-06.1: successfully adds valid issue and updates series, KPIs, and subscribers', () => {
    let listenerCount = 0;
    dm.subscribe(() => {
      listenerCount++;
    });

    const newIssue = {
      issueKey: 'PROJ-111',
      summary: 'Export report',
      issueType: 'Story',
      storyPoints: 5,
      status: 'To Do',
      completedDay: null
    };

    const res = dm.addIssue(newIssue);
    assert.equal(res.success, true);
    assert.deepEqual(res.errors, []);
    assert.equal(listenerCount, 1, 'Listener should be called exactly once');

    const issues = dm.getIssues();
    assert.equal(issues.length, 11);
    const sprint = dm.getSprint();
    assert.equal(sprint.totalStoryPoints, 55);

    const kpis = dm.getKPIs();
    assert.equal(kpis.totalPoints, 55);
    assert.equal(kpis.ideal[4].value, 33);
    assert.equal(kpis.actual[4].value, 26);
    assert.equal(kpis.remainingPoints, 26);
    assert.equal(kpis.variance, 7);
    assert.equal(kpis.scheduleStatus, 'Ahead of Schedule');
  });

  it('TC-F-06.2: duplicate PROJ-101 (and variants) rejected with unchanged state and listener count', () => {
    let listenerCount = 0;
    dm.subscribe(() => {
      listenerCount++;
    });

    ['PROJ-101', 'proj-101', ' PROJ-101 '].forEach(dupKey => {
      const res = dm.addIssue({
        issueKey: dupKey,
        summary: 'Duplicate task',
        issueType: 'Task',
        storyPoints: 3,
        status: 'To Do'
      });

      assert.equal(res.success, false);
      assert.ok(res.errors.includes('An issue with this key already exists.'));
      assert.equal(dm.getIssues().length, 10);
      assert.equal(listenerCount, 0, 'No notification on validation failure');
    });
  });

  it('TC-F-06.3: empty key, empty summary, both reject with errors and nothing added', () => {
    const res1 = dm.addIssue({
      issueKey: '',
      summary: 'Some summary',
      issueType: 'Bug',
      storyPoints: 2,
      status: 'To Do'
    });
    assert.equal(res1.success, false);
    assert.ok(res1.errors.includes('Issue key is required.'));
    assert.equal(dm.getIssues().length, 10);

    const res2 = dm.addIssue({
      issueKey: 'PROJ-999',
      summary: '   ',
      issueType: 'Bug',
      storyPoints: 2,
      status: 'To Do'
    });
    assert.equal(res2.success, false);
    assert.ok(res2.errors.includes('Summary is required.'));
    assert.equal(dm.getIssues().length, 10);

    const res3 = dm.addIssue({
      issueKey: '   ',
      summary: '',
      issueType: 'Bug',
      storyPoints: 2,
      status: 'To Do'
    });
    assert.equal(res3.success, false);
    assert.ok(res3.errors.includes('Issue key is required.'));
    assert.ok(res3.errors.includes('Summary is required.'));
    assert.equal(dm.getIssues().length, 10);
  });

  it('TC-F-06.4: story points 0 accepted, total stays 50, and getKPIs() has no NaN/Infinity/undefined', () => {
    const res = dm.addIssue({
      issueKey: 'PROJ-112',
      summary: 'Zero pointer spike',
      issueType: 'Task',
      storyPoints: 0,
      status: 'To Do'
    });

    assert.equal(res.success, true);
    assert.equal(dm.getIssues().length, 11);
    assert.equal(dm.getSprint().totalStoryPoints, 50);

    const kpis = dm.getKPIs();
    function assertNoNaNs(obj, path = '') {
      if (obj === null || obj === undefined) return;
      if (typeof obj === 'number') {
        assert.ok(!isNaN(obj), `Number at ${path} is NaN`);
        assert.ok(Number.isFinite(obj), `Number at ${path} is not finite`);
        return;
      }
      if (Array.isArray(obj)) {
        obj.forEach((item, idx) => assertNoNaNs(item, `${path}[${idx}]`));
      } else if (typeof obj === 'object') {
        Object.keys(obj).forEach(key => assertNoNaNs(obj[key], `${path}.${key}`));
      }
    }
    assertNoNaNs(kpis, 'kpis');
  });

  it('TC-F-02.2 (add half): total committed story points increases from 50 to 55', () => {
    assert.equal(dm.getSprint().totalStoryPoints, 50);
    const res = dm.addIssue({
      issueKey: 'PROJ-120',
      summary: 'Additional story',
      issueType: 'Story',
      storyPoints: 5,
      status: 'To Do'
    });
    assert.equal(res.success, true);
    assert.equal(dm.getSprint().totalStoryPoints, 55);
  });

  it('TC-SR-01.1: stores XSS injection strings byte-for-byte unchanged', () => {
    const xssKey = '<script>alert(1)</script>';
    const xssSummary = '<img src=x onerror=alert(1)>';

    const res = dm.addIssue({
      issueKey: xssKey,
      summary: xssSummary,
      issueType: 'Bug',
      storyPoints: 2,
      status: 'To Do'
    });

    assert.equal(res.success, true);
    const stored = dm.getIssues().find(i => i.issueKey === xssKey);
    assert.ok(stored);
    assert.equal(stored.issueKey, xssKey);
    assert.equal(stored.summary, xssSummary);
  });

  it('TC-SR-02.1 / TC-NF-03.1: points -3, "abc", Infinity rejected with no state change', () => {
    [-3, 'abc', Infinity].forEach(pts => {
      const res = dm.addIssue({
        issueKey: 'PROJ-130',
        summary: 'Invalid points',
        issueType: 'Story',
        storyPoints: pts,
        status: 'To Do'
      });
      assert.equal(res.success, false);
      assert.ok(res.errors.includes('Story points must be a non-negative number.'));
      assert.equal(dm.getIssues().length, 10);
    });
  });

  it('Done status with valid day increases completedPoints; non-Done status stores completedDay null', () => {
    const initialCompleted = dm.getKPIs().completedPoints; // 29

    // Add Done issue with 3 points, completedDay 3
    const resDone = dm.addIssue({
      issueKey: 'PROJ-140',
      summary: 'Completed feature',
      issueType: 'Story',
      storyPoints: 3,
      status: 'Done',
      completedDay: 3
    });
    assert.equal(resDone.success, true);
    assert.equal(resDone.issue.completedDay, 3);
    assert.equal(dm.getKPIs().completedPoints, initialCompleted + 3);

    // Non-Done status with completedDay provided should store completedDay null
    const resTodo = dm.addIssue({
      issueKey: 'PROJ-141',
      summary: 'Pending feature',
      issueType: 'Story',
      storyPoints: 2,
      status: 'To Do',
      completedDay: 2
    });
    assert.equal(resTodo.success, true);
    assert.equal(resTodo.issue.completedDay, null);
  });

  it('dm.reset() after adding issues restores baseline dataset (10 issues, 50 points, currentDay 4)', () => {
    dm.addIssue({
      issueKey: 'PROJ-150',
      summary: 'Temporary issue',
      issueType: 'Story',
      storyPoints: 8,
      status: 'To Do'
    });
    assert.equal(dm.getIssues().length, 11);

    dm.reset();
    assert.equal(dm.getIssues().length, 10);
    assert.equal(dm.getSprint().totalStoryPoints, 50);
    assert.equal(dm.getCurrentDay(), 4);
  });
});
