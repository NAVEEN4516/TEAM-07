const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const mime = {
  '.js': 'text/javascript',
  '.html': 'text/html',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png'
};

function serveDir(dir) {
  return http.createServer((req, res) => {
    const urlPath = req.url.split('?')[0];
    const file = path.resolve(dir, '.' + (urlPath === '/' ? '/index.html' : urlPath));
    try {
      const data = fs.readFileSync(file);
      res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
      res.end(data);
    } catch {
      res.writeHead(404).end('Not Found');
    }
  });
}

async function measure(dir, label) {
  const server = serveDir(dir);
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const results = {};

  for (const day of [4, 6, 7]) {
    results[`day${day}`] = {};
    for (const theme of ['light', 'dark']) {
      await page.goto(`http://127.0.0.1:${port}/index.html?dev`, { waitUntil: 'networkidle' });
      await page.evaluate(({ d, t }) => {
        window.__setDay(d);
        document.documentElement.setAttribute('data-theme', t);
      }, { d: day, t: theme });
      await page.waitForTimeout(100);

      const badge = page.locator('[data-testid="status-badge"]');
      await badge.waitFor({ state: 'visible' });

      const ssPath = path.resolve('docs/reports/evidence', `sv-defect-sv-d-01-${label}-day${day}-${theme}.png`);
      await badge.screenshot({ path: ssPath });

      const computed = await badge.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          text: el.textContent.trim(),
          className: el.className,
          backgroundColor: style.backgroundColor,
          color: style.color,
          border: style.border,
          borderColor: style.borderColor,
          borderWidth: style.borderWidth,
          borderStyle: style.borderStyle
        };
      });
      results[`day${day}`][theme] = computed;
    }
  }

  await browser.close();
  server.close();
  return results;
}

(async () => {
  const beforeDir = path.resolve(process.env.TEMP, 'e901/src');
  const afterDir = path.resolve('src');

  console.log('Measuring before (e901ecf)...');
  const beforeRes = await measure(beforeDir, 'before');
  fs.writeFileSync('docs/reports/evidence/sv-defect-sv-d-01-before.json', JSON.stringify(beforeRes, null, 2), 'utf8');

  console.log('Measuring after (HEAD)...');
  const afterRes = await measure(afterDir, 'after');
  fs.writeFileSync('docs/reports/evidence/sv-defect-sv-d-01-after.json', JSON.stringify(afterRes, null, 2), 'utf8');

  console.log('DONE!');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
