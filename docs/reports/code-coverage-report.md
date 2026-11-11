# Code Coverage Report

> Historical report and figures retained. Current independent execution, coverage
> and acceptance status are in the [Test Summary](test-summary-report.md).

Line and function coverage of the application code in `src/js`, measured two ways and kept apart: **unit tests** (headless Node) and a **browser run** (Chrome). Branch figures are in the [branch coverage report](branch-coverage-report.md).

| | |
| :-- | :-- |
| **Evidence commit** | `98b198f7bca22ee0cb14ef08d1218f11aaafaa91` on `feature/BDC-NF-005-testing-hemanth`. Later commits on the branch change documents only. |
| **Baseline** | `222089658f26badaf5c9f6d3c60e75986ebd6320`, the version named in [`qa-phase-start.md`](qa-phase-start.md). Application and test trees were verified identical to that pack's recorded tree hashes. |
| **Environment** | Windows 11 (10.0.26300). Node 24.11.1 (primary) and 20.20.2 (the CI major). npm 11.6.2. Chrome 156.0.8078.80 with Playwright 1.65.0 for the browser run. Full record: [`ut-environment.json`](evidence/ut-environment.json). |
| **Executed by** | Automated commands run on Hemanth Reddy's machine. Every figure comes from a command whose raw output is in [`evidence/`](evidence/). No manual or human-observed testing is claimed. |

## Summary

| | Lines (all) | Code lines | Functions |
| :-- | --: | --: | --: |
| Unit tests, the 11 files they load, baseline (255 tests) | 86.21% | 81.88% | 90.82% |
| Unit tests, the 11 files they load, final (410 tests) | 87.64% | 83.86% | 92.93% |

**Whole application, all 16 files, code lines executed:**

| Technique | Executed | Share |
| :-- | --: | --: |
| Unit tests, baseline | 1550 of 2325 | 66.67% |
| Unit tests, final | 1590 of 2328 | 68.30% |
| Browser run (`tools/verify-sprint2.cjs`, Chrome) | 1913 of 2328 | 82.17% |
| Either | 2162 of 2328 | 92.87% |

The baseline row is derived, because the baseline run measured only the 11 files it loaded: its 1550 executed code lines over 1893 code lines in those 11 files, plus the 432 code lines of the 5 files no unit test loads (unchanged since the baseline).

**How to read these.** The headline for the unit tests, 87.64%, covers only the 11 files they happen to load. Five files are never loaded by a unit test, so Node's own table leaves them out. Counting them, unit tests execute **68.30%** of the application's code lines, not 87.64%. The browser run reaches the DOM code the unit tests cannot, and the two together execute **92.87%**. **No 100% claim is made**; the remaining 166 code lines are listed below.

Unit-test results are identical on Node 24.11.1 and Node 20.20.2 (every figure matches).

## Method

| | |
| :-- | :-- |
| **Unit-test tool** | Node's built-in test-runner coverage (`node --test --experimental-test-coverage`), which reports V8 precise block coverage. Nothing to install: the repository stays dependency-free. Verified on Node 20.20.2 and 24.11.1. |
| **Why not the include/exclude flags** | `--test-coverage-include` and `--test-coverage-exclude` do not exist on Node 20, which CI uses, so filtering is done by `tools/coverage.mjs`. |
| **Browser tool** | `tools/browser-coverage.cjs` runs the existing `tools/verify-sprint2.cjs` unchanged in Chrome with V8 precise coverage attached through Playwright 1.65.0. Playwright is optional and kept outside the repository. |
| **Both are development tooling** | `package.json` gains one script, `test:coverage`. No runtime or test dependency is added. |
| **Measured files** | All 16 files under `src/js`: `data` (2), `logic` (2) and `ui` (12). |
| **Exclusions** | `src/vendor/chart.umd.js` (third-party Chart.js, not our code), the tests, the test helper `tests/integration/pipelineHelpers.js`, and non-JavaScript files (HTML, CSS). No application file is excluded. |

Commands:

```
npm run test:coverage -- --details --json out.json     # unit tests; writes coverage/lcov.info
node tools/coverage.mjs --from coverage/lcov.info       # summarize an existing lcov file
NODE_PATH=<folder with playwright> node tools/browser-coverage.cjs --json coverage/browser.json
node tools/coverage.mjs --from coverage/lcov.info --browser coverage/browser.json --details
```

### Definitions, so the numbers are not over-read

- **Lines (all)** is Node's own figure. It counts every physical line, comments and blank lines included, so it flatters the result.
- **Code lines** removes comment-only and blank lines from both sides, using one lexer shared by both tools (`tools/lib/code-lines.cjs`). It is the more conservative figure and the one used for the whole-application comparison. In the browser run a code line counts as executed when any code character on it ran.
- **Functions** are V8 function ranges. The module body is not counted.
- **Unit versus browser.** Unit coverage executes the logic, data and pure rendering in Node with no DOM. Browser coverage executes the DOM code (event handlers, `mount*` functions, Chart.js wiring) but only along the paths one script takes, so it says what that script exercises, not everything a user could do.
- The unit figure comes from Node's own lcov output; the browser figure is my conversion of raw V8 ranges. The definitions are alike but the two come from different code, so compare them as a guide, not to the last digit.

