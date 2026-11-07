# Burndown Chart Generator — Testing-Phase System Validation Report

- **Document ID:** SV-REPORT-2026-11-07
- **Project:** TEAM-07 Burndown Chart Generator
- **Tested Baseline Commit (SHA):** `222089658f26badaf5c9f6d3c60e75986ebd6320`
- **Validation Lead & QA Tester:** Bhuvi (`@stacktrace-bhuvi`, `bhuvikatti696@gmail.com`)
- **Execution Date:** 2026-11-07
- **Host Test Environment:** Windows 11 (NT 10.0.26200.0), Node.js v22.19.0 (x64)
- **Repository Guidelines Files:** `AGENTS.md` is **absent**; `CODEX.md` is **absent**.
- **Untested Commits on `origin/develop`:** None (`222089658f26badaf5c9f6d3c60e75986ebd6320` is the exact HEAD of `origin/develop`).

---

## 1. Executive Summary

A comprehensive, rigorous end-to-end System Validation was conducted on the existing Burndown Chart Generator application at pinned baseline commit `222089658f26badaf5c9f6d3c60e75986ebd6320`.

The test scope strictly adheres to the existing Burndown Chart Generator (BDC-F-001 through BDC-F-015, BDC-NF-001 through BDC-NF-005, and BDC-SR-001 through BDC-SR-005). The future multi-sprint and project-backlog extensions remain strictly out of scope for this report.

### Key Results Summary
- **Unit & Logic Layer Test Suite:** **255/255 passed** across 63 test suites with 0 failures in 643.8 ms using native `node --test`.
- **Automated Browser End-to-End Suite:** **53/53 test cases** executed on real browser channels:
  - **Google Chrome (v156.0.8078.80):** 52 PASS, 1 BLOCKED (table-scroll criterion pending team confirmation), 0 FAIL.
  - **Microsoft Edge (v156.0.4314.58):** 52 PASS, 1 BLOCKED, 0 FAIL.
  - **Mozilla Firefox:** **NOT EXECUTED** due to missing host binary; comprehensive manual run sheet prepared (`sv-firefox-manual-sheet.md`).
- **Performance Updates (Method A: 10 iterations):**
  - Add Issue: median 33.4 ms (Chrome) / 37.3 ms (Edge)
  - Change Day: median 34.2 ms (Chrome) / 33.3 ms (Edge)
  - Edit Issue to Done: median 32.1 ms (Chrome) / 30.0 ms (Edge)
  - Delete Issue: median 33.0 ms (Chrome) / 29.9 ms (Edge)
  - Reset Data: median 26.9 ms (Chrome) / 32.4 ms (Edge)
  - **Threshold (< 2000 ms):** 100% PASS with > 35x margin.
- **Security & Resilience:** 100% PASS (zero XSS execution, strict numeric validation rejection, strict meta CSP enforced, malformed storage discarded safely).
- **Accessibility:** 100% PASS on programmatic ARIA, skip link, and focus restoration; physical screen reader audio marked **NOT EXECUTED** with manual run sheet (`sv-screen-reader-manual-sheet.md`).

---

## 2. Test Execution Results by Functional Group

### Group G1: Default State (Initial Load)
*Test Cases: TC-F-02.1, TC-F-04.1, TC-F-05.1, TC-F-10.1, TC-F-11.1, TC-F-15.1, TC-F-13.1*

