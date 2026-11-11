# System Validation: Mozilla Firefox Manual Execution Sheet

- **Document ID:** SV-SHEET-FIREFOX-01
- **Tested Commit (Baseline SHA):** `222089658f26badaf5c9f6d3c60e75986ebd6320`
- **Execution Date:** 2026-11-07
- **QA Tester:** Bhuvi (`@stacktrace-bhuvi`)
- **Status:** **NOT EXECUTED** (Host environment limitation: Mozilla Firefox is not installed on the Windows test workstation)

---

## 1. Scope & Objective
This manual test sheet provides exact, step-by-step test instructions for running full system validation on Mozilla Firefox (version 120+ desktop) against the Burndown Chart Generator at baseline commit `222089658f26badaf5c9f6d3c60e75986ebd6320`.

Automated Chromium runs on Google Chrome (`156.0.8078.80`) and Microsoft Edge (`157.0.4341.42`) completed with 52 PASS / 0 FAIL / 1 BLOCKED. This sheet enables QA teammates or CI runners with Firefox installed to complete cross-engine verification.

---

## 2. Test Environment Setup
1. Clone the repository and checkout the tested baseline:
   ```bash
   git checkout 222089658f26badaf5c9f6d3c60e75986ebd6320
   ```
2. Start a local HTTP server from the `src` directory:
   ```bash
   npx serve src -p 8080
   # OR
   python -m http.server 8080 --directory src
   ```
3. Launch Mozilla Firefox and navigate to:
   ```text
   http://127.0.0.1:8080/index.html
   ```
4. Open the Firefox Web Developer Tools (`F12` or `Ctrl + Shift + I`).

---

## 3. Test Cases & Execution Steps

### Group G1: Default State (Initial Load, Baseline Day 4)
*Baseline Pinned Defaults: Total = 50, Completed = 29, Remaining = 21, Days Elapsed = 4, Days Left = 6, Variance = +9, Status = "Ahead of Schedule", Ideal(4) = 30, Actual(0..4) = [50, 45, 42, 34, 21]*

| Test Case ID | Action / Input | Expected Result | Firefox Result |
| :--- | :--- | :--- | :--- |
| **TC-F-02.1** | Load `http://127.0.0.1:8080/index.html` | Backlog table renders 10 default issues (PROJ-101 to PROJ-110) | [ ] PASS  [ ] FAIL |
| **TC-F-04.1** | Inspect KPI dashboard | Total Scope = 50 story points | [ ] PASS  [ ] FAIL |
| **TC-F-05.1** | Inspect timeline & progress KPIs | Completed = 29, Remaining = 21, Days Elapsed = 4, Days Left = 6 | [ ] PASS  [ ] FAIL |
| **TC-F-10.1** | Inspect Burndown Chart | Ideal line descends from (0, 50) through (4, 30) to (10, 0); labels Day 0..10 | [ ] PASS  [ ] FAIL |
| **TC-F-11.1** | Inspect Actual line | Plotted Day 0 to Day 4 (values: 50, 45, 42, 34, 21); Days 5..10 are null | [ ] PASS  [ ] FAIL |
| **TC-F-15.1** | Inspect Schedule Status card | Status badge displays "Ahead of Schedule", Variance = +9 | [ ] PASS  [ ] FAIL |
| **TC-F-13.1** | Inspect layout structure | Header, banner, KPIs, chart, backlog grid intact; zero console errors | [ ] PASS  [ ] FAIL |

### Group G2: Sprint Configuration
| Test Case ID | Action / Input | Expected Result | Firefox Result |
| :--- | :--- | :--- | :--- |
| **TC-F-01.1** | Click "Configure Sprint" → Name="Sprint 2", Duration=5, Start=2026-10-26, End=2026-10-30 → Save | Header badge="Sprint 2"; duration pill="5 working days"; Current Day badge reads "Day 4 of 5"; slider max=5 | [ ] PASS  [ ] FAIL |
| **TC-F-01.2** | Click "Configure Sprint" → Duration=0, then -3, then 61 → Save | Form displays alert role with error list; previous valid config retained; 60 max days enforced | [ ] PASS  [ ] FAIL |
| **TC-F-01.3** | Set Start=2026-10-30, End=2026-10-26 → Save | Form displays validation error: "Sprint end date must be on or after start date" | [ ] PASS  [ ] FAIL |

### Group G3: Current Day & Marker
| Test Case ID | Action / Input | Expected Result | Firefox Result |
| :--- | :--- | :--- | :--- |
| **TC-F-03.1** | Advance slider to Day 6 (or click "+") | Badge reads "Day 6 of 10"; Elapsed=6, Left=4; Actual series extends to Day 6 | [ ] PASS  [ ] FAIL |
| **TC-F-03.2** | Drag slider to Day 0, then Day 10 | Boundary values accepted; Prev disabled at Day 0; Next disabled at Day 10 | [ ] PASS  [ ] FAIL |
| **TC-F-11.2** | Observe Actual line past Current Day | Line terminates at Current Day; remaining points beyond Current Day are null/unplotted | [ ] PASS  [ ] FAIL |
| **TC-F-14.1** | Inspect Current Day vertical marker | Dotted vertical reference line aligns exactly with current day index on x-axis | [ ] PASS  [ ] FAIL |

