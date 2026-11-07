# System Validation: Screen Reader & Assistive Technology Manual Sheet

- **Document ID:** SV-SHEET-A11Y-SR-01
- **Tested Commit (Baseline SHA):** `222089658f26badaf5c9f6d3c60e75986ebd6320`
- **Execution Date:** 2026-11-07
- **QA Tester:** Bhuvi (`@stacktrace-bhuvi`)
- **Status:** **NOT EXECUTED** (Headless CLI environment limitation: True assistive technology speech synthesis and audio output from NVDA, JAWS, or Windows Narrator cannot be verified headlessly)

---

## 1. Scope & Objective
This manual run sheet specifies exact testing procedures for validating Section 5 (BDC-NF-002: Accessibility & Usability) and Software Test Plan TC-NF-02.1 and TC-NF-02.2 using desktop screen readers:
1. **NVDA** (NonVisual Desktop Access) on Windows with Chrome / Edge.
2. **JAWS** (Job Access With Speech) on Windows.
3. **Windows Narrator** (built-in Windows 11 assistive tool: `Win + Ctrl + Enter`).
4. **VoiceOver** on macOS with Safari / Chrome.

Programmatic DOM ARIA attributes and keyboard focus order passed 100% in automated Playwright validation. This sheet verifies actual speech output and auditory perception.

---

## 2. Test Setup & Keyboard Navigation Shortcuts
- **NVDA Key**: `Insert` or `CapsLock`
- **Browse Mode / Virtual Cursor**: Arrow keys `Up` / `Down`
- **Form Navigation**: `Tab` and `Shift + Tab`
- **Next Heading**: `H`
- **Next Table**: `T`
- **Next Landmark / Region**: `D`

---

## 3. Auditory Verification Test Cases

### Scenario 1: Skip Link & Landmark Navigation
1. Press `Tab` immediately upon page load.
   - **Expected Speech**: "Skip to dashboard, link".
2. Press `Enter` on the skip link.
   - **Expected Speech**: Focus jumps directly to `#main-content` ("main, dashboard").
   - Focus outline is clearly visible; banner controls are bypassed.

### Scenario 2: KPI Dashboard Live Announcements
1. Navigate with `D` or `Tab` to the KPI section.
2. Advance Current Day or add an issue.
   - **Expected Speech**: Because KPI cards carry `aria-live="polite"`, the screen reader announces updated metrics when idle:
     - "Total Scope: 50 story points"
     - "Completed: 22 points"
     - "Remaining: 28 points"
     - "Schedule Status: Behind, 8 points behind ideal"

### Scenario 3: Sprint Timeline Slider Control
1. Tab to the Current Day slider (`input[type="range"]`).
   - **Expected Speech**: "Current Day slider, 4, minimum 0, maximum 10".
2. Press `Right Arrow` or `Up Arrow` to advance day.
   - **Expected Speech**: "5", "6".
3. Verify previous and next step buttons:
   - When Current Day is 0: Previous Day button announces "disabled".
   - When Current Day equals sprint duration: Next Day button announces "disabled".

### Scenario 4: Backlog Table Structural Reading
1. Press `T` to jump to the backlog table.
   - **Expected Speech**: "Table with 6 columns and 11 rows. Caption: Sprint Backlog Issues."
2. Navigate horizontally with `Ctrl + Alt + Left/Right Arrow` (NVDA table mode):
   - **Expected Speech**: Reads column header first, then cell content:
     - "Key, column 1: PROJ-101"
     - "Summary, column 2: Set up repository and build pipeline"
     - "Points, column 4: 8"
     - "Status, column 5: Done"
     - "Completion Day, column 6: 4"
     - "Actions, column 7: Edit PROJ-101 button, Delete PROJ-101 button"

### Scenario 5: Add Issue Form & Error Announcements
1. Tab into Add Issue Form (`#add-issue-form`).
2. Trigger submit on empty fields (`Enter` or click "Add Issue").
   - **Expected Speech**: Screen reader immediately reads the error container due to `role="alert"`:
     - "Alert: 4 errors found. Please correct the following issues."
     - Form controls announce validation hints via `aria-describedby`.
3. Select Status="Done":
   - **Expected Speech**: Completion Day field becomes available and accessible; `hidden` state removed.
4. Fill valid issue and submit:
   - **Expected Speech**: `#add-issue-status` announces polite message: "Issue [KEY] added successfully."

### Scenario 6: Inline Issue Editor Focus Restoration
1. Focus on "Edit PROJ-101" button in backlog table and press `Enter`.
   - **Expected Speech**: "Edit PROJ-101, Status select, To Do, 1 of 3".
   - Focus is automatically placed into `#edit-issue-status`.
2. Press `Escape` key without saving.
   - **Expected Speech**: Editor closes; focus is programmatically restored back to "Edit PROJ-101" button in table.

### Scenario 7: Theme Toggle Accessible State
1. Tab to Theme Toggle button.
   - **Expected Speech**: "Switch to dark theme, button".
2. Press `Enter` to activate.
   - **Expected Speech**: "Switch to light theme, button".

---

## 4. Execution Sheet Checklist
| Assistive Tool | OS / Browser | Tester Name | Date | Status |
| :--- | :--- | :--- | :--- | :--- |
| **NVDA 2024+** | Windows 11 / Chrome 156 | [Pending] | YYYY-MM-DD | [ ] PASS  [ ] FAIL |
| **JAWS 2024+** | Windows 11 / Edge 156 | [Pending] | YYYY-MM-DD | [ ] PASS  [ ] FAIL |
| **Narrator** | Windows 11 / Edge 156 | [Pending] | YYYY-MM-DD | [ ] PASS  [ ] FAIL |
| **VoiceOver** | macOS Sequoia / Safari | [Pending] | YYYY-MM-DD | [ ] PASS  [ ] FAIL |

---

## 5. Sign-Off
- **Automated Synthetic ARIA Verification:** 100% PASS (Playwright).
- **Audio / TTS Manual Verification:** **NOT EXECUTED** (deferred to designated accessibility testing session with live audio hardware).
- **Sheet Prepared By:** Bhuvi (`@stacktrace-bhuvi`)
