# BDC-NF-001 Performance Verification Evidence

- **Requirement Reference:** SRS Section 5 (BDC-NF-001), Software Test Plan Section 13.2 (TC-NF-01.1)
- **Target Threshold:** UI, chart, and KPI updates must complete within 2.0 seconds (< 2000 ms) of any valid data change.
- **Tested Commit (Baseline SHA):** `222089658f26badaf5c9f6d3c60e75986ebd6320`
- **Execution Date:** 2026-11-07
- **QA Tester:** Bhuvi (`@stacktrace-bhuvi`)
- **Data Source Files:**
  - Google Chrome: `docs/reports/evidence/sv-results-chrome-2026-11-07.json` (version 156.0.8078.80)
  - Microsoft Edge: `docs/reports/evidence/sv-results-msedge-2026-11-07.json` (version 157.0.4341.42)

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
- **Traceable Run Files:** `docs/reports/evidence/sv-run-chrome-2026-11-07.log`, `docs/reports/evidence/sv-run-msedge-2026-11-07.log`

| User Action | Requirement | Google Chrome (v156.0.8078.80) | Microsoft Edge (v157.0.4341.42) | Mozilla Firefox | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Add Issue** (BDC-F-006) | < 2000 ms | Min: 22.70 ms<br>**Med: 26.50 ms**<br>Max: 37.30 ms | Min: 22.20 ms<br>**Med: 27.30 ms**<br>Max: 40.20 ms | TO BE MEASURED (See manual sheet) | **PASS** |
| **Change Current Day** (BDC-F-003) | < 2000 ms | Min: 21.40 ms<br>**Med: 24.50 ms**<br>Max: 37.30 ms | Min: 20.90 ms<br>**Med: 27.50 ms**<br>Max: 39.10 ms | TO BE MEASURED (See manual sheet) | **PASS** |
| **Edit Issue to Done** (BDC-F-007) | < 2000 ms | Min: 21.10 ms<br>**Med: 24.40 ms**<br>Max: 31.40 ms | Min: 19.50 ms<br>**Med: 24.90 ms**<br>Max: 34.40 ms | TO BE MEASURED (See manual sheet) | **PASS** |
| **Delete Issue** (BDC-F-008) | < 2000 ms | Min: 20.20 ms<br>**Med: 24.60 ms**<br>Max: 29.00 ms | Min: 20.60 ms<br>**Med: 24.40 ms**<br>Max: 34.20 ms | TO BE MEASURED (See manual sheet) | **PASS** |
| **Reset Data** (BDC-F-009) | < 2000 ms | Min: 20.10 ms<br>**Med: 23.70 ms**<br>Max: 29.60 ms | Min: 19.10 ms<br>**Med: 24.10 ms**<br>Max: 31.00 ms | TO BE MEASURED (See manual sheet) | **PASS** |

*Note: Mozilla Firefox was not installed on the automated test host and is marked `TO BE MEASURED`. All verified Chromium browsers executed the full cycle of state update, DOM rendering, and Chart.js animation update in under 41 ms (median ~25 ms), comfortably outperforming the 2000 ms requirement by a factor of 75.*

---

## 3. Automated Logic Layer Stress Verification

Automated Node.js unit tests (`tests/perf/updateTime.test.js`) executed via `node --test`:
1. **200 sequential iterations** of `addIssue + setCurrentDay + getKPIs` on default dataset: 100% of iterations < 2000 ms (average < 1 ms per iteration).
2. **Stress dataset of 1,000 pre-populated issues** across 50 update cycles: 100% of operations < 2000 ms (average ~2–3 ms per cycle).
- Execution outcome: **PASS** (zero regressions).
