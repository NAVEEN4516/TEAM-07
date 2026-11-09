'use strict';

/**
 * Finds the lines of a JavaScript source that hold code (development tooling only).
 *
 * Both coverage tools use this, so "a code line" means the same thing for the unit-test
 * figures and the browser figures. Comment-only and blank lines are not code. A small
 * lexer tracks block comments, line comments and string literals; it does not parse
 * JavaScript, so a regular expression containing a quote can be mistaken for a string.
 * Quote strings end at a line break, which keeps any such mistake on the one line.
 *
 * Offsets are UTF-16 indices into the source exactly as given, so they line up with
 * the offsets V8 reports for a script.
 *
 * @param {string} source - File contents
 * @returns {{ codeLines: Set<number>, codeOffsetsByLine: Map<number, number[]> }}
 *   1-based line numbers that hold code, and the offsets of the code characters on each
 */
function analyzeCode(source) {
  const codeOffsetsByLine = new Map();
  let state = 'code';
  let quote = '';
  let line = 1;

  const mark = offset => {
    if (!codeOffsetsByLine.has(line)) {
      codeOffsetsByLine.set(line, []);
    }
    codeOffsetsByLine.get(line).push(offset);
  };

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];

    if (ch === '\n') {
      line += 1;
      if (state === 'line-comment' || (state === 'string' && quote !== '`')) {
        state = 'code';
      }
      continue;
    }

    if (state === 'block-comment') {
      if (ch === '*' && next === '/') {
        state = 'code';
        i += 1;
      }
    } else if (state === 'line-comment') {
      continue;
    } else if (state === 'string') {
      if (!/\s/.test(ch)) {
        mark(i);
      }
      if (ch === '\\') {
        i += 1;
      } else if (ch === quote) {
        state = 'code';
      }
    } else if (ch === '/' && next === '*') {
      state = 'block-comment';
      i += 1;
    } else if (ch === '/' && next === '/') {
      state = 'line-comment';
      i += 1;
    } else if (!/\s/.test(ch)) {
      mark(i);
      if (ch === '"' || ch === "'" || ch === '`') {
        state = 'string';
        quote = ch;
      }
    }
  }

  return { codeLines: new Set(codeOffsetsByLine.keys()), codeOffsetsByLine };
}

module.exports = { analyzeCode };
