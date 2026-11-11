# QA closeout evidence

Automated execution on 2026-11-11 by Codex for Naveen. Human acceptance remains pending. See [Test Summary](../../test-summary-report.md) and [manifest](manifest.json).

Reproduce from the recorded tested commit (or a tree-equivalent reviewed version):

```powershell
npm run test:coverage -- --json docs/reports/evidence/qa-closeout/unit-coverage.json
$env:QA_EVIDENCE_DIR = 'docs/reports/evidence/qa-closeout'
$env:QA_TESTER = 'Your actual name and execution method'
# QA_EXECUTION_DATE is optional; defaults to the actual UTC execution date.
# Playwright must be available outside the repository through NODE_PATH.
node tools/system-validation/run.cjs chrome
node tools/system-validation/run.cjs msedge
node tools/system-validation/run.cjs firefox
node tools/browser-coverage.cjs --json docs/reports/evidence/qa-closeout/browser-coverage.json
node tools/coverage.mjs --from coverage/lcov.info --browser docs/reports/evidence/qa-closeout/browser-coverage.json --json docs/reports/evidence/qa-closeout/combined-coverage.json
npm run test:qa-report
```

Re-execution creates new run files with their actual SHA/date. To replace the accepted evidence set, update the manifest and derived reports after review; a changed output is not automatically accepted. The evidence audit validates committed results without launching a browser, so it can also run in CI.

The native suite and coverage helper have separately recorded execution commits with identical application/test trees. The manifest hashes execution logs, JSON and screenshots. Browser screenshot paths refer to this directory. Current screenshots explicitly stop animation and redraw the existing chart data without animation before capture; that convention does not test animation completion. Original earlier runs and Bhuvi's manual reports remain elsewhere in evidence, with their original authorship and qualifications.