## Unit-test coverage

The 11 files the unit tests load. Node's table is reproduced in [`cov-unit-node24.log`](evidence/cov-unit-node24.log); raw lcov in [`cov-unit-node24.lcov`](evidence/cov-unit-node24.lcov).

| File | Lines (all) baseline → final | Code lines baseline → final | Functions baseline → final |
| :-- | :-- | :-- | :-- |
| `data/dataManager.js` | 98.51% → 100.00% | 97.31% → 100.00% | 22/22 → 23/23 |
| `data/defaultDataset.js` | 95.26% → 99.21% | 92.50% → 98.75% | 5/6 → 6/6 |
| `logic/burndownEngine.js` | 99.40% → 100.00% | 98.62% → 100.00% | 19/19 → 19/19 |
| `logic/validationManager.js` | 100.00% → 100.00% | 100.00% → 100.00% | 14/14 → 14/14 |
| `ui/addIssueForm.js` | 71.31% → 73.99% | 67.81% → 71.23% | 6/8 → 6/8 |
| `ui/backlogTable.js` | 28.49% → 28.49% | 17.60% → 17.60% | 2/4 → 2/4 |
| `ui/chartConfig.js` | 100.00% → 100.00% | 100.00% → 100.00% | 7/8 → 8/8 |
| `ui/currentDayControl.js` | 66.00% → 66.00% | 60.71% → 60.71% | 1/2 → 1/2 |
| `ui/kpiCards.js` | 91.08% → 91.08% | 89.61% → 89.61% | 3/4 → 3/4 |
| `ui/sprintBanner.js` | 75.75% → 75.75% | 71.07% → 71.07% | 4/5 → 4/5 |
| `ui/themeManager.js` | 89.92% → 100.00% | 86.96% → 100.00% | 6/6 → 6/6 |
| **Measured files** | **86.21% → 87.64%** | **81.88% → 83.86%** | **89/98 → 92/99** |

The logic and data layer is the part unit tests can fully reach: `dataManager.js`, `burndownEngine.js`, `validationManager.js`, `chartConfig.js` and `themeManager.js` are at 100% of code lines, and `defaultDataset.js` at 98.75%. The files that stay low (`backlogTable.js`, `currentDayControl.js`, `sprintBanner.js`, `addIssueForm.js`, `kpiCards.js`) are low because their `mount*` and `render*` DOM functions never run without a DOM.

### Not loaded by any unit test

Absent from Node's totals, so counted here as not executed:

| File | Lines | What it is |
| :-- | --: | :-- |
| `ui/backlogActions.js` | 151 | Edit and delete handlers |
| `ui/chart.js` | 199 | Chart.js wiring and the marker plugin |
| `ui/dashboard.js` | 196 | Page composition, subscriptions, dev flags |
| `ui/fileProtocolNotice.js` | 37 | The `file://` warning script |
| `ui/themeBootstrap.js` | 11 | Early theme script |

## Browser execution coverage

Measured while running `tools/verify-sprint2.cjs` in Chromium 156.0.8078.80. That script passed with no page errors ([`cov-browser-chrome.log`](evidence/cov-browser-chrome.log), [`cov-browser-chrome.json`](evidence/cov-browser-chrome.json)). It covers: the full workflow with KPIs and chart, validation without mutation, keyboard focus, delete-all and Reset, DOM XSS, a one-day zero-point sprint, CSP enforcement, unavailable storage, future-completion rejection with Day 0 bounds, and the no-JavaScript notice.

It does not click the theme toggle, open the page over `file://`, submit an invalid Add Issue, or use `?perf` and `?day`. Bhuvi's system validation exercises several of those, but I have no coverage measurement of his runs.

| File | Code lines | Functions |
| :-- | --: | --: |
| `data/dataManager.js` | 79.20% | 21/23 |
| `data/defaultDataset.js` | 80.63% | 3/6 |
| `logic/burndownEngine.js` | 86.21% | 19/19 |
| `logic/validationManager.js` | 67.80% | 12/14 |
| `ui/addIssueForm.js` | 68.84% | 7/18 |
| `ui/backlogActions.js` | 100.00% | 17/17 |
| `ui/backlogTable.js` | 96.80% | 7/7 |
| `ui/chart.js` | 77.19% | 3/5 |
| `ui/chartConfig.js` | 94.74% | 7/8 |
| `ui/currentDayControl.js` | 93.75% | 5/8 |
| `ui/dashboard.js` | 75.69% | 3/6 |
| `ui/fileProtocolNotice.js` | 11.54% | 1/2 |
| `ui/kpiCards.js` | 95.45% | 5/7 |
| `ui/sprintBanner.js` | 95.43% | 10/12 |
| `ui/themeBootstrap.js` | 80.00% | 1/1 |
| `ui/themeManager.js` | 71.01% | 4/6 |

Chrome was the only browser, so this says nothing about Edge or Firefox.

## Unit and browser together

Code lines per file, using one definition of a code line for all of them.

