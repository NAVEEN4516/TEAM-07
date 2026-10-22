# Sprint 1 QA Test Execution Checklist

**Project:** Agile Burndown Chart Generator  
**Document Ref:** `docs/test-plan/sprint1_checklist.md`  
**Derived From:** `Burndown_Chart_Test_Plan.docx` (Section 13.2, Table 9)  
**SRS Reference:** `Burndown_Chart_Generator_SRS.docx` (Section 4, BDC-F-001 to BDC-F-015; Section 5, BDC-NF-001 to BDC-NF-005; Section 5.1.2, BDC-SR-001 to BDC-SR-005)  
**Execution Target:** Sprint 1 Functional, Non-Functional, and Security Verification  
**Total Verification Items:** 44 test cases (30 Functional `TC-F-01.1` to `TC-F-15.2`, 8 Non-Functional `TC-NF-01.1` to `TC-NF-05.2`, 6 Security `TC-SR-01.1` to `TC-SR-05.1`)  
**Demo Evidence:** [`demo_sprint1_mvp.mp4`](../../demo_sprint1_mvp.mp4) (1-minute Sprint 1 MVP walkthrough)  
**Automated Test Suite:** 119 unit tests passing across 36 suites via `node --test`  

---

## Traceability & Coverage Matrix

| Requirement ID | Feature Area | Test Cases | Priority | Module Tested |
| :--- | :--- | :--- | :--- | :--- |
| **BDC-F-001** | Configure Sprint Parameters | `TC-F-01.1`, `TC-F-01.2`, `TC-F-01.3` | High | `UIManager`, `ValidationManager` |
| **BDC-F-002** | Initial Commitment Points Calculation | `TC-F-02.1`, `TC-F-02.2` | High | `BurndownEngine`, `DataManager` |
| **BDC-F-003** | Current Day Timeline Control | `TC-F-03.1`, `TC-F-03.2` | High | `UIManager`, `BurndownEngine` |
| **BDC-F-004** | Load Default Simulated Dataset | `TC-F-04.1` | High | `DataManager` |
| **BDC-F-005** | Display Backlog Table | `TC-F-05.1` | High | `UIManager` |
| **BDC-F-006** | Add Issue to Backlog | `TC-F-06.1`, `TC-F-06.2`, `TC-F-06.3`, `TC-F-06.4` | High | `UIManager`, `ValidationManager`, `DataManager` |
| **BDC-F-007** | Update Issue Status & Completion Day | `TC-F-07.1`, `TC-F-07.2`, `TC-F-07.3` | High | `UIManager`, `ValidationManager`, `BurndownEngine` |
| **BDC-F-008** | Delete Issue from Backlog | `TC-F-08.1` | Medium | `UIManager`, `DataManager`, `BurndownEngine` |
| **BDC-F-009** | Reset Dataset to Baseline Defaults | `TC-F-09.1` | Medium | `DataManager` |
| **BDC-F-010** | Ideal Burndown Calculation | `TC-F-10.1`, `TC-F-10.2` | High | `BurndownEngine` |
| **BDC-F-011** | Actual Burndown Calculation | `TC-F-11.1`, `TC-F-11.2` | High | `BurndownEngine` |
| **BDC-F-012** | Schedule Variance & Status Classification | `TC-F-12.1`, `TC-F-12.2`, `TC-F-12.3` | High | `BurndownEngine` |
| **BDC-F-013** | Burndown Chart Display | `TC-F-13.1`, `TC-F-13.2` | High | `ChartManager` |
| **BDC-F-014** | Current-Day Timeline Marker | `TC-F-14.1` | Medium | `ChartManager` |
| **BDC-F-015** | Sprint KPI Dashboard Summary | `TC-F-15.1`, `TC-F-15.2` | High | `UIManager`, `BurndownEngine` |
| **BDC-NF-001** | Performance & Real-time Update (< 2s) | `TC-NF-01.1` | High | `BurndownEngine`, `ChartManager` |
| **BDC-NF-002** | Usability, Keyboard & Status Indicators | `TC-NF-02.1`, `TC-NF-02.2` | Medium | `UIManager` |
| **BDC-NF-003** | Data Integrity & Rejection of Invalid Data | `TC-NF-03.1` | High | `ValidationManager` |
| **BDC-NF-004** | Compatibility & Viewport Responsiveness | `TC-NF-04.1`, `TC-NF-04.2` | Medium | `UIManager` |
| **BDC-NF-005** | Maintainability & Module Testability | `TC-NF-05.1`, `TC-NF-05.2` | Medium | `All modules` |
| **BDC-SR-001** | Safe Encoding of User Text (XSS Prevention) | `TC-SR-01.1` | High | `UIManager`, `ValidationManager` |
| **BDC-SR-002** | Strict Numeric Input Validation | `TC-SR-02.1` | High | `ValidationManager` |
| **BDC-SR-003** | Safe Browser Storage Handling | `TC-SR-03.1` | High | `DataManager` |
| **BDC-SR-004** | Boundary & Safe Edge-Case Handling | `TC-SR-04.1`, `TC-SR-04.2` | High | `BurndownEngine`, `ValidationManager` |
| **BDC-SR-005** | Dependency Safety & Content Security Policy | `TC-SR-05.1` | Medium | `DataManager`, `Deployment` |

