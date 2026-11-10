# BDC-NF-001 Performance Verification Evidence

- **Requirement Reference:** SRS Section 5 (BDC-NF-001), Software Test Plan Section 13.2 (TC-NF-01.1)
- **Target Threshold:** UI, chart, and KPI updates must complete within 2.0 seconds (< 2000 ms) of any valid data change.
- **Tested Commits:**
  - Run 3 (Multi-Browser & a11y): `e901ecf17232f97a307ab6c723ba13bdc26aa744` (2026-11-10)
  - Run 2 (Baseline rerun): `222089658f26badaf5c9f6d3c60e75986ebd6320` (2026-11-07)
- **Execution Date:** 2026-11-10 (Run 3), 2026-11-07 (Run 2)
- **QA Tester:** Bhuvi (`@stacktrace-bhuvi`)
- **Data Source Files (Run 3):**
  - Google Chrome: `docs/reports/evidence/sv-results-chrome-2026-11-10-e901ecf.json` (version 156.0.8078.80)
  - Microsoft Edge: `docs/reports/evidence/sv-results-msedge-2026-11-10-e901ecf.json` (version 157.0.4341.42)
  - Mozilla Firefox: `docs/reports/evidence/sv-results-firefox-2026-11-10-e901ecf.json` (version 159.0)

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
- **Traceable Run Files (Run 3 - 2026-11-10):** `docs/reports/evidence/sv-run-chrome-2026-11-10-e901ecf.log`, `docs/reports/evidence/sv-run-msedge-2026-11-10-e901ecf.log`, `docs/reports/evidence/sv-run-firefox-2026-11-10-e901ecf.log`

### Run 3 Results (Tested SHA: `e901ecf`)

| User Action | Requirement | Google Chrome (v156.0.8078.80) | Microsoft Edge (v157.0.4341.42) | Mozilla Firefox (v159.0) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Add Issue** (BDC-F-006) | < 2000 ms | Min: 30.90 ms<br>**Med: 41.50 ms**<br>Max: 52.90 ms | Min: 24.00 ms<br>**Med: 39.70 ms**<br>Max: 54.20 ms | Min: 53.00 ms<br>**Med: 84.00 ms**<br>Max: 138.00 ms | **PASS** |
| **Change Current Day** (BDC-F-003) | < 2000 ms | Min: 27.80 ms<br>**Med: 46.70 ms**<br>Max: 54.90 ms | Min: 28.50 ms<br>**Med: 36.30 ms**<br>Max: 49.90 ms | Min: 61.00 ms<br>**Med: 74.00 ms**<br>Max: 81.00 ms | **PASS** |
| **Edit Issue to Done** (BDC-F-007) | < 2000 ms | Min: 28.10 ms<br>**Med: 43.20 ms**<br>Max: 53.50 ms | Min: 34.60 ms<br>**Med: 44.10 ms**<br>Max: 51.10 ms | Min: 42.00 ms<br>**Med: 72.00 ms**<br>Max: 88.00 ms | **PASS** |
| **Delete Issue** (BDC-F-008) | < 2000 ms | Min: 25.30 ms<br>**Med: 42.10 ms**<br>Max: 48.50 ms | Min: 20.40 ms<br>**Med: 38.10 ms**<br>Max: 44.30 ms | Min: 64.00 ms<br>**Med: 76.00 ms**<br>Max: 84.00 ms | **PASS** |
| **Reset Data** (BDC-F-009) | < 2000 ms | Min: 20.40 ms<br>**Med: 36.80 ms**<br>Max: 49.90 ms | Min: 21.10 ms<br>**Med: 34.90 ms**<br>Max: 53.10 ms | Min: 69.00 ms<br>**Med: 75.00 ms**<br>Max: 185.00 ms | **PASS** |

*Note: All three browsers (Google Chrome, Microsoft Edge, and Mozilla Firefox) execute the complete update cycle in < 185 ms (medians between 34 ms and 84 ms), outperforming the 2000 ms requirement by at least a factor of 10x in Firefox and 40x in Chromium.*

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
