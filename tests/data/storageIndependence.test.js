import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DataManager } from '../../src/js/data/dataManager.js';
import { makeIssue } from '../integration/pipelineHelpers.js';

/**
 * Sprint data never touches browser storage (BDC-SR-003, TC-SR-03.1 addendum).
 *
 * "Automatic sprint persistence is disabled": startup, every edit, Reset and the
 * save/restore helpers must work when storage is blocked, and must not try to
 * read or write it. Every access below throws and is counted, so a future change
 * that quietly starts persisting data fails here.
 */

/** Replaces every storage entry point with one that throws and counts. */
function blockStorage() {
  const accesses = [];
  const trap = name => () => {
    accesses.push(name);
    throw new Error(`SecurityError: ${name} is blocked`);
  };
  const saved = {
    window: Object.getOwnPropertyDescriptor(globalThis, 'window'),
    localStorage: Object.getOwnPropertyDescriptor(globalThis, 'localStorage'),
    sessionStorage: Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage'),
    indexedDB: Object.getOwnPropertyDescriptor(globalThis, 'indexedDB')
  };

  Object.defineProperty(globalThis, 'localStorage', { get: trap('localStorage'), configurable: true });
  Object.defineProperty(globalThis, 'sessionStorage', { get: trap('sessionStorage'), configurable: true });
  Object.defineProperty(globalThis, 'indexedDB', { get: trap('indexedDB'), configurable: true });
  const fakeWindow = {};
  Object.defineProperty(fakeWindow, 'localStorage', { get: trap('window.localStorage'), configurable: true });
  Object.defineProperty(fakeWindow, 'sessionStorage', { get: trap('window.sessionStorage'), configurable: true });
  Object.defineProperty(globalThis, 'window', { value: fakeWindow, configurable: true, writable: true });

  return {
    accesses,
    restore() {
      for (const [name, descriptor] of Object.entries(saved)) {
        if (descriptor) {
          Object.defineProperty(globalThis, name, descriptor);
        } else {
          delete globalThis[name];
        }
      }
    }
  };
}

describe('Sprint data does not depend on browser storage', () => {
  test('startup, every edit, Reset, and save/restore work with storage blocked and never touch it', () => {
    const blocked = blockStorage();
    try {
      const dm = new DataManager();
      assert.equal(dm.addIssue(makeIssue('PROJ-111', 5)).success, true);
      assert.equal(dm.updateIssue('PROJ-106', { status: 'Done', completedDay: 4 }).success, true);
      assert.equal(dm.deleteIssue('PROJ-110').success, true);
      assert.equal(dm.setSprint({ sprintName: 'Blocked storage sprint' }).success, true);
      assert.equal(dm.setCurrentDay(6).success, true);
      dm.getKPIs();
      const saved = dm.serialize();
      assert.equal(dm.restoreFromJSON(saved).success, true);
      assert.equal(dm.restoreFromJSON('{').success, false);
      dm.reset();

      assert.equal(dm.getIssues().length, 10);
      assert.deepEqual(blocked.accesses, [], 'no code path may read or write browser storage');
    } finally {
      blocked.restore();
    }
  });
});
