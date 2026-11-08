# Requirements Traceability Matrix

Maps all 25 SRS requirements to the 44 Test Plan cases and to the evidence each result rests on. Testing-phase deliverable coordinated by Hemanth Reddy; [`testing-phase-addendum.md`](../test-plan/testing-phase-addendum.md) and the [Test Plan](../test-plan/Burndown_Chart_Test_Plan.docx) define the cases. The Word Test Plan is owned by Naveen and has not been edited.

| | |
| :-- | :-- |
| **Evidence commit** | `98b198f7bca22ee0cb14ef08d1218f11aaafaa91` on `feature/BDC-NF-005-testing-hemanth`. Later commits on the branch change documents only. |
| **Baseline** | `222089658f26badaf5c9f6d3c60e75986ebd6320`, per [`qa-phase-start.md`](qa-phase-start.md). The branch adds tests, tooling and one data-layer defect fix (DEF-01); no other application code changed. |
| **System-validation evidence** | Bhuvi's branch `test/bhuvi-system-validation` at [`df80b16`](https://github.com/NAVEEN4516/TEAM-07/commit/df80b162129e4cb37b8b1057f2398461df6d37f2), [PR #48](https://github.com/NAVEEN4516/TEAM-07/pull/48), tested at the baseline commit in Chrome 156.0.8078.80 and Edge 157.0.4341.42. It is not merged and I have not re-run it. |
| **Environment of my runs** | Windows 11 (10.0.26300), Node 24.11.1 and 20.20.2, Chrome 156.0.8078.80, Playwright 1.65.0. See [`ut-environment.json`](evidence/ut-environment.json). |
| **Executed by** | Automated commands run through Claude Code on Hemanth Reddy's machine. No manual or human-observed testing is claimed. |

## Result

