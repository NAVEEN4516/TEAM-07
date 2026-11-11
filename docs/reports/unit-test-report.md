# Unit Test Report

> Historical report and figures retained. Current independent execution, coverage
> and acceptance status are in the [Test Summary](test-summary-report.md).

Unit, integration and regression testing of the Burndown Chart Generator, testing phase. Scope is the existing single-sprint simulator; the reverted project-backlog and multi-sprint extension is out of scope.

| | |
| :-- | :-- |
| **Evidence commit** | `98b198f7bca22ee0cb14ef08d1218f11aaafaa91` on `feature/BDC-NF-005-testing-hemanth`. Later commits on the branch change documents only. |
| **Baseline** | `222089658f26badaf5c9f6d3c60e75986ebd6320`, the version named in [`qa-phase-start.md`](qa-phase-start.md). Application and test trees were verified identical to that pack's recorded tree hashes. |
| **Environment** | Windows 11 (10.0.26300). Node 24.11.1 (primary) and 20.20.2 (the CI major). npm 11.6.2. Chrome 156.0.8078.80 with Playwright 1.65.0 for the browser run. Full record: [`ut-environment.json`](evidence/ut-environment.json). |
| **Executed by** | Automated commands run on Hemanth Reddy's machine. Every figure comes from a command whose raw output is in [`evidence/`](evidence/). No manual or human-observed testing is claimed. |

## Summary

- **All 410 tests pass** on Node 24.11.1 and on Node 20.20.2 (the CI major): 91 suites, 0 failures, 0 skipped. At the baseline the suite was 255 tests, also all passing.
- **155 tests added** in 8 new files, plus 4 in an existing file. The baseline suite was reviewed first; each addition fills a gap found by that review (below).
- **One defect found, fixed and retested:** DEF-01, low severity and latent. Found at the baseline while probing the integrated flows, before the tests were written; fixed in `e1b41e8` with regression tests.
- **Stable:** eight consecutive runs gave identical results ([`ut-stability-8-runs.log`](evidence/ut-stability-8-runs.log)).
- **The tests can fail:** a sanity check applying 23 deliberate bugs to a scratch copy of `src/` was caught 23 of 23 times by the full suite, against 18 of 23 by the original 255 tests ([details](evidence/mut-sanity-check.md)).
- **Coverage and traceability** are in [code coverage](code-coverage-report.md), [branch coverage](branch-coverage-report.md) and [requirements traceability](requirements-traceability.md). This report does not repeat them.

Not final acceptance. No team review or Test Lead sign-off is recorded, Firefox and screen-reader testing have not been run, and my browser evidence is a single Chrome run of an existing script.

## Method

Commands, run from the repository root after `npm ci`:

```
npm test                                  # node --test, the repository's runner, no dependencies
node --test                               # the same suite on Node 20.20.2 (CI uses Node 20)
```

Both runs, and every other run cited here, are kept as raw output in [`evidence/`](evidence/) with the date, commit, Node version and command in each header.

| Run | Node | Commit | Tests | Suites | Pass | Fail | Raw output |
| :-- | :-- | :-- | --: | --: | --: | --: | :-- |
| Baseline | 24.11.1 | `2220896` | 255 | 63 | 255 | 0 | [`ut-baseline-npm-test.log`](evidence/ut-baseline-npm-test.log) |
| DEF-01 fix commit | 24.11.1 | `e1b41e8` | 360 | n/a | 360 | 0 | [`def-01-after-fix.log`](evidence/def-01-after-fix.log) |
| Final | 24.11.1 | `98b198f` | 410 | 91 | 410 | 0 | [`ut-final-npm-test-node24.log`](evidence/ut-final-npm-test-node24.log) |
| Final | 20.20.2 | `98b198f` | 410 | 91 | 410 | 0 | [`ut-final-node-test-node20.log`](evidence/ut-final-node-test-node20.log) |

No test is skipped or marked todo. The baseline matches the start pack's own figure (255 tests, 63 suites).

## Results by test file

Each file was also run on its own ([`ut-per-file-results.json`](evidence/ut-per-file-results.json)). "New" means added on this branch.