### Group G4: Add Issue
| Test Case ID | Action / Input | Expected Result | Firefox Result |
| :--- | :--- | :--- | :--- |
| **TC-F-06.1** | Enter Key="TEST-1", Summary="Firefox check", Type="Story", Points="5", Status="To Do" → Add Issue | Issue appended to table; Total Scope increases from 50 to 55; form resets; polite live announcement fired | [ ] PASS  [ ] FAIL |
| **TC-F-06.2** | Enter duplicate key "PROJ-101" | Duplicate key error displayed; issue rejected | [ ] PASS  [ ] FAIL |
| **TC-F-06.3** | Submit empty form | Validation errors displayed: "Issue key is required.", "Summary is required.", "Story points must be a non-negative number." | [ ] PASS  [ ] FAIL |
| **TC-F-06.4** | Select Status="Done" | Completion Day field reveals (hidden attribute removed, display flex visible) | [ ] PASS  [ ] FAIL |

### Group G5: Edit & Reopen Issue
| Test Case ID | Action / Input | Expected Result | Firefox Result |
| :--- | :--- | :--- | :--- |
| **TC-F-07.1** | Click Edit on PROJ-106 (3 pts) → Status="Done", Day=4 → Save | PROJ-106 marked Done; Completed Points increases from 29 to 32; Remaining decreases from 21 to 18; Variance becomes +12 | [ ] PASS  [ ] FAIL |
| **TC-F-07.2** | Reopen Done issue to "In Progress" | Completion Day resets to "--"; Completed points decreases accordingly | [ ] PASS  [ ] FAIL |
| **TC-F-07.3** | Set Completion Day > Current Day | Error displayed; completion day must be <= Current Day | [ ] PASS  [ ] FAIL |
| **TC-F-15.2** | Verify status transition | Status recalculates; variance and badge reflect updated trajectory | [ ] PASS  [ ] FAIL |

### Group G6: Delete Issue & Empty Backlog
| Test Case ID | Action / Input | Expected Result | Firefox Result |
| :--- | :--- | :--- | :--- |
| **TC-F-08.1** | Click Delete on PROJ-110 (5 pts To Do) | Row removed from backlog table; Total Scope drops 50 -> 45; Remaining decreases from 21 to 16 | [ ] PASS  [ ] FAIL |
| **TC-SR-04.1** | Delete remaining issues until empty | Empty state message rendered: "No issues in backlog. Reset Data restores the sample sprint." | [ ] PASS  [ ] FAIL |
| **TC-SR-04.2** | Inspect chart and KPIs when empty | Total Scope = 0; chart shows 0 flatline without NaN, division by zero, or crash | [ ] PASS  [ ] FAIL |

### Group G7: Reset Data
| Test Case ID | Action / Input | Expected Result | Firefox Result |
| :--- | :--- | :--- | :--- |
| **TC-F-09.1** | Click "Reset Data" in header | Backlog restored to 10 sample issues; Sprint restored to default (Day 4, 50 pts, 10 days, Completed=29, Remaining=21) | [ ] PASS  [ ] FAIL |

### Group G8: Status Classification
| Test Case ID | Action / Input | Expected Result | Firefox Result |
| :--- | :--- | :--- | :--- |
| **TC-F-12.1** | Baseline default state (Day 4, Variance = +9) | Status is "Ahead of Schedule" with success badge styling | [ ] PASS  [ ] FAIL |
| **TC-F-12.2** | Adjust state such that Actual Remaining equals Ideal (Variance = 0) | Status is "On Track" | [ ] PASS  [ ] FAIL |
| **TC-F-12.3** | Fall behind ideal such that Actual Remaining > Ideal + 1 pt (Variance < -1) | Status is "Behind" | [ ] PASS  [ ] FAIL |

### Responsive Viewports & Themes (Firefox Responsive Design Mode `Ctrl + Shift + M`)
| Viewport | Light Theme | Dark Theme | No Page Scroll | Table Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **1024 x 900** | [ ] PASS | [ ] PASS | `scrollWidth === clientWidth` | Wrapper scrolls internally or fits |
| **1366 x 900** | [ ] PASS | [ ] PASS | `scrollWidth === clientWidth` | Wrapper fits or scrolls internally |
| **1440 x 900** | [ ] PASS | [ ] PASS | `scrollWidth === clientWidth` | Full width fits grid |
| **1920 x 900** | [ ] PASS | [ ] PASS | `scrollWidth === clientWidth` | Full width fits grid |

### Performance Verification (Method A: `?perf`)
1. Navigate to `http://127.0.0.1:8080/index.html?perf`.
2. Execute Add Issue, Change Day, Edit Issue, Delete Issue, and Reset Data.
3. In Firefox Web Console, inspect `window.__perfLog`:
   ```javascript
   window.__perfLog.map(e => e.ms)
   ```
4. Verify every update duration is < 2000 ms (expected ~20–40 ms).

---

## 4. Sign-Off
- **Automated Validation:** NOT EXECUTED on this workstation due to missing binary.
- **Manual Sheet Prepared By:** Bhuvi (`@stacktrace-bhuvi`)
- **Recommended Follow-up:** Execute this sheet in a Linux or macOS CI container having Firefox ESR installed.
