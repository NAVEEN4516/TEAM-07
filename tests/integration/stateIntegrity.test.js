import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DataManager } from '../../src/js/data/dataManager.js';
import { getDefaultDataset } from '../../src/js/data/defaultDataset.js';
import { renderSprintBannerHTML } from '../../src/js/ui/sprintBanner.js';
import { renderAddIssueFormHTML } from '../../src/js/ui/addIssueForm.js';
import { buildTableRows } from '../../src/js/ui/backlogTable.js';
import {
  snapshot,
  assertLayersConsistent,
  makeIssue,
  recordNotifications
} from './pipelineHelpers.js';

/**
 * State-integrity integration tests (BDC-NF-003, BDC-SR-001, BDC-SR-002, BDC-SR-003).
 *
 * A rejected operation must leave every layer exactly as it was: the stored
 * state, the views derived from it and the subscribers' view of it. These
 * tests compare full snapshots, so a half-applied change in any layer fails.
 */

/** Operations that must be rejected, each labelled for the test title. */
const REJECTED_OPERATIONS = [
  ['add: negative points', dm => dm.addIssue(makeIssue('X-1', -3))],
  ['add: non-numeric points', dm => dm.addIssue({ ...makeIssue('X-1', 1), storyPoints: 'abc' })],
  ['add: infinite points', dm => dm.addIssue(makeIssue('X-1', Infinity))],
  ['add: empty key', dm => dm.addIssue(makeIssue('', 1))],
  ['add: duplicate key', dm => dm.addIssue(makeIssue('PROJ-101', 1))],
  ['add: duplicate key in other case with spaces', dm => dm.addIssue(makeIssue('  proj-101 ', 1))],
  ['add: empty summary', dm => dm.addIssue({ ...makeIssue('X-1', 1), summary: '  ' })],
  ['add: Done after the Current Day', dm => dm.addIssue(makeIssue('X-1', 1, 'Done', 5))],
  ['add: Done without a day', dm => dm.addIssue(makeIssue('X-1', 1, 'Done', null))],
  ['update: Done after the Current Day', dm => dm.updateIssue('PROJ-106', { status: 'Done', completedDay: 5 })],
  ['update: Done beyond the duration', dm => dm.updateIssue('PROJ-106', { status: 'Done', completedDay: 11 })],
  ['update: Done on day 0', dm => dm.updateIssue('PROJ-106', { status: 'Done', completedDay: 0 })],
  ['update: Done with a fractional day', dm => dm.updateIssue('PROJ-106', { status: 'Done', completedDay: 2.5 })],
  ['update: Done with a text day', dm => dm.updateIssue('PROJ-106', { status: 'Done', completedDay: '3' })],
  ['update: Done without a day', dm => dm.updateIssue('PROJ-106', { status: 'Done' })],
  ['update: unknown status', dm => dm.updateIssue('PROJ-106', { status: 'Closed' })],
  ['update: unknown issue', dm => dm.updateIssue('PROJ-999', { status: 'Done', completedDay: 2 })],
  ['update: malformed changes', dm => dm.updateIssue('PROJ-106', null)],
  ['delete: unknown issue', dm => dm.deleteIssue('PROJ-999')],
  ['sprint: zero duration', dm => dm.setSprint({ durationDays: 0 })],
  ['sprint: negative duration', dm => dm.setSprint({ durationDays: -3 })],
  ['sprint: text duration', dm => dm.setSprint({ durationDays: 'abc' })],
  ['sprint: fractional duration', dm => dm.setSprint({ durationDays: 2.5 })],
  ['sprint: duration beyond 60', dm => dm.setSprint({ durationDays: 61 })],
  ['sprint: empty name', dm => dm.setSprint({ sprintName: '   ' })],
  ['sprint: end before start', dm => dm.setSprint({ startDate: '2026-10-30', endDate: '2026-10-26' })],
  ['sprint: impossible date', dm => dm.setSprint({ startDate: '2026-02-30', endDate: '2026-12-01' })],
  ['sprint: valid name with invalid duration', dm => dm.setSprint({ sprintName: 'Renamed', durationDays: 0 })],
  ['sprint: valid duration with inverted dates', dm => dm.setSprint({ durationDays: 7, startDate: '2026-10-30', endDate: '2026-10-26' })],
  ['sprint: valid name and duration with a bad date', dm => dm.setSprint({ sprintName: 'Renamed', durationDays: 7, endDate: 'tomorrow' })],
  ['day: below zero', dm => dm.setCurrentDay(-1)],
  ['day: beyond the duration', dm => dm.setCurrentDay(11)],
  ['day: fractional', dm => dm.setCurrentDay(2.5)],
  ['day: text', dm => dm.setCurrentDay('abc')],
  ['day: NaN', dm => dm.setCurrentDay(NaN)],
  ['day: Infinity', dm => dm.setCurrentDay(Infinity)]
];

