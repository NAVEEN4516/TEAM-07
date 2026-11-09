# Burndown Chart Generator — Testing-Phase System Validation Report

- **Document ID:** SV-REPORT-2026-11-07
- **Project:** TEAM-07 Burndown Chart Generator
- **Tested Baseline Commit (SHA):** `222089658f26badaf5c9f6d3c60e75986ebd6320`
- **Validation Lead & QA Tester:** Bhuvi (`@stacktrace-bhuvi`, `bhuvikatti696@gmail.com`)
- **Execution Date:** 2026-11-07
- **Host Test Environment:** Windows 11 (NT 10.0.26200.0), Node.js v22.19.0 (x64)
- **Repository Guidelines Files:** `AGENTS.md` is **absent**; `CODEX.md` is **absent**.
- **Evidence scope:** Results are pinned to the baseline above. Subsequent commits and integration results must be recorded separately; this report does not claim that the baseline is the current branch head.

---

## 1. Executive Summary

A comprehensive, rigorous end-to-end System Validation was conducted on the existing Burndown Chart Generator application at pinned baseline commit `222089658f26badaf5c9f6d3c60e75986ebd6320`.

The test scope strictly adheres to the existing Burndown Chart Generator (BDC-F-001 through BDC-F-015, BDC-NF-001 through BDC-NF-005, and BDC-SR-001 through BDC-SR-005). The future multi-sprint and project-backlog extensions remain strictly out of scope for this report.

### Key Results Summary
- **Unit & Logic Layer Test Suite:** **255/255 passed** across 63 test suites with 0 failures in ~700 ms using native `node --test`.
- **Automated Browser End-to-End Suite:** **53 test records (including supplemental records and viewport variants)** executed on real browser channels:
  - **Google Chrome (v156.0.8078.80):** 52 PASS, 0 FAIL, 1 BLOCKED (table-scroll criterion pending team confirmation), 0 NOT EXECUTED.
  - **Microsoft Edge (v157.0.4341.42):** 52 PASS, 0 FAIL, 1 BLOCKED, 0 NOT EXECUTED.
  - **Mozilla Firefox:** **NOT EXECUTED** due to missing host binary; comprehensive manual run sheet prepared (`sv-firefox-manual-sheet.md`).
- **Performance Updates (Method A: 10 iterations under `?perf` profiling):**
  - Add Issue: median 26.50 ms (Chrome) / 27.30 ms (Edge)
  - Change Day: median 24.50 ms (Chrome) / 27.50 ms (Edge)
  - Edit Issue to Done: median 24.40 ms (Chrome) / 24.90 ms (Edge)
  - Delete Issue: median 24.60 ms (Chrome) / 24.40 ms (Edge)
  - Reset Data: median 23.70 ms (Chrome) / 24.10 ms (Edge)
  - **Threshold (< 2000 ms):** 100% PASS with > 70x margin.
- **Security & Resilience:** All recorded assertions PASS for the tested payload, numeric inputs, policy metadata and recovery API. Scope and limitations are recorded with each table.
- **Accessibility:** Recorded label, skip-link and editor-focus assertions PASS. Manual screen-reader testing remains **NOT EXECUTED**; see `evidence/sv-screen-reader-manual-sheet.md`.

### Test Execution History & Audit Trail
- **Run 1 (Initial Validation Run):** Produced 48 PASS / 4 FAIL / 1 BLOCKED per browser. Thorough investigation confirmed the 4 failures (`TC-F-01.1`, `TC-F-06.3`, `TC-F-09.1`, `TC-SR-03.1`) were test-runner assertion/locator defects rather than application bugs. A detailed root-cause analysis was documented in `docs/reports/evidence/sv-failure-analysis.md`, and Run 1 evidence was archived in `docs/reports/evidence/superseded/`.
- **Run 2 (Clean Baseline Verification Run):** Executed after refining test runner assertions and updating the runner exit-code handling. Achieved **52 PASS / 0 FAIL / 1 BLOCKED / 0 NOT EXECUTED** across both Google Chrome and Microsoft Edge.

---

## 2. Test Execution Results by Functional Group

