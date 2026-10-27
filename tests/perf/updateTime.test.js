/**
 * @file updateTime.test.js
 * @description Performance timing verification for state updates and recalculations (BDC-NF-001).
 * NOTE: This test file covers the business logic and state calculation layer execution speed.
 * End-to-end DOM rendering and layout timing (< 2000ms target per SRS Section 5 / TC-NF-01.1)
 * is verified in the browser environment via the ?perf instrumentation and documented in
 * docs/test-plan/evidence/BDC-NF-001-performance.md.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DataManager } from '../../src/js/data/dataManager.js';

describe('Performance: Update Time (BDC-NF-001, TC-NF-01.1)', () => {
  it('default dataset: 200 iterations of addIssue + setCurrentDay + getKPIs each execute < 2000 ms', () => {
    const dm = new DataManager();
    const TARGET_MAX_MS = 2000;

    for (let i = 0; i < 200; i++) {
      const start = performance.now();

      // Set current day to a valid day between 1 and 10
      const targetDay = (i % 10) + 1;
      const dayRes = dm.setCurrentDay(targetDay);
      assert.equal(dayRes.success, true);

      // Add issue with completedDay <= targetDay if status is Done
      const isDone = i % 3 === 0;
      const addRes = dm.addIssue({
        issueKey: `PERF-${i}`,
        summary: `Performance testing task iteration ${i}`,
        issueType: i % 2 === 0 ? 'Story' : 'Task',
        storyPoints: (i % 8) + 1,
        status: isDone ? 'Done' : 'In Progress',
        completedDay: isDone ? 1 : null
      });
      assert.equal(addRes.success, true);

      // Compute live KPIs and series
      const kpis = dm.getKPIs();
      assert.ok(kpis.totalPoints > 0);

      const elapsed = performance.now() - start;
      assert.ok(
        elapsed < TARGET_MAX_MS,
        `Iteration ${i} took ${elapsed.toFixed(2)}ms, exceeding limit of ${TARGET_MAX_MS}ms`
      );
    }
  });

  it('stress: 1000 generated issues with state updates each execute < 2000 ms', () => {
    const dm = new DataManager();
    const TARGET_MAX_MS = 2000;

    // Set sprint currentDay to 10 so any completedDay 1..10 is valid
    dm.setCurrentDay(10);

    // Pre-populate with 1000 issues
    for (let i = 0; i < 1000; i++) {
      const isDone = i % 2 === 0;
      const addRes = dm.addIssue({
        issueKey: `STRESS-${i}`,
        summary: `Stress item ${i}`,
        issueType: 'Story',
        storyPoints: (i % 5) + 1,
        status: isDone ? 'Done' : 'To Do',
        completedDay: isDone ? ((i % 10) + 1) : null
      });
      assert.equal(addRes.success, true);
    }

    assert.equal(dm.getIssues().length, 1010);

    // Perform operations on large dataset
    for (let step = 0; step < 50; step++) {
      const start = performance.now();

      const dayRes = dm.setCurrentDay((step % 10) + 1);
      assert.equal(dayRes.success, true);

      const addRes = dm.addIssue({
        issueKey: `STRESS-ADD-${step}`,
        summary: `Additional item ${step}`,
        issueType: 'Bug',
        storyPoints: 3,
        status: 'Done',
        completedDay: 1
      });
      assert.equal(addRes.success, true);

      const kpis = dm.getKPIs();
      assert.ok(kpis.totalPoints > 0);

      const elapsed = performance.now() - start;
      assert.ok(
        elapsed < TARGET_MAX_MS,
        `Stress operation ${step} took ${elapsed.toFixed(2)}ms, exceeding ${TARGET_MAX_MS}ms`
      );
    }
  });
});
