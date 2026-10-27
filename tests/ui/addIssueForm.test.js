import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { renderAddIssueFormHTML, parseAddIssueFormValues } from '../../src/js/ui/addIssueForm.js';

describe('UI: AddIssueForm (BDC-F-006, BDC-NF-002, BDC-SR-001)', () => {
  describe('renderAddIssueFormHTML', () => {
    it('contains all six labelled controls and data-testid hooks', () => {
      const html = renderAddIssueFormHTML();

      // Form tag with novalidate
      assert.ok(html.includes('<form class="add-issue-form" novalidate'));
      assert.ok(html.includes('data-testid="add-issue-form"'));

      // 1. Issue Key
      assert.ok(html.includes('for="add-issue-key"'));
      assert.ok(html.includes('id="add-issue-key"'));
      assert.ok(html.includes('data-testid="input-issue-key"'));

      // 2. Summary
      assert.ok(html.includes('for="add-issue-summary"'));
      assert.ok(html.includes('id="add-issue-summary"'));
      assert.ok(html.includes('data-testid="input-summary"'));

      // 3. Issue Type
      assert.ok(html.includes('for="add-issue-type"'));
      assert.ok(html.includes('id="add-issue-type"'));
      assert.ok(html.includes('data-testid="select-issue-type"'));

      // 4. Story Points (inputmode="decimal", NOT type="number")
      assert.ok(html.includes('for="add-issue-points"'));
      assert.ok(html.includes('id="add-issue-points"'));
      assert.ok(html.includes('inputmode="decimal"'));
      assert.ok(html.includes('data-testid="input-story-points"'));

      // 5. Status
      assert.ok(html.includes('for="add-issue-status"'));
      assert.ok(html.includes('id="add-issue-status"'));
      assert.ok(html.includes('data-testid="select-status"'));

      // 6. Completion Day
      assert.ok(html.includes('for="add-issue-completed-day"'));
      assert.ok(html.includes('id="add-issue-completed-day"'));
      assert.ok(html.includes('data-testid="input-completed-day"'));
      assert.ok(html.includes('data-testid="completed-day-group"'));

      // Submit button
      assert.ok(html.includes('data-testid="btn-add-issue"'));
      assert.ok(html.includes('Add Issue'));
    });

    it('hides Completion Day input when status is not Done', () => {
      const htmlTodo = renderAddIssueFormHTML({ values: { status: 'To Do' } });
      assert.ok(htmlTodo.includes('id="add-issue-completed-day-group" class="form-group" data-testid="completed-day-group" hidden'));

      const htmlProgress = renderAddIssueFormHTML({ values: { status: 'In Progress' } });
      assert.ok(htmlProgress.includes('id="add-issue-completed-day-group" class="form-group" data-testid="completed-day-group" hidden'));
    });

    it('shows Completion Day input when status is Done', () => {
      const htmlDone = renderAddIssueFormHTML({ values: { status: 'Done' } });
      assert.ok(!htmlDone.includes('id="add-issue-completed-day-group" class="form-group" data-testid="completed-day-group" hidden'));
      assert.ok(htmlDone.includes('id="add-issue-completed-day-group" class="form-group" data-testid="completed-day-group" '));
    });

    it('escapes user-supplied values containing XSS payloads in HTML attributes', () => {
      const xssValues = {
        issueKey: '"><script>alert(1)</script>',
        summary: '<img src=x onerror=alert(1)>',
        storyPoints: '5" onfocus="alert(1)',
        completedDay: '4" onfocus="alert(1)'
      };

      const html = renderAddIssueFormHTML({ values: xssValues });
      assert.ok(!html.includes('"><script>'));
      assert.ok(html.includes('&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;'));
      assert.ok(!html.includes('<img src=x'));
      assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
    });

    it('escapes error text safely in the error list', () => {
      const errors = ['<script>bad()</script>', 'Invalid & unsafe value'];
      const html = renderAddIssueFormHTML({ errors });

      assert.ok(html.includes('role="alert"'));
      assert.ok(!html.includes('<script>bad()</script>'));
      assert.ok(html.includes('&lt;script&gt;bad()&lt;/script&gt;'));
      assert.ok(html.includes('Invalid &amp; unsafe value'));
    });
  });

  describe('parseAddIssueFormValues', () => {
    it('maps FormData instance correctly', () => {
      const map = new Map([
        ['issueKey', 'PROJ-200'],
        ['summary', 'Fix responsive overflow'],
        ['issueType', 'Bug'],
        ['storyPoints', '3.5'],
        ['status', 'Done'],
        ['completedDay', '4']
      ]);

      const mockFormData = {
        get: (k) => map.get(k) ?? null
      };

      const parsed = parseAddIssueFormValues(mockFormData);
      assert.deepEqual(parsed, {
        issueKey: 'PROJ-200',
        summary: 'Fix responsive overflow',
        issueType: 'Bug',
        storyPoints: '3.5',
        status: 'Done',
        completedDay: '4'
      });
    });

    it('maps plain object correctly with defaults', () => {
      const parsed = parseAddIssueFormValues({});
      assert.deepEqual(parsed, {
        issueKey: '',
        summary: '',
        issueType: 'Story',
        storyPoints: '',
        status: 'To Do',
        completedDay: ''
      });
    });

    it('handles null/undefined gracefully', () => {
      const parsed = parseAddIssueFormValues(null);
      assert.equal(parsed.issueKey, '');
      assert.equal(parsed.issueType, 'Story');
      assert.equal(parsed.status, 'To Do');
    });
  });
});