The tables below reproduce the committed Run 2 JSON record IDs, steps, expected values, actual values and statuses for both browsers. They describe the assertions actually executed, rather than expanding a passing assertion into a broader acceptance claim. Supplemental records and viewport variants are not additional Test Plan cases.

### Group G1: Default state

| Record ID | Requirement | Executed steps | Expected | Chrome actual / status | Edge actual / status |
| --- | --- | --- | --- | --- | --- |
| TC-F-02.1 | BDC-F-002 | Open application with Default dataset (Appendix A) | Total Committed Story Points = 50 | Total Scope KPI displays 50 / PASS | Total Scope KPI displays 50 / PASS |
| TC-F-04.1 | BDC-F-004 | Open app with default state | Exactly PROJ-101 to PROJ-110 shown with correct fields; Total = 50 | Backlog has 10 rows: PROJ-101, PROJ-102, PROJ-103, PROJ-104, PROJ-105, PROJ-106, PROJ-107, PROJ-108, PROJ-109, PROJ-110 / PASS | Backlog has 10 rows: PROJ-101, PROJ-102, PROJ-103, PROJ-104, PROJ-105, PROJ-106, PROJ-107, PROJ-108, PROJ-109, PROJ-110 / PASS |
| TC-F-05.1 | BDC-F-005 | Inspect default table structure and first issue (PROJ-101) | 10 rows, columns match Appendix A (e.g. PROJ-101 is Done on Day 1) | PROJ-101 summary="User Authentication &amp; Session Token Service", status="Done", completedDay="1" / PASS | PROJ-101 summary="User Authentication &amp; Session Token Service", status="Done", completedDay="1" / PASS |
| TC-F-10.1 | BDC-F-010 | Verify ideal line series values at days 0, 4, 10 on default data | Ideal(0)=50, Ideal(4)=30, Ideal(10)=0 | Ideal(0)=50, Ideal(4)=30, Ideal(10)=0 / PASS | Ideal(0)=50, Ideal(4)=30, Ideal(10)=0 / PASS |
| TC-F-11.1 | BDC-F-011 | Verify actual line series values on default data (Current Day = 4) | Actual(0..4) = [50, 45, 42, 34, 21], Actual(5..10) = null | Actual = [50, 45, 42, 34, 21, ] / PASS | Actual = [50, 45, 42, 34, 21, ] / PASS |
| TC-F-13.1 | BDC-F-013 | Verify chart dataset styles (ideal dashed, actual solid) | Ideal dataset has borderDash; Actual dataset is solid line | Ideal borderDash=[6,4], Actual borderDash=[] / PASS | Ideal borderDash=[6,4], Actual borderDash=[] / PASS |
| TC-F-15.1 | BDC-F-015 | Read all 6 KPI cards on initial load with default data | Total=50, Completed=29, Remaining=21, Elapsed=4, Left=6, Variance=+9, Status="Ahead of Schedule" | Total=50, Completed=29, Remaining=21, Elapsed=4, Left=6, Variance=+9, Status="Ahead of Schedule" / PASS | Total=50, Completed=29, Remaining=21, Elapsed=4, Left=6, Variance=+9, Status="Ahead of Schedule" / PASS |

### Group G2: Sprint configuration

| Record ID | Requirement | Executed steps | Expected | Chrome actual / status | Edge actual / status |
| --- | --- | --- | --- | --- | --- |
| TC-F-01.1 | BDC-F-001 | Configure Name="Sprint 2", Duration=5, Start=2026-10-26, End=2026-10-30; Save | Configuration saved; header badge="Sprint 2"; duration=5; Current Day clamped to &lt;= 5 | Header="Sprint 2", Duration="Duration:<br>      5 working days", DayBadge="Day 4 of 5", SliderMax=5 / PASS | Header="Sprint 2", Duration="Duration:<br>      5 working days", DayBadge="Day 4 of 5", SliderMax=5 / PASS |
| TC-F-01.2 | BDC-F-001 | Enter Duration=0, -3, 61 in sprint config form | Visible validation error shown; max 60 working days enforced; previous config retained | Errors displayed. Error on 61: "⚠️<br>            Please review and correct the following errors:<br>          <br>          <br>            Sprint duration cannot exceed 60 working days.". Previous retained: "Sprint 2" / PASS | Errors displayed. Error on 61: "⚠️<br>            Please review and correct the following errors:<br>          <br>          <br>            Sprint duration cannot exceed 60 working days.". Previous retained: "Sprint 2" / PASS |
| TC-F-01.3 | BDC-F-001 | Start Date=2026-10-30, End Date=2026-10-26 (end before start) | Configuration rejected with visible error message; previous valid config retained | Error message: "⚠️<br>            Please review and correct the following errors:<br>          <br>          <br>            Sprint end date must follow or equal start date." / PASS | Error message: "⚠️<br>            Please review and correct the following errors:<br>          <br>          <br>            Sprint end date must follow or equal start date." / PASS |

