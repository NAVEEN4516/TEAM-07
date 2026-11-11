# Proposed Software Test Plan (STP) Corrections

- **Document ID:** SV-CORRECTIONS-01
- **Target Document:** `docs/test-plan/Burndown_Chart_Test_Plan.docx`
- **Submitted To:** Naveen (`@NAVEEN4516`, QA Lead)
- **Submitted By:** Bhuvi (`@stacktrace-bhuvi`, Software Engineer & Validation Lead)
- **Date:** 2026-11-07
- **Baseline Commit:** `222089658f26badaf5c9f6d3c60e75986ebd6320`

---

## 1. Summary of Proposals
Following rigorous System Validation execution on baseline SHA `222089658f26badaf5c9f6d3c60e75986ebd6320`, three specific updates to the Software Test Plan (STP) are proposed to align the test case documentation with actual implementation standards and resolved team agreements.

---

## 2. Proposed Changes

### Proposal 1: TC-NF-05.2 (Test Runner Framework Reference)
- **Current STP Text:**
  - *Input / Procedure:* "Execute Jest test runner without jsdom: `npm test`"
  - *Expected Result:* "All 18 unit tests pass in terminal with zero DOM dependencies. Execution time < 5 seconds."
- **Proposed Updated Text:**
  - *Input / Procedure:* "Execute native Node.js test runner without jsdom: `npm test` (invoking `node --test`)"
  - *Expected Result:* "All unit test suites pass in terminal with zero DOM dependencies. Execution time < 2 seconds (measured: 255 tests passing in ~640 ms)."
- **Justification:**
  The project was intentionally designed with zero external runtime or test dependencies using Node 20+ built-in test runner (`node --test`). Updating the STP removes the legacy reference to Jest.

---

### Proposal 2: TC-F-01.3 (Sprint Date Boundary Equality)
- **Current STP Text:**
  - *Input / Procedure:* "Set Start Date = 2026-10-30, End Date = 2026-10-26 (End before Start); also test Start Date = End Date"
  - *Expected Result:* "Sprint end date must strictly follow sprint start date; equal dates rejected."
- **Proposed Updated Text:**
  - *Input / Procedure:* "Set Start Date = 2026-10-30, End Date = 2026-10-26 (End strictly before Start). Single-day sprints where End Date equals Start Date with Duration = 1 working day are valid."
  - *Expected Result:* "End date strictly before start date is rejected with error: 'Sprint end date must be on or after start date'. Equal start and end dates with Duration = 1 are accepted."
- **Justification:**
  In agile practices and per `src/js/logic/validationManager.js:52`, single-day sprints (e.g., a one-day spike or emergency bug bash) legitimately have `startDate === endDate`.

---

### Proposal 3: TC-F-13.2 (Table Scrolling Acceptance Criterion)
- **Current STP Text:**
  - *Expected Result:* "All backlog columns visible without horizontal scrolling across all standard resolutions (1024x768 to 1920x1080)."
- **Proposed Updated Text:**
  - *Expected Result:* "The root document (`document.documentElement`) maintains zero horizontal scrollbar (`scrollWidth === clientWidth`) across 1024px to 1920px viewports. The backlog table wrapper (`.table-wrapper`) fits all columns on wide displays and allows smooth internal horizontal scrolling on constrained viewports (e.g. 1024px) to preserve data legibility without clipping."
- **Justification:**
  This wording matches Naveen's clarification in `sprint2_naveen_checklist.md` and eliminates the ambiguity between whole-page scrolling and internal container scrolling.

---

## 3. Recommended Action
Naveen may incorporate these three updates into `docs/test-plan/Burndown_Chart_Test_Plan.docx` during the final QA wrap-up. No code changes are required.