| Test file | Covers | Tests | Result | |
| :-- | :-- | --: | :-- | :-- |
| [`architecture/moduleBoundaries.test.js`](../../tests/architecture/moduleBoundaries.test.js) | Import graph: layering, no cycles, no DOM or storage in logic and data, no eval, local scripts only | 9 | 9 pass, 0 fail | New |
| [`data/addIssue.test.js`](../../tests/data/addIssue.test.js) | Adding issues: valid, duplicate, empty, zero-point, hostile text, numeric limits | 10 | 10 pass, 0 fail |  |
| [`data/dataManager.test.js`](../../tests/data/dataManager.test.js) | Sprint configuration, Current Day, KPIs, validation helpers | 16 | 16 pass, 0 fail |  |
| [`data/defaultDataset.test.js`](../../tests/data/defaultDataset.test.js) | SRS Appendix A dataset, immutability, cloning | 21 | 21 pass, 0 fail |  |
| [`data/limitsAndFallbacks.test.js`](../../tests/data/limitsAndFallbacks.test.js) | Aggregate points limit, cloning without structuredClone, deepFreeze edges | 8 | 8 pass, 0 fail | New |
| [`data/sprint2Workflow.test.js`](../../tests/data/sprint2Workflow.test.js) | Edit, delete and Reset workflow and recovery | 19 | 19 pass, 0 fail |  |
| [`data/storageIndependence.test.js`](../../tests/data/storageIndependence.test.js) | Sprint data never touches browser storage | 1 | 1 pass, 0 fail | New |
| [`data/storedState.test.js`](../../tests/data/storedState.test.js) | Validation, saved-state recovery, save/restore round trips, DEF-01 | 37 | 37 pass, 0 fail | +4 new |
| [`docs/sprint1Checklist.test.js`](../../tests/docs/sprint1Checklist.test.js) | The checklist document lists every case ID (a document check, not execution evidence) | 6 | 6 pass, 0 fail |  |
| [`integration/dashboardPipeline.test.js`](../../tests/integration/dashboardPipeline.test.js) | DataManager through engine, chart, table, timeline and KPIs after each operation | 35 | 35 pass, 0 fail | New |
| [`integration/stateIntegrity.test.js`](../../tests/integration/stateIntegrity.test.js) | Rejected operations, notifications, invalid saved state, hostile text, across every layer | 67 | 67 pass, 0 fail | New |
| [`logic/boundaryGuards.test.js`](../../tests/logic/boundaryGuards.test.js) | Engine and validator guards: overflow, negative zero, junk and missing input | 9 | 9 pass, 0 fail | New |
| [`logic/burndownEngine.test.js`](../../tests/logic/burndownEngine.test.js) | Ideal, actual, variance and status formulas and their edge cases | 37 | 37 pass, 0 fail |  |
| [`logic/validateIssue.test.js`](../../tests/logic/validateIssue.test.js) | Issue validation rules | 19 | 19 pass, 0 fail |  |
| [`logic/validationManager.test.js`](../../tests/logic/validationManager.test.js) | Sprint, Current Day, status-update and saved-state validators | 39 | 39 pass, 0 fail |  |
| [`perf/updateTime.test.js`](../../tests/perf/updateTime.test.js) | Calculation timing (calculation only, not browser latency) | 3 | 3 pass, 0 fail |  |
| [`ui/addIssueForm.test.js`](../../tests/ui/addIssueForm.test.js) | Add Issue form markup, escaping, parsing | 10 | 10 pass, 0 fail |  |
| [`ui/backlogTable.test.js`](../../tests/ui/backlogTable.test.js) | Backlog row data | 7 | 7 pass, 0 fail |  |
| [`ui/chartConfig.test.js`](../../tests/ui/chartConfig.test.js) | Chart configuration and series | 7 | 7 pass, 0 fail |  |
| [`ui/currentDayControl.test.js`](../../tests/ui/currentDayControl.test.js) | Current Day control markup and clamping | 4 | 4 pass, 0 fail |  |
| [`ui/kpiCards.test.js`](../../tests/ui/kpiCards.test.js) | KPI card markup and status badges | 9 | 9 pass, 0 fail |  |
| [`ui/renderFallbacks.test.js`](../../tests/ui/renderFallbacks.test.js) | Dark theme, render defaults, Add Issue form states | 14 | 14 pass, 0 fail | New |
| [`ui/sprint2Security.test.js`](../../tests/ui/sprint2Security.test.js) | CSP position and no-JavaScript notice, escaping on redisplay | 3 | 3 pass, 0 fail |  |
| [`ui/sprintBanner.test.js`](../../tests/ui/sprintBanner.test.js) | Banner and configuration form markup, escaping | 7 | 7 pass, 0 fail |  |
| [`ui/themeManager.test.js`](../../tests/ui/themeManager.test.js) | Theme toggle and persistence | 5 | 5 pass, 0 fail |  |
| [`ui/themeStorageFailure.test.js`](../../tests/ui/themeStorageFailure.test.js) | Theme persistence with blocked storage and OS dark mode | 8 | 8 pass, 0 fail | New |
| **Total** | | **410** | **410 pass, 0 fail** | |

`tests/docs/sprint1Checklist.test.js` only checks that the checklist document names each case ID. It is not evidence that any case passes, and the traceability matrix does not cite it.

