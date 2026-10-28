import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderSprintConfigFormHTML } from '../../src/js/ui/sprintBanner.js';

test('BDC-SR-001: invalid duration is escaped when redisplaying a rejected config', () => {
  const html = renderSprintConfigFormHTML({ durationDays: '\" autofocus onfocus=\"alert(1)' });
  assert.ok(html.includes('&quot; autofocus onfocus=&quot;alert(1)'));
  assert.ok(!html.includes('value="" autofocus'));
});

test('BDC-SR-005: policy precedes scripts and disallows inline script/eval', () => {
  const html = readFileSync(new URL('../../src/index.html', import.meta.url), 'utf8');
  const policy = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
  assert.ok(html.indexOf('Content-Security-Policy') < html.indexOf('<script'));
  assert.ok(policy.includes("script-src 'self'"));
  assert.ok(policy.includes("object-src 'none'"));
  assert.ok(policy.includes("base-uri 'none'"));
  assert.ok(!policy.includes('unsafe-inline'));
  assert.ok(!policy.includes('unsafe-eval'));
  assert.ok(!/<script(?![^>]*\bsrc=)[^>]*>/.test(html));
});
