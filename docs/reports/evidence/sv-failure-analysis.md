# System Validation: Failure Analysis (Run 1 Retrospective)

- **Document ID:** SV-FAILURE-ANALYSIS-01
- **Tested Baseline SHA:** `222089658f26badaf5c9f6d3c60e75986ebd6320`
- **QA Tester:** Bhuvi (`@stacktrace-bhuvi`)
- **Date:** 2026-11-07
- **Context:** Detailed investigation of the four `FAIL` records identified in Run 1 (`sv-results-chrome-2026-11-07.json` and `sv-results-msedge-2026-11-07.json`).

---

## 1. Executive Summary

In Run 1, both Google Chrome and Microsoft Edge produced 53 records with the breakdown:
- **48 PASS**
- **4 FAIL**
- **1 BLOCKED** (`TC-F-13.2` pending confirmation with Naveen)

Each of the four failures was systematically investigated using minimal reproductions against baseline commit `222089658f26badaf5c9f6d3c60e75986ebd6320` served over HTTP, comparing the Software Test Plan (STP) expected results, the actual application behavior, and the test runner code.

### Summary Classification Table

| Test Case ID | Requirement | STP Expected Result | Actual App Behavior | Root Cause Classification | Resolution |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-F-01.1** | BDC-F-001 | Configuration saved; chart re-renders with Total Days = 5 | Configuration saved; duration=5; Current Day remains 4; badge reads "Day 4 of 5" | **(i) Runner Defect** (wrong child locator & invalid assertion on day value) | Target full badge `[data-testid="current-day-value"]` and verify duration=5 |
| **TC-F-06.3** | BDC-F-006 | Validation message for each; issue not added | Form renders: "Issue key is required. Summary is required. Story points must be a non-negative number." | **(i) Runner Defect** (case-sensitive check `'Key'` vs actual text `'Issue key is required.'`) | Use case-insensitive regex matching for validation errors |
| **TC-F-09.1** | BDC-F-009 | Original 10 issues, Sprint 1 configuration, Current Day=4, Total=50 | Backlog restored to 10 issues, Total=50, Completed=29, Remaining=21, badge reads "Day 4 of 10" | **(i) Runner Defect** (locator pointed to child `strong` element returning `"4"`, assertion expected full phrase) | Query full badge `[data-testid="current-day-value"]` for `"Day 4 of 10"` |
| **TC-SR-03.1** | BDC-SR-003 | Corrupted data discarded; default dataset restored; no crash or stack trace | `restoreFromJSON` rejects corrupted state (`success: false`), restores default 10-issue dataset | **(iv) Data-Layer Verification / Runner Defect** (hardcoded check for 11 issues instead of default 10) | Verified by unit tests; label execution method as "automated unit test (data layer)" |

---

## 2. Detailed Case-by-Case Investigation

### Case 1: TC-F-01.1 — Configure a Valid Sprint
- **STP Specification (Table 9, TC-F-01.1):**
  - *Input / Steps:* Name="Sprint 2", Duration=5, Start=26-Oct-2026, End=30-Oct-2026.
  - *STP Expected Result:* "Configuration saved; chart re-renders with Total Days = 5"
- **Committed Run 1 Failure Record:**
  - `expectedResult`: "Configuration saved; header badge=\"Sprint 2\"; duration=5; Current Day clamped to <= 5"
  - `actualResult`: "Header badge=\"Sprint 2\", Current Day=\"4\""
  - `status`: `FAIL`
- **Runner Code in `run.cjs`:**
  ```javascript
  const bannerName = (await loc.sprintNameHeader.textContent()).trim();
  const dayValText = (await loc.currentDayValue.textContent()).trim();
  ...
  status: (bannerName === 'Sprint 2' && dayValText.includes('5')) ? 'PASS' : 'FAIL'
  ```
- **Root Cause Analysis:**
  1. `loc.currentDayValue` was defined as `page.locator('[data-testid="current-day-value"] strong')`.
  2. In `src/js/ui/currentDayControl.js:38-40`, the markup is:
     ```html
     <span class="current-day-badge" data-testid="current-day-value">
       Day <strong>${safeDay}</strong> of ${safeDuration}
     </span>
     ```
  3. The locator targeted only the child `<strong>` element containing the current day number (`4`).
  4. The baseline sprint starts at Day 4. When duration is reconfigured to 5, Day 4 is already `<= 5`, so no clamping is needed.
  5. `dayValText` was `"4"`, and `"4".includes('5')` evaluated to `false`.
  6. The application correctly saved the configuration: `dataManager.getSprint().durationDays` is 5, the badge text is `"Day 4 of 5"`, the chart has 6 day slots (0..5), and the banner reads `"Sprint 2"`.
- **Classification:** `(i) Runner defect` (faulty child selector and invalid assertion that current day number must equal 5).
- **Remediation:** Query the full badge element `page.locator('[data-testid="current-day-value"]')` and verify that the duration is 5 and badge text contains `"5"`.

---

### Case 2: TC-F-06.3 — Empty Required Fields
- **STP Specification (Table 9, TC-F-06.3):**
  - *Input / Steps:* Submit with empty Key, then with empty Summary.
  - *STP Expected Result:* "Validation message for each; issue not added"
- **Committed Run 1 Failure Record:**
  - `expectedResult`: "Validation errors for Key, Summary, and Points displayed; no issue created"
  - `actualResult`: `"Errors: \"⚠Please correct the following errors:Issue key is required.Summary is required.Story points must be a non-negative number.\""`
  - `status`: `FAIL`
