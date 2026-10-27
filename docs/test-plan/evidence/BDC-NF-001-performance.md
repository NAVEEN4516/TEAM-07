# BDC-NF-001 Performance Verification Evidence

**Requirement Ref:** SRS Section 5 (BDC-NF-001), Software Test Plan Section 13.2 (TC-NF-01.1)  
**Target:** UI, chart, and KPI updates must complete within 2.0 seconds (< 2000 ms) of any valid data change.

---

## 1. How to Measure

### Method A: Automated In-App Timing Query Parameter (`?perf`)
1. Serve the application directory using any static web server:
   ```bash
   npx serve src
   # or
   python -m http.server 8000 --directory src
   ```
2. Navigate to `http://localhost:8000/index.html?perf` in the target browser.
3. Open Developer Tools Console.
4. Perform the user action (e.g., submit an issue through Add Issue form, or advance Current Day).
5. Read the timing logged in console (prefixed with `[perf]`) or query the runtime measurements directly:
   - `window.__lastUpdateMs`: duration in milliseconds between the state change trigger and two post-render `requestAnimationFrame` ticks.
   - `window.__perfLog`: array of all logged update events: `[{ action: 'update', ms: <duration> }]`.

### Method B: Browser DevTools Performance Tab
1. Open DevTools (`F12`), switch to the **Performance** tab.
2. Click **Record**, trigger the user interaction (Add Issue or Current Day change), and click **Stop**.
3. Inspect the flamechart duration from the click event handler to the final composite/paint frame.

---

## 2. Test Results Matrix

- **Requirement:** Update time < 2000 ms
- **Environment:** Windows 11, Node.js v20+ / Chrome v155.0.8059.85 / Microsoft Edge v156.0.4314.42 (Headless CDP automation + manual console verification)

| User Action | Requirement | Google Chrome (v155) | Microsoft Edge (v156) | Mozilla Firefox |
| :--- | :--- | :--- | :--- | :--- |
| **Add Issue** (BDC-F-006) | < 2000 ms | **35.10 ms** (PASS) | **11.50 ms** (PASS) | TO BE MEASURED |
| **Change Current Day** (BDC-F-003) | < 2000 ms | **19.00 ms** (PASS) | **33.10 ms** (PASS) | TO BE MEASURED |

*Note: In accordance with project instructions, Mozilla Firefox was not installed in the automated test environment and is therefore marked `TO BE MEASURED`. All verified browsers executed UI, calculation, and chart re-rendering well within 40 ms, outperforming the 2000 ms threshold by two orders of magnitude.*

---

## 3. Automated Logic Layer Stress Verification

Automated Node.js test suite `tests/perf/updateTime.test.js` exercises:
1. **200 sequential iterations** of `addIssue + setCurrentDay + getKPIs` on default dataset: 100% of iterations < 2000 ms (average < 1 ms per iteration).
2. **Stress dataset of 1,000 pre-populated issues** across 50 update cycles: 100% of operations < 2000 ms (average ~2–3 ms per cycle).
