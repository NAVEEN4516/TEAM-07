import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Architecture and dependency-safety checks (BDC-NF-005, BDC-SR-005; TC-NF-05.1, TC-SR-05.1).
 *
 * TC-NF-05.1 is an inspection case: presentation, data and calculation logic must sit in
 * separate modules with no circular dependencies. This turns that inspection into a
 * repeatable check over the real import graph, so a later change that breaks the layering
 * fails here instead of waiting for the next manual review.
 *
 * SAD layering: BurndownEngine and ValidationManager (src/js/logic) are pure; DataManager
 * and the default dataset (src/js/data) hold state; src/js/ui owns the DOM.
 */

const SRC = fileURLToPath(new URL('../../src/', import.meta.url));
const JS = path.join(SRC, 'js');

/** Layers a module may import from. A layer can never depend on one above it. */
const ALLOWED_IMPORTS = {
  logic: ['logic'],
  data: ['data', 'logic'],
  ui: ['ui', 'data', 'logic']
};

/** Lists every application module as a path relative to src/js, using forward slashes. */
function listModules(dir = JS) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listModules(full);
    }
    return entry.name.endsWith('.js') ? [path.relative(JS, full).split(path.sep).join('/')] : [];
  }).sort();
}

/**
 * Removes comments, and optionally the text inside string literals, keeping line breaks.
 * Quote strings end at a line break so a quote inside a regular expression cannot swallow later lines.
 */
function strip(source, { blankStrings }) {
  let out = '';
  let state = 'code';
  let quote = '';
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];
    if (ch === '\n') {
      out += ch;
      if (state === 'line-comment' || (state === 'string' && quote !== '`')) {
        state = 'code';
      }
    } else if (state === 'block-comment') {
      out += ' ';
      if (ch === '*' && next === '/') {
        out += ' ';
        i += 1;
        state = 'code';
      }
    } else if (state === 'line-comment') {
      out += ' ';
    } else if (state === 'string') {
      if (ch === '\\') {
        out += blankStrings ? '  ' : ch + (next ?? '');
        i += 1;
      } else if (ch === quote) {
        out += ch;
        state = 'code';
      } else {
        out += blankStrings ? ' ' : ch;
      }
    } else if (ch === '/' && next === '*') {
      out += '  ';
      i += 1;
      state = 'block-comment';
    } else if (ch === '/' && next === '/') {
      out += '  ';
      i += 1;
      state = 'line-comment';
    } else {
      out += ch;
      if (ch === '"' || ch === "'" || ch === '`') {
        state = 'string';
        quote = ch;
      }
    }
  }
  return out;
}