- **Runner Code in `run.cjs`:**
  ```javascript
  const emptyErrors = (await loc.addIssueErrors.textContent()).trim();
  ...
  status: (emptyErrors.includes('Key') && emptyErrors.includes('Summary') && emptyErrors.includes('points')) ? 'PASS' : 'FAIL'
  ```
- **Root Cause Analysis:**
  1. The form correctly displayed all three validation errors: `"Issue key is required."`, `"Summary is required."`, and `"Story points must be a non-negative number."`.
  2. In `src/js/logic/validationManager.js:77`, the exact string is `"Issue key is required."`, using lowercase `"key"`.
  3. The runner assertion used `emptyErrors.includes('Key')` with an uppercase `'K'`.
  4. In JavaScript, `String.prototype.includes` is case-sensitive, so `"Issue key is required.".includes('Key')` evaluated to `false`.
- **Classification:** `(i) Runner defect` (case-sensitive check against lowercase text).
- **Remediation:** Use case-insensitive matching `/issue key/i.test(emptyErrors) && /summary/i.test(emptyErrors) && /story points|points/i.test(emptyErrors)`.

---

### Case 3: TC-F-09.1 — Reset Restores Defaults
- **STP Specification (Table 9, TC-F-09.1):**
  - *Input / Steps:* Add an issue, set Current Day=7, change duration; click Reset Data.
  - *STP Expected Result:* "Original 10 issues, Sprint 1 configuration, Current Day=4, Total=50"
- **Committed Run 1 Failure Record:**
  - `expectedResult`: "Exact baseline defaults restored: 10 issues, 50 pts, Day 4 of 10"
  - `actualResult`: `"Rows=10, Total=50, Completed=29, Remaining=21, Day=\"4\""`
  - `status`: `FAIL`
- **Runner Code in `run.cjs`:**
  ```javascript
  const resetDay = (await loc.currentDayValue.textContent()).trim();
  ...
  const resetPass = resetTotal === '50' &&
    resetComp === '29' &&
    resetRem === '21' &&
    resetDay.includes('Day 4 of 10') &&
    resetRows === 10;
  ```
- **Root Cause Analysis:**
  1. The application correctly restored all baseline values: 10 rows, Total=50, Completed=29, Remaining=21, Current Day=4, Duration=10.
  2. `loc.currentDayValue` pointed to `[data-testid="current-day-value"] strong`, which extracted only the inner text of `<strong>` (`"4"`).
  3. The runner asserted `resetDay.includes('Day 4 of 10')`.
  4. `"4".includes('Day 4 of 10')` evaluated to `false`.
  5. The full badge `<span class="current-day-badge" data-testid="current-day-value">Day <strong>4</strong> of 10</span>` contained `"Day 4 of 10"`.
- **Classification:** `(i) Runner defect` (locator targeted child `strong` element instead of the badge container).
- **Remediation:** Query `page.locator('[data-testid="current-day-value"]')` to verify the full `"Day 4 of 10"` badge text.

---

### Case 4: TC-SR-03.1 — Corrupted LocalStorage Recovery
- **STP Specification (Table 9, TC-SR-03.1):**
  - *Input / Steps:* Set stored value to invalid JSON, then to valid JSON with wrong structure; reload.
  - *STP Expected Result:* "Corrupted data discarded; default dataset restored; no crash or stack trace"
- **Committed Run 1 Failure Record:**
  - `expectedResult`: "Corrupted data discarded safely without crash or stack trace"
  - `actualResult`: "Data layer handles corrupt state safely: false"
  - `status`: `FAIL`
- **Runner Code in `run.cjs`:**
  ```javascript
  const storageRecoveryPass = await page.evaluate(async () => {
    const dmMod = await import('/js/data/dataManager.js');
    const dm = dmMod.defaultDataManager;
    const resInvalidJson = dm.restoreFromJSON('invalid-json{{{');
    const resCorruptStructure = dm.restoreFromJSON(JSON.stringify({ sprint: null, issues: 'not-array' }));
    return !resInvalidJson.success && !resCorruptStructure.success && dm.getIssues().length === 11;
  });
  ```
- **Root Cause Analysis:**
  1. `dataManager.restoreFromJSON` correctly rejects corrupted state: both calls return `{ success: false, errors: [...] }`.
  2. Per `src/js/data/dataManager.js:142`, when corrupted JSON or schema violations occur, the default dataset is restored via `this.init(null);`.
  3. The default dataset contains **10 issues**, not 11.
  4. The runner evaluated `dm.getIssues().length === 11` (assuming the newly added test issue `XSS-1` would be preserved).
  5. Because corrupted data triggers a complete restore of the default dataset, `dm.getIssues().length` became 10.
  6. Additionally, sprint persistence in `localStorage` is intentionally disabled in the application UI (only theme is stored).
  7. Therefore, `TC-SR-03.1` is fundamentally a **data-layer resilience requirement**, fully verified by unit tests:
     - `tests/data/storedState.test.js:128-175`
     - `tests/logic/validationManager.test.js:295-330`
- **Classification:** `(iv) Data-layer verification / Runner defect` (runner assertion assumed 11 issues instead of default 10; test is a data-layer contract rather than an end-to-end UI interaction).
- **Remediation:** Update the runner to test `dm.getIssues().length === 10` (the default dataset length), and clearly document the execution method as "automated unit test (data layer)" with links to `tests/data/storedState.test.js`.

---

## 3. Conclusion
None of the four failures represent defects in the core application code (`src/`). Three were caused by overly narrow child locators or case-sensitive assertions in the test runner, and the fourth was caused by an assertion expecting 11 issues instead of the default 10 upon corrupted state recovery.
