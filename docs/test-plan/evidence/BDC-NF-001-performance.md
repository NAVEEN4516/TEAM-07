# BDC-NF-001 Performance Verification Evidence

- **Requirement Reference:** SRS Section 5 (BDC-NF-001), Software Test Plan Section 13.2 (TC-NF-01.1)
- **Target Threshold:** UI, chart, and KPI updates must complete within 2.0 seconds (< 2000 ms) of any valid data change.
- **Tested Commits:**
  - Run 3 (Multi-Browser & a11y): `85391ae9181a666cc5b975968070e3dc5059a352` (short `85391ae`, 2026-11-10)
  - Run 2 (Baseline rerun): `222089658f26badaf5c9f6d3c60e75986ebd6320` (2026-11-07)
- **Execution Date:** 2026-11-10 (Run 3), 2026-11-07 (Run 2)
- **QA Tester:** Bhuvi (`@stacktrace-bhuvi`)
- **Data Source Files (Run 3):**
  - Google Chrome: `docs/reports/evidence/sv-results-chrome-2026-11-10-85391ae.json` (version 156.0.8078.80)
  - Microsoft Edge: `docs/reports/evidence/sv-results-msedge-2026-11-10-85391ae.json` (version 157.0.4341.42)
  - Mozilla Firefox: `docs/reports/evidence/sv-results-firefox-2026-11-10-85391ae.json` (version 159.0 (Playwright build))

---

## 1. Measurement Methodology

### Method A: Automated In-App Timing Profiling (`?perf`)
1. Serve the application directory via static HTTP loopback:
   ```bash
   npx serve src -p 8080
   ```
2. Navigate to `http://127.0.0.1:8080/index.html?perf`.
3. In `src/js/ui/dashboard.js`, when `?perf` is enabled:
   - Synchronous start timestamp `lastNotifyStartedAt` is captured when `notify()` begins.
   - A double `requestAnimationFrame` callback measures the elapsed time to the final paint/composite tick:
     ```javascript
     const ms = performance.now() - start;
     window.__lastUpdateMs = ms;
     window.__perfLog.push({ action: 'update', ms });
     ```
4. 10 consecutive iterations are executed for each core user interaction to obtain minimum, median, and maximum latency figures directly from automated browser samples.

---

## 2. Test Results Matrix (Method A: 10 Iterations Per Action)

- **Requirement:** Update time < 2000 ms
- **Environment:** Windows 11, Node.js v22.19.0, Playwright automated suite
- **Traceable Run Files (Run 3 - 2026-11-10):** `docs/reports/evidence/sv-run-chrome-2026-11-10-85391ae.log`, `docs/reports/evidence/sv-run-msedge-2026-11-10-85391ae.log`, `docs/reports/evidence/sv-run-firefox-2026-11-10-85391ae.log`

### Run 3 Results (Tested SHA: `85391ae`)

| User Action | Requirement | Google Chrome (v156.0.8078.80) | Microsoft Edge (v157.0.4341.42) | Mozilla Firefox (v159.0 Playwright build) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Add Issue** (BDC-F-006) | < 2000 ms | Min: 31.10 ms<br>**Med: 34.40 ms**<br>Max: 43.40 ms | Min: 26.20 ms<br>**Med: 40.60 ms**<br>Max: 46.90 ms | Min: 29.00 ms<br>**Med: 53.00 ms**<br>Max: 74.00 ms | **PASS** |
| **Change Current Day** (BDC-F-003) | < 2000 ms | Min: 26.90 ms<br>**Med: 34.60 ms**<br>Max: 45.40 ms | Min: 29.00 ms<br>**Med: 36.60 ms**<br>Max: 51.40 ms | Min: 35.00 ms<br>**Med: 48.00 ms**<br>Max: 105.00 ms | **PASS** |
| **Edit Issue to Done** (BDC-F-007) | < 2000 ms | Min: 28.00 ms<br>**Med: 44.30 ms**<br>Max: 55.00 ms | Min: 24.40 ms<br>**Med: 42.40 ms**<br>Max: 51.90 ms | Min: 27.00 ms<br>**Med: 39.00 ms**<br>Max: 78.00 ms | **PASS** |
| **Delete Issue** (BDC-F-008) | < 2000 ms | Min: 26.00 ms<br>**Med: 36.10 ms**<br>Max: 46.00 ms | Min: 22.40 ms<br>**Med: 42.80 ms**<br>Max: 51.80 ms | Min: 26.00 ms<br>**Med: 36.00 ms**<br>Max: 78.00 ms | **PASS** |
| **Reset Data** (BDC-F-009) | < 2000 ms | Min: 20.60 ms<br>**Med: 38.40 ms**<br>Max: 50.40 ms | Min: 24.00 ms<br>**Med: 40.80 ms**<br>Max: 46.90 ms | Min: 31.00 ms<br>**Med: 50.00 ms**<br>Max: 96.00 ms | **PASS** |

*Note: All three browsers (Google Chrome, Microsoft Edge, and Mozilla Firefox) execute the complete update cycle in < 105 ms (medians between 34 ms and 53 ms), outperforming the 2000 ms requirement by at least a factor of 20x to 50x.*

### Run 2 Baseline Results (Tested SHA: `2220896` - 2026-11-07)

| User Action | Requirement | Google Chrome (v156.0.8078.80) | Microsoft Edge (v157.0.4341.42) | Mozilla Firefox | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Add Issue** (BDC-F-006) | < 2000 ms | Min: 22.70 ms<br>**Med: 26.50 ms**<br>Max: 37.30 ms | Min: 22.20 ms<br>**Med: 27.30 ms**<br>Max: 40.20 ms | TO BE MEASURED (See manual sheet) | **PASS** |
| **Change Current Day** (BDC-F-003) | < 2000 ms | Min: 21.40 ms<br>**Med: 24.50 ms**<br>Max: 37.30 ms | Min: 20.90 ms<br>**Med: 27.50 ms**<br>Max: 39.10 ms | TO BE MEASURED (See manual sheet) | **PASS** |
| **Edit Issue to Done** (BDC-F-007) | < 2000 ms | Min: 21.10 ms<br>**Med: 24.40 ms**<br>Max: 31.40 ms | Min: 19.50 ms<br>**Med: 24.90 ms**<br>Max: 34.40 ms | TO BE MEASURED (See manual sheet) | **PASS** |
| **Delete Issue** (BDC-F-008) | < 2000 ms | Min: 20.20 ms<br>**Med: 24.60 ms**<br>Max: 29.00 ms | Min: 20.60 ms<br>**Med: 24.40 ms**<br>Max: 34.20 ms | TO BE MEASURED (See manual sheet) | **PASS** |
| **Reset Data** (BDC-F-009) | < 2000 ms | Min: 20.10 ms<br>**Med: 23.70 ms**<br>Max: 29.60 ms | Min: 19.10 ms<br>**Med: 24.10 ms**<br>Max: 31.00 ms | TO BE MEASURED (See manual sheet) | **PASS** |

---

## 3. Automated Logic Layer Stress Verification

Automated Node.js unit tests (`tests/perf/updateTime.test.js`) executed via `node --test`:
1. **200 sequential iterations** of `addIssue + setCurrentDay + getKPIs` on default dataset: 100% of iterations < 2000 ms (average < 1 ms per iteration).
2. **Stress dataset of 1,000 pre-populated issues** across 50 update cycles: 100% of operations < 2000 ms (average ~2–3 ms per cycle).
- Execution outcome: **PASS** (zero regressions).
