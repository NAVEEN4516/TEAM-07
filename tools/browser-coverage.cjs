#!/usr/bin/env node
'use strict';

/**
 * Browser execution coverage (development tooling, optional).
 *
 * Runs tools/verify-sprint2.cjs unchanged inside Chromium with V8 precise coverage
 * attached from outside, then reports which application lines, functions and branches
 * that real-browser run executed. It measures what the browser regression script
 * exercises, not every possible user action, and it is separate from the unit-test
 * figures: unit tests cannot run the DOM-event code that only a browser can.
 *
 * Playwright is not a repository dependency, so it must be reachable by Node:
 *   NODE_PATH=<folder holding node_modules/playwright> node tools/browser-coverage.cjs --json coverage/browser.json
 * Set BROWSER_CHANNEL (default "chrome") to use another installed Chromium, such as msedge.
 * Then merge it with the unit figures: node tools/coverage.mjs --from coverage/lcov.info --browser coverage/browser.json
 *
 * The helper normally overwrites a tracked screenshot under docs/test-plan/evidence;
 * this wrapper turns that screenshot call into a no-op so no repository file changes.
 *
 * Definitions match tools/coverage.mjs: a code line counts as executed when any code
 * character on it ran; branches are V8 block ranges (every range except the whole-script
 * one); functions are V8 function ranges (the module body is not counted).
 */

const fs = require('node:fs');
const path = require('node:path');
const { analyzeCode } = require('./lib/code-lines.cjs');

const ROOT = path.resolve(__dirname, '..');
const HELPER = 'tools/verify-sprint2.cjs';

/** Reads --json <file> from the command line. */
function outputPath() {
  const index = process.argv.indexOf('--json');
  return path.resolve(ROOT, index !== -1 ? process.argv[index + 1] : 'coverage/browser.json');
}

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Playwright was not found. Point NODE_PATH at a folder whose node_modules holds it, for example:\n'
    + '  NODE_PATH=/path/to/folder node tools/browser-coverage.cjs');
  process.exit(2);
}

const collected = [];
const browserInfo = { name: 'unknown' };

/** Starts coverage on every page the helper opens and collects it just before the browser closes. */
function instrument(browser) {
  const pages = [];
  const newContext = browser.newContext.bind(browser);
  browser.newContext = async (...args) => {
    const context = await newContext(...args);
    const newPage = context.newPage.bind(context);
    context.newPage = async (...pageArgs) => {
      const page = await newPage(...pageArgs);
      page.screenshot = async () => Buffer.alloc(0);
      try {
        await page.coverage.startJSCoverage({ resetOnNavigation: false });
        pages.push(page);
      } catch {
        // A page that cannot be profiled, such as one with JavaScript disabled, is simply not measured.
        return page;
      }

      // V8 cannot report coverage for a document that has been replaced, so take a snapshot
      // just before every navigation and start counting again for the next document.
      const snapshotThenRestart = async () => {
        try {
          collected.push(...await page.coverage.stopJSCoverage());
          await page.coverage.startJSCoverage({ resetOnNavigation: false });
        } catch {
          // The page is already gone; whatever it ran was collected earlier.
        }
      };
      for (const method of ['goto', 'reload']) {
        const navigate = page[method].bind(page);
        page[method] = async (...navigateArgs) => {
          await snapshotThenRestart();
          return navigate(...navigateArgs);
        };
      }
      return page;
    };
    return context;
  };

  const close = browser.close.bind(browser);
  browser.close = async (...args) => {
    browserInfo.name = `Chromium ${await browser.version()}`;
    for (const page of pages) {
      try {
        collected.push(...await page.coverage.stopJSCoverage());
      } catch {
        // The page was already closed by the helper, for example the JavaScript-disabled one.
      }
    }
    return close(...args);
  };
}

const launch = chromium.launch.bind(chromium);
chromium.launch = async (...args) => {
  const browser = await launch(...args);
  instrument(browser);
  return browser;
};

/** Paints V8 range counts onto each character; inner ranges override the ranges that contain them. */
function paint(source, functions) {
  const ranges = [];
  for (const fn of functions) {
    for (const range of fn.ranges) {
      ranges.push({ start: range.startOffset, end: range.endOffset, count: range.count, order: ranges.length });
    }
  }
  ranges.sort((a, b) => a.start - b.start || b.end - a.end || a.order - b.order);
  const counts = new Int32Array(source.length);
  for (const range of ranges) {
    counts.fill(range.count, range.start, Math.min(range.end, source.length));
  }
  return counts;
}

/** Converts a 1-based line number for an offset. */
function lineAt(source, offset) {
  let line = 1;
  for (let i = 0; i < offset && i < source.length; i += 1) {
    if (source[i] === '\n') {
      line += 1;
    }
  }
  return line;
}

/** Collapses sorted line numbers into "12-14 20 31-32" style ranges. */
function toRanges(numbers) {
  const ranges = [];
  for (const n of numbers) {
    const last = ranges[ranges.length - 1];
    if (last && n === last[1] + 1) {
      last[1] = n;
    } else {
      ranges.push([n, n]);
    }
  }
  return ranges.map(([a, b]) => (a === b ? `${a}` : `${a}-${b}`));
}

/** Builds a { hit, found, pct } figure. */
function figure(hit, found) {
  return { hit, found, pct: found === 0 ? 100 : Math.round((hit / found) * 10000) / 100 };
}

