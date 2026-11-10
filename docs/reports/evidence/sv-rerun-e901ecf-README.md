# Re-run of the merged system-validation runner on develop `e901ecf`

Provenance for `sv-rerun-e901ecf-chrome.json`, `sv-rerun-e901ecf-msedge.json` and the two matching `.log` files. These are my own raw outputs. They are kept apart from Bhuvi's `sv-results-*` and `sv-run-*` files, which were not touched.

| | |
| :-- | :-- |
| **Executed** | 2026-11-09, about 05:42 UTC (11:12 IST) |
| **Executed by** | Hemanth Reddy, on his own machine |
| **Commit tested** | `e901ecf17232f97a307ab6c723ba13bdc26aa744`, the head of `develop` after PR #48 and PR #51 were merged. This includes the DEF-01 fix (`e1b41e8`). |
| **Runner** | `tools/system-validation/run.cjs` as merged by PR #48, unchanged |
| **Commands** | `node tools/system-validation/run.cjs chrome` and `node tools/system-validation/run.cjs msedge`, run in a scratch checkout of `e901ecf` so that Bhuvi's committed evidence was not overwritten |
| **Environment** | Windows 11 (10.0.26300), Node 24.11.1, Playwright 1.65.0, Google Chrome 156.0.8078.80, Microsoft Edge 157.0.4341.42 |
| **Not run** | Firefox and any screen reader. Nothing here covers them. |

## Result

| Browser | Records | PASS | FAIL | BLOCKED | NOT EXECUTED |
| :-- | --: | --: | --: | --: | --: |
| Chrome 156.0.8078.80 | 53 | 52 | 0 | 1 | 0 |
| Edge 157.0.4341.42 | 53 | 52 | 0 | 1 | 0 |

The one BLOCKED record in each browser is `TC-F-13.2`, the table-scroll criterion still awaiting a decision (OBS-04 in the requirements traceability matrix).

## Comparison with the merged Run 2 evidence (baseline `2220896`)

- Same 53 record IDs in both browsers, and **no status differs** in any of the 106 record pairs.
- The result text of 52 of the 53 records in each browser is identical. The one that differs is `TC-NF-01.1`, which holds timings. Medians were lower in this run (Chrome 16.5 to 19.3 ms, Edge 17.3 to 19.1 ms) than in Run 2 (Chrome 23.7 to 26.5 ms, Edge 24.1 to 27.5 ms). Both are far under the 2000 ms limit. The difference reflects load on the machine, not a change in the application.

## Three labels in these files are wrong for this run

The runner has three constants written into the code. They appear in the records or log headers, and I did not change the runner.

- `commitSha` and the log line "Target Tested Commit" say `222089658f26…` (the baseline). The code actually served was `e901ecf`.
- `tester` and the log line "Tester" say `stacktrace-bhuvi`. This run was executed by Hemanth Reddy.
- `executionDate` says `2026-11-07`. The actual re-run was on `2026-11-09`, as shown by this README and the timestamped execution logs. The original raw files are preserved; use this provenance note when interpreting their inherited labels.

## What this does and does not show

It shows that Bhuvi's 53 system records give the same results on the code that now includes the DEF-01 fix, in the same two browsers. It does not show anything new about Firefox, screen readers or the table-scroll decision, and it adds no new test cases.
