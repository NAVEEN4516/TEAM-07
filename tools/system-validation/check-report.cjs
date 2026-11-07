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
const TODAY = '2026-11-07';

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

  const chromeFile = path.join(evidenceDir, `sv-results-chrome-${TODAY}.json`);
  const edgeFile = path.join(evidenceDir, `sv-results-msedge-${TODAY}.json`);

  if (!fs.existsSync(chromeFile) || !fs.existsSync(edgeFile)) {
    console.error('[CHECK-REPORT] Missing sv-results-*.json files for today');
    process.exit(1);
  }

  const chromeResults = JSON.parse(fs.readFileSync(chromeFile, 'utf8'));
  const edgeResults = JSON.parse(fs.readFileSync(edgeFile, 'utf8'));

  const chromeCounts = {
    pass: chromeResults.filter(r => r.status === 'PASS').length,
    fail: chromeResults.filter(r => r.status === 'FAIL').length,
    blocked: chromeResults.filter(r => r.status === 'BLOCKED').length,
    notExec: chromeResults.filter(r => r.status === 'NOT EXECUTED').length,
    total: chromeResults.length
  };

  const edgeCounts = {
    pass: edgeResults.filter(r => r.status === 'PASS').length,
    fail: edgeResults.filter(r => r.status === 'FAIL').length,
    blocked: edgeResults.filter(r => r.status === 'BLOCKED').length,
    notExec: edgeResults.filter(r => r.status === 'NOT EXECUTED').length,
    total: edgeResults.length
  };

  console.log(`[CHECK-REPORT] JSON Totals - Chrome: ${chromeCounts.pass} PASS, ${chromeCounts.fail} FAIL, ${chromeCounts.blocked} BLOCKED`);
  console.log(`[CHECK-REPORT] JSON Totals - Edge: ${edgeCounts.pass} PASS, ${edgeCounts.fail} FAIL, ${edgeCounts.blocked} BLOCKED`);

  const filesToCheck = [
    { name: 'system-validation-report.md', path: path.join(reportsDir, 'system-validation-report.md') },
    { name: 'BDC-NF-001-performance.md', path: path.join(testPlanEvidenceDir, 'BDC-NF-001-performance.md') },
    { name: 'BDC-NF-004-compatibility.md', path: path.join(testPlanEvidenceDir, 'BDC-NF-004-compatibility.md') },
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
    '-8 pts',
    '52 PASS'
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

  // Audit report totals match JSON
  const reportPath = path.join(reportsDir, 'system-validation-report.md');
  if (fs.existsSync(reportPath)) {
    const reportText = fs.readFileSync(reportPath, 'utf8');

    // Check pass counts match JSON
    if (chromeCounts.fail === 0 && !reportText.includes(`${chromeCounts.pass} PASS`)) {
      errors.push(`system-validation-report.md does not reflect Chrome pass count of ${chromeCounts.pass} PASS`);
    }
  }

  // Audit performance numbers
  const chromePerf = chromeResults.find(r => r.testCaseId === 'TC-NF-01.1');
  const edgePerf = edgeResults.find(r => r.testCaseId === 'TC-NF-01.1');

  if (chromePerf && chromePerf.samples) {
    const perfFile = path.join(testPlanEvidenceDir, 'BDC-NF-001-performance.md');
    if (fs.existsSync(perfFile)) {
      const perfText = fs.readFileSync(perfFile, 'utf8');
      const addStats = computeStats(chromePerf.samples.addIssue);
      const expectedMed = addStats.median.toFixed(2);
      if (!perfText.includes(expectedMed)) {
        errors.push(`BDC-NF-001-performance.md does not contain Chrome Add Issue median ${expectedMed} ms`);
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
