/**
 * System Validation Table Generator (BDC-NF-005, Testing Phase)
 * Transforms JSON test run results from run.cjs into markdown tables
 * for inclusion in system-validation-report.md and compatibility/performance evidence files.
 */

const fs = require('node:fs');
const path = require('node:path');

const evidenceDir = path.resolve(__dirname, '../../docs/reports/evidence');
const TODAY = '2026-11-07';

function loadResults(browser) {
  const file = path.join(evidenceDir, `sv-results-${browser}-${TODAY}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function generateMarkdownTable(records, columns) {
  const header = `| ${columns.map(c => c.title).join(' | ')} |`;
  const divider = `| ${columns.map(c => '---').join(' | ')} |`;
  const rows = records.map(r => {
    return `| ${columns.map(c => {
      let val = c.getValue(r);
      if (val === undefined || val === null) val = '';
      return String(val).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
    }).join(' | ')} |`;
  });
  return [header, divider, ...rows].join('\n');
}

function formatGroupTable(records, groupName) {
  const filtered = records.filter(r => r.group === groupName);
  const columns = [
    { title: 'Test Case ID', getValue: r => r.testCaseId },
    { title: 'Requirement ID', getValue: r => r.requirementId },
    { title: 'Input / Steps', getValue: r => r.inputsSteps },
    { title: 'Expected Result', getValue: r => r.expectedResult },
    { title: 'Actual Result', getValue: r => r.actualResult },
    { title: 'Status', getValue: r => `**${r.status}**` }
  ];
  return generateMarkdownTable(filtered, columns);
}

function formatCrossBrowserTable(chromeRecords, edgeRecords) {
  const map = new Map();

  if (chromeRecords) {
    for (const r of chromeRecords) {
      if (!map.has(r.testCaseId)) {
        map.set(r.testCaseId, { tcId: r.testCaseId, reqId: r.requirementId, desc: r.expectedResult });
      }
      map.get(r.testCaseId).chrome = r.status;
      map.get(r.testCaseId).chromeNotes = r.actualResult;
    }
  }

  if (edgeRecords) {
    for (const r of edgeRecords) {
      if (!map.has(r.testCaseId)) {
        map.set(r.testCaseId, { tcId: r.testCaseId, reqId: r.requirementId, desc: r.expectedResult });
      }
      map.get(r.testCaseId).edge = r.status;
      map.get(r.testCaseId).edgeNotes = r.actualResult;
    }
  }

  const rows = Array.from(map.values()).sort((a, b) => a.tcId.localeCompare(b.tcId));
  const columns = [
    { title: 'Test Case ID', getValue: r => r.tcId },
    { title: 'Requirement', getValue: r => r.reqId },
    { title: 'Chrome 156', getValue: r => r.chrome ? `**${r.chrome}**` : '-' },
    { title: 'Edge 156', getValue: r => r.edge ? `**${r.edge}**` : '-' },
    { title: 'Firefox (Host Env)', getValue: () => '**NOT EXECUTED**' },
    { title: 'Evaluation / Notes', getValue: r => {
      if (r.tcId === 'TC-F-13.2') return 'PENDING CONFIRMATION WITH NAVEEN (Table scrolls internally, page 0px overflow)';
      if (r.chrome === 'PASS' && r.edge === 'PASS') return 'Verified identical behaviour across Chromium engines';
      return r.chromeNotes || r.edgeNotes || '';
    }}
  ];

  return generateMarkdownTable(rows, columns);
}

function main() {
  const chromeResults = loadResults('chrome');
  const edgeResults = loadResults('msedge');

  if (!chromeResults && !edgeResults) {
    console.log('[MAKE-TABLES] No result files found in docs/reports/evidence/. Run run.cjs first.');
    return;
  }

  console.log(`[MAKE-TABLES] Loaded Chrome: ${chromeResults ? chromeResults.length : 0} records, Edge: ${edgeResults ? edgeResults.length : 0} records.`);

  const primary = chromeResults || edgeResults;

  const groups = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'RESPONSIVE', 'THEME', 'A11Y_KEYBOARD', 'A11Y_SCREEN_READER', 'SECURITY', 'PERFORMANCE'];

  for (const g of groups) {
    const table = formatGroupTable(primary, g);
    console.log(`\n### Table for ${g}\n`);
    console.log(table.substring(0, 300) + '...\n');
  }

  console.log('\n[MAKE-TABLES] Cross-browser summary table:\n');
  const crossTable = formatCrossBrowserTable(chromeResults, edgeResults);
  console.log(crossTable.substring(0, 500) + '...\n');
}

if (require.main === module) {
  main();
}

module.exports = {
  loadResults,
  generateMarkdownTable,
  formatGroupTable,
  formatCrossBrowserTable
};

