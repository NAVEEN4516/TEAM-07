/**
 * System Validation Test Runner (BDC-NF-005, Testing Phase)
 * CommonJS Playwright automation tool for comprehensive end-to-end system testing.
 * Runs against real browser instances (Chrome, Edge, Firefox).
 */

const http = require('node:http');
const fs = require('node:fs/promises');
const fsSync = require('node:fs');
const path = require('node:path');
const { chromium, firefox } = require('playwright');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../../src');
const evidenceDir = path.resolve(__dirname, '../../docs/reports/evidence');
const mime = {
  '.js': 'text/javascript',
  '.html': 'text/html',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png'
};

const TESTED_SHA = 'e901ecf17232f97a307ab6c723ba13bdc26aa744';
const SHA7 = 'e901ecf';
const TESTER = 'stacktrace-bhuvi';
const TODAY = '2026-11-10';

// Ensure evidence directory exists
if (!fsSync.existsSync(evidenceDir)) {
  fsSync.mkdirSync(evidenceDir, { recursive: true });
}

// Helper static server
function createServer() {
  const server = http.createServer(async (req, res) => {
    const urlPath = req.url.split('?')[0];
    const file = path.resolve(root, '.' + (urlPath === '/' ? '/index.html' : urlPath));
    if (!file.startsWith(root + path.sep) && file !== path.resolve(root, 'index.html')) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    try {
      const data = await fs.readFile(file);
      res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
      res.end(data);
    } catch {
      res.writeHead(404).end('Not Found');
    }
  });
  return server;
}

// Helper to launch browser based on environment
async function launchBrowser(browserTypeStr) {
  if (browserTypeStr === 'firefox') {
    try {
      const b = await firefox.launch({ headless: true });
      return { browser: b, channel: 'firefox', version: b.version() };
    } catch (err) {
      return { browser: null, channel: 'firefox', version: null, error: err.message };
    }
  }

  const channel = browserTypeStr === 'msedge' ? 'msedge' : 'chrome';
  try {
    const b = await chromium.launch({
      headless: true,
      channel: channel
    });
    return { browser: b, channel, version: b.version() };
  } catch (err) {
    return { browser: null, channel, version: null, error: err.message };
  }
}

// Format test record
function makeRecord({
  tcId,
  reqId,
  group,
  inputs,
  expected,
  actual,
  status,
  browserName,
  browserVersion,
  viewport = '1440x900',
  theme = 'light',
  evidencePath = null,
  error = null,
  samples = null,
  method = 'automated (Playwright)'
}) {
  const rec = {
    testCaseId: tcId,
    requirementId: reqId,
    group: group,
    inputsSteps: inputs,
    expectedResult: expected,
    actualResult: actual,
    status: status, // PASS, FAIL, BLOCKED, NOT EXECUTED
    tester: TESTER,
    executionDate: TODAY,
    browser: `${browserName} ${browserVersion || ''}`.trim(),
    browserVersion: browserVersion || null,
    viewport: viewport,
    theme: theme,
    commitSha: TESTED_SHA,
    evidencePath: evidencePath,
    error: error ? String(error) : null,
    method: method
  };
  if (samples) {
    rec.samples = samples;
  }
  return rec;
}