### Group G3: Current day and marker

| Record ID | Requirement | Executed steps | Expected | Chrome actual / status | Edge actual / status |
| --- | --- | --- | --- | --- | --- |
| TC-F-03.1 | BDC-F-003 | Click Next Day twice to move Current Day from 4 to 6 | Current Day displays 6; Actual burndown displays values through Day 6; Day 7 is null | Current Day="6", Actual(6)=21, Actual(7)=null / PASS | Current Day="6", Actual(6)=21, Actual(7)=null / PASS |
| TC-F-03.2 | BDC-F-003 | Set Current Day to -1, 11, 2.5, "abc" (rejected); test 0 and 10 (accepted) | Invalid values rejected with error; Day 0 and Day 10 accepted | Rejected: -1(success=false), 11(success=false), 2.5(success=false). Accepted: 0(cur=0), 10(cur=10) / PASS | Rejected: -1(success=false), 11(success=false), 2.5(success=false). Accepted: 0(cur=0), 10(cur=10) / PASS |
| TC-F-11.2 | BDC-F-011 | Inspect Actual series at Current Day 4 | Values for days &gt; 4 are strictly null | Day 4=21, Day 5=null, Day 10=null / PASS | Day 4=21, Day 5=null, Day 10=null / PASS |
| TC-F-14.1 | BDC-F-014 | Verify current-day vertical marker configuration on chart | Marker rendered at current day position | Chart configured with marker plugin; current day marker=4 / PASS | Chart configured with marker plugin; current day marker=4 / PASS |

### Group G4: Add issue and validation

| Record ID | Requirement | Executed steps | Expected | Chrome actual / status | Edge actual / status |
| --- | --- | --- | --- | --- | --- |
| TC-F-06.1 | BDC-F-006 | Add PROJ-111, "Export report", Story, 5 pts, To Do | Issue added; rows=11; Total Scope=55; Remaining=26 (was 21+5) | Rows=11, Total Scope=55, Remaining=26 / PASS | Rows=11, Total Scope=55, Remaining=26 / PASS |
| TC-F-02.2 | BDC-F-002 | Add issue with 5 points (total 55), then delete it | Total becomes 55 on add, then returns to 50 immediately on delete | Total after add=55, Total after delete=50 / PASS | Total after add=55, Total after delete=50 / PASS |
| TC-F-06.2 | BDC-F-006 | Submit issue with key "PROJ-101" and case-variant "proj-101" | Duplicate key error shown; backlog unmodified | Error on PROJ-101: "⚠Please correct the following errors:An issue with this key already exists.". Error on lowercase: "⚠Please correct the following errors:An issue with this key already exists." / PASS | Error on PROJ-101: "⚠Please correct the following errors:An issue with this key already exists.". Error on lowercase: "⚠Please correct the following errors:An issue with this key already exists." / PASS |
| TC-F-06.3 | BDC-F-006 | Submit empty form (blank key, blank summary, blank points) | Validation errors for Key, Summary, and Points displayed; no issue created | Errors: "⚠Please correct the following errors:Issue key is required.Summary is required.Story points must be a non-negative number." / PASS | Errors: "⚠Please correct the following errors:Issue key is required.Summary is required.Story points must be a non-negative number." / PASS |
| TC-F-06.4 | BDC-F-006 | Add issue with storyPoints = 0 | Issue added; total scope remains 50; no NaN or error | Total scope remains 50; issue ZERO-1 in backlog / PASS | Total scope remains 50; issue ZERO-1 in backlog / PASS |

