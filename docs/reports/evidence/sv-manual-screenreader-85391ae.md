# System Validation: Screen Reader & Assistive Technology Manual Sheet (SHA 85391ae)

- **Document ID:** SV-SHEET-A11Y-SR-02
- **Tested Commit:** `85391ae9181a666cc5b975968070e3dc5059a352` (short `85391ae`)
- **Execution Date:** 2026-11-10
- **QA Tester:** Bhuvi (`@stacktrace-bhuvi`)
- **Date:** 2026-11-10
- **NVDA version and copy type:** 2026.3 (2026.3.0.58174) (temporary/portable)
- **Browser and version:** Firefox 159.0.1
- **Windows build:** Microsoft Windows [Version 10.0.26200.9711]
- **HEAD:** `500a4be3961103480c6274b89eddca34a219ccce`
- **HEAD:src:** `4a2278fd1774ecfb0cb43d1e6f9b00e386b344e8`
- **URL:** http://127.0.0.1:8090/index.html (snapshot copy)
- **Status:** **EXECUTED (manual)** (22 PASS, 0 FAIL, 0 NOT EXECUTED; 22 rows with no recorded speech wording)

> Evidence note, 2026-11-11: these are Bhuvi's reported manual results on the
> identified earlier source tree. No new NVDA listening session was performed
> by Codex, and no verbatim speech or audio recording is available. Current
> automated keyboard/label/contrast results are separate evidence in the
> [Test Summary](../test-summary-report.md).

---

## 1. Scope & Objective
This manual run sheet specifies exact testing procedures for validating Section 5 (BDC-NF-002: Accessibility & Usability) and Software Test Plan TC-NF-02.1 and TC-NF-02.2 using desktop screen readers:
1. **NVDA** (NonVisual Desktop Access) on Windows with Chrome / Firefox / Edge.
2. **JAWS** (Job Access With Speech) on Windows.
3. **Windows Narrator** (built-in Windows 11 assistive tool: `Win + Ctrl + Enter`).
4. **VoiceOver** on macOS with Safari / Chrome.

*Note:* Programmatic DOM ARIA attributes, Skip link, Tab sequence, and pure keyboard-only execution passed 100% in automated Playwright validation (9/9 PASS in Group `G-KB`). This sheet verifies actual speech output, pronunciation, speech rate, and auditory perception.

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
| **SR-01** | Press `Tab` on initial page load (Skip Link) | "Skip to dashboard, link" | Tester recorded PASS; NVDA speech wording not recorded | PASS |
| **SR-02** | Press `Enter` on Skip Link | Focus shifts to `#main-content`; announces "dashboard, main" or main landmark; bypasses header | Tester recorded PASS; NVDA speech wording not recorded | PASS |
| **SR-03** | Navigate with `Tab` to Theme Toggle | "Switch to dark theme, button" / "Switch to light theme, button" | Tester recorded PASS; NVDA speech wording not recorded | PASS |
| **SR-04** | Press `Space` on Theme Toggle | Button label and theme state update announced without focus loss | Tester recorded PASS; NVDA speech wording not recorded | PASS |
| **SR-05** | Tab to Sprint Settings button | "Configure Sprint Parameters, button" | Tester recorded PASS; NVDA speech wording not recorded | PASS |
| **SR-06** | Submit Sprint Config with invalid duration | Focus moved to error alert region; announces "Please review and correct the following errors: Sprint duration cannot exceed 60 working days" | Tester recorded PASS; NVDA speech wording not recorded | PASS |
| **SR-07** | Tab to Current Day Range Slider | "Current Day slider, 4, minimum 0, maximum 10" | Tester recorded PASS; NVDA speech wording not recorded | PASS |
| **SR-08** | Press `Right Arrow` on Current Day slider | Announces incremented value "5", "6" | Tester recorded PASS; NVDA speech wording not recorded | PASS |
| **SR-09** | Navigate to Prev Day button at Day 0 | Announces "Move to previous day, button, disabled" (unclickable) | Tester recorded PASS; NVDA speech wording not recorded | PASS |
| **SR-10** | Navigate to Next Day button at Day 10 | Announces "Move to next day, button, disabled" (unclickable) | Tester recorded PASS; NVDA speech wording not recorded | PASS |
| **SR-11** | Inspect KPI Cards with Virtual Cursor | Reads card labels and live metrics: "Total Scope 50 story points", "Completed 29 points", "Remaining 21 points", "Schedule Status Ahead of Schedule, 9 points ahead" | Tester recorded PASS; NVDA speech wording not recorded | PASS |
| **SR-12** | Live KPI Updates on Data Mutation | Live region (`aria-live="polite"`) announces metric changes when idle without interrupting current reading | Tester recorded PASS; NVDA speech wording not recorded | PASS |
| **SR-13** | Jump to Backlog Table (`T`) | Announces table caption: "Sprint Backlog Issues, table with 6 columns and 10 rows" | Tester recorded PASS; NVDA speech wording not recorded | PASS |
| **SR-14** | Table Column Header Reading | Moving horizontally announces column header then cell content (e.g. "Key: PROJ-101", "Status: Done", "Completion Day: 1") | Tester recorded PASS; NVDA speech wording not recorded | PASS |
| **SR-15** | Add Issue Form Fields & Hints | Each form control announces its accessible label and hint text (e.g. "Issue Key required", "Duration working days 1 to 60") | Tester recorded PASS; NVDA speech wording not recorded | PASS |
| **SR-16** | Add Issue Submission Feedback | Live region announces: "PROJ-111 added to sprint backlog. Chart and metrics refreshed." | Tester recorded PASS; NVDA speech wording not recorded | PASS |
| **SR-17** | Duplicate Key Validation Error | Live alert announces: "An issue with this key already exists" | Tester recorded PASS; NVDA speech wording not recorded | PASS |
| **SR-18** | Edit Issue Modal Opening | Focus shifts to status select; announces "Edit PROJ-106, Status combobox, In Progress" | Tester recorded PASS; NVDA speech wording not recorded | PASS |
| **SR-19** | Cancel Edit with `Escape` | Modal closes; focus returns directly to "Edit PROJ-106, button" | Tester recorded PASS; NVDA speech wording not recorded | PASS |
| **SR-20** | Delete Issue Focus Return | Pressing Enter on Delete PROJ-111 announces deletion and focus moves to adjacent Delete button | Tester recorded PASS; NVDA speech wording not recorded | PASS |
| **SR-21** | Reset Data Confirmation | Announces: "Sprint data reset to default sample dataset." | Tester recorded PASS; NVDA speech wording not recorded | PASS |
| **SR-22** | Status badges Day 4/6/7 light + dark | Text clear, colours distinct, and perceptible under grayscale | Tester recorded PASS; NVDA speech wording not recorded | PASS |

---

## 4. Sign-Off
- **Automated Validation:** Completed in Playwright keyboard suite (9/9 PASS in Group `G-KB`).
- **Physical Assistive Audio Verification:** **EXECUTED (manual)** (22 PASS, 0 FAIL, 0 NOT EXECUTED; 22 rows with no recorded speech wording).
- **QA Tester:** Bhuvi (`@stacktrace-bhuvi`)
