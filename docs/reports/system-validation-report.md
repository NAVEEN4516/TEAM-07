# Burndown Chart Generator — Testing-Phase System Validation Report

- **Document ID:** SV-REPORT-2026-11-10
- **Project:** TEAM-07 Burndown Chart Generator
- **Tested Commit (SHA):** `85391ae9181a666cc5b975968070e3dc5059a352` (short `85391ae`)
- **Baseline Commits:**
  - Initial Pinned Baseline (PR #47): `222089658f26badaf5c9f6d3c60e75986ebd6320`
  - Integration Baseline (PR #51): `e901ecf17232f97a307ab6c723ba13bdc26aa744`
- **Validation Lead & QA Tester:** Bhuvi (`@stacktrace-bhuvi`, `bhuvikatti696@gmail.com`)
- **Execution Date:** 2026-11-10
- **Host Test Environment:** Windows 11 (NT 10.0.26200.0), Node.js v22.19.0 (x64), Playwright 1.57.0
- **Repository Guidelines Files:** `AGENTS.md` is **absent**; `CODEX.md` is **absent**.
- **Evidence Scope:** Pinned to commit `85391ae9181a666cc5b975968070e3dc5059a352`. Scope is strictly the single-sprint Burndown Chart Generator (BDC-F-001 through BDC-F-015, BDC-NF-001 through BDC-NF-005, and BDC-SR-001 through BDC-SR-005). Multi-sprint and project-backlog extensions remain strictly out of scope.

---

## 1. Executive Summary

A comprehensive, rigorous end-to-end System Validation was conducted on the TEAM-07 Burndown Chart Generator at tested commit `85391ae9181a666cc5b975968070e3dc5059a352`. This validation incorporates all testing-phase addendum specifications, addresses feedback on PR #48, verifies the bug fix from PR #51, retests and validates the schedule status badge styling defect SV-D-01 (fixed in `a8be0d2`), and fulfills all requirements requested by Naveen (Owner/Lead).

### Key Results Summary
- **Unit & Logic Layer Test Suite:** **411/411 passed** across 92 test suites with 0 failures in ~1000 ms using native `node --test` (recorded in `docs/reports/evidence/sv-unit-85391ae.log`).
- **Automated Browser End-to-End Suite:** **63 test records per browser** executed across all three target browser engines:
  - **Google Chrome (v156.0.8078.80):** **62 PASS, 0 FAIL, 1 BLOCKED, 0 NOT EXECUTED** (`docs/reports/evidence/sv-results-chrome-2026-11-10-85391ae.json`)
  - **Microsoft Edge (v157.0.4341.42):** **62 PASS, 0 FAIL, 1 BLOCKED, 0 NOT EXECUTED** (`docs/reports/evidence/sv-results-msedge-2026-11-10-85391ae.json`)
  - **Mozilla Firefox (v159.0 Playwright build):** **62 PASS, 0 FAIL, 1 BLOCKED, 0 NOT EXECUTED** (`docs/reports/evidence/sv-results-firefox-2026-11-10-85391ae.json`)
  - **Combined Browser Totals:** **186 PASS, 0 FAIL, 3 BLOCKED** across 189 evaluations.
- **Current Day Vertical Marker Movement:** Pixel-scanning verification via canvas `getImageData` confirmed marker draws within $\le 2$ px of expected coordinates across Days 0, 4, 6, 10, dark theme, and 1024px resize ($|\text{drawn} - \text{expected}| \le 1.13$ px max). Day 6 updates actual burndown series endpoint and KPI metrics without page reload.
- **Pure Keyboard Navigation (Group G-KB):** 100% PASS (8/8 records) operating strictly via `page.keyboard` with zero `.click()`, zero `.fill()`, and zero `.focus()` calls. Covers skip link, theme toggle, sprint configuration modal, timeline buttons and slider, add issue + duplicate rejection, edit to Done + cancel with Escape + reopen, delete + adjacent focus, and reset data.
- **Status Indicators & Color Discrimination (TC-NF-02.3 Supplemental):**
  - All status indicators render clear semantic text labels ("Ahead of Schedule", "On Track", "Behind Schedule").
  - WCAG 2.1 AA text contrast ($\ge 4.5:1$):
    - Light Theme: min 5.91:1, max 8.01:1 (Ahead 7.29:1, On Track 8.01:1, Behind 5.91:1)
    - Dark Theme: min 4.63:1, max 5.91:1 (Ahead 5.91:1, On Track 4.77:1, Behind 4.63:1)
  - Pairwise background color distance (CIE76 $\Delta E$) recorded as INFORMATIONAL metric:
    - Light Theme: min 8.0, max 11.1 (Ahead-OnTrack 9.5, Ahead-Behind 11.1, OnTrack-Behind 8.0)
    - Dark Theme: min 17.3, max 21.1 (Ahead-OnTrack 19.8, Ahead-Behind 21.1, OnTrack-Behind 17.3)
  - Visual distinctness is a human judgement verified and recorded as PASS in manual testing (SR-22: text clear, colours distinct, and perceptible under grayscale).
  - Defect SV-D-01 (CSS class selector mismatch at `e901ecf`) was fixed in `a8be0d2`, backed by regression unit tests in `tests/ui/kpiCards.test.js`, and retested across all 3 browsers.
- **Performance Updates (Method A: 10 iterations under `?perf` profiling):**
  - **Add Issue:** median 34.40 ms (Chrome) / 40.60 ms (Edge) / 53.00 ms (Firefox)
  - **Change Current Day:** median 34.60 ms (Chrome) / 36.60 ms (Edge) / 48.00 ms (Firefox)
  - **Edit Issue to Done:** median 44.30 ms (Chrome) / 42.40 ms (Edge) / 39.00 ms (Firefox)
  - **Delete Issue:** median 36.10 ms (Chrome) / 42.80 ms (Edge) / 36.00 ms (Firefox)
  - **Reset Data:** median 38.40 ms (Chrome) / 40.80 ms (Edge) / 50.00 ms (Firefox)
  - **STP Threshold (< 2000 ms):** 100% PASS with > 20x to 50x safety margin across all browsers.
- **Security & Resilience:** CSP meta tag precedes all scripts, script-src 'self', no unsafe-eval, noscript notice present, `file://` guidance warning banner visible, XSS payloads neutralized as literal text, and invalid numbers rejected without store corruption.
- **Manual Verification Status (Bhuvi `@stacktrace-bhuvi`, 2026-11-10):**
  - **Mozilla Firefox 159.0.1 (Installed Release):** **33 PASS, 0 FAIL, 0 NOT EXECUTED** (29 functional workflow test cases + 4 responsive viewports) executed against tested commit `500a4be3961103480c6274b89eddca34a219ccce` (source tree `4a2278fd1774ecfb0cb43d1e6f9b00e386b344e8`) at `http://127.0.0.1:8090/index.html` (recorded in `docs/reports/evidence/sv-manual-firefox-85391ae.md`).
  - **Screen Reader (NVDA 2026.3 on Firefox 159.0.1):** **22 PASS, 0 FAIL, 0 NOT EXECUTED** (scenarios `SR-01` through `SR-22`) executed against tested commit `500a4be3961103480c6274b89eddca34a219ccce` (source tree `4a2278fd1774ecfb0cb43d1e6f9b00e386b344e8`) at `http://127.0.0.1:8090/index.html` (recorded in `docs/reports/evidence/sv-manual-screenreader-85391ae.md`).
  - **Methodology & Integrity Notes:**
    - No screenshots were taken for manual checks.
    - For screen-reader rows where the tester recorded only `PASS`, the exact NVDA speech wording was not recorded (`Tester recorded PASS; NVDA speech wording not recorded`).
    - The responsive overflow numbers are recorded as measured (`page: 0`, `table: 0` across all tested viewports in Firefox Responsive Design Mode).
    - Formal test case `TC-F-13.2` stays **BLOCKED** pending acceptance criterion agreement with Naveen.

### Test Execution History & Audit Trail
- **Run 1 (2026-11-07, Baseline `2220896`):** Produced 48 PASS / 4 FAIL / 1 BLOCKED per browser. Detailed root-cause analysis identified 4 test-runner assertion/locator defects (`TC-F-01.1`, `TC-F-06.3`, `TC-F-09.1`, `TC-SR-03.1`). Archived in `docs/reports/evidence/superseded/`.
- **Run 2 (2026-11-07, Baseline `2220896`):** Refined runner assertions and exit code handling. Achieved 52 PASS / 0 FAIL / 1 BLOCKED across Google Chrome and Microsoft Edge.
- **Superseded Run 3a (2026-11-10, Pinned `e901ecf` label):** Multi-browser validation post-PR #51. Added marker pixel detection, keyboard navigation (`G-KB`), status indicator assertions, and addendum coverage. Ran with hardcoded SHA label `e901ecf` before runner dynamic SHA computing; superseded and preserved in `docs/reports/evidence/superseded/` without modification.
- **Run 3b (2026-11-10, Tested Commit `85391ae`):** Retest under dynamically computed commit SHA `85391ae` and verified clean repository source tree `4a2278f`. Status indicator test record labeled as supplemental (`TC-NF-02.3 (Supplemental)`) with informational $\Delta E$. TC-F-13.2 actual text detailed with exact measured page and table-wrapper overflow figures across all 8 viewport/theme configurations. Achieved **62 PASS / 0 FAIL / 1 BLOCKED / 0 NOT EXECUTED** per browser across Google Chrome, Microsoft Edge, and Mozilla Firefox (Playwright build).

---

## 2. Test Execution Results by Functional Group

The tables below reproduce the committed Run 3b JSON record IDs, steps, expected values, actual values, and statuses across all three browsers (Chrome 156, Edge 157, Firefox 159 Playwright build).

### Group G1: Default State (Baseline Pinned Day 4)
*Pinned Defaults: Total = 50, Completed = 29, Remaining = 21, Days Elapsed = 4, Days Left = 6, Variance = +9, Status = "Ahead of Schedule", Ideal(4) = 30, Actual(0..4) = [50, 45, 42, 34, 21]*

| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 Actual / Status | Edge 157 Actual / Status | Firefox 159 Actual / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-02.1** | BDC-F-002 | Open app with default dataset | Total Committed Story Points = 50 | Total Scope KPI displays 50 / **PASS** | Total Scope KPI displays 50 / **PASS** | Total Scope KPI displays 50 / **PASS** |
| **TC-F-04.1** | BDC-F-004 | Open app with default state | Exactly PROJ-101 to PROJ-110 shown with correct fields; Total = 50 | Backlog has 10 rows: PROJ-101..PROJ-110. Scope=50 / **PASS** | Backlog has 10 rows: PROJ-101..PROJ-110. Scope=50 / **PASS** | Backlog has 10 rows: PROJ-101..PROJ-110. Scope=50 / **PASS** |
| **TC-F-05.1** | BDC-F-005 | Inspect default table structure and all 10 issues | All 10 rows match SRS Appendix A across all 6 columns | All 10 rows verified: true / **PASS** | All 10 rows verified: true / **PASS** | All 10 rows verified: true / **PASS** |
| **TC-F-10.1** | BDC-F-010 | Verify ideal line series values at days 0, 4, 10 | Ideal(0)=50, Ideal(4)=30, Ideal(10)=0 | Ideal(0)=50, Ideal(4)=30, Ideal(10)=0 / **PASS** | Ideal(0)=50, Ideal(4)=30, Ideal(10)=0 / **PASS** | Ideal(0)=50, Ideal(4)=30, Ideal(10)=0 / **PASS** |
| **TC-F-11.1** | BDC-F-011 | Verify actual line series points at days 0..4 | Actual(0..4) = [50, 45, 42, 34, 21] | Actual(0..4) verified / **PASS** | Actual(0..4) verified / **PASS** | Actual(0..4) verified / **PASS** |
| **TC-F-11.2** | BDC-F-011 | Verify actual line points beyond day 4 are null | Actual(5..10) strictly null | Days 5..10 null: true / **PASS** | Days 5..10 null: true / **PASS** | Days 5..10 null: true / **PASS** |
| **TC-F-12.1** | BDC-F-012 | Verify status calculation at Day 4 (variance +9) | Status classified as "Ahead of Schedule" | Status badge = "Ahead of Schedule" / **PASS** | Status badge = "Ahead of Schedule" / **PASS** | Status badge = "Ahead of Schedule" / **PASS** |
| **TC-F-13.1** | BDC-F-013 | Verify chart axes, styles, legend, and series | Ideal dashed [6,4], Actual solid, axes styled | Chart datasets styled correctly / **PASS** | Chart datasets styled correctly / **PASS** | Chart datasets styled correctly / **PASS** |
| **TC-F-15.1** | BDC-F-015 | Read all 6 KPI cards on initial load | Total=50, Comp=29, Rem=21, Elapsed=4, Left=6, Var=+9 | All 6 cards match pinned dataset / **PASS** | All 6 cards match pinned dataset / **PASS** | All 6 cards match pinned dataset / **PASS** |

### Group G2: Sprint Configuration & Form Validation
| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 Actual / Status | Edge 157 Actual / Status | Firefox 159 Actual / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-01.1** | BDC-F-001 | Configure sprint: Name="Sprint 2", Duration=5, Start=2026-10-26, End=2026-10-30 | Config saved; chart re-renders; Duration pill="5 working days"; Day <= 5 | Config saved, duration pill = 5 working days, slider max = 5 / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-F-01.2** | BDC-F-001 | Test boundary durations (1, 60) accepted; test invalid durations (0, -3, 5.5, "abc", 61) rejected | Valid accepted; invalid rejected with visible errors; prior config retained | Boundary durations accepted, invalid rejected with state preserved / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-F-01.3** | BDC-F-001 | Enter End Date before Start Date (Start=2026-10-30, End=2026-10-26) | Rejected with visible validation message; serialized store unchanged | Error message displayed, store identical / **PASS** | Same / **PASS** | Same / **PASS** |

### Group G3: Current Day Controls & Marker Movement
| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 Actual / Status | Edge 157 Actual / Status | Firefox 159 Actual / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-03.1** | BDC-F-003 | Click Next Day button twice (Day 4 -> Day 6) | Day = 6; Actual(6) = 21, Actual(7) = null; KPIs and chart update without reload | Day 6 active, KPIs and series update without reload / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-F-03.2** | BDC-F-003 | Test Current Day invalid values (-1, 11, 2.5, "abc"); boundaries 0 and 10 | Invalid rejected; boundaries 0 and 10 accepted per addendum | Invalid rejected, boundaries 0 and 10 accepted / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-F-14.1** | BDC-F-014 | Canvas pixel column scan at Days 0, 4, 6, 10, dark theme, and 1024px resize | Marker drawn within $\le 2$ px of expected coordinates; Day 6 updates actual series | Marker moves accurately ($\le 1.13$ px), Day 6 updates series and KPIs / **PASS** | Same / **PASS** | Same / **PASS** |

### Group G4: Issue Addition
| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 Actual / Status | Edge 157 Actual / Status | Firefox 159 Actual / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-06.1** | BDC-F-006 | Add valid issue PROJ-111 (5 pts, Story, To Do) | Backlog count 11, Total Scope 55, Remaining 26 | Issue added, scope 55, remaining 26 / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-F-06.2** | BDC-F-006 | Submit duplicate key PROJ-101 and lowercase proj-101 | Rejection error displayed; duplicate issue not added | Duplicate rejected, table unmodified / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-F-06.3** | BDC-F-006 | Submit form with empty required fields | Required field validation error messages shown; issue not added | Validation messages shown for missing fields / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-F-06.4** | BDC-F-006 | Add issue ZERO-1 with Story Points = 0 | Issue added; Total Scope stays 50; no NaN/Infinity in KPIs | Zero-point issue accepted, scope remains 50 / **PASS** | Same / **PASS** | Same / **PASS** |

### Group G5: Issue Editing, Reopening & Completion
| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 Actual / Status | Edge 157 Actual / Status | Firefox 159 Actual / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-07.1** | BDC-F-007 | Edit PROJ-106 (3 pts) to Done on Day 4 | Completed = 32, Remaining = 18, Variance = +12 (Ahead of Schedule) | Completed=32, Remaining=18, Variance=+12 / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-F-07.2** | BDC-F-007 | Test Day 5 rejected at Day 4; Day 11 rejected; Day 0 rejected | Update rejected with visible message; store unmodified | Rejected with message; store unchanged / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-F-07.3** | BDC-F-007 | Reopen PROJ-106 from Done to To Do | Completed Day cleared to "--"; Completed = 29, Remaining = 21 | Status To Do, completedDay cleared, KPIs updated / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-F-15.2** | BDC-F-015 | Live KPI recalculation during edit and reopen | KPIs reflect 32 completed then return to 29 without reload | Live KPI recalculation verified / **PASS** | Same / **PASS** | Same / **PASS** |

### Group G6: Issue Deletion & Empty State
| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 Actual / Status | Edge 157 Actual / Status | Firefox 159 Actual / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-08.1** | BDC-F-008 | Delete PROJ-110 (5 pts To Do) from backlog | Row removed; Total=45, Completed=29, Remaining=16, Ideal(4)=27, Variance=+11 | Issue deleted, all 5 KPIs + Ideal series update / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-F-02.2** | BDC-F-002 | Add 5 pt issue then delete it | Total becomes 55 then returns to 50 immediately | Scope becomes 55 then 50 / **PASS** | Same / **PASS** | Same / **PASS** |
| **EDGE-EMPTY-BACKLOG** | BDC-NF-003 | Delete all issues to empty backlog | Table renders empty state notice; Total Scope = 0; no crash or NaN | Empty backlog handled safely: Total Scope 0, empty notice shown / **PASS** | Same / **PASS** | Same / **PASS** |

### Group G7: Reset Data
| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 Actual / Status | Edge 157 Actual / Status | Firefox 159 Actual / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-09.1** | BDC-F-009 | Mutate data then click Reset Data button | Exactly original 10 issues restored; Duration=10; Day=4; Total=50, Comp=29, Rem=21 | Baseline restored: 10 rows, Total=50, Comp=29, Rem=21, Day=4 / **PASS** | Same / **PASS** | Same / **PASS** |

### Group G8: Schedule Classification Tolerance Bands
| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 Actual / Status | Edge 157 Actual / Status | Firefox 159 Actual / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-12.2** | BDC-F-012 | Add 9 pt issue at Day 4 (Remaining = 30, Ideal = 30, Variance = 0) | Classified as "On Track" (-1 <= Variance <= 1) | Variance 0, status badge = "On Track" / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-F-12.3** | BDC-F-012 | Add additional 5 pt issue (Remaining = 35, Ideal = 30, Variance = -5) | Classified as "Behind Schedule" (Variance < -1) | Variance -5, status badge = "Behind Schedule" / **PASS** | Same / **PASS** | Same / **PASS** |

### Group G9: Edge Cases & Calculation Engine Resilience
| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 Actual / Status | Edge 157 Actual / Status | Firefox 159 Actual / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **EDGE-SINGLE-DAY** | BDC-SR-004 | Configure single-day sprint (Duration = 1), test Day 0 and Day 1 | Prev disabled at Day 0, Next disabled at Day 1 | Prev disabled at Day 0: true, Next disabled at Day 1: true / **PASS** | Same / **PASS** | Same / **PASS** |
| **EDGE-LONG-TEXT** | BDC-NF-004 | Add issue with 60-char key and 200-char unbroken summary | Layout wraps text safely; document has no horizontal scroll | scrollWidth <= clientWidth: true / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-F-10.2** | BDC-F-010 | Call calculateIdealSeries(50, 0) and computeAll with duration=0 | Safe fallback empty series and finite variance without NaN | Returns safe output: true / **PASS** | Same / **PASS** | Same / **PASS** |

---

## 3. Cross-Browser, Responsive & Theme Verification

Measurements across all 4 target viewports (1024, 1366, 1440, 1920 px) in Light and Dark themes for Chrome 156, Edge 157, and Firefox 159.

| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 Actual / Status | Edge 157 Actual / Status | Firefox 159 Actual / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-NF-04.2-1024px-light** | BDC-NF-004 | Viewport 1024x900, light | Page scrollWidth === clientWidth | Page overflow 0px (scrollWidth=1024, clientWidth=1024) / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-NF-04.2-1366px-light** | BDC-NF-004 | Viewport 1366x900, light | Page scrollWidth === clientWidth | Page overflow 0px (scrollWidth=1366, clientWidth=1366) / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-NF-04.2-1440px-light** | BDC-NF-004 | Viewport 1440x900, light | Page scrollWidth === clientWidth | Page overflow 0px (scrollWidth=1440, clientWidth=1440) / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-NF-04.2-1920px-light** | BDC-NF-004 | Viewport 1920x900, light | Page scrollWidth === clientWidth | Page overflow 0px (scrollWidth=1920, clientWidth=1920) / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-NF-04.2-1024px-dark** | BDC-NF-004 | Viewport 1024x900, dark | Page scrollWidth === clientWidth | Page overflow 0px (scrollWidth=1024, clientWidth=1024) / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-NF-04.2-1366px-dark** | BDC-NF-004 | Viewport 1366x900, dark | Page scrollWidth === clientWidth | Page overflow 0px (scrollWidth=1366, clientWidth=1366) / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-NF-04.2-1440px-dark** | BDC-NF-004 | Viewport 1440x900, dark | Page scrollWidth === clientWidth | Page overflow 0px (scrollWidth=1440, clientWidth=1440) / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-NF-04.2-1920px-dark** | BDC-NF-004 | Viewport 1920x900, dark | Page scrollWidth === clientWidth | Page overflow 0px (scrollWidth=1920, clientWidth=1920) / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-F-13.2** | BDC-F-013 | Verify table scrolling across 1024-1920px viewports | Chart scales and stays readable; no horizontal scrolling | 1024px (light): page overflow = 0px, table-wrapper overflow = 0px; 1366px (light): page overflow = 0px, table-wrapper overflow = 36px; 1440px (light): page overflow = 0px, table-wrapper overflow = 0px; 1920px (light): page overflow = 0px, table-wrapper overflow = 0px; 1024px (dark): page overflow = 0px, table-wrapper overflow = 0px; 1366px (dark): page overflow = 0px, table-wrapper overflow = 36px; 1440px (dark): page overflow = 0px, table-wrapper overflow = 0px; 1920px (dark): page overflow = 0px, table-wrapper overflow = 0px / **BLOCKED** | Same / **BLOCKED** | Same / **BLOCKED** |

*Note on TC-F-13.2:* Kept as **BLOCKED** per explicit instruction. Page-level horizontal overflow is strictly 0 px across all tested viewports in all three browsers. The internal `.table-wrapper` accommodates narrow viewports (e.g. 1366px split grid) via internal overflow-x scrolling (36 px at 1366px). The classification remains pending team alignment on whether internal wrapper scrolling satisfies the STP Table 9 criterion.

### Manual Mozilla Firefox Verification (v159.0.1 Installed Release)

- **QA Tester:** Bhuvi (`@stacktrace-bhuvi`)
- **Execution Date:** 2026-11-10
- **Browser & Version:** Mozilla Firefox 159.0.1 (installed release, 64-bit desktop)
- **Host OS & Build:** Microsoft Windows [Version 10.0.26200.9711]
- **Tested Commit (HEAD):** `500a4be3961103480c6274b89eddca34a219ccce`
- **Application Source Tree (HEAD:src):** `4a2278fd1774ecfb0cb43d1e6f9b00e386b344e8`
- **Tested URL:** `http://127.0.0.1:8090/index.html` (snapshot copy)
- **Total Result:** **33 PASS, 0 FAIL, 0 NOT EXECUTED** (29 functional test cases + 4 responsive viewports)
- **Traceable Run Sheet:** `docs/reports/evidence/sv-manual-firefox-85391ae.md`

#### Responsive Viewports & Themes (Firefox Responsive Design Mode `Ctrl + Shift + M`)
| Viewport | Light Theme | Dark Theme | No Page Scroll (`scrollWidth <= clientWidth`) | Table Wrapper Behavior | Status |
| :--- | :---: | :---: | :--- | :--- | :---: |
| **1024 x 900** | PASS | PASS | page: 0 | table: 0 | **PASS** |
| **1366 x 900** | PASS | PASS | page: 0 | table: 0 | **PASS** |
| **1440 x 900** | PASS | PASS | page: 0 | table: 0 | **PASS** |
| **1920 x 900** | PASS | PASS | page: 0 | table: 0 | **PASS** |

- **High-Density Text Stress Test:** Long key (60 chars) + long summary (200 chars), layout intact?: **yes** (verified without horizontal page overflow or clipping).
- **Execution & Disclosure Notes:**
  - No screenshots were taken for manual checks.
  - The responsive overflow numbers are recorded as measured (`page: 0`, `table: 0`).
  - Formal test case `TC-F-13.2` stays **BLOCKED** pending acceptance criterion agreement with Naveen.

#### Manual Functional Workflow Verification (29 Cases)
All 29 functional scenarios in groups G1–G8 were manually executed and verified on physical Firefox 159.0.1:
- **Group G1 (Default State):** `TC-F-02.1` (50 pts), `TC-F-04.1` (10 rows in order), `TC-F-05.1` (Compared 10 of 10 rows), `TC-F-10.1` (Ideal line descending linearly), `TC-F-11.1` (Actual points Day 0..4), `TC-F-13.1` (Dashed vs solid line styling), `TC-F-15.1` (50, 29, 21, 4, 6, +9 pts) — all **PASS**.
- **Group G2 (Sprint Config):** `TC-F-01.1` (Sprint 2, 5 days), `TC-F-01.2` (Duration boundaries & validation), `TC-F-01.3` (End before start rejected) — all **PASS**.
- **Group G3 (Current Day & Marker):** `TC-F-03.1` (Advance to Day 6), `TC-F-03.2` (Day 0 & 10 boundaries), `TC-F-11.2` (Nothing plotted past Day 4), `TC-F-14.1` (Red vertical marker movement) — all **PASS**.
- **Group G4 (Add Issue):** `TC-F-06.1` (Add PROJ-111), `TC-F-02.2` (Add 5 pt issue and delete), `TC-F-06.2` (Duplicate key rejection), `TC-F-06.3` (Empty form validation), `TC-F-06.4` (0 pt issue accepted without NaN) — all **PASS**.
- **Group G5 (Edit & Reopen):** `TC-F-07.1` (Edit PROJ-106 to Done on Day 4), `TC-F-15.2` (Reopen PROJ-106), `TC-F-07.2` (Invalid completion days rejected), `TC-F-07.3` (Reopen clears completion day cell to "--") — all **PASS**.
- **Group G6 (Delete & Empty Backlog):** `TC-F-08.1` (Delete PROJ-110), `TC-SR-04.1` (Delete all issues to empty state) — all **PASS**.
- **Group G7 (Reset Data):** `TC-F-09.1` (Reset Data restores baseline defaults) — **PASS**.
- **Group G8 (Status Classification):** `TC-F-12.1` (Day 4 "Ahead of Schedule"), `TC-F-12.2` (Day 6 "On Track"), `TC-F-12.3` (Day 7 "Behind Schedule") — all **PASS**.

---

## 4. Accessibility & Pure Keyboard Navigation (BDC-NF-002)

### Automated Keyboard Navigation Suite (Group G-KB)
All interactions executed strictly via `page.keyboard` (Tab, Shift+Tab, Enter, Space, Arrows, Home, End, Escape):

| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 | Edge 157 | Firefox 159 | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-NF-02.1-KB-ORDER** | BDC-NF-002 | Traverse initial DOM tab sequence (35 tabs) | Logical focus order from top of document | Focus traverses Skip -> Header -> Banner -> Controls -> Table | Same | Same | **PASS** |
| **TC-NF-02.1-KB-THEME** | BDC-NF-002 | Tab to Theme Toggle, press Space twice | Toggles Dark then Light; focus retained on button | Dark=true, Light=true, Focus="theme-toggle-btn" | Same | Same | **PASS** |
| **TC-NF-02.1-KB-SKIP** | BDC-NF-002 | Press Tab then Enter on initial load | Skip link focuses on first Tab; Enter focuses main-content | First tab="Skip to dashboard", Enter focus="main-content" | Same | Same | **PASS** |
| **TC-NF-02.1-KB-CONFIG** | BDC-NF-002 | Open Config with Enter; duration 65 rejected; 10 saved | Modal opens on sprint name; error on 65; focus returns to config button | Open focus="input-sprint-name", Error shown, Return="btn-configure-sprint" | Same | Same | **PASS** |
| **TC-NF-02.1-KB-DAY** | BDC-NF-002 | Drive slider with Home/End/Arrows & Prev/Next buttons | Prev disabled at Day 0, Next disabled at Day 10, keys navigate accurately | Prev disabled at 0=true, Next disabled at 10=true, Restored=4 | Same | Same | **PASS** |
| **TC-NF-02.1-KB-ADD** | BDC-NF-002 | Add PROJ-111 (5 pts) and duplicate key via keyboard | Valid issue added (Total=55); focus returns to key; duplicate error shown | Scope=55, Return focus="add-issue-key", Duplicate rejected=true | Same | Same | **PASS** |
| **TC-NF-02.1-KB-EDIT** | BDC-NF-002 | Edit PROJ-106 to Done; cancel Escape; reopen and save | Focus on status; Escape restores focus; points 29 -> 32 -> 29 | Open focus="edit-issue-status", Escape/Save return="Edit PROJ-106", Pts=32->29 | Same | Same | **PASS** |
| **TC-NF-02.1-KB-DELETE** | BDC-NF-002 | Delete PROJ-111 using Enter on Delete button | Issue deleted (Total=50); focus moves to adjacent delete button | Total Scope=50, Focus moved to next Delete button | Same | Same | **PASS** |
| **TC-NF-02.1-KB-RESET** | BDC-NF-002 | Tab to Reset Data button, press Enter | Canonical defaults restored (50 pts, 10 issues, Day 4); focus on Reset | Scope=50, Rows=10, Day=4, Focus="reset-data-btn" | Same | Same | **PASS** |

### Form Labels & Multi-Channel Status Discrimination
| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 Actual / Status | Edge 157 Actual / Status | Firefox 159 Actual / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-NF-02.1-SKIP** | BDC-NF-002 | Tab on load, Enter | First tab reaches skip link; Enter moves focus to #main-content | Verified / **PASS** | Verified / **PASS** | Verified / **PASS** |
| **TC-NF-02.1-FOCUS** | BDC-NF-002 | Edit PROJ-101, Escape | Focus on editor select; returns to Edit button upon Escape | Verified / **PASS** | Verified / **PASS** | Verified / **PASS** |
| **TC-NF-02.2** | BDC-NF-002 | Inspect form controls and live announcements | 100% of controls labeled; aria-live polite region active | All controls labeled: true / **PASS** | All controls labeled: true / **PASS** | All controls labeled: true / **PASS** |
| **TC-NF-02.3 (Supplemental)** | BDC-NF-002 | Inspect Schedule Status and Issue badges in Light and Dark themes (Supplemental test record for Testing Addendum) | Visible text labels present for all status states (Ahead, On Track, Behind - not communicated by color alone); text-to-background contrast ratio >= 4.5:1 per WCAG 2.1 AA in both Light and Dark themes. Background color distance (CIE76 Delta-E) recorded as INFORMATIONAL metric; final visual distinctness is a human judgement evaluated in manual testing (PENDING). | WCAG 2.1 AA text contrast (>=4.5:1): Light theme min 5.91:1, max 8.01:1 (Ahead=7.29:1, OnTrack=8.01:1, Behind=5.91:1); Dark theme min 4.63:1, max 5.91:1 (Ahead=5.91:1, OnTrack=4.77:1, Behind=4.63:1). Visible text labels verified. Informational CIE76 Delta-E: Light theme min 8.0, max 11.1 (Ahead-OnTrack=9.5, Ahead-Behind=11.1, OnTrack-Behind=8.0); Dark theme min 17.3, max 21.1 (Ahead-OnTrack=19.8, Ahead-Behind=21.1, OnTrack-Behind=17.3). Visual distinctness is a human judgement tracked as PENDING in manual check forms. / **PASS** | Same / **PASS** | Same / **PASS** |

### Physical Assistive Technology & Screen-Reader Verification (NVDA 2026.3 on Firefox 159.0.1)

- **QA Tester:** Bhuvi (`@stacktrace-bhuvi`)
- **Execution Date:** 2026-11-10
- **Assistive Technology:** NVDA 2026.3 (2026.3.0.58174) (temporary/portable)
- **Browser & Version:** Mozilla Firefox 159.0.1 (installed release)
- **Host OS & Build:** Microsoft Windows [Version 10.0.26200.9711]
- **Tested Commit (HEAD):** `500a4be3961103480c6274b89eddca34a219ccce`
- **Application Source Tree (HEAD:src):** `4a2278fd1774ecfb0cb43d1e6f9b00e386b344e8`
- **Tested URL:** `http://127.0.0.1:8090/index.html` (snapshot copy)
- **Total Result:** **22 PASS, 0 FAIL, 0 NOT EXECUTED** (22 scenarios evaluated)
- **Traceable Run Sheet:** `docs/reports/evidence/sv-manual-screenreader-85391ae.md`

#### NVDA Auditory Verification Results
| Scenario # | User Action & Element | Expected Screen Reader Speech Output | Actual Speech Output | Status |
| :--- | :--- | :--- | :--- | :---: |
| **SR-01** | Press `Tab` on initial page load (Skip Link) | "Skip to dashboard, link" | Tester recorded PASS; NVDA speech wording not recorded | **PASS** |
| **SR-02** | Press `Enter` on Skip Link | Focus shifts to `#main-content`; announces "dashboard, main" or main landmark; bypasses header | Tester recorded PASS; NVDA speech wording not recorded | **PASS** |
| **SR-03** | Navigate with `Tab` to Theme Toggle | "Switch to dark theme, button" / "Switch to light theme, button" | Tester recorded PASS; NVDA speech wording not recorded | **PASS** |
| **SR-04** | Press `Space` on Theme Toggle | Button label and theme state update announced without focus loss | Tester recorded PASS; NVDA speech wording not recorded | **PASS** |
| **SR-05** | Tab to Sprint Settings button | "Configure Sprint Parameters, button" | Tester recorded PASS; NVDA speech wording not recorded | **PASS** |
| **SR-06** | Submit Sprint Config with invalid duration | Focus moved to error alert region; announces "Please review and correct the following errors: Sprint duration cannot exceed 60 working days" | Tester recorded PASS; NVDA speech wording not recorded | **PASS** |
| **SR-07** | Tab to Current Day Range Slider | "Current Day slider, 4, minimum 0, maximum 10" | Tester recorded PASS; NVDA speech wording not recorded | **PASS** |
| **SR-08** | Press `Right Arrow` on Current Day slider | Announces incremented value "5", "6" | Tester recorded PASS; NVDA speech wording not recorded | **PASS** |
| **SR-09** | Navigate to Prev Day button at Day 0 | Announces "Move to previous day, button, disabled" (unclickable) | Tester recorded PASS; NVDA speech wording not recorded | **PASS** |
| **SR-10** | Navigate to Next Day button at Day 10 | Announces "Move to next day, button, disabled" (unclickable) | Tester recorded PASS; NVDA speech wording not recorded | **PASS** |
| **SR-11** | Inspect KPI Cards with Virtual Cursor | Reads card labels and live metrics: "Total Scope 50 story points", "Completed 29 points", "Remaining 21 points", "Schedule Status Ahead of Schedule, 9 points ahead" | Tester recorded PASS; NVDA speech wording not recorded | **PASS** |
| **SR-12** | Live KPI Updates on Data Mutation | Live region (`aria-live="polite"`) announces metric changes when idle without interrupting current reading | Tester recorded PASS; NVDA speech wording not recorded | **PASS** |
| **SR-13** | Jump to Backlog Table (`T`) | Announces table caption: "Sprint Backlog Issues, table with 6 columns and 10 rows" | Tester recorded PASS; NVDA speech wording not recorded | **PASS** |
| **SR-14** | Table Column Header Reading | Moving horizontally announces column header then cell content (e.g. "Key: PROJ-101", "Status: Done", "Completion Day: 1") | Tester recorded PASS; NVDA speech wording not recorded | **PASS** |
| **SR-15** | Add Issue Form Fields & Hints | Each form control announces its accessible label and hint text (e.g. "Issue Key required", "Duration working days 1 to 60") | Tester recorded PASS; NVDA speech wording not recorded | **PASS** |
| **SR-16** | Add Issue Submission Feedback | Live region announces: "PROJ-111 added to sprint backlog. Chart and metrics refreshed." | Tester recorded PASS; NVDA speech wording not recorded | **PASS** |
| **SR-17** | Duplicate Key Validation Error | Live alert announces: "An issue with this key already exists" | Tester recorded PASS; NVDA speech wording not recorded | **PASS** |
| **SR-18** | Edit Issue Modal Opening | Focus shifts to status select; announces "Edit PROJ-106, Status combobox, In Progress" | Tester recorded PASS; NVDA speech wording not recorded | **PASS** |
| **SR-19** | Cancel Edit with `Escape` | Modal closes; focus returns directly to "Edit PROJ-106, button" | Tester recorded PASS; NVDA speech wording not recorded | **PASS** |
| **SR-20** | Delete Issue Focus Return | Pressing Enter on Delete PROJ-111 announces deletion and focus moves to adjacent Delete button | Tester recorded PASS; NVDA speech wording not recorded | **PASS** |
| **SR-21** | Reset Data Confirmation | Announces: "Sprint data reset to default sample dataset." | Tester recorded PASS; NVDA speech wording not recorded | **PASS** |
| **SR-22** | Status badges Day 4/6/7 light + dark | Text clear, colours distinct, and perceptible under grayscale | Tester recorded PASS; NVDA speech wording not recorded | **PASS** |

- **Execution & Disclosure Notes:**
  - No screenshots were taken for manual screen-reader checks.
  - For rows where the tester recorded only `PASS`, the exact NVDA speech wording was not recorded (`Tester recorded PASS; NVDA speech wording not recorded`). All 22 test rows passed.

---

## 5. Security & Resilience

| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 Actual / Status | Edge 157 Actual / Status | Firefox 159 Actual / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-SR-01.1** | BDC-SR-001 | Injects `<script>` and `<img onerror>` into summary/key | Rendered as literal text; 0 dialogs; 0 injected script nodes | Rendered literal text, dialogs=0, injected=0 / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-SR-02.1** | BDC-SR-002 | Points = -3, "abc", Infinity; Duration = -1, 61; Day = -1, 11 | Rejected prior to storage/calc; serialized store identical | All rejected, store unchanged: true / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-NF-03.1** | BDC-NF-003 | Verify invalid inputs rejected without state corruption | Serialized store identical before and after rejected operations | Verified at data and UI layer: true / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-SR-05.1** | BDC-SR-005 | Inspect CSP tag order, unsafe-eval absence, noscript, and file:// guidance | CSP precedes scripts; script-src self; no unsafe-eval; noscript present; file:// guidance visible | CSP precedes scripts: true, script-src self: true, no unsafe-eval: true, noscript notice: true, file:// warning: visible / **PASS** | Same / **PASS** | Same / **PASS** |
| **TC-SR-03.1** | BDC-SR-003 | Call restoreFromJSON with malformed JSON and corrupted schema | Corrupted data discarded safely without crash; default dataset restored | Data layer handles corrupt state safely: true (10 default issues restored) / **PASS** | Same / **PASS** | Same / **PASS** |

---

## 6. Performance Verification (BDC-NF-001 / TC-NF-01.1)

| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 Actual / Status | Edge 157 Actual / Status | Firefox 159 Actual / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-NF-01.1** | BDC-NF-001 | 10 iterations of Add, Day, Edit, Delete, Reset under `?perf` profiling | All UI state transitions and re-render updates execute in < 2000 ms | Add: med=34.4ms; Day: med=34.6ms; Edit: med=44.3ms; Del: med=36.1ms; Reset: med=38.4ms / **PASS** | Add: med=40.6ms; Day: med=36.6ms; Edit: med=42.4ms; Del: med=42.8ms; Reset: med=40.8ms / **PASS** | Add: med=53.0ms; Day: med=48.0ms; Edit: med=39.0ms; Del: med=36.0ms; Reset: med=50.0ms / **PASS** |

### Detailed Performance Measurement Table (Method A: 10 Iterations)
All measurements captured via synchronous start timestamp to double `requestAnimationFrame` completion:

| User Interaction | STP Threshold | Google Chrome `156.0.8078.80` | Microsoft Edge `157.0.4341.42` | Mozilla Firefox `159.0 (Playwright build)` | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Add Issue** (BDC-F-006) | < 2000 ms | Min: 31.10 ms, **Med: 34.40 ms**, Max: 43.40 ms | Min: 26.20 ms, **Med: 40.60 ms**, Max: 46.90 ms | Min: 29.00 ms, **Med: 53.00 ms**, Max: 74.00 ms | **PASS** (< 75 ms) |
| **Change Current Day** (BDC-F-003) | < 2000 ms | Min: 26.90 ms, **Med: 34.60 ms**, Max: 45.40 ms | Min: 29.00 ms, **Med: 36.60 ms**, Max: 51.40 ms | Min: 35.00 ms, **Med: 48.00 ms**, Max: 105.00 ms | **PASS** (< 110 ms) |
| **Edit Issue to Done** (BDC-F-007) | < 2000 ms | Min: 28.00 ms, **Med: 44.30 ms**, Max: 55.00 ms | Min: 24.40 ms, **Med: 42.40 ms**, Max: 51.90 ms | Min: 27.00 ms, **Med: 39.00 ms**, Max: 78.00 ms | **PASS** (< 80 ms) |
| **Delete Issue** (BDC-F-008) | < 2000 ms | Min: 26.00 ms, **Med: 36.10 ms**, Max: 46.00 ms | Min: 22.40 ms, **Med: 42.80 ms**, Max: 51.80 ms | Min: 26.00 ms, **Med: 36.00 ms**, Max: 78.00 ms | **PASS** (< 80 ms) |
| **Reset Data** (BDC-F-009) | < 2000 ms | Min: 20.60 ms, **Med: 38.40 ms**, Max: 50.40 ms | Min: 24.00 ms, **Med: 40.80 ms**, Max: 46.90 ms | Min: 31.00 ms, **Med: 50.00 ms**, Max: 96.00 ms | **PASS** (< 100 ms) |

---

## 7. Inspection & Architectural Verification (BDC-NF-005)

| Record ID | Requirement | Executed Steps | Expected Result | Outcome Across All Browsers |
| :--- | :--- | :--- | :--- | :--- |
| **TC-NF-05.1** | BDC-NF-005 | Static architectural review of `src/js` | Strict module separation (data, logic, UI); 0 circular imports | Verified: `src/js/logic` (pure calculations), `src/js/data` (state management), `src/js/ui` (DOM rendering). Circular dependency count = 0. / **PASS** |
| **TC-NF-05.2** | BDC-NF-005 | Execute `node --test` on logic modules | Calculation and validation execute independently without DOM | Automated unit suite executed: **411/411 tests passing in ~1000 ms** (raw log `sv-unit-85391ae.log`). / **PASS** |

---

## 8. Defects, Observations & Audit Trail

1. **Defect SV-D-01 (Schedule Status Badge CSS Selector Mismatch - FIXED):**
   - Discovered during automated status-indicator testing at `e901ecf`: `src/js/ui/kpiCards.js` renders `.status-badge.status--ahead`, `.status--on-track`, `.status--behind`, whereas `src/css/styles.css` only defined rules for `.badge-ahead`, `.badge-ontrack`, `.badge-behind`.
   - Result: badges had transparent backgrounds (`rgba(0, 0, 0, 0)`) and unstyled text colors (`rgb(15, 23, 42)` in light theme, `rgb(249, 250, 251)` in dark theme) across all three schedule states.
   - Fixed in commit `a8be0d2`, backed by strengthened regression unit tests in `tests/ui/kpiCards.test.js`, and retested with full before/after evidence (`sv-defect-sv-d-01-before.json`, `sv-defect-sv-d-01-after.json`, and 12 screenshots). Verified PASS across all 3 browsers.
2. **Resolution of OBS-07 (Report Discrepancies & Traceability):**
   - In Run 1, certain prose table rows paraphrased messages or had slight labeling differences compared to STP Table 9.
   - Comprehensive audit file `docs/reports/evidence/sv-report-label-audit-85391ae.md` created with 1-to-1 mapping for all 44 STP cases to JSON record IDs, runner assertions, and coverage statuses.
3. **Table Scroll Criterion Ambiguity (OBS-01 / TC-F-13.2):**
   - STP Table 9 requires *"no horizontal scrolling"*, whereas `sprint2_naveen_checklist.md` clarifies that internal backlog table scrolling within `.table-wrapper` is acceptable on narrow viewports.
   - Status remains explicitly **BLOCKED** pending team confirmation. Page-level horizontal overflow is 0 px at all viewports in all three browsers; internal table overflow is 36 px at 1366 px.
4. **Duration Shortening History Retention (OBS-03):**
   - Shortening sprint duration preserves Done issues with `completedDay > duration` in the backlog table, while the Completed Points KPI counts only `days <= duration`. Verified as intentional application design.
5. **Test Runner Framework Reference (OBS-04 / TC-NF-05.2):**
   - STP references Jest; repository uses native Node.js test runner (`node --test`). Addendum documents this operational update.

---

## 9. Evidence Artifacts Index

All evidence files generated during System Validation are committed in `docs/reports/evidence/`:

- **Execution Logs & Results:**
  - `docs/reports/evidence/sv-results-chrome-2026-11-10-85391ae.json` (63 records: 62 PASS, 0 FAIL, 1 BLOCKED)
  - `docs/reports/evidence/sv-run-chrome-2026-11-10-85391ae.log`
  - `docs/reports/evidence/sv-results-msedge-2026-11-10-85391ae.json` (63 records: 62 PASS, 0 FAIL, 1 BLOCKED)
  - `docs/reports/evidence/sv-run-msedge-2026-11-10-85391ae.log`
  - `docs/reports/evidence/sv-results-firefox-2026-11-10-85391ae.json` (63 records: 62 PASS, 0 FAIL, 1 BLOCKED)
  - `docs/reports/evidence/sv-run-firefox-2026-11-10-85391ae.log`
  - `docs/reports/evidence/sv-unit-85391ae.log` (411/411 unit tests raw log)
- **Defects & Discrepancies Evidence:**
  - `docs/reports/evidence/sv-system-validation-defects.md` (1 fixed defect SV-D-01, 4 observations OBS-01..OBS-04)
  - `docs/reports/evidence/sv-defect-sv-d-01-before.json` / `sv-defect-sv-d-01-after.json`
  - Before/after status badge screenshots at Days 4, 6, 7 in Light and Dark themes
- **Traceability & Manual Sheets:**
  - `docs/reports/evidence/sv-report-label-audit-85391ae.md` (All 44 STP cases mapped)
  - `docs/reports/evidence/sv-manual-firefox-85391ae.md` (Manual Firefox execution sheet: 33 PASS, 0 FAIL, 0 NOT EXECUTED)
  - `docs/reports/evidence/sv-manual-screenreader-85391ae.md` (Screen-reader execution sheet: 22 PASS, 0 FAIL, 0 NOT EXECUTED; 22 rows without verbatim speech wording)
  - `docs/reports/evidence/superseded/` (Archived Run 1, Run 2, and Run 3a records)
- **High-Resolution Screenshots:**
  - Canvas Marker Verification: `sv-marker-day0-*`, `sv-marker-day4-*`, `sv-marker-day6-*`, `sv-marker-day10-*` (Chrome, Edge, Firefox)
  - Status Indicators: `sv-status-ahead-*`, `sv-status-ontrack-*`, `sv-status-behind-*` (Chrome, Edge, Firefox)
  - Viewports (1024, 1366, 1440, 1920px in Light & Dark): `sv-responsive-*` (Chrome, Edge, Firefox)
  - Functional Workflows: `sv-g1-default-state-*`, `sv-g2-config-valid-*`, `sv-g2-config-error-*`, `sv-g3-day6-*`, `sv-g4-add-issue-*`, `sv-g5-edit-done-*`, `sv-g6-delete-*`, `sv-g6-empty-backlog-*`, `sv-g7-reset-*`, `sv-g8-ontrack-*`, `sv-g8-behind-*`, `sv-sec-xss-*`

---

## 10. Conclusion & Recommendation

System Validation Run 3b on commit `85391ae9181a666cc5b975968070e3dc5059a352` achieves **62 PASS, 0 FAIL, 1 BLOCKED, 0 NOT EXECUTED** per browser across Google Chrome, Microsoft Edge, and Mozilla Firefox (186 PASS / 0 FAIL / 3 BLOCKED total across automated engines).

Physical manual testing completed by Bhuvi (`@stacktrace-bhuvi`) on desktop Mozilla Firefox 159.0.1 (**33 PASS, 0 FAIL, 0 NOT EXECUTED**) and NVDA 2026.3 screen reader (**22 PASS, 0 FAIL, 0 NOT EXECUTED**) against commit `500a4be3961103480c6274b89eddca34a219ccce` (source tree `4a2278fd1774ecfb0cb43d1e6f9b00e386b344e8`).

The single BLOCKED case (`TC-F-13.2`) remains isolated to specification ambiguity regarding internal table scrolling versus strict viewport overflow, and has zero impact on core burndown calculation or UI stability. All unit tests pass (411/411). Defect SV-D-01 is verified fixed and covered by regression testing.

This report is delivered as complete testing-phase evidence for PR review into `develop`.