/** Returns the module specifiers a file imports or re-exports. */
function importsOf(source) {
  const code = strip(source, { blankStrings: false });
  const specifiers = [];
  const patterns = [
    /\bimport\s+(?:[^'";]*?\sfrom\s+)?['"]([^'"]+)['"]/g,
    /\bexport\s+(?:\*|\{[^}]*\})\s*(?:as\s+\w+\s*)?from\s+['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  ];
  for (const pattern of patterns) {
    for (const match of code.matchAll(pattern)) {
      specifiers.push(match[1]);
    }
  }
  return specifiers;
}

const modules = listModules();
const sources = new Map(modules.map(file => [file, readFileSync(path.join(JS, file), 'utf8')]));
const layerOf = file => file.split('/')[0];

/** Resolves a relative specifier from a module to another module path, or null when it points elsewhere. */
function resolveImport(from, specifier) {
  const target = path.posix.normalize(path.posix.join(path.posix.dirname(from), specifier));
  return modules.includes(target) ? target : null;
}

describe('Module architecture (BDC-NF-005, TC-NF-05.1)', () => {
  test('the three layers exist, so the rules below are not vacuous', () => {
    for (const layer of Object.keys(ALLOWED_IMPORTS)) {
      assert.ok(modules.some(file => layerOf(file) === layer), `src/js/${layer} must contain at least one module`);
    }
    assert.deepEqual([...new Set(modules.map(layerOf))].sort(), Object.keys(ALLOWED_IMPORTS).sort(), 'no unexpected layer');
  });

  test('every import is a relative path to a real .js module, as native browser modules require', () => {
    for (const [file, source] of sources) {
      for (const specifier of importsOf(source)) {
        assert.match(specifier, /^\.\.?\//, `${file}: "${specifier}" must be a relative path`);
        assert.ok(specifier.endsWith('.js'), `${file}: "${specifier}" needs its .js extension to load in a browser`);
        assert.ok(resolveImport(file, specifier), `${file}: "${specifier}" does not resolve to an application module`);
      }
    }
  });

  test('the import graph has no circular dependencies', () => {
    const graph = new Map([...sources].map(([file, source]) => [file, importsOf(source).map(spec => resolveImport(file, spec))]));
    const state = new Map();
    const trail = [];

    function visit(file) {
      if (state.get(file) === 'done') {
        return null;
      }
      if (state.get(file) === 'visiting') {
        return [...trail.slice(trail.indexOf(file)), file];
      }
      state.set(file, 'visiting');
      trail.push(file);
      for (const dependency of graph.get(file)) {
        const cycle = visit(dependency);
        if (cycle) {
          return cycle;
        }
      }
      trail.pop();
      state.set(file, 'done');
      return null;
    }

    for (const file of graph.keys()) {
      const cycle = visit(file);
      assert.equal(cycle, null, `circular dependency: ${cycle?.join(' -> ')}`);
    }
  });

  test('layers depend only downwards: logic on logic, data on data and logic, ui on any', () => {
    for (const [file, source] of sources) {
      const allowed = ALLOWED_IMPORTS[layerOf(file)];
      for (const specifier of importsOf(source)) {
        const target = resolveImport(file, specifier);
        assert.ok(
          allowed.includes(layerOf(target)),
          `${file} (${layerOf(file)}) must not import ${target} (${layerOf(target)})`
        );
      }
    }
  });

  test('calculation and data modules never touch the DOM or browser storage', () => {
    const banned = /\b(document|window|navigator|localStorage|sessionStorage|indexedDB|HTMLElement|Element)\b/;
    for (const [file, source] of sources) {
      if (layerOf(file) === 'ui') {
        continue;
      }
      const code = strip(source, { blankStrings: true });
      assert.doesNotMatch(code, banned, `${file} must stay free of DOM and storage access`);
    }
  });

  test('the calculation layer imports nothing outside itself, so it runs headless', () => {
    for (const [file, source] of sources) {
      if (layerOf(file) !== 'logic') {
        continue;
      }
      for (const specifier of importsOf(source)) {
        assert.equal(layerOf(resolveImport(file, specifier)), 'logic', `${file} imports ${specifier}`);
      }
    }
  });
});

describe('Dependency safety (BDC-SR-005, TC-SR-05.1)', () => {
  test('no module uses eval, the Function constructor, string timers or document.write', () => {
    const forbidden = [
      [/\beval\s*\(/, 'eval()'],
      [/\bnew\s+Function\s*\(/, 'new Function()'],
      [/(?<![.\w])Function\s*\(/, 'Function()'],
      [/\bset(?:Timeout|Interval)\s*\(\s*(?:'|"|`)/, 'a string passed to setTimeout/setInterval'],
      [/\bdocument\s*\.\s*write(?:ln)?\s*\(/, 'document.write()']
    ];
    for (const [file, source] of sources) {
      const code = strip(source, { blankStrings: true });
      for (const [pattern, name] of forbidden) {
        assert.doesNotMatch(code, pattern, `${file} must not use ${name}`);
      }
    }
  });

  test('index.html loads only local scripts and stylesheets', () => {
    const html = readFileSync(path.join(SRC, 'index.html'), 'utf8');
    const references = [
      ...[...html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)].map(match => ['script', match[1]]),
      ...[...html.matchAll(/<link\b[^>]*\bhref\s*=\s*["']([^"']+)["']/gi)].map(match => ['link', match[1]])
    ];

    assert.ok(references.some(([kind]) => kind === 'script'), 'the page must load its scripts');
    for (const [kind, reference] of references) {
      assert.doesNotMatch(reference, /^(?:[a-z][a-z0-9+.-]*:)?\/\//i, `${kind} "${reference}" must not point at another origin`);
      assert.ok(existsSync(path.join(SRC, reference)), `${kind} "${reference}" must exist under src/`);
    }
  });

  test('the only third-party script is the vendored charting library', () => {
    const html = readFileSync(path.join(SRC, 'index.html'), 'utf8');
    const scripts = [...html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)].map(match => match[1]);
    const thirdParty = scripts.filter(src => !src.startsWith('js/'));

    assert.deepEqual(thirdParty, ['vendor/chart.umd.js']);
  });
});
