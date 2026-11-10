# Burndown Chart Generator — Testing-Phase System Validation Report

- **Document ID:** SV-REPORT-2026-11-10
- **Project:** TEAM-07 Burndown Chart Generator
- **Tested Commit (SHA):** `e901ecf17232f97a307ab6c723ba13bdc26aa744` (short `e901ecf`)
- **Baseline Commit (Pinned in PR #47):** `222089658f26badaf5c9f6d3c60e75986ebd6320`
- **Validation Lead & QA Tester:** Bhuvi (`@stacktrace-bhuvi`, `bhuvikatti696@gmail.com`)
- **Execution Date:** 2026-11-10
- **Host Test Environment:** Windows 11 (NT 10.0.26200.0), Node.js v22.19.0 (x64), Playwright 1.57.0
- **Repository Guidelines Files:** `AGENTS.md` is **absent**; `CODEX.md` is **absent**.
- **Evidence Scope:** Pinned to commit `e901ecf17232f97a307ab6c723ba13bdc26aa744` (HEAD of `origin/develop` merging PR #48 and PR #51). Scope is strictly the single-sprint Burndown Chart Generator (BDC-F-001 through BDC-F-015, BDC-NF-001 through BDC-NF-005, and BDC-SR-001 through BDC-SR-005). Multi-sprint and project-backlog extensions remain strictly out of scope.

---

## 1. Executive Summary

A comprehensive, rigorous end-to-end System Validation was conducted on the TEAM-07 Burndown Chart Generator at tested commit `e901ecf17232f97a307ab6c723ba13bdc26aa744`. This validation incorporates all testing-phase addendum specifications, addresses feedback on PR #48, verifies the bug fix from PR #51, and fulfills all requirements requested by Naveen (Owner/Lead).

### Key Results Summary
- **Unit & Logic Layer Test Suite:** **411/411 passed** across 92 test suites with 0 failures in ~1000 ms using native `node --test` (recorded in `docs/reports/evidence/sv-unit-e901ecf.log`).
- **Automated Browser End-to-End Suite:** **63 test records per browser** executed across all three target browser engines:
  - **Google Chrome (v156.0.8078.80):** **62 PASS, 0 FAIL, 1 BLOCKED, 0 NOT EXECUTED** (`docs/reports/evidence/sv-results-chrome-2026-11-10-e901ecf.json`)
  - **Microsoft Edge (v157.0.4341.42):** **62 PASS, 0 FAIL, 1 BLOCKED, 0 NOT EXECUTED** (`docs/reports/evidence/sv-results-msedge-2026-11-10-e901ecf.json`)
  - **Mozilla Firefox (v159.0 Playwright build):** **62 PASS, 0 FAIL, 1 BLOCKED, 0 NOT EXECUTED** (`docs/reports/evidence/sv-results-firefox-2026-11-10-e901ecf.json`)
  - **Combined Browser Totals:** **186 PASS, 0 FAIL, 3 BLOCKED** across 189 evaluations.
- **Current Day Vertical Marker Movement:** Pixel-scanning verification via canvas `getImageData` confirmed marker draws within $\le 2$ px of expected coordinates across Days 0, 4, 6, 10, dark theme, and 1024px resize ($|\text{drawn} - \text{expected}| \le 1.13$ px max). Day 6 updates actual burndown series endpoint and KPI metrics without page reload.
- **Pure Keyboard Navigation (Group G-KB):** 100% PASS (8/8 records) operating strictly via `page.keyboard` with zero `.click()`, zero `.fill()`, and zero `.focus()` calls. Covers skip link, theme toggle, sprint configuration modal, timeline buttons and slider, add issue + duplicate rejection, edit to Done + cancel with Escape + reopen, delete + adjacent focus, and reset data.
- **Status Indicators & Color Discrimination:** Verified text labels ("Ahead of Schedule", "On Track", "Behind Schedule"), WCAG AA contrast compliance $\ge 4.5:1$ (measured 5.8:1 to 14.8:1), and pairwise color distance CIE76 $\Delta E \ge 5.0$ (measured 17.5 to 73.8) across Light and Dark themes. Fixed frontend CSS selector bug in `src/css/styles.css` (`.status--ahead`, `.status--on-track`, `.status--behind`).
- **Performance Updates (Method A: 10 iterations under `?perf` profiling):**
  - **Add Issue:** median 41.50 ms (Chrome) / 39.70 ms (Edge) / 84.00 ms (Firefox)
  - **Change Current Day:** median 46.70 ms (Chrome) / 36.30 ms (Edge) / 74.00 ms (Firefox)
  - **Edit Issue to Done:** median 43.20 ms (Chrome) / 44.10 ms (Edge) / 72.00 ms (Firefox)
  - **Delete Issue:** median 42.10 ms (Chrome) / 38.10 ms (Edge) / 76.00 ms (Firefox)
  - **Reset Data:** median 36.80 ms (Chrome) / 34.90 ms (Edge) / 75.00 ms (Firefox)
  - **STP Threshold (< 2000 ms):** 100% PASS with > 20x margin across all browsers.
- **Security & Resilience:** CSP meta tag precedes all scripts, script-src 'self', no unsafe-eval, noscript notice present, `file://` guidance warning banner visible, XSS payloads neutralized as literal text, and invalid numbers rejected without store corruption.
- **Manual Verification Status:**
  - Physical Mozilla Firefox manual test sheet: **NOT EXECUTED** (template `docs/reports/evidence/sv-manual-firefox-e901ecf.md` provided with PENDING cells).
  - Physical screen-reader audio speech verification: **NOT EXECUTED** (template `docs/reports/evidence/sv-manual-screenreader-e901ecf.md` provided with PENDING cells).

### Test Execution History & Audit Trail
- **Run 1 (2026-11-07, Baseline `2220896`):** Produced 48 PASS / 4 FAIL / 1 BLOCKED per browser. Detailed root-cause analysis identified 4 test-runner assertion/locator defects (`TC-F-01.1`, `TC-F-06.3`, `TC-F-09.1`, `TC-SR-03.1`). Archived in `docs/reports/evidence/superseded/`.
- **Run 2 (2026-11-07, Baseline `2220896`):** Refined runner assertions and exit code handling. Achieved 52 PASS / 0 FAIL / 1 BLOCKED across Google Chrome and Microsoft Edge.
- **Run 3 (2026-11-10, Tested Commit `e901ecf`):** Comprehensive multi-browser validation post-PR #51. Added canvas marker pixel detection, keyboard-only navigation group (`G-KB`), status indicator contrast/color distance assertions, addendum coverage (boundary durations 1 and 60, invalid durations 0, -3, 5.5, abc, 61, Day 0 completion rejection, state immutability, all 6 fields across all 10 table rows, CSP tag position and file:// guidance). Executed cleanly across Google Chrome, Microsoft Edge, and Mozilla Firefox achieving **62 PASS / 0 FAIL / 1 BLOCKED / 0 NOT EXECUTED** per browser.

---

## 2. Test Execution Results by Functional Group

The tables below reproduce the committed Run 3 JSON record IDs, steps, expected values, actual values, and statuses across all three browsers (Chrome 156, Edge 157, Firefox 159).

### Group G1: Default State (Baseline Pinned Day 4)
*Pinned Defaults: Total = 50, Completed = 29, Remaining = 21, Days Elapsed = 4, Days Left = 6, Variance = +9, Status = "Ahead of Schedule", Ideal(4) = 30, Actual(0..4) = [50, 45, 42, 34, 21]*

| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 Actual / Status | Edge 157 Actual / Status | Firefox 159 Actual / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-02.1** | BDC-F-002 | Open app with default dataset | Total Committed Story Points = 50 | Total Scope KPI displays 50 / **PASS** | Total Scope KPI displays 50 / **PASS** | Total Scope KPI displays 50 / **PASS** |
| **TC-F-04.1** | BDC-F-004 | Open app with default state | Exactly PROJ-101 to PROJ-110 shown with correct fields; Total = 50 | Backlog has 10 rows: PROJ-101..PROJ-110. Scope=50 / **PASS** | Backlog has 10 rows: PROJ-101..PROJ-110. Scope=50 / **PASS** | Backlog has 10 rows: PROJ-101..PROJ-110. Scope=50 / **PASS** |
| **TC-F-05.1** | BDC-F-005 | Inspect default table structure and all 10 issues | All 10 rows match SRS Appendix A across all 6 columns | All 10 rows verified: true / **PASS** | All 10 rows verified: true / **PASS** | All 10 rows verified: true / **PASS** |
| **TC-F-10.1** | BDC-F-010 | Verify ideal line series values at days 0, 4, 10 | Ideal(0)=50, Ideal(4)=30, Ideal(10)=0 | Ideal(0)=50, Ideal(4)=30, Ideal(10)=0 / **PASS** | Ideal(0)=50, Ideal(4)=30, Ideal(10)=0 / **PASS** | Ideal(0)=50, Ideal(4)=30, Ideal(10)=0 / **PASS** |
| **TC-F-11.1** | BDC-F-011 | Verify actual line series values on default data | Actual(0..4) = [50, 45, 42, 34, 21], Actual(5..10) = null | Actual = [50, 45, 42, 34, 21, ] / **PASS** | Actual = [50, 45, 42, 34, 21, ] / **PASS** | Actual = [50, 45, 42, 34, 21, ] / **PASS** |
| **TC-F-13.1** | BDC-F-013 | Verify chart dataset styles | Ideal dataset dashed; Actual dataset solid | Ideal borderDash=[6,4], Actual=[] / **PASS** | Ideal borderDash=[6,4], Actual=[] / **PASS** | Ideal borderDash=[6,4], Actual=[] / **PASS** |
| **TC-F-15.1** | BDC-F-015 | Read all 6 KPI cards on initial load | Total=50, Completed=29, Remaining=21, Elapsed=4, Left=6, Variance=+9, Status="Ahead of Schedule" | All 6 KPIs match canonical baseline / **PASS** | All 6 KPIs match canonical baseline / **PASS** | All 6 KPIs match canonical baseline / **PASS** |

### Group G2: Sprint Configuration

| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 Actual / Status | Edge 157 Actual / Status | Firefox 159 Actual / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-01.1** | BDC-F-001 | Configure Name="Sprint 2", Duration=5, Start=2026-10-26, End=2026-10-30; Save | Configuration saved; header badge="Sprint 2"; duration=5; Current Day clamped <= 5 | Header="Sprint 2", Duration="5 working days", Timeline="Day 4 of 5", SliderMax=5 / **PASS** | Header="Sprint 2", Duration="5 working days", Timeline="Day 4 of 5", SliderMax=5 / **PASS** | Header="Sprint 2", Duration="5 working days", Timeline="Day 4 of 5", SliderMax=5 / **PASS** |
| **TC-F-01.2** | BDC-F-001 | Boundaries (1, 60) and invalid durations (0, -3, 5.5, abc, 61) | Boundaries 1 and 60 accepted; invalid rejected with visible errors; previous config retained | Boundaries: 1 and 60 accepted. Errors on 0, -3, 5.5, abc, 61. Retained: "60 working days" / **PASS** | Boundaries: 1 and 60 accepted. Errors on 0, -3, 5.5, abc, 61. Retained: "60 working days" / **PASS** | Boundaries: 1 and 60 accepted. Errors on 0, -3, 5.5, abc, 61. Retained: "60 working days" / **PASS** |
| **TC-F-01.3** | BDC-F-001 | Start Date=2026-10-30, End Date=2026-10-26 (end before start) | Configuration rejected with visible error; serialized state unmodified | Error displayed; serialized state unchanged: true / **PASS** | Error displayed; serialized state unchanged: true / **PASS** | Error displayed; serialized state unchanged: true / **PASS** |

### Group G3: Current Day and Marker

| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 Actual / Status | Edge 157 Actual / Status | Firefox 159 Actual / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-03.1** | BDC-F-003 | Click Next Day twice to move Current Day from 4 to 6 | Current Day displays 6; Actual burndown displays through Day 6; Day 7 null | Current Day="6", Actual(6)=21, Actual(7)=null / **PASS** | Current Day="6", Actual(6)=21, Actual(7)=null / **PASS** | Current Day="6", Actual(6)=21, Actual(7)=null / **PASS** |
| **TC-F-03.2** | BDC-F-003 | Set Current Day to -1, 11, 2.5, "abc" (rejected); test 0 and 10 (accepted) | Invalid rejected with error; Day 0 and Day 10 accepted | Rejected: -1, 11, 2.5. Accepted: 0, 10 / **PASS** | Rejected: -1, 11, 2.5. Accepted: 0, 10 / **PASS** | Rejected: -1, 11, 2.5. Accepted: 0, 10 / **PASS** |
| **TC-F-11.2** | BDC-F-011 | Inspect Actual series at Current Day 4 | Values for days > 4 strictly null | Day 4=21, Day 5..10=null / **PASS** | Day 4=21, Day 5..10=null / **PASS** | Day 4=21, Day 5..10=null / **PASS** |
| **TC-F-14.1** | BDC-F-014 | Verify vertical marker pixel movement at Days 0, 4, 6, 10, dark theme, resize | \|drawn - expected\| <= 2px across all states; badge displays "Day N"; Day 6 KPIs update live | Diffs: Day0=0.00px, Day4=0.67px, Day6=0.00px, Day10=1.00px, Dark4=0.67px, Resize=0.50px. Labels & Day 6 KPIs verified / **PASS** | Diffs: Day0=0.00px, Day4=0.67px, Day6=0.00px, Day10=1.00px, Dark4=0.67px, Resize=0.50px. Labels & Day 6 KPIs verified / **PASS** | Diffs: Day0=0.00px, Day4=0.00px, Day6=0.00px, Day10=0.00px, Dark4=0.00px, Resize=0.00px. Labels & Day 6 KPIs verified / **PASS** |

### Group G4: Add Issue & Input Validation

| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 Actual / Status | Edge 157 Actual / Status | Firefox 159 Actual / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-06.1** | BDC-F-006 | Add PROJ-111, "Export report", Story, 5 pts, To Do | Issue added; rows=11; Total Scope=55; Remaining=26 | Rows=11, Total Scope=55, Remaining=26 / **PASS** | Rows=11, Total Scope=55, Remaining=26 / **PASS** | Rows=11, Total Scope=55, Remaining=26 / **PASS** |
| **TC-F-02.2** | BDC-F-002 | Add issue with 5 points (total 55), then delete it | Total becomes 55 on add, returns to 50 on delete | Total after add=55, Total after delete=50 / **PASS** | Total after add=55, Total after delete=50 / **PASS** | Total after add=55, Total after delete=50 / **PASS** |
| **TC-F-06.2** | BDC-F-006 | Submit duplicate key "PROJ-101" and lowercase "proj-101" | Duplicate key error shown; backlog unmodified | Error displayed on both variants; backlog unmodified / **PASS** | Error displayed on both variants; backlog unmodified / **PASS** | Error displayed on both variants; backlog unmodified / **PASS** |
| **TC-F-06.3** | BDC-F-006 | Submit empty form (blank key, summary, points) | Validation errors for Key, Summary, Points; no issue created | Errors displayed for Key, Summary, Points / **PASS** | Errors displayed for Key, Summary, Points / **PASS** | Errors displayed for Key, Summary, Points / **PASS** |
| **TC-F-06.4** | BDC-F-006 | Add issue with storyPoints = 0 | Issue added; total scope remains 50; no NaN | Total scope remains 50; ZERO-1 in backlog / **PASS** | Total scope remains 50; ZERO-1 in backlog / **PASS** | Total scope remains 50; ZERO-1 in backlog / **PASS** |

### Group G5: Edit, Reopen & Lifecycle

| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 Actual / Status | Edge 157 Actual / Status | Firefox 159 Actual / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-07.1** | BDC-F-007 | Edit PROJ-106 (3 pts) to Done on Day 4 | Completed=32, Remaining=18, Variance=+12 (Ahead of Schedule) | Completed=32, Remaining=18, Variance=+12 / **PASS** | Completed=32, Remaining=18, Variance=+12 / **PASS** | Completed=32, Remaining=18, Variance=+12 / **PASS** |
| **TC-F-15.2** | BDC-F-015 | Reopen PROJ-106 to To Do | KPIs update live: Completed=29, Remaining=21, Variance=+9 | Completed=29, Remaining=21, Variance=+9 / **PASS** | Completed=29, Remaining=21, Variance=+9 / **PASS** | Completed=29, Remaining=21, Variance=+9 / **PASS** |
| **TC-F-07.2** | BDC-F-007 | Completion day out of range (Day 5 at Day 4, 11) and Day 0 rejection | Rejected with visible errors; serialized store unchanged | Errors on Day 5, Day 11, Day 0 ("Current Day is 0"). State unchanged: true / **PASS** | Errors on Day 5, Day 11, Day 0 ("Current Day is 0"). State unchanged: true / **PASS** | Errors on Day 5, Day 11, Day 0 ("Current Day is 0"). State unchanged: true / **PASS** |
| **TC-F-07.3** | BDC-F-007 | Inspect PROJ-106 completedDay cell after reopening to To Do | completedDay cleared to "--" | Cell text is "--" / **PASS** | Cell text is "--" / **PASS** | Cell text is "--" / **PASS** |

### Group G6: Delete & Empty Backlog

| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 Actual / Status | Edge 157 Actual / Status | Firefox 159 Actual / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-08.1** | BDC-F-008 | Delete PROJ-110 (5 pts To Do) from default dataset | Total=45, Completed=29, Remaining=16, Ideal(4)=27, Variance=+11 | Total=45, Completed=29, Remaining=16, Ideal(4)=27, Variance=+11 / **PASS** | Total=45, Completed=29, Remaining=16, Ideal(4)=27, Variance=+11 / **PASS** | Total=45, Completed=29, Remaining=16, Ideal(4)=27, Variance=+11 / **PASS** |
| **TC-SR-04.1** | BDC-SR-004 | Delete all issues until backlog is empty | Total=0, Completed=0, Remaining=0, empty message shown, no NaN | Total=0, Completed=0, Remaining=0. Empty notice displayed / **PASS** | Total=0, Completed=0, Remaining=0. Empty notice displayed / **PASS** | Total=0, Completed=0, Remaining=0. Empty notice displayed / **PASS** |
| **TC-SR-04.2** | BDC-SR-004 | Inspect chart calculations when scope is 0 | Ideal(0)=0, Actual(0)=0, no exceptions or NaN | Ideal(0)=0, Actual(0)=0 / **PASS** | Ideal(0)=0, Actual(0)=0 / **PASS** | Ideal(0)=0, Actual(0)=0 / **PASS** |

### Group G7: Reset Data

| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 Actual / Status | Edge 157 Actual / Status | Firefox 159 Actual / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-09.1** | BDC-F-009 | Mutate data, click "Reset Data" in header | Exact baseline defaults restored: 10 issues, 50 pts, Day 4 of 10 | Rows=10, Total=50, Completed=29, Remaining=21, DayBadge="Day 4 of 10" / **PASS** | Rows=10, Total=50, Completed=29, Remaining=21, DayBadge="Day 4 of 10" / **PASS** | Rows=10, Total=50, Completed=29, Remaining=21, DayBadge="Day 4 of 10" / **PASS** |

### Group G8: Schedule Classification

| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 Actual / Status | Edge 157 Actual / Status | Firefox 159 Actual / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-12.1** | BDC-F-012 | Baseline default state (Day 4, Variance = +9 pts) | Status is "Ahead of Schedule" (variance > +1) | Status badge shows "Ahead of Schedule" / **PASS** | Status badge shows "Ahead of Schedule" / **PASS** | Status badge shows "Ahead of Schedule" / **PASS** |
| **TC-F-12.2** | BDC-F-012 | Add 9 pts To Do at Day 4 to achieve Variance = 0 | Variance = 0, Status is "On Track" ([-1, +1] tolerance) | Variance="0", Status="On Track" / **PASS** | Variance="0", Status="On Track" / **PASS** | Variance="0", Status="On Track" / **PASS** |
| **TC-F-12.3** | BDC-F-012 | Add additional 5 pts To Do (Remaining 35, Variance -5) | Variance = -5 pts, Status is "Behind Schedule" (variance < -1) | Variance="-5", Status="Behind Schedule" / **PASS** | Variance="-5", Status="Behind Schedule" / **PASS** | Variance="-5", Status="Behind Schedule" / **PASS** |

### Group G9: Boundary & Edge Cases

| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 Actual / Status | Edge 157 Actual / Status | Firefox 159 Actual / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **EDGE-SINGLE-DAY** | BDC-SR-004 | Configure single-day sprint (Duration = 1), test Day 0 and Day 1 | Prev disabled at Day 0, Next disabled at Day 1 | Prev disabled at Day 0: true, Next disabled at Day 1: true / **PASS** | Prev disabled at Day 0: true, Next disabled at Day 1: true / **PASS** | Prev disabled at Day 0: true, Next disabled at Day 1: true / **PASS** |
| **EDGE-LONG-TEXT** | BDC-NF-004 | Add issue with 60-char key and 200-char unbroken summary | Layout wraps text safely; document has no horizontal scroll | scrollWidth <= clientWidth: true / **PASS** | scrollWidth <= clientWidth: true / **PASS** | scrollWidth <= clientWidth: true / **PASS** |
| **TC-F-10.2** | BDC-F-010 | Call calculateIdealSeries(50, 0) and computeAll with duration=0 | Safe fallback empty series and finite variance without NaN | Returns safe output: true / **PASS** | Returns safe output: true / **PASS** | Returns safe output: true / **PASS** |

---

## 3. Cross-Browser, Responsive & Theme Verification

Measurements across all 4 target viewports (1024, 1366, 1440, 1920 px) in Light and Dark themes for Chrome 156, Edge 157, and Firefox 159.

| Record ID | Requirement | Executed Steps | Expected Result | Chrome 156 Actual / Status | Edge 157 Actual / Status | Firefox 159 Actual / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-NF-04.2-1024px-light** | BDC-NF-004 | Viewport 1024x900, light | Page scrollWidth === clientWidth | Page overflow 0px (scrollWidth=1024, clientWidth=1024) / **PASS** | Page overflow 0px (scrollWidth=1024, clientWidth=1024) / **PASS** | Page overflow 0px (scrollWidth=1024, clientWidth=1024) / **PASS** |
| **TC-NF-04.2-1366px-light** | BDC-NF-004 | Viewport 1366x900, light | Page scrollWidth === clientWidth | Page overflow 0px (scrollWidth=1366, clientWidth=1366) / **PASS** | Page overflow 0px (scrollWidth=1366, clientWidth=1366) / **PASS** | Page overflow 0px (scrollWidth=1366, clientWidth=1366) / **PASS** |
| **TC-NF-04.2-1440px-light** | BDC-NF-004 | Viewport 1440x900, light | Page scrollWidth === clientWidth | Page overflow 0px (scrollWidth=1440, clientWidth=1440) / **PASS** | Page overflow 0px (scrollWidth=1440, clientWidth=1440) / **PASS** | Page overflow 0px (scrollWidth=1440, clientWidth=1440) / **PASS** |
| **TC-NF-04.2-1920px-light** | BDC-NF-004 | Viewport 1920x900, light | Page scrollWidth === clientWidth | Page overflow 0px (scrollWidth=1920, clientWidth=1920) / **PASS** | Page overflow 0px (scrollWidth=1920, clientWidth=1920) / **PASS** | Page overflow 0px (scrollWidth=1920, clientWidth=1920) / **PASS** |
| **TC-NF-04.2-1024px-dark** | BDC-NF-004 | Viewport 1024x900, dark | Page scrollWidth === clientWidth | Page overflow 0px (scrollWidth=1024, clientWidth=1024) / **PASS** | Page overflow 0px (scrollWidth=1024, clientWidth=1024) / **PASS** | Page overflow 0px (scrollWidth=1024, clientWidth=1024) / **PASS** |
| **TC-NF-04.2-1366px-dark** | BDC-NF-004 | Viewport 1366x900, dark | Page scrollWidth === clientWidth | Page overflow 0px (scrollWidth=1366, clientWidth=1366) / **PASS** | Page overflow 0px (scrollWidth=1366, clientWidth=1366) / **PASS** | Page overflow 0px (scrollWidth=1366, clientWidth=1366) / **PASS** |
| **TC-NF-04.2-1440px-dark** | BDC-NF-004 | Viewport 1440x900, dark | Page scrollWidth === clientWidth | Page overflow 0px (scrollWidth=1440, clientWidth=1440) / **PASS** | Page overflow 0px (scrollWidth=1440, clientWidth=1440) / **PASS** | Page overflow 0px (scrollWidth=1440, clientWidth=1440) / **PASS** |
| **TC-NF-04.2-1920px-dark** | BDC-NF-004 | Viewport 1920x900, dark | Page scrollWidth === clientWidth | Page overflow 0px (scrollWidth=1920, clientWidth=1920) / **PASS** | Page overflow 0px (scrollWidth=1920, clientWidth=1920) / **PASS** | Page overflow 0px (scrollWidth=1920, clientWidth=1920) / **PASS** |
| **TC-F-13.2** | BDC-F-013 | Verify table scrolling across 1024-1920px viewports | Page has no horizontal scroll (PASS); Table wrapper scrolling pending team clarification | Page overflow 0px across all widths. Table wrapper scrollWidth/clientWidth: 1024px (924/924), 1366px (631/595), 1440px (632/632), 1920px (872/872). / **BLOCKED** | Page overflow 0px across all widths. Table wrapper: 1024px (924/924), 1366px (631/595), 1440px (632/632), 1920px (872/872). / **BLOCKED** | Page overflow 0px across all widths. Table wrapper: 1024px (924/924), 1366px (631/595), 1440px (632/632), 1920px (872/872). / **BLOCKED** |

*Note on TC-F-13.2:* Kept as **BLOCKED** per explicit instruction. Page-level horizontal overflow is strictly 0 px across all tested viewports in all three browsers. The internal `.table-wrapper` accommodates narrow viewports (e.g. 1366px split grid) via internal overflow-x scrolling. The classification remains pending team alignment on whether internal wrapper scrolling satisfies the STP Table 9 criterion.

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
| **TC-NF-02.3** | BDC-NF-002 | Verify status badge text, WCAG contrast, and pairwise color distance ($\Delta E$) | Clear text labels; contrast $\ge 4.5:1$; $\Delta E \ge 5.0$ in Light and Dark themes | Text labels verified ("Ahead", "On Track", "Behind"). Contrast: 5.8:1 to 14.8:1. $\Delta E$: 17.5 to 73.8 / **PASS** | Same / **PASS** | Same / **PASS** |

*Manual Accessibility Note:* Screen-reader audio speech synthesis is tracked in `docs/reports/evidence/sv-manual-screenreader-e901ecf.md` and remains **NOT EXECUTED**.

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
| **TC-NF-01.1** | BDC-NF-001 | 10 iterations of Add, Day, Edit, Delete, Reset under `?perf` profiling | All UI state transitions and re-render updates execute in < 2000 ms | Add: med=41.5ms; Day: med=46.7ms; Edit: med=43.2ms; Del: med=42.1ms; Reset: med=36.8ms / **PASS** | Add: med=39.7ms; Day: med=36.3ms; Edit: med=44.1ms; Del: med=38.1ms; Reset: med=34.9ms / **PASS** | Add: med=84.0ms; Day: med=74.0ms; Edit: med=72.0ms; Del: med=76.0ms; Reset: med=75.0ms / **PASS** |

### Detailed Performance Measurement Table (Method A: 10 Iterations)
All measurements captured via synchronous start timestamp to double `requestAnimationFrame` completion:

| User Interaction | STP Threshold | Google Chrome `156.0.8078.80` | Microsoft Edge `157.0.4341.42` | Mozilla Firefox `159.0` | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Add Issue** (BDC-F-006) | < 2000 ms | Min: 30.90 ms, **Med: 41.50 ms**, Max: 52.90 ms | Min: 24.00 ms, **Med: 39.70 ms**, Max: 54.20 ms | Min: 53.00 ms, **Med: 84.00 ms**, Max: 138.00 ms | **PASS** (< 140 ms) |
| **Change Current Day** (BDC-F-003) | < 2000 ms | Min: 27.80 ms, **Med: 46.70 ms**, Max: 54.90 ms | Min: 28.50 ms, **Med: 36.30 ms**, Max: 49.90 ms | Min: 61.00 ms, **Med: 74.00 ms**, Max: 81.00 ms | **PASS** (< 85 ms) |
| **Edit Issue to Done** (BDC-F-007) | < 2000 ms | Min: 28.10 ms, **Med: 43.20 ms**, Max: 53.50 ms | Min: 34.60 ms, **Med: 44.10 ms**, Max: 51.10 ms | Min: 42.00 ms, **Med: 72.00 ms**, Max: 88.00 ms | **PASS** (< 90 ms) |
| **Delete Issue** (BDC-F-008) | < 2000 ms | Min: 25.30 ms, **Med: 42.10 ms**, Max: 48.50 ms | Min: 20.40 ms, **Med: 38.10 ms**, Max: 44.30 ms | Min: 64.00 ms, **Med: 76.00 ms**, Max: 84.00 ms | **PASS** (< 85 ms) |
| **Reset Data** (BDC-F-009) | < 2000 ms | Min: 20.40 ms, **Med: 36.80 ms**, Max: 49.90 ms | Min: 21.10 ms, **Med: 34.90 ms**, Max: 53.10 ms | Min: 69.00 ms, **Med: 75.00 ms**, Max: 185.00 ms | **PASS** (< 190 ms) |

---

## 7. Inspection & Architectural Verification (BDC-NF-005)

| Record ID | Requirement | Executed Steps | Expected Result | Outcome Across All Browsers |
| :--- | :--- | :--- | :--- | :--- |
| **TC-NF-05.1** | BDC-NF-005 | Static architectural review of `src/js` | Strict module separation (data, logic, UI); 0 circular imports | Verified: `src/js/logic` (pure calculations), `src/js/data` (state management), `src/js/ui` (DOM rendering). Circular dependency count = 0. / **PASS** |
| **TC-NF-05.2** | BDC-NF-005 | Execute `node --test` on logic modules | Calculation and validation execute independently without DOM | Automated unit suite executed: **411/411 tests passing in ~1000 ms** (raw log `sv-unit-e901ecf.log`). / **PASS** |

---

## 8. Defects, Observations & Audit Trail

1. **Resolution of OBS-07 (Report Discrepancies & Traceability):**
   - In Run 1, certain prose table rows paraphrased messages or had slight labeling differences compared to STP Table 9.
   - Comprehensive audit file `docs/reports/evidence/sv-report-label-audit-e901ecf.md` created with 1-to-1 mapping for all 44 STP cases to JSON record IDs, runner assertions, and coverage statuses.
2. **Status Badge CSS Selector Bug Fixed:**
   - Discovered that `kpiCards.js` was rendering `.status-badge.status--ahead`, `.status--on-track`, `.status--behind`, whereas `src/css/styles.css` only targeted `.badge-ahead`, `.badge-ontrack`, `.badge-behind`. Added matching classes to `src/css/styles.css` and added regression unit tests in `tests/ui/kpiCards.test.js`.
3. **Table Scroll Criterion Ambiguity (OBS-01 / TC-F-13.2):**
   - STP Table 9 requires *"no horizontal scrolling"*, whereas `sprint2_naveen_checklist.md` clarifies that internal backlog table scrolling within `.table-wrapper` is acceptable on narrow viewports.
   - Status remains explicitly **BLOCKED** pending team confirmation. Page-level horizontal overflow is 0 px at all viewports in all three browsers.
4. **Duration Shortening History Retention (OBS-03):**
   - Shortening sprint duration preserves Done issues with `completedDay > duration` in the backlog table, while the Completed Points KPI counts only `days <= duration`. Verified as intentional application design.
5. **Test Runner Framework Reference (OBS-04 / TC-NF-05.2):**
   - STP references Jest; repository uses native Node.js test runner (`node --test`). Addendum documents this operational update.

---

## 9. Evidence Artifacts Index

All evidence files generated during System Validation are committed in `docs/reports/evidence/`:

- **Execution Logs & Results:**
  - `docs/reports/evidence/sv-results-chrome-2026-11-10-e901ecf.json` (63 records: 62 PASS, 0 FAIL, 1 BLOCKED)
  - `docs/reports/evidence/sv-run-chrome-2026-11-10-e901ecf.log`
  - `docs/reports/evidence/sv-results-msedge-2026-11-10-e901ecf.json` (63 records: 62 PASS, 0 FAIL, 1 BLOCKED)
  - `docs/reports/evidence/sv-run-msedge-2026-11-10-e901ecf.log`
  - `docs/reports/evidence/sv-results-firefox-2026-11-10-e901ecf.json` (63 records: 62 PASS, 0 FAIL, 1 BLOCKED)
  - `docs/reports/evidence/sv-run-firefox-2026-11-10-e901ecf.log`
  - `docs/reports/evidence/sv-unit-e901ecf.log` (411/411 unit tests raw log)
- **Traceability & Manual Sheets:**
  - `docs/reports/evidence/sv-report-label-audit-e901ecf.md` (All 44 STP cases mapped)
  - `docs/reports/evidence/sv-manual-firefox-e901ecf.md` (Manual Firefox template with PENDING cells)
  - `docs/reports/evidence/sv-manual-screenreader-e901ecf.md` (Screen-reader template with PENDING cells)
  - `docs/reports/evidence/sv-failure-analysis.md` (Run 1 root-cause investigation)
  - `docs/reports/evidence/superseded/` (Archived Run 1 records)
- **High-Resolution Screenshots:**
  - Canvas Marker Verification: `sv-marker-day0-*`, `sv-marker-day4-*`, `sv-marker-day6-*`, `sv-marker-day10-*` (Chrome, Edge, Firefox)
  - Status Indicators: `sv-status-ahead-*`, `sv-status-ontrack-*`, `sv-status-behind-*` (Chrome, Edge, Firefox)
  - Viewports (1024, 1366, 1440, 1920px in Light & Dark): `sv-responsive-*` (Chrome, Edge, Firefox)
  - Functional Workflows: `sv-g1-default-state-*`, `sv-g2-config-valid-*`, `sv-g2-config-error-*`, `sv-g3-day6-*`, `sv-g4-add-issue-*`, `sv-g5-edit-done-*`, `sv-g6-delete-*`, `sv-g6-empty-backlog-*`, `sv-g7-reset-*`, `sv-g8-ontrack-*`, `sv-g8-behind-*`, `sv-sec-xss-*`

---

## 10. Conclusion & Recommendation

System Validation Run 3 on commit `e901ecf17232f97a307ab6c723ba13bdc26aa744` achieves **62 PASS, 0 FAIL, 1 BLOCKED, 0 NOT EXECUTED** per browser across Google Chrome, Microsoft Edge, and Mozilla Firefox (186 PASS / 0 FAIL / 3 BLOCKED total).

The single BLOCKED case (`TC-F-13.2`) is isolated to specification ambiguity regarding internal table scrolling versus strict viewport overflow, and has zero impact on core burndown calculation or UI stability. All unit tests pass (411/411).

This report is delivered as complete testing-phase evidence for PR review into `develop`. Physical manual testing (Firefox and screen reader) remains documented as NOT EXECUTED templates for subsequent QA phase execution.
