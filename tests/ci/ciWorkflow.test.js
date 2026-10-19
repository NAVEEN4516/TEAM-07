import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const workflowPath = path.join(rootDir, '.github/workflows/ci.yml');

describe('R2: Continuous Integration Workflow (.github/workflows/ci.yml)', () => {
  test('workflow file exists in .github/workflows directory', () => {
    assert.ok(fs.existsSync(workflowPath), 'Workflow file .github/workflows/ci.yml must exist');
  });

  test('contains required GitHub Actions triggers for main, develop, and workflow_dispatch', () => {
    const content = fs.readFileSync(workflowPath, 'utf8');

    // Verify triggers
    assert.match(content, /push:\s*\n\s*branches:\s*\n\s*-\s*main\s*\n\s*-\s*develop/, 'Push trigger must include main and develop');
    assert.match(content, /pull_request:\s*\n\s*branches:\s*\n\s*-\s*main\s*\n\s*-\s*develop/, 'Pull request trigger must include main and develop');
    assert.match(content, /workflow_dispatch:/, 'Must support workflow_dispatch manual trigger');
  });

  test('configures Node.js 20 environment with clean caching and test execution', () => {
    const content = fs.readFileSync(workflowPath, 'utf8');

    assert.match(content, /runs-on:\s*ubuntu-latest/, 'Should run on ubuntu-latest');
    assert.match(content, /uses:\s*actions\/checkout@v4/, 'Should checkout via actions/checkout@v4');
    assert.match(content, /uses:\s*actions\/setup-node@v4/, 'Should setup Node via actions/setup-node@v4');
    assert.match(content, /node-version:\s*20/, 'Should target Node.js 20');
    assert.match(content, /cache:\s*['"]?npm['"]?/, 'Should configure clean npm caching');
    assert.match(content, /run:\s*npm ci/, 'Should execute npm ci for reproducible clean installs');
    assert.match(content, /run:\s*npm test/, 'Should execute npm test');
  });

  test('verifies sequential step ordering: checkout -> setup-node -> npm ci -> npm test', () => {
    const content = fs.readFileSync(workflowPath, 'utf8');

    const checkoutIdx = content.indexOf('actions/checkout@v4');
    const setupNodeIdx = content.indexOf('actions/setup-node@v4');
    const npmCiIdx = content.indexOf('npm ci');
    const npmTestIdx = content.indexOf('npm test');

    assert.ok(checkoutIdx !== -1, 'actions/checkout@v4 step must exist');
    assert.ok(setupNodeIdx !== -1, 'actions/setup-node@v4 step must exist');
    assert.ok(npmCiIdx !== -1, 'npm ci step must exist');
    assert.ok(npmTestIdx !== -1, 'npm test step must exist');

    assert.ok(
      checkoutIdx < setupNodeIdx,
      'Repository checkout must occur before setting up Node.js'
    );
    assert.ok(
      setupNodeIdx < npmCiIdx,
      'Node.js setup must occur before npm ci dependency installation'
    );
    assert.ok(
      npmCiIdx < npmTestIdx,
      'Dependency installation (npm ci) must occur before running test suite (npm test)'
    );
  });

  test('validates YAML formatting constraints (no forbidden tab indentation)', () => {
    const content = fs.readFileSync(workflowPath, 'utf8');
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      assert.ok(
        !lines[i].includes('\t'),
        `Line ${i + 1} contains tab character which violates YAML specification`
      );
    }
  });

  test('declares concurrency management group', () => {
    const content = fs.readFileSync(workflowPath, 'utf8');
    assert.match(content, /concurrency:/, 'Should define concurrency block');
    assert.match(content, /cancel-in-progress:\s*true/, 'Should define cancel-in-progress policy');
    assert.match(content, /group:\s*\$\{\{\s*github\.workflow\s*\}\}-\$\{\{\s*github\.ref\s*\}\}/, 'Should scope concurrency by workflow and ref');
  });

  test('validates structural YAML document integrity and workflow hierarchy', () => {
    const content = fs.readFileSync(workflowPath, 'utf8');
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0 && !line.trim().startsWith('#'));

    // Verify indentation levels are all even (strict 2-space YAML hierarchy)
    for (let i = 0; i < lines.length; i++) {
      const indent = lines[i].match(/^\s*/)[0].length;
      assert.equal(
        indent % 2,
        0,
        `Line ${i + 1} ("${lines[i]}") has odd indentation (${indent} spaces); must use 2-space multiples`
      );
    }

    // Parse top-level keys
    const topLevelKeys = lines
      .filter(line => /^[a-zA-Z0-9_'"]+\s*:/.test(line))
      .map(line => line.split(':')[0].trim().replace(/['"]/g, ''));

    assert.ok(topLevelKeys.includes('name'), 'Workflow must have top-level "name" key');
    assert.ok(topLevelKeys.includes('on'), 'Workflow must have top-level "on" trigger key');
    assert.ok(topLevelKeys.includes('concurrency'), 'Workflow must have top-level "concurrency" key');
    assert.ok(topLevelKeys.includes('jobs'), 'Workflow must have top-level "jobs" key');

    // Verify job structure
    assert.match(content, /\bjobs:\s*\n\s+test:\s*\n/, 'Jobs block must define "test" job');
    assert.match(content, /\bruns-on:\s*ubuntu-latest\b/, 'Test job must specify runs-on runner');
    assert.match(content, /\bsteps:\s*\n/, 'Test job must define a steps list');

    // Count step entries
    const stepCount = (content.match(/- name:/g) || []).length;
    assert.ok(stepCount >= 4, `Expected at least 4 named steps, found ${stepCount}`);
  });
});