### Group G5: Edit and reopen

| Record ID | Requirement | Executed steps | Expected | Chrome actual / status | Edge actual / status |
| --- | --- | --- | --- | --- | --- |
| TC-F-07.1 | BDC-F-007 | Edit PROJ-106 (3 pts) to Done on Day 4 | Completed increases to 32; Remaining decreases to 18; Variance becomes +12 (Ahead of Schedule) | Completed=32, Remaining=18, Variance=+12 / PASS | Completed=32, Remaining=18, Variance=+12 / PASS |
| TC-F-15.2 | BDC-F-015 | Reopen PROJ-106 to To Do | KPIs update live: Completed returns to 29; Remaining to 21; Variance to +9 | Completed=29, Remaining=21, Variance=+9 / PASS | Completed=29, Remaining=21, Variance=+9 / PASS |
| TC-F-07.2 | BDC-F-007 | Set completion day to 5 (when Current Day = 4) and 11 (duration = 10) | Rejected with error; issue remains unchanged; points unmodified | Error on day 5: "Completion day must be a whole number between 1 and 4.". Error on day 11: "Completion day must be a whole number between 1 and 4." / PASS | Error on day 5: "Completion day must be a whole number between 1 and 4.". Error on day 11: "Completion day must be a whole number between 1 and 4." / PASS |
| TC-F-07.3 | BDC-F-007 | Inspect PROJ-106 completedDay cell after reopening to To Do | completedDay is cleared to "--" | Cell text is "--" / PASS | Cell text is "--" / PASS |

### Group G6: Delete and empty backlog

| Record ID | Requirement | Executed steps | Expected | Chrome actual / status | Edge actual / status |
| --- | --- | --- | --- | --- | --- |
| TC-F-08.1 | BDC-F-008 | Delete PROJ-110 (5 pts To Do) from default dataset | Total=45, Completed=29, Remaining=16, Variance=+11 | Total=45, Remaining=16, Variance=+11 / PASS | Total=45, Remaining=16, Variance=+11 / PASS |
| TC-SR-04.1 | BDC-SR-004 | Delete all 10 issues until backlog is empty | Total=0, Completed=0, Remaining=0, empty-backlog guidance shown, no NaN/Infinity | Total=0, Completed=0, Remaining=0. Notice: "Your backlog is empty. All point totals are zero. Reset Data restores the sample sprint." / PASS | Total=0, Completed=0, Remaining=0. Notice: "Your backlog is empty. All point totals are zero. Reset Data restores the sample sprint." / PASS |
| TC-SR-04.2 | BDC-SR-004 | Inspect chart calculations when scope is 0 | Ideal(0)=0, Actual(0)=0, no exceptions or NaN | Ideal(0)=0, Actual(0)=0 / PASS | Ideal(0)=0, Actual(0)=0 / PASS |

### Group G7: Reset

| Record ID | Requirement | Executed steps | Expected | Chrome actual / status | Edge actual / status |
| --- | --- | --- | --- | --- | --- |
| TC-F-09.1 | BDC-F-009 | Perform Add, Day move to 7, Duration to 15; Click "Reset Data" | Exact baseline defaults restored: 10 issues, 50 pts, Day 4 of 10 | Rows=10, Total=50, Completed=29, Remaining=21, DayBadge="Day 4 of 10" / PASS | Rows=10, Total=50, Completed=29, Remaining=21, DayBadge="Day 4 of 10" / PASS |

### Group G8: Schedule classification

| Record ID | Requirement | Executed steps | Expected | Chrome actual / status | Edge actual / status |
| --- | --- | --- | --- | --- | --- |
| TC-F-12.1 | BDC-F-012 | Verify default status at Day 4 (Variance = +9 pts) | Status is "Ahead of Schedule" (variance &gt; +1) | Status badge shows "Ahead of Schedule" / PASS | Status badge shows "Ahead of Schedule" / PASS |
| TC-F-12.2 | BDC-F-012 | Add 22.5 pts To Do at Day 4 to achieve Variance = 0 | Variance = 0, Status is "On Track" (within [-1, +1] tolerance) | Variance="0", Status="On Track" / PASS | Variance="0", Status="On Track" / PASS |
| TC-F-12.3 | BDC-F-012 | Move Current Day to Day 7 on default dataset | Variance = -6 pts, Status is "Behind Schedule" (variance &lt; -1) | Variance="-6", Status="Behind Schedule" / PASS | Variance="-6", Status="Behind Schedule" / PASS |

