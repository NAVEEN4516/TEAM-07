# BDC-NF-004 Compatibility Evidence

- **Requirement IDs**: SRS 5 (Browser Compatibility, Usability), STP TC-NF-04.1, TC-NF-04.2, TC-F-13.2.
- **Tested Commit (Baseline SHA)**: `222089658f26badaf5c9f6d3c60e75986ebd6320`
- **Execution Date**: 2026-11-07
- **QA Tester**: Bhuvi (`@stacktrace-bhuvi`)

---

## 1. Overview & Acceptance Criteria
- **Target Browsers**: Modern Chromium-based browsers (Google Chrome, Microsoft Edge) and Mozilla Firefox. Safari is explicitly **out of scope**.
- **Target Viewports**: Standard desktop viewports from 1024px to 1920px width (1024x900, 1366x900, 1440x900, 1920x900).
- **Themes**: Verified under both Light Theme (`theme-light`) and Dark Theme (`theme-dark`).
- **Criteria**:
  1. Loads cleanly with zero uncaught JavaScript console errors or unhandled promise rejections.
  2. Zero page-level horizontal scroll (`document.documentElement.scrollWidth === clientWidth`).
  3. Backlog table columns legible and styled; internal `.table-wrapper` accommodates narrow screens without page clipping.
  4. Burndown chart readable and scales cleanly across all breakpoints.
  5. Add Issue form and Sprint Configuration form fully usable and responsive.

---

## 2. Test Environment & Methodology
- **Test Server**: Local Node HTTP loopback server serving `src/`.
- **Browsers Tested**:
  - **Google Chrome**: Version `156.0.8078.80` (Official Build, 64-bit on Windows 11). Automated Playwright validation runner.
  - **Microsoft Edge**: Version `157.0.4341.42` (Official Build, 64-bit on Windows 11). Automated Playwright validation runner.
  - **Mozilla Firefox**: Not installed on host test workstation. Status: **NOT EXECUTED**. Detailed manual run sheet provided in `docs/reports/evidence/sv-firefox-manual-sheet.md`.
- **Evidence Files**: High-resolution screenshots captured in `docs/reports/evidence/`:
  - `sv-responsive-1024px-light-chrome.png` / `sv-responsive-1024px-dark-chrome.png`
  - `sv-responsive-1366px-light-chrome.png` / `sv-responsive-1366px-dark-chrome.png`
  - `sv-responsive-1440px-light-chrome.png` / `sv-responsive-1440px-dark-chrome.png`
  - `sv-responsive-1920px-light-chrome.png` / `sv-responsive-1920px-dark-chrome.png`
  - Corresponding `.png` files for Microsoft Edge.

---

## 3. Compatibility Matrix

### Google Chrome (v156.0.8078.80)

| Viewport | Theme | Loads Without Errors | Page Horizontal Scroll (`scrollWidth === clientWidth`) | Table Container Legibility | Chart Scaling | Add-Issue Form Usable | Overall Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1024 x 900** | Light | PASS (0 errors) | PASS (0px overflow) | PASS (Internal scroll / fit) | PASS | PASS | **PASS** |
| **1024 x 900** | Dark | PASS (0 errors) | PASS (0px overflow) | PASS (Internal scroll / fit) | PASS | PASS | **PASS** |
| **1366 x 900** | Light | PASS (0 errors) | PASS (0px overflow) | PASS (Fits container) | PASS | PASS | **PASS** |
| **1366 x 900** | Dark | PASS (0 errors) | PASS (0px overflow) | PASS (Fits container) | PASS | PASS | **PASS** |
| **1440 x 900** | Light | PASS (0 errors) | PASS (0px overflow) | PASS (Fits container) | PASS | PASS | **PASS** |
| **1440 x 900** | Dark | PASS (0 errors) | PASS (0px overflow) | PASS (Fits container) | PASS | PASS | **PASS** |
| **1920 x 900** | Light | PASS (0 errors) | PASS (0px overflow) | PASS (Fits container) | PASS | PASS | **PASS** |
| **1920 x 900** | Dark | PASS (0 errors) | PASS (0px overflow) | PASS (Fits container) | PASS | PASS | **PASS** |

### Microsoft Edge (v157.0.4341.42)

| Viewport | Theme | Loads Without Errors | Page Horizontal Scroll (`scrollWidth === clientWidth`) | Table Container Legibility | Chart Scaling | Add-Issue Form Usable | Overall Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1024 x 900** | Light | PASS (0 errors) | PASS (0px overflow) | PASS (Internal scroll / fit) | PASS | PASS | **PASS** |
| **1024 x 900** | Dark | PASS (0 errors) | PASS (0px overflow) | PASS (Internal scroll / fit) | PASS | PASS | **PASS** |
| **1366 x 900** | Light | PASS (0 errors) | PASS (0px overflow) | PASS (Fits container) | PASS | PASS | **PASS** |
| **1366 x 900** | Dark | PASS (0 errors) | PASS (0px overflow) | PASS (Fits container) | PASS | PASS | **PASS** |
| **1440 x 900** | Light | PASS (0 errors) | PASS (0px overflow) | PASS (Fits container) | PASS | PASS | **PASS** |
| **1440 x 900** | Dark | PASS (0 errors) | PASS (0px overflow) | PASS (Fits container) | PASS | PASS | **PASS** |
| **1920 x 900** | Light | PASS (0 errors) | PASS (0px overflow) | PASS (Fits container) | PASS | PASS | **PASS** |
| **1920 x 900** | Dark | PASS (0 errors) | PASS (0px overflow) | PASS (Fits container) | PASS | PASS | **PASS** |

### Mozilla Firefox

| Viewport | Status | Notes |
| :--- | :--- | :--- |
| **1024 x 900** to **1920 x 900** | **NOT EXECUTED** | Mozilla Firefox binary not installed on the test workstation. Full manual test script provided in `docs/reports/evidence/sv-firefox-manual-sheet.md` for execution by QA team. |

---

## 4. Evaluation of Specific Criteria

### 1. TC-F-13.2 Table Scrolling Evaluation
- **Evaluation Status:** **PENDING CONFIRMATION WITH NAVEEN**
- **Findings:**
  - STP Section 6 specifies *"no horizontal scrolling"*.
  - `sprint2_naveen_checklist.md` clarifies that internal table wrapper scrolling (`.table-wrapper { overflow-x: auto }`) is permissible to avoid cell clipping on narrower viewports.
  - Page-level horizontal overflow is strictly `0px` (`scrollWidth === clientWidth`) across all tested resolutions. Backlog table wrapper accommodates content cleanly.

### 2. High-Density Text Stress Test
- Tested an issue with an unbroken 60-character key and 200-character summary.
- CSS properties `overflow-wrap: anywhere;` and `word-break: break-word;` prevent layout breakage. Page horizontal scroll remains `0px`.

### 3. File Protocol Notice (`file://`)
- Direct double-click of `src/index.html` triggers `fileProtocolNotice.js`, rendering a user-friendly guidance notice explaining that ES modules require an HTTP server (`npx serve src`). Zero uncaught CORS exceptions.
