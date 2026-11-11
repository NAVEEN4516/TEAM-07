# System Validation: Mozilla Firefox Manual Execution Sheet (SHA 85391ae)

- **Document ID:** SV-SHEET-FIREFOX-02
- **Tested Commit:** `85391ae9181a666cc5b975968070e3dc5059a352` (short `85391ae`)
- **Execution Date:** 2026-11-10
- **QA Tester:** Bhuvi (`@stacktrace-bhuvi`)
- **Date:** 2026-11-10
- **Firefox:** Firefox 159.0.1 (installed release)
- **Windows build:** Microsoft Windows [Version 10.0.26200.9711]
- **HEAD:** `500a4be3961103480c6274b89eddca34a219ccce`
- **HEAD:src:** `4a2278fd1774ecfb0cb43d1e6f9b00e386b344e8`
- **URL:** http://127.0.0.1:8090/index.html (snapshot copy)
- **Status:** **EXECUTED (manual)** (33 PASS, 0 FAIL, 0 NOT EXECUTED [29 functional + 4 responsive])

---

## 1. Scope & Objective
This manual test sheet provides exact, step-by-step test instructions for human exploratory and visual verification on desktop Mozilla Firefox (version 120+ / 130+) against the Burndown Chart Generator at commit `85391ae9181a666cc5b975968070e3dc5059a352`.

*Note:* Headless automated Playwright validation on Firefox (`159.0 (Playwright build)`) has executed with **62 PASS / 0 FAIL / 1 BLOCKED** in `sv-results-firefox-2026-11-10-85391ae.json`. This manual checklist covers human visual perception, interactive browser font rendering, and physical OS windowing behavior.

---

## 2. Test Environment Setup
1. Clone the repository and checkout the tested commit:
   ```bash
   git checkout 85391ae9181a666cc5b975968070e3dc5059a352
   ```
2. Start a local HTTP server from the `src` directory:
   ```bash
   npx serve src -p 8080
   # OR
   python -m http.server 8080 --directory src
   ```
3. Launch desktop Mozilla Firefox and navigate to:
   ```text
   http://127.0.0.1:8080/index.html
   ```
4. Open Firefox Web Developer Tools (`F12` or `Ctrl + Shift + I`).

---

## 3. Test Cases & Execution Steps

### Group G1: Default State (Initial Load, Baseline Day 4)
*Baseline Pinned Defaults: Total = 50, Completed = 29, Remaining = 21, Days Elapsed = 4, Days Left = 6, Variance = +9, Status = "Ahead of Schedule", Ideal(4) = 30, Actual(0..4) = [50, 45, 42, 34, 21]*

| Test Case ID | Action / Input | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-F-02.1** | Load `http://127.0.0.1:8080/index.html` | Total Scope KPI displays 50 story points | 50 | PASS |
| **TC-F-04.1** | Inspect backlog table | Exactly 10 issues (PROJ-101 to PROJ-110) in order | Tester recorded PASS; no detail noted | PASS |
| **TC-F-05.1** | Verify all 10 table rows | All 6 columns match SRS Appendix A (key, summary, type, points, status, completedDay) | Compared 10 of 10 rows | PASS |
| **TC-F-10.1** | Inspect Burndown Chart Ideal series | Ideal line descends linearly: Ideal(0)=50, Ideal(4)=30, Ideal(10)=0 | Tester recorded PASS; no detail noted | PASS |
| **TC-F-11.1** | Inspect Actual burndown series | Plotted Day 0 to Day 4 (values: 50, 45, 42, 34, 21); Days 5..10 null | Tester recorded PASS; no detail noted | PASS |
| **TC-F-13.1** | Inspect chart dataset styles | Ideal dataset has dashed stroke; Actual dataset has solid stroke | Tester recorded PASS; no detail noted | PASS |
| **TC-F-15.1** | Inspect all 6 KPI cards | Total=50, Completed=29, Remaining=21, Elapsed=4, Left=6, Variance=+9, Status="Ahead of Schedule" | 50,29,21,4,6,+9 pts | PASS |

### Group G2: Sprint Configuration
| Test Case ID | Action / Input | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-F-01.1** | Configure Sprint: Name="Sprint 2", Duration=5, Start=2026-10-26, End=2026-10-30 → Save | Header badge="Sprint 2", duration pill="5 working days", timeline="Day 4 of 5", slider max=5 | Tester recorded PASS; no detail noted | PASS |
| **TC-F-01.2** | Configure Sprint: Duration=0, -3, 5.5, "abc", 61 → Save | Rejected with visible validation errors; boundary durations 1 and 60 accepted; previous config retained | Tester recorded PASS; no detail noted | PASS |
| **TC-F-01.3** | Configure Sprint: Start=2026-10-30, End=2026-10-26 (end before start) → Save | Validation error displayed; previous config and serialized state retained unchanged | Tester recorded PASS; no detail noted | PASS |