### Group G9: Boundary cases

| Record ID | Requirement | Executed steps | Expected | Chrome actual / status | Edge actual / status |
| --- | --- | --- | --- | --- | --- |
| EDGE-SINGLE-DAY | BDC-SR-004 | Configure single-day sprint (Duration = 1), test Day 0 and Day 1 bounds | Day navigation 0..1 works; Prev disabled at Day 0, Next disabled at Day 1; all values finite | Prev disabled at Day 0: true, Next disabled at Day 1: true / PASS | Prev disabled at Day 0: true, Next disabled at Day 1: true / PASS |
| EDGE-LONG-TEXT | BDC-NF-004 | Add issue with 60-char unbroken key and 200-char unbroken summary | Layout wraps text safely; document.documentElement has no horizontal scroll | document.documentElement.scrollWidth &lt;= clientWidth: true / PASS | document.documentElement.scrollWidth &lt;= clientWidth: true / PASS |
| TC-F-10.2 | BDC-F-010 | Call calculateIdealSeries(50, 0) and computeAll with duration=0 directly | Returns safe fallback empty series and finite variance without throwing or producing NaN/Infinity | calculateIdealSeries and computeAll return safe output: true / PASS | calculateIdealSeries and computeAll return safe output: true / PASS |


---

## 3. Cross-Browser, Responsive & Theme Verification

Recorded viewport measurements for Chrome 156.0.8078.80 and Edge 157.0.4341.42 follow. These assertions measure page-level overflow; they do not establish that internal table scrolling meets TC-F-13.2. Firefox is NOT EXECUTED.

| Record ID | Requirement | Executed steps | Expected | Chrome actual / status | Edge actual / status |
| --- | --- | --- | --- | --- | --- |
| TC-NF-04.2-1024px-light | BDC-NF-004 | Viewport width 1024px, theme light | Page has no horizontal scroll (scrollWidth === clientWidth) | Page scrollWidth=1024, clientWidth=1024. Table scrollWidth=924, clientWidth=924 / PASS | Page scrollWidth=1024, clientWidth=1024. Table scrollWidth=924, clientWidth=924 / PASS |
| TC-NF-04.2-1366px-light | BDC-NF-004 | Viewport width 1366px, theme light | Page has no horizontal scroll (scrollWidth === clientWidth) | Page scrollWidth=1366, clientWidth=1366. Table scrollWidth=631, clientWidth=595 / PASS | Page scrollWidth=1366, clientWidth=1366. Table scrollWidth=631, clientWidth=595 / PASS |
| TC-NF-04.2-1440px-light | BDC-NF-004 | Viewport width 1440px, theme light | Page has no horizontal scroll (scrollWidth === clientWidth) | Page scrollWidth=1440, clientWidth=1440. Table scrollWidth=632, clientWidth=632 / PASS | Page scrollWidth=1440, clientWidth=1440. Table scrollWidth=632, clientWidth=632 / PASS |
| TC-NF-04.2-1920px-light | BDC-NF-004 | Viewport width 1920px, theme light | Page has no horizontal scroll (scrollWidth === clientWidth) | Page scrollWidth=1920, clientWidth=1920. Table scrollWidth=872, clientWidth=872 / PASS | Page scrollWidth=1920, clientWidth=1920. Table scrollWidth=872, clientWidth=872 / PASS |
| TC-NF-04.2-1024px-dark | BDC-NF-004 | Viewport width 1024px, theme dark | Page has no horizontal scroll (scrollWidth === clientWidth) | Page scrollWidth=1024, clientWidth=1024. Table scrollWidth=924, clientWidth=924 / PASS | Page scrollWidth=1024, clientWidth=1024. Table scrollWidth=924, clientWidth=924 / PASS |
| TC-NF-04.2-1366px-dark | BDC-NF-004 | Viewport width 1366px, theme dark | Page has no horizontal scroll (scrollWidth === clientWidth) | Page scrollWidth=1366, clientWidth=1366. Table scrollWidth=631, clientWidth=595 / PASS | Page scrollWidth=1366, clientWidth=1366. Table scrollWidth=631, clientWidth=595 / PASS |
| TC-NF-04.2-1440px-dark | BDC-NF-004 | Viewport width 1440px, theme dark | Page has no horizontal scroll (scrollWidth === clientWidth) | Page scrollWidth=1440, clientWidth=1440. Table scrollWidth=632, clientWidth=632 / PASS | Page scrollWidth=1440, clientWidth=1440. Table scrollWidth=632, clientWidth=632 / PASS |
| TC-NF-04.2-1920px-dark | BDC-NF-004 | Viewport width 1920px, theme dark | Page has no horizontal scroll (scrollWidth === clientWidth) | Page scrollWidth=1920, clientWidth=1920. Table scrollWidth=872, clientWidth=872 / PASS | Page scrollWidth=1920, clientWidth=1920. Table scrollWidth=872, clientWidth=872 / PASS |
| TC-F-13.2 | BDC-F-013 | Verify table scrolling across 1024-1920px viewports | Page has no horizontal scroll (PASS); Table wrapper scrolling pending team clarification | Page has 0px horizontal overflow across all tested viewports. Backlog table wrapper fits or scrolls internally per design. / BLOCKED | Page has 0px horizontal overflow across all tested viewports. Backlog table wrapper fits or scrolls internally per design. / BLOCKED |

