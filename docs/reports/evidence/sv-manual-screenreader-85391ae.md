# System Validation: Screen Reader & Assistive Technology Manual Sheet (SHA 85391ae)

- **Document ID:** SV-SHEET-A11Y-SR-02
- **Tested Commit:** `85391ae9181a666cc5b975968070e3dc5059a352` (short `85391ae`)
- **Execution Date:** 2026-11-10
- **QA Tester:** Bhuvi (`@stacktrace-bhuvi`)
- **Status:** **NOT EXECUTED** (Physical assistive technology speech synthesizer audio verification pending)

---

## 1. Scope & Objective
This manual run sheet specifies exact testing procedures for validating Section 5 (BDC-NF-002: Accessibility & Usability) and Software Test Plan TC-NF-02.1 and TC-NF-02.2 using desktop screen readers:
1. **NVDA** (NonVisual Desktop Access) on Windows with Chrome / Firefox / Edge.
2. **JAWS** (Job Access With Speech) on Windows.
3. **Windows Narrator** (built-in Windows 11 assistive tool: `Win + Ctrl + Enter`).
4. **VoiceOver** on macOS with Safari / Chrome.

*Note:* Programmatic DOM ARIA attributes, Skip link, Tab sequence, and pure keyboard-only execution passed 100% in automated Playwright validation (8/8 PASS in Group `G-KB`). This sheet verifies actual speech output, pronunciation, speech rate, and auditory perception.

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

| Scenario # | User Action & Element | Expected Screen Reader Speech Output | Actual Speech Output | Status |
| :--- | :--- | :--- | :--- | :--- |
| **SR-01** | Press `Tab` on initial page load (Skip Link) | "Skip to dashboard, link" | PENDING | PENDING |
| **SR-02** | Press `Enter` on Skip Link | Focus shifts to `#main-content`; announces "dashboard, main" or main landmark; bypasses header | PENDING | PENDING |
| **SR-03** | Navigate with `Tab` to Theme Toggle | "Switch to dark theme, button" / "Switch to light theme, button" | PENDING | PENDING |
| **SR-04** | Press `Space` on Theme Toggle | Button label and theme state update announced without focus loss | PENDING | PENDING |
| **SR-05** | Tab to Sprint Settings button | "Configure Sprint Parameters, button" | PENDING | PENDING |
| **SR-06** | Submit Sprint Config with invalid duration | Focus moved to error alert region; announces "Please review and correct the following errors: Sprint duration cannot exceed 60 working days" | PENDING | PENDING |
| **SR-07** | Tab to Current Day Range Slider | "Current Day slider, 4, minimum 0, maximum 10" | PENDING | PENDING |
| **SR-08** | Press `Right Arrow` on Current Day slider | Announces incremented value "5", "6" | PENDING | PENDING |
| **SR-09** | Navigate to Prev Day button at Day 0 | Announces "Move to previous day, button, disabled" (unclickable) | PENDING | PENDING |
| **SR-10** | Navigate to Next Day button at Day 10 | Announces "Move to next day, button, disabled" (unclickable) | PENDING | PENDING |
| **SR-11** | Inspect KPI Cards with Virtual Cursor | Reads card labels and live metrics: "Total Scope 50 story points", "Completed 29 points", "Remaining 21 points", "Schedule Status Ahead of Schedule, 9 points ahead" | PENDING | PENDING |
| **SR-12** | Live KPI Updates on Data Mutation | Live region (`aria-live="polite"`) announces metric changes when idle without interrupting current reading | PENDING | PENDING |
| **SR-13** | Jump to Backlog Table (`T`) | Announces table caption: "Sprint Backlog Issues, table with 6 columns and 10 rows" | PENDING | PENDING |
| **SR-14** | Table Column Header Reading | Moving horizontally announces column header then cell content (e.g. "Key: PROJ-101", "Status: Done", "Completion Day: 1") | PENDING | PENDING |
| **SR-15** | Add Issue Form Fields & Hints | Each form control announces its accessible label and hint text (e.g. "Issue Key required", "Duration working days 1 to 60") | PENDING | PENDING |
| **SR-16** | Add Issue Submission Feedback | Live region announces: "PROJ-111 added to sprint backlog. Chart and metrics refreshed." | PENDING | PENDING |
| **SR-17** | Duplicate Key Validation Error | Live alert announces: "An issue with this key already exists" | PENDING | PENDING |
| **SR-18** | Edit Issue Modal Opening | Focus shifts to status select; announces "Edit PROJ-106, Status combobox, In Progress" | PENDING | PENDING |
| **SR-19** | Cancel Edit with `Escape` | Modal closes; focus returns directly to "Edit PROJ-106, button" | PENDING | PENDING |
| **SR-20** | Delete Issue Focus Return | Pressing Enter on Delete PROJ-111 announces deletion and focus moves to adjacent Delete button | PENDING | PENDING |
| **SR-21** | Reset Data Confirmation | Announces: "Sprint data reset to default sample dataset." | PENDING | PENDING |

---

## 4. Sign-Off
- **Automated Validation:** Completed in Playwright keyboard suite (8/8 PASS in Group `G-KB`).
- **Physical Assistive Audio Verification:** **NOT EXECUTED** (Pending manual tester sign-off).
- **QA Tester:** Bhuvi (`@stacktrace-bhuvi`)
