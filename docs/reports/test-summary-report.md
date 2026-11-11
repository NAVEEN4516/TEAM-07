# Test Summary Report

Date: 2026-11-11. QA coordination: Naveen Prasad M. Automated execution: Codex for Naveen. Scope: existing single-sprint Burndown Chart Generator; no multi-sprint extension.

**Technical test execution: complete. Human acceptance: pending.** This report is a reviewable technical recommendation, not a fabricated human sign-off or a statement that every possible defect is absent.

## Version and environment

- Browser suites tested commit `d26e7be1df35b3b67ab7754891bc730429185ff3`; source tree `b8551212e3d76197cbe7db9fd4cde6d5f0b27193`; test tree `71ebd572afd425a47c89999183a5a32737c9fbe1`.
- Native execution/coverage ran at `860ec94d432eecaac6197a25f8f809bbcdff7e8c`; Chrome execution coverage ran at `06966a04af97d30ca2c57d25bf7f27c6a249f591`. Both commits have exactly the same `src` and `tests` trees as the browser suites. Later changes are evidence/documentation/audit wiring.
- Node v24.18.0, npm 11.16.0, Playwright 1.62.1, Windows-11-10.0.26300-SP0.
- Reproduction commands, versions and file hashes: [manifest](evidence/qa-closeout/manifest.json), [evidence README](evidence/qa-closeout/README.md).

## Results

| Measurement | Result | Evidence |
| --- | --- | --- |
| Native unit/integration/architecture suite | 411 PASS, 92 suites, 0 failures/skipped/todo | [raw execution and coverage](evidence/qa-closeout/unit-coverage.log) |
| Chrome 157.0.8103.50 | 61 PASS, 0 FAIL/BLOCKED/NOT EXECUTED | [JSON](evidence/qa-closeout/sv-results-chrome-2026-11-11-d26e7be.json) |
| Edge 157.0.4341.46 | 61 PASS, 0 FAIL/BLOCKED/NOT EXECUTED | [JSON](evidence/qa-closeout/sv-results-msedge-2026-11-11-d26e7be.json) |
| Firefox 153.0 (Playwright build) | 61 PASS, 0 FAIL/BLOCKED/NOT EXECUTED | [JSON](evidence/qa-closeout/sv-results-firefox-2026-11-11-d26e7be.json) |
| Plan execution assessment | 44 cases Pass; 25 requirements supported | [current RTM](requirements-traceability.md) |
| Measured-file native coverage | Lines 87.64%; code lines 83.86%; functions 92.93% | [unit JSON](evidence/qa-closeout/unit-coverage.json) |
| All 16 application files, code lines | Unit 68.3%; Chrome helper 82.17%; either 92.87% | [combined JSON](evidence/qa-closeout/combined-coverage.json) |
| V8 measured-file blocks | 563/565 (99.65%) | V8 block ranges, not whole-application decision/condition coverage |

The browser record count is now 61 rather than 63: the two hardcoded inspection/unit PASS declarations were removed. Those checks genuinely execute in the separate 411-test native suite. All nine keyboard records remain. Screenshots use an explicit stop/update-without-animation draw of the current chart data; this is a documented capture convention, not a test of animation completion. Functional input and performance assertions run separately without that capture operation. Sample screenshots at 1366 light and 1024 dark were visually inspected by Codex for readable chart/table layout; this is not a human usability study.

## Performance

Ten samples per action and browser; actual sample minimum/median/maximum below. The median here is the average of the middle two of ten samples. The legacy runner's textual summary uses the upper middle sample; raw samples are authoritative.

