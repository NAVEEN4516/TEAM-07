# System Validation: Defects & Discrepancies Log

- **Document ID:** SV-DEFECTS-LOG-01
- **Tested Commits:**
  - Initial Baseline SHA: `222089658f26badaf5c9f6d3c60e75986ebd6320`
  - Defect Discovery SHA: `e901ecf17232f97a307ab6c723ba13bdc26aa744`
  - Defect Fix SHA: `a8be0d2` (verified in subsequent test commits)
- **Execution Dates:** 2026-11-07 (Baseline & Run 2), 2026-11-10 (Run 3 & Retest)
- **QA Tester:** Bhuvi (`@stacktrace-bhuvi`)
- **Status:** **1 Fixed UI Defect (SV-D-01), 4 Architectural / Specification Observations (OBS-01 to OBS-04)**

---

## 1. Executive Summary
During System Validation testing of the baseline commit `222089658f26badaf5c9f6d3c60e75986ebd6320`, zero blocking data integrity failures or security vulnerabilities were identified in the codebase. All automated unit tests passed, and browser system validation test records passed across Chromium engines with 1 test case (TC-F-13.2) marked BLOCKED pending team alignment on the table-scroll criterion.

During multi-browser and accessibility execution on branch commit `e901ecf17232f97a307ab6c723ba13bdc26aa744`, automated status indicator contrast and visual verification revealed a UI styling defect (**SV-D-01**): schedule status badges rendered without their intended CSS class rules, appearing with transparent backgrounds and identical text color across all three schedule states. The defect was isolated, fixed in `a8be0d2`, backed by a strengthened automated regression test in `tests/ui/kpiCards.test.js`, and retested across Google Chrome, Microsoft Edge, and Mozilla Firefox.

Four specification ambiguities and behavioral observations (OBS-01 through OBS-04) are also documented below.

---

## 2. Defects & Observations Table

| Item ID | Category | Severity | Test Case Reference | Title | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SV-D-01** | UI Styling Defect | Medium | TC-NF-02.2, TC-NF-02.3, BDC-NF-002 | Schedule status badge unstyled due to CSS class selector mismatch | **FIXED & VERIFIED** |
| **OBS-01** | Ambiguity | Medium | TC-F-13.2, TC-NF-04.2 | Table Scrolling Criterion Ambiguity | **PENDING CONFIRMATION WITH NAVEEN** |
| **OBS-02** | Spec Divergence | Low | TC-F-01.3 | Sprint End Date Equality (`endDate === startDate`) | **PROPOSED CORRECTION** |
| **OBS-03** | Edge Behavior | Low | TC-F-01.1, TC-F-07.1 | Duration Shortening Impact on Completed Issues | **DOCUMENTED AS DESIGN INTENT** |
| **OBS-04** | Tooling | Info | TC-NF-05.2 | Test Runner Tooling Reference (Jest vs `node --test`) | **PROPOSED CORRECTION** |

---

## 3. Detailed Item Analysis

### Item SV-D-01: Schedule Status Badge Unstyled Due to CSS Selector Mismatch
- **Reference:** SRS Section 5 (BDC-NF-002: Accessible Status Indicators), Software Test Plan Section 13.2 (TC-NF-02.2), Testing Phase Addendum (clear text and visibly distinct colors).
- **Severity:** **Medium** (Visual accessibility defect; does not crash runtime or corrupt data, but prevents visual schedule state distinction by color, requiring users to rely solely on text reading).
- **Discovery SHA:** `e901ecf17232f97a307ab6c723ba13bdc26aa744` (Discovered by automated status-indicator group on 2026-11-10).
- **Reproduction:**
  1. Extract application source at commit `e901ecf`:
     ```bash
     git archive --format=tar e901ecf src -o /tmp/e901.tar && tar -xf /tmp/e901.tar -C /tmp/e901
     ```
  2. Serve `/tmp/e901/src` on a local HTTP port.
  3. Navigate to `http://127.0.0.1:<port>/index.html?dev`.
  4. Advance to Day 4 (Ahead), Day 6 (On Track), and Day 7 (Behind) under light and dark themes.
  5. Inspect computed styles (`backgroundColor`, `color`, `border`) of `[data-testid="status-badge"]`.
- **Expected vs. Actual:**
  - **Expected:** Each schedule status renders distinctive background, border, and text styling with WCAG AA contrast $\ge 4.5:1$ against the badge background and visible pairwise color distance between states.
  - **Actual (Before Fix at `e901ecf`):**
    `src/js/ui/kpiCards.js` renders HTML classes `.status-badge.status--ahead`, `.status-badge.status--on-track`, and `.status-badge.status--behind`. However, `src/css/styles.css` only defined rules for `.badge-ahead`, `.badge-ontrack`, and `.badge-behind`. Because of this selector naming mismatch, no badge styling rules matched:
    - `backgroundColor`: `rgba(0, 0, 0, 0)` (fully transparent) across all states and themes.
    - `color`: `rgb(15, 23, 42)` in light theme and `rgb(249, 250, 251)` in dark theme for **all three states** (Ahead, On Track, Behind).
    - `borderColor`: `rgba(0, 0, 0, 0)`.
    - Zero color differentiation existed between Ahead, On Track, and Behind.
  - **Actual (After Fix):**
    - Light Theme:
      - Ahead: text `rgb(6, 95, 70)` on background `rgb(236, 253, 245)`, border `rgb(167, 243, 208)`. Contrast 8.01:1.
      - On Track: text `rgb(30, 64, 175)` on background `rgb(239, 246, 255)`, border `rgb(191, 219, 254)`. Contrast 7.64:1.
      - Behind: text `rgb(185, 28, 28)` on background `rgb(254, 242, 242)`, border `rgb(254, 202, 202)`. Contrast 4.63:1.
    - Dark Theme:
      - Ahead: text `rgb(52, 211, 153)` on background `rgba(16, 185, 129, 0.15)`. Contrast 6.42:1.
      - On Track: text `rgb(96, 165, 250)` on background `rgba(59, 130, 246, 0.15)`. Contrast 4.86:1.
      - Behind: text `rgb(248, 113, 113)` on background `rgba(239, 68, 68, 0.15)`. Contrast 5.12:1.
    - Evidence captured: `docs/reports/evidence/sv-defect-sv-d-01-before.json`, `docs/reports/evidence/sv-defect-sv-d-01-after.json`, and before/after screenshots for Days 4, 6, 7 in light and dark themes.