| Test Case ID | Requirement | Input / Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-02.1** | BDC-F-002 | Load `index.html` with default dataset | Backlog table renders 10 default sample issues | Rendered 10 rows matching sample dataset | **PASS** |
| **TC-F-04.1** | BDC-F-004 | Inspect KPI cards for story points | Total Scope = 50, Completed = 22, Remaining = 28 | Scope=50, Completed=22, Remaining=28 | **PASS** |
| **TC-F-05.1** | BDC-F-005 | Inspect timeline KPI cards | Days Elapsed = 4, Days Left = 6 | Elapsed=4, Left=6 | **PASS** |
| **TC-F-10.1** | BDC-F-010 | Inspect Ideal Burndown chart line | Straight line from (0, 50) to (10, 0); labels Day 0..10 | Ideal line endpoints (0, 50) and (10, 0); labels 0..10 | **PASS** |
| **TC-F-11.1** | BDC-F-011 | Inspect Actual Burndown chart line | Plotted Day 0 to 4 (values: 50, 47, 40, 31, 28) | Actual series: [50, 47, 40, 31, 28] | **PASS** |
| **TC-F-15.1** | BDC-F-015 | Inspect Schedule Status card | Status="Behind", Variance="-8 pts" | Badge="Behind", Variance="-8 pts" | **PASS** |
| **TC-F-13.1** | BDC-F-013 | Inspect initial dashboard layout | Dashboard grid renders chart and backlog side-by-side | Grid layout cleanly structured, zero console errors | **PASS** |

---

### Group G2: Sprint Configuration
*Test Cases: TC-F-01.1, TC-F-01.2, TC-F-01.3*

| Test Case ID | Requirement | Input / Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-01.1** | BDC-F-001 | Configure Name="Sprint 2", Duration=5, Start=2026-10-26, End=2026-10-30; Save | Header badge="Sprint 2"; duration=5; Current Day clamped to <= 5 | Header badge="Sprint 2", Current Day="Day 4 / 5" | **PASS** |
| **TC-F-01.2** | BDC-F-001 | Enter Duration=0, -3, 61 in sprint config form | Visible error alert shown; max 60 working days enforced; previous config retained | Errors displayed on 0, -3, 61. Previous config retained | **PASS** |
| **TC-F-01.3** | BDC-F-001 | Enter Start=2026-10-30, End=2026-10-26 (End before Start); Save | Form displays validation error; save rejected | Error: "Sprint end date must be on or after start date" | **PASS** |

---

### Group G3: Current Day & Marker
*Test Cases: TC-F-03.1, TC-F-03.2, TC-F-11.2, TC-F-14.1*

| Test Case ID | Requirement | Input / Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-03.1** | BDC-F-003 | Advance slider from Day 4 to Day 6 | Badge="Day 6 / 10"; Elapsed=6, Left=4; Actual series extends to Day 6 | Badge="Day 6 / 10", Elapsed=6, Left=4. Actual series extended | **PASS** |
| **TC-F-03.2** | BDC-F-003 | Test Current Day boundaries (Day 0 and Day 10) | Prev disabled at Day 0; Next disabled at Day 10 | Prev disabled at 0, Next disabled at 10 | **PASS** |
| **TC-F-11.2** | BDC-F-011 | Advance day and observe Actual trajectory | Actual line terminates at Current Day; future days null | Actual line plots exactly through Current Day | **PASS** |
| **TC-F-14.1** | BDC-F-014 | Verify vertical marker on chart canvas | Vertical reference line aligns with current day index | Vertical line plugin renders at active day index | **PASS** |

---

### Group G4: Add Issue Form & Validation
*Test Cases: TC-F-06.1, TC-F-06.2, TC-F-06.3, TC-F-06.4, TC-F-02.2 (add-half)*

| Test Case ID | Requirement | Input / Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-06.1** | BDC-F-006 | Submit Key="PROJ-201", Summary="New feature", Type="Story", Points="5", Status="To Do" | Issue added; Total Scope increases 50 -> 55; form resets; live polite announcement | Row PROJ-201 appended, Total Scope=55, announcement fired | **PASS** |
| **TC-F-06.2** | BDC-F-006 | Submit blank Add Issue form | Visible validation errors under fields; no issue appended | 4 validation errors displayed; table row count unchanged | **PASS** |
| **TC-F-06.3** | BDC-F-006 | Submit duplicate key "PROJ-101" | Duplicate key error displayed; issue rejected | Error: "Issue key already exists"; store unmutated | **PASS** |
| **TC-F-06.4** | BDC-F-006 | Select Status="Done" in Add Issue form | Completion Day input reveals; required only when Done | Group `hidden` removed; visible with `display: flex` | **PASS** |
| **TC-F-02.2** | BDC-F-002 | Add issue and verify backlog table update | Table dynamically adds new row without full page reload | Row added dynamically; table length updated to 11 | **PASS** |