### Group G3: Current Day & Marker
| Test Case ID | Action / Input | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-F-03.1** | Advance slider or Next Day button to Day 6 | Badge reads "Day 6 of 10"; Elapsed=6, Left=4; Actual series extends to Day 6 without reload | Tester recorded PASS; no detail noted | PASS |
| **TC-F-03.2** | Set Current Day to 0 and 10 | Boundaries 0 and 10 accepted; out-of-range (-1, 11) rejected; Prev disabled at 0, Next disabled at 10 | Tester recorded PASS; no detail noted | PASS |
| **TC-F-11.2** | Inspect Actual series at Day 4 | Values for days > 4 strictly null/unplotted | Tester recorded PASS; no detail noted | PASS |
| **TC-F-14.1** | Observe vertical marker movement across Days 0, 4, 6, 10, Dark theme, and resize | Red vertical reference marker moves to exact x-coordinate (within 2px) with matching "Day N" badge | Tester recorded PASS; no detail noted | PASS |

### Group G4: Add Issue
| Test Case ID | Action / Input | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-F-06.1** | Enter Key="PROJ-111", Summary="Firefox Manual", Type="Story", Points="5", Status="To Do" → Add Issue | Issue appended to table; row count=11; Total Scope=55; Remaining=26 | Tester recorded PASS; no detail noted | PASS |
| **TC-F-02.2** | Add 5 pt issue then delete it | Total becomes 55 on add, then returns to 50 immediately on delete | Tester recorded PASS; no detail noted | PASS |
| **TC-F-06.2** | Enter duplicate key "PROJ-101" and "proj-101" | Duplicate key error displayed; backlog unmodified | Tester recorded PASS; no detail noted | PASS |
| **TC-F-06.3** | Submit empty form | Validation errors for Key, Summary, Points displayed; no issue created | Tester recorded PASS; no detail noted | PASS |
| **TC-F-06.4** | Add issue with storyPoints = 0 | Issue added; Total Scope remains 50; no NaN | Tester recorded PASS; no detail noted | PASS |

### Group G5: Edit & Reopen Issue
| Test Case ID | Action / Input | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-F-07.1** | Edit PROJ-106 (3 pts) to Done on Day 4 | Completed increases to 32; Remaining decreases to 18; Variance becomes +12 (Ahead of Schedule) | Tester recorded PASS; no detail noted | PASS |
| **TC-F-15.2** | Reopen PROJ-106 to To Do | Completed returns to 29; Remaining to 21; Variance to +9 | Tester recorded PASS; no detail noted | PASS |
| **TC-F-07.2** | Set completion day to 5 (at Day 4), 11 (duration 10), and Day 0 | Rejected with visible errors; serialized store unchanged | Tester recorded PASS; no detail noted | PASS |
| **TC-F-07.3** | Reopen to To Do | CompletedDay cell in table automatically resets to "--" | Tester recorded PASS; no detail noted | PASS |

### Group G6: Delete Issue & Empty Backlog
| Test Case ID | Action / Input | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-F-08.1** | Delete PROJ-110 (5 pts To Do) | Total=45, Completed=29, Remaining=16, Ideal(4)=27, Variance=+11 | Tester recorded PASS; no detail noted | PASS |
| **TC-SR-04.1** | Delete all remaining issues until empty | Empty state message rendered; Total=0, Completed=0, Remaining=0; no NaN | Tester recorded PASS; no detail noted | PASS |

### Group G7: Reset Data
| Test Case ID | Action / Input | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-F-09.1** | Click "Reset Data" in header | Exact baseline defaults restored: 10 issues, Total=50, Completed=29, Remaining=21, Day 4 of 10 | Tester recorded PASS; no detail noted | PASS |

### Group G8: Status Classification
| Test Case ID | Action / Input | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-F-12.1** | Baseline default state (Day 4, Variance = +9) | Status badge displays "Ahead of Schedule" | Tester recorded PASS; no detail noted | PASS |
| **TC-F-12.2** | Adjust state to Remaining = 30 (Ideal 30, Variance = 0) | Status badge displays "On Track" | Tester recorded PASS; no detail noted | PASS |
| **TC-F-12.3** | Adjust state to Remaining = 35 (Ideal 30, Variance = -5) | Status badge displays "Behind Schedule" | Tester recorded PASS; no detail noted | PASS |

### Responsive Viewports & Themes (Firefox Responsive Design Mode `Ctrl + Shift + M`)
| Viewport | Light Theme | Dark Theme | No Page Scroll (`scrollWidth <= clientWidth`) | Table Wrapper Behavior | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1024 x 900** | PASS | PASS | page: 0 | table: 0 | PASS |
| **1366 x 900** | PASS | PASS | page: 0 | table: 0 | PASS |
| **1440 x 900** | PASS | PASS | page: 0 | table: 0 | PASS |
| **1920 x 900** | PASS | PASS | page: 0 | table: 0 | PASS |

- **Long key (60 chars) + long summary (200 chars), layout intact?:** yes

---

## 4. Sign-Off
- **Automated Execution:** Completed in Playwright Firefox 159 (`sv-results-firefox-2026-11-10-85391ae.json`).
- **Manual Sheet Status:** **EXECUTED (manual)** (33 PASS, 0 FAIL, 0 NOT EXECUTED).
- **QA Tester:** Bhuvi (`@stacktrace-bhuvi`)