| File | Code lines | Unit tests | Browser run | Either |
| :-- | --: | --: | --: | --: |
| `data/dataManager.js` | 226 | 100.00% | 79.20% | 100.00% |
| `data/defaultDataset.js` | 160 | 98.75% | 80.63% | 98.75% |
| `logic/burndownEngine.js` | 145 | 100.00% | 86.21% | 100.00% |
| `logic/validationManager.js` | 264 | 100.00% | 67.80% | 100.00% |
| `ui/addIssueForm.js` | 292 | 71.23% | 68.84% | 80.82% |
| `ui/backlogActions.js` | 138 | 0.00% | 100.00% | 100.00% |
| `ui/backlogTable.js` | 125 | 17.60% | 96.80% | 98.40% |
| `ui/chart.js` | 114 | 0.00% | 77.19% | 77.19% |
| `ui/chartConfig.js` | 152 | 100.00% | 94.74% | 100.00% |
| `ui/currentDayControl.js` | 112 | 60.71% | 93.75% | 93.75% |
| `ui/dashboard.js` | 144 | 0.00% | 75.69% | 75.69% |
| `ui/fileProtocolNotice.js` | 26 | 0.00% | 11.54% | 11.54% |
| `ui/kpiCards.js` | 154 | 89.61% | 95.45% | 96.75% |
| `ui/sprintBanner.js` | 197 | 71.07% | 95.43% | 95.94% |
| `ui/themeBootstrap.js` | 10 | 0.00% | 80.00% | 80.00% |
| `ui/themeManager.js` | 69 | 100.00% | 71.01% | 100.00% |
| **All 16 files** | **2328** | **68.30%** | **82.17%** | **92.87%** |

Four files the unit tests never load or barely reach are covered mainly by the browser run (`backlogActions.js` 0% → 100%, `backlogTable.js` 17.60% → 98.40%, `dashboard.js` 0% → 75.69%, `chart.js` 0% → 77.19%). Conversely the browser run reaches only 67.80% of `validationManager.js` and 79.20% of `dataManager.js`, which the unit tests cover fully. The two techniques complement each other; neither replaces the other.

## What neither technique executes

166 of 2328 code lines. By file and cause:

| File | Lines | What they are |
| :-- | :-- | :-- |
| `data/defaultDataset.js` | 69-70 | 69-70: the `catch { continue; }` guard in `deepFreeze`, reachable only with an exotic `Proxy` |
| `ui/addIssueForm.js` | 275-280 282-293 295-305 308-315 317-326 328-330 364-369 | 275-330: the rejected-submission branch (error box, `aria-invalid`, focus); 364-369: `unmount` |
| `ui/backlogTable.js` | 63-64 | 63-64: the missing-container guard in `renderTable` |
| `ui/chart.js` | 43-44 51-52 83-84 109-110 115-116 156-157 170-176 184-190 | Early-return guards, one conditional marker-label drawing path (83-84), reading the theme when none is passed (115-116), `updateMarker` and `updateChartTheme` |
| `ui/currentDayControl.js` | 99-100 121-122 144-146 | The mount guard (99-100), the Prev Day button handler (121-122) and `unmount` |
| `ui/dashboard.js` | 37-38 56 102 109-110 116-122 125-133 168-170 172-180 192 | The no-state guard (37-38), the dark-theme arm (56), the theme-toggle callback (102), the `?perf` and `?day` flags, `window.__setDay`, the `DOMContentLoaded` fallback (192) |
| `ui/fileProtocolNotice.js` | 9-11 13-17 19-21 23-24 26-29 31-36 | All of `displayFileProtocolWarning`, which runs only over `file://` |
| `ui/kpiCards.js` | 194-195 207-209 | The mount guard (194-195) and `unmount` |
| `ui/sprintBanner.js` | 203-204 250-252 262-264 | The mount guard (203-204), the **successful-save branch** of the configuration form (250-252: re-render and refocus) and `unmount` |
| `ui/themeBootstrap.js` | 7-8 | 7-8: setting the dark theme (a saved dark choice, or an OS set to dark) |

**Two gaps matter most.** The Add Issue rejection branch displays the errors behind TC-F-06.2, TC-F-06.3 and part of TC-NF-03.1. The configuration form's successful-save branch (`sprintBanner.js` 250-252) is the browser half of TC-F-01.1. Only Bhuvi's system validation reports either. The rest is teardown code, development flags, guards, and paths the theme toggle, the Prev Day button and a `file://` open would reach.

## Limitations

- **No percentage is a quality verdict.** Executed is not the same as verified; the [requirements traceability matrix](requirements-traceability.md) says what each result actually proves.
- **Browser coverage describes one script in one browser.**
- **V8 block coverage is coarse.** A line counts as executed when any part of it ran, so a partly executed line reads as covered. Branch detail is in the [branch coverage report](branch-coverage-report.md).
- **Whole-application figures use my lexer's idea of a code line**, which does not parse JavaScript. A regular expression containing a quote could misclassify a line; the lexer ends quote strings at a line break to keep any error to one line.
- **No threshold is set.** None was agreed, and none is invented here.