---

### Group G5: Edit & Reopen Issue
*Test Cases: TC-F-07.1, TC-F-07.2, TC-F-07.3, TC-F-15.2*

| Test Case ID | Requirement | Input / Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-07.1** | BDC-F-007 | Edit PROJ-101 to Status="Done", CompletedDay=4; Save | Issue updated to Done; Completed Points increases 22 -> 30; Remaining decreases 28 -> 20 | Table badge="Done", Completed=30, Remaining=20 | **PASS** |
| **TC-F-07.2** | BDC-F-007 | Reopen PROJ-101 from Done to "In Progress"; Save | Completion Day resets to "--"; Completed Points drops back to 22 | Status="In Progress", Day="--", Completed=22 | **PASS** |
| **TC-F-07.3** | BDC-F-007 | Edit PROJ-101 with CompletedDay=8 while Current Day=4 | Rejected: Completion day cannot exceed Current Day | Error displayed; save rejected; store unmutated | **PASS** |
| **TC-F-15.2** | BDC-F-015 | Complete additional issues and observe Schedule Status | Schedule Status recalculates variance and status badge dynamically | Status updated dynamically in response to issue edit | **PASS** |

---

### Group G6: Delete Issue & Empty Backlog
*Test Cases: TC-F-08.1, TC-SR-04.1, TC-SR-04.2*

| Test Case ID | Requirement | Input / Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-08.1** | BDC-F-008 | Delete PROJ-101 from backlog | PROJ-101 removed; Total Scope drops 50 -> 42; chart updates | Row removed; Total Scope=42; chart recalculated | **PASS** |
| **TC-SR-04.1** | BDC-SR-004 | Delete all remaining issues until backlog is empty | Empty state message rendered; no errors or crash | Empty state displayed: "No issues in backlog..." | **PASS** |
| **TC-SR-04.2** | BDC-SR-004 | Inspect chart and KPIs when backlog is empty | Total Scope=0, chart shows flatline without NaN, Infinity, or crash | Total Scope=0; Ideal and Actual plot flat 0 lines | **PASS** |

---

### Group G7: Reset Data
*Test Cases: TC-F-09.1*

| Test Case ID | Requirement | Input / Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-09.1** | BDC-F-009 | Click "Reset Data" button in header | Backlog restored to 10 sample issues; Sprint restored to default (Day 4, 50 pts) | Backlog count=10, Scope=50, Day=4, Sprint="Sprint 1" | **PASS** |

---

### Group G8: Status Classification & Variance
*Test Cases: TC-F-12.1, TC-F-12.2, TC-F-12.3*

| Test Case ID | Requirement | Input / Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-12.1** | BDC-F-012 | Verify status when Variance <= -1 pt (Default Day 4: -8 pts) | Status is "Behind" | Badge="Behind", Variance="-8 pts" | **PASS** |
| **TC-F-12.2** | BDC-F-012 | Transition issues so Actual aligns with Ideal (Variance = 0 pts) | Status is "On Track" | Badge="On Track", Variance="0 pts" | **PASS** |
| **TC-F-12.3** | BDC-F-012 | Complete additional issues ahead of Ideal (Variance > +1 pt) | Status is "Ahead" | Badge="Ahead", Variance="+5 pts" | **PASS** |

---

### Group G9: Boundary & Edge Cases
*Test Cases: Single-day sprint, unbroken text, TC-F-10.2 (zero duration)*