---

## Functional Test Execution Checklist

### 1. Sprint Configuration (`BDC-F-001`)

- [x] **TC-F-01.1** — Configure a valid sprint
  - **Requirement ID:** `BDC-F-001`
  - **Type:** Functional
  - **Input / Steps:** Set `Name="Sprint 2"`, `Duration=5`, `Start=26-Oct-2026`, `End=30-Oct-2026`.
  - **Expected Outcome:** Configuration saved; chart re-renders with `Total Days = 5`.
  - **Status:** Passed

- [x] **TC-F-01.2** — Invalid duration rejected
  - **Requirement ID:** `BDC-F-001`
  - **Type:** Negative
  - **Input / Steps:** Input `Duration = 0`, then `-3`, then `"abc"`.
  - **Expected Outcome:** Visible error message displayed; previous valid configuration retained without state corruption.
  - **Status:** Passed

- [x] **TC-F-01.3** — End date before start date rejected
  - **Requirement ID:** `BDC-F-001`
  - **Type:** Negative
  - **Input / Steps:** Input `Start=30-Oct-2026`, `End=26-Oct-2026`.
  - **Expected Outcome:** Configuration rejected with a visible error message.
  - **Status:** Passed

---

### 2. Initial Commitment Points (`BDC-F-002`)

- [x] **TC-F-02.1** — Total committed points for default dataset
  - **Requirement ID:** `BDC-F-002`
  - **Type:** Functional
  - **Input / Steps:** Open application with default simulated dataset (Appendix A).
  - **Expected Outcome:** `Total Committed Story Points = 50`.
  - **Status:** Passed

- [x] **TC-F-02.2** — Total updates on issue addition and deletion
  - **Requirement ID:** `BDC-F-002`
  - **Type:** Functional
  - **Input / Steps:** Add issue with 5 points, then delete it.
  - **Expected Outcome:** Total becomes `55`, then returns to `50` immediately.
  - **Status:** Passed

---

### 3. Current Day Timeline Control (`BDC-F-003`)

- [x] **TC-F-03.1** — Change Current Day
  - **Requirement ID:** `BDC-F-003`
  - **Type:** Functional
  - **Input / Steps:** Move Current Day control from `4` to `6`.
  - **Expected Outcome:** Actual burndown, chart marker, KPIs, and status update immediately without page reload.
  - **Status:** Passed

- [x] **TC-F-03.2** — Out-of-range Current Day rejected
  - **Requirement ID:** `BDC-F-003`
  - **Type:** Boundary
  - **Input / Steps:** Input `Current Day = 0`, `11`, `-1`, `"abc"` (with Sprint `Duration = 10`).
  - **Expected Outcome:** Each invalid value is rejected; Current Day remains unchanged.
  - **Status:** Passed

---

### 4. Load Default Simulated Dataset (`BDC-F-004`)

- [x] **TC-F-04.1** — Default dataset loaded on initial run
  - **Requirement ID:** `BDC-F-004`
  - **Type:** Functional
  - **Input / Steps:** Open application with empty `localStorage` (fresh environment).
  - **Expected Outcome:** Exactly 10 issues (`PROJ-101` to `PROJ-110`) displayed with correct fields, and `Total Committed Story Points = 50`.
  - **Status:** Passed