## Review of the baseline suite

The 255 baseline tests are well organised (native `node:test`, no dependencies, many titles carrying Test Plan IDs). I read them and measured coverage before writing anything. The gaps:

1. **No test crossed layers.** Each layer was tested alone. Nothing checked that after an add, edit, delete or Reset the stored state, engine results, chart series, table rows, timeline control and KPI cards all agree.
2. **Rejected operations were not checked end to end.** Some tests checked data state; none asserted that every layer and the subscriber count were untouched, or that a multi-field `setSprint` with one bad field applies nothing.
3. **Measured gaps.** 57 uncovered V8 branch blocks in the 11 files the unit tests load, and 5 application files no unit test loads at all ([code coverage](code-coverage-report.md)).
4. **Mutation check.** The original suite missed 5 of the 23 deliberate bugs: DEF-01 coming back, sprint data starting to read browser storage, the OS dark-mode preference being ignored, `eval()` in application code, and a script loaded from another origin.
5. **Two cases had only manual evidence.** TC-NF-05.1 (module separation, no cycles) was an inspection, and TC-SR-05.1 ("zero usage of `eval()`") had no test.
6. **One defect**, DEF-01, which gap 1 exposed.

## Tests added

| File | New tests | Why |
| :-- | --: | :-- |
| `integration/dashboardPipeline` | 35 | Gap 1. Default data, the exact TC-F-01.1 scenario, add, edit, reopen, delete, delete-all then Reset, Day 0 to 10, single-day sprints, zero-point work. |
| `integration/stateIntegrity` | 67 | Gap 2. 36 rejected operations, one-notification-per-change, 15 invalid saved-state payloads, hostile text. |
| `architecture/moduleBoundaries` | 9 | Gap 5. Layering, cycles, DOM and storage in logic and data, `eval`, local-only scripts. |
| `logic/boundaryGuards` | 9 | Gap 3. Overflow to Infinity, negative zero, junk and missing input. |
| `data/limitsAndFallbacks` | 8 | Gap 3. Aggregate points limit, cloning without `structuredClone`, `deepFreeze` edges. |
| `data/storageIndependence` | 1 | Gap 4. Every storage entry point throws and counts; none is touched. |
| `ui/renderFallbacks` | 14 | Gap 3. Dark theme, defaults for missing data, form states. |
| `ui/themeStorageFailure` | 8 | Gap 4. Blocked storage, OS dark mode, corrupted saved theme. |
| `data/storedState` (existing) | 4 | DEF-01 regression tests. |

Expected values in the integration tests are fixed numbers from SRS Appendix A and B and the testing addendum (for example deleting PROJ-110 gives total 45, remaining 16, Ideal(4) 27, variance +11), not recomputed with the engine, so the tests do not depend on the code they verify.

## Integration and regression flows

Each flow from the brief, and the tests that cover it. All pass.

| Flow | Tests |
| :-- | :-- |
| Add an issue and verify every affected result | `dashboardPipeline`: adding PROJ-111 updates scope, ideal line, actual line, table and KPIs together; a Done issue added at the Current Day burns down immediately; the zero-point add leaves totals unchanged |
| Change status or completion day and verify recalculation | `dashboardPipeline`: marking PROJ-106 Done on Day 4 gives completed 32, remaining 18 in every layer; changing the completion day recalculates every earlier day |
| Reopen Done work and verify completion data is cleared | `dashboardPipeline`: reopening to In Progress and to To Do clears the day in every layer; reopening to In Progress returns the exact default snapshot; Done to To Do and back stays consistent |
| Delete issues and verify the remaining scope | `dashboardPipeline`: deleting PROJ-110 only gives 45 / 29 / 16 / Ideal(4) 27 / +11; deleting a completed issue removes its burn-down |
| Delete all issues, check zero behaviour, then reset | `dashboardPipeline`: every layer stays defined after each deletion and Reset restores the exact default snapshot; an emptied backlog accepts a new issue and reports a sensible schedule |
| Verify exact default-data restoration | `dashboardPipeline`: Reset after issue, status, day and configuration changes restores the canonical dataset; copies handed out by the store cannot alter what Reset restores |
| Day 0, final day, single-day sprints, zero-point work | `dashboardPipeline`: Day 0 to Day 10 sweep (11 tests, crossing the +1 and -1 variance boundaries); one-day sprint at Day 0 and Day 1; zero-point and empty one-day backlogs |
| Rejected operations do not partially change state | `stateIntegrity`: 36 rejected operations each leave every layer and the subscriber count unchanged, including multi-field `setSprint` calls with one invalid field; a rejected change after a successful one keeps only the successful one |
| Data-layer handling of invalid saved-state input | `stateIntegrity`: 15 invalid payloads restore the defaults with no partial adoption; tampered fields are cleaned and the total recomputed; a valid state round-trips exactly. `storedState` and `validationManager`: malformed JSON, schema violations, round trips. DEF-01 regression tests |