- **Owner:** Frontend (`@stacktrace-bhuvi`)
- **Fix Commit:** `a8be0d2` (Added `.status-badge.status--ahead`, `.status-badge.status--on-track`, `.status-badge.status--behind` rules to `src/css/styles.css`).
- **Regression Test Path:** `tests/ui/kpiCards.test.js` (`BDC-NF-002: Status Badge Stylesheet Rules`). Confirmed failing with `AssertionError` against `e901ecf` CSS and passing on fixed CSS.
- **Retest Result:** Verified PASS across Google Chrome (156.0.8078.80), Microsoft Edge (157.0.4341.42), and Mozilla Firefox (159.0). All WCAG contrast ratios $\ge 4.5:1$.

---

### Item OBS-01: Table Scrolling Criterion Ambiguity (TC-F-13.2)
- **Reference:** Software Test Plan (STP) Section 6, SRS Section 5, `sprint2_naveen_checklist.md`.
- **Description:** 
  STP Section 6 contains the literal acceptance criterion: *"no horizontal scrolling"*. In `sprint2_naveen_checklist.md`, Naveen clarified that internal container scrolling within `.table-wrapper` is acceptable on narrow viewports (e.g., 1024px) to preserve data legibility without clipping column content, provided the outer document (`document.documentElement.scrollWidth === clientWidth`) has zero overflow.
- **Observed Behavior:** 
  At all tested viewports (1024px, 1366px, 1440px, 1920px) under both light and dark themes, the page-level horizontal overflow is strictly `0px` (`scrollWidth <= clientWidth`). The backlog table fits comfortably or scrolls within its `.table-wrapper` container.
- **Action Taken:** 
  In accordance with testing-phase instructions, this item is marked **PENDING CONFIRMATION WITH NAVEEN** rather than `PASS` until formal sign-off on the checklist interpretation.

---

### Item OBS-02: Sprint End Date Equality (TC-F-01.3)
- **Reference:** SRS Section 4.1 (BDC-F-001), `src/js/logic/validationManager.js`.
- **Description:** 
  The literal text of SRS Section 4.1 states: *"Sprint end date must follow sprint start date"*. However, `src/js/logic/validationManager.js` allows a single-day sprint where `endDate === startDate` (`candidate.endDate < candidate.startDate` triggers rejection; equal dates are accepted).
- **Observed Behavior:** 
  Entering identical start and end dates (e.g., Start: `2026-10-26`, End: `2026-10-26`) with Duration=1 succeeds. Entering End before Start (e.g., Start: `2026-10-30`, End: `2026-10-26`) is cleanly rejected with *"Sprint end date must be on or after start date"*.
- **Impact:** 
  This behavior is user-friendly and accommodates single-day sprints.
- **Action Taken:** 
  Proposed formal test case correction in `sv-proposed-test-case-corrections.md` to align the STP text with the validator logic.

---

### Item OBS-03: Duration Shortening Impact on Completed Issues
- **Reference:** SRS Section 4.1, `src/js/logic/burndownEngine.js`.
- **Description:** 
  When an existing sprint with duration 10 days containing issues completed on Day 8 is reconfigured to duration 5 days, the backlog table retains all historical issues (including those with `completedDay = 8`).
- **Observed Behavior:** 
  In `burndownEngine.js`:
  ```javascript
  // calculateCompletedPoints filters: issue.completedDay <= day
  ```
  When the sprint duration is shortened, the KPI card for Completed Points counts only issues completed on or before the current day (`currentDay` is clamped to `<= durationDays`). The backlog table continues to list the completed issue with its original `completedDay` intact.
- **Evaluation:** 
  Preserving historical data in the backlog table while clamping timeline KPIs prevents accidental data loss during sprint reconfiguration. Documented as intended design.

---

### Item OBS-04: Test Runner Framework Reference (TC-NF-05.2)
- **Reference:** STP Section 13.5 (TC-NF-05.2).
- **Description:** 
  STP TC-NF-05.2 states: *"Execute Jest test runner without jsdom: npm test"*.
- **Observed Behavior:** 
  The repository does not use Jest; it uses the native Node.js test runner (`node --test`) introduced in Node 20+, achieving zero-dependency execution.
- **Action Taken:** 
  Proposed test case correction to update STP wording from *"Jest"* to *"node --test"*.

---

## 4. Conclusion
The tested baseline SHA `222089658f26badaf5c9f6d3c60e75986ebd6320` is stable, secure, and production-ready. No code modifications are required for these items.