---

### 5. Display Backlog Table (`BDC-F-005`)

- [x] **TC-F-05.1** — Backlog table content matches dataset
  - **Requirement ID:** `BDC-F-005`
  - **Type:** Functional
  - **Input / Steps:** Open application with default dataset (Appendix A).
  - **Expected Outcome:** Exactly 10 rows displayed, one per issue; columns for `key`, `summary`, `type`, `points`, `status`, and `completion day` match dataset values.
  - **Status:** Passed

---

### 6. Backlog Issue Addition (`BDC-F-006`)

- [x] **TC-F-06.1** — Add a valid issue
  - **Requirement ID:** `BDC-F-006`
  - **Type:** Functional
  - **Input / Steps:** Enter `Key=PROJ-111`, `Summary="Export report"`, `Type=Story`, `Points=5`, `Status=To Do`.
  - **Expected Outcome:** Issue added to backlog; `Total Story Points = 55`; chart and KPIs update accordingly.
  - **Status:** Passed

- [x] **TC-F-06.2** — Duplicate key rejected
  - **Requirement ID:** `BDC-F-006`
  - **Type:** Negative
  - **Input / Steps:** Submit issue with `Key=PROJ-101` (already exists).
  - **Expected Outcome:** Validation error displayed; duplicate issue is not added.
  - **Status:** Passed

- [x] **TC-F-06.3** — Empty required fields rejected
  - **Requirement ID:** `BDC-F-006`
  - **Type:** Negative
  - **Input / Steps:** Submit form with empty Key, then with empty Summary.
  - **Expected Outcome:** Validation message shown for each missing required field; issue is not added.
  - **Status:** Passed

- [x] **TC-F-06.4** — Zero-point issue allowed
  - **Requirement ID:** `BDC-F-006`
  - **Type:** Boundary
  - **Input / Steps:** Submit new issue with `Points=0`.
  - **Expected Outcome:** Issue is accepted and added; Total Story Points remains unchanged; no `NaN` or error produced.
  - **Status:** Passed

---

### 7. Issue Status & Completion Day Tracking (`BDC-F-007`)

- [x] **TC-F-07.1** — Mark issue Done with valid completion day
  - **Requirement ID:** `BDC-F-007`
  - **Type:** Functional
  - **Input / Steps:** Change `PROJ-106` (3 pts) to `Status=Done`, `Completion Day=4` (where `Current Day=4`).
  - **Expected Outcome:** Accepted; Actual Burndown on Day 4 becomes `50 - 32 = 18`.
  - **Status:** Passed

- [x] **TC-F-07.2** — Completion day out of range rejected
  - **Requirement ID:** `BDC-F-007`
  - **Type:** Boundary
  - **Input / Steps:** Set `Completion Day=5` (when `Current Day=4`), then `11` (when `Duration=10`).
  - **Expected Outcome:** Update rejected with a validation error message; status unchanged.
  - **Status:** Passed

- [x] **TC-F-07.3** — Status transitions and completion day lifecycle
  - **Requirement ID:** `BDC-F-007`
  - **Type:** Functional
  - **Input / Steps:** Transition `To Do -> Done` (with valid day); then transition `Done -> To Do`.
  - **Expected Outcome:** Direct `To Do -> Done` transition allowed; moving out of `Done` automatically clears the recorded completion day.
  - **Status:** Passed

---

### 8. Backlog Issue Deletion (`BDC-F-008`)

- [x] **TC-F-08.1** — Delete an issue from backlog
  - **Requirement ID:** `BDC-F-008`
  - **Type:** Functional
  - **Input / Steps:** Delete `PROJ-110` (5 pts, To Do) at `Current Day=4`.
  - **Expected Outcome:** Issue row removed; `Total=45`, `Ideal(4)=27`, `Remaining=16`, `Variance=+11`; KPI cards refresh immediately.
  - **Status:** Passed

---

### 9. Dataset Reset Functionality (`BDC-F-009`)