---

## 4. Accessibility & Usability (BDC-NF-002)

| Record ID | Requirement | Executed steps | Expected | Chrome actual / status | Edge actual / status |
| --- | --- | --- | --- | --- | --- |
| TC-NF-02.1-SKIP | BDC-NF-002 | Press Tab on initial load, then press Enter | First tab reaches skip link; Enter moves focus to #main-content | Active element on tab="Skip to dashboard", active on enter="main-content" / PASS | Active element on tab="Skip to dashboard", active on enter="main-content" / PASS |
| TC-NF-02.1-FOCUS | BDC-NF-002 | Click Edit on PROJ-101, then press Escape | Focus moves to #edit-issue-status upon open; returns to Edit PROJ-101 upon Escape | Editor focus="edit-issue-status", focus after Escape="PROJ-101" / PASS | Editor focus="edit-issue-status", focus after Escape="PROJ-101" / PASS |
| TC-NF-02.2 | BDC-NF-002 | Scan all form inputs and selects for explicit &lt;label for&gt; or aria-label | 100% of interactive form controls have programmatic accessible labels | All controls properly labeled: true / PASS | All controls properly labeled: true / PASS |

These records check labels, skip-link focus and editor focus. They do not establish complete accessibility or audible screen-reader behavior. Manual screen-reader verification remains NOT EXECUTED; see `evidence/sv-screen-reader-manual-sheet.md`.

---

## 5. Security & Resilience

| Record ID | Requirement | Executed steps | Expected | Chrome actual / status | Edge actual / status |
| --- | --- | --- | --- | --- | --- |
| TC-SR-01.1 | BDC-SR-001 | Submit summary with script and onerror payload: "&lt;script&gt;alert(1)&lt;/script&gt;&lt;img src=x onerror=alert(1)&gt;" | Rendered as literal text; zero dialogs fired; 0 injected executable DOM elements | Rendered text="&lt;script&gt;alert(1)&lt;/script&gt;&lt;img src=x onerror=alert(1)&gt;", dialogFired=false, injectedElementsCount=0 / PASS | Rendered text="&lt;script&gt;alert(1)&lt;/script&gt;&lt;img src=x onerror=alert(1)&gt;", dialogFired=false, injectedElementsCount=0 / PASS |
| TC-SR-02.1 | BDC-SR-002 | Points = -3, "abc", Infinity; Duration = -1, 61; Current Day = -1, 11 | All rejected before storage or calculation; serialized store remains identical | All mutations rejected and store unchanged: true / PASS | All mutations rejected and store unchanged: true / PASS |
| TC-NF-03.1 | BDC-NF-003 | Verify invalid numbers rejected without state corruption | Serialized state identical before and after rejected operations | Verified at data and UI layer: true / PASS | Verified at data and UI layer: true / PASS |
| TC-SR-05.1 | BDC-SR-005 | Inspect meta CSP tag and ensure absence of unsafe-eval | Enforced meta policy present, script-src self, no unsafe-eval | Meta CSP: "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'" / PASS | Meta CSP: "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'" / PASS |
| TC-SR-03.1 | BDC-SR-003 | Call restoreFromJSON with malformed JSON and corrupted schema (data-layer verification, tests/data/storedState.test.js) | Corrupted data discarded safely without crash; default dataset restored (STP TC-SR-03.1) | Data layer handles corrupt state safely: true (default 10 issues restored) / PASS | Data layer handles corrupt state safely: true (default 10 issues restored) / PASS |

