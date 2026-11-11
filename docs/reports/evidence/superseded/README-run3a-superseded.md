# Superseded Run 3a Evidence Files (2026-11-10)

## Reason for Superseding
These Run 3a results JSON and execution log files (`*-e901ecf.*`) were generated during the initial execution of the multi-browser testing phase suite. 

Although the application tree tested already included commit `a8be0d2` (which fixed schedule status badge CSS styling defect SV-D-01), the test runner had hard-coded the baseline SHA label `e901ecf17232f97a307ab6c723ba13bdc26aa744`. 

To maintain strict evidence integrity and commit traceability:
- The runner was updated to dynamically compute and record `testedCommit` from `git rev-parse HEAD` and `appSourceTree` from `git rev-parse HEAD:src`.
- The suite was re-executed against the real tested commit SHA `85391ae880a42446cf0591f215ea7849e3bf32be` (`85391ae`).
- These earlier files are preserved here historically without modification. No results or numbers were edited.

## Archived Files
- `sv-results-chrome-2026-11-10-e901ecf.json`
- `sv-run-chrome-2026-11-10-e901ecf.log`
- `sv-results-msedge-2026-11-10-e901ecf.json`
- `sv-run-msedge-2026-11-10-e901ecf.log`
- `sv-results-firefox-2026-11-10-e901ecf.json`
- `sv-run-firefox-2026-11-10-e901ecf.log`
- `sv-unit-e901ecf.log`
