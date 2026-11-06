# Testing phase start

Prepared for Naveen Prasad M, QA Lead, on 6 November 2026. This pack establishes
the test version, current responsibilities and execution expectations for the
Burndown Chart Generator. It is not final acceptance or a signed summary report.

## Application baseline

- Test application commit: [`222089658f26badaf5c9f6d3c60e75986ebd6320`](https://github.com/NAVEEN4516/TEAM-07/commit/222089658f26badaf5c9f6d3c60e75986ebd6320), the current `develop` including recording PR #46.
- Reviewed documentation source: [`db1d39c5d798bfaefe3724795141072ffd41d2e8`](https://github.com/NAVEEN4516/TEAM-07/commit/db1d39c5d798bfaefe3724795141072ffd41d2e8), `main` with the corrected Test Plan and deviations log.
- Both branches have identical `src` tree `0de8ce93a297760cfe1804f78b876d78fe0e94af` and `tests` tree `6c7fc32108d4e1a0ba89984162f42e0a385fd0a3`.
- This preparation branch retains the recording/README from develop and restores the reviewed Test Plan/deviations from main. Application source and automated tests are unchanged.
- This is the single-sprint simulator. The reverted project-backlog/multi-sprint extension is outside the test scope.

Use this SHA for the first execution cycle. After a code fix, record the new SHA
and rerun affected cases. Changes only to these documents do not change the
application baseline. Team agreement and human sign-off remain to be recorded.

```powershell
git fetch origin
git switch -c feature/BDC-NF-005-testing 222089658f26badaf5c9f6d3c60e75986ebd6320
npm ci
npm test
python -m http.server 8000 --bind 127.0.0.1 --directory src
```

Choose a unique feature-branch name per teammate. Open http://localhost:8000 and
stop the server with Ctrl+C. Use the repository's existing optional browser
helper when Playwright and the selected browser are available. CI runs Node.js
20; record the actual runtime for local runs rather than calling it Node 20.

## Current responsibilities

| Person | Work and deliverables | First action |
| --- | --- | --- |
| Naveen Prasad M | Coordinate baseline and expected results; own shared test-document revisions; independently verify workflows; review defects/retests and reports; write the final Test Summary after execution | Review this pack and share its baseline and addendum |
| Hemanth Reddy | Unit, integration and regression execution; reproducible code/branch coverage; Unit Test Report, Code Coverage Report, Branch Coverage Report; RTM covering all 25 requirements | Run the baseline suite and measure gaps before adding tests |
| Bhuvi Sudheendra Katti | Functional system execution, compatibility, accessibility, security and performance evidence; System Validation Report | Execute the agreed cases and complete missing environment checks |

These three people form the current testing team. This assignment supersedes
the legacy four-person table for the current cycle; it does not alter genuine
historical contribution evidence. Testing remains shared and important fixes
should be independently checked by another member.

## Executed starting checks

Codex executed these automated checks for Naveen on 6 November 2026. No human
review, signature or teammate approval is inferred.

| Check | Actual result | Evidence |
| --- | --- | --- |
| `npm test` | 255 tests, 63 suites, 255 passed, 0 failed; exit 0 | [Raw unit output](evidence/qa-start-unit.log) |
| Existing browser helper, Chrome 157.0.8103.38 | PASS; no page errors; add/edit/delete/reset and chart/KPI validation included | [Browser output](evidence/qa-start-browser.json) |
| Execution provenance | Runtime, OS, timestamps, baseline and script hashes | [Environment record](evidence/qa-start-environment.json) |
| Browser image | Fresh smoke screenshot; earlier Sprint 2 evidence preserved | [Chrome smoke screenshot](evidence/qa-start-chrome.png) |

The browser helper also checks keyboard/focus, hostile text, single-day zero
scope, CSP, unavailable storage, completion bounds and the styled no-JavaScript
notice. Its assertions were unchanged; only the screenshot destination was
redirected to this pack. This is not a complete master-plan execution, a code or
branch coverage measurement, or a full browser performance report.

## Test expectations

Use the [execution addendum](../test-plan/testing-phase-addendum.md) with the
[reviewed master Test Plan](../test-plan/Burndown_Chart_Test_Plan.docx). Keep its
case IDs. The addendum clarifies current tools, current assignments and changed
case expectations. Raise contradictions with the SRS for review rather than
weakening acceptance to make a case pass.

## Evidence and defects

Every execution needs test ID, requirement, steps/input, expected result, actual
result, Pass/Fail/Blocked/Not run, tester/execution method, date, environment,
commit SHA and evidence link. Label automated execution as automated.

For an actual defect record ID, severity, reproduction, expected/actual result,
owner, discovery SHA, evidence, fix SHA and retest result/reviewer. Do not create
GitHub issues or modify boards automatically as part of this preparation. Agree
tracking with the QA Lead. Do not fill logs with invented findings.

## Deliverables to begin in parallel

| Intended file under `docs/reports/` | Coordinator | Current status |
| --- | --- | --- |
| `unit-test-report.md` | Hemanth | Final report pending |
| `code-coverage-report.md` | Hemanth | Measurement and report pending |
| `branch-coverage-report.md` | Hemanth | Measurement and report pending |
| `requirements-traceability.md` | Hemanth, reviewed by Naveen | Final evidence mapping pending |
| `system-validation-report.md` | Bhuvi | Complete system execution pending |
| `test-summary-report.md` | Naveen | Team results and retesting pending |

These names identify planned deliverables, not completed reports. Hemanth and
Bhuvi can begin simultaneously from the same application SHA. Naveen consolidates
corrections to shared documents and reviews the two result streams.

## Open preparation items

- Firefox and manual screen-reader checks remain pending. Historical Chrome/Edge evidence is not a new final-version verification.
- TC-F-13.2 says no horizontal scrolling, while existing evidence differs on internal table scrolling. Record page and table widths separately. The smoke assertion proves page-level fit only; Bhuvi records both results and Naveen reviews acceptance.
- The Word document retains legacy Jest/Node 18 wording and the former assignment table. This linked addendum supplies the current execution instructions. The bundled Word renderer cannot find LibreOffice; the already-reviewed main-branch document is restored unchanged and no new Word visual-QA claim is made.
- Coverage has not been measured in this pack; no threshold or percentage is invented.
- Team review of the addendum/assignments has not yet been recorded.

## Review and exit criteria

Use feature branches and PRs into develop. Preserve personal Git identities and
meaningful commits; use **Create a merge commit**, not squash or rebase. Verify
CI and obtain the required approval. Promote the verified version through a
develop-to-main PR, preserving the recording and reviewed documentation.

Final acceptance requires all planned cases executed, no open critical/high
defects, all SRS acceptance criteria evidenced, automated suite and CI passing,
RTM updated with Pass only where supported, required reports present, and Test
Lead review/sign-off with limitations explicit. This start pack does not claim
that final gate is complete.