| Action | Chrome min / median / max ms | Edge min / median / max ms | Firefox min / median / max ms |
| --- | --- | --- | --- |
| addIssue | 18.60 / 29.60 / 36.40 | 34.50 / 51.55 / 55.80 | 29.00 / 40.50 / 57.00 |
| changeDay | 21.80 / 25.55 / 37.10 | 39.50 / 53.10 / 57.10 | 35.00 / 36.50 / 48.00 |
| editToDone | 19.60 / 23.15 / 34.80 | 49.20 / 52.80 / 64.90 | 26.00 / 31.50 / 43.00 |
| delete | 21.20 / 23.70 / 40.10 | 52.40 / 55.45 / 58.90 | 25.00 / 27.50 / 48.00 |
| reset | 21.80 / 22.90 / 30.90 | 44.20 / 54.55 / 56.80 | 36.00 / 41.00 / 58.00 |

All recorded samples are positive and below the 2000ms threshold. Method A measures notification through the double-requestAnimationFrame paint proxy; it is not network latency, a user study or a measurement of every possible animation. The independent legacy helper also passes with zero page errors: [log](evidence/qa-closeout/browser-coverage.log).

## Defects and reconciliation

| Item | Fix / disposition | Verification |
| --- | --- | --- |
| DEF-01: recovery reasons unavailable to subscribers | Hemanth's fix from PR #51 retained | Native regression cases and all browser suites |
| SV-D-01: schedule badge selectors unmatched | Bhuvi's CSS fix from PR #54 retained | Native stylesheet test, computed text/colors/contrast in all engines |
| QA-C-01: backlog overflow at required desktop widths | Stack chart/backlog below 1600px; preserve strict no-page/no-table horizontal-scroll criterion | Eight viewport/theme records per engine and TC-F-13.2; zero overflow |
| QA-C-02: transient canvas overflow on resize | Bound canvas max-width while Chart.js resizes | The legacy helper initially reproduced overflow at 1024px; after the fix its unchanged resize assertions pass |
| QA-C-03: wrong evidence labels and screenshots during animation | Actual execution attribution/date/SHA; isolated evidence output; reject dirty code and nonexecuted requested browsers; draw canonical chart data for screenshots | Final provenance plus evidence audit |
| Historical manual Firefox overflow conflicts | Original reported values preserved and explicitly excluded from geometry acceptance | Fresh strict measurements on the corrected source supersede them |
| Archived-sheet links and keyboard count | Forwarding evidence pages preserve historical links; summary corrected to nine keyboard records | Link audit and recorded G-KB counts |

## Manual evidence and acceptance gate

Bhuvi reported 22 PASS NVDA observations and 29 functional PASS installed-Firefox observations (with the older responsive criterion BLOCKED) at the source identified in the [manual NVDA sheet](evidence/sv-manual-screenreader-85391ae.md) and [manual Firefox sheet](evidence/sv-manual-firefox-85391ae.md). These are preserved as that tester's reports. No new human listening session or verbatim speech/audio recording was produced by Codex. The old manual geometry wording has been clarified; its criterion was BLOCKED on the older CSS. All current geometry outcomes come from the fresh strict measurements. The current changes affect CSS layout and test tooling, not ARIA/live-region JavaScript. Keyboard, label, contrast and marker behavior were retested on the current source.

No known failing planned automated case or open technical test blocker remains. Recommendation: accept the technical testing package for review. Human acceptance: pending — Naveen must review these limitations and decide whether a witnessed screen-reader repeat is needed before applying his own acceptance/signature. Repository review/CI approval is a separate gate, recorded on the PR; this document does not invent it. The Word Test Plan remains intact and is interpreted using the linked execution addendum.

## Contributions and release

Bhuvi supplied the multi-engine/keyboard/marker tooling, status-color fix and manual observations; Hemanth supplied the expanded unit/integration suite, recovery fix, coverage tooling and original RTM; Naveen's current work adds responsive fixes, truthful runner provenance, fresh independent execution, evidence auditing and QA consolidation. Original personal commits remain intact. No empty commits or author rewrites are used.

Merge the reviewed testing package into develop with a merge commit. Promotion to main follows the repository's separate release PR process. This summary does not claim the new CSS/testing package is already on main.
