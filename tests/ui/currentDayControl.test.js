import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  renderCurrentDayControlHTML
} from '../../src/js/ui/currentDayControl.js';

describe('UI: CurrentDayControl (BDC-F-003, BDC-NF-002)', () => {
  describe('renderCurrentDayControlHTML', () => {
    test('renders interactive range slider with attributes bound to sprint duration and current day', () => {
      const html = renderCurrentDayControlHTML(4, 10);

      assert.ok(html.includes('data-testid="current-day-control"'));
      assert.ok(html.includes('data-testid="current-day-slider"'));
      assert.ok(html.includes('min="0"'));
      assert.ok(html.includes('max="10"'));
      assert.ok(html.includes('value="4"'));
      assert.ok(html.includes('aria-valuenow="4"'));
      assert.ok(html.includes('aria-valuemax="10"'));
      assert.ok(html.includes('Day <strong>4</strong> of 10'));
    });

    test('stepper buttons are appropriately enabled/disabled on boundaries', () => {
      // At Day 0 (start boundary): Prev button must be disabled, Next button enabled
      const html0 = renderCurrentDayControlHTML(0, 10);
      assert.ok(html0.includes('data-testid="btn-prev-day" disabled'));
      assert.ok(!html0.includes('data-testid="btn-next-day" disabled'));

      // At Day 10 (end boundary): Next button must be disabled, Prev button enabled
      const html10 = renderCurrentDayControlHTML(10, 10);
      assert.ok(!html10.includes('data-testid="btn-prev-day" disabled'));
      assert.ok(html10.includes('data-testid="btn-next-day" disabled'));

      // At Day 4 (mid): Both buttons enabled
      const html4 = renderCurrentDayControlHTML(4, 10);
      assert.ok(!html4.includes('data-testid="btn-prev-day" disabled'));
      assert.ok(!html4.includes('data-testid="btn-next-day" disabled'));
    });

    test('safely clamps out-of-range inputs when rendering', () => {
      const htmlNeg = renderCurrentDayControlHTML(-5, 10);
      assert.ok(htmlNeg.includes('value="0"'));

      const htmlExceed = renderCurrentDayControlHTML(15, 10);
      assert.ok(htmlExceed.includes('value="10"'));
    });

    test('supports custom control ID', () => {
      const html = renderCurrentDayControlHTML(4, 10, { controlId: 'custom-timeline-slider' });
      assert.ok(html.includes('id="custom-timeline-slider"'));
      assert.ok(html.includes('for="custom-timeline-slider"'));
    });
  });
});