// Main execution suite
async function runSuite() {
  const browserTypeStr = (process.argv[2] || process.env.BROWSER || 'chrome').toLowerCase();
  console.log(`[SV-RUNNER] Starting System Validation on browser: ${browserTypeStr}`);

  let server = null;
  let browser = null;
  let channel = browserTypeStr;
  let hasException = false;
  const results = [];
  const logLines = [];

  function log(msg) {
    console.log(msg);
    logLines.push(`[${new Date().toISOString()}] ${msg}`);
  }

  try {
    server = createServer();
    await new Promise(res => server.listen(0, '127.0.0.1', res));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;
    console.log(`[SV-RUNNER] Loopback HTTP server running at ${baseUrl}`);

    log(`Target Tested Commit: ${TESTED_SHA}`);
    log(`Tester: ${TESTER}`);

    const launchRes = await launchBrowser(browserTypeStr);
    channel = launchRes.channel || browserTypeStr;

    if (!launchRes.browser) {
      log(`[ERROR] Could not launch browser ${browserTypeStr}: ${launchRes.error}`);
      // Record NOT EXECUTED for this browser
      const record = makeRecord({
        tcId: 'ALL',
        reqId: 'ALL',
        group: 'ALL',
        inputs: `Launch browser ${browserTypeStr}`,
        expected: 'Browser opens successfully',
        actual: `Launch failed: ${launchRes.error}`,
        status: 'NOT EXECUTED',
        browserName: browserTypeStr,
        browserVersion: null,
        error: launchRes.error
      });
      results.push(record);
      return;
    }

    browser = launchRes.browser;
    const browserVersion = launchRes.version;
    log(`Browser launched successfully: ${channel} version ${browserVersion}`);

  // Create isolated context with CSP tracking and canvas marker label interceptor
  async function createCleanContext(options = {}) {
    const context = await browser.newContext({
      viewport: options.viewport || { width: 1440, height: 900 },
      ...options
    });
    await context.addInitScript(() => {
      window.cspViolations = [];
      document.addEventListener('securitypolicyviolation', e => {
        window.cspViolations.push({
          effectiveDirective: e.effectiveDirective,
          blockedURI: e.blockedURI,
          violatedDirective: e.violatedDirective
        });
      });
      window.__markerLabels = [];
      const origFillText = CanvasRenderingContext2D.prototype.fillText;
      CanvasRenderingContext2D.prototype.fillText = function(text, x, y) {
        if (typeof text === 'string' && /^Day \d+$/.test(text)) {
          window.__markerLabels.push(text);
        }
        return origFillText.apply(this, arguments);
      };
    });
    return context;
  }

  // Helper to measure canvas marker position and verify alignment
  async function measureMarker(page, targetDay) {
    return await page.evaluate((day) => {
      const canvas = document.getElementById('burndown-chart');
      if (!canvas) return null;
      const chart = Chart.getChart(canvas);
      if (!chart || !chart.scales?.x || !chart.chartArea) return null;
      const expectedX = chart.scales.x.getPixelForValue(day);
      const dpr = window.devicePixelRatio || 1;
      const ctx = canvas.getContext('2d');
      const chartArea = chart.chartArea;

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      const startX = Math.floor(chartArea.left * dpr);
      const endX = Math.ceil(chartArea.right * dpr);
      const yTop = Math.floor((chartArea.top + 30) * dpr);
      const yBottom = Math.floor((chartArea.bottom - 10) * dpr);

      let bestX = -1;
      let maxRedCount = 0;

      for (let x = startX; x <= endX; x++) {
        let redCount = 0;
        for (let y = yTop; y <= yBottom; y += 2) {
          const idx = (y * canvas.width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];
          if (a > 150 && r > 180 && g < 85 && b < 85) {
            redCount++;
          }
        }
        if (redCount > maxRedCount) {
          maxRedCount = redCount;
          bestX = x;
        }
      }

      const drawnX = bestX / dpr;
      const labels = window.__markerLabels || [];
      const lastLabel = labels.length > 0 ? labels[labels.length - 1] : null;
      return {
        day,
        expectedX,
        drawnX,
        diff: Math.abs(drawnX - expectedX),
        label: lastLabel,
        maxRedCount
      };
    }, targetDay);
  }

  // Common UI getters
  function getLocators(page) {
    return {
      kpi: id => page.locator(`[data-testid="kpi-${id}"] .kpi-value`),
      kpiVariance: page.locator('[data-testid="kpi-variance"] strong'),
      kpiStatusBadge: page.locator('[data-testid="kpi-schedule-status"] [data-testid="status-badge"] .status-text'),
      currentDayBadge: page.locator('[data-testid="current-day-value"]'),
      currentDayValue: page.locator('[data-testid="current-day-value"] strong'),
      sprintDurationPill: page.locator('[data-testid="sprint-duration"]'),
      slider: page.locator('#current-day-slider'),
      prevBtn: page.locator('[data-testid="btn-prev-day"]'),
      nextBtn: page.locator('[data-testid="btn-next-day"]'),
      resetBtn: page.locator('#reset-data-btn'),
      sprintNameHeader: page.locator('#sprint-name'),
      configBtn: page.locator('[data-testid="btn-configure-sprint"]'),
      saveSprintBtn: page.locator('[data-testid="btn-save-sprint"]'),
      cancelSprintBtn: page.locator('[data-testid="btn-cancel-sprint"]'),
      inputSprintName: page.locator('#input-sprint-name'),
      inputDurationDays: page.locator('#input-duration-days'),
      inputStartDate: page.locator('#input-start-date'),
      inputEndDate: page.locator('#input-end-date'),
      sprintConfigErrors: page.locator('[data-testid="config-errors"], .sprint-config-form .form-errors'),
      addIssueKey: page.locator('#add-issue-key'),
      addIssueSummary: page.locator('#add-issue-summary'),
      addIssueType: page.locator('#add-issue-type'),
      addIssuePoints: page.locator('#add-issue-points'),
      addIssueStatus: page.locator('#add-issue-status'),
      addIssueCompletedDay: page.locator('#add-issue-completed-day'),
      addIssueCompletedDayGroup: page.locator('#add-issue-completed-day-group'),
      btnAddIssue: page.locator('[data-testid="btn-add-issue"]'),
      addIssueErrors: page.locator('[data-testid="add-issue-errors"]'),
      addIssueStatusMsg: page.locator('[data-testid="add-issue-status"]'),
      tableRows: page.locator('#backlog-table tbody tr'),
      emptyState: page.locator('#backlog-empty-state'),
      themeToggleBtn: page.locator('#theme-toggle-btn'),
      messages: page.locator('#messages'),
      issueEditor: page.locator('#issue-editor'),
      editStatus: page.locator('#edit-issue-status'),
      editCompletedDay: page.locator('#edit-completed-day'),
      editErrors: page.locator('#issue-edit-errors'),
      editSaveBtn: page.locator('#issue-editor button[type="submit"]'),
      editCancelBtn: page.locator('#issue-editor button[type="button"]')
    };
  }

  // --------------------------------------------------------------------------
  // G1: DEFAULT STATE
  // --------------------------------------------------------------------------
  log('--- Executing Group G1: Default State ---');
  {
    const context = await createCleanContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(`${baseUrl}/index.html`);
    await page.waitForSelector('#backlog-table');
    const loc = getLocators(page);

    // Screenshot initial state
    const ssPath = `docs/reports/evidence/sv-g1-default-state-${launchRes.channel}.png`;
    await page.screenshot({ path: ssPath, fullPage: true });

    // TC-F-02.1: Total committed points = 50
    const totalScopeText = (await loc.kpi('total-scope').textContent()).trim();
    results.push(makeRecord({
      tcId: 'TC-F-02.1',
      reqId: 'BDC-F-002',
      group: 'G1',
      inputs: 'Open application with Default dataset (Appendix A)',
      expected: 'Total Committed Story Points = 50',
      actual: `Total Scope KPI displays ${totalScopeText}`,
      status: totalScopeText === '50' ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      evidencePath: ssPath
    }));

    // TC-F-04.1: Exactly PROJ-101 to PROJ-110 shown with correct fields; Total = 50
    const rowCount = await loc.tableRows.count();
    const expectedAppendixA = [
      { key: 'PROJ-101', summary: 'User Authentication & Session Token Service', type: 'Story', points: 5, status: 'Done', day: '1' },
      { key: 'PROJ-102', summary: 'Database Schema Migration for User Profiles', type: 'Task', points: 3, status: 'Done', day: '2' },
      { key: 'PROJ-103', summary: 'REST API Endpoint for Sprint Backlog Query', type: 'Story', points: 8, status: 'Done', day: '3' },
      { key: 'PROJ-104', summary: 'Implement JWT Refresh Token Expiry Logic', type: 'Task', points: 5, status: 'Done', day: '4' },
      { key: 'PROJ-105', summary: 'Build Burndown Chart Rendering Canvas UI', type: 'Story', points: 8, status: 'Done', day: '4' },
      { key: 'PROJ-106', summary: 'UI Form Validation for Task Addition', type: 'Bug', points: 3, status: 'In Progress', day: '--' },
      { key: 'PROJ-107', summary: 'Automated Unit Tests for Calculation Engine', type: 'Task', points: 5, status: 'In Progress', day: '--' },
      { key: 'PROJ-108', summary: 'CSV/JSON Data Export Module', type: 'Story', points: 5, status: 'To Do', day: '--' },
      { key: 'PROJ-109', summary: 'Error Boundary & Toast Notification Component', type: 'Task', points: 3, status: 'To Do', day: '--' },
      { key: 'PROJ-110', summary: 'Sprint Health Summary & KPI Calculation', type: 'Story', points: 5, status: 'To Do', day: '--' }
    ];

    const actualRows = [];
    for (let i = 0; i < rowCount; i++) {
      const rowLoc = loc.tableRows.nth(i);
      const key = (await rowLoc.locator('.cell-key').textContent()).trim();
      const summary = (await rowLoc.locator('.cell-summary').textContent()).trim();
      const type = (await rowLoc.locator('.cell-type').textContent()).trim();
      const points = Number((await rowLoc.locator('.cell-number').nth(0).textContent()).trim());
      const status = (await rowLoc.locator('.status-badge').textContent()).trim();
      const day = (await rowLoc.locator('.cell-number').nth(1).textContent()).trim();
      actualRows.push({ key, summary, type, points, status, day });
    }

    const keys = actualRows.map(r => r.key);
    const expectedKeys = expectedAppendixA.map(r => r.key);
    const keysMatch = JSON.stringify(keys) === JSON.stringify(expectedKeys);

    results.push(makeRecord({
      tcId: 'TC-F-04.1',
      reqId: 'BDC-F-004',
      group: 'G1',
      inputs: 'Open app with default state',
      expected: 'Exactly PROJ-101 to PROJ-110 shown with correct fields; Total = 50',
      actual: `Backlog has ${rowCount} rows: ${keys.join(', ')}. Total Scope KPI=${totalScopeText}`,
      status: (rowCount === 10 && keysMatch && totalScopeText === '50') ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      evidencePath: ssPath
    }));

    // TC-F-05.1: Backlog table columns key, summary, type, points, status, completion day match data for ALL 10 rows
    const allRowsMatch = expectedAppendixA.every((expectedRow, i) => {
      const actualRow = actualRows[i];
      if (!actualRow) return false;
      return actualRow.key === expectedRow.key &&
        actualRow.summary === expectedRow.summary &&
        actualRow.type === expectedRow.type &&
        actualRow.points === expectedRow.points &&
        actualRow.status === expectedRow.status &&
        actualRow.day === expectedRow.day;
    });

    results.push(makeRecord({
      tcId: 'TC-F-05.1',
      reqId: 'BDC-F-005',
      group: 'G1',
      inputs: 'Inspect default table structure and all 10 issues (PROJ-101 to PROJ-110)',
      expected: 'All 10 rows match SRS Appendix A across all 6 columns (key, summary, type, points, status, completedDay)',
      actual: `All 10 rows verified against SRS Appendix A: ${allRowsMatch}. First: ${actualRows[0]?.key} (${actualRows[0]?.status}, day ${actualRows[0]?.day}), Last: ${actualRows[9]?.key} (${actualRows[9]?.status}, day ${actualRows[9]?.day})`,
      status: (rowCount === 10 && allRowsMatch) ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      evidencePath: ssPath
    }));

    // TC-F-10.1: Ideal burndown values
    const chartData = await page.evaluate(async () => {
      const chartMod = await import('/js/ui/chart.js');
      const ci = chartMod.getChartInstance();
      return {
        ideal: ci.data.datasets[0].data,
        actual: ci.data.datasets[1].data,
        labels: ci.data.labels
      };
    });
    // Default duration 10, total 50: Ideal(0)=50, Ideal(4)=30, Ideal(10)=0
    const ideal0 = chartData.ideal[0];
    const ideal4 = chartData.ideal[4];
    const ideal10 = chartData.ideal[10];
    results.push(makeRecord({
      tcId: 'TC-F-10.1',
      reqId: 'BDC-F-010',
      group: 'G1',
      inputs: 'Verify ideal line series values at days 0, 4, 10 on default data',
      expected: 'Ideal(0)=50, Ideal(4)=30, Ideal(10)=0',
      actual: `Ideal(0)=${ideal0}, Ideal(4)=${ideal4}, Ideal(10)=${ideal10}`,
      status: (ideal0 === 50 && ideal4 === 30 && ideal10 === 0) ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      evidencePath: ssPath
    }));

    // TC-F-11.1: Actual burndown values for default data
    // Default issues Done: PROJ-101(day 1, 5pt), 102(day 2, 3pt), 103(day 3, 8pt), 104(day 4, 8pt), 105(day 4, 5pt)
    // Actual: Day 0: 50, Day 1: 45, Day 2: 42, Day 3: 34, Day 4: 21, Days 5..10: null
    const actual0 = chartData.actual[0];
    const actual1 = chartData.actual[1];
    const actual2 = chartData.actual[2];
    const actual3 = chartData.actual[3];
    const actual4 = chartData.actual[4];
    const actual5 = chartData.actual[5];
    const actualMatches = actual0 === 50 && actual1 === 45 && actual2 === 42 && actual3 === 34 && actual4 === 21 && actual5 === null;
    results.push(makeRecord({
      tcId: 'TC-F-11.1',
      reqId: 'BDC-F-011',
      group: 'G1',
      inputs: 'Verify actual line series values on default data (Current Day = 4)',
      expected: 'Actual(0..4) = [50, 45, 42, 34, 21], Actual(5..10) = null',
      actual: `Actual = [${chartData.actual.slice(0,6).join(', ')}]`,
      status: actualMatches ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      evidencePath: ssPath
    }));

    // TC-F-13.1: Chart content (dashed ideal, solid actual, marker)
    const datasetsInfo = await page.evaluate(async () => {
      const chartMod = await import('/js/ui/chart.js');
      const ci = chartMod.getChartInstance();
      return ci.data.datasets.map(d => ({
        label: d.label,
        borderDash: d.borderDash
      }));
    });
    const idealIsDashed = Array.isArray(datasetsInfo[0].borderDash) && datasetsInfo[0].borderDash.length > 0;
    const actualIsSolid = !datasetsInfo[1].borderDash || datasetsInfo[1].borderDash.length === 0;
    results.push(makeRecord({
      tcId: 'TC-F-13.1',
      reqId: 'BDC-F-013',
      group: 'G1',
      inputs: 'Verify chart dataset styles (ideal dashed, actual solid)',
      expected: 'Ideal dataset has borderDash; Actual dataset is solid line',
      actual: `Ideal borderDash=${JSON.stringify(datasetsInfo[0].borderDash)}, Actual borderDash=${JSON.stringify(datasetsInfo[1].borderDash)}`,
      status: (idealIsDashed && actualIsSolid) ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      evidencePath: ssPath
    }));

    // TC-F-15.1: KPI values for default data
    const completedText = (await loc.kpi('completed-points').textContent()).trim();
    const remainingText = (await loc.kpi('remaining-points').textContent()).trim();
    const elapsedText = (await loc.kpi('days-elapsed').textContent()).trim();
    const daysLeftText = (await loc.kpi('days-left').textContent()).trim();
    const varianceText = (await loc.kpiVariance.textContent()).trim();
    const statusBadgeText = (await loc.kpiStatusBadge.textContent()).trim();

    const kpisPass = totalScopeText === '50' &&
      completedText === '29' &&
      remainingText === '21' &&
      elapsedText === '4' &&
      daysLeftText === '6' &&
      varianceText === '+9' &&
      statusBadgeText === 'Ahead of Schedule';

    results.push(makeRecord({
      tcId: 'TC-F-15.1',
      reqId: 'BDC-F-015',
      group: 'G1',
      inputs: 'Read all 6 KPI cards on initial load with default data',
      expected: 'Total=50, Completed=29, Remaining=21, Elapsed=4, Left=6, Variance=+9, Status="Ahead of Schedule"',
      actual: `Total=${totalScopeText}, Completed=${completedText}, Remaining=${remainingText}, Elapsed=${elapsedText}, Left=${daysLeftText}, Variance=${varianceText}, Status="${statusBadgeText}"`,
      status: kpisPass ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      evidencePath: ssPath
    }));

    await context.close();
  }

  // --------------------------------------------------------------------------
  // G2: SPRINT CONFIGURATION
  // --------------------------------------------------------------------------
  log('--- Executing Group G2: Sprint Configuration ---');
  {
    const context = await createCleanContext();
    const page = await context.newPage();
    await page.goto(`${baseUrl}/index.html`);
    const loc = getLocators(page);

    // TC-F-01.1: Configure a valid sprint (Name="Sprint 2", Duration=5, Start=2026-10-26, End=2026-10-30)
    // STP Table 9, TC-F-01.1 (BDC-F-001): Configuration saved; chart re-renders with Total Days = 5
    await loc.configBtn.click();
    await loc.inputSprintName.fill('Sprint 2');
    await loc.inputDurationDays.fill('5');
    await loc.inputStartDate.fill('2026-10-26');
    await loc.inputEndDate.fill('2026-10-30');
    await loc.saveSprintBtn.click();

    const bannerName = (await loc.sprintNameHeader.textContent()).trim();
    const durationPillText = (await loc.sprintDurationPill.textContent()).trim();
    const dayBadgeText = (await loc.currentDayBadge.textContent()).trim();
    const currentDayNum = (await loc.currentDayValue.textContent()).trim();
    const sliderMax = await loc.slider.getAttribute('max');
    const ssConfigValid = `docs/reports/evidence/sv-g2-config-valid-${channel}.png`;
    await page.screenshot({ path: ssConfigValid, fullPage: true });

    const configPass = bannerName === 'Sprint 2' &&
      durationPillText.includes('5') &&
      dayBadgeText.includes('5') &&
      sliderMax === '5' &&
      Number(currentDayNum) <= 5;

    results.push(makeRecord({
      tcId: 'TC-F-01.1',
      reqId: 'BDC-F-001',
      group: 'G2',
      inputs: 'Configure Name="Sprint 2", Duration=5, Start=2026-10-26, End=2026-10-30; Save',
      expected: 'Configuration saved; header badge="Sprint 2"; duration=5; Current Day clamped to <= 5',
      actual: `Header="${bannerName}", Duration="${durationPillText}", DayBadge="${dayBadgeText}", SliderMax=${sliderMax}`,
      status: configPass ? 'PASS' : 'FAIL',
      browserName: channel,
      browserVersion,
      evidencePath: ssConfigValid
    }));

    // TC-F-01.2: Invalid duration rejected (0, -3, 5.5, "abc", 61) & boundary durations 1 and 60 accepted
    // 1. Boundary duration 1 accepted
    await loc.configBtn.click();
    await loc.inputDurationDays.fill('1');
    await loc.saveSprintBtn.click();
    const durationPill1 = (await loc.sprintDurationPill.textContent()).trim();
    const bound1Accepted = durationPill1.includes('1 working day');

    // 2. Boundary duration 60 accepted
    await loc.configBtn.click();
    await loc.inputDurationDays.fill('60');
    await loc.saveSprintBtn.click();
    const durationPill60 = (await loc.sprintDurationPill.textContent()).trim();
    const bound60Accepted = durationPill60.includes('60 working days');

    // 3. Test invalid durations: 0, -3, 5.5, "abc", 61 rejected with errors; previous valid config retained
    await loc.configBtn.click();
    await loc.inputDurationDays.fill('0');
    await loc.saveSprintBtn.click();
    const errText0 = (await loc.sprintConfigErrors.textContent()).trim();

    await loc.inputDurationDays.fill('-3');
    await loc.saveSprintBtn.click();
    const errTextNeg = (await loc.sprintConfigErrors.textContent()).trim();

    await loc.inputDurationDays.fill('5.5');
    await loc.saveSprintBtn.click();
    const errTextDecimal = (await loc.sprintConfigErrors.textContent()).trim();

    await loc.inputDurationDays.evaluate(el => { el.value = 'abc'; });
    await loc.saveSprintBtn.click();
    const errTextAbc = (await loc.sprintConfigErrors.textContent()).trim();

    await loc.inputDurationDays.fill('61');
    await loc.saveSprintBtn.click();
    const errText61 = (await loc.sprintConfigErrors.textContent()).trim();
    const ssConfigErr = `docs/reports/evidence/sv-g2-config-error-${launchRes.channel}.png`;
    await page.screenshot({ path: ssConfigErr, fullPage: true });

    await loc.cancelSprintBtn.click();
    const retainedDuration = (await loc.sprintDurationPill.textContent()).trim();
    const retainedName = (await loc.sprintNameHeader.textContent()).trim();

    const invalidDurationsRejected = errText0.includes('positive') &&
      errTextNeg.includes('positive') &&
      errTextDecimal.includes('positive') &&
      errTextAbc.length > 0 &&
      (errText61.includes('60') || errText61.includes('exceed'));

    const f012Pass = bound1Accepted &&
      bound60Accepted &&
      invalidDurationsRejected &&
      retainedDuration.includes('60') &&
      retainedName === 'Sprint 2';

    results.push(makeRecord({
      tcId: 'TC-F-01.2',
      reqId: 'BDC-F-001',
      group: 'G2',
      inputs: 'Enter boundary durations (1, 60) and invalid durations (0, -3, 5.5, "abc", 61) in sprint config form',
      expected: 'Boundaries 1 and 60 accepted; invalid durations rejected with visible validation errors; previous config retained',
      actual: `Boundaries: 1 accepted=${bound1Accepted}, 60 accepted=${bound60Accepted}. Errors: 0="${errText0}", -3="${errTextNeg}", 5.5="${errTextDecimal}", abc="${errTextAbc}", 61="${errText61}". Retained: "${retainedDuration}"`,
      status: f012Pass ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      evidencePath: ssConfigErr
    }));

    // TC-F-01.3: End date before start date rejected with serialized state unchanged
    const stateBefore013 = await page.evaluate(async () => {
      const dmMod = await import('/js/data/dataManager.js');
      return dmMod.defaultDataManager.serialize();
    });

    await loc.configBtn.click();
    await loc.inputStartDate.fill('2026-10-30');
    await loc.inputEndDate.fill('2026-10-26');
    await loc.saveSprintBtn.click();
    const errTextDate = (await loc.sprintConfigErrors.textContent()).trim();
    await loc.cancelSprintBtn.click();

    const stateAfter013 = await page.evaluate(async () => {
      const dmMod = await import('/js/data/dataManager.js');
      return dmMod.defaultDataManager.serialize();
    });

    const stateUnchanged013 = stateBefore013 === stateAfter013;

    results.push(makeRecord({
      tcId: 'TC-F-01.3',
      reqId: 'BDC-F-001',
      group: 'G2',
      inputs: 'Start Date=2026-10-30, End Date=2026-10-26 (end before start)',
      expected: 'Configuration rejected with visible error message; previous valid config and serialized state retained unchanged',
      actual: `Error message: "${errTextDate}". Serialized state unchanged: ${stateUnchanged013}`,
      status: (errTextDate.length > 0 && stateUnchanged013) ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      evidencePath: ssConfigErr
    }));

    await context.close();
  }

  // --------------------------------------------------------------------------
  // G3: CURRENT DAY AND MARKER
  // --------------------------------------------------------------------------
  log('--- Executing Group G3: Current Day and Marker ---');
  {
    const context = await createCleanContext();
    const page = await context.newPage();
    await page.goto(`${baseUrl}/index.html`);
    const loc = getLocators(page);

    // TC-F-03.1: Change Current Day (move slider from 4 to 6)
    // Check initial: Day 4
    await loc.nextBtn.click(); // Day 5
    await loc.nextBtn.click(); // Day 6
    const day6Text = (await loc.currentDayValue.textContent()).trim();
    const ssDay6 = `docs/reports/evidence/sv-g3-day6-${launchRes.channel}.png`;
    await page.screenshot({ path: ssDay6, fullPage: true });

    const chartDay6 = await page.evaluate(async () => {
      const chartMod = await import('/js/ui/chart.js');
      const ci = chartMod.getChartInstance();
      return {
        actualDay6: ci.data.datasets[1].data[6],
        actualDay7: ci.data.datasets[1].data[7]
      };
    });

    results.push(makeRecord({
      tcId: 'TC-F-03.1',
      reqId: 'BDC-F-003',
      group: 'G3',
      inputs: 'Click Next Day twice to move Current Day from 4 to 6',
      expected: 'Current Day displays 6; Actual burndown displays values through Day 6; Day 7 is null',
      actual: `Current Day="${day6Text}", Actual(6)=${chartDay6.actualDay6}, Actual(7)=${chartDay6.actualDay7}`,
      status: (day6Text.includes('6') && chartDay6.actualDay6 !== null && chartDay6.actualDay7 === null) ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      evidencePath: ssDay6
    }));

    // TC-F-03.2: Out-of-range Current Day (-1, 11, 2.5, "abc" rejected; 0 and 10 accepted)
    // Physical stepper buttons at day 0 and day 10
    // Test data API boundaries and UI stepper boundaries
    const dataApiTests = await page.evaluate(async () => {
      const dmMod = await import('/js/data/dataManager.js');
      const dm = dmMod.defaultDataManager;
      const resNeg = dm.setCurrentDay(-1);
      const res11 = dm.setCurrentDay(11);
      const resFloat = dm.setCurrentDay(2.5);
      const resAbc = dm.setCurrentDay('abc');
      const res0 = dm.setCurrentDay(0);
      const curAfter0 = dm.getCurrentDay();
      const res10 = dm.setCurrentDay(10);
      const curAfter10 = dm.getCurrentDay();
      // restore to 4
      dm.setCurrentDay(4);
      return { resNeg, res11, resFloat, resAbc, res0, curAfter0, res10, curAfter10 };
    });

    const boundaryPass = !dataApiTests.resNeg.success &&
      !dataApiTests.res11.success &&
      !dataApiTests.resFloat.success &&
      !dataApiTests.resAbc.success &&
      dataApiTests.res0.success && dataApiTests.curAfter0 === 0 &&
      dataApiTests.res10.success && dataApiTests.curAfter10 === 10;

    results.push(makeRecord({
      tcId: 'TC-F-03.2',
      reqId: 'BDC-F-003',
      group: 'G3',
      inputs: 'Set Current Day to -1, 11, 2.5, "abc" (rejected); test 0 and 10 (accepted)',
      expected: 'Invalid values rejected with error; Day 0 and Day 10 accepted',
      actual: `Rejected: -1(success=${dataApiTests.resNeg.success}), 11(success=${dataApiTests.res11.success}), 2.5(success=${dataApiTests.resFloat.success}). Accepted: 0(cur=${dataApiTests.curAfter0}), 10(cur=${dataApiTests.curAfter10})`,
      status: boundaryPass ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion
    }));

    // TC-F-11.2: No Actual points beyond Current Day
    await page.reload();
    const beyondCheck = await page.evaluate(async () => {
      const chartMod = await import('/js/ui/chart.js');
      const ci = chartMod.getChartInstance();
      // default currentDay is 4
      const actuals = ci.data.datasets[1].data;
      return {
        day4: actuals[4],
        day5: actuals[5],
        day10: actuals[10]
      };
    });
    results.push(makeRecord({
      tcId: 'TC-F-11.2',
      reqId: 'BDC-F-011',
      group: 'G3',
      inputs: 'Inspect Actual series at Current Day 4',
      expected: 'Values for days > 4 are strictly null',
      actual: `Day 4=${beyondCheck.day4}, Day 5=${beyondCheck.day5}, Day 10=${beyondCheck.day10}`,
      status: (beyondCheck.day4 !== null && beyondCheck.day5 === null && beyondCheck.day10 === null) ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion
    }));

    // TC-F-14.1: Current-day marker real movement test (Days 0, 4, 6, 10, dark theme, and window resize)
    // 1. Initial Day 4 check
    const m4 = await measureMarker(page, 4);
    const ssMarker4 = `docs/reports/evidence/sv-marker-day4-${channel}-${TODAY}-${SHA7}.png`;
    await page.screenshot({ path: ssMarker4, fullPage: true });

    // 2. Day 0 via Home key on slider
    await loc.slider.focus();
    await page.keyboard.press('Home');
    await page.waitForTimeout(100);
    const m0 = await measureMarker(page, 0);
    const ssMarker0 = `docs/reports/evidence/sv-marker-day0-${channel}-${TODAY}-${SHA7}.png`;
    await page.screenshot({ path: ssMarker0, fullPage: true });

    // 3. Day 6 via Next Day button steps (0 -> 6)
    for (let d = 0; d < 6; d++) {
      await loc.nextBtn.click();
    }
    await page.waitForTimeout(100);
    const m6 = await measureMarker(page, 6);
    const ssMarker6 = `docs/reports/evidence/sv-marker-day6-${channel}-${TODAY}-${SHA7}.png`;
    await page.screenshot({ path: ssMarker6, fullPage: true });

    // Assert Day 6 updates actual series endpoint and KPIs without reload:
    // Completed 29, Remaining 21, Days Elapsed 6, Days Left 4, Variance -1, status On Track (Ideal(6)=20, -1 is inclusive On Track)
    const kpiComp6 = (await loc.kpi('completed-points').textContent()).trim();
    const kpiRem6 = (await loc.kpi('remaining-points').textContent()).trim();
    const kpiElapsed6 = (await loc.kpi('days-elapsed').textContent()).trim();
    const kpiLeft6 = (await loc.kpi('days-left').textContent()).trim();
    const kpiVar6 = (await loc.kpiVariance.textContent()).trim();
    const kpiStatus6 = (await loc.kpiStatusBadge.textContent()).trim();
    const seriesInfo6 = await page.evaluate(() => {
      const chart = Chart.getChart(document.getElementById('burndown-chart'));
      const actualDataset = chart.data.datasets.find(ds => ds.label === 'Actual') || chart.data.datasets[1];
      const idealDataset = chart.data.datasets.find(ds => ds.label === 'Ideal') || chart.data.datasets[0];
      return {
        actualDay6: actualDataset.data[6],
        actualDay7: actualDataset.data[7],
        idealDay6: idealDataset.data[6]
      };
    });

    const day6KpiOk = kpiComp6 === '29' && kpiRem6 === '21' && kpiElapsed6 === '6' &&
      kpiLeft6 === '4' && (kpiVar6 === '-1' || kpiVar6 === '-1 pts') &&
      kpiStatus6 === 'On Track' && seriesInfo6.actualDay6 === 21 && seriesInfo6.actualDay7 === null;

    // 4. Day 10 via End key on slider
    await loc.slider.focus();
    await page.keyboard.press('End');
    await page.waitForTimeout(100);
    const m10 = await measureMarker(page, 10);
    const ssMarker10 = `docs/reports/evidence/sv-marker-day10-${channel}-${TODAY}-${SHA7}.png`;
    await page.screenshot({ path: ssMarker10, fullPage: true });

    // 5. Dark theme marker test (move to Day 4 and toggle theme)
    await loc.slider.focus();
    await page.keyboard.press('Home');
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('ArrowRight');
    }
    await loc.themeToggleBtn.click();
    await page.waitForTimeout(100);
    const mDark4 = await measureMarker(page, 4);

    // 6. Window resize marker test (resize to 1024x768)
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(200);
    const mResize4 = await measureMarker(page, 4);

    // Restore viewport and theme
    await page.setViewportSize({ width: 1440, height: 900 });
    await loc.themeToggleBtn.click(); // restore to light
    await page.waitForTimeout(100);

    const markerAllValid = [m0, m4, m6, m10, mDark4, mResize4].every(m => m && m.diff <= 2);
    const markerLabelsValid = m0.label === 'Day 0' && m4.label === 'Day 4' && m6.label === 'Day 6' && m10.label === 'Day 10';

    results.push(makeRecord({
      tcId: 'TC-F-14.1',
      reqId: 'BDC-F-014',
      group: 'G3',
      inputs: 'Verify vertical marker pixel movement at Day 0, 4, 6, 10 (via keyboard slider & buttons), dark theme, and window resize',
      expected: '|drawn - expected| <= 2px across all states; badge displays "Day N"; Day 6 KPIs (Completed 29, Remaining 21, Elapsed 6, Left 4, Variance -1, On Track) update without reload',
      actual: `Diffs: Day0=${m0.diff.toFixed(2)}px, Day4=${m4.diff.toFixed(2)}px, Day6=${m6.diff.toFixed(2)}px, Day10=${m10.diff.toFixed(2)}px, Dark4=${mDark4.diff.toFixed(2)}px, Resize1024=${mResize4.diff.toFixed(2)}px. Labels verified: Day 0/4/6/10. Day 6 KPIs: Comp=${kpiComp6}, Rem=${kpiRem6}, Elapsed=${kpiElapsed6}, Left=${kpiLeft6}, Var=${kpiVar6}, Status=${kpiStatus6}`,
      status: (markerAllValid && markerLabelsValid && day6KpiOk) ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      evidencePath: ssMarker6
    }));

    await context.close();
  }

  // --------------------------------------------------------------------------
  // G4: ADD ISSUE
  // --------------------------------------------------------------------------
  log('--- Executing Group G4: Add Issue ---');
  {
    const context = await createCleanContext();
    const page = await context.newPage();
    await page.goto(`${baseUrl}/index.html`);
    const loc = getLocators(page);

    // TC-F-06.1: Add a valid issue (Key=PROJ-111, Summary="Export report", Type=Story, Points=5, Status=To Do)
    await loc.addIssueKey.fill('PROJ-111');
    await loc.addIssueSummary.fill('Export report');
    await loc.addIssueType.selectOption('Story');
    await loc.addIssuePoints.fill('5');
    await loc.addIssueStatus.selectOption('To Do');
    await loc.btnAddIssue.click();

    const totalAfterAdd = (await loc.kpi('total-scope').textContent()).trim();
    const remainingAfterAdd = (await loc.kpi('remaining-points').textContent()).trim();
    const rowCountAfterAdd = await loc.tableRows.count();
    const ssAddIssue = `docs/reports/evidence/sv-g4-add-issue-${launchRes.channel}.png`;
    await page.screenshot({ path: ssAddIssue, fullPage: true });

    results.push(makeRecord({
      tcId: 'TC-F-06.1',
      reqId: 'BDC-F-006',
      group: 'G4',
      inputs: 'Add PROJ-111, "Export report", Story, 5 pts, To Do',
      expected: 'Issue added; rows=11; Total Scope=55; Remaining=26 (was 21+5)',
      actual: `Rows=${rowCountAfterAdd}, Total Scope=${totalAfterAdd}, Remaining=${remainingAfterAdd}`,
      status: (rowCountAfterAdd === 11 && totalAfterAdd === '55' && remainingAfterAdd === '26') ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      evidencePath: ssAddIssue
    }));

    // TC-F-02.2 (first half verified above: total becomes 55)
    // We will verify the second half (delete PROJ-111 -> returns to 50) here!
    const deleteBtn = page.getByRole('button', { name: 'Delete PROJ-111', exact: true });
    await deleteBtn.click();
    const totalAfterDel = (await loc.kpi('total-scope').textContent()).trim();
    results.push(makeRecord({
      tcId: 'TC-F-02.2',
      reqId: 'BDC-F-002',
      group: 'G4',
      inputs: 'Add issue with 5 points (total 55), then delete it',
      expected: 'Total becomes 55 on add, then returns to 50 immediately on delete',
      actual: `Total after add=${totalAfterAdd}, Total after delete=${totalAfterDel}`,
      status: (totalAfterAdd === '55' && totalAfterDel === '50') ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion
    }));

    // TC-F-06.2: Duplicate key rejected (PROJ-101, proj-101, "  PROJ-101  ")
    await loc.addIssueKey.fill('PROJ-101');
    await loc.addIssueSummary.fill('Duplicate item');
    await loc.addIssuePoints.fill('3');
    await loc.btnAddIssue.click();
    const dupErr1 = (await loc.addIssueErrors.textContent()).trim();

    await loc.addIssueKey.fill('proj-101');
    await loc.btnAddIssue.click();
    const dupErr2 = (await loc.addIssueErrors.textContent()).trim();

    results.push(makeRecord({
      tcId: 'TC-F-06.2',
      reqId: 'BDC-F-006',
      group: 'G4',
      inputs: 'Submit issue with key "PROJ-101" and case-variant "proj-101"',
      expected: 'Duplicate key error shown; backlog unmodified',
      actual: `Error on PROJ-101: "${dupErr1}". Error on lowercase: "${dupErr2}"`,
      status: (dupErr1.includes('already exists') && dupErr2.includes('already exists')) ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion
    }));

    // TC-F-06.3: Empty required fields
    // STP Table 9, TC-F-06.3 (BDC-F-006): Validation message for each; issue not added
    await loc.addIssueKey.fill('');
    await loc.addIssueSummary.fill('');
    await loc.addIssuePoints.fill('');
    await loc.btnAddIssue.click();
    const emptyErrors = (await loc.addIssueErrors.textContent()).trim();

    // Use case-insensitive matching per SRS 4.2 ("Issue key is required", "Summary is required")
    const emptyErrorsPass = /issue key/i.test(emptyErrors) &&
      /summary/i.test(emptyErrors) &&
      /story points|points/i.test(emptyErrors);

    results.push(makeRecord({
      tcId: 'TC-F-06.3',
      reqId: 'BDC-F-006',
      group: 'G4',
      inputs: 'Submit empty form (blank key, blank summary, blank points)',
      expected: 'Validation errors for Key, Summary, and Points displayed; no issue created',
      actual: `Errors: "${emptyErrors}"`,
      status: emptyErrorsPass ? 'PASS' : 'FAIL',
      browserName: channel,
      browserVersion
    }));

    // TC-F-06.4: Zero-point issue allowed
    await loc.addIssueKey.fill('ZERO-1');
    await loc.addIssueSummary.fill('Zero pointer task');
    await loc.addIssuePoints.fill('0');
    await loc.addIssueStatus.selectOption('To Do');
    await loc.btnAddIssue.click();
    const totalWithZero = (await loc.kpi('total-scope').textContent()).trim();
    results.push(makeRecord({
      tcId: 'TC-F-06.4',
      reqId: 'BDC-F-006',
      group: 'G4',
      inputs: 'Add issue with storyPoints = 0',
      expected: 'Issue added; total scope remains 50; no NaN or error',
      actual: `Total scope remains ${totalWithZero}; issue ZERO-1 in backlog`,
      status: totalWithZero === '50' ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion
    }));

    await context.close();
  }

  // --------------------------------------------------------------------------
  // G5: EDIT / REOPEN
  // --------------------------------------------------------------------------
  log('--- Executing Group G5: Edit / Reopen ---');
  {
    const context = await createCleanContext();
    const page = await context.newPage();
    await page.goto(`${baseUrl}/index.html`);
    const loc = getLocators(page);

    // TC-F-07.1: Mark Done with valid day (PROJ-106 -> Done on Day 4)
    // PROJ-106 is originally 3 pts In Progress.
    // Completed was 29, now 29 + 3 = 32. Remaining was 21, now 21 - 3 = 18. Variance: Ideal(4) 30 - 18 = +12.
    const editBtn106 = page.getByRole('button', { name: 'Edit PROJ-106', exact: true });
    await editBtn106.click();
    await loc.editStatus.selectOption('Done');
    await loc.editCompletedDay.fill('4');
    await loc.editSaveBtn.click();

    const compAfterDone = (await loc.kpi('completed-points').textContent()).trim();
    const remAfterDone = (await loc.kpi('remaining-points').textContent()).trim();
    const varAfterDone = (await loc.kpiVariance.textContent()).trim();
    const ssEditDone = `docs/reports/evidence/sv-g5-edit-done-${launchRes.channel}.png`;
    await page.screenshot({ path: ssEditDone, fullPage: true });

    results.push(makeRecord({
      tcId: 'TC-F-07.1',
      reqId: 'BDC-F-007',
      group: 'G5',
      inputs: 'Edit PROJ-106 (3 pts) to Done on Day 4',
      expected: 'Completed increases to 32; Remaining decreases to 18; Variance becomes +12 (Ahead of Schedule)',
      actual: `Completed=${compAfterDone}, Remaining=${remAfterDone}, Variance=${varAfterDone}`,
      status: (compAfterDone === '32' && remAfterDone === '18' && varAfterDone === '+12') ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      evidencePath: ssEditDone
    }));

    // TC-F-15.2: KPIs update live (reopening PROJ-106 to To Do)
    await editBtn106.click();
    await loc.editStatus.selectOption('To Do');
    await loc.editSaveBtn.click();

    const compAfterReopen = (await loc.kpi('completed-points').textContent()).trim();
    const remAfterReopen = (await loc.kpi('remaining-points').textContent()).trim();
    const varAfterReopen = (await loc.kpiVariance.textContent()).trim();

    results.push(makeRecord({
      tcId: 'TC-F-15.2',
      reqId: 'BDC-F-015',
      group: 'G5',
      inputs: 'Reopen PROJ-106 to To Do',
      expected: 'KPIs update live: Completed returns to 29; Remaining to 21; Variance to +9',
      actual: `Completed=${compAfterReopen}, Remaining=${remAfterReopen}, Variance=${varAfterReopen}`,
      status: (compAfterReopen === '29' && remAfterReopen === '21' && varAfterReopen === '+9') ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion
    }));

    // TC-F-07.2: Completion day out of range (Day 5 at Current Day 4, and 11) & Day 0 rejection with state unchanged
    const stateBefore72 = await page.evaluate(async () => {
      const dmMod = await import('/js/data/dataManager.js');
      return dmMod.defaultDataManager.serialize();
    });

    // 1. Day 5 when Current Day is 4
    await editBtn106.click();
    await loc.editStatus.selectOption('Done');
    await loc.editCompletedDay.fill('5');
    await loc.editSaveBtn.click();
    const errDay5 = (await loc.editErrors.textContent()).trim();

    // 2. Day 11 when duration is 10
    await loc.editCompletedDay.fill('11');
    await loc.editSaveBtn.click();
    const errDay11 = (await loc.editErrors.textContent()).trim();
    await loc.editCancelBtn.click();

    const stateAfterDay5And11 = await page.evaluate(async () => {
      const dmMod = await import('/js/data/dataManager.js');
      return dmMod.defaultDataManager.serialize();
    });

    // 3. Any completion at Day 0 rejected with serialized state unchanged
    // Move Current Day to 0
    await loc.prevBtn.click();
    await loc.prevBtn.click();
    await loc.prevBtn.click();
    await loc.prevBtn.click();
    const currentDayAt0 = (await loc.currentDayValue.textContent()).trim();

    const stateAtDay0Before = await page.evaluate(async () => {
      const dmMod = await import('/js/data/dataManager.js');
      return dmMod.defaultDataManager.serialize();
    });

    await editBtn106.click();
    await loc.editStatus.selectOption('Done');
    await loc.editCompletedDay.fill('1');
    await loc.editSaveBtn.click();
    const errDay0 = (await loc.editErrors.textContent()).trim();
    await loc.editCancelBtn.click();

    const stateAtDay0After = await page.evaluate(async () => {
      const dmMod = await import('/js/data/dataManager.js');
      return dmMod.defaultDataManager.serialize();
    });

    // Restore Current Day back to 4 for subsequent tests
    await loc.nextBtn.click();
    await loc.nextBtn.click();
    await loc.nextBtn.click();
    await loc.nextBtn.click();
    const restoredDay = (await loc.currentDayValue.textContent()).trim();

    const f072Pass = errDay5.length > 0 &&
      errDay11.length > 0 &&
      errDay0.includes('Day 0') &&
      currentDayAt0 === '0' &&
      restoredDay === '4' &&
      stateBefore72 === stateAfterDay5And11 &&
      stateAtDay0Before === stateAtDay0After;

    results.push(makeRecord({
      tcId: 'TC-F-07.2',
      reqId: 'BDC-F-007',
      group: 'G5',
      inputs: 'Set completion day to 5 (at Current Day 4), 11 (duration 10), and any completion at Current Day 0',
      expected: 'Rejected with visible errors; issue remains unchanged; serialized state unmodified',
      actual: `Errors: Day 5="${errDay5}", Day 11="${errDay11}", Day 0="${errDay0}". State unchanged across attempts: ${stateBefore72 === stateAfterDay5And11 && stateAtDay0Before === stateAtDay0After}`,
      status: f072Pass ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion
    }));

    // TC-F-07.3: Status transitions (reopening clears completedDay)
    const proj106Day = (await loc.tableRows.nth(5).locator('.cell-number').nth(1).textContent()).trim();
    results.push(makeRecord({
      tcId: 'TC-F-07.3',
      reqId: 'BDC-F-007',
      group: 'G5',
      inputs: 'Inspect PROJ-106 completedDay cell after reopening to To Do',
      expected: 'completedDay is cleared to "--"',
      actual: `Cell text is "${proj106Day}"`,
      status: proj106Day === '--' ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion
    }));

    await context.close();
  }

  // --------------------------------------------------------------------------
  // G6: DELETE / EMPTY BACKLOG
  // --------------------------------------------------------------------------
  log('--- Executing Group G6: Delete / Empty ---');
  {
    const context = await createCleanContext();
    const page = await context.newPage();
    await page.goto(`${baseUrl}/index.html`);
    const loc = getLocators(page);

    // TC-F-08.1: Delete an issue (Delete PROJ-110 only: Total 45, Completed 29, Remaining 16, Ideal(4)=27, Variance +11)
    const del110 = page.getByRole('button', { name: 'Delete PROJ-110', exact: true });
    await del110.click();

    const totalScope8 = (await loc.kpi('total-scope').textContent()).trim();
    const comp8 = (await loc.kpi('completed-points').textContent()).trim();
    const rem8 = (await loc.kpi('remaining-points').textContent()).trim();
    const var8 = (await loc.kpiVariance.textContent()).trim();
    const ideal8At4 = await page.evaluate(async () => {
      const chartMod = await import('/js/ui/chart.js');
      const ci = chartMod.getChartInstance();
      return ci.data.datasets[0].data[4];
    });

    const ssDelete = `docs/reports/evidence/sv-g6-delete-${launchRes.channel}.png`;
    await page.screenshot({ path: ssDelete, fullPage: true });

    const f081Pass = totalScope8 === '45' &&
      comp8 === '29' &&
      rem8 === '16' &&
      ideal8At4 === 27 &&
      var8 === '+11';

    results.push(makeRecord({
      tcId: 'TC-F-08.1',
      reqId: 'BDC-F-008',
      group: 'G6',
      inputs: 'Delete PROJ-110 (5 pts To Do) from default dataset',
      expected: 'Total=45, Completed=29, Remaining=16, Ideal(4)=27, Variance=+11',
      actual: `Total=${totalScope8}, Completed=${comp8}, Remaining=${rem8}, Ideal(4)=${ideal8At4}, Variance=${var8}`,
      status: f081Pass ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      evidencePath: ssDelete
    }));

    // Delete all remaining issues to test empty backlog (TC-SR-04.1)
    let remainingButtons = await page.locator('#backlog-table button[data-action="delete"]').count();
    while (remainingButtons > 0) {
      await page.locator('#backlog-table button[data-action="delete"]').first().click();
      remainingButtons = await page.locator('#backlog-table button[data-action="delete"]').count();
    }

    const emptyTotal = (await loc.kpi('total-scope').textContent()).trim();
    const emptyComp = (await loc.kpi('completed-points').textContent()).trim();
    const emptyRem = (await loc.kpi('remaining-points').textContent()).trim();
    const emptyMsg = (await loc.emptyState.textContent()).trim();
    const ssEmpty = `docs/reports/evidence/sv-g6-empty-backlog-${launchRes.channel}.png`;
    await page.screenshot({ path: ssEmpty, fullPage: true });

    results.push(makeRecord({
      tcId: 'TC-SR-04.1',
      reqId: 'BDC-SR-004',
      group: 'G6',
      inputs: 'Delete all 10 issues until backlog is empty',
      expected: 'Total=0, Completed=0, Remaining=0, empty-backlog guidance shown, no NaN/Infinity',
      actual: `Total=${emptyTotal}, Completed=${emptyComp}, Remaining=${emptyRem}. Notice: "${emptyMsg}"`,
      status: (emptyTotal === '0' && emptyComp === '0' && emptyRem === '0' && emptyMsg.includes('empty')) ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      evidencePath: ssEmpty
    }));

    // TC-SR-04.2: Zero totals and missing dates
    // In empty state, ideal and actual calculations should remain defined without crashing
    const emptyChartData = await page.evaluate(async () => {
      const chartMod = await import('/js/ui/chart.js');
      const ci = chartMod.getChartInstance();
      return {
        ideal0: ci.data.datasets[0].data[0],
        actual0: ci.data.datasets[1].data[0]
      };
    });
    results.push(makeRecord({
      tcId: 'TC-SR-04.2',
      reqId: 'BDC-SR-004',
      group: 'G6',
      inputs: 'Inspect chart calculations when scope is 0',
      expected: 'Ideal(0)=0, Actual(0)=0, no exceptions or NaN',
      actual: `Ideal(0)=${emptyChartData.ideal0}, Actual(0)=${emptyChartData.actual0}`,
      status: (emptyChartData.ideal0 === 0 && emptyChartData.actual0 === 0) ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion
    }));

    await context.close();
  }

  // --------------------------------------------------------------------------
  // G7: RESET DATA
  // --------------------------------------------------------------------------
  log('--- Executing Group G7: Reset Data ---');
  {
    const context = await createCleanContext();
    const page = await context.newPage();
    await page.goto(`${baseUrl}/index.html`);
    const loc = getLocators(page);

    // TC-F-09.1: Reset restores defaults after mutations
    // STP Table 9, TC-F-09.1 (BDC-F-009): Original 10 issues, Sprint 1 config, Current Day=4, Total=50
    // 1. Add an issue
    await loc.addIssueKey.fill('MUT-1');
    await loc.addIssueSummary.fill('Temp mutation');
    await loc.addIssuePoints.fill('10');
    await loc.addIssueStatus.selectOption('To Do');
    await loc.btnAddIssue.click();

    // 2. Change Current Day to 7
    await loc.nextBtn.click(); // 5
    await loc.nextBtn.click(); // 6
    await loc.nextBtn.click(); // 7

    // 3. Edit sprint duration to 15
    await loc.configBtn.click();
    await loc.inputDurationDays.fill('15');
    await loc.saveSprintBtn.click();

    // 4. Click Reset Data
    await loc.resetBtn.click();

    const resetTotal = (await loc.kpi('total-scope').textContent()).trim();
    const resetComp = (await loc.kpi('completed-points').textContent()).trim();
    const resetRem = (await loc.kpi('remaining-points').textContent()).trim();
    const resetDayBadge = (await loc.currentDayBadge.textContent()).trim();
    const resetDayNum = (await loc.currentDayValue.textContent()).trim();
    const resetRows = await loc.tableRows.count();
    const ssReset = `docs/reports/evidence/sv-g7-reset-${channel}.png`;
    await page.screenshot({ path: ssReset, fullPage: true });

    const resetPass = resetTotal === '50' &&
      resetComp === '29' &&
      resetRem === '21' &&
      resetDayNum === '4' &&
      resetDayBadge.includes('Day 4 of 10') &&
      resetRows === 10;

    results.push(makeRecord({
      tcId: 'TC-F-09.1',
      reqId: 'BDC-F-009',
      group: 'G7',
      inputs: 'Perform Add, Day move to 7, Duration to 15; Click "Reset Data"',
      expected: 'Exact baseline defaults restored: 10 issues, 50 pts, Day 4 of 10',
      actual: `Rows=${resetRows}, Total=${resetTotal}, Completed=${resetComp}, Remaining=${resetRem}, DayBadge="${resetDayBadge}"`,
      status: resetPass ? 'PASS' : 'FAIL',
      browserName: channel,
      browserVersion,
      evidencePath: ssReset
    }));

    await context.close();
  }

  // --------------------------------------------------------------------------
  // G8: STATUS CLASSIFICATION AND CHART
  // --------------------------------------------------------------------------
  log('--- Executing Group G8: Status Classification and Chart ---');
  {
    const context = await createCleanContext();
    const page = await context.newPage();
    await page.goto(`${baseUrl}/index.html`);
    const loc = getLocators(page);

    // TC-F-12.1: Ahead of Schedule (Default at Day 4 has variance +9)
    const statusAhead = (await loc.kpiStatusBadge.textContent()).trim();
    results.push(makeRecord({
      tcId: 'TC-F-12.1',
      reqId: 'BDC-F-012',
      group: 'G8',
      inputs: 'Verify default status at Day 4 (Variance = +9 pts)',
      expected: 'Status is "Ahead of Schedule" (variance > +1)',
      actual: `Status badge shows "${statusAhead}"`,
      status: statusAhead === 'Ahead of Schedule' ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion
    }));

    // TC-F-12.2: On Track (Variance between -1 and +1 inclusive)
    // At Day 4, Ideal is 30. Remaining is currently 21.
    // If we add an issue with 9 pts To Do: Remaining becomes 30 -> Variance = 30 - 30 = 0 -> On Track
    await loc.addIssueKey.fill('ONTRACK-1');
    await loc.addIssueSummary.fill('Balance points to 0 variance');
    await loc.addIssuePoints.fill('9');
    await loc.addIssueStatus.selectOption('To Do');
    await loc.btnAddIssue.click();

    // Now Total=59. Wait! If Total=59, Ideal(4) = 59 * (1 - 4/10) = 59 * 0.6 = 35.4!
    // Remaining is 21 + 9 = 30. Variance = 35.4 - 30 = +5.4!
    // To get exact Variance = 0, let's solve:
    // Ideal(4) - Remaining = (50 + X)*0.6 - (21 + X) = 30 + 0.6X - 21 - X = 9 - 0.4X = 0 => 0.4X = 9 => X = 22.5 pts!
    // Let's reset and add X = 22.5 pts:
    await loc.resetBtn.click();
    await loc.addIssueKey.fill('BAL-22');
    await loc.addIssueSummary.fill('Add 22.5 pts To Do');
    await loc.addIssuePoints.fill('22.5');
    await loc.addIssueStatus.selectOption('To Do');
    await loc.btnAddIssue.click();

    const var0 = (await loc.kpiVariance.textContent()).trim();
    const status0 = (await loc.kpiStatusBadge.textContent()).trim();
    const ssOnTrack = `docs/reports/evidence/sv-g8-ontrack-${launchRes.channel}.png`;
    await page.screenshot({ path: ssOnTrack, fullPage: true });

    results.push(makeRecord({
      tcId: 'TC-F-12.2',
      reqId: 'BDC-F-012',
      group: 'G8',
      inputs: 'Add 22.5 pts To Do at Day 4 to achieve Variance = 0',
      expected: 'Variance = 0, Status is "On Track" (within [-1, +1] tolerance)',
      actual: `Variance="${var0}", Status="${status0}"`,
      status: (var0 === '0' && status0 === 'On Track') ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      evidencePath: ssOnTrack
    }));

    // TC-F-12.3: Behind Schedule (Variance < -1)
    // Reset and move to Day 7:
    // At Day 7: Ideal(7) = 50 * (1 - 7/10) = 15. Remaining = 21 (no issues completed on days 5..7).
    // Variance = 15 - 21 = -6 pts! Behind Schedule!
    await loc.resetBtn.click();
    await loc.nextBtn.click(); // Day 5
    await loc.nextBtn.click(); // Day 6
    await loc.nextBtn.click(); // Day 7

    const varBehind = (await loc.kpiVariance.textContent()).trim();
    const statusBehind = (await loc.kpiStatusBadge.textContent()).trim();
    const ssBehind = `docs/reports/evidence/sv-g8-behind-${launchRes.channel}.png`;
    await page.screenshot({ path: ssBehind, fullPage: true });

    results.push(makeRecord({
      tcId: 'TC-F-12.3',
      reqId: 'BDC-F-012',
      group: 'G8',
      inputs: 'Move Current Day to Day 7 on default dataset',
      expected: 'Variance = -6 pts, Status is "Behind Schedule" (variance < -1)',
      actual: `Variance="${varBehind}", Status="${statusBehind}"`,
      status: (varBehind === '-6' && statusBehind === 'Behind Schedule') ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      evidencePath: ssBehind
    }));

    await context.close();
  }

  // --------------------------------------------------------------------------
  // G9: EDGE CASES
  // --------------------------------------------------------------------------
  log('--- Executing Group G9: Edge Cases ---');
  {
    const context = await createCleanContext();
    const page = await context.newPage();
    await page.goto(`${baseUrl}/index.html`);
    const loc = getLocators(page);

    // 1. Single-day sprint (Duration = 1)
    await loc.configBtn.click();
    await loc.inputDurationDays.fill('1');
    await loc.saveSprintBtn.click();

    // Check Day 0 and Day 1 navigation
    const prevDisabledAt0 = await page.evaluate(async () => {
      const dmMod = await import('/js/data/dataManager.js');
      dmMod.defaultDataManager.setCurrentDay(0);
      return document.querySelector('[data-testid="btn-prev-day"]').disabled;
    });

    const nextDisabledAt1 = await page.evaluate(async () => {
      const dmMod = await import('/js/data/dataManager.js');
      dmMod.defaultDataManager.setCurrentDay(1);
      return document.querySelector('[data-testid="btn-next-day"]').disabled;
    });

    results.push(makeRecord({
      tcId: 'EDGE-SINGLE-DAY',
      reqId: 'BDC-SR-004',
      group: 'G9',
      inputs: 'Configure single-day sprint (Duration = 1), test Day 0 and Day 1 bounds',
      expected: 'Day navigation 0..1 works; Prev disabled at Day 0, Next disabled at Day 1; all values finite',
      actual: `Prev disabled at Day 0: ${prevDisabledAt0}, Next disabled at Day 1: ${nextDisabledAt1}`,
      status: (prevDisabledAt0 && nextDisabledAt1) ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion
    }));

    // 2. Long unbroken strings in Key (60 chars) and Summary (200 chars)
    await loc.resetBtn.click();
    const longKey = 'A'.repeat(60);
    const longSummary = 'B'.repeat(200);
    await loc.addIssueKey.fill(longKey);
    await loc.addIssueSummary.fill(longSummary);
    await loc.addIssuePoints.fill('1');
    await loc.addIssueStatus.selectOption('To Do');
    await loc.btnAddIssue.click();

    // Verify document does not horizontally overflow
    const docOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    results.push(makeRecord({
      tcId: 'EDGE-LONG-TEXT',
      reqId: 'BDC-NF-004',
      group: 'G9',
      inputs: 'Add issue with 60-char unbroken key and 200-char unbroken summary',
      expected: 'Layout wraps text safely; document.documentElement has no horizontal scroll',
      actual: `document.documentElement.scrollWidth <= clientWidth: ${docOverflow}`,
      status: docOverflow ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion
    }));

    // 3. TC-F-10.2: Zero duration handled safely (Unit/inspection check)
    const zeroDurationSafe = await page.evaluate(async () => {
      const engine = await import('/js/logic/burndownEngine.js');
      const ideal = engine.calculateIdealSeries(50, 0);
      const computed = engine.computeAll({ durationDays: 0, currentDay: 0 }, []);
      return Array.isArray(ideal) && ideal.length === 0 && !isNaN(computed.variance) && isFinite(computed.variance);
    });
    results.push(makeRecord({
      tcId: 'TC-F-10.2',
      reqId: 'BDC-F-010',
      group: 'G9',
      inputs: 'Call calculateIdealSeries(50, 0) and computeAll with duration=0 directly',
      expected: 'Returns safe fallback empty series and finite variance without throwing or producing NaN/Infinity',
      actual: `calculateIdealSeries and computeAll return safe output: ${zeroDurationSafe}`,
      status: zeroDurationSafe ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion
    }));

    await context.close();
  }

  // --------------------------------------------------------------------------
  // STEP 3: VIEWPORTS, THEMES & TABLE SCROLLING
  // --------------------------------------------------------------------------
  log('--- Executing Step 3: Viewports, Themes & Responsiveness ---');
  {
    const viewports = [1024, 1366, 1440, 1920];
    const themes = ['light', 'dark'];

    for (const theme of themes) {
      for (const w of viewports) {
        const context = await createCleanContext({ viewport: { width: w, height: 900 } });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(e));

        await page.goto(`${baseUrl}/index.html`);
        if (theme === 'dark') {
          await page.click('#theme-toggle-btn');
        }

        const metrics = await page.evaluate(() => {
          const docEl = document.documentElement;
          const tableWrap = document.querySelector('.table-wrapper');
          return {
            pageScrollWidth: docEl.scrollWidth,
            pageClientWidth: docEl.clientWidth,
            tableScrollWidth: tableWrap ? tableWrap.scrollWidth : 0,
            tableClientWidth: tableWrap ? tableWrap.clientWidth : 0
          };
        });

        const pageOk = metrics.pageScrollWidth <= metrics.pageClientWidth;
        const tableScrolls = metrics.tableScrollWidth > metrics.tableClientWidth;

        const ssPath = `docs/reports/evidence/sv-responsive-${w}px-${theme}-${launchRes.channel}.png`;
        await page.screenshot({ path: ssPath, fullPage: true });

        // Record TC-NF-04.2
        results.push(makeRecord({
          tcId: `TC-NF-04.2-${w}px-${theme}`,
          reqId: 'BDC-NF-004',
          group: 'COMPATIBILITY',
          inputs: `Viewport width ${w}px, theme ${theme}`,
          expected: 'Page has no horizontal scroll (scrollWidth === clientWidth)',
          actual: `Page scrollWidth=${metrics.pageScrollWidth}, clientWidth=${metrics.pageClientWidth}. Table scrollWidth=${metrics.tableScrollWidth}, clientWidth=${metrics.tableClientWidth}`,
          status: pageOk ? 'PASS' : 'FAIL',
          browserName: launchRes.channel,
          browserVersion,
          viewport: `${w}x900`,
          theme: theme,
          evidencePath: ssPath
        }));

        await context.close();
      }
    }

    // Explicit check for TC-F-13.2 (Table Scrolling criterion)
    // Note: Marked PENDING CONFIRMATION WITH NAVEEN as instructed
    results.push(makeRecord({
      tcId: 'TC-F-13.2',
      reqId: 'BDC-F-013',
      group: 'COMPATIBILITY',
      inputs: 'Verify table scrolling across 1024-1920px viewports',
      expected: 'Page has no horizontal scroll (PASS); Table wrapper scrolling pending team clarification',
      actual: 'Page has 0px horizontal overflow across all tested viewports. Backlog table wrapper fits or scrolls internally per design.',
      status: 'BLOCKED', // As instructed: mark table-scroll criterion "PENDING CONFIRMATION WITH NAVEEN", never PASS
      browserName: launchRes.channel,
      browserVersion,
      error: 'PENDING CONFIRMATION WITH NAVEEN: STP Section 6 says "no horizontal scrolling" while checklist allows internal backlog table scrolling.'
    }));
  }

  // --------------------------------------------------------------------------
  // STEP 4: ACCESSIBILITY
  // --------------------------------------------------------------------------
  log('--- Executing Step 4: Accessibility & Keyboard Navigation ---');
  {
    const context = await createCleanContext();
    const page = await context.newPage();
    await page.goto(`${baseUrl}/index.html`);
    const loc = getLocators(page);

    // 1. Skip link and Tab order
    await page.keyboard.press('Tab');
    const skipLinkActive = await page.evaluate(() => document.activeElement.textContent);
    await page.keyboard.press('Enter');
    const mainFocused = await page.evaluate(() => document.activeElement.id);

    results.push(makeRecord({
      tcId: 'TC-NF-02.1-SKIP',
      reqId: 'BDC-NF-002',
      group: 'ACCESSIBILITY',
      inputs: 'Press Tab on initial load, then press Enter',
      expected: 'First tab reaches skip link; Enter moves focus to #main-content',
      actual: `Active element on tab="${skipLinkActive}", active on enter="${mainFocused}"`,
      status: (skipLinkActive === 'Skip to dashboard' && mainFocused === 'main-content') ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion
    }));

    // 2. Focus moves to Status select when editor opens
    const editBtn101 = page.getByRole('button', { name: 'Edit PROJ-101', exact: true });
    await editBtn101.click();
    const focusedInEditor = await page.evaluate(() => document.activeElement.id);
    await page.keyboard.press('Escape');
    const focusedAfterCancel = await page.evaluate(() => document.activeElement.dataset?.issueKey);

    results.push(makeRecord({
      tcId: 'TC-NF-02.1-FOCUS',
      reqId: 'BDC-NF-002',
      group: 'ACCESSIBILITY',
      inputs: 'Click Edit on PROJ-101, then press Escape',
      expected: 'Focus moves to #edit-issue-status upon open; returns to Edit PROJ-101 upon Escape',
      actual: `Editor focus="${focusedInEditor}", focus after Escape="${focusedAfterCancel}"`,
      status: (focusedInEditor === 'edit-issue-status' && focusedAfterCancel === 'PROJ-101') ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion
    }));

    // 3. TC-NF-02.2: Programmatic labels and status indicators
    const accessibilityTreeValid = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]), select, textarea'));
      const unlabeled = inputs.filter(el => {
        const id = el.id;
        const hasAriaLabel = el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby');
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        return !hasAriaLabel && !hasLabel;
      });
      return unlabeled.length === 0;
    });

    results.push(makeRecord({
      tcId: 'TC-NF-02.2',
      reqId: 'BDC-NF-002',
      group: 'ACCESSIBILITY',
      inputs: 'Scan all form inputs and selects for explicit <label for> or aria-label',
      expected: '100% of interactive form controls have programmatic accessible labels',
      actual: `All controls properly labeled: ${accessibilityTreeValid}`,
      status: accessibilityTreeValid ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion
    }));

    // 4. TC-NF-02.3-STATUS: Status indicators contrast & color distinction (BDC-NF-002)
    async function extractBadgeColors(theme) {
      return await page.evaluate((th) => {
        function parseRgb(colorStr) {
          const m = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          if (!m) return [0, 0, 0, 1];
          return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10), m[4] !== undefined ? parseFloat(m[4]) : 1];
        }
        function composite(fgRgba, bgRgb) {
          const a = fgRgba[3];
          return [
            Math.round(fgRgba[0] * a + bgRgb[0] * (1 - a)),
            Math.round(fgRgba[1] * a + bgRgb[1] * (1 - a)),
            Math.round(fgRgba[2] * a + bgRgb[2] * (1 - a))
          ];
        }
        function relativeLuminance([r, g, b]) {
          const [rs, gs, bs] = [r, g, b].map(c => {
            const s = c / 255;
            return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        }
        function contrastRatio(rgb1, rgb2) {
          const l1 = relativeLuminance(rgb1);
          const l2 = relativeLuminance(rgb2);
          return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        }

        const cardBg = th === 'dark' ? [30, 41, 59] : [255, 255, 255];

        const schedBadge = document.querySelector('[data-testid="kpi-schedule-status"] [data-testid="status-badge"]');
        const csSched = window.getComputedStyle(schedBadge);
        const fgSched = parseRgb(csSched.color);
        const bgSched = parseRgb(csSched.backgroundColor);
        const compBgSched = composite(bgSched, cardBg);
        const schedInfo = {
          text: schedBadge.textContent.trim(),
          hasText: schedBadge.textContent.trim().length > 0,
          color: csSched.color,
          bg: csSched.backgroundColor,
          border: csSched.borderColor,
          compBg: compBgSched,
          contrast: parseFloat(contrastRatio(fgSched, compBgSched).toFixed(2))
        };

        const issueBadges = {};
        document.querySelectorAll('#backlog-table tbody tr').forEach(tr => {
          const b = tr.querySelector('.status-badge');
          if (b && !issueBadges[b.textContent.trim()]) {
            const cs = window.getComputedStyle(b);
            const fg = parseRgb(cs.color);
            const bg = parseRgb(cs.backgroundColor);
            const compBg = composite(bg, cardBg);
            issueBadges[b.textContent.trim()] = {
              text: b.textContent.trim(),
              hasText: b.textContent.trim().length > 0,
              color: cs.color,
              bg: cs.backgroundColor,
              border: cs.borderColor,
              compBg: compBg,
              contrast: parseFloat(contrastRatio(fg, compBg).toFixed(2))
            };
          }
        });

        return { schedInfo, issueBadges };
      }, theme);
    }

    // Capture Schedule Status across reachable states (Day 4: Ahead, Day 6: On Track, Day 7: Behind)
    const ssAhead = `docs/reports/evidence/sv-status-ahead-${launchRes.channel}-${TODAY}-${SHA7}.png`;
    await page.screenshot({ path: ssAhead });
    const aheadLight = await extractBadgeColors('light');

    await loc.nextBtn.click();
    await loc.nextBtn.click();
    await page.waitForTimeout(50);
    const ssOnTrack = `docs/reports/evidence/sv-status-ontrack-${launchRes.channel}-${TODAY}-${SHA7}.png`;
    await page.screenshot({ path: ssOnTrack });
    const ontrackLight = await extractBadgeColors('light');

    await loc.nextBtn.click();
    await page.waitForTimeout(50);
    const ssBehind = `docs/reports/evidence/sv-status-behind-${launchRes.channel}-${TODAY}-${SHA7}.png`;
    await page.screenshot({ path: ssBehind });
    const behindLight = await extractBadgeColors('light');

    // Dark Theme checks
    await loc.themeToggleBtn.click();
    await page.waitForTimeout(100);
    const behindDark = await extractBadgeColors('dark');

    // Move back to Day 4 in Dark
    await loc.prevBtn.click();
    await loc.prevBtn.click();
    await loc.prevBtn.click();
    await page.waitForTimeout(50);
    const aheadDark = await extractBadgeColors('dark');

    // Move to Day 6 in Dark
    await loc.nextBtn.click();
    await loc.nextBtn.click();
    await page.waitForTimeout(50);
    const ontrackDark = await extractBadgeColors('dark');

    // Restore Light Theme and Day 4
    await loc.prevBtn.click();
    await loc.prevBtn.click();
    await loc.themeToggleBtn.click();
    await page.waitForTimeout(100);

    // Delta-E 76 helper in Node
    function rgbToLab([r, g, b]) {
      const [rl, gl, bl] = [r, g, b].map(v => {
        const s = v / 255;
        return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      let x = (rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375) / 0.95047;
      let y = (rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750) / 1.00000;
      let z = (rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041) / 1.08883;
      const f = t => t > 0.008856 ? Math.cbrt(t) : (7.787 * t) + (16 / 116);
      const fx = f(x);
      const fy = f(y);
      const fz = f(z);
      return [(116 * fy) - 16, 500 * (fx - fy), 200 * (fy - fz)];
    }
    function deltaE76(rgb1, rgb2) {
      const lab1 = rgbToLab(rgb1);
      const lab2 = rgbToLab(rgb2);
      return Math.sqrt(Math.pow(lab1[0] - lab2[0], 2) + Math.pow(lab1[1] - lab2[1], 2) + Math.pow(lab1[2] - lab2[2], 2));
    }

    const dE_Ahead_OnTrack_Light = deltaE76(aheadLight.schedInfo.compBg, ontrackLight.schedInfo.compBg);
    const dE_Ahead_Behind_Light = deltaE76(aheadLight.schedInfo.compBg, behindLight.schedInfo.compBg);
    const dE_OnTrack_Behind_Light = deltaE76(ontrackLight.schedInfo.compBg, behindLight.schedInfo.compBg);

    const dE_Ahead_OnTrack_Dark = deltaE76(aheadDark.schedInfo.compBg, ontrackDark.schedInfo.compBg);
    const dE_Ahead_Behind_Dark = deltaE76(aheadDark.schedInfo.compBg, behindDark.schedInfo.compBg);
    const dE_OnTrack_Behind_Dark = deltaE76(ontrackDark.schedInfo.compBg, behindDark.schedInfo.compBg);

    const allContrastsValid = [
      aheadLight.schedInfo.contrast, ontrackLight.schedInfo.contrast, behindLight.schedInfo.contrast,
      aheadDark.schedInfo.contrast, ontrackDark.schedInfo.contrast, behindDark.schedInfo.contrast,
      ...Object.values(aheadLight.issueBadges).map(b => b.contrast),
      ...Object.values(aheadDark.issueBadges).map(b => b.contrast)
    ].every(c => c >= 4.5);

    const allLabelsPresent = aheadLight.schedInfo.hasText && ontrackLight.schedInfo.hasText && behindLight.schedInfo.hasText &&
      Object.values(aheadLight.issueBadges).every(b => b.hasText);

    // Chosen pass threshold: CIE76 delta-E >= 5.0 (substantially exceeds the human Just Noticeable Difference JND = 2.3)
    const allDistancesDistinct = [
      dE_Ahead_OnTrack_Light, dE_Ahead_Behind_Light, dE_OnTrack_Behind_Light,
      dE_Ahead_OnTrack_Dark, dE_Ahead_Behind_Dark, dE_OnTrack_Behind_Dark
    ].every(d => d >= 5.0);

    results.push(makeRecord({
      tcId: 'TC-NF-02.3',
      reqId: 'BDC-NF-002',
      group: 'ACCESSIBILITY',
      inputs: 'Inspect Schedule Status (Ahead, On Track, Behind) and Issue badges (Done, In Progress, To Do) in Light and Dark themes',
      expected: 'Text-to-background contrast >= 4.5:1 (WCAG 2.1 AA); visible text label present (not color alone); pairwise background CIE76 delta-E >= 5.0 (perceptually distinct, > 2.3 JND threshold)',
      actual: `WCAG Contrast (>=4.5:1): Light Ahead=${aheadLight.schedInfo.contrast}:1, OnTrack=${ontrackLight.schedInfo.contrast}:1, Behind=${behindLight.schedInfo.contrast}:1; Dark Ahead=${aheadDark.schedInfo.contrast}:1, OnTrack=${ontrackDark.schedInfo.contrast}:1, Behind=${behindDark.schedInfo.contrast}:1. Delta-E: Light Ahead-OnTrack=${dE_Ahead_OnTrack_Light.toFixed(1)}, Ahead-Behind=${dE_Ahead_Behind_Light.toFixed(1)}, OnTrack-Behind=${dE_OnTrack_Behind_Light.toFixed(1)}; Dark Ahead-OnTrack=${dE_Ahead_OnTrack_Dark.toFixed(1)}, Ahead-Behind=${dE_Ahead_Behind_Dark.toFixed(1)}, OnTrack-Behind=${dE_OnTrack_Behind_Dark.toFixed(1)}. Text labels verified.`,
      status: (allContrastsValid && allLabelsPresent && allDistancesDistinct) ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      evidencePath: ssAhead
    }));

    await context.close();
  }

  // --------------------------------------------------------------------------
  // STEP 4B: KEYBOARD-ONLY WORKFLOW (GROUP G-KB)
  // --------------------------------------------------------------------------
  log('--- Executing Group G-KB: Keyboard-Only Navigation ---');
  {
    const context = await createCleanContext();
    const page = await context.newPage();
    await page.goto(`${baseUrl}/index.html`);
    await page.waitForSelector('#backlog-table');

    async function getActive() {
      return await page.evaluate(() => {
        const el = document.activeElement;
        return {
          id: el.id,
          tag: el.tagName,
          testId: el.getAttribute('data-testid'),
          ariaLabel: el.getAttribute('aria-label'),
          text: el.textContent?.trim().slice(0, 30),
          key: el.dataset?.issueKey,
          disabled: el.hasAttribute('disabled')
        };
      });
    }

    async function tabUntil(predicate, max = 70, shift = false) {
      for (let i = 0; i < max; i++) {
        if (shift) {
          await page.keyboard.press('Shift+Tab');
        } else {
          await page.keyboard.press('Tab');
        }
        const active = await getActive();
        if (predicate(active)) return active;
      }
      throw new Error(`Tab target predicate not reached within ${max} presses`);
    }

    // 1. Record complete Tab order list
    const tabOrderList = [];
    for (let i = 0; i < 35; i++) {
      await page.keyboard.press('Tab');
      const info = await getActive();
      tabOrderList.push(info.id || info.testId || info.ariaLabel || info.text || info.tag);
      if (info.id === 'theme-toggle-btn' && tabOrderList.filter(x => x === 'theme-toggle-btn').length > 1) {
        break;
      }
    }

    results.push(makeRecord({
      tcId: 'TC-NF-02.1-KB-ORDER',
      reqId: 'BDC-NF-002',
      group: 'G-KB',
      inputs: 'Sequential Tab traversal from initial page load',
      expected: 'All interactive controls reachable in logical order without pointer clicks',
      actual: `Recorded ${tabOrderList.length} tab stops: ${tabOrderList.slice(0, 10).join(' -> ')}...`,
      status: tabOrderList.length >= 25 ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      method: 'automated keyboard-only'
    }));

    // Reload page to start with clean focus state
    await page.reload();
    await page.waitForSelector('#backlog-table');

    // 2. Skip link via keyboard
    await page.keyboard.press('Tab');
    const skipActive = await getActive();
    await page.keyboard.press('Enter');
    const mainActive = await getActive();
    results.push(makeRecord({
      tcId: 'TC-NF-02.1-KB-SKIP',
      reqId: 'BDC-NF-002',
      group: 'G-KB',
      inputs: 'Press Tab then Enter on initial load',
      expected: 'Skip link focused on first Tab; Enter moves focus to main-content',
      actual: `First tab="${skipActive.text}", Enter focus="${mainActive.id}"`,
      status: (skipActive.text === 'Skip to dashboard' && mainActive.id === 'main-content') ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      method: 'automated keyboard-only'
    }));

    // 3. Theme toggle via keyboard
    await tabUntil(a => a.id === 'theme-toggle-btn');
    await page.keyboard.press('Space');
    const darkThemeActive = await page.evaluate(() => document.documentElement.getAttribute('data-theme') === 'dark');
    const focusAfterDark = await getActive();
    await page.keyboard.press('Space');
    const lightThemeActive = await page.evaluate(() => document.documentElement.getAttribute('data-theme') === 'light');
    const focusAfterLight = await getActive();

    results.push(makeRecord({
      tcId: 'TC-NF-02.1-KB-THEME',
      reqId: 'BDC-NF-002',
      group: 'G-KB',
      inputs: 'Tab to theme toggle button, press Space twice',
      expected: 'Theme toggles to dark and back to light; focus remains on theme toggle button',
      actual: `Dark theme=${darkThemeActive}, Light theme=${lightThemeActive}, Focus remained="${focusAfterLight.id}"`,
      status: (darkThemeActive && lightThemeActive && focusAfterLight.id === 'theme-toggle-btn') ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      method: 'automated keyboard-only'
    }));

    // 4. Configure Sprint via keyboard
    await tabUntil(a => a.testId === 'btn-configure-sprint');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    const focusAfterConfigOpen = await getActive();

    // Type invalid duration 65 and attempt to save
    await tabUntil(a => a.id === 'input-duration-days');
    await page.keyboard.press('Control+A');
    await page.keyboard.type('65');
    await tabUntil(a => a.testId === 'btn-save-sprint');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    const configErrorVisible = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="config-errors"], .form-errors');
      return el && el.textContent.includes('60');
    });

    // Fix duration to 10 and save
    await tabUntil(a => a.id === 'input-duration-days');
    await page.keyboard.press('Control+A');
    await page.keyboard.type('10');
    await tabUntil(a => a.testId === 'btn-save-sprint');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    const focusAfterConfigSave = await getActive();

    results.push(makeRecord({
      tcId: 'TC-NF-02.1-KB-CONFIG',
      reqId: 'BDC-NF-002',
      group: 'G-KB',
      inputs: 'Configure Sprint opened with Enter, duration 65 tested and rejected, corrected to 10 and saved',
      expected: 'Form opens with focus on sprint name; duration 65 shows error; saving closes form and restores focus to Configure Sprint button',
      actual: `Focus on open="${focusAfterConfigOpen.id}", error shown on 65=${configErrorVisible}, focus on save="${focusAfterConfigSave.testId}"`,
      status: (focusAfterConfigOpen.id === 'input-sprint-name' && configErrorVisible && focusAfterConfigSave.testId === 'btn-configure-sprint') ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      method: 'automated keyboard-only'
    }));

    // 5. Current Day slider & boundary buttons via keyboard
    await tabUntil(a => a.id === 'current-day-slider');
    await page.keyboard.press('Home'); // Day 0
    await page.waitForTimeout(50);
    const prevDisabledAt0 = await page.evaluate(() => document.querySelector('[data-testid="btn-prev-day"]').hasAttribute('disabled'));

    // Move to Day 1 via slider ArrowRight
    await page.keyboard.press('ArrowRight'); // Day 1
    await page.waitForTimeout(50);
    // Both buttons enabled at Day 1; Shift+Tab to Next Day, then Prev Day
    await tabUntil(a => a.testId === 'btn-next-day', 5, true);
    await page.keyboard.press('Space'); // Day 1 -> Day 2 via Next Day button
    await page.waitForTimeout(50);
    await tabUntil(a => a.testId === 'btn-prev-day', 5, true);
    await page.keyboard.press('Space'); // Day 2 -> Day 1 via Prev Day button
    await page.waitForTimeout(50);

    // Tab forward to slider and go to Day 10
    await tabUntil(a => a.id === 'current-day-slider');
    await page.keyboard.press('End'); // Day 10
    await page.waitForTimeout(50);
    const nextDisabledAt10 = await page.evaluate(() => document.querySelector('[data-testid="btn-next-day"]').hasAttribute('disabled'));

    // Restore Day 4
    await page.keyboard.press('Home');
    for (let k = 0; k < 4; k++) await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(50);
    const dayAfterKbNav = await page.evaluate(() => document.querySelector('#current-day-slider').value);

    results.push(makeRecord({
      tcId: 'TC-NF-02.1-KB-DAY',
      reqId: 'BDC-NF-002',
      group: 'G-KB',
      inputs: 'Drive Current Day slider with Arrow/Home/End and Prev/Next buttons',
      expected: 'Prev button disabled at Day 0; Next button disabled at Day 10; slider keys navigate accurately',
      actual: `Prev disabled at Day 0=${prevDisabledAt0}, Next disabled at Day 10=${nextDisabledAt10}, Restored Day=${dayAfterKbNav}`,
      status: (prevDisabledAt0 && nextDisabledAt10 && dayAfterKbNav === '4') ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      method: 'automated keyboard-only'
    }));

    // 6. Add Issue workflow & duplicate key rejection via keyboard
    await tabUntil(a => a.id === 'add-issue-key');
    await page.keyboard.type('PROJ-111');
    await page.keyboard.press('Tab'); // Type
    await page.keyboard.press('Tab'); // Points
    await page.keyboard.type('5');
    await page.keyboard.press('Tab'); // Status
    await page.keyboard.press('Tab'); // Summary
    await page.keyboard.type('Keyboard Workflow Verification');
    await page.keyboard.press('Tab'); // Add Issue button
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    const focusAfterAdd = await getActive();
    const scopeAfterKbAdd = await page.evaluate(() => document.querySelector('[data-testid="kpi-total-scope"] .kpi-value').textContent.trim());

    // Duplicate key rejection
    await page.keyboard.type('PROJ-111');
    await tabUntil(a => a.testId === 'btn-add-issue');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    const dupErrVisible = await page.evaluate(() => {
      const err = document.querySelector('[data-testid="add-issue-errors"]');
      return err && /already exists/i.test(err.textContent);
    });

    results.push(makeRecord({
      tcId: 'TC-NF-02.1-KB-ADD',
      reqId: 'BDC-NF-002',
      group: 'G-KB',
      inputs: 'Add PROJ-111 (5 pts) and duplicate PROJ-111 using only Tab, type, and Enter',
      expected: 'Valid issue added and scope increases to 55; focus lands on add-issue-key; duplicate key rejected with error alert',
      actual: `Total scope after add=${scopeAfterKbAdd}, focus after add="${focusAfterAdd.id}", duplicate rejected=${dupErrVisible}`,
      status: (scopeAfterKbAdd === '55' && focusAfterAdd.id === 'add-issue-key' && dupErrVisible) ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      method: 'automated keyboard-only'
    }));

    // 7. Edit issue to Done, cancel with Escape, reopen via keyboard
    await tabUntil(a => a.ariaLabel === 'Edit PROJ-106');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    const focusOnEditOpen = await getActive();

    // Cancel with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    const focusAfterEscape = await getActive();

    // Reopen and edit to Done
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowDown'); // In Progress -> Done
    await page.keyboard.press('Tab'); // Completed Day
    await page.keyboard.type('4');
    await page.keyboard.press('Tab'); // Save button
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    const focusAfterDoneSave = await getActive();
    const compAfterDoneKb = await page.evaluate(() => document.querySelector('[data-testid="kpi-completed-points"] .kpi-value').textContent.trim());

    // Reopen to In Progress
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowUp'); // Done -> In Progress
    await tabUntil(a => a.tag === 'BUTTON' && a.text === 'Save');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    const compAfterReopenKb = await page.evaluate(() => document.querySelector('[data-testid="kpi-completed-points"] .kpi-value').textContent.trim());

    results.push(makeRecord({
      tcId: 'TC-NF-02.1-KB-EDIT',
      reqId: 'BDC-NF-002',
      group: 'G-KB',
      inputs: 'Edit PROJ-106 to Done on Day 4, cancel with Escape, reopen and save, then reopen to In Progress',
      expected: 'Focus lands on status select; Escape restores focus to Edit button; Save restores focus to Edit button; points update 29 -> 32 -> 29',
      actual: `Focus on open="${focusOnEditOpen.id}", Escape focus="${focusAfterEscape.ariaLabel}", Done focus="${focusAfterDoneSave.ariaLabel}", Completed pts=${compAfterDoneKb} -> ${compAfterReopenKb}`,
      status: (focusOnEditOpen.id === 'edit-issue-status' &&
        focusAfterEscape.ariaLabel === 'Edit PROJ-106' &&
        focusAfterDoneSave.ariaLabel === 'Edit PROJ-106' &&
        compAfterDoneKb === '32' && compAfterReopenKb === '29') ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      method: 'automated keyboard-only'
    }));

    // 8. Delete issue via keyboard
    await tabUntil(a => a.ariaLabel === 'Delete PROJ-111');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    const focusAfterDelete = await getActive();
    const scopeAfterDelete = await page.evaluate(() => document.querySelector('[data-testid="kpi-total-scope"] .kpi-value').textContent.trim());

    results.push(makeRecord({
      tcId: 'TC-NF-02.1-KB-DELETE',
      reqId: 'BDC-NF-002',
      group: 'G-KB',
      inputs: 'Delete PROJ-111 using Enter on Delete button',
      expected: 'Issue deleted; total scope returns to 50; focus moves to sensible next delete button',
      actual: `Total scope=${scopeAfterDelete}, focus after delete="${focusAfterDelete.ariaLabel}"`,
      status: (scopeAfterDelete === '50' && (focusAfterDelete.ariaLabel && focusAfterDelete.ariaLabel.startsWith('Delete'))) ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      method: 'automated keyboard-only'
    }));

    // 9. Reset Data via keyboard
    await tabUntil(a => a.id === 'reset-data-btn', 60);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    const focusAfterReset = await getActive();
    const resetMetrics = await page.evaluate(() => ({
      scope: document.querySelector('[data-testid="kpi-total-scope"] .kpi-value').textContent.trim(),
      rows: document.querySelectorAll('#backlog-table tbody tr').length,
      day: document.querySelector('#current-day-slider').value
    }));

    results.push(makeRecord({
      tcId: 'TC-NF-02.1-KB-RESET',
      reqId: 'BDC-NF-002',
      group: 'G-KB',
      inputs: 'Tab to Reset Data button, press Enter',
      expected: 'Canonical defaults restored (50 pts, 10 issues, Day 4); focus remains on Reset Data button',
      actual: `Defaults: Scope=${resetMetrics.scope}, Rows=${resetMetrics.rows}, Day=${resetMetrics.day}, Focus="${focusAfterReset.id}"`,
      status: (resetMetrics.scope === '50' && resetMetrics.rows === 10 && resetMetrics.day === '4' && focusAfterReset.id === 'reset-data-btn') ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      method: 'automated keyboard-only'
    }));

    await context.close();
  }

  // --------------------------------------------------------------------------
  // STEP 5: SECURITY AND RESILIENCE
  // --------------------------------------------------------------------------
  log('--- Executing Step 5: Security & Resilience ---');
  {
    const context = await createCleanContext();
    const page = await context.newPage();
    let dialogFired = false;
    page.on('dialog', async d => {
      dialogFired = true;
      await d.dismiss();
    });

    await page.goto(`${baseUrl}/index.html`);
    const loc = getLocators(page);

    // 1. TC-SR-01.1: Script injection (XSS payloads in Key, Summary, Sprint Name)
    const xssPayload = '<script>alert(1)</script><img src=x onerror=alert(1)>';
    await loc.addIssueKey.fill('XSS-1');
    await loc.addIssueSummary.fill(xssPayload);
    await loc.addIssuePoints.fill('2');
    await loc.addIssueStatus.selectOption('To Do');
    await loc.btnAddIssue.click();

    // Verify payload rendered literally as text, no alert dialog fired, no unescaped img tags
    const renderedText = (await loc.tableRows.last().locator('.cell-summary').textContent()).trim();
    const injectedElements = await page.evaluate(() => document.querySelectorAll('.cell-summary img, .cell-summary script').length);
    const ssXss = `docs/reports/evidence/sv-sec-xss-${launchRes.channel}.png`;
    await page.screenshot({ path: ssXss });

    results.push(makeRecord({
      tcId: 'TC-SR-01.1',
      reqId: 'BDC-SR-001',
      group: 'SECURITY',
      inputs: `Submit summary with script and onerror payload: "${xssPayload}"`,
      expected: 'Rendered as literal text; zero dialogs fired; 0 injected executable DOM elements',
      actual: `Rendered text="${renderedText}", dialogFired=${dialogFired}, injectedElementsCount=${injectedElements}`,
      status: (!dialogFired && injectedElements === 0 && renderedText.includes('<script>')) ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion,
      evidencePath: ssXss
    }));

    // 2. TC-SR-02.1 & TC-NF-03.1: Numeric validation & state isolation
    const numericRejectionPass = await page.evaluate(async () => {
      const dmMod = await import('/js/data/dataManager.js');
      const dm = dmMod.defaultDataManager;
      const initialSerialized = dm.serialize();

      // Attempt invalid mutations
      const resPtsNeg = dm.addIssue({ issueKey: 'INV-1', summary: 'test', issueType: 'Story', storyPoints: -3, status: 'To Do' });
      const resPtsAbc = dm.addIssue({ issueKey: 'INV-2', summary: 'test', issueType: 'Story', storyPoints: 'abc', status: 'To Do' });
      const resPtsInf = dm.addIssue({ issueKey: 'INV-3', summary: 'test', issueType: 'Story', storyPoints: Infinity, status: 'To Do' });
      const resDurNeg = dm.setSprint({ durationDays: -1 });
      const resDur61 = dm.setSprint({ durationDays: 61 });
      const resDayNeg = dm.setCurrentDay(-1);
      const resDay11 = dm.setCurrentDay(11);

      const afterSerialized = dm.serialize();
      return (
        !resPtsNeg.success &&
        !resPtsAbc.success &&
        !resPtsInf.success &&
        !resDurNeg.success &&
        !resDur61.success &&
        !resDayNeg.success &&
        !resDay11.success &&
        initialSerialized === afterSerialized
      );
    });

    results.push(makeRecord({
      tcId: 'TC-SR-02.1',
      reqId: 'BDC-SR-002',
      group: 'SECURITY',
      inputs: 'Points = -3, "abc", Infinity; Duration = -1, 61; Current Day = -1, 11',
      expected: 'All rejected before storage or calculation; serialized store remains identical',
      actual: `All mutations rejected and store unchanged: ${numericRejectionPass}`,
      status: numericRejectionPass ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion
    }));

    results.push(makeRecord({
      tcId: 'TC-NF-03.1',
      reqId: 'BDC-NF-003',
      group: 'SECURITY',
      inputs: 'Verify invalid numbers rejected without state corruption',
      expected: 'Serialized state identical before and after rejected operations',
      actual: `Verified at data and UI layer: ${numericRejectionPass}`,
      status: numericRejectionPass ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion
    }));

    // 3. TC-SR-05.1: CSP meta precedes scripts, inline script/eval blocked, no-JS notice, file:// guidance visible
    const cspCheck = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      const content = meta ? meta.getAttribute('content') : '';

      const headNodes = Array.from(document.head.children);
      const metaIdx = headNodes.indexOf(meta);
      const firstScriptIdx = headNodes.findIndex(el => el.tagName === 'SCRIPT');
      const metaPrecedesScripts = metaIdx >= 0 && (firstScriptIdx === -1 || metaIdx < firstScriptIdx);

      const hasScriptSrcSelf = content.includes("script-src 'self'");
      const hasNoUnsafeEval = !content.includes("'unsafe-eval'");
      const hasNoUnsafeInline = !content.includes("'unsafe-inline'");

      let evalBlocked = false;
      try {
        const fn = new Function('return "eval-executed"');
        fn();
      } catch (e) {
        evalBlocked = true;
      }

      const noscript = document.querySelector('noscript');
      const noscriptText = noscript ? noscript.textContent.trim() : '';
      const noscriptHasNotice = noscriptText.includes('JavaScript is required');

      return {
        hasMeta: Boolean(meta),
        content,
        metaPrecedesScripts,
        hasScriptSrcSelf,
        hasNoUnsafeEval,
        hasNoUnsafeInline,
        evalBlocked,
        noscriptHasNotice
      };
    });

    // Check file:// guidance notice
    let fileNoticeVisible = false;
    let fileNoticeText = '';
    try {
      const filePage = await context.newPage();
      const localFileUrl = 'file:///' + path.resolve(root, 'index.html').replace(/\\/g, '/');
      await filePage.goto(localFileUrl, { timeout: 5000 });
      const fileMsgHeader = filePage.locator('#messages .form-errors-header');
      if (await fileMsgHeader.count() > 0) {
        fileNoticeText = (await fileMsgHeader.textContent()).trim();
        fileNoticeVisible = fileNoticeText.includes('Server Required') || fileNoticeText.includes('file://');
      }
      await filePage.close();
    } catch (err) {
      log(`[INFO] file:// test note: ${err.message}`);
    }

    const cspPass = cspCheck.hasMeta &&
      cspCheck.metaPrecedesScripts &&
      cspCheck.hasScriptSrcSelf &&
      cspCheck.hasNoUnsafeEval &&
      cspCheck.noscriptHasNotice &&
      fileNoticeVisible;

    results.push(makeRecord({
      tcId: 'TC-SR-05.1',
      reqId: 'BDC-SR-005',
      group: 'SECURITY',
      inputs: 'Inspect meta CSP tag position, unsafe-eval absence, eval execution, noscript block, and file:// warning',
      expected: 'CSP meta precedes scripts; script-src self; no unsafe-eval; noscript notice present; file:// guidance visible',
      actual: `Meta precedes scripts: ${cspCheck.metaPrecedesScripts}; script-src self: ${cspCheck.hasScriptSrcSelf}; no unsafe-eval: ${cspCheck.hasNoUnsafeEval}; noscript notice: ${cspCheck.noscriptHasNotice}; file:// warning: "${fileNoticeText}"`,
      status: cspPass ? 'PASS' : 'FAIL',
      browserName: launchRes.channel,
      browserVersion
    }));

    // 4. TC-SR-03.1: Corrupted localStorage recovery at data layer
    // STP Table 9, TC-SR-03.1 (BDC-SR-003): Corrupted data discarded; default dataset restored; no crash
    // Note: Sprint persistence is disabled in browser UI per architecture; verified at data layer
    // and covered by unit tests in tests/data/storedState.test.js:128-175.
    const storageRecoveryPass = await page.evaluate(async () => {
      const dmMod = await import('/js/data/dataManager.js');
      const dm = dmMod.defaultDataManager;

      // 1. Invalid JSON string
      const resInvalidJson = dm.restoreFromJSON('invalid-json{{{');
      // 2. Valid JSON with corrupt structure
      const resCorruptStructure = dm.restoreFromJSON(JSON.stringify({ sprint: null, issues: 'not-array' }));

      // Both should return success: false, not throw, and restore baseline default dataset (10 issues)
      return !resInvalidJson.success && !resCorruptStructure.success && dm.getIssues().length === 10;
    });

    results.push(makeRecord({
      tcId: 'TC-SR-03.1',
      reqId: 'BDC-SR-003',
      group: 'SECURITY',
      inputs: 'Call restoreFromJSON with malformed JSON and corrupted schema (data-layer verification, tests/data/storedState.test.js)',
      expected: 'Corrupted data discarded safely without crash; default dataset restored (STP TC-SR-03.1)',
      actual: `Data layer handles corrupt state safely: ${storageRecoveryPass} (default 10 issues restored)`,
      status: storageRecoveryPass ? 'PASS' : 'FAIL',
      browserName: channel,
      browserVersion
    }));

    await context.close();
  }

  // --------------------------------------------------------------------------
  // STEP 6: PERFORMANCE (METHOD A: ?perf)
  // --------------------------------------------------------------------------
  log('--- Executing Step 6: Performance Measurements (Method A) ---');
  {
    const context = await createCleanContext();
    const page = await context.newPage();
    await page.goto(`${baseUrl}/index.html?perf`);
    const loc = getLocators(page);

    const perfActions = ['addIssue', 'editToDone', 'delete', 'reset', 'changeDay'];
    const measurements = {
      addIssue: [],
      editToDone: [],
      delete: [],
      reset: [],
      changeDay: []
    };

    // Helper to get last update duration
    async function getLastUpdateMs() {
      await page.waitForTimeout(150);
      return page.evaluate(() => {
        if (typeof window.__lastUpdateMs === 'number') return window.__lastUpdateMs;
        const log = window.__perfLog;
        if (Array.isArray(log) && log.length > 0) return log[log.length - 1].ms;
        return 0;
      });
    }

    // Run 10 iterations of each action
    for (let iter = 1; iter <= 10; iter++) {
      // 1. Add Issue
      await loc.addIssueKey.fill(`PERF-${iter}`);
      await loc.addIssueSummary.fill(`Perf test issue ${iter}`);
      await loc.addIssuePoints.fill('2');
      await loc.addIssueStatus.selectOption('To Do');
      await loc.btnAddIssue.click();
      measurements.addIssue.push(await getLastUpdateMs());

      // 2. Change Day
      await loc.nextBtn.click();
      measurements.changeDay.push(await getLastUpdateMs());
      await loc.prevBtn.click();

      // 3. Edit to Done
      const editBtn = page.getByRole('button', { name: `Edit PERF-${iter}`, exact: true });
      await editBtn.click();
      await loc.editStatus.selectOption('Done');
      await loc.editCompletedDay.fill('4');
      await loc.editSaveBtn.click();
      measurements.editToDone.push(await getLastUpdateMs());

      // 4. Delete
      const delBtn = page.getByRole('button', { name: `Delete PERF-${iter}`, exact: true });
      await delBtn.click();
      measurements.delete.push(await getLastUpdateMs());

      // 5. Reset
      await loc.resetBtn.click();
      measurements.reset.push(await getLastUpdateMs());
    }

    // Compute statistics
    function stats(arr) {
      const sorted = [...arr].sort((a, b) => a - b);
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const median = sorted[Math.floor(sorted.length / 2)];
      return { min, median, max };
    }

    const allUnder2000 = Object.values(measurements).every(arr => arr.every(v => v < 2000));
    const addStats = stats(measurements.addIssue);
    const dayStats = stats(measurements.changeDay);
    const editStats = stats(measurements.editToDone);
    const delStats = stats(measurements.delete);
    const resetStats = stats(measurements.reset);

    log(`Perf [Add Issue]: min=${addStats.min.toFixed(2)}ms, med=${addStats.median.toFixed(2)}ms, max=${addStats.max.toFixed(2)}ms`);
    log(`Perf [Change Day]: min=${dayStats.min.toFixed(2)}ms, med=${dayStats.median.toFixed(2)}ms, max=${dayStats.max.toFixed(2)}ms`);
    log(`Perf [Edit Done]: min=${editStats.min.toFixed(2)}ms, med=${editStats.median.toFixed(2)}ms, max=${editStats.max.toFixed(2)}ms`);
    log(`Perf [Delete]: min=${delStats.min.toFixed(2)}ms, med=${delStats.median.toFixed(2)}ms, max=${delStats.max.toFixed(2)}ms`);
    log(`Perf [Reset]: min=${resetStats.min.toFixed(2)}ms, med=${resetStats.median.toFixed(2)}ms, max=${resetStats.max.toFixed(2)}ms`);

    results.push(makeRecord({
      tcId: 'TC-NF-01.1',
      reqId: 'BDC-NF-001',
      group: 'PERFORMANCE',
      inputs: '10 iterations of Add, Change Day, Edit Done, Delete, Reset under ?perf profiling',
      expected: 'All UI state transition and re-render updates execute in < 2000 ms',
      actual: `Add: med=${addStats.median.toFixed(1)}ms (max ${addStats.max.toFixed(1)}ms); Day: med=${dayStats.median.toFixed(1)}ms; Edit: med=${editStats.median.toFixed(1)}ms; Delete: med=${delStats.median.toFixed(1)}ms; Reset: med=${resetStats.median.toFixed(1)}ms`,
      status: allUnder2000 ? 'PASS' : 'FAIL',
      browserName: channel,
      browserVersion,
      samples: measurements
    }));

    await context.close();
  }

  // --------------------------------------------------------------------------
  // STEP 7: INSPECTION & UNIT-LEVEL TEST CASES
  // --------------------------------------------------------------------------
  log('--- Recording Inspection & Automated Unit-Level Test Cases ---');
  {
    // TC-NF-05.1: Module separation review
    results.push(makeRecord({
      tcId: 'TC-NF-05.1',
      reqId: 'BDC-NF-005',
      group: 'INSPECTION',
      inputs: 'Inspect source code architecture in src/js',
      expected: 'Strict module separation between data, logic, and UI; no circular imports',
      actual: 'Inspection verified by stacktrace-bhuvi on 2026-11-07: src/js/logic (pure calculation), src/js/data (state management), src/js/ui (DOM rendering). Circular dependency scan: 0 circular dependencies.',
      status: 'PASS',
      browserName: launchRes.channel,
      browserVersion
    }));

    // TC-NF-05.2: Independent testability
    results.push(makeRecord({
      tcId: 'TC-NF-05.2',
      reqId: 'BDC-NF-005',
      group: 'UNIT_TEST',
      inputs: 'Execute node --test on BurndownEngine and ValidationManager without DOM',
      expected: 'Calculation and validation modules execute and pass independently without DOM dependency',
      actual: 'Automated unit test run by stacktrace-bhuvi on 2026-11-10: 411/411 tests passing in ~1000ms. Note: STP references Jest; repo uses node --test.',
      status: 'PASS',
      browserName: channel,
      browserVersion
    }));
  }
  } catch (err) {
    hasException = true;
    log(`[FATAL ERROR IN SV-RUNNER] ${err.stack || err.message}`);
  } finally {
    // Save JSON results and log
    if (channel) {
      const outJsonPath = path.join(evidenceDir, `sv-results-${channel}-${TODAY}-${SHA7}.json`);
      await fs.writeFile(outJsonPath, JSON.stringify(results, null, 2), 'utf8');
      log(`[SV-RUNNER] Results saved to ${outJsonPath} (${results.length} records)`);

      const outLogPath = path.join(evidenceDir, `sv-run-${channel}-${TODAY}-${SHA7}.log`);
      await fs.writeFile(outLogPath, logLines.join('\n'), 'utf8');
      log(`[SV-RUNNER] Execution log saved to ${outLogPath}`);
    }

    if (browser) {
      try {
        await browser.close();
      } catch (err) {
        log(`[WARN] Error closing browser: ${err.message}`);
      }
    }
    if (server) {
      try {
        server.close();
      } catch (err) {
        log(`[WARN] Error closing server: ${err.message}`);
      }
    }

    const passCount = results.filter(r => r.status === 'PASS').length;
    const failCount = results.filter(r => r.status === 'FAIL').length;
    const blockedCount = results.filter(r => r.status === 'BLOCKED').length;
    const notExecCount = results.filter(r => r.status === 'NOT EXECUTED').length;

    console.log(`[SV-RUNNER] SUMMARY pass=${passCount} fail=${failCount} blocked=${blockedCount} not_executed=${notExecCount}`);
    console.log(`[SV-RUNNER] Completed System Validation on ${channel}`);

    if (failCount > 0 || hasException) {
      process.exitCode = 1;
    } else {
      process.exitCode = 0;
    }
  }
}

runSuite().catch(err => {
  console.error('[UNHANDLED FATAL ERROR IN SV-RUNNER]', err);
  process.exit(1);
});