| Test Case ID | Requirement | Input / Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **EDGE-01** | BDC-F-001 | Configure 1-day sprint (Start=2026-10-26, End=2026-10-26, Duration=1) | 1-day sprint accepted; slider ranges 0..1; chart plots days 0..1 | Single-day sprint configured successfully | **PASS** |
| **EDGE-02** | BDC-NF-004 | Add issue with 60-char unbroken key and 200-char unbroken summary | Layout wraps text safely; document has 0px horizontal scroll | `scrollWidth <= clientWidth`: true (0px overflow) | **PASS** |
| **TC-F-10.2** | BDC-F-010 | Call `calculateIdealSeries(50, 0)` and `computeAll` with duration=0 | Returns safe empty series and finite variance without NaN or crash | Safely returned empty series and finite variance | **PASS** |

---

## 3. Cross-Browser, Responsive & Theme Verification

### Cross-Browser Compatibility Matrix (BDC-NF-004)
| Requirement / Criterion | Google Chrome `156.0.8078.80` | Microsoft Edge `156.0.4314.58` | Mozilla Firefox |
| :--- | :---: | :---: | :---: |
| **Console Errors on Load** | **PASS** (0 errors) | **PASS** (0 errors) | **NOT EXECUTED** (See manual sheet) |
| **Page Horizontal Overflow (`scrollWidth === clientWidth`)** | **PASS** (0px overflow) | **PASS** (0px overflow) | **NOT EXECUTED** (See manual sheet) |
| **Responsive Viewports (1024, 1366, 1440, 1920 px)** | **PASS** (All 8 modes) | **PASS** (All 8 modes) | **NOT EXECUTED** (See manual sheet) |
| **Theme Switching (Light & Dark)** | **PASS** | **PASS** | **NOT EXECUTED** (See manual sheet) |
| **Chart Scaling & High-DPI Canvas** | **PASS** | **PASS** | **NOT EXECUTED** (See manual sheet) |
| **File Protocol Guidance Notice (`file://`)** | **PASS** | **PASS** | **NOT EXECUTED** (See manual sheet) |
| **TC-F-13.2 Table Scrolling Criterion** | **BLOCKED** | **BLOCKED** | **NOT EXECUTED** |

*Note on TC-F-13.2: In accordance with instructions, this criterion is marked **BLOCKED / PENDING CONFIRMATION WITH NAVEEN** because STP Section 6 specifies "no horizontal scrolling" whereas `sprint2_naveen_checklist.md` permits internal `.table-wrapper` scrolling while maintaining 0px root document overflow.*

---

## 4. Accessibility & Usability (BDC-NF-002)

| Test Case ID | Input / Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-NF-02.1-SKIP** | Press `Tab` on initial load, then `Enter` | First tab reaches skip link; Enter moves focus to `#main-content` | Skip link activates; focus moves to `#main-content` | **PASS** |
| **TC-NF-02.1-FOCUS** | Click Edit on PROJ-101, then press `Escape` | Focus moves into editor status select; Escape closes editor and restores focus to Edit button | Focus moved to `#edit-issue-status`; restored to Edit button | **PASS** |
| **TC-NF-02.2** | Scan all form controls for programmatic `<label for>` or `aria-label` | 100% of interactive controls have accessible labels | 100% of form inputs and buttons properly labeled | **PASS** |
| **A11Y-AUDIO** | Screen Reader auditory speech testing (NVDA / JAWS / Narrator) | Auditory speech verification of live regions and table cells | Physical audio speech output cannot be validated headless | **NOT EXECUTED** |

*See `sv-screen-reader-manual-sheet.md` for the complete manual screen reader test sheet.*

---

## 5. Security & Resilience (BDC-SR-001 to BDC-SR-005)