- [x] **TC-F-09.1** — Reset Data restores baseline defaults
  - **Requirement ID:** `BDC-F-009`
  - **Type:** Functional
  - **Input / Steps:** Add an issue, set `Current Day=7`, change duration; click **Reset Data**.
  - **Expected Outcome:** Original 10 issues restored, Sprint 1 configuration restored (`Duration=10`, `Current Day=4`, `Total=50`).
  - **Status:** Passed

---

### 10. Ideal Burndown Calculation (`BDC-F-010`)

- [x] **TC-F-10.1** — Ideal burndown formula verification
  - **Requirement ID:** `BDC-F-010`
  - **Type:** Functional
  - **Input / Steps:** Default dataset (`Total=50`, `Duration=10`); evaluate at Day 0, Day 4, Day 10.
  - **Expected Outcome:** `Ideal(0)=50`, `Ideal(4)=30`, `Ideal(10)=0`.
  - **Status:** Passed

- [x] **TC-F-10.2** — Zero duration handled safely
  - **Requirement ID:** `BDC-F-010`
  - **Type:** Boundary
  - **Input / Steps:** Call Ideal calculation with `TotalDays=0`.
  - **Expected Outcome:** Safe defined return value; no `NaN`, `Infinity`, or application crash.
  - **Status:** Passed

---

### 11. Actual Burndown Calculation (`BDC-F-011`)

- [x] **TC-F-11.1** — Actual burndown values match completed issues
  - **Requirement ID:** `BDC-F-011`
  - **Type:** Functional
  - **Input / Steps:** Default dataset, `Current Day=4`; evaluate Days 1 through 4.
  - **Expected Outcome:** `Actual(1)=45`, `Actual(2)=42`, `Actual(3)=34`, `Actual(4)=21`.
  - **Status:** Passed

- [x] **TC-F-11.2** — No actual points plotted beyond Current Day
  - **Requirement ID:** `BDC-F-011`
  - **Type:** Boundary
  - **Input / Steps:** Evaluate Actual Burndown series with `Current Day=4`, then `Current Day=6`.
  - **Expected Outcome:** No actual points are plotted for days after the Current Day (`Actual(d) = null` for `d > currentDay`).
  - **Status:** Passed

---

### 12. Schedule Variance & Health Classification (`BDC-F-012`)

- [x] **TC-F-12.1** — Classify "Ahead of Schedule"
  - **Requirement ID:** `BDC-F-012`
  - **Type:** Functional
  - **Input / Steps:** Default dataset at Day 4 (`Ideal=30`, `Actual=21`); also test `Ideal=30`, `Actual=28`.
  - **Expected Outcome:** Variance `+9` and `+2`; health status classified as `"Ahead of Schedule"` (`Variance > 1`).
  - **Status:** Passed

- [x] **TC-F-12.2** — Classify "On Track" within tolerance
  - **Requirement ID:** `BDC-F-012`
  - **Type:** Boundary
  - **Input / Steps:** Test `Variance = 0`, `+1`, and `-1`.
  - **Expected Outcome:** Health status classified as `"On Track"` for all three boundary values (`-1 <= Variance <= 1`).
  - **Status:** Passed

- [x] **TC-F-12.3** — Classify "Behind Schedule"
  - **Requirement ID:** `BDC-F-012`
  - **Type:** Functional
  - **Input / Steps:** Test `Ideal=30` with `Actual=32` (`Variance = -2`), and `Actual=38` (`Variance = -8`).
  - **Expected Outcome:** Status classified as `"Behind Schedule"` (`Variance < -1`).
  - **Status:** Passed

---

### 13. Burndown Chart Display (`BDC-F-013`)

- [x] **TC-F-13.1** — Burndown chart rendering and series styling
  - **Requirement ID:** `BDC-F-013`
  - **Type:** Functional
  - **Input / Steps:** Open application with default simulated dataset (Appendix A).
  - **Expected Outcome:** Chart renders Sprint Day vs Remaining Story Points; dashed line for Ideal, solid line for Actual, labelled axes and legend; re-renders dynamically on data changes.
  - **Status:** Passed

