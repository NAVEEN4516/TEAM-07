// Validates committed QA evidence without launching browsers or adding dependencies.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'docs/reports/evidence/qa-closeout');
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/^\uFEFF/, '');
const manifest = JSON.parse(read('docs/reports/evidence/qa-closeout/manifest.json'));
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
assert.equal(git('rev-parse', 'HEAD:src'), manifest.sourceTree, 'QA evidence must match the application tree');
assert.equal(git('rev-parse', 'HEAD:tests'), manifest.testTree, 'QA evidence must match the native tests');
assert.equal(git('rev-parse', 'HEAD:src/js'), manifest.manualSemanticSourceTree, 'Reassess manual evidence if application/ARIA JavaScript changes');

for (const [file, hash] of Object.entries(manifest.sha256)) {
  const actual = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
  assert.equal(actual, hash, `Evidence integrity: ${file}`);
}
const idsByBrowser = [];
for (const entry of manifest.browsers) {
  const records = JSON.parse(read(entry.results));
  const ids = records.map(record => record.testCaseId);
  assert.equal(new Set(ids).size, ids.length, 'Duplicate browser record ID');
  assert.equal(records.length, 61, '61 actual browser assertions; native checks are separate');
  assert.equal(records.filter(record => record.group === 'G-KB').length, 9);
  for (const record of records) {
    assert.equal(record.status, 'PASS', `${entry.channel}: ${record.testCaseId}`);
    assert.equal(record.commitSha, manifest.testedCommit);
    assert.equal(record.appSourceTree, manifest.sourceTree);
    assert.equal(record.worktreeClean, true);
    assert.equal(record.tester, manifest.executedBy);
    assert.equal(record.executionDate, manifest.executionDate);
    if (record.evidencePath) assert.ok(fs.existsSync(path.join(root, record.evidencePath)), record.evidencePath);
  }
  for (const record of records.filter(record => record.testCaseId.startsWith('TC-NF-04.2-'))) {
    const m = record.actualResult.match(/Page scrollWidth=(\d+), clientWidth=(\d+)\. Table scrollWidth=(\d+), clientWidth=(\d+)/);
    assert.ok(m, 'Responsive record must contain measured geometry');
    assert.ok(Number(m[1]) <= Number(m[2]), 'Page must fit');
    assert.ok(Number(m[3]) <= Number(m[4]), 'Table must fit');
  }
  const perf = records.find(record => record.testCaseId === 'TC-NF-01.1');
  for (const samples of Object.values(perf.samples)) {
    assert.equal(samples.length, 10);
    assert.ok(samples.every(ms => Number.isFinite(ms) && ms > 0 && ms < 2000));
  }
  idsByBrowser.push(ids.slice().sort());
}
assert.equal(manifest.browsers.length, 3);
assert.deepEqual(idsByBrowser[0], idsByBrowser[1]);
assert.deepEqual(idsByBrowser[0], idsByBrowser[2]);
const unitLog = read('docs/reports/evidence/qa-closeout/unit-coverage.log');
assert.match(unitLog, /tests 411\b/);
assert.match(unitLog, /pass 411\b/);
assert.match(unitLog, /fail 0\b/);
const combined = JSON.parse(read('docs/reports/evidence/qa-closeout/combined-coverage.json'));
assert.equal(combined.combined.files.length, 16);
assert.ok(combined.combined.totals.either.pct > 0 && combined.combined.totals.either.pct <= 100);

const rtm = read('docs/reports/requirements-traceability.md');
const cases = [...rtm.matchAll(/^\| `(TC-[^`]+)` \| (BDC-[^|]+) \| \*\*Pass\*\* \|/gm)];
assert.equal(cases.length, 44, 'All 44 cases must have an evidence-backed outcome');
assert.equal(new Set(cases.map(row => row[1])).size, 44);
assert.equal(new Set(cases.map(row => row[2].trim())).size, 25);
const manual = read('docs/reports/evidence/sv-manual-screenreader-85391ae.md');
assert.equal((manual.match(/^\| \*\*SR-\d+\*\*[^\n]*\| PASS \|/gm) || []).length, 22);
assert.ok(read('docs/reports/test-summary-report.md').includes('Human acceptance: pending'));

let linkCount = 0;
function walk(folder) {
  for (const item of fs.readdirSync(folder, { withFileTypes: true })) {
    const full = path.join(folder, item.name);
    if (item.isDirectory()) {
      if (item.name !== 'superseded') walk(full);
    } else if (item.name.endsWith('.md')) {
      for (const match of fs.readFileSync(full, 'utf8').matchAll(/\]\(([^)]+)\)/g)) {
        let target = match[1].replace(/^<|>$/g, '').split('#')[0];
        if (!target || /^[a-zA-Z]+:/.test(target)) continue;
        target = decodeURIComponent(target);
        assert.ok(fs.existsSync(path.resolve(path.dirname(full), target)), `Broken link in ${full}: ${target}`);
        linkCount++;
      }
    }
  }
}
walk(path.join(root, 'docs/reports'));
console.log(`QA audit PASS: 183 browser assertions, 411 native tests, 44 cases, 25 requirements, ${linkCount} links. Human acceptance remains pending.`);
