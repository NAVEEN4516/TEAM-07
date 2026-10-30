# BDC-NF-004 Compatibility Evidence

## 1. Overview & Requirements
- **Requirement IDs**: SRS 5 (Browser Compatibility, Usability), STP TC-NF-04.1, TC-NF-04.2, TC-F-13.2 ("no horizontal scrolling").
- **Target Browsers**: Modern Chromium-based browsers (Google Chrome, Microsoft Edge) and Mozilla Firefox. Safari is explicitly **out of scope**.
- **Target Viewports**: Usable desktop layouts from ~1024px to 1920px width.
- **Criteria**:
  1. Loads without console errors.
  2. No page horizontal scroll (`document.documentElement.scrollWidth === clientWidth`).
  3. Backlog table columns visible without clipping / wrapper scrolling (`.table-wrapper.scrollWidth === clientWidth`).
  4. Burndown chart readable and scales cleanly.
  5. Add Issue form usable and fits grid.

---

## 2. Test Environment & Methodology
- **Test Server**: Local HTTP server (`python -m http.server 8990 --directory src`).
- **Browsers Tested**:
  - **Google Chrome**: Version `155.0.8059.85` (Official Build, 64-bit on Windows 11). Tested via Chrome DevTools Protocol (CDP) headless automation script.
  - **Microsoft Edge**: Version `156.0.4314.42` (Official Build, 64-bit on Windows 11). Tested via CDP headless automation script.
  - **Mozilla Firefox**: Not installed on the local test environment. Cells marked `TO BE TESTED`.
- **Test Scenarios**:
  - Baseline: Default sprint dataset (10 issues, 50 points, Day 4).
  - Extreme Input: Added issue with 60-character continuous non-spaced key and 200-character continuous non-spaced summary.
  - Themes: Verified under both Light Theme (`theme-light`) and Dark Theme (`theme-dark`).

---

## 3. Compatibility Matrix

### Google Chrome (v155.0.8059.85)

| Width | Loads Without Console Errors | No Page Horizontal Scroll | Table Columns Visible | Chart Readable | Add-Issue Form Usable |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1024px** | PASS | PASS (`scrollWidth === clientWidth`) | PASS (`scrollWidth === clientWidth`) | PASS | PASS |
| **1366px** | PASS | PASS (`scrollWidth === clientWidth`) | PASS (`scrollWidth === clientWidth`) | PASS | PASS |
| **1920px** | PASS | PASS (`scrollWidth === clientWidth`) | PASS (`scrollWidth === clientWidth`) | PASS | PASS |

*Note: Viewports 1100px, 1200px, 1280px, 1440px, and 1600px were also tested and passed with 0px overflow in both light and dark modes.*

### Microsoft Edge (v156.0.4314.42)

| Width | Loads Without Console Errors | No Page Horizontal Scroll | Table Columns Visible | Chart Readable | Add-Issue Form Usable |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1024px** | PASS | PASS (`scrollWidth === clientWidth`) | PASS (`scrollWidth === clientWidth`) | PASS | PASS |
| **1366px** | PASS | PASS (`scrollWidth === clientWidth`) | PASS (`scrollWidth === clientWidth`) | PASS | PASS |
| **1920px** | PASS | PASS (`scrollWidth === clientWidth`) | PASS (`scrollWidth === clientWidth`) | PASS | PASS |

*Note: Viewports 1100px, 1200px, 1280px, 1440px, and 1600px were also tested and passed with 0px overflow in both light and dark modes.*

### Mozilla Firefox

| Width | Loads Without Console Errors | No Page Horizontal Scroll | Table Columns Visible | Chart Readable | Add-Issue Form Usable |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1024px** | TO BE TESTED | TO BE TESTED | TO BE TESTED | TO BE TESTED | TO BE TESTED |
| **1366px** | TO BE TESTED | TO BE TESTED | TO BE TESTED | TO BE TESTED | TO BE TESTED |
| **1920px** | TO BE TESTED | TO BE TESTED | TO BE TESTED | TO BE TESTED | TO BE TESTED |

*Note: Mozilla Firefox is not installed on the test workstation and must be validated in CI or during team manual verification.*

---

## 4. Root Causes & Fixes Applied

1. **Grid Column Auto Minimum**:
   - *Cause*: CSS Grid column definition `grid-template-columns: 1fr` has an implicit `min-width: auto`. When the backlog table contained content wider than the available space, the grid column expanded, pushing the document width beyond the viewport (creating up to 183px overflow at 1200px).
   - *Fix*: Changed `.dashboard-grid` columns to `minmax(0, 1fr)` and `@media (min-width: 1200px)` to `repeat(2, minmax(0, 1fr))`, plus `.dashboard-grid > * { min-width: 0; }`.

2. **Table Cell Overflow & Whitespace**:
   - *Cause*: `.cell-summary` had a rigid `min-width: 190px` and cell headers had `white-space: nowrap`, causing the table to force internal scrolling on smaller viewports.
   - *Fix*: Changed `.cell-summary` to `min-width: 0; overflow-wrap: anywhere;`, `.cell-key` to `white-space: normal; overflow-wrap: anywhere;`, reduced padding slightly (`.7rem .6rem`), and set table header whitespace to `normal`. Added `scrollbar-width: thin;` for Firefox scrollbar parity.

3. **Direct File Protocol Block**:
   - *Cause*: Double-clicking `src/index.html` loads the file under `file://`. Chromium browsers block ES module imports on file URLs due to CORS policy, rendering a blank screen.
   - *Fix*: Added a lightweight classic script `src/js/ui/fileProtocolNotice.js` loaded before the module script. When `location.protocol === 'file:'`, it injects a clear guidance message instructing the user to serve the application via HTTP (`npx serve src`). Also added a `<noscript>` fallback.