- [x] **TC-F-13.2** — Chart layout responsiveness
  - **Requirement ID:** `BDC-F-013`
  - **Type:** Usability
  - **Input / Steps:** Resize browser window across widths from 1024px to 1920px.
  - **Expected Outcome:** Canvas scales smoothly, maintaining label readability without horizontal viewport scrolling.
  - **Status:** Passed

---

### 14. Timeline Current-Day Marker (`BDC-F-014`)

- [x] **TC-F-14.1** — Current-day marker position and update
  - **Requirement ID:** `BDC-F-014`
  - **Type:** Functional
  - **Input / Steps:** Verify vertical marker at Day 4; adjust Current Day slider to Day 7.
  - **Expected Outcome:** Vertical marker dynamically repositions to Day 7 without full page reload.
  - **Status:** Passed

---

### 15. Sprint KPI Dashboard Summary (`BDC-F-015`)

- [x] **TC-F-15.1** — Baseline KPI metric values
  - **Requirement ID:** `BDC-F-015`
  - **Type:** Functional
  - **Input / Steps:** Load default dataset at `Current Day=4`.
  - **Expected Outcome:** Cards display: Total `50`, Completed `29`, Remaining `21`, Days Elapsed `4`, Days Left `6`, Status `"Ahead of Schedule"`.
  - **Status:** Passed

- [x] **TC-F-15.2** — Live KPI recalculation on status update
  - **Requirement ID:** `BDC-F-015`
  - **Type:** Functional
  - **Input / Steps:** Mark `PROJ-106` (3 pts) as Done on Day 4.
  - **Expected Outcome:** Completed becomes `32`, Remaining becomes `18`, Variance becomes `+12`, Status remains `"Ahead of Schedule"`.
  - **Status:** Passed

---

### 16. Non-Functional Requirements Verification (`BDC-NF-001` to `BDC-NF-005`)

- [x] **TC-NF-01.1** — UI update time under 2 seconds
  - **Requirement ID:** `BDC-NF-001`
  - **Type:** Performance
  - **Input / Steps:** Add an issue and change Current Day; measure recalculation and re-rendering using browser DevTools Performance profiler.
  - **Expected Outcome:** Chart and KPI cards are fully updated within 2 seconds.
  - **Status:** Passed

- [x] **TC-NF-02.1** — Keyboard-only navigation and accessibility
  - **Requirement ID:** `BDC-NF-002`
  - **Type:** Usability
  - **Input / Steps:** Navigate the interface using only `Tab`, `Enter`, and `Space` keys without pointer interactions.
  - **Expected Outcome:** Sprint configuration, Current Day slider, Add/Update/Delete issue, and Reset controls are fully reachable and operable via keyboard.
  - **Status:** Passed

- [x] **TC-NF-02.2** — Labels and multi-channel status indicators
  - **Requirement ID:** `BDC-NF-002`
  - **Type:** Usability
  - **Input / Steps:** Review the UI across Ahead of Schedule, On Track, and Behind Schedule states.
  - **Expected Outcome:** Clear semantic labels; health status communicated through both text and distinct colors (never color alone).
  - **Status:** Passed

- [x] **TC-NF-03.1** — Comprehensive rejection of invalid inputs
  - **Requirement ID:** `BDC-NF-003`
  - **Type:** Negative
  - **Input / Steps:** Execute every invalid case from SRS Section 5.2 (negative/non-numeric points, invalid duration, out-of-range completion day, empty/duplicate key, empty summary).
  - **Expected Outcome:** 100% of invalid entries rejected with visible inline feedback; zero corrupted values stored in memory or storage.
  - **Status:** Passed

- [x] **TC-NF-04.1** — Cross-browser rendering and behavior
  - **Requirement ID:** `BDC-NF-004`
  - **Type:** Compatibility
  - **Input / Steps:** Execute core test workflows on latest stable releases of Google Chrome, Mozilla Firefox, and Microsoft Edge.
  - **Expected Outcome:** All tests pass identically; no layout breakages or unhandled console errors.
  - **Status:** Passed

- [x] **TC-NF-04.2** — Responsive resolution range
  - **Requirement ID:** `BDC-NF-004`
  - **Type:** Compatibility
  - **Input / Steps:** Verify dashboard usability at viewport widths of 1024px, 1366px, and 1920px.
  - **Expected Outcome:** Layout adapts cleanly and remains readable at every target width without unintentional horizontal clipping.
  - **Status:** Passed

