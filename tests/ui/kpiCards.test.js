import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  renderKPICardsHTML,
  getStatusBadgeMetadata,
  formatVariance
} from '../../src/js/ui/kpiCards.js';

import { SCHEDULE_STATUS } from '../../src/js/logic/burndownEngine.js';

describe('UI: KPICards (BDC-F-015, BDC-NF-002)', () => {
  describe('formatVariance', () => {
    test('formats positive variance with leading plus sign', () => {
      assert.equal(formatVariance(9), '+9');
      assert.equal(formatVariance(1), '+1');
    });

    test('formats zero and negative variance correctly', () => {
      assert.equal(formatVariance(0), '0');
      assert.equal(formatVariance(-2), '-2');
      assert.equal(formatVariance(-15), '-15');
    });

    test('handles non-numeric or non-finite variance gracefully', () => {
      assert.equal(formatVariance(NaN), '0');
      assert.equal(formatVariance(null), '0');
    });
  });

  describe('getStatusBadgeMetadata (BDC-NF-002 Accessible status indicators)', () => {
    test('maps Ahead of Schedule to positive modifier and distinct label', () => {
      const meta = getStatusBadgeMetadata(SCHEDULE_STATUS.AHEAD);
      assert.equal(meta.cssModifier, 'status--ahead');
      assert.equal(meta.label, 'Ahead of Schedule');
    });

    test('maps On Track to neutral modifier', () => {
      const meta = getStatusBadgeMetadata(SCHEDULE_STATUS.ON_TRACK);
      assert.equal(meta.cssModifier, 'status--on-track');
      assert.equal(meta.label, 'On Track');
    });

    test('maps Behind Schedule to alert modifier', () => {
      const meta = getStatusBadgeMetadata(SCHEDULE_STATUS.BEHIND);
      assert.equal(meta.cssModifier, 'status--behind');
      assert.equal(meta.label, 'Behind Schedule');
    });
  });

  describe('renderKPICardsHTML (BDC-F-015)', () => {
    test('TC-F-15.1 - renders all 6 live KPI cards with default dataset Day 4 values', () => {
      const defaultMetrics = {
        totalScope: 50,
        totalPoints: 50,
        completedPoints: 29,
        remainingPoints: 21,
        daysElapsed: 4,
        daysLeft: 6,
        variance: 9,
        scheduleStatus: 'Ahead of Schedule'
      };

      const html = renderKPICardsHTML(defaultMetrics);

      // Verify presence of all 6 cards
      assert.ok(html.includes('data-testid="kpi-total-scope"'), 'Card 1: Total Scope');
      assert.ok(html.includes('data-testid="kpi-completed-points"'), 'Card 2: Completed Points');
      assert.ok(html.includes('data-testid="kpi-remaining-points"'), 'Card 3: Remaining Points');
      assert.ok(html.includes('data-testid="kpi-days-elapsed"'), 'Card 4: Days Elapsed');
      assert.ok(html.includes('data-testid="kpi-days-left"'), 'Card 5: Days Left');
      assert.ok(html.includes('data-testid="kpi-schedule-status"'), 'Card 6: Schedule Status');

      // Verify exact metric values
      assert.ok(html.includes('<span class="kpi-value">50</span>'));
      assert.ok(html.includes('<span class="kpi-value">29</span>'));
      assert.ok(html.includes('<span class="kpi-value">21</span>'));
      assert.ok(html.includes('<span class="kpi-value">4</span>'));
      assert.ok(html.includes('<span class="kpi-value">6</span>'));
      assert.ok(html.includes('Ahead of Schedule'));
      assert.ok(html.includes('Variance: <strong>+9</strong> pts'));
      assert.ok(html.includes('status--ahead'));
    });

    test('TC-F-15.2 - renders Behind Schedule status and negative variance cleanly', () => {
      const behindMetrics = {
        totalScope: 50,
        completedPoints: 8,
        remainingPoints: 42,
        daysElapsed: 2,
        daysLeft: 8,
        variance: -2,
        scheduleStatus: 'Behind Schedule'
      };

      const html = renderKPICardsHTML(behindMetrics);

      assert.ok(html.includes('<span class="kpi-value">8</span>'));
      assert.ok(html.includes('<span class="kpi-value">42</span>'));
      assert.ok(html.includes('Behind Schedule'));
      assert.ok(html.includes('Variance: <strong>-2</strong> pts'));
      assert.ok(html.includes('status--behind'));
    });

    test('supports empty or partial metrics gracefully without throwing', () => {
      const html = renderKPICardsHTML({});
      assert.ok(html.includes('data-testid="kpi-dashboard"'));
      assert.ok(html.includes('Total Scope'));
      assert.ok(html.includes('On Track'));
    });
  });
});
