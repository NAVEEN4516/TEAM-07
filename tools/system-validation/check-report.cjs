/**
 * Report Consistency Auditor (BDC-NF-005, Testing Phase)
 * Dev tooling with zero dependencies.
 * Audits markdown evidence and report files against sv-results-*.json files.
 */

const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '../..');
const evidenceDir = path.join(rootDir, 'docs/reports/evidence');
const reportsDir = path.join(rootDir, 'docs/reports');
const testPlanEvidenceDir = path.join(rootDir, 'docs/test-plan/evidence');

function computeStats(arr) {
  if (!arr || arr.length === 0) return { min: 0, median: 0, max: 0 };
  const sorted = [...arr].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const median = sorted[Math.floor(sorted.length / 2)];
  return { min, median, max };
}

function runAudit() {
  const errors = [];

  // 1. Audit Run 3 (Multi-Browser & a11y, Tested SHA: e901ecf)
  const run3Chrome = path.join(evidenceDir, 'sv-results-chrome-2026-11-10-e901ecf.json');
  const run3Edge = path.join(evidenceDir, 'sv-results-msedge-2026-11-10-e901ecf.json');
  const run3Firefox = path.join(evidenceDir, 'sv-results-firefox-2026-11-10-e901ecf.json');

  const run3Files = [
    { browser: 'Chrome', path: run3Chrome },
    { browser: 'Edge', path: run3Edge },
    { browser: 'Firefox', path: run3Firefox }
  ];

  for (const item of run3Files) {
    if (!fs.existsSync(item.path)) {
      errors.push(`Missing Run 3 results file for ${item.browser}: ${path.basename(item.path)}`);
      continue;
    }
    const results = JSON.parse(fs.readFileSync(item.path, 'utf8'));
    const pass = results.filter(r => r.status === 'PASS').length;
    const fail = results.filter(r => r.status === 'FAIL').length;
    const blocked = results.filter(r => r.status === 'BLOCKED').length;
    const notExec = results.filter(r => r.status === 'NOT EXECUTED').length;

    console.log(`[CHECK-REPORT] Run 3 JSON (${item.browser}): ${pass} PASS, ${fail} FAIL, ${blocked} BLOCKED, ${notExec} NOT EXECUTED (Total: ${results.length})`);

    if (fail > 0) {
      errors.push(`Run 3 ${item.browser} has ${fail} FAIL test cases in results JSON`);
    }
    if (pass !== 62 || blocked !== 1) {
      errors.push(`Run 3 ${item.browser} expected 62 PASS / 1 BLOCKED, but got ${pass} PASS / ${blocked} BLOCKED`);
    }
  }

  // 2. Audit Run 2 (Baseline SHA: 2220896) if present
  const run2Chrome = path.join(evidenceDir, 'sv-results-chrome-2026-11-07.json');
  const run2Edge = path.join(evidenceDir, 'sv-results-msedge-2026-11-07.json');

  if (fs.existsSync(run2Chrome) && fs.existsSync(run2Edge)) {
    const cRes = JSON.parse(fs.readFileSync(run2Chrome, 'utf8'));
    const eRes = JSON.parse(fs.readFileSync(run2Edge, 'utf8'));
    const cPass = cRes.filter(r => r.status === 'PASS').length;
    const ePass = eRes.filter(r => r.status === 'PASS').length;
    console.log(`[CHECK-REPORT] Run 2 Baseline JSON: Chrome ${cPass} PASS, Edge ${ePass} PASS`);
  }

  // 3. Required Evidence Files Check
  const filesToCheck = [
    { name: 'system-validation-report.md', path: path.join(reportsDir, 'system-validation-report.md') },
    { name: 'BDC-NF-001-performance.md', path: path.join(testPlanEvidenceDir, 'BDC-NF-001-performance.md') },
    { name: 'BDC-NF-004-compatibility.md', path: path.join(testPlanEvidenceDir, 'BDC-NF-004-compatibility.md') },
    { name: 'sv-report-label-audit-e901ecf.md', path: path.join(evidenceDir, 'sv-report-label-audit-e901ecf.md') },
    { name: 'sv-manual-firefox-e901ecf.md', path: path.join(evidenceDir, 'sv-manual-firefox-e901ecf.md') },
    { name: 'sv-manual-screenreader-e901ecf.md', path: path.join(evidenceDir, 'sv-manual-screenreader-e901ecf.md') },
    { name: 'sv-firefox-manual-sheet.md', path: path.join(evidenceDir, 'sv-firefox-manual-sheet.md') },
    { name: 'sv-screen-reader-manual-sheet.md', path: path.join(evidenceDir, 'sv-screen-reader-manual-sheet.md') }
  ];

  const forbiddenStrings = [
    'Completed = 22',
    'Remaining = 28',
    'Completed=22',
    'Remaining=28',
    'Variance = -8',
    'Variance: -8',
    'variance = -8',
    '-8 pts'
  ];

  for (const f of filesToCheck) {
    if (!fs.existsSync(f.path)) {
      errors.push(`Missing required file: ${f.name}`);
      continue;
    }
    const content = fs.readFileSync(f.path, 'utf8');

    for (const forbidden of forbiddenStrings) {
      if (content.includes(forbidden)) {
        errors.push(`File ${f.name} contains forbidden legacy string: "${forbidden}"`);
      }
    }
  }

  // 4. Audit Report Totals Match JSON
  const reportPath = path.join(reportsDir, 'system-validation-report.md');
  if (fs.existsSync(reportPath)) {
    const reportText = fs.readFileSync(reportPath, 'utf8');
    if (!reportText.includes('62 PASS')) {
      errors.push(`system-validation-report.md does not reflect Run 3 pass count of 62 PASS`);
    }
  }

  // 5. Audit Performance Numbers
  if (fs.existsSync(run3Chrome)) {
    const chromeResults = JSON.parse(fs.readFileSync(run3Chrome, 'utf8'));
    const chromePerf = chromeResults.find(r => r.testCaseId === 'TC-NF-01.1');
    if (chromePerf && chromePerf.samples) {
      const perfFile = path.join(testPlanEvidenceDir, 'BDC-NF-001-performance.md');
      if (fs.existsSync(perfFile)) {
        const perfText = fs.readFileSync(perfFile, 'utf8');
        const addStats = computeStats(chromePerf.samples.addIssue);
        const expectedMed = addStats.median.toFixed(2);
        if (!perfText.includes(expectedMed)) {
          errors.push(`BDC-NF-001-performance.md does not contain Run 3 Chrome Add Issue median ${expectedMed} ms`);
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error('\n[CHECK-REPORT] Consistency audit FAILED:');
    for (const e of errors) {
      console.error(`  - ${e}`);
    }
    process.exit(1);
  }

  console.log('\n[CHECK-REPORT] Consistency audit PASSED: All files conform to baseline dataset and results JSON.');
}

if (require.main === module) {
  runAudit();
}

module.exports = { runAudit };