- [x] **TC-NF-05.1** — Modular architectural separation review
  - **Requirement ID:** `BDC-NF-005`
  - **Type:** Inspection
  - **Input / Steps:** Inspect source code across `src/js/` modules.
  - **Expected Outcome:** Presentation, data, and calculation logic partitioned into distinct modules (`UIManager`, `DataManager`, `BurndownEngine`, `ValidationManager`); clean dependencies without circular references.
  - **Status:** Passed

- [x] **TC-NF-05.2** — Independent testability of calculation engine
  - **Requirement ID:** `BDC-NF-005`
  - **Type:** Unit
  - **Input / Steps:** Execute automated tests on pure logic modules (`BurndownEngine`, `ValidationManager`, `defaultDataset`) in a headless environment without DOM dependencies.
  - **Expected Outcome:** All unit tests pass independently with deterministic outcomes.
  - **Status:** Passed

---

### 17. Security & Robustness Verification (`BDC-SR-001` to `BDC-SR-005`)

- [x] **TC-SR-01.1** — Cross-Site Scripting (XSS) input sanitization
  - **Requirement ID:** `BDC-SR-001`
  - **Type:** Security
  - **Input / Steps:** Input `<script>alert(1)</script>` and `<img src=x onerror=alert(1)>` into Summary, Key, and Sprint Name fields.
  - **Expected Outcome:** Strings safely encoded and rendered as harmless literal text; zero script execution.
  - **Status:** Passed

- [x] **TC-SR-02.1** — Strict numeric input boundary validation
  - **Requirement ID:** `BDC-SR-002`
  - **Type:** Security
  - **Input / Steps:** Input non-numeric and boundary values: `Points = -3`, `"abc"`, `Infinity`; `Duration = -1`, `0`; `Current Day = 0`, `11`.
  - **Expected Outcome:** All rejected prior to persistence or mathematical computation; application remains stable.
  - **Status:** Passed

- [x] **TC-SR-03.1** — Safe recovery from corrupted browser storage
  - **Requirement ID:** `BDC-SR-003`
  - **Type:** Security
  - **Input / Steps:** Populate `localStorage` with malformed JSON, and alternatively valid JSON with schema violations; reload page.
  - **Expected Outcome:** Corrupted payload discarded safely; default dataset restored; no application freeze or stack trace exposed.
  - **Status:** Passed

- [x] **TC-SR-04.1** — Graceful handling of empty backlog
  - **Requirement ID:** `BDC-SR-004`
  - **Type:** Boundary
  - **Input / Steps:** Delete all backlog issues until issue list is empty.
  - **Expected Outcome:** `Total Committed Points = 0`; Ideal, Actual, and KPI calculations yield defined outputs; no `NaN`, `Infinity`, or uncaught exceptions.
  - **Status:** Passed

- [x] **TC-SR-04.2** — Zero story points and missing dates resilience
  - **Requirement ID:** `BDC-SR-004`
  - **Type:** Boundary
  - **Input / Steps:** Evaluate dataset with all issues at 0 points, attempt zero/negative sprint duration, and inspect In Progress issues with null completion date.
  - **Expected Outcome:** Calculations produce defined non-error results; invalid duration safely rejected.
  - **Status:** Passed

- [x] **TC-SR-05.1** — Content Security Policy and eval prohibition
  - **Requirement ID:** `BDC-SR-005`
  - **Type:** Security
  - **Input / Steps:** Inspect server deployment headers for CSP directives; static analysis scan for `eval()` or `Function()` constructors; verify static file hosting documentation.
  - **Expected Outcome:** CSP active on server deployments; zero usage of `eval()`; static deployment deviations clearly documented.
  - **Status:** Passed

---

## Sign-off Summary

| Role | Name | Status | Date |
| :--- | :--- | :--- | :--- |
| **Lead / QA Implementer** | Naveen Prasad M | Approved | 2026-10-22 |
| **Frontend Engineer** | Bhuvi Sudheendra Katti | Approved | 2026-10-22 |
| **Core Logic Engineer** | Hemanth Reddy / Pranathi G | Approved | 2026-10-22 |
