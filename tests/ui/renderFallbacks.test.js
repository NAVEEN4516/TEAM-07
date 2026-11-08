import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { buildChartConfig } from '../../src/js/ui/chartConfig.js';
import { renderSprintBannerHTML, renderSprintConfigFormHTML } from '../../src/js/ui/sprintBanner.js';
import { renderCurrentDayControlHTML } from '../../src/js/ui/currentDayControl.js';
import { renderAddIssueFormHTML, parseAddIssueFormValues, mountAddIssueForm } from '../../src/js/ui/addIssueForm.js';
import { buildTableRows } from '../../src/js/ui/backlogTable.js';

/**
 * Render-layer defaults and theme tests (BDC-F-013, BDC-NF-002, BDC-NF-004, BDC-SR-004).
 *
 * The pure render functions must stay defined when given missing or unusable data,
 * and the dark theme must keep the chart readable, because users can reach both
 * states (first load, a rejected form, an OS set to dark mode).
 */

/** Relative luminance of a #rrggbb colour, from 0 (black) to 1 (white). */
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

describe('Chart theme (BDC-F-013, BDC-NF-002)', () => {
  const series = {
    ideal: [{ day: 0, value: 10 }, { day: 1, value: 5 }, { day: 2, value: 0 }],
    actual: [{ day: 0, value: 10 }, { day: 1, value: 8 }, { day: 2, value: null }],
    durationDays: 2
  };

  test('the dark theme keeps text light and the tooltip dark, so the chart stays readable on a dark page', () => {
    const light = buildChartConfig(series, 1, 'light').options;
    const dark = buildChartConfig(series, 1, 'dark').options;

    assert.ok(luminance(dark.plugins.legend.labels.color) > luminance(light.plugins.legend.labels.color), 'legend text must be lighter');
    assert.ok(luminance(dark.scales.x.ticks.color) > luminance(light.scales.x.ticks.color), 'axis labels must be lighter');
    assert.ok(luminance(dark.scales.x.title.color) > luminance(light.scales.x.title.color), 'axis titles must be lighter');
    assert.ok(luminance(dark.plugins.tooltip.backgroundColor) < luminance(light.plugins.tooltip.backgroundColor), 'tooltip background must be darker');
    assert.ok(luminance(dark.scales.x.grid.color) < luminance(light.scales.x.grid.color), 'grid lines must be darker');
  });

  test('both themes draw a dashed ideal line and a solid actual line with distinguishable colours', () => {
    for (const theme of ['light', 'dark']) {
      const [ideal, actual] = buildChartConfig(series, 1, theme).data.datasets;

      assert.deepEqual(ideal.borderDash, [6, 4], `${theme}: ideal line must be dashed`);
      assert.deepEqual(actual.borderDash, [], `${theme}: actual line must be solid`);
      assert.notEqual(ideal.borderColor, actual.borderColor, `${theme}: the two lines must differ in colour`);
    }
  });

  test('an unknown or missing theme falls back to the light theme', () => {
    const light = JSON.stringify(buildChartConfig(series, 1, 'light'));

    assert.equal(JSON.stringify(buildChartConfig(series, 1, 'sepia')), light);
    assert.equal(JSON.stringify(buildChartConfig(series, 1)), light);
  });

  test('the number of days is derived from the ideal series when no usable duration is given', () => {
    const ideal = [{ day: 0, value: 10 }, { day: 3, value: 0 }];

    for (const durationDays of [undefined, 0, -2, 'x']) {
      const config = buildChartConfig({ ideal, actual: [{ day: 0, value: 10 }], durationDays }, 2);

      assert.deepEqual(config.data.labels, [0, 1, 2, 3], `duration ${String(durationDays)}`);
      assert.deepEqual(config.data.datasets[0].data, [10, null, null, 0]);
    }
  });

  test('an empty series gives a single-day chart, not an error', () => {
    const config = buildChartConfig({}, 0);

    assert.deepEqual(config.data.labels, [0]);
    assert.deepEqual(config.data.datasets.map(dataset => dataset.data), [[null], [null]]);
  });
});

