// Optional browser regression checks. Requires Playwright in NODE_PATH or locally.
// Keeps npm test dependency-free. Run: node tools/verify-sprint2.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '../src');
const evidence = path.resolve(__dirname, '../docs/test-plan/evidence');
const mime = { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css' };

(async () => {
  const server = http.createServer(async (req, res) => {
    const file = path.resolve(root, '.' + (req.url === '/' ? '/index.html' : req.url.split('?')[0]));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try {
      const data = await fs.readFile(file);
      res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
      res.end(data);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'chrome' });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.addInitScript(() => {
      window.cspViolations = [];
      document.addEventListener('securitypolicyviolation', event => window.cspViolations.push(event.effectiveDirective));
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = `http://127.0.0.1:${server.address().port}/`;
    const kpi = id => page.locator(`[data-testid="kpi-${id}"] .kpi-value`);
    const text = async (locator, expected) => assert.equal((await locator.textContent()).trim(), expected);
    await page.goto(url);
    await page.getByRole('button', { name: 'Edit PROJ-106', exact: true }).waitFor();
    assert.equal(await page.locator('#backlog-table tbody tr').count(), 10);

    for (const width of [1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `Page overflow at ${width}px`);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await text(kpi('total-scope'), '50');
    await text(kpi('remaining-points'), '21');
    assert.equal(await page.evaluate(async () => (await import('/js/ui/chart.js')).getChartInstance().data.datasets.length), 2);

    // Keyboard skip link, repeated timeline keypresses and boundary focus.
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Skip to dashboard');
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'main-content');
    await page.locator('#current-day-slider').focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#current-day-slider').inputValue(), '6');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'current-day-slider');
    await page.getByRole('button', { name: 'Reset Data', exact: true }).click();

    await page.getByRole('button', { name: 'Edit PROJ-106', exact: true }).click();
    assert.equal(await page.evaluate(() => document.activeElement.id), 'edit-issue-status');
    await page.locator('#issue-editor').getByLabel('Status', { exact: true }).selectOption('Done');
    await page.getByRole('button', { name: 'Save issue', exact: true }).click();
    assert.match(await page.locator('#issue-edit-errors').textContent(), /1 to 10/);
    await text(kpi('remaining-points'), '21');
    await page.locator('#issue-editor').getByLabel('Completion day', { exact: false }).fill('11');
    await page.getByRole('button', { name: 'Save issue', exact: true }).click();
    await text(kpi('remaining-points'), '21');
    await page.locator('#issue-editor').getByLabel('Completion day', { exact: false }).fill('4');
    await page.getByRole('button', { name: 'Save issue', exact: true }).click();
    await text(kpi('remaining-points'), '18');
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), 'Edit PROJ-106');
    assert.equal(await page.evaluate(async () => (await import('/js/ui/chart.js')).getChartInstance().data.datasets[1].data[4]), 18);

    await page.getByRole('button', { name: 'Edit PROJ-106', exact: true }).click();
    await page.locator('#issue-editor').getByLabel('Status', { exact: true }).selectOption('In Progress');
    assert.equal(await page.locator('#edit-completed-day').isDisabled(), true);
    await page.getByRole('button', { name: 'Save issue', exact: true }).click();
    await text(kpi('remaining-points'), '21');
    await page.getByRole('button', { name: 'Edit PROJ-106', exact: true }).click();
    await page.locator('#issue-editor').getByLabel('Status', { exact: true }).selectOption('Done');
    assert.equal(await page.locator('#edit-completed-day').inputValue(), '');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#issue-editor').isHidden(), true);

    await page.getByRole('button', { name: 'Delete PROJ-101', exact: true }).click();
    await text(kpi('total-scope'), '45');
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), 'Delete PROJ-102');
    for (let number = 102; number <= 110; number++) {
      await page.getByRole('button', { name: `Delete PROJ-${number}`, exact: true }).click();
    }
    await text(kpi('total-scope'), '0');
    await text(kpi('remaining-points'), '0');
    assert.match(await page.locator('#backlog-empty-state').textContent(), /empty/);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'reset-data-btn');
    await page.getByRole('button', { name: 'Reset Data', exact: true }).click();
    await text(kpi('total-scope'), '50');
    assert.equal(await page.locator('#backlog-table tbody tr').count(), 10);

    // When run against the temporary merge with PR #38, exercise the complete
    // teammate Add Issue -> our Edit -> Delete -> Reset flow through the UI.
    if (await page.locator('#add-issue-key').count()) {
      await page.locator('#add-issue-key').fill('PROJ-999');
      await page.locator('#add-issue-summary').fill('<img src=x onerror="window.xss=9">');
      await page.locator('#add-issue-points').fill('3');
      await page.getByRole('button', { name: 'Add Issue', exact: true }).click();
      await text(kpi('total-scope'), '53');
      assert.equal(await page.locator('#backlog-table img').count(), 0);
      await page.getByRole('button', { name: 'Edit PROJ-999', exact: true }).click();
      await page.locator('#edit-issue-status').selectOption('Done');
      await page.locator('#edit-completed-day').fill('4');
      await page.getByRole('button', { name: 'Save issue', exact: true }).click();
      await text(kpi('completed-points'), '32');
      await page.getByRole('button', { name: 'Delete PROJ-999', exact: true }).click();
      await text(kpi('total-scope'), '50');
      await page.getByRole('button', { name: 'Reset Data', exact: true }).click();
    }

    // Hostile fixture strings must be rendered as text in the actual DOM.
    await page.evaluate(async () => {
      const dm = (await import('/js/data/dataManager.js')).defaultDataManager;
      const sprint = dm.getSprint();
      sprint.sprintName = '<img src=x onerror="window.xss=1">';
      const issues = dm.getIssues();
      issues[0].issueKey = '<script>window.xss=2</script>';
      issues[0].summary = '<img src=x onerror="window.xss=3">';
      dm.init({ sprint, issues });
    });
    assert.equal(await page.locator('#sprint-config img, #backlog-table img, #backlog-table script').count(), 0);
    assert.ok((await page.locator('#backlog-table').textContent()).includes('<script>window.xss=2</script>'));
    await page.getByRole('button', { name: 'Edit <script>window.xss=2</script>', exact: true }).click();
    assert.equal(await page.locator('#issue-editor script').count(), 0);
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    assert.equal(await page.evaluate(() => window.xss), undefined);
    await page.getByRole('button', { name: 'Reset Data', exact: true }).click();

    // Zero-point one-day fixture, real config validation and UI boundary navigation.
    await page.evaluate(async () => {
      const dm = (await import('/js/data/dataManager.js')).defaultDataManager;
      dm.init({ sprint: { ...dm.getSprint(), durationDays: 1, currentDay: 0 },
        issues: [{ ...dm.getIssues()[0], storyPoints: 0, status: 'To Do', completedDay: null }] });
    });
    assert.match(await page.locator('#backlog-empty-state').textContent(), /zero story points/);
    await page.getByRole('button', { name: 'Move to next day' }).click();
    assert.equal(await page.locator('#current-day-slider').inputValue(), '1');
    assert.equal(await page.getByRole('button', { name: 'Move to next day' }).isDisabled(), true);
    await page.getByRole('button', { name: 'Configure Sprint Parameters' }).click();
    await page.locator('#input-duration-days').fill('0');
    await page.getByRole('button', { name: 'Save Configuration' }).click();
    assert.match(await page.locator('[data-testid="config-errors"]').textContent(), /positive integer/);
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute('data-testid')), 'config-errors');
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.getByRole('button', { name: 'Reset Data', exact: true }).click();

    // No startup CSP violations. Deliberately injected inline script must be blocked.
    assert.deepEqual(await page.evaluate(() => window.cspViolations), []);
    await page.evaluate(() => {
      const script = document.createElement('script');
      script.textContent = 'window.inlineScriptRan = true';
      document.body.append(script);
    });
    await page.waitForFunction(() => window.cspViolations.length > 0);
    assert.equal(await page.evaluate(() => window.inlineScriptRan), undefined);
    assert.ok((await page.evaluate(() => window.cspViolations)).includes('script-src-elem'));

    await page.getByRole('button', { name: 'Edit PROJ-106', exact: true }).click();
    await fs.mkdir(evidence, { recursive: true });
    // Allow the canvas's normal Chart.js transition to settle for the evidence image.
    await page.waitForTimeout(1200);
    await page.locator('.table-wrapper').evaluate(node => { node.scrollLeft = 0; });
    await page.screenshot({ path: path.join(evidence, 'naveen-sprint2-workflow.png'), fullPage: true });
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();

    await context.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage unavailable'); } });
    });
    await page.reload();
    await page.getByRole('button', { name: 'Reset Data', exact: true }).click();
    await text(kpi('total-scope'), '50');
    assert.equal(await page.locator('#backlog-table tbody tr').count(), 10);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ browser: await browser.version(), result: 'PASS',
      checks: ['workflow and KPIs/chart', 'validation without mutation', 'keyboard focus', 'delete all and reset',
        'DOM XSS', 'single-day zero scope', 'CSP enforcement', 'unavailable storage'], pageErrors: errors }, null, 2));
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