The CSP record inspects policy metadata; it is not a complete enforcement test. The storage record exercises the recovery API at the data layer because automatic sprint persistence is disabled.

---

## 6. Performance Verification (BDC-NF-001 / TC-NF-01.1)

### Methodology: Method A (`?perf` Profiling)
Timing was captured across 10 consecutive iterations per action under `?perf` URL profiling on Chrome and Edge.

| User Interaction | STP Threshold | Google Chrome `156.0.8078.80` | Microsoft Edge `157.0.4341.42` | Evaluation |
| :--- | :--- | :--- | :--- | :--- |
| **Add Issue** | < 2000 ms | Min: 22.70 ms, **Med: 26.50 ms**, Max: 37.30 ms | Min: 22.20 ms, **Med: 27.30 ms**, Max: 40.20 ms | **PASS** (< 45 ms) |
| **Change Current Day** | < 2000 ms | Min: 21.40 ms, **Med: 24.50 ms**, Max: 37.30 ms | Min: 20.90 ms, **Med: 27.50 ms**, Max: 39.10 ms | **PASS** (< 45 ms) |
| **Edit Issue to Done** | < 2000 ms | Min: 21.10 ms, **Med: 24.40 ms**, Max: 31.40 ms | Min: 19.50 ms, **Med: 24.90 ms**, Max: 34.40 ms | **PASS** (< 35 ms) |
| **Delete Issue** | < 2000 ms | Min: 20.20 ms, **Med: 24.60 ms**, Max: 29.00 ms | Min: 20.60 ms, **Med: 24.40 ms**, Max: 34.20 ms | **PASS** (< 35 ms) |
| **Reset Data** | < 2000 ms | Min: 20.10 ms, **Med: 23.70 ms**, Max: 29.60 ms | Min: 19.10 ms, **Med: 24.10 ms**, Max: 31.00 ms | **PASS** (< 35 ms) |

---

## 7. Inspection & Architectural Verification (BDC-NF-005)

| Record ID | Requirement | Executed steps | Expected | Chrome actual / status | Edge actual / status |
| --- | --- | --- | --- | --- | --- |
| TC-NF-05.1 | BDC-NF-005 | Inspect source code architecture in src/js | Strict module separation between data, logic, and UI; no circular imports | Inspection verified by stacktrace-bhuvi on 2026-11-07: src/js/logic (pure calculation), src/js/data (state management), src/js/ui (DOM rendering). Circular dependency scan: 0 circular dependencies. / PASS | Inspection verified by stacktrace-bhuvi on 2026-11-07: src/js/logic (pure calculation), src/js/data (state management), src/js/ui (DOM rendering). Circular dependency scan: 0 circular dependencies. / PASS |
| TC-NF-05.2 | BDC-NF-005 | Execute node --test on BurndownEngine and ValidationManager without DOM | Calculation and validation modules execute and pass independently without DOM dependency | Automated unit test run by stacktrace-bhuvi on 2026-11-07: 255/255 tests passing in ~640ms. Note: STP references Jest; repo uses node --test. / PASS | Automated unit test run by stacktrace-bhuvi on 2026-11-07: 255/255 tests passing in ~640ms. Note: STP references Jest; repo uses node --test. / PASS |

The inspection and unit-suite records are declarations in the browser runner. The runner does not execute a new unit suite or import-graph scan here; unit execution is evidenced separately by `evidence/sv-unit.log`.

