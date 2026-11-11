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

const SHA = '85391ae';
const TODAY = '2026-11-10';

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

  // 1. Audit Run 3b Results JSONs
  const run3Chrome = path.join(evidenceDir, `sv-results-chrome-${TODAY}-${SHA}.json`);
  const run3Edge = path.join(evidenceDir, `sv-results-msedge-${TODAY}-${SHA}.json`);
  const run3Firefox = path.join(evidenceDir, `sv-results-firefox-${TODAY}-${SHA}.json`);

  const run3Files = [
    { browser: 'Chrome', path: run3Chrome },
    { browser: 'Edge', path: run3Edge },
    { browser: 'Firefox', path: run3Firefox }
  ];

  let chromeResults = null;

  for (const item of run3Files) {
    if (!fs.existsSync(item.path)) {
      errors.push(`Missing Run 3 results file for ${item.browser}: ${path.basename(item.path)}`);
      continue;
    }
    const results = JSON.parse(fs.readFileSync(item.path, 'utf8'));
    if (item.browser === 'Chrome') chromeResults = results;

    const pass = results.filter(r => r.status === 'PASS').length;
    const fail = results.filter(r => r.status === 'FAIL').length;
    const blocked = results.filter(r => r.status === 'BLOCKED').length;
    const notExec = results.filter(r => r.status === 'NOT EXECUTED').length;

    console.log(`[CHECK-REPORT] Run 3b JSON (${item.browser}): ${pass} PASS, ${fail} FAIL, ${blocked} BLOCKED, ${notExec} NOT EXECUTED (Total: ${results.length})`);

    if (fail > 0) {
      errors.push(`Run 3b ${item.browser} has ${fail} FAIL test cases in results JSON`);
    }
    if (pass !== 62 || blocked !== 1) {
      errors.push(`Run 3b ${item.browser} expected 62 PASS / 1 BLOCKED, but got ${pass} PASS / ${blocked} BLOCKED`);
    }
  }

  // 2. Required Evidence Files Check
  const filesToCheck = [
    { name: 'system-validation-report.md', path: path.join(reportsDir, 'system-validation-report.md') },
    { name: 'BDC-NF-001-performance.md', path: path.join(testPlanEvidenceDir, 'BDC-NF-001-performance.md') },
    { name: 'BDC-NF-004-compatibility.md', path: path.join(testPlanEvidenceDir, 'BDC-NF-004-compatibility.md') },
    { name: `sv-report-label-audit-${SHA}.md`, path: path.join(evidenceDir, `sv-report-label-audit-${SHA}.md`) },
    { name: `sv-manual-firefox-${SHA}.md`, path: path.join(evidenceDir, `sv-manual-firefox-${SHA}.md`) },
    { name: `sv-manual-screenreader-${SHA}.md`, path: path.join(evidenceDir, `sv-manual-screenreader-${SHA}.md`) },
    { name: 'sv-system-validation-defects.md', path: path.join(evidenceDir, 'sv-system-validation-defects.md') },
    { name: `sv-unit-${SHA}.log`, path: path.join(evidenceDir, `sv-unit-${SHA}.log`) },
    { name: 'README-run3a-superseded.md', path: path.join(evidenceDir, 'superseded/README-run3a-superseded.md') }
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

  // 3. Audit Report Totals & Disallowed Claims
  const reportPath = path.join(reportsDir, 'system-validation-report.md');
  if (fs.existsSync(reportPath)) {
    const reportText = fs.readFileSync(reportPath, 'utf8');
    if (!reportText.includes('62 PASS')) {
      errors.push(`system-validation-report.md does not reflect Run 3 pass count of 62 PASS`);
    }

    const disallowedClaims = [
      'measured 5.8:1 to 14.8:1',
      'delta-E >= 5.0',
      '17.5 to 73.8'
    ];
    for (const claim of disallowedClaims) {
      if (reportText.includes(claim)) {
        errors.push(`system-validation-report.md contains disallowed obsolete claim: "${claim}"`);
      }
    }

    // 4. Audit Status Badge Contrast & Delta-E numbers against JSON (tolerance 0.05)
    if (chromeResults) {
      const statusRec = chromeResults.find(r => r.testCaseId.includes('TC-NF-02.3'));
      if (statusRec && statusRec.metrics) {
        const expected = statusRec.metrics;

        // Check contrast ranges in report text
        // Light Theme: min 5.91:1, max 8.01:1
        // Dark Theme: min 4.63:1, max 5.91:1
        const lightContrastMatch = reportText.match(/Light Theme:[^\n]*?min\s*([\d.]+):1,\s*max\s*([\d.]+):1/);
        const darkContrastMatch = reportText.match(/Dark Theme:[^\n]*?min\s*([\d.]+):1,\s*max\s*([\d.]+):1/);

        if (!lightContrastMatch) {
          errors.push('system-validation-report.md missing Light Theme contrast min/max statement');
        } else {
          const repMin = parseFloat(lightContrastMatch[1]);
          const repMax = parseFloat(lightContrastMatch[2]);
          if (Math.abs(repMin - expected.contrast.light.min) > 0.05) {
            errors.push(`Report Light contrast min mismatch: report has ${repMin}, JSON has ${expected.contrast.light.min}`);
          }
          if (Math.abs(repMax - expected.contrast.light.max) > 0.05) {
            errors.push(`Report Light contrast max mismatch: report has ${repMax}, JSON has ${expected.contrast.light.max}`);
          }
        }

        if (!darkContrastMatch) {
          errors.push('system-validation-report.md missing Dark Theme contrast min/max statement');
        } else {
          const repMin = parseFloat(darkContrastMatch[1]);
          const repMax = parseFloat(darkContrastMatch[2]);
          if (Math.abs(repMin - expected.contrast.dark.min) > 0.05) {
            errors.push(`Report Dark contrast min mismatch: report has ${repMin}, JSON has ${expected.contrast.dark.min}`);
          }
          if (Math.abs(repMax - expected.contrast.dark.max) > 0.05) {
            errors.push(`Report Dark contrast max mismatch: report has ${repMax}, JSON has ${expected.contrast.dark.max}`);
          }
        }

        // Check Delta-E ranges in report text
        // Light Theme: min 8.0, max 11.1
        // Dark Theme: min 17.3, max 21.1
        const lightDEMatch = reportText.match(/Light Theme:[^\n]*?min\s*([\d.]+),\s*max\s*([\d.]+)[^\n]*?(?:Ahead-OnTrack|\()/);
        const darkDEMatch = reportText.match(/Dark Theme:[^\n]*?min\s*([\d.]+),\s*max\s*([\d.]+)[^\n]*?(?:Ahead-OnTrack|\()/);

        if (!lightDEMatch) {
          errors.push('system-validation-report.md missing Light Theme Delta-E min/max statement');
        } else {
          const repMin = parseFloat(lightDEMatch[1]);
          const repMax = parseFloat(lightDEMatch[2]);
          if (Math.abs(repMin - expected.deltaE.light.min) > 0.05) {
            errors.push(`Report Light Delta-E min mismatch: report has ${repMin}, JSON has ${expected.deltaE.light.min}`);
          }
          if (Math.abs(repMax - expected.deltaE.light.max) > 0.05) {
            errors.push(`Report Light Delta-E max mismatch: report has ${repMax}, JSON has ${expected.deltaE.light.max}`);
          }
        }

        if (!darkDEMatch) {
          errors.push('system-validation-report.md missing Dark Theme Delta-E min/max statement');
        } else {
          const repMin = parseFloat(darkDEMatch[1]);
          const repMax = parseFloat(darkDEMatch[2]);
          if (Math.abs(repMin - expected.deltaE.dark.min) > 0.05) {
            errors.push(`Report Dark Delta-E min mismatch: report has ${repMin}, JSON has ${expected.deltaE.dark.min}`);
          }
          if (Math.abs(repMax - expected.deltaE.dark.max) > 0.05) {
            errors.push(`Report Dark Delta-E max mismatch: report has ${repMax}, JSON has ${expected.deltaE.dark.max}`);
          }
        }
      }
    }
  }

  // 5. Audit Performance Numbers
  if (chromeResults) {
    const chromePerf = chromeResults.find(r => r.testCaseId === 'TC-NF-01.1');
    if (chromePerf && chromePerf.samples) {
      const perfFile = path.join(testPlanEvidenceDir, 'BDC-NF-001-performance.md');
      if (fs.existsSync(perfFile)) {
        const perfText = fs.readFileSync(perfFile, 'utf8');
        const addStats = computeStats(chromePerf.samples.addIssue);
        const expectedMed = addStats.median.toFixed(2);
        if (!perfText.includes(expectedMed)) {
          errors.push(`BDC-NF-001-performance.md does not contain Run 3b Chrome Add Issue median ${expectedMed} ms`);
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

  console.log('\n[CHECK-REPORT] Consistency audit PASSED: All files conform to baseline dataset, results JSON, and integrity rules.');
}

if (require.main === module) {
  runAudit();
}

module.exports = { runAudit };