describe('State integrity across layers', () => {
  describe('Rejected operations change nothing (TC-NF-03.1, TC-SR-02.1, TC-F-01.2, TC-F-03.2, TC-F-06.2, TC-F-07.2)', () => {
    for (const [label, attempt] of REJECTED_OPERATIONS) {
      test(`${label} is rejected with a message and no layer changes`, () => {
        const dm = new DataManager();
        const before = snapshot(dm);
        const notifications = recordNotifications(dm);

        const result = attempt(dm);

        assert.equal(result.success, false, `${label} must be rejected`);
        const messages = result.errors ?? [result.error];
        assert.ok(messages.length > 0 && messages.every(m => typeof m === 'string' && m.length > 0), 'a message must be shown');
        assert.equal(notifications.count(), 0, 'a rejected operation must not publish an update');
        assert.deepEqual(snapshot(dm), before, 'every layer must be unchanged');
      });
    }

    test('after the whole rejected sequence the state is still valid and consistent', () => {
      const dm = new DataManager();
      const before = snapshot(dm);
      for (const [, attempt] of REJECTED_OPERATIONS) {
        attempt(dm);
      }
      const after = snapshot(dm);

      assert.deepEqual(after, before);
      assertLayersConsistent(after, 'after the rejected sequence');
    });

    test('a rejected change after a successful one keeps the successful change only', () => {
      const dm = new DataManager();
      dm.updateIssue('PROJ-106', { status: 'Done', completedDay: 4 });
      const afterSuccess = snapshot(dm);

      assert.equal(dm.updateIssue('PROJ-107', { status: 'Done', completedDay: 9 }).success, false);
      assert.equal(dm.addIssue(makeIssue('PROJ-101', 2)).success, false);
      assert.equal(dm.setSprint({ durationDays: 0 }).success, false);

      assert.deepEqual(snapshot(dm), afterSuccess);
      assert.equal(snapshot(dm).kpiCards.completed, '32');
    });
  });

  describe('Successful operations publish exactly one consistent update', () => {
    const SUCCESSFUL_OPERATIONS = [
      ['add issue', dm => dm.addIssue(makeIssue('PROJ-111', 5))],
      ['mark Done', dm => dm.updateIssue('PROJ-106', { status: 'Done', completedDay: 4 })],
      ['reopen', dm => dm.updateIssue('PROJ-105', { status: 'In Progress' })],
      ['delete issue', dm => dm.deleteIssue('PROJ-110')],
      ['change Current Day', dm => dm.setCurrentDay(7)],
      ['configure sprint', dm => dm.setSprint({ sprintName: 'Renamed', durationDays: 8 })]
    ];

    for (const [label, operate] of SUCCESSFUL_OPERATIONS) {
      test(`${label}: one notification, and subscribers already see the finished state`, () => {
        const dm = new DataManager();
        const notifications = recordNotifications(dm);

        assert.equal(operate(dm).success, true);

        assert.equal(notifications.count(), 1);
        assert.equal(notifications.states()[0], dm.serialize(), 'the subscriber must see the final state, not a partial one');
        assertLayersConsistent(snapshot(dm), label);
      });
    }
  });

  describe('Invalid saved state never reaches the views (BDC-SR-003, TC-SR-03.1)', () => {
    const goodSprint = () => getDefaultDataset().sprint;
    const goodIssues = () => getDefaultDataset().issues;

    const INVALID_PAYLOADS = [
      ['malformed JSON', '{"sprint": {"sprintName": '],
      ['plain text', 'not json at all'],
      ['empty string', ''],
      ['JSON null', 'null'],
      ['JSON array', '[]'],
      ['empty object', '{}'],
      ['number', '42'],
      ['valid sprint with invalid issues (no partial adoption)', JSON.stringify({ sprint: { ...goodSprint(), sprintName: 'Partly trusted' }, issues: [{ issueKey: 'BAD' }] })],
      ['invalid sprint with valid issues (no partial adoption)', JSON.stringify({ sprint: { ...goodSprint(), sprintName: 'Partly trusted', durationDays: 0 }, issues: goodIssues().slice(0, 3) })],
      ['negative story points', JSON.stringify({ sprint: goodSprint(), issues: goodIssues().map((issue, i) => (i === 0 ? { ...issue, storyPoints: -5 } : issue)) })],
      ['story points saved as text', JSON.stringify({ sprint: goodSprint(), issues: goodIssues().map((issue, i) => (i === 0 ? { ...issue, storyPoints: '5' } : issue)) })],
      ['Done issue without a day', JSON.stringify({ sprint: goodSprint(), issues: goodIssues().map((issue, i) => (i === 0 ? { ...issue, completedDay: null } : issue)) })],
      ['duplicate issue keys', JSON.stringify({ sprint: goodSprint(), issues: [...goodIssues(), goodIssues()[0]] })],
      ['Current Day beyond the duration', JSON.stringify({ sprint: { ...goodSprint(), currentDay: 11 }, issues: goodIssues() })],
      ['duration beyond 60', JSON.stringify({ sprint: { ...goodSprint(), durationDays: 61 }, issues: goodIssues() })]
    ];

    for (const [label, payload] of INVALID_PAYLOADS) {
      test(`${label}: defaults are restored in every layer and the reasons are returned`, () => {
        const dm = new DataManager();
        const defaults = snapshot(dm);
        dm.addIssue(makeIssue('SESSION-1', 7));
        dm.setCurrentDay(9);

        let result;
        assert.doesNotThrow(() => {
          result = dm.restoreFromJSON(payload);
        });

        assert.equal(result.success, false);
        assert.ok(result.errors.length > 0 && result.errors.every(message => typeof message === 'string' && message.length > 0));
        assert.deepEqual(snapshot(dm), defaults, 'the views must show the default dataset, never a mixture');
        assertLayersConsistent(snapshot(dm), label);
      });
    }

    test('null and undefined storage values restore the defaults', () => {
      for (const raw of [null, undefined]) {
        const dm = new DataManager();
        const defaults = snapshot(dm);
        dm.setCurrentDay(2);

        assert.equal(dm.restoreFromJSON(raw).success, false);
        assert.deepEqual(snapshot(dm), defaults);
      }
    });

    test('a valid saved state is restored exactly and drives every layer', () => {
      const source = new DataManager();
      source.addIssue(makeIssue('PROJ-111', 5, 'Done', 2));
      source.deleteIssue('PROJ-108');
      source.setSprint({ sprintName: 'Restored sprint', durationDays: 8, startDate: '2026-11-02', endDate: '2026-11-11' });
      source.setCurrentDay(5);
      const saved = source.serialize();

      const restored = new DataManager();
      const result = restored.restoreFromJSON(saved);

      assert.deepEqual(result, { success: true, errors: [] });
      assert.deepEqual(restored.loadErrors, []);
      assert.deepEqual(snapshot(restored), snapshot(source));
      assert.equal(snapshot(restored).sprint.sprintName, 'Restored sprint');
      assert.equal(snapshot(restored).rows.length, 10);
      assertLayersConsistent(snapshot(restored), 'restored saved state');
    });

    test('saved state with extra or hostile fields is cleaned before it is used', () => {
      const tampered = JSON.stringify({
        sprint: { ...goodSprint(), totalStoryPoints: 9999, injected: '<script>alert(1)</script>' },
        issues: goodIssues().map(issue => ({ ...issue, injected: '<img src=x onerror=alert(1)>' })),
        unrelated: { polluted: true }
      });
      const dm = new DataManager();

      assert.equal(dm.restoreFromJSON(tampered).success, true);
      const snap = snapshot(dm);

      assert.equal(snap.kpiCards.totalScope, '50', 'the stored total must be recomputed, not trusted');
      assert.doesNotMatch(snap.stored, /injected|unrelated|polluted/);
      assertLayersConsistent(snap, 'tampered saved state');
    });
  });

  describe('Hostile text stays inert through the whole pipeline (TC-SR-01.1)', () => {
    const HOSTILE_KEY = 'K-<img src=x onerror=alert(1)>';
    const HOSTILE_SUMMARY = '<script>alert("xss")</script> & "quotes" \'apostrophes\'';
    const HOSTILE_SPRINT = '"><script>alert(1)</script><b onmouseover=alert(2)>';

    test('the stored text is kept verbatim and the views receive it as plain data', () => {
      const dm = new DataManager();
      const result = dm.addIssue({ ...makeIssue(HOSTILE_KEY, 2), summary: HOSTILE_SUMMARY });
      assert.equal(result.success, true);

      const rows = buildTableRows(dm.getIssues());
      assert.equal(rows[10].issueKey, HOSTILE_KEY, 'table rows are plain strings; the table renders them with textContent');
      assert.equal(rows[10].summary, HOSTILE_SUMMARY);
      assert.equal(dm.getKPIs().totalPoints, 52, 'hostile text must not affect the numbers');
    });

    test('a hostile sprint name is escaped in the banner and cannot break out of any attribute', () => {
      const dm = new DataManager();
      assert.equal(dm.setSprint({ sprintName: HOSTILE_SPRINT }).success, true);

      const html = renderSprintBannerHTML(dm.getSprint());
      // Escaped text may still read "onmouseover=alert(2)"; what matters is that no real tag opens.
      assert.doesNotMatch(html, /<script|<b[\s>]/);
      assert.match(html, /&quot;&gt;&lt;script&gt;alert\(1\)&lt;\/script&gt;&lt;b onmouseover=alert\(2\)&gt;/);
    });

    test('hostile text survives a save and reload as inert data', () => {
      const dm = new DataManager();
      dm.addIssue({ ...makeIssue(HOSTILE_KEY, 2), summary: HOSTILE_SUMMARY });
      dm.setSprint({ sprintName: HOSTILE_SPRINT });

      const restored = new DataManager();
      assert.equal(restored.restoreFromJSON(dm.serialize()).success, true);

      assert.equal(restored.getIssues()[10].summary, HOSTILE_SUMMARY);
      assert.doesNotMatch(renderSprintBannerHTML(restored.getSprint()), /<script|<b /);
    });

    test('rejected hostile input is echoed back escaped when the Add Issue form re-renders', () => {
      const html = renderAddIssueFormHTML({
        values: { issueKey: HOSTILE_KEY, summary: HOSTILE_SUMMARY, storyPoints: '-1" onfocus="alert(1)', completedDay: '' },
        errors: [HOSTILE_SUMMARY]
      });

      assert.doesNotMatch(html, /<script>alert|<img src=x|" onfocus="alert/);
      assert.match(html, /&lt;script&gt;alert\(&quot;xss&quot;\)&lt;\/script&gt;/);
    });

    test('type and status values are only compared against known options, never written into the markup', () => {
      const html = renderAddIssueFormHTML({ values: { issueType: HOSTILE_SPRINT, status: HOSTILE_SPRINT } });

      assert.doesNotMatch(html, /<script>alert\(1\)|<b[\s>]/);
    });
  });
});