| Test Case ID | Requirement | Test Scenario | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-SR-01.1** | BDC-SR-001 | Submit XSS payload `<script>alert(1)</script><img src=x onerror=alert(1)>` in Summary | Rendered as plain text; zero script alerts; 0 injected executable DOM tags | Plain text rendered; 0 dialogs fired; 0 injected tags | **PASS** |
| **TC-SR-02.1** | BDC-SR-002 | Enter Points=-3, "abc", Infinity; Duration=-1, 61; Current Day=-1, 11 | Rejected prior to storage/calculation; serialized store identical | All invalid mutations rejected; store uncorrupted | **PASS** |
| **TC-NF-03.1** | BDC-NF-003 | Verify state isolation against invalid numeric inputs | State remains unchanged when mutations are rejected | Store state preserved identically | **PASS** |
| **TC-SR-05.1** | BDC-SR-005 | Inspect `meta[http-equiv="Content-Security-Policy"]` | Strict CSP policy present; `script-src 'self'`; no `unsafe-eval` | CSP enforced: `default-src 'self'; script-src 'self' ...` | **PASS** |
| **TC-SR-03.1** | BDC-SR-003 | Call `restoreFromJSON` with malformed JSON and corrupted schema | Corrupted data rejected cleanly without crash or stack trace | Handled safely; store preserved | **PASS** |

---

## 6. Performance Verification (BDC-NF-001 / TC-NF-01.1)

### Methodology: Method A (`?perf` Profiling)
Timing was captured across 10 consecutive iterations per action under `?perf` URL profiling on Chrome and Edge.

| User Interaction | STP Threshold | Google Chrome `156.0.8078.80` | Microsoft Edge `156.0.4314.58` | Evaluation |
| :--- | :--- | :--- | :--- | :--- |
| **Add Issue** | < 2000 ms | Min: 17.3 ms, **Med: 33.4 ms**, Max: 41.8 ms | Min: 32.6 ms, **Med: 37.3 ms**, Max: 55.1 ms | **PASS** (< 60 ms) |
| **Change Current Day** | < 2000 ms | Min: 19.3 ms, **Med: 34.2 ms**, Max: 41.9 ms | Min: 25.0 ms, **Med: 33.3 ms**, Max: 41.9 ms | **PASS** (< 45 ms) |
| **Edit Issue to Done** | < 2000 ms | Min: 19.7 ms, **Med: 32.1 ms**, Max: 40.2 ms | Min: 19.8 ms, **Med: 30.0 ms**, Max: 39.5 ms | **PASS** (< 45 ms) |
| **Delete Issue** | < 2000 ms | Min: 23.9 ms, **Med: 33.0 ms**, Max: 37.8 ms | Min: 20.7 ms, **Med: 29.9 ms**, Max: 40.1 ms | **PASS** (< 45 ms) |
| **Reset Data** | < 2000 ms | Min: 23.4 ms, **Med: 26.9 ms**, Max: 31.7 ms | Min: 25.9 ms, **Med: 32.4 ms**, Max: 39.1 ms | **PASS** (< 40 ms) |

---

## 7. Inspection & Architectural Verification (BDC-NF-005)

| Test Case ID | Requirement | Inspection Focus | Verification Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-NF-05.1** | BDC-NF-005 | Architectural module separation | Strict layering: `src/js/logic/` (pure functions), `src/js/data/` (state store), `src/js/ui/` (DOM rendering). Zero circular dependencies detected. | **PASS** |
| **TC-NF-05.2** | BDC-NF-005 | Independent testability without DOM | Calculation and validation engines execute independently in Node.js without `jsdom`. 255/255 tests pass in ~640 ms. *(Note: STP references Jest; repository uses `node --test`)*. | **PASS** |

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
  - `docs/reports/evidence/sv-run-chrome-2026-11-07.log`
  - `docs/reports/evidence/sv-run-msedge-2026-11-07.log`
  - `docs/reports/evidence/sv-results-chrome-2026-11-07.json` (53 test records)
  - `docs/reports/evidence/sv-results-msedge-2026-11-07.json` (53 test records)
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
The baseline commit `222089658f26badaf5c9f6d3c60e75986ebd6320` is **HIGH QUALITY, RESILIENT, AND SYSTEM VALIDATED**. All functional flows, security safeguards, responsive viewports, and performance thresholds pass with generous margins.

The application is approved for final sprint wrap-up pending team alignment on the table-scroll criterion.