/** Merges every run of one script into per-character counts, function counts and block counts. */
function mergeScript(entries) {
  const source = entries[0].source;
  const counts = new Int32Array(source.length);
  const functions = new Map();
  const blocks = new Map();
  for (const entry of entries) {
    const entryCounts = paint(source, entry.functions);
    for (let i = 0; i < counts.length; i += 1) {
      counts[i] = Math.max(counts[i], entryCounts[i]);
    }
    for (const fn of entry.functions) {
      const [outer, ...inner] = fn.ranges;
      const isModuleBody = outer.startOffset === 0 && outer.endOffset >= source.length;
      if (!isModuleBody) {
        const key = `${outer.startOffset}-${outer.endOffset}`;
        const known = functions.get(key) ?? { name: fn.functionName || '(anonymous)', offset: outer.startOffset, count: 0 };
        known.count = Math.max(known.count, outer.count);
        functions.set(key, known);
      }
      for (const range of isModuleBody ? inner : fn.ranges) {
        const key = `${range.startOffset}-${range.endOffset}`;
        blocks.set(key, Math.max(blocks.get(key) ?? 0, range.count));
      }
    }
  }
  return { source, counts, functions: [...functions.values()], blocks: [...blocks.values()] };
}

/** Builds the report for every application script the browser loaded. */
function buildReport() {
  const byUrl = new Map();
  const vendor = new Set();
  for (const entry of collected) {
    const { pathname } = new URL(entry.url);
    if (pathname.startsWith('/js/')) {
      byUrl.set(pathname, [...(byUrl.get(pathname) ?? []), entry]);
    } else if (pathname.endsWith('.js')) {
      vendor.add(`src${pathname}`);
    }
  }

  const files = [...byUrl.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([pathname, entries]) => {
    const file = `src${pathname}`;
    const merged = mergeScript(entries);
    const onDisk = fs.readFileSync(path.join(ROOT, file), 'utf8');
    if (onDisk !== merged.source) {
      throw new Error(`${file} served to the browser differs from the file on disk; refusing to report misaligned lines`);
    }
    const { codeLines, codeOffsetsByLine } = analyzeCode(merged.source);
    const executed = [...codeLines].filter(line => codeOffsetsByLine.get(line).some(offset => merged.counts[offset] > 0));
    const notExecuted = [...codeLines].filter(line => !executed.includes(line)).sort((a, b) => a - b);
    return {
      file,
      scriptRuns: entries.length,
      codeLines: figure(executed.length, codeLines.size),
      functions: figure(merged.functions.filter(fn => fn.count > 0).length, merged.functions.length),
      branches: figure(merged.blocks.filter(count => count > 0).length, merged.blocks.length),
      uncoveredLines: toRanges(notExecuted),
      uncoveredFunctions: merged.functions.filter(fn => fn.count === 0).map(fn => ({ name: fn.name, line: lineAt(merged.source, fn.offset) })),
      executedLines: executed.sort((a, b) => a - b)
    };
  });

  return {
    browser: browserInfo.name,
    helper: HELPER,
    source: path.relative(ROOT, outputPath()).split(path.sep).join('/'),
    vendorExcluded: [...vendor].sort(),
    files
  };
}

/** Prints the report as readable text. */
function print(report) {
  const width = Math.max(...report.files.map(file => file.file.length), 10);
  const cell = metric => `${metric.hit}/${metric.found} ${metric.pct.toFixed(2)}%`.padStart(17);
  const header = `${'file'.padEnd(width)} | ${'code lines'.padStart(17)} | ${'branches'.padStart(17)} | ${'functions'.padStart(17)}`;
  console.log(`\nBrowser execution coverage of src/js while running ${report.helper} (${report.browser})\n`);
  console.log(header);
  console.log('-'.repeat(header.length));
  for (const file of report.files) {
    console.log(`${file.file.padEnd(width)} | ${cell(file.codeLines)} | ${cell(file.branches)} | ${cell(file.functions)}`);
  }
  console.log('-'.repeat(header.length));
  for (const [label, key] of [['codeLines', 'code lines'], ['branches', 'branches'], ['functions', 'functions']]) {
    const hit = report.files.reduce((sum, file) => sum + file[label].hit, 0);
    const found = report.files.reduce((sum, file) => sum + file[label].found, 0);
    console.log(`  ${key.padEnd(10)} ${cell(figure(hit, found))}`);
  }
  console.log(`\nNot measured (third-party): ${report.vendorExcluded.join(', ') || 'none'}`);
  for (const file of report.files) {
    if (file.uncoveredFunctions.length > 0) {
      console.log(`Never ran in the browser, ${file.file}: ${file.uncoveredFunctions.map(fn => `${fn.name} (line ${fn.line})`).join(', ')}`);
    }
  }
}

process.on('beforeExit', () => {
  if (process.__browserCoverageDone) {
    return;
  }
  process.__browserCoverageDone = true;
  if (process.exitCode) {
    console.error(`\n${HELPER} failed, so its coverage is not reported.`);
    return;
  }
  if (collected.length === 0) {
    console.error('\nNo coverage was collected; the browser did not run.');
    process.exitCode = 1;
    return;
  }
  const report = buildReport();
  print(report);
  fs.mkdirSync(path.dirname(outputPath()), { recursive: true });
  fs.writeFileSync(outputPath(), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`\nWrote ${report.source}`);
});

require('./verify-sprint2.cjs');
