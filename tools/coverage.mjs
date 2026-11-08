#!/usr/bin/env node
/**
 * Unit-test coverage for the application code under src/js (development tooling only).
 *
 * Runs the native test runner with its built-in V8 coverage, writes an lcov file,
 * then prints a per-file summary. Unlike the runner's own table, the summary also
 * lists application files that no unit test loads, because the runner silently
 * leaves those out of its totals. Works on Node 20 and later with no npm dependency.
 *
 *   npm run test:coverage                  run the whole suite, then summarize
 *   node tools/coverage.mjs --from <lcov>  summarize an existing lcov file
 *   --browser <json>                       also merge a browser run from tools/browser-coverage.cjs
 *   --json <file>                          also write the summary as JSON
 *   --details                              list every uncovered line range and branch
 *
 * Definitions, so the numbers are not over-read:
 *   Line coverage   Node counts every physical line, including comments and blank
 *                   lines. "Code-line" coverage drops comment-only and blank lines
 *                   from both sides and is the more conservative figure.
 *   Branch coverage Node reports V8 block ranges (function bodies, if/else arms,
 *                   short-circuit and ternary arms). V8 lists the inner blocks of a
 *                   function only after it has run once, so a function that never
 *                   ran adds one uncovered block, not its real branches. Read branch
 *                   figures together with the function and line figures. This is not
 *                   the same count as Istanbul's per-operand branches.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { analyzeCode } = createRequire(import.meta.url)('./lib/code-lines.cjs');

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const APP_DIR = 'src/js';
const LCOV_PATH = 'coverage/lcov.info';

/** Parses the command line into a small options object. */
function parseArgs(argv) {
  const options = { from: null, browser: null, json: null, details: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--from') {
      options.from = argv[++i];
    } else if (argv[i] === '--browser') {
      options.browser = argv[++i];
    } else if (argv[i] === '--json') {
      options.json = argv[++i];
    } else if (argv[i] === '--details') {
      options.details = true;
    } else {
      console.error(`Unknown option: ${argv[i]}`);
      process.exit(2);
    }
  }
  return options;
}

/** Converts a path from an lcov record to a repository-relative posix path. */
function toRelative(file) {
  return path.relative(ROOT, path.resolve(ROOT, file)).split(path.sep).join('/');
}

/** Lists every .js file under a directory as repository-relative posix paths. */
function listSourceFiles(dir) {
  const found = [];
  for (const entry of readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const relative = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      found.push(...listSourceFiles(relative));
    } else if (entry.name.endsWith('.js')) {
      found.push(relative);
    }
  }
  return found.sort();
}