describe('Defaults for missing data (BDC-SR-004, TC-SR-04.2)', () => {
  test('the sprint banner shows neutral placeholders for an empty sprint', () => {
    for (const sprint of [{}, undefined, null]) {
      const html = renderSprintBannerHTML(sprint);

      assert.match(html, />Untitled Sprint</);
      assert.match(html, /0 working days/);
      assert.match(html, /N\/A &mdash; N\/A/);
      assert.match(html, /Day 0 of 0/);
      assert.doesNotMatch(html, /NaN|undefined|null/);
    }
  });

  test('the sprint form opens with a 10-day duration and an empty name when nothing is saved', () => {
    const html = renderSprintConfigFormHTML(undefined);

    assert.match(html, /id="input-duration-days"[\s\S]*?value="10"/);
    assert.match(html, /name="sprintName"[\s\S]*?value=""/);
    assert.doesNotMatch(html, /NaN|undefined|null/);
  });

  test('the Current Day control falls back to Day 0 of 10 for unusable values', () => {
    for (const [day, duration] of [[NaN, 'x'], [undefined, null], ['4', 0], [-3, -1]]) {
      const html = renderCurrentDayControlHTML(day, duration);

      assert.match(html, /Day <strong>0<\/strong> of 10/, `${String(day)} / ${String(duration)}`);
      assert.match(html, /data-testid="btn-prev-day" disabled/);
    }
  });

  test('the backlog table rows are plain strings even for incomplete issues', () => {
    assert.deepEqual(buildTableRows([{}, null, undefined, { issueKey: 'A-1', storyPoints: 0, completedDay: '' }]), [
      { issueKey: '', summary: '', issueType: '', storyPoints: '', status: '', completedDay: '--' },
      { issueKey: '', summary: '', issueType: '', storyPoints: '', status: '', completedDay: '--' },
      { issueKey: '', summary: '', issueType: '', storyPoints: '', status: '', completedDay: '--' },
      { issueKey: 'A-1', summary: '', issueType: '', storyPoints: '0', status: '', completedDay: '--' }
    ]);
    assert.deepEqual(buildTableRows('not a list'), []);
    assert.deepEqual(buildTableRows(), []);
  });
});

describe('Add Issue form rendering and parsing (BDC-F-006)', () => {
  test('a success message is shown in a polite status region and is escaped', () => {
    const html = renderAddIssueFormHTML({ successMessage: 'Added <b>PROJ-111</b> & done' });

    assert.match(html, /role="status"[\s\S]*?data-testid="add-issue-status"/);
    assert.match(html, /Added &lt;b&gt;PROJ-111&lt;\/b&gt; &amp; done/);
    assert.doesNotMatch(html, /<b>PROJ-111/);
  });

  test('the form pre-selects the chosen type and status after a rejected submission', () => {
    for (const issueType of ['Story', 'Task', 'Bug']) {
      const html = renderAddIssueFormHTML({ values: { issueType } });
      assert.match(html, new RegExp(`<option value="${issueType}" selected>`), `${issueType} must be selected`);
      assert.equal((html.match(/<option value="(Story|Task|Bug)" selected>/g) ?? []).length, 1, 'exactly one type is selected');
    }
  });

  test('the completion-day field is hidden until the status is Done', () => {
    assert.match(renderAddIssueFormHTML({ values: { status: 'To Do' } }), /data-testid="completed-day-group" hidden/);
    assert.match(renderAddIssueFormHTML({ values: { status: 'In Progress' } }), /data-testid="completed-day-group" hidden/);
    assert.doesNotMatch(renderAddIssueFormHTML({ values: { status: 'Done' } }), /data-testid="completed-day-group" hidden/);
  });

  test('parsing form data yields strings with defaults, from a missing form, FormData-like and plain objects', () => {
    const defaults = { issueKey: '', summary: '', issueType: 'Story', storyPoints: '', status: 'To Do', completedDay: '' };

    assert.deepEqual(parseAddIssueFormValues(null), defaults);
    assert.deepEqual(parseAddIssueFormValues(undefined), defaults);
    assert.deepEqual(parseAddIssueFormValues({ get: () => null }), defaults, 'FormData-like with every field missing');
    assert.deepEqual(parseAddIssueFormValues({}), defaults, 'plain object with every field missing');
    assert.deepEqual(parseAddIssueFormValues({ issueKey: 'K-1', storyPoints: 5, completedDay: null }), {
      ...defaults,
      issueKey: 'K-1',
      storyPoints: '5'
    });
  });

  test('mounting is a safe no-op without a usable container, and unmount clears a container that has no form', () => {
    for (const container of [null, undefined, 'text', 42]) {
      const mounted = mountAddIssueForm(container, {});
      assert.doesNotThrow(() => mounted.unmount());
    }

    const noForm = { innerHTML: 'stale', querySelector: () => null };
    const mounted = mountAddIssueForm(noForm, {});
    assert.notEqual(noForm.innerHTML, 'stale', 'the form markup is written first');
    mounted.unmount();
    assert.equal(noForm.innerHTML, '');
  });
});
