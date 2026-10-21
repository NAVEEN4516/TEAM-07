import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { buildChartConfig, getMarkerDay } from '../../src/js/ui/chartConfig.js';
import { computeAll } from '../../src/js/logic/burndownEngine.js';
import { getDefaultDataset } from '../../src/js/data/defaultDataset.js';

describe('BDC-F-013 & BDC-F-014: Burndown Chart Config & Marker Tests', () => {
  const dataset = getDefaultDataset();
  const metrics = computeAll(dataset.sprint, dataset.issues);
  const series = {
    ideal: metrics.ideal,
    actual: metrics.actual,
    durationDays: dataset.sprint.durationDays
  };

  test('TC-F-13.1: chart config contains responsive line chart properties, datasets, axes, and legend', () => {
    const config = buildChartConfig(series, 4);

    // Type and responsiveness
    assert.equal(config.type, 'line');
    assert.equal(config.options.responsive, true);
    assert.equal(config.options.maintainAspectRatio, false);

    // Datasets existence
    assert.equal(config.data.datasets.length, 2);
    const idealDs = config.data.datasets.find(d => d.label === 'Ideal');
    const actualDs = config.data.datasets.find(d => d.label === 'Actual');
    assert.ok(idealDs, 'Ideal dataset must be present');
    assert.ok(actualDs, 'Actual dataset must be present');

    // Visual distinction without colour (dashed vs solid)
    assert.ok(Array.isArray(idealDs.borderDash) && idealDs.borderDash.length > 0, 'Ideal line must be dashed');
    assert.ok(!actualDs.borderDash || actualDs.borderDash.length === 0, 'Actual line must be solid');
    assert.equal(idealDs.pointRadius, 0, 'Ideal line must not render point markers');
    assert.ok(actualDs.pointRadius > 0, 'Actual line must render point markers');
    assert.equal(actualDs.spanGaps, false, 'Actual line must not span gaps across unelapsed days');

    // Axis titles & legend
    assert.equal(config.options.scales.x.title.text, 'Sprint Day');
    assert.equal(config.options.scales.y.title.text, 'Remaining Story Points');
    assert.equal(config.options.scales.y.min, 0);
    assert.equal(config.options.plugins.legend.display, true);
  });

  test('TC-F-13.1: Ideal dataset contains values 50, 45, 40, ..., 0 across days 0..10', () => {
    const config = buildChartConfig(series, 4);
    const idealDs = config.data.datasets.find(d => d.label === 'Ideal');
    const expectedIdeal = [50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0];

    assert.deepEqual(idealDs.data, expectedIdeal, 'Ideal values must strictly follow 50, 45, ..., 0');
  });

  test('TC-F-13.1: Actual dataset contains values 50, 45, 42, 34, 21 for days 0-4 and nulls thereafter', () => {
    const config = buildChartConfig(series, 4);
    const actualDs = config.data.datasets.find(d => d.label === 'Actual');
    const expectedActual = [50, 45, 42, 34, 21, null, null, null, null, null, null];

    assert.deepEqual(actualDs.data, expectedActual, 'Actual values for days 0..4 must be 50, 45, 42, 34, 21 followed by nulls');
  });

  test('TC-F-13.1: future unelapsed actual values are strictly null and never converted to zero', () => {
    const config = buildChartConfig(series, 4);
    const actualDs = config.data.datasets.find(d => d.label === 'Actual');

    // Verify days 5 through 10 are strictly null, not 0
    for (let day = 5; day <= 10; day++) {
      assert.strictEqual(actualDs.data[day], null, `Day ${day} must be strictly null`);
      assert.notStrictEqual(actualDs.data[day], 0, `Day ${day} must never be coerced to 0`);
    }
  });

  test('TC-F-13.1: changing currentDay dynamically changes the count of plotted Actual points', () => {
    // Current day = 2
    const configDay2 = buildChartConfig(series, 2);
    const actualDay2 = configDay2.data.datasets.find(d => d.label === 'Actual').data;
    assert.deepEqual(actualDay2, [50, 45, 42, null, null, null, null, null, null, null, null]);

    // Current day = 0
    const configDay0 = buildChartConfig(series, 0);
    const actualDay0 = configDay0.data.datasets.find(d => d.label === 'Actual').data;
    assert.deepEqual(actualDay0, [50, null, null, null, null, null, null, null, null, null, null]);

    // Current day = 10 (all days plotted if present in series)
    const configDay10 = buildChartConfig(series, 10);
    const actualDay10 = configDay10.data.datasets.find(d => d.label === 'Actual').data;
    assert.equal(actualDay10[0], 50);
    assert.equal(actualDay10[4], 21);
    assert.equal(actualDay10.length, 11);
  });

  test('TC-F-14.1: getMarkerDay handles first, intermediate, and final sprint days correctly and clamps boundaries', () => {
    // First day
    assert.equal(getMarkerDay(0, 10), 0, 'First day (Day 0) must return 0');
    // Intermediate days
    assert.equal(getMarkerDay(4, 10), 4, 'Day 4 must return 4');
    assert.equal(getMarkerDay(7, 10), 7, 'Day 7 must return 7');
    // Final day
    assert.equal(getMarkerDay(10, 10), 10, 'Final day (Day 10) must return 10');
    // Out-of-bounds clamps
    assert.equal(getMarkerDay(-5, 10), 0, 'Negative day must clamp to 0');
    assert.equal(getMarkerDay(15, 10), 10, 'Out-of-range day must clamp to durationDays (10)');
    assert.equal(getMarkerDay('4', 10), 4, 'String input "4" must be parsed correctly');
  });

  test('TC-F-13.2: handles empty or edge-case datasets gracefully without throwing', () => {
    const emptyMetrics = computeAll({ durationDays: 10, currentDay: 0 }, []);
    const emptyConfig = buildChartConfig({
      ideal: emptyMetrics.ideal,
      actual: emptyMetrics.actual,
      durationDays: 10
    }, 0);

    assert.equal(emptyConfig.data.datasets.length, 2);
    assert.equal(emptyConfig.data.labels.length, 11);
    assert.deepEqual(emptyConfig.data.datasets[0].data, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    assert.strictEqual(emptyConfig.data.datasets[1].data[0], 0);
    for (let d = 1; d <= 10; d++) {
      assert.strictEqual(emptyConfig.data.datasets[1].data[d], null);
    }

    // Completely empty object
    const nullConfig = buildChartConfig({}, 0);
    assert.ok(nullConfig.data.datasets);
  });
});