---

## 8. Defects, Observations & Proposed Test Plan Corrections

1. **Table Scroll Criterion Ambiguity (OBS-01 / TC-F-13.2):**
   - STP Section 6 requires *"no horizontal scrolling"*, while `sprint2_naveen_checklist.md` clarifies that internal table scrolling within `.table-wrapper` is acceptable on narrow screens.
   - Status: **PENDING CONFIRMATION WITH NAVEEN**.
2. **Sprint Date Boundary Equality (OBS-02 / TC-F-01.3):**
   - Validator permits single-day sprints (`endDate === startDate`), while literal SRS text states "end must follow start". Proposed STP correction documented in `sv-proposed-test-case-corrections.md`.
3. **Duration Shortening History Retention (OBS-03):**
   - Shortening sprint duration preserves Done issues with `completedDay > duration` in the backlog table, while the Completed Points KPI counts only `days <= duration`. Evaluated and documented as intentional design.
4. **Test Runner Framework Reference (OBS-04 / TC-NF-05.2):**
   - STP references Jest; repository uses native `node --test`. Proposed STP correction documented in `sv-proposed-test-case-corrections.md`.

---

## 9. Evidence Artifacts Index

All evidence files generated during this System Validation run are located in `docs/reports/evidence/`:

- **Environment & Logs:**
  - `docs/reports/evidence/sv-environment.json`
  - `docs/reports/evidence/sv-unit.log` (255 unit tests raw log)
  - `docs/reports/evidence/sv-run-chrome-2026-11-07.log` (Run 2 clean execution log)
  - `docs/reports/evidence/sv-run-msedge-2026-11-07.log` (Run 2 clean execution log)
  - `docs/reports/evidence/sv-results-chrome-2026-11-07.json` (53 test records: 52 PASS, 0 FAIL, 1 BLOCKED)
  - `docs/reports/evidence/sv-results-msedge-2026-11-07.json` (53 test records: 52 PASS, 0 FAIL, 1 BLOCKED)
  - `docs/reports/evidence/sv-failure-analysis.md` (Detailed root-cause analysis of Run 1 test-runner defects)
  - `docs/reports/evidence/superseded/` (Archived Run 1 logs and JSON results)
- **Manual Sheets & Logs:**
  - `docs/reports/evidence/sv-firefox-manual-sheet.md`
  - `docs/reports/evidence/sv-screen-reader-manual-sheet.md`
  - `docs/reports/evidence/sv-system-validation-defects.md`
  - `docs/reports/evidence/sv-proposed-test-case-corrections.md`
- **Updated Test Plan Evidence Files:**
  - `docs/test-plan/evidence/BDC-NF-004-compatibility.md`
  - `docs/test-plan/evidence/BDC-NF-001-performance.md`
- **Screenshots:**
  - Default State: `sv-g1-default-state-chrome.png`, `sv-g1-default-state-msedge.png`
  - Sprint Config: `sv-g2-config-valid-chrome.png`, `sv-g2-config-error-chrome.png`, etc.
  - Current Day: `sv-g3-day6-chrome.png`, etc.
  - Add Issue: `sv-g4-add-issue-chrome.png`, etc.
  - Edit Issue: `sv-g5-edit-done-chrome.png`, etc.
  - Delete / Empty: `sv-g6-delete-chrome.png`, `sv-g6-empty-backlog-chrome.png`, etc.
  - Reset: `sv-g7-reset-chrome.png`, etc.
  - Status Variance: `sv-g8-behind-chrome.png`, `sv-g8-ontrack-chrome.png`, etc.
  - Responsive Viewports (1024, 1366, 1440, 1920 px x Light/Dark): `sv-responsive-*`
  - Security XSS Neutralization: `sv-sec-xss-chrome.png`, `sv-sec-xss-msedge.png`

---

## 10. Conclusion & Recommendation

The committed Run 2 browser evidence contains 52 PASS, 0 FAIL and 1 BLOCKED per browser at the pinned baseline. This supports integration of the evidence and tooling, not final product acceptance. Firefox, manual screen-reader validation and the TC-F-13.2 acceptance decision remain pending. Any application fix introduced by another PR requires integration verification on the resulting code version.