/** Parses an lcov file into one record per source file. */
function parseLcov(text) {
  const records = [];
  let current = null;
  for (const line of text.split(/\r?\n/)) {
    const separator = line.indexOf(':');
    const key = separator === -1 ? line : line.slice(0, separator);
    const value = separator === -1 ? '' : line.slice(separator + 1);
    if (key === 'SF') {
      current = { file: toRelative(value), lines: new Map(), branches: [], functions: new Map() };
    } else if (!current) {
      continue;
    } else if (key === 'DA') {
      const [lineNumber, count] = value.split(',');
      current.lines.set(Number(lineNumber), Number(count));
    } else if (key === 'BRDA') {
      const [lineNumber, , , taken] = value.split(',');
      current.branches.push({ line: Number(lineNumber), count: taken === '-' ? 0 : Number(taken) });
    } else if (key === 'FN') {
      const [lineNumber, name] = value.split(',');
      current.functions.set(name, { line: Number(lineNumber), count: 0 });
    } else if (key === 'FNDA') {
      const [count, name] = value.split(',');
      if (current.functions.has(name)) {
        current.functions.get(name).count = Number(count);
      }
    } else if (key === 'end_of_record') {
      records.push(current);
      current = null;
    }
  }
  return records;
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

/** Counts physical lines the way wc -l and the lcov reporter do (a trailing newline adds none). */
function countLines(text) {
  const lines = text.split(/\r?\n/);
  return lines[lines.length - 1] === '' ? lines.length - 1 : lines.length;
}

/** Computes every metric for one lcov record. */
function measure(record) {
  const source = readFileSync(path.join(ROOT, record.file), 'utf8');
  const sourceLines = source.split(/\r?\n/);
  const { codeLines } = analyzeCode(source);

  const lineEntries = [...record.lines.entries()];
  const codeEntries = lineEntries.filter(([line]) => codeLines.has(line));
  const uncoveredCode = codeEntries.filter(([, count]) => count === 0).map(([line]) => line);
  const uncoveredBranches = record.branches
    .filter(branch => branch.count === 0)
    .map(branch => ({ line: branch.line, text: (sourceLines[branch.line - 1] ?? '').trim() }));

  return {
    file: record.file,
    lines: figure(lineEntries.filter(([, count]) => count > 0).length, lineEntries.length),
    codeLines: figure(codeEntries.filter(([, count]) => count > 0).length, codeEntries.length),
    branches: figure(record.branches.filter(branch => branch.count > 0).length, record.branches.length),
    functions: figure([...record.functions.values()].filter(fn => fn.count > 0).length, record.functions.size),
    uncoveredLines: toRanges(uncoveredCode),
    uncoveredBranches,
    uncoveredFunctions: [...record.functions.entries()]
      .filter(([, fn]) => fn.count === 0)
      .map(([name, fn]) => ({ name, line: fn.line })),
    executedCodeLines: codeEntries.filter(([, count]) => count > 0).map(([line]) => line)
  };
}

/** Sums metrics across files. Percentages come from the sums, not an average of percentages. */
function total(files, metric) {
  return figure(
    files.reduce((sum, file) => sum + file[metric].hit, 0),
    files.reduce((sum, file) => sum + file[metric].found, 0)
  );
}

/**
 * Merges unit and browser runs over every application file, using one definition of
 * "code line" for all of them, so files no unit test loads still have a real denominator.
 */
function combine(unitFiles, browser) {
  const unitByFile = new Map(unitFiles.map(file => [file.file, file]));
  const browserByFile = new Map(browser.files.map(file => [file.file, file]));
  const rows = listSourceFiles(APP_DIR).map(file => {
    const { codeLines } = analyzeCode(readFileSync(path.join(ROOT, file), 'utf8'));
    const unit = new Set(unitByFile.get(file)?.executedCodeLines ?? []);
    const inBrowser = new Set((browserByFile.get(file)?.executedLines ?? []).filter(line => codeLines.has(line)));
    const either = new Set([...unit, ...inBrowser]);
    return {
      file,
      codeLines: codeLines.size,
      unit: figure(unit.size, codeLines.size),
      browser: figure(inBrowser.size, codeLines.size),
      either: figure(either.size, codeLines.size),
      browserOnly: toRanges([...inBrowser].filter(line => !unit.has(line)).sort((a, b) => a - b)),
      neither: toRanges([...codeLines].filter(line => !either.has(line)).sort((a, b) => a - b))
    };
  });
  const sum = key => figure(rows.reduce((n, row) => n + row[key].hit, 0), rows.reduce((n, row) => n + row.codeLines, 0));
  return {
    browser: { name: browser.browser, helper: browser.helper, source: browser.source },
    files: rows,
    totals: { codeLines: rows.reduce((n, row) => n + row.codeLines, 0), unit: sum('unit'), browser: sum('browser'), either: sum('either') }
  };
}

/** Reads the lcov file and builds the whole summary. */
function summarize(lcovFile, browserFile) {
  const records = parseLcov(readFileSync(path.resolve(ROOT, lcovFile), 'utf8'));
  const appRecords = records.filter(record => record.file.startsWith(`${APP_DIR}/`));
  const files = appRecords.map(measure).sort((a, b) => a.file.localeCompare(b.file));
  const measured = new Set(files.map(file => file.file));
  const unmeasured = listSourceFiles(APP_DIR)
    .filter(file => !measured.has(file))
    .map(file => ({ file, physicalLines: countLines(readFileSync(path.join(ROOT, file), 'utf8')) }));

  const summary = {
    node: process.version,
    source: lcovFile,
    files,
    totals: {
      lines: total(files, 'lines'),
      codeLines: total(files, 'codeLines'),
      branches: total(files, 'branches'),
      functions: total(files, 'functions')
    },
    unmeasured,
    excludedFromTable: records.filter(record => !record.file.startsWith(`${APP_DIR}/`)).map(record => record.file)
  };
  if (browserFile) {
    const browser = JSON.parse(readFileSync(path.resolve(ROOT, browserFile), 'utf8'));
    summary.browser = browser;
    summary.combined = combine(files, browser);
  }
  return summary;
}

/** Formats "hit/found pct%" for a table cell. */
function cell(metric) {
  return `${metric.hit}/${metric.found} ${metric.pct.toFixed(2)}%`.padStart(17);
}

/** Prints the summary as readable text. */
function print(summary, details) {
  const width = Math.max(...summary.files.map(file => file.file.length), 10);
  const header = `${'file'.padEnd(width)} | ${'lines (all)'.padStart(17)} | ${'code lines'.padStart(17)} | ${'branches'.padStart(17)} | ${'functions'.padStart(17)}`;
  console.log(`\nUnit-test coverage of ${APP_DIR} (Node ${summary.node}, source ${summary.source})\n`);
  console.log(header);
  console.log('-'.repeat(header.length));
  for (const file of summary.files) {
    console.log(`${file.file.padEnd(width)} | ${cell(file.lines)} | ${cell(file.codeLines)} | ${cell(file.branches)} | ${cell(file.functions)}`);
  }
  console.log('-'.repeat(header.length));
  const t = summary.totals;
  console.log(`${'measured files'.padEnd(width)} | ${cell(t.lines)} | ${cell(t.codeLines)} | ${cell(t.branches)} | ${cell(t.functions)}`);

  const unmeasuredLines = summary.unmeasured.reduce((sum, file) => sum + file.physicalLines, 0);
  console.log(`\nNOT LOADED by any unit test (${summary.unmeasured.length} files, ${unmeasuredLines} physical lines, absent from the totals above):`);
  for (const file of summary.unmeasured) {
    console.log(`  ${file.file} (${file.physicalLines} lines)`);
  }
  if (summary.excludedFromTable.length > 0) {
    console.log(`\nLeft out of the table because they are not application code: ${summary.excludedFromTable.join(', ')}`);
  }

  if (summary.combined) {
    const c = summary.combined;
    const w = Math.max(...c.files.map(file => file.file.length), 10);
    const head = `${'file'.padEnd(w)} | ${'code lines'.padStart(10)} | ${'unit tests'.padStart(17)} | ${'browser run'.padStart(17)} | ${'either'.padStart(17)}`;
    console.log(`\nAll ${c.files.length} application files, code lines executed (browser: ${c.browser.name}, ${c.browser.helper})\n`);
    console.log(head);
    console.log('-'.repeat(head.length));
    for (const row of c.files) {
      console.log(`${row.file.padEnd(w)} | ${String(row.codeLines).padStart(10)} | ${cell(row.unit)} | ${cell(row.browser)} | ${cell(row.either)}`);
    }
    console.log('-'.repeat(head.length));
    console.log(`${'all application files'.padEnd(w)} | ${String(c.totals.codeLines).padStart(10)} | ${cell(c.totals.unit)} | ${cell(c.totals.browser)} | ${cell(c.totals.either)}`);
  }

  if (details) {
    console.log('\nUncovered code lines, functions and branches by unit tests (count 0):');
    for (const file of summary.files) {
      if (file.uncoveredLines.length + file.uncoveredBranches.length + file.uncoveredFunctions.length === 0) {
        continue;
      }
      console.log(`\n${file.file}`);
      if (file.uncoveredLines.length > 0) {
        console.log(`  lines:     ${file.uncoveredLines.join(' ')}`);
      }
      for (const fn of file.uncoveredFunctions) {
        console.log(`  function:  line ${fn.line} ${fn.name}`);
      }
      for (const branch of file.uncoveredBranches) {
        console.log(`  branch:    line ${branch.line}  ${branch.text.slice(0, 110)}`);
      }
    }
    if (summary.combined) {
      console.log('\nCode lines executed by neither the unit tests nor the browser run:');
      for (const row of summary.combined.files) {
        if (row.neither.length > 0) {
          console.log(`  ${row.file}: ${row.neither.join(' ')}`);
        }
      }
    }
  }
}

const options = parseArgs(process.argv.slice(2));
let lcovFile = options.from;

if (!lcovFile) {
  mkdirSync(path.join(ROOT, path.dirname(LCOV_PATH)), { recursive: true });
  const run = spawnSync(process.execPath, [
    '--test',
    '--experimental-test-coverage',
    '--test-reporter=spec',
    '--test-reporter-destination=stdout',
    '--test-reporter=lcov',
    `--test-reporter-destination=${LCOV_PATH}`
  ], { cwd: ROOT, stdio: 'inherit' });
  if (run.status !== 0) {
    console.error(`\nThe test run failed (exit ${run.status}); coverage of a failing run is not reported.`);
    process.exit(run.status ?? 1);
  }
  lcovFile = LCOV_PATH;
}

const summary = summarize(lcovFile, options.browser);
print(summary, options.details);
if (options.json) {
  writeFileSync(path.resolve(ROOT, options.json), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(`\nWrote ${options.json}`);
}