- **Test cases:** 30 Pass, 9 Pass†, 5 Partial, 0 Fail, 0 Not run (of 44).
- **Requirements:** 15 Pass, 6 Pass†, 4 Partial, 0 Fail (of 25).
- **Defects:** one, DEF-01 (low severity, latent), fixed in `e1b41e8` and retested. See [Defects](#defects).
- **Not yet accepted:** nothing here is final acceptance. Team review, Firefox, screen-reader testing and Test Lead sign-off are outstanding.

### How a status is decided

| Status | Meaning |
| :-- | :-- |
| **Pass** | Every clause of the case's expected outcome is covered by evidence I produced (unit/integration tests, and for some cases a browser assertion), and all of it passed. |
| **Pass†** | Evidence I produced covers the logic and data, and Bhuvi's raw records report PASS in both browsers for the rest (rendering, browser behaviour). Provisional: it relies on evidence in an unmerged PR that I have not re-run. |
| **Partial** | Part of the expected outcome has no passing evidence yet, or the case is blocked or not executed. The gap is named. |
| **Fail** / **Not run** | None at present. |

A case is never marked Pass because a document says so. The legacy checklist records all 44 cases as Passed (see OBS-01); this matrix does not use it.

### The three kinds of evidence

| Key | What it is | Where |
| :-- | :-- | :-- |
| **Automated** | `node:test` unit and integration tests, headless. 410 pass on Node 24 and on Node 20. Every test cited below was checked against the per-file passing-test inventory when this file was built. | [`ut-final-npm-test-node24.log`](evidence/ut-final-npm-test-node24.log), [`ut-final-node-test-node20.log`](evidence/ut-final-node-test-node20.log), [`ut-per-file-results.json`](evidence/ut-per-file-results.json) |
| **Browser** | Assertions inside `tools/verify-sprint2.cjs` (written by Naveen/Codex), which I ran unchanged in Chrome through `tools/browser-coverage.cjs`. It passed with no page errors. I cite only the assertions it actually makes. | [`cov-browser-chrome.log`](evidence/cov-browser-chrome.log) |
| **System (Bhuvi)** | His raw records, one per case and browser. Reported, not re-run by me. | [Chrome](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json), [Edge](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-msedge-2026-11-07.json) |

## Requirement matrix

| Requirement | Test cases | Status | Automated | Browser | System (Bhuvi) | Defects and notes |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| **BDC-F-001** Configure sprint | F-01.1, F-01.2, F-01.3 | **Pass†** | Partial | yes | PASS | OBS-03. |
| **BDC-F-002** Initial commitment (total points) | F-02.1, F-02.2 | **Pass** | Pass | yes | PASS |  |
| **BDC-F-003** Current Day control | F-03.1, F-03.2 | **Pass†** | Partial | yes | PASS | OBS-02 (Day 0). |
| **BDC-F-004** Load default dataset | F-04.1 | **Pass** | Pass | yes | PASS |  |
| **BDC-F-005** Display backlog | F-05.1 | **Pass†** | Partial | yes | PASS |  |
| **BDC-F-006** Add issue | F-06.1, F-06.2, F-06.3, F-06.4 | **Pass†** | Partial | yes | PASS | Add Issue rejection display is Bhuvi-only (OBS-10). |
| **BDC-F-007** Update status and completion | F-07.1, F-07.2, F-07.3 | **Pass** | Pass | yes | PASS |  |
| **BDC-F-008** Delete issue | F-08.1 | **Pass** | Pass | yes | PASS |  |
| **BDC-F-009** Reset dataset | F-09.1 | **Pass** | Pass | yes | PASS |  |
| **BDC-F-010** Ideal burndown | F-10.1, F-10.2 | **Pass** | Pass | no | PASS |  |
| **BDC-F-011** Actual burndown | F-11.1, F-11.2 | **Pass** | Pass | no | PASS |  |
| **BDC-F-012** Schedule variance | F-12.1, F-12.2, F-12.3 | **Pass** | Pass | no | PASS |  |
| **BDC-F-013** Display chart | F-13.1, F-13.2 | **Partial** | Partial | yes | BLOCKED, PASS | TC-F-13.2 BLOCKED (OBS-04). |
| **BDC-F-014** Current-day marker | F-14.1 | **Partial** | Partial | no | PASS | Marker pixel position not machine-verified. |
| **BDC-F-015** KPI dashboard | F-15.1, F-15.2 | **Pass** | Pass | yes | PASS |  |
| **BDC-NF-001** Performance | NF-01.1 | **Pass†** | Partial | no | PASS | Real browser latency is Bhuvi's measurement. |
| **BDC-NF-002** Usability | NF-02.1, NF-02.2 | **Partial** | Partial | yes | PASS | Keyboard traversal and colour distinction not shown; screen reader not executed (OBS-11). |
| **BDC-NF-003** Data integrity and validation | NF-03.1 | **Pass†** | Partial | yes | PASS |  |
| **BDC-NF-004** Compatibility | NF-04.1, NF-04.2 | **Partial** | Partial | yes | PASS, no record | Firefox not executed (OBS-11); OBS-04. |
| **BDC-NF-005** Maintainability | NF-05.1, NF-05.2 | **Pass** | Pass | no | PASS | OBS-05. |
| **BDC-SR-001** XSS prevention | SR-01.1 | **Pass** | Pass | yes | PASS |  |
| **BDC-SR-002** Numeric validation | SR-02.1 | **Pass** | Pass | no | PASS | OBS-02 (Day 0). |
| **BDC-SR-003** Safe storage handling | SR-03.1 | **Pass** | Pass | yes | PASS | DEF-01 found, fixed, retested. OBS-06. |
| **BDC-SR-004** Safe edge-case handling | SR-04.1, SR-04.2 | **Pass** | Pass | yes | PASS |  |
| **BDC-SR-005** CSP and dependency safety | SR-05.1 | **Pass** | Pass | yes | PASS |  |

Case numbers are shown without the `TC-` prefix, for example `F-01.1` is `TC-F-01.1`.

## Test case matrix

| Test case | Requirement | Status | Automated | Browser | System (Bhuvi) | Title |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| `TC-F-01.1` | BDC-F-001 | **Pass†** | Partial | no | PASS | Configure a valid sprint |
| `TC-F-01.2` | BDC-F-001 | **Pass** | Pass | yes | PASS | Invalid duration rejected |
| `TC-F-01.3` | BDC-F-001 | **Pass** | Pass | yes | PASS | End date before start date rejected |
| `TC-F-02.1` | BDC-F-002 | **Pass** | Pass | yes | PASS | Total committed points for default dataset |
| `TC-F-02.2` | BDC-F-002 | **Pass** | Pass | yes | PASS | Total updates on issue addition and deletion |
| `TC-F-03.1` | BDC-F-003 | **Pass†** | Partial | yes | PASS | Change Current Day |
| `TC-F-03.2` | BDC-F-003 | **Pass** | Pass | no | PASS | Out-of-range Current Day rejected |
| `TC-F-04.1` | BDC-F-004 | **Pass** | Pass | yes | PASS | Default dataset loaded on initial run |
| `TC-F-05.1` | BDC-F-005 | **Pass†** | Partial | yes | PASS | Backlog table content matches dataset |
| `TC-F-06.1` | BDC-F-006 | **Pass** | Pass | yes | PASS | Add a valid issue |
| `TC-F-06.2` | BDC-F-006 | **Pass†** | Partial | no | PASS | Duplicate key rejected |
| `TC-F-06.3` | BDC-F-006 | **Pass†** | Partial | no | PASS | Empty required fields rejected |
| `TC-F-06.4` | BDC-F-006 | **Pass** | Pass | no | PASS | Zero-point issue allowed |
| `TC-F-07.1` | BDC-F-007 | **Pass** | Pass | yes | PASS | Mark issue Done with valid completion day |
| `TC-F-07.2` | BDC-F-007 | **Pass** | Pass | yes | PASS | Completion day out of range rejected |
| `TC-F-07.3` | BDC-F-007 | **Pass** | Pass | yes | PASS | Status transitions and completion day lifecycle |
| `TC-F-08.1` | BDC-F-008 | **Pass** | Pass | yes | PASS | Delete an issue from backlog |
| `TC-F-09.1` | BDC-F-009 | **Pass** | Pass | yes | PASS | Reset Data restores baseline defaults |
| `TC-F-10.1` | BDC-F-010 | **Pass** | Pass | no | PASS | Ideal burndown formula verification |
| `TC-F-10.2` | BDC-F-010 | **Pass** | Pass | no | PASS | Zero duration handled safely |
| `TC-F-11.1` | BDC-F-011 | **Pass** | Pass | no | PASS | Actual burndown values match completed issues |
| `TC-F-11.2` | BDC-F-011 | **Pass** | Pass | no | PASS | No actual points plotted beyond Current Day |
| `TC-F-12.1` | BDC-F-012 | **Pass** | Pass | no | PASS | Classify "Ahead of Schedule" |
| `TC-F-12.2` | BDC-F-012 | **Pass** | Pass | no | PASS | Classify "On Track" within tolerance |
| `TC-F-12.3` | BDC-F-012 | **Pass** | Pass | no | PASS | Classify "Behind Schedule" |
| `TC-F-13.1` | BDC-F-013 | **Pass†** | Partial | yes | PASS | Burndown chart rendering and series styling |
| `TC-F-13.2` | BDC-F-013 | **Partial** | Partial | yes | BLOCKED | Chart layout responsiveness |
| `TC-F-14.1` | BDC-F-014 | **Partial** | Partial | no | PASS | Current-day marker position and update |
| `TC-F-15.1` | BDC-F-015 | **Pass** | Pass | yes | PASS | Baseline KPI metric values |
| `TC-F-15.2` | BDC-F-015 | **Pass** | Pass | yes | PASS | Live KPI recalculation on status update |
| `TC-NF-01.1` | BDC-NF-001 | **Pass†** | Partial | no | PASS | UI update time under 2 seconds |
| `TC-NF-02.1` | BDC-NF-002 | **Partial** | Partial | yes | PASS | Keyboard-only navigation and accessibility |
| `TC-NF-02.2` | BDC-NF-002 | **Partial** | Partial | no | PASS | Labels and multi-channel status indicators |
| `TC-NF-03.1` | BDC-NF-003 | **Pass†** | Partial | yes | PASS | Comprehensive rejection of invalid inputs |
| `TC-NF-04.1` | BDC-NF-004 | **Partial** | Partial | yes | no record | Cross-browser rendering and behavior |
| `TC-NF-04.2` | BDC-NF-004 | **Pass†** | Partial | yes | PASS | Responsive resolution range |
| `TC-NF-05.1` | BDC-NF-005 | **Pass** | Pass | no | PASS | Modular architectural separation review |
| `TC-NF-05.2` | BDC-NF-005 | **Pass** | Pass | no | PASS | Independent testability of calculation engine |
| `TC-SR-01.1` | BDC-SR-001 | **Pass** | Pass | yes | PASS | Cross-Site Scripting (XSS) input sanitization |
| `TC-SR-02.1` | BDC-SR-002 | **Pass** | Pass | no | PASS | Strict numeric input boundary validation |
| `TC-SR-03.1` | BDC-SR-003 | **Pass** | Pass | yes | PASS | Safe recovery from corrupted browser storage |
| `TC-SR-04.1` | BDC-SR-004 | **Pass** | Pass | yes | PASS | Graceful handling of empty backlog |
| `TC-SR-04.2` | BDC-SR-004 | **Pass** | Pass | yes | PASS | Zero story points and missing dates resilience |
| `TC-SR-05.1` | BDC-SR-005 | **Pass** | Pass | yes | PASS | Content Security Policy and eval prohibition |

## Evidence by test case

Each entry gives the expected outcome from the Test Plan, the evidence behind the status, and what that evidence does not show.

### BDC-F-001 — Configure sprint  ·  Pass†

**TC-F-01.1 — Configure a valid sprint**  ·  Status: **Pass†**
- **Expected:** Configuration saved; chart re-renders with Total Days = 5.
- **Automated:** [data/dataManager.test.js](../../tests/data/dataManager.test.js) › “TC-F-01.1 - accepts and saves a valid sprint configuration”; [data/dataManager.test.js](../../tests/data/dataManager.test.js) › “TC-F-01.1 - adjusts Current Day if new duration is shorter than current day”; [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “TC-F-01.1 - configuring "Sprint 2" for 5 days re-renders every layer for Total Days = 5”
- **Browser:** none
- **System (Bhuvi):** [`TC-F-01.1`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS
- **Not shown by my evidence:** The data, chart series, banner and timeline layers are verified for the exact 5-day scenario. Submitting a valid configuration through the real form and Chart.js drawing 5 days are not asserted by my browser run (its configuration check covers only the rejected path).

**TC-F-01.2 — Invalid duration rejected**  ·  Status: **Pass**
- **Expected:** Visible error message displayed; previous valid configuration retained without state corruption.
- **Automated:** [data/dataManager.test.js](../../tests/data/dataManager.test.js) › “TC-F-01.2 - rejects invalid duration (0, negative, non-numeric) and retains previous valid config”; [integration/stateIntegrity.test.js](../../tests/integration/stateIntegrity.test.js) › “sprint: zero duration is rejected with a message and no layer changes”; [integration/stateIntegrity.test.js](../../tests/integration/stateIntegrity.test.js) › “sprint: negative duration is rejected with a message and no layer changes”; [integration/stateIntegrity.test.js](../../tests/integration/stateIntegrity.test.js) › “sprint: text duration is rejected with a message and no layer changes”; [integration/stateIntegrity.test.js](../../tests/integration/stateIntegrity.test.js) › “sprint: duration beyond 60 is rejected with a message and no layer changes”; [ui/sprintBanner.test.js](../../tests/ui/sprintBanner.test.js) › “displays validation error messages in accessible alert region”; [logic/validationManager.test.js](../../tests/logic/validationManager.test.js) › “TC-SR-02.1 - rejects zero, negative, fractional, non-numeric and non-finite durations”
- **Browser:** “single-day zero scope”: Duration 0 entered in the real configuration form: the error region shows a message matching /positive integer/ and receives focus.
- **System (Bhuvi):** [`TC-F-01.2`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS

**TC-F-01.3 — End date before start date rejected**  ·  Status: **Pass**
- **Expected:** Configuration rejected with a visible error message.
- **Automated:** [data/dataManager.test.js](../../tests/data/dataManager.test.js) › “TC-F-01.3 - rejects end date preceding start date and retains previous valid config”; [logic/validationManager.test.js](../../tests/logic/validationManager.test.js) › “TC-F-01.3 - rejects an end date before the start date”; [integration/stateIntegrity.test.js](../../tests/integration/stateIntegrity.test.js) › “sprint: end before start is rejected with a message and no layer changes”; [ui/sprintBanner.test.js](../../tests/ui/sprintBanner.test.js) › “displays validation error messages in accessible alert region”
- **Browser:** “single-day zero scope”: Same error-region mechanism asserted in the browser for duration 0; the date-specific submit was not run in the browser by me.
- **System (Bhuvi):** [`TC-F-01.3`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS
- **Not shown by my evidence:** The visible-message markup for this exact error is unit-tested and the error region is browser-verified for another input; a date-specific browser submit is reported only by Bhuvi.

### BDC-F-002 — Initial commitment (total points)  ·  Pass

**TC-F-02.1 — Total committed points for default dataset**  ·  Status: **Pass**
- **Expected:** Total Committed Story Points = 50.
- **Automated:** [logic/burndownEngine.test.js](../../tests/logic/burndownEngine.test.js) › “TC-F-02.1 - default dataset totals exactly 50 points”; [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “a fresh load shows the 10 original issues with every field and the exact SRS Appendix B results”
- **Browser:** “workflow and KPIs/chart”: The real Total Scope KPI card reads 50 on first load.
- **System (Bhuvi):** [`TC-F-02.1`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS

**TC-F-02.2 — Total updates on issue addition and deletion**  ·  Status: **Pass**
- **Expected:** Total becomes 55, then returns to 50 immediately.
- **Automated:** [logic/burndownEngine.test.js](../../tests/logic/burndownEngine.test.js) › “TC-F-02.2 - total updates immediately on addition and deletion”; [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “adding PROJ-111 (5 points) updates scope, ideal line, actual line, table and KPIs together”; [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “deleting the added issue returns every layer to the default snapshot”; [data/addIssue.test.js](../../tests/data/addIssue.test.js) › “TC-F-02.2 (add half): total committed story points increases from 50 to 55”
- **Browser:** “workflow and KPIs/chart”: A 3-point issue added through the real form raises the Total Scope card to 53; deleting it returns 50.
- **System (Bhuvi):** [`TC-F-02.2`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS

### BDC-F-003 — Current Day control  ·  Pass†

**TC-F-03.1 — Change Current Day**  ·  Status: **Pass†**
- **Expected:** Actual burndown, chart marker, KPIs, and status update immediately without page reload.
- **Automated:** [data/dataManager.test.js](../../tests/data/dataManager.test.js) › “TC-F-03.1 - moving control to valid day updates Current Day and notifies subscribers”; [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “moving Day 4 to Day 6 updates the marker, actual endpoint and status without a reload”; [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “Day 0 … Day 10: marker, actual endpoint, KPIs, status and timeline control all agree” (11 tests)
- **Browser:** “keyboard focus”: ArrowRight twice on the real slider reaches Day 6 and keeps focus; the check does not read the KPI or chart afterwards.
- **System (Bhuvi):** [`TC-F-03.1`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS
- **Not shown by my evidence:** Every data, chart-series, KPI and timeline output is verified for each day 0 to 10. That the live DOM and canvas redraw without a reload after a day change is asserted only by Bhuvi's record.

**TC-F-03.2 — Out-of-range Current Day rejected**  ·  Status: **Pass**
- **Expected:** Each invalid value is rejected; Current Day remains unchanged.
- **Automated:** [data/dataManager.test.js](../../tests/data/dataManager.test.js) › “TC-F-03.2 - out-of-range values (< 0 or > durationDays) are rejected safely without state mutation”; [integration/stateIntegrity.test.js](../../tests/integration/stateIntegrity.test.js) › “day: below zero is rejected with a message and no layer changes”; [integration/stateIntegrity.test.js](../../tests/integration/stateIntegrity.test.js) › “day: beyond the duration is rejected with a message and no layer changes”; [integration/stateIntegrity.test.js](../../tests/integration/stateIntegrity.test.js) › “day: fractional is rejected with a message and no layer changes”; [integration/stateIntegrity.test.js](../../tests/integration/stateIntegrity.test.js) › “day: text is rejected with a message and no layer changes”; [logic/validationManager.test.js](../../tests/logic/validationManager.test.js) › “TC-F-03.2 / TC-SR-02.1 - rejects 11, -1, "abc", fractions and non-finite values”; [logic/validationManager.test.js](../../tests/logic/validationManager.test.js) › “day 0 is valid, per SRS Appendix C (0 to durationDays)”
- **Browser:** none
- **System (Bhuvi):** [`TC-F-03.2`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS
- **Note:** The case text lists Current Day 0 as invalid, but SRS Appendix C and the testing addendum define 0 as valid. Followed the SRS and addendum (see OBS-02).

### BDC-F-004 — Load default dataset  ·  Pass

**TC-F-04.1 — Default dataset loaded on initial run**  ·  Status: **Pass**
- **Expected:** Exactly 10 issues (PROJ-101 to PROJ-110) displayed with correct fields, and Total Committed Story Points = 50.
- **Automated:** [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “a fresh load shows the 10 original issues with every field and the exact SRS Appendix B results”; [data/defaultDataset.test.js](../../tests/data/defaultDataset.test.js) › “individual issue values match SRS Appendix A Table 11 exactly”; [data/defaultDataset.test.js](../../tests/data/defaultDataset.test.js) › “contains exactly 10 issues with keys PROJ-101 through PROJ-110”
- **Browser:** “workflow and KPIs/chart”: The real page loads 10 backlog rows and a Total Scope of 50.
- **System (Bhuvi):** [`TC-F-04.1`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS
- **Note:** The 'empty localStorage' precondition does not apply: sprint data is never saved automatically.

### BDC-F-005 — Display backlog  ·  Pass†

**TC-F-05.1 — Backlog table content matches dataset**  ·  Status: **Pass†**
- **Expected:** Exactly 10 rows displayed, one per issue; columns for key, summary, type, points, status, and completion day match dataset values.
- **Automated:** [ui/backlogTable.test.js](../../tests/ui/backlogTable.test.js) › “every field in each row strictly equals the corresponding dataset field”; [ui/backlogTable.test.js](../../tests/ui/backlogTable.test.js) › “default dataset yields exactly 10 rows”; [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “a fresh load shows the 10 original issues with every field and the exact SRS Appendix B results”
- **Browser:** “workflow and KPIs/chart”: The real table has 10 body rows; cell contents are not asserted.
- **System (Bhuvi):** [`TC-F-05.1`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS
- **Not shown by my evidence:** Row data is verified field by field. The DOM function that writes those strings into table cells (renderTable) is not unit-tested; my browser check counts rows only.

### BDC-F-006 — Add issue  ·  Pass†

**TC-F-06.1 — Add a valid issue**  ·  Status: **Pass**
- **Expected:** Issue added to backlog; Total Story Points = 55; chart and KPIs update accordingly.
- **Automated:** [data/addIssue.test.js](../../tests/data/addIssue.test.js) › “TC-F-06.1: successfully adds valid issue and updates series, KPIs, and subscribers”; [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “adding PROJ-111 (5 points) updates scope, ideal line, actual line, table and KPIs together”
- **Browser:** “workflow and KPIs/chart”: A valid issue added through the real Add Issue form raises the Total Scope card; hostile text produces no injected element.
- **System (Bhuvi):** [`TC-F-06.1`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS

**TC-F-06.2 — Duplicate key rejected**  ·  Status: **Pass†**
- **Expected:** Validation error displayed; duplicate issue is not added.
- **Automated:** [data/addIssue.test.js](../../tests/data/addIssue.test.js) › “TC-F-06.2: duplicate PROJ-101 (and variants) rejected with unchanged state and listener count”; [integration/stateIntegrity.test.js](../../tests/integration/stateIntegrity.test.js) › “add: duplicate key is rejected with a message and no layer changes”; [integration/stateIntegrity.test.js](../../tests/integration/stateIntegrity.test.js) › “add: duplicate key in other case with spaces is rejected with a message and no layer changes”; [logic/boundaryGuards.test.js](../../tests/logic/boundaryGuards.test.js) › “TC-F-06.2 - duplicate detection ignores junk entries and understands issue objects”
- **Browser:** none
- **System (Bhuvi):** [`TC-F-06.2`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS
- **Not shown by my evidence:** The rejection, message and unchanged state are verified. Displaying the error in the Add Issue form (the handler's rejection branch) is not run by any test of mine; it is reported only by Bhuvi.

**TC-F-06.3 — Empty required fields rejected**  ·  Status: **Pass†**
- **Expected:** Validation message shown for each missing required field; issue is not added.
- **Automated:** [data/addIssue.test.js](../../tests/data/addIssue.test.js) › “TC-F-06.3: empty key, empty summary, both reject with errors and nothing added”; [integration/stateIntegrity.test.js](../../tests/integration/stateIntegrity.test.js) › “add: empty key is rejected with a message and no layer changes”; [integration/stateIntegrity.test.js](../../tests/integration/stateIntegrity.test.js) › “add: empty summary is rejected with a message and no layer changes”
- **Browser:** none
- **System (Bhuvi):** [`TC-F-06.3`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS
- **Not shown by my evidence:** As for TC-F-06.2: a message for each missing field is produced and nothing is added, but showing them in the form is reported only by Bhuvi.

**TC-F-06.4 — Zero-point issue allowed**  ·  Status: **Pass**
- **Expected:** Issue is accepted and added; Total Story Points remains unchanged; no NaN or error produced.
- **Automated:** [data/addIssue.test.js](../../tests/data/addIssue.test.js) › “TC-F-06.4: story points 0 accepted, total stays 50, and getKPIs() has no NaN/Infinity/undefined”; [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “TC-F-06.4 - a zero-point issue appears in the table but changes no total, line or KPI”; [data/storedState.test.js](../../tests/data/storedState.test.js) › “TC-F-06.4 - zero story points are allowed, as SRS Section 5.2 requires”
- **Browser:** none
- **System (Bhuvi):** [`TC-F-06.4`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS

### BDC-F-007 — Update status and completion  ·  Pass

**TC-F-07.1 — Mark issue Done with valid completion day**  ·  Status: **Pass**
- **Expected:** Accepted; Actual Burndown on Day 4 becomes 50 - 32 = 18.
- **Automated:** [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “marking PROJ-106 Done on Day 4 gives completed 32, remaining 18 in every layer”; [data/sprint2Workflow.test.js](../../tests/data/sprint2Workflow.test.js) › “Done updates publish once, refresh KPIs and return isolated copies”
- **Browser:** “workflow and KPIs/chart”: Marking PROJ-106 Done on Day 4 in the real editor makes the Remaining card 18 and the live chart's Day 4 point 18.
- **System (Bhuvi):** [`TC-F-07.1`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS

**TC-F-07.2 — Completion day out of range rejected**  ·  Status: **Pass**
- **Expected:** Update rejected with a validation error message; status unchanged.
- **Automated:** [data/sprint2Workflow.test.js](../../tests/data/sprint2Workflow.test.js) › “TC-F-07.2: future completion is rejected atomically at Current Day 4”; [integration/stateIntegrity.test.js](../../tests/integration/stateIntegrity.test.js) › “update: Done after the Current Day is rejected with a message and no layer changes”; [integration/stateIntegrity.test.js](../../tests/integration/stateIntegrity.test.js) › “update: Done beyond the duration is rejected with a message and no layer changes”; [logic/validationManager.test.js](../../tests/logic/validationManager.test.js) › “TC-F-07.2 - rejects a completion day after the Current Day”; [logic/validationManager.test.js](../../tests/logic/validationManager.test.js) › “TC-F-07.2 - rejects a completion day after the sprint duration”
- **Browser:** “validation without mutation”: In the real editor, Day 5 at Current Day 4 shows 'between 1 and 4', the KPIs are unchanged and the serialized state is byte-identical.; “future-completion rejection and Day 0 bounds”: Day 11 is also rejected; at Day 0 the field's maximum is 0 and a completion shows 'No completion day is valid'.
- **System (Bhuvi):** [`TC-F-07.2`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS

**TC-F-07.3 — Status transitions and completion day lifecycle**  ·  Status: **Pass**
- **Expected:** Direct To Do -> Done transition allowed; moving out of Done automatically clears the recorded completion day.
- **Automated:** [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “reopening Done work to In Progress clears the completion day in every layer”; [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “reopening Done work to To Do clears the completion day in every layer”; [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “moving a Done issue out of Done and back keeps the history consistent”; [data/sprint2Workflow.test.js](../../tests/data/sprint2Workflow.test.js) › “reopening to To Do clears completion history”; [logic/validationManager.test.js](../../tests/logic/validationManager.test.js) › “TC-F-07.3 - moving out of Done needs no completion day”
- **Browser:** “workflow and KPIs/chart”: Reopening PROJ-106 to In Progress in the real editor returns Remaining to 21 and disables the completion-day field.
- **System (Bhuvi):** [`TC-F-07.3`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS

### BDC-F-008 — Delete issue  ·  Pass

**TC-F-08.1 — Delete an issue from backlog**  ·  Status: **Pass**
- **Expected:** Issue row removed; Total=45, Ideal(4)=27, Remaining=16, Variance=+11; KPI cards refresh immediately.
- **Automated:** [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “deleting PROJ-110 only gives total 45, completed 29, remaining 16, Ideal(4) 27, variance +11”; [data/sprint2Workflow.test.js](../../tests/data/sprint2Workflow.test.js) › “deleting completed and incomplete issues recalculates scope and notifies once each”
- **Browser:** “workflow and KPIs/chart”: Deleting PROJ-101 with the real Delete button gives Total Scope 45 and moves focus to the next Delete button.
- **System (Bhuvi):** [`TC-F-08.1`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS

### BDC-F-009 — Reset dataset  ·  Pass

**TC-F-09.1 — Reset Data restores baseline defaults**  ·  Status: **Pass**
- **Expected:** Original 10 issues restored, Sprint 1 configuration restored (Duration=10, Current Day=4, Total=50).
- **Automated:** [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “Reset after issue, status, day and configuration changes restores the canonical dataset”; [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “deleting every issue gives defined zero results in every layer, then Reset restores the defaults”; [data/dataManager.test.js](../../tests/data/dataManager.test.js) › “reset() restores baseline state”; [data/sprint2Workflow.test.js](../../tests/data/sprint2Workflow.test.js) › “empty backlog is finite and reset restores exact canonical dataset”
- **Browser:** “delete all and reset”: The real Reset button restores 10 rows and Total Scope 50 after deleting every issue, and again at several other points in the run.
- **System (Bhuvi):** [`TC-F-09.1`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS

### BDC-F-010 — Ideal burndown  ·  Pass

**TC-F-10.1 — Ideal burndown formula verification**  ·  Status: **Pass**
- **Expected:** Ideal(0)=50, Ideal(4)=30, Ideal(10)=0.
- **Automated:** [logic/burndownEngine.test.js](../../tests/logic/burndownEngine.test.js) › “TC-F-10.1 - Ideal(0)=50, Ideal(4)=30, Ideal(10)=0 for the default dataset”; [logic/burndownEngine.test.js](../../tests/logic/burndownEngine.test.js) › “TC-F-10.1 - full ideal series is linear across 11 points”; [ui/chartConfig.test.js](../../tests/ui/chartConfig.test.js) › “TC-F-13.1: Ideal dataset contains values 50, 45, 40, ..., 0 across days 0..10”
- **Browser:** none
- **System (Bhuvi):** [`TC-F-10.1`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS

**TC-F-10.2 — Zero duration handled safely**  ·  Status: **Pass**
- **Expected:** Safe defined return value; no NaN, Infinity, or application crash.
- **Automated:** [logic/burndownEngine.test.js](../../tests/logic/burndownEngine.test.js) › “TC-F-10.2 - zero duration returns a defined value, never NaN or Infinity”; [logic/burndownEngine.test.js](../../tests/logic/burndownEngine.test.js) › “TC-F-10.2 - negative, non-numeric and non-finite durations are rejected safely”; [integration/stateIntegrity.test.js](../../tests/integration/stateIntegrity.test.js) › “sprint: zero duration is rejected with a message and no layer changes”
- **Browser:** none
- **System (Bhuvi):** [`TC-F-10.2`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS

### BDC-F-011 — Actual burndown  ·  Pass

**TC-F-11.1 — Actual burndown values match completed issues**  ·  Status: **Pass**
- **Expected:** Actual(1)=45, Actual(2)=42, Actual(3)=34, Actual(4)=21.
- **Automated:** [logic/burndownEngine.test.js](../../tests/logic/burndownEngine.test.js) › “TC-F-11.1 - Actual(1)=45, Actual(2)=42, Actual(3)=34, Actual(4)=21”; [ui/chartConfig.test.js](../../tests/ui/chartConfig.test.js) › “TC-F-13.1: Actual dataset contains values 50, 45, 42, 34, 21 for days 0-4 and nulls thereafter”; [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “a fresh load shows the 10 original issues with every field and the exact SRS Appendix B results”
- **Browser:** none
- **System (Bhuvi):** [`TC-F-11.1`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS

**TC-F-11.2 — No actual points plotted beyond Current Day**  ·  Status: **Pass**
- **Expected:** No actual points are plotted for days after the Current Day (Actual(d) = null for d > currentDay).
- **Automated:** [logic/burndownEngine.test.js](../../tests/logic/burndownEngine.test.js) › “TC-F-11.2 - no actual values are plotted beyond the Current Day”; [logic/burndownEngine.test.js](../../tests/logic/burndownEngine.test.js) › “TC-F-11.2 - moving Current Day to 6 extends the plotted range”; [ui/chartConfig.test.js](../../tests/ui/chartConfig.test.js) › “TC-F-13.1: future unelapsed actual values are strictly null and never converted to zero”; [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “Day 0 plots only the starting point and the final day plots the whole actual line”
- **Browser:** none
- **System (Bhuvi):** [`TC-F-11.2`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS

### BDC-F-012 — Schedule variance  ·  Pass

**TC-F-12.1 — Classify "Ahead of Schedule"**  ·  Status: **Pass**
- **Expected:** Variance +9 and +2; health status classified as "Ahead of Schedule" (Variance > 1).
- **Automated:** [logic/burndownEngine.test.js](../../tests/logic/burndownEngine.test.js) › “TC-F-12.1 - default dataset at Day 4 gives variance +9, Ahead of Schedule”; [logic/burndownEngine.test.js](../../tests/logic/burndownEngine.test.js) › “TC-F-12.1 - Ideal=30 with Actual=28 gives variance +2, Ahead of Schedule”; [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “Day 4: marker, actual endpoint, KPIs, status and timeline control all agree”
- **Browser:** none
- **System (Bhuvi):** [`TC-F-12.1`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS

**TC-F-12.2 — Classify "On Track" within tolerance**  ·  Status: **Pass**
- **Expected:** Health status classified as "On Track" for all three boundary values (-1 <= Variance <= 1).
- **Automated:** [logic/burndownEngine.test.js](../../tests/logic/burndownEngine.test.js) › “TC-F-12.2 - variance 0, +1 and -1 all classify as On Track”; [logic/burndownEngine.test.js](../../tests/logic/burndownEngine.test.js) › “TC-F-12.2 - tolerance boundary is exclusive just outside +/-1”; [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “Day 3: marker, actual endpoint, KPIs, status and timeline control all agree”; [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “Day 6: marker, actual endpoint, KPIs, status and timeline control all agree”
- **Browser:** none
- **System (Bhuvi):** [`TC-F-12.2`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS

**TC-F-12.3 — Classify "Behind Schedule"**  ·  Status: **Pass**
- **Expected:** Status classified as "Behind Schedule" (Variance < -1).
- **Automated:** [logic/burndownEngine.test.js](../../tests/logic/burndownEngine.test.js) › “TC-F-12.3 - Ideal=30 with Actual=32 and 38 classify as Behind Schedule”; [ui/kpiCards.test.js](../../tests/ui/kpiCards.test.js) › “TC-F-15.2 - renders Behind Schedule status and negative variance cleanly”; [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “Day 2: marker, actual endpoint, KPIs, status and timeline control all agree”; [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “Day 7: marker, actual endpoint, KPIs, status and timeline control all agree”
- **Browser:** none
- **System (Bhuvi):** [`TC-F-12.3`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS

### BDC-F-013 — Display chart  ·  Partial

**TC-F-13.1 — Burndown chart rendering and series styling**  ·  Status: **Pass†**
- **Expected:** Chart renders Sprint Day vs Remaining Story Points; dashed line for Ideal, solid line for Actual, labelled axes and legend; re-renders dynamically on data changes.
- **Automated:** [ui/chartConfig.test.js](../../tests/ui/chartConfig.test.js) › “TC-F-13.1: chart config contains responsive line chart properties, datasets, axes, and legend”; [ui/chartConfig.test.js](../../tests/ui/chartConfig.test.js) › “TC-F-13.1: changing currentDay dynamically changes the count of plotted Actual points”; [ui/renderFallbacks.test.js](../../tests/ui/renderFallbacks.test.js) › “both themes draw a dashed ideal line and a solid actual line with distinguishable colours”
- **Browser:** “workflow and KPIs/chart”: The live Chart.js instance has 2 datasets; after saving an edit its Day 4 Actual point is 18 (the chart re-rendered on a data change).
- **System (Bhuvi):** [`TC-F-13.1`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS
- **Not shown by my evidence:** The chart configuration (dashed/solid, axes, legend, series) and a live re-render are verified. No machine check confirms the canvas is drawn legibly; Bhuvi's record is configuration-level and his screenshots need human review.
- **Why this status:** Configuration, data and re-render are machine-verified; Bhuvi reports the same configuration plus screenshots. Visual legibility is not machine-verified.

**TC-F-13.2 — Chart layout responsiveness**  ·  Status: **Partial**
- **Expected:** Canvas scales smoothly, maintaining label readability without horizontal viewport scrolling.
- **Automated:** none
- **Browser:** “workflow and KPIs/chart”: document.scrollWidth <= window.innerWidth at 1024, 1440 and 1920 px (page level only).
- **System (Bhuvi):** [`TC-F-13.2`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) BLOCKED
- **Not shown by my evidence:** Page-level overflow only. Whether the backlog table may scroll inside its own wrapper is unresolved (OBS-04); Bhuvi marks the case BLOCKED pending Naveen. The unit test tagged TC-F-13.2 checks empty-data robustness, not responsiveness, so it is not cited.

### BDC-F-014 — Current-day marker  ·  Partial

**TC-F-14.1 — Current-day marker position and update**  ·  Status: **Partial**
- **Expected:** Vertical marker dynamically repositions to Day 7 without full page reload.
- **Automated:** [ui/chartConfig.test.js](../../tests/ui/chartConfig.test.js) › “TC-F-14.1: getMarkerDay handles first, intermediate, and final sprint days correctly and clamps boundaries”; [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “Day 0 … Day 10: marker, actual endpoint, KPIs, status and timeline control all agree” (11 tests)
- **Browser:** none
- **System (Bhuvi):** [`TC-F-14.1`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS
- **Not shown by my evidence:** The marker's day and the series it sits on are verified for every day. The pixel position of the marker after a change is not asserted by any machine check; Bhuvi's record is configuration-level plus a screenshot.
- **Why this status:** Marker position is not machine-verified.

### BDC-F-015 — KPI dashboard  ·  Pass

**TC-F-15.1 — Baseline KPI metric values**  ·  Status: **Pass**
- **Expected:** Cards display: Total 50, Completed 29, Remaining 21, Days Elapsed 4, Days Left 6, Status "Ahead of Schedule".
- **Automated:** [data/dataManager.test.js](../../tests/data/dataManager.test.js) › “TC-F-15.1 - default dataset at Day 4 produces exact SRS Appendix A & B KPI values”; [ui/kpiCards.test.js](../../tests/ui/kpiCards.test.js) › “TC-F-15.1 - renders all 6 live KPI cards with default dataset Day 4 values”; [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “a fresh load shows the 10 original issues with every field and the exact SRS Appendix B results”
- **Browser:** “workflow and KPIs/chart”: The real Total Scope and Remaining cards read 50 and 21.
- **System (Bhuvi):** [`TC-F-15.1`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS

**TC-F-15.2 — Live KPI recalculation on status update**  ·  Status: **Pass**
- **Expected:** Completed becomes 32, Remaining becomes 18, Variance becomes +12, Status remains "Ahead of Schedule".
- **Automated:** [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “marking PROJ-106 Done on Day 4 gives completed 32, remaining 18 in every layer”; [data/dataManager.test.js](../../tests/data/dataManager.test.js) › “TC-F-15.2 - moving Current Day updates all KPIs live and deterministically”; [ui/kpiCards.test.js](../../tests/ui/kpiCards.test.js) › “TC-F-15.2 - renders Behind Schedule status and negative variance cleanly”
- **Browser:** “workflow and KPIs/chart”: After the real editor saves Done on Day 4 the Completed card reads 32 and Remaining 18.
- **System (Bhuvi):** [`TC-F-15.2`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS

### BDC-NF-001 — Performance  ·  Pass†

**TC-NF-01.1 — UI update time under 2 seconds**  ·  Status: **Pass†**
- **Expected:** Chart and KPI cards are fully updated within 2 seconds.
- **Automated:** [perf/updateTime.test.js](../../tests/perf/updateTime.test.js) › “default dataset: 200 iterations of addIssue + setCurrentDay + getKPIs each execute < 2000 ms”; [perf/updateTime.test.js](../../tests/perf/updateTime.test.js) › “stress: 1000 generated issues with state updates each execute < 2000 ms”
- **Browser:** none
- **System (Bhuvi):** [`TC-NF-01.1`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS
- **Not shown by my evidence:** Only the calculation is timed. The addendum states a calculation-only test is insufficient; real browser update latency is Bhuvi's measurement (median 24 to 28 ms in Chrome and Edge).

### BDC-NF-002 — Usability  ·  Partial

**TC-NF-02.1 — Keyboard-only navigation and accessibility**  ·  Status: **Partial**
- **Expected:** Sprint configuration, Current Day slider, Add/Update/Delete issue, and Reset controls are fully reachable and operable via keyboard.
- **Automated:** [ui/addIssueForm.test.js](../../tests/ui/addIssueForm.test.js) › “contains all six labelled controls and data-testid hooks”
- **Browser:** “keyboard focus”: Skip link moves focus to #main-content; slider operable by arrow keys; editor takes focus, Escape closes it and focus returns to the Edit button; focus lands on a sensible control after save, delete and Reset.
- **System (Bhuvi):** [`TC-NF-02.1-SKIP`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS; [`TC-NF-02.1-FOCUS`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS
- **Not shown by my evidence:** No test traverses every control by Tab alone, and the run clicks buttons with the mouse. Screen-reader testing is NOT EXECUTED (Bhuvi's manual sheet).
- **Why this status:** Keyboard operability of every control is not shown.

**TC-NF-02.2 — Labels and multi-channel status indicators**  ·  Status: **Partial**
- **Expected:** Clear semantic labels; health status communicated through both text and distinct colors (never color alone).
- **Automated:** [ui/addIssueForm.test.js](../../tests/ui/addIssueForm.test.js) › “contains all six labelled controls and data-testid hooks”; [ui/kpiCards.test.js](../../tests/ui/kpiCards.test.js) › “maps Ahead of Schedule to positive modifier and distinct label”; [ui/kpiCards.test.js](../../tests/ui/kpiCards.test.js) › “maps On Track to neutral modifier”; [ui/kpiCards.test.js](../../tests/ui/kpiCards.test.js) › “maps Behind Schedule to alert modifier”
- **Browser:** none
- **System (Bhuvi):** [`TC-NF-02.2`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS
- **Not shown by my evidence:** Text label, icon and CSS class differ per status and Bhuvi reports every control labelled. That the colours are visibly distinct comes from stylesheet rules no test reads.
- **Why this status:** Colour distinction is not machine-verified.

### BDC-NF-003 — Data integrity and validation  ·  Pass†

**TC-NF-03.1 — Comprehensive rejection of invalid inputs**  ·  Status: **Pass†**
- **Expected:** 100% of invalid entries rejected with visible inline feedback; zero corrupted values stored in memory or storage.
- **Automated:** [data/storedState.test.js](../../tests/data/storedState.test.js) › “TC-NF-03.1 - every SRS Section 5.2 invalid case is rejected and nothing is stored”; [integration/stateIntegrity.test.js](../../tests/integration/stateIntegrity.test.js) › “Rejected operations change nothing (TC-NF-03.1, TC-SR-02.1, TC-F-01.2, TC-F-03.2, TC-F-06.2, TC-F-07.2)”
- **Browser:** “validation without mutation”: Rejected edits and configuration show visible messages in the real page with state unchanged.
- **System (Bhuvi):** [`TC-NF-03.1`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS
- **Not shown by my evidence:** Every Section 5.2 case is rejected with a message and no layer changes. Visible feedback for Add Issue rejections is reported only by Bhuvi.

### BDC-NF-004 — Compatibility  ·  Partial

**TC-NF-04.1 — Cross-browser rendering and behavior**  ·  Status: **Partial**
- **Expected:** All tests pass identically; no layout breakages or unhandled console errors.
- **Automated:** none
- **Browser:** “workflow and KPIs/chart”: Chrome 156 only: the run completed with no page errors.
- **System (Bhuvi):** none
- **Not shown by my evidence:** Chrome only in my run. Bhuvi reports Chrome 156 and Edge 157 (52 PASS, 1 BLOCKED each, no record for this case); Firefox is NOT EXECUTED.
- **Why this status:** Firefox has not been run.

**TC-NF-04.2 — Responsive resolution range**  ·  Status: **Pass†**
- **Expected:** Layout adapts cleanly and remains readable at every target width without unintentional horizontal clipping.
- **Automated:** none
- **Browser:** “workflow and KPIs/chart”: Page-level horizontal overflow checked at 1024, 1440 and 1920 px in Chrome.
- **System (Bhuvi):** [`TC-NF-04.2-1024px-light`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS; [`TC-NF-04.2-1366px-light`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS; [`TC-NF-04.2-1440px-light`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS; [`TC-NF-04.2-1920px-light`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS; [`TC-NF-04.2-1024px-dark`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS; [`TC-NF-04.2-1366px-dark`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS; [`TC-NF-04.2-1440px-dark`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS; [`TC-NF-04.2-1920px-dark`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS
- **Not shown by my evidence:** Page-level only; the table-scroll interpretation is open (OBS-04). Bhuvi covers four widths in both themes.

### BDC-NF-005 — Maintainability  ·  Pass

**TC-NF-05.1 — Modular architectural separation review**  ·  Status: **Pass**
- **Expected:** Presentation, data, and calculation logic partitioned into distinct modules (UIManager, DataManager, BurndownEngine, ValidationManager); clean dependencies without circular references.
- **Automated:** [architecture/moduleBoundaries.test.js](../../tests/architecture/moduleBoundaries.test.js) › “Module architecture (BDC-NF-005, TC-NF-05.1)”; [logic/burndownEngine.test.js](../../tests/logic/burndownEngine.test.js) › “TC-NF-05.1 - module declares no imports, so it cannot form a cycle”
- **Browser:** none
- **System (Bhuvi):** [`TC-NF-05.1`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS
- **Note:** The inspection criteria are now an automated check of the real import graph (layering, no cycles, no DOM or storage in logic/data).

**TC-NF-05.2 — Independent testability of calculation engine**  ·  Status: **Pass**
- **Expected:** All unit tests pass independently with deterministic outcomes.
- **Automated:** [logic/burndownEngine.test.js](../../tests/logic/burndownEngine.test.js) › “TC-NF-05.2 - engine runs headless with no DOM available”
- **Browser:** none
- **System (Bhuvi):** [`TC-NF-05.2`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS
- **Note:** The whole suite runs without a DOM on Node 24.11.1 and 20.20.2. The case text says Jest; the repository uses node --test (OBS-05).

### BDC-SR-001 — XSS prevention  ·  Pass

**TC-SR-01.1 — Cross-Site Scripting (XSS) input sanitization**  ·  Status: **Pass**
- **Expected:** Strings safely encoded and rendered as harmless literal text; zero script execution.
- **Automated:** [ui/sprintBanner.test.js](../../tests/ui/sprintBanner.test.js) › “TC-SR-01.1 - safely escapes markup, script tags, and attribute injections”; [ui/sprintBanner.test.js](../../tests/ui/sprintBanner.test.js) › “TC-SR-01.1 - renders user-controlled sprint name as inert text rather than executing markup”; [integration/stateIntegrity.test.js](../../tests/integration/stateIntegrity.test.js) › “Hostile text stays inert through the whole pipeline (TC-SR-01.1)”
- **Browser:** “DOM XSS”: Hostile key, summary and sprint name render as text: zero injected img/script elements and window.xss stays undefined; a typed <img onerror> in the real Add Issue form adds no <img>.
- **System (Bhuvi):** [`TC-SR-01.1`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS

### BDC-SR-002 — Numeric validation  ·  Pass

**TC-SR-02.1 — Strict numeric input boundary validation**  ·  Status: **Pass**
- **Expected:** All rejected prior to persistence or mathematical computation; application remains stable.
- **Automated:** [data/addIssue.test.js](../../tests/data/addIssue.test.js) › “TC-SR-02.1 / TC-NF-03.1: points -3, "abc", Infinity rejected with no state change”; [logic/validationManager.test.js](../../tests/logic/validationManager.test.js) › “TC-SR-02.1 - rejects zero, negative, fractional, non-numeric and non-finite durations”; [data/limitsAndFallbacks.test.js](../../tests/data/limitsAndFallbacks.test.js) › “Aggregate story-point limit (BDC-SR-002, TC-SR-02.1)”; [logic/boundaryGuards.test.js](../../tests/logic/boundaryGuards.test.js) › “TC-SR-02.1 - non-object issue input is rejected with every required-field error and no exception”; [integration/stateIntegrity.test.js](../../tests/integration/stateIntegrity.test.js) › “sprint: negative duration is rejected with a message and no layer changes”; [integration/stateIntegrity.test.js](../../tests/integration/stateIntegrity.test.js) › “day: beyond the duration is rejected with a message and no layer changes”
- **Browser:** none
- **System (Bhuvi):** [`TC-SR-02.1`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS
- **Note:** The case lists Current Day 0 among invalid values; the SRS and addendum make it valid (OBS-02).

### BDC-SR-003 — Safe storage handling  ·  Pass

**TC-SR-03.1 — Safe recovery from corrupted browser storage**  ·  Status: **Pass**
- **Expected:** Corrupted payload discarded safely; default dataset restored; no application freeze or stack trace exposed.
- **Automated:** [data/storedState.test.js](../../tests/data/storedState.test.js) › “restoreFromJSON() - TC-SR-03.1 safe recovery from corrupted storage”; [integration/stateIntegrity.test.js](../../tests/integration/stateIntegrity.test.js) › “Invalid saved state never reaches the views (BDC-SR-003, TC-SR-03.1)”; [logic/validationManager.test.js](../../tests/logic/validationManager.test.js) › “parseStoredState (BDC-SR-003, TC-SR-03.1)”; [data/storedState.test.js](../../tests/data/storedState.test.js) › “DEF-01 - subscribers can read why defaults were restored (BDC-SR-003)”; [data/storageIndependence.test.js](../../tests/data/storageIndependence.test.js) › “Sprint data does not depend on browser storage”; [ui/themeStorageFailure.test.js](../../tests/ui/themeStorageFailure.test.js) › “Theme persistence with unavailable storage”
- **Browser:** “unavailable storage”: With window.localStorage throwing, the page reloads, Reset works, Total Scope is 50, 10 rows are shown and there are no page errors.
- **System (Bhuvi):** [`TC-SR-03.1`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS
- **Note:** Automatic sprint persistence is disabled, so the literal 'reload with corrupted localStorage' cannot occur. Per the addendum the case is met by testing the recovery API at the data layer and startup with throwing storage (OBS-06).

### BDC-SR-004 — Safe edge-case handling  ·  Pass

**TC-SR-04.1 — Graceful handling of empty backlog**  ·  Status: **Pass**
- **Expected:** Total Committed Points = 0; Ideal, Actual, and KPI calculations yield defined outputs; no NaN, Infinity, or uncaught exceptions.
- **Automated:** [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “deleting every issue gives defined zero results in every layer, then Reset restores the defaults”; [logic/burndownEngine.test.js](../../tests/logic/burndownEngine.test.js) › “TC-SR-04.1 - empty backlog yields defined zeros, no NaN or Infinity”; [data/sprint2Workflow.test.js](../../tests/data/sprint2Workflow.test.js) › “empty backlog is finite and reset restores exact canonical dataset”
- **Browser:** “delete all and reset”: Every issue deleted through the real buttons: Total and Remaining read 0, the empty-state message shows and focus moves to Reset.
- **System (Bhuvi):** [`TC-SR-04.1`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS

**TC-SR-04.2 — Zero story points and missing dates resilience**  ·  Status: **Pass**
- **Expected:** Calculations produce defined non-error results; invalid duration safely rejected.
- **Automated:** [logic/burndownEngine.test.js](../../tests/logic/burndownEngine.test.js) › “TC-SR-04.2 - all-zero story points produce a defined result”; [logic/burndownEngine.test.js](../../tests/logic/burndownEngine.test.js) › “TC-SR-04.2 - zero and negative durations are rejected without crashing”; [logic/burndownEngine.test.js](../../tests/logic/burndownEngine.test.js) › “TC-SR-04.2 - In Progress issues with a null completion date are excluded”; [integration/dashboardPipeline.test.js](../../tests/integration/dashboardPipeline.test.js) › “a backlog made only of zero-point work stays finite in every layer”; [data/sprint2Workflow.test.js](../../tests/data/sprint2Workflow.test.js) › “single-day zero-point sprint supports boundary days and rejects zero duration”
- **Browser:** “single-day zero scope”: A one-day, zero-point fixture shows the zero-scope notice, navigates Day 0 to 1 and rejects duration 0 in the real form.
- **System (Bhuvi):** [`TC-SR-04.2`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS

### BDC-SR-005 — CSP and dependency safety  ·  Pass

**TC-SR-05.1 — Content Security Policy and eval prohibition**  ·  Status: **Pass**
- **Expected:** CSP active on server deployments; zero usage of eval(); static deployment deviations clearly documented.
- **Automated:** [ui/sprint2Security.test.js](../../tests/ui/sprint2Security.test.js) › “BDC-SR-005: policy precedes scripts and disallows inline script/eval”; [ui/sprint2Security.test.js](../../tests/ui/sprint2Security.test.js) › “BDC-SR-005: noscript warning uses external CSS instead of a blocked inline style”; [architecture/moduleBoundaries.test.js](../../tests/architecture/moduleBoundaries.test.js) › “Dependency safety (BDC-SR-005, TC-SR-05.1)”
- **Browser:** “CSP enforcement”: No CSP violation at startup; an injected inline script is blocked and a script-src-elem violation is reported.
- **System (Bhuvi):** [`TC-SR-05.1`](https://github.com/NAVEEN4516/TEAM-07/blob/df80b162129e4cb37b8b1057f2398461df6d37f2/docs/reports/evidence/sv-results-chrome-2026-11-07.json) PASS
- **Note:** No server deployment exists to test a header. The static-hosting deviation (meta policy, no frame-ancestors) is documented in docs/SAD/sprint2_addendum.md, lines 40-67, which satisfies the SRS wording for static-file deployments.

## Defects

| ID | Requirement | Severity | Found at | Fix commit | Retest |
| :-- | :-- | :-- | :-- | :-- | :-- |
| **DEF-01** | BDC-SR-003 (TC-SR-03.1) | Low, latent | baseline `2220896` | `e1b41e8` | Pass: 4 regression tests, 37/37 in the file and 360/360 suite at the fix commit, then 410/410 at the evidence commit |

**Reproduction.** Subscribe to a `DataManager`, then call `restoreFromJSON('{')`. **Expected:** the subscriber can read why the defaults were restored. **Actual:** `loadErrors` was `[]` when the subscriber ran and held the errors only after the call returned, because `init(null)` notified before the reasons were assigned. **Impact:** none today (persistence is disabled and no UI reads `loadErrors`); it would surface the first time a subscriber displays why saved data was discarded. Full record in the [unit test report](unit-test-report.md#defect-record). Evidence: [before](evidence/def-01-before-fix.log), [after](evidence/def-01-after-fix.log).

## Observations

These are not application defects. Each needs a decision, mostly from Naveen, who owns the shared documents.

| ID | Observation | Affects |
| :-- | :-- | :-- |
| **OBS-01** | `docs/test-plan/sprint1_checklist.md` marks all 44 cases `Passed` with ticked boxes and a sign-off table showing Naveen, Bhuvi and “Hemanth Reddy / Pranathi G” as Approved on 2026-10-22 (commit `85670e6`, PR #35). No evidence is linked to any status, and Add Issue (PR #38, merged 2026-10-29) and edit, delete and Reset (PR #39, merged 2026-10-30) post-date it. This matrix does not rely on it. I have not edited the file. | All cases |
| **OBS-02** | TC-F-03.2 and TC-SR-02.1 list Current Day 0 among invalid values. SRS Appendix C and SAD 4.1 define the range as 0 to durationDays, the slider starts at 0 and the addendum says to accept Day 0. I followed the SRS and addendum. The case text probably needs correcting. | BDC-F-003, BDC-SR-002 |
| **OBS-03** | TC-F-01.3 and SRS 4.1 say the end date must follow the start date; the validator accepts an equal date so one-day sprints work (also Bhuvi's OBS-02). The message reads “must follow or equal start date”. | BDC-F-001 |
| **OBS-04** | TC-F-13.2 says “no horizontal viewport scrolling”. Page-level overflow is 0 px at every width in both browsers, but the backlog table scrolls inside its own wrapper. Whether that meets the case is undecided (Bhuvi's OBS-01, pending Naveen). | BDC-F-013, BDC-NF-004 |
| **OBS-05** | TC-NF-05.2 says “Run Jest”; the repository uses the native `node --test` runner (Bhuvi's OBS-04). The addendum already says so. | BDC-NF-005 |
| **OBS-06** | TC-SR-03.1 says to reload the page with corrupted `localStorage`. Automatic sprint persistence is disabled, so that cannot happen. Met instead as the addendum describes: the recovery API (`restoreFromJSON`, `parseStoredState`) at the data layer, plus startup and Reset with throwing storage. | BDC-SR-003 |
| **OBS-07** | The prose tables in Bhuvi's `system-validation-report.md` label several rows differently from the Test Plan and from his own raw JSON (for example TC-F-02.1, TC-F-04.1, TC-F-05.1 and TC-F-06.2 to .4) and paraphrase messages the app does not show. The raw JSON uses the Test Plan IDs correctly, so this matrix cites the raw records. The report should be regenerated or corrected before it is relied on. | System evidence |
| **OBS-08** | An existing unit test tagged TC-F-13.2 checks empty-data robustness, not responsiveness, so it is not cited. Two of my own titles were mistagged (duplicate key as .3, zero-point untagged) and are corrected. | BDC-F-013 |
| **OBS-09** | Shortening a sprint keeps completion history, so the table can show Done issues that the KPIs no longer count (Bhuvi's OBS-03, documented as design). The behaviour is now pinned by a test so a change is deliberate. | BDC-F-001, BDC-F-007 |
| **OBS-10** | The Add Issue form decides which field to flag by matching substrings of the validation message text, inside a DOM handler no headless test can reach. All nine messages the validator can produce map to a field today, so this is not a defect, but rewording a message would silently stop it flagging the right field. Extracting the mapping as a pure function would make it testable. Not done: the file is Bhuvi's and the task excludes refactors. | BDC-F-006, BDC-NF-002 |
| **OBS-11** | Firefox and physical screen-reader testing have not been executed (Bhuvi's manual sheets exist). No case that depends on them can be Pass. | BDC-NF-002, BDC-NF-004 |

## How this file was checked

- Built from a data file and a script that, before writing anything, confirm that all 139 automated references name a test that exists in the passing-test inventory ([`ut-per-file-results.json`](evidence/ut-per-file-results.json), one run per test file) and that every Bhuvi record cited exists in both his Chrome and Edge JSON. A reference that failed either check stopped the build.
- All 410 tests in the inventory passed; none failed.
- Statuses follow the rules above. Nothing was promoted by judgement except the three cases marked with an override, each of which is explained under its entry.

## Limits

- **Provisional Pass†.** It rests on Bhuvi's unmerged evidence, taken at face value from his raw records. If PR #48 changes, re-check those cases.
- **Browser evidence is narrow.** It is one Chrome run of an existing script, covering only what that script asserts. Edge, Firefox and screen readers are outside it.
- **Tested commit.** My evidence is at the commit above, which includes DEF-01's fix. Bhuvi's is at the baseline, which does not. The fix is data-layer only and changes no behaviour his records exercise, but the two have not been run on the same SHA.
- **No sign-off.** This is evidence, not acceptance.

