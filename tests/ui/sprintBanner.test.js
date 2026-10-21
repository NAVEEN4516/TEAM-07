import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  escapeHTML,
  renderSprintBannerHTML,
  renderSprintConfigFormHTML
} from '../../src/js/ui/sprintBanner.js';

describe('UI: SprintBanner (BDC-F-001, BDC-SR-001)', () => {
  const sampleSprint = {
    sprintName: 'Sprint 1 - Core Features',
    durationDays: 10,
    currentDay: 4,
    startDate: '2026-10-05',
    endDate: '2026-10-16'
  };

  describe('escapeHTML (BDC-SR-001 - XSS Prevention)', () => {
    test('TC-SR-01.1 - safely escapes markup, script tags, and attribute injections', () => {
      const maliciousScript = '<script>alert(1)</script>';
      const escapedScript = escapeHTML(maliciousScript);
      assert.ok(!escapedScript.includes('<script>'));
      assert.ok(escapedScript.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));

      const imgPayload = '<img src=x onerror=alert(1)>';
      const escapedImg = escapeHTML(imgPayload);
      assert.ok(!escapedImg.includes('<img'));
      assert.ok(escapedImg.includes('&lt;img src=x onerror=alert(1)&gt;'));

      const quotesPayload = 'Test "with" \'quotes\' & ampersand';
      const escapedQuotes = escapeHTML(quotesPayload);
      assert.ok(escapedQuotes.includes('&quot;with&quot;'));
      assert.ok(escapedQuotes.includes('&#39;quotes&#39;'));
      assert.ok(escapedQuotes.includes('&amp; ampersand'));
    });

    test('handles null and undefined gracefully', () => {
      assert.equal(escapeHTML(null), '');
      assert.equal(escapeHTML(undefined), '');
    });
  });

  describe('renderSprintBannerHTML (BDC-F-001)', () => {
    test('renders sprint metadata accurately per SRS specifications', () => {
      const html = renderSprintBannerHTML(sampleSprint);

      assert.ok(html.includes('Sprint 1 - Core Features'), 'Must display sprint name');
      assert.ok(html.includes('10 working days'), 'Must display duration in working days');
      assert.ok(html.includes('2026-10-05 &mdash; 2026-10-16'), 'Must display date range');
      assert.ok(html.includes('Day 4 of 10'), 'Must display timeline progress');
      assert.ok(html.includes('data-testid="sprint-banner"'));
      assert.ok(html.includes('data-testid="sprint-name"'));
      assert.ok(html.includes('data-testid="sprint-duration"'));
      assert.ok(html.includes('data-testid="sprint-dates"'));
      assert.ok(html.includes('data-testid="sprint-day-badge"'));
    });

    test('TC-SR-01.1 - renders user-controlled sprint name as inert text rather than executing markup', () => {
      const xssSprint = {
        sprintName: '<script>alert("pwned")</script>',
        durationDays: 10,
        currentDay: 4
      };

      const html = renderSprintBannerHTML(xssSprint);
      assert.ok(!html.includes('<script>alert("pwned")</script>'));
      assert.ok(html.includes('&lt;script&gt;alert(&quot;pwned&quot;)&lt;/script&gt;'));
    });

    test('supports editable toggle flag', () => {
      const withBtn = renderSprintBannerHTML(sampleSprint, { editable: true });
      assert.ok(withBtn.includes('data-testid="btn-configure-sprint"'));

      const withoutBtn = renderSprintBannerHTML(sampleSprint, { editable: false });
      assert.ok(!withoutBtn.includes('data-testid="btn-configure-sprint"'));
    });
  });

  describe('renderSprintConfigFormHTML (BDC-F-001 Configuration Form)', () => {
    test('renders form inputs pre-populated with current sprint parameters', () => {
      const html = renderSprintConfigFormHTML(sampleSprint);

      assert.ok(html.includes('value="Sprint 1 - Core Features"'));
      assert.ok(html.includes('value="10"'));
      assert.ok(html.includes('value="2026-10-05"'));
      assert.ok(html.includes('value="2026-10-16"'));
      assert.ok(html.includes('data-testid="sprint-config-form"'));
      assert.ok(html.includes('data-testid="btn-save-sprint"'));
      assert.ok(html.includes('data-testid="btn-cancel-sprint"'));
    });

    test('displays validation error messages in accessible alert region', () => {
      const errors = [
        'Sprint duration must be a positive integer greater than 0.',
        'Sprint end date must follow or equal start date.'
      ];

      const html = renderSprintConfigFormHTML(sampleSprint, errors);
      assert.ok(html.includes('data-testid="config-errors"'));
      assert.ok(html.includes('role="alert"'));
      assert.ok(html.includes('Sprint duration must be a positive integer greater than 0.'));
      assert.ok(html.includes('Sprint end date must follow or equal start date.'));
    });
  });
});