## Defect record

**DEF-01: subscribers could not read why defaults were restored.**

| | |
| :-- | :-- |
| **Severity** | Low. Latent: automatic persistence is disabled and no UI reads `loadErrors`. |
| **Requirement** | BDC-SR-003 (TC-SR-03.1) |
| **Found at** | Baseline `2220896`, by probing the integrated flows before writing tests |
| **Owner** | `src/js/data/dataManager.js`, code from my own earlier PR #42. Bhuvi's PR #48 (since merged) changes no `src` file, so there was no conflict to coordinate. |

**Steps.** Create a `DataManager`, subscribe a listener that reads `dm.loadErrors`, then call `dm.restoreFromJSON('{')`.

**Expected.** The listener, which runs when the restored defaults are published, can read the reasons (`['Saved data is not valid JSON.']`).

**Actual.** The listener saw `[]`. `restoreFromJSON` called `init(null)`, which reset `loadErrors` and notified subscribers, and assigned the reasons only afterwards, so they existed only once the call had returned.

**Fix** (`e1b41e8`, 24 lines in one file). A private `_load(source, loadErrors)` sets the errors, replaces the state and notifies once; `init()` and `restoreFromJSON()` both use it. Public behaviour, return values and notification counts are unchanged.

**Regression tests.** Four, in `data/storedState`. Two reproduce the defect and the other two guard the paths it did not affect (a later successful restore, and `init()` with an invalid dataset).

**Retest.** Before the fix, 2 of the 4 fail ([`def-01-before-fix.log`](evidence/def-01-before-fix.log)). At the fix commit the file passes 37 of 37 and the whole suite 360 of 360 ([`def-01-after-fix.log`](evidence/def-01-after-fix.log)); at the evidence commit 410 of 410 on both Node versions. The mutation check also confirms that reintroducing the defect fails the suite (M08).

No other defect was found. The mutation check is evidence the suite can detect them; it is not proof there are none.

## Observations

Not application defects; each needs a decision, mostly from Naveen. They are numbered and explained in the [traceability matrix](requirements-traceability.md#observations): the legacy checklist's unsupported "Passed" statuses (OBS-01), Day 0 and equal dates against the case wording (OBS-02, OBS-03), the table-scroll criterion (OBS-04), Jest versus `node --test` (OBS-05), the premise of TC-SR-03.1 (OBS-06), label mismatches in Bhuvi's prose report (OBS-07), history kept on shortening (OBS-09), message-substring coupling in the Add Issue form (OBS-10), and the cases waiting on Firefox and a screen reader (OBS-11).

## Mutation sanity check

One deliberate bug at a time was applied to a scratch copy of `src/`, and both the original 255 tests and the full suite were run against it. The full suite caught all 23; the original tests caught 18. Three of the original suite's catches were incidental (a pre-existing import-free test, a load-time crash, a Node-only missing global), which is why the architecture tests were added. Full table: [`mut-sanity-check.md`](evidence/mut-sanity-check.md). It is a check of 23 hand-picked bugs, not a mutation score.

## Limitations and remaining work

- **DOM-only code is not unit-tested.** Event handlers, `mount*` functions, `renderTable` and the files `chart.js`, `dashboard.js`, `backlogActions.js`, `fileProtocolNotice.js` and `themeBootstrap.js` need a real DOM. The repository has no DOM library by design, so these are covered only by browser runs ([code coverage](code-coverage-report.md)).
- **Browser evidence is narrow.** One Chrome run of `tools/verify-sprint2.cjs`. Edge and Firefox are not part of my evidence; Bhuvi reports Chrome and Edge, and Firefox is not executed.
- **Node 22 not run.** Bhuvi used 22.19.0; I ran 24.11.1 and 20.20.2.
- **Add Issue rejection display** (the handler's error branch) is exercised by no test of mine and no browser run of mine; Bhuvi reports it.
- **Same SHA not yet used for everyone.** My evidence includes DEF-01's fix; Bhuvi's system validation was run at the baseline, which does not. The fix changes nothing his records exercise, but the two have not been run on one commit.
- **Reporting only.** I did not edit the Word Test Plan, the legacy checklist, `docs/reports/README.md`, or any GitHub issue or board.

## Reproducing

```
git fetch origin && git switch feature/BDC-NF-005-testing-hemanth
npm ci
npm test                       # 410 tests
npm run test:coverage          # see code-coverage-report.md
```
