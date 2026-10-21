import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getDefaultDataset } from '../../src/js/data/defaultDataset.js';
import { buildTableRows } from '../../src/js/ui/backlogTable.js';

describe('BDC-F-005 (TC-F-05.1): Display Backlog Table', () => {
  const dataset = getDefaultDataset();
  const rows = buildTableRows(dataset.issues);

  test('default dataset yields exactly 10 rows', () => {
    assert.equal(rows.length, 10, 'Expected exactly 10 rows for default dataset');
  });

  test('issue keys match PROJ-101 through PROJ-110 in exact sequential order', () => {
    const expectedKeys = [
      'PROJ-101', 'PROJ-102', 'PROJ-103', 'PROJ-104', 'PROJ-105',
      'PROJ-106', 'PROJ-107', 'PROJ-108', 'PROJ-109', 'PROJ-110'
    ];
    const actualKeys = rows.map(r => r.issueKey);
    assert.deepEqual(actualKeys, expectedKeys, 'Keys must be in exact sequential order');
  });

  test('every field in each row strictly equals the corresponding dataset field', () => {
    dataset.issues.forEach((issue, index) => {
      const row = rows[index];
      assert.equal(row.issueKey, issue.issueKey);
      assert.equal(row.summary, issue.summary);
      assert.equal(row.issueType, issue.issueType);
      assert.equal(row.storyPoints, String(issue.storyPoints));
      assert.equal(row.status, issue.status);

      if (issue.completedDay !== null && issue.completedDay !== undefined) {
        assert.equal(row.completedDay, String(issue.completedDay));
      } else {
        assert.equal(row.completedDay, '--');
      }
    });
  });

  test('uncompleted issues (PROJ-106 through PROJ-110) display "--" as completion day', () => {
    const uncompletedKeys = ['PROJ-106', 'PROJ-107', 'PROJ-108', 'PROJ-109', 'PROJ-110'];
    const uncompletedRows = rows.filter(r => uncompletedKeys.includes(r.issueKey));

    assert.equal(uncompletedRows.length, 5);
    uncompletedRows.forEach(row => {
      assert.equal(row.completedDay, '--', `Issue ${row.issueKey} completion day should display "--"`);
    });
  });

  test('completed issues (PROJ-101 through PROJ-105) display correct numeric completion day string', () => {
    const completedKeys = ['PROJ-101', 'PROJ-102', 'PROJ-103', 'PROJ-104', 'PROJ-105'];
    const expectedDays = ['1', '2', '3', '4', '4'];
    const completedRows = rows.filter(r => completedKeys.includes(r.issueKey));

    assert.equal(completedRows.length, 5);
    completedRows.forEach((row, i) => {
      assert.equal(row.completedDay, expectedDays[i]);
    });
  });

  test('empty or invalid issue collection returns empty array without throwing', () => {
    assert.deepEqual(buildTableRows([]), []);
    assert.deepEqual(buildTableRows(null), []);
    assert.deepEqual(buildTableRows(undefined), []);
  });

  test('HTML and script injection strings are preserved as raw plain text without modification', () => {
    const xssIssue = [{
      issueKey: '<script>alert(1)</script>',
      summary: '<b onmouseover="alert(2)">Bold Summary</b>',
      issueType: '<img src=x onerror=alert(3)>',
      storyPoints: 5,
      status: '<span style="color:red">Done</span>',
      completedDay: null
    }];

    const xssRows = buildTableRows(xssIssue);
    assert.equal(xssRows.length, 1);
    assert.equal(xssRows[0].issueKey, '<script>alert(1)</script>');
    assert.equal(xssRows[0].summary, '<b onmouseover="alert(2)">Bold Summary</b>');
    assert.equal(xssRows[0].issueType, '<img src=x onerror=alert(3)>');
    assert.equal(xssRows[0].status, '<span style="color:red">Done</span>');
    assert.equal(xssRows[0].completedDay, '--');
  });
});
