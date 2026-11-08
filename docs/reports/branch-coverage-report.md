# Branch Coverage Report

Branch coverage of `src/js`, what was uncovered at the baseline, what was done about it, and what the number can and cannot tell you. Line and function coverage are in the [code coverage report](code-coverage-report.md).

| | |
| :-- | :-- |
| **Evidence commit** | `98b198f7bca22ee0cb14ef08d1218f11aaafaa91` on `feature/BDC-NF-005-testing-hemanth`. Later commits on the branch change documents only. |
| **Baseline** | `222089658f26badaf5c9f6d3c60e75986ebd6320`, the version named in [`qa-phase-start.md`](qa-phase-start.md). Application and test trees were verified identical to that pack's recorded tree hashes. |
| **Environment** | Windows 11 (10.0.26300). Node 24.11.1 (primary) and 20.20.2 (the CI major). npm 11.6.2. Chrome 156.0.8078.80 with Playwright 1.65.0 for the browser run. Full record: [`ut-environment.json`](evidence/ut-environment.json). |
| **Executed by** | Automated commands run through Claude Code on Hemanth Reddy's machine. Every figure comes from a command whose raw output is in [`evidence/`](evidence/). No manual or human-observed testing is claimed. |

## Summary

- **Baseline:** 436/493 branch blocks covered (88.44%) in the 11 files the unit tests load, so **57 blocks uncovered**.
- **Final:** 563/565 (99.65%), so **2 uncovered**. The two left are defensive guards reachable only with an exotic `Proxy` object.
- **That percentage is not a whole-application figure and should not be quoted as one.** V8 lists the inner branches of a function only after it has run, so branches inside the 7 functions the unit tests never call, and in the 5 files they never load, are invisible to it. Those are the DOM handlers, which the [browser run](#browser-run) measures separately.
- **Reliable for the logic and data layer**, where every function ran: `burndownEngine.js` 90/90, `validationManager.js` 153/153, `dataManager.js` 66/66, `chartConfig.js` 54/54, `themeManager.js` 33/33, `defaultDataset.js` 41/43.
- Identical on Node 24.11.1 and 20.20.2.

## What "branch" means here

Node reports **V8 block ranges**: function bodies, `if`/`else` arms, short-circuit operands and ternary arms. This is not Istanbul's per-operand branch count, so do not compare it with figures from other tools.

**Why a rising percentage can mislead.** At the baseline the unit tests saw 493 blocks; at the end 565. The denominator grew because newly exercised functions revealed their inner blocks. So "88.44% → 99.65%" compares unlike totals. The honest comparison is the count of uncovered blocks, 57 down to 2.

## Baseline versus final, per file

| File | Blocks covered, baseline | Blocks covered, final | Uncovered, baseline → final | Functions run |
| :-- | --: | --: | :-- | :-- |
| `data/dataManager.js` | 60/62 | 66/66 | 2 → 0 | 23/23 |
| `data/defaultDataset.js` | 28/37 | 41/43 | 9 → 2 | 6/6 |
| `logic/burndownEngine.js` | 79/83 | 90/90 | 4 → 0 | 19/19 |
| `logic/validationManager.js` | 131/137 | 153/153 | 6 → 0 | 14/14 |
| `ui/addIssueForm.js` | 37/46 | 54/54 | 9 → 0 | 6/8 |
| `ui/backlogTable.js` | 9/14 | 19/19 | 5 → 0 | 2/4 |
| `ui/chartConfig.js` | 29/40 | 54/54 | 11 → 0 | 8/8 |
| `ui/currentDayControl.js` | 7/9 | 12/12 | 2 → 0 | 1/2 |
| `ui/kpiCards.js` | 22/22 | 22/22 | 0 → 0 | 3/4 |
| `ui/sprintBanner.js` | 14/18 | 19/19 | 4 → 0 | 4/5 |
| `ui/themeManager.js` | 20/25 | 33/33 | 5 → 0 | 6/6 |
| **Total** | **436/493** | **563/565** | **57 → 2** | **92/99** |

Branch figures are only trustworthy for a file when its functions all ran. The five UI files whose function column is below 100% have branches inside their uncalled `mount*`, `render` and handler functions that this table cannot see.

## The 57 baseline gaps and what became of them

Each uncovered block was read and sorted. Tests were added only where a user or environment can really reach the state.

| File | Gaps | What they were | Outcome |
| :-- | --: | :-- | :-- |
| `data/dataManager.js` | 2 | The aggregate-points guard in `addIssue` | Tested: `limitsAndFallbacks` (total at the safe-integer limit accepted, one more point rejected, state unchanged) |
| `data/defaultDataset.js` | 9 | `deepClone` fallback for dates, patterns and arrays; `deepFreeze` on primitives and accessor setters; two defensive guards | 7 tested in `limitsAndFallbacks` (cloning without `structuredClone`, `deepFreeze` edges). **2 left**: `catch` and `!desc`, reachable only through a `Proxy` whose descriptor lookup fails after `Object.freeze` succeeded |
| `logic/burndownEngine.js` | 4 | Non-finite normalisation, negative zero, non-numeric day thresholds | Tested: `boundaryGuards` |
| `logic/validationManager.js` | 6 | Non-object issue input, missing or unusable context, junk in the key list, unusable duration or day | Tested: `boundaryGuards` |
| `ui/addIssueForm.js` | 9 | Success message, Task and Bug selected, mount guards, form-parsing defaults | Tested: `renderFallbacks` |
| `ui/backlogTable.js` | 5 | Row defaults for missing fields | Tested: `renderFallbacks` |
| `ui/chartConfig.js` | 11 | Ten dark-theme colour choices, and deriving the day count from the series | Tested: `renderFallbacks` (dark theme stays readable; unknown theme falls back to light) |
| `ui/currentDayControl.js` | 2 | Defaults for unusable day and duration | Tested: `renderFallbacks` |
| `ui/sprintBanner.js` | 4 | Banner and form defaults for an empty sprint | Tested: `renderFallbacks` |
| `ui/themeManager.js` | 5 | Storage fallbacks and the OS dark-mode preference | Tested: `themeStorageFailure` (blocked or throwing storage, first visit in dark mode, saved choice overriding it) |

Several of these were real scenarios nobody had tested: the dark theme, a first visit with the OS in dark mode, storage that throws, and the aggregate points limit. The mutation check confirms the value: ignoring the OS preference was missed by the original suite and caught by the new one.

## Branches the unit tests cannot see

The unit tests never call these 7 functions, so the branches inside them are not counted at all:

| File | Never-called functions |
| :-- | :-- |
| `ui/addIssueForm.js` | `unmount` (line 363), `handleSubmit` (line 266) |
| `ui/backlogTable.js` | `getStatusClass` (line 12), `renderTable` (line 61) |
| `ui/currentDayControl.js` | `mountCurrentDayControl` (line 97) |
| `ui/kpiCards.js` | `mountKPICards` (line 192) |
| `ui/sprintBanner.js` | `mountSprintBanner` (line 201) |

They are DOM code: `handleSubmit`, `renderTable`, the three `mount*` functions and their `unmount` closures. A unit test would need a DOM, which the repository deliberately does not have. The evidence for them is the browser run.

## Browser run

Branch blocks executed in Chromium 156.0.8078.80 while running `tools/verify-sprint2.cjs`. Same V8 definition, but measured by `tools/browser-coverage.cjs`, not by Node, and from one script only. Treat these as a record of what that script exercises, not a coverage target.

| File | Blocks executed | Functions run |
| :-- | --: | --: |
| `data/dataManager.js` | 27/44 (61.36%) | 21/23 |
| `data/defaultDataset.js` | 8/25 (32.00%) | 3/6 |
| `logic/burndownEngine.js` | 32/52 (61.54%) | 19/19 |
| `logic/validationManager.js` | 30/76 (39.47%) | 12/14 |
| `ui/addIssueForm.js` | 7/43 (16.28%) | 7/18 |
| `ui/backlogActions.js` | 35/40 (87.50%) | 17/17 |
| `ui/backlogTable.js` | 19/28 (67.86%) | 7/7 |
| `ui/chart.js` | 7/18 (38.89%) | 3/5 |
| `ui/chartConfig.js` | 12/31 (38.71%) | 7/8 |
| `ui/currentDayControl.js` | 14/20 (70.00%) | 5/8 |
| `ui/dashboard.js` | 6/26 (23.08%) | 3/6 |
| `ui/fileProtocolNotice.js` | 1/3 (33.33%) | 1/2 |
| `ui/kpiCards.js` | 11/24 (45.83%) | 5/7 |
| `ui/sprintBanner.js` | 12/30 (40.00%) | 10/12 |
| `ui/themeBootstrap.js` | 1/4 (25.00%) | 1/1 |
| `ui/themeManager.js` | 4/17 (23.53%) | 4/6 |
| **All 16 files** | **226/481 (46.99%)** | **125/159** |

The low percentages are expected: the script follows one path through each handler, so the other arm of most conditions never runs. `addIssueForm.js` is lowest (7 of 43) because the script only submits a valid issue.

The browser run never executed `restoreFromJSON`, `validateStoredState` or `parseStoredState`, since saved-state loading is not wired to any UI. Their branches are covered by the unit tests alone, which is the correct place for them.

## What this does and does not show

- **Shown:** the pure functions of the calculation, validation, data and rendering layers have no uncovered reachable branch except two defensive guards, and the suite fails when their behaviour is broken (mutation check).
- **Not shown:** branch coverage of the DOM code. No whole-application branch percentage is claimed, because there is no tool-supported way to get one: the unit figure cannot see inside uncalled functions and the browser figure covers one script. Merging the two at branch level is not possible, since lcov carries lines, not block ranges.
- **The two most important untested branches** are the Add Issue rejection display (`addIssueForm.js` lines 275-330; TC-F-06.2, TC-F-06.3, part of TC-NF-03.1) and the configuration form's successful save (`sprintBanner.js` lines 250-252; TC-F-01.1). Neither technique executes them, and only Bhuvi's system validation reports them.

## Recommendations

1. Extract the Add Issue form's error-to-field mapping into a pure function. It currently matches substrings of the message text inside a DOM handler, so it cannot be unit-tested and a reworded message would silently stop flagging the right field. All nine current messages map correctly. I did not change the file: it is Bhuvi's and the brief excludes refactors.
2. Once Bhuvi's runner merges, run it under `tools/browser-coverage.cjs` to measure the invalid-input, theme and `file://` paths the existing script skips.
3. Agree whether any coverage threshold is wanted before one is set.
