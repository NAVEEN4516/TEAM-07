# Testing phase execution addendum

Apply this addendum to the cycle starting 6 November 2026 alongside the master
Test Plan and deviations log. Keep existing case IDs and historical results.
These are execution expectations, not a completed case log or new product scope.

## Team and tools

Naveen Prasad M owns QA coordination, shared case-document corrections and final
summary. Hemanth Reddy coordinates unit/integration/regression checks, coverage
and RTM. Bhuvi Sudheendra Katti coordinates functional system, security, browser,
accessibility and performance checks. The earlier four-person table is historical;
these three people cover this testing cycle.

Use Node's native `node --test` through `npm test`, not Jest. CI uses Node.js 20;
record the actual runtime used locally. Serve `src/` over HTTP. Record actual
browser versions and distinguish keyboard/DOM assertions from screen-reader use.

## Case clarifications

| Existing case | Expected behaviour / execution instruction |
| --- | --- |
| TC-F-01.1 | Valid name, duration and dates save and update the dashboard. Dates/duration are independently configurable in this simulator; do not test the reverted automatic timeline feature. |
| TC-F-01.2 / .3 | Reject zero, negative, fractional, nonnumeric or greater-than-60 duration, and end-before-start dates, without changing valid state. Durations 1 and 60 are valid boundaries. |
| TC-F-02.1 / TC-F-04.1 / TC-F-05.1 | Fresh load/reset shows the 10 original sample issues PROJ-101 to PROJ-110 and total 50. Verify fields, not only row count. |
| TC-F-02.2 / TC-F-06.1 | From defaults add PROJ-111 with 5 points: total 55; deleting that issue returns total 50. Verify chart, KPIs and table together. |
| TC-F-03.1 / TC-F-14.1 | Moving Current Day 4 to 6 updates marker, actual-series endpoint, KPIs and status without reload. |
| TC-F-03.2 | At duration 10 reject Day -1, 11, 2.5 and nonnumeric. Accept Day 0 and 10. Test inputs the slider cannot physically enter through the data API. |
| TC-F-06.2 / .3 / .4 | Reject duplicate keys including case/whitespace variants, empty key and empty summary. Zero-point work is valid and numeric outputs stay finite. |
| TC-F-07.1 | Defaults: PROJ-106 Done on Day 4 gives completed 32 and remaining/Actual(4) 18. |
| TC-F-07.2 | New Done updates require an integer day 1 through min(Current Day, duration). Reject Day 5 at Current Day 4 and any new completion at Day 0. Confirm serialized state is unchanged after rejection. |
| TC-F-07.3 | To Do to Done is valid with a valid day; reopening clears completedDay. Existing history may remain on rewind/shortening; a new edit must meet current bounds. |
| TC-F-08.1 | Delete PROJ-110 only, from defaults: total 45, completed 29, remaining 16, Ideal(4) 27, variance +11. Reset between independent scenarios. |
| TC-F-09.1 | Reset after CRUD/day/configuration changes restores exact canonical defaults, not cached user edits. |
| TC-F-10 / TC-F-11 / TC-F-12 / TC-F-15 | Defaults at Day 4: total 50, completed 29, remaining 21, ideal 30, variance +9, Ahead of Schedule, elapsed 4, left 6. Actual days 1-4: 45, 42, 34, 21; later values null. Variance -1 and +1 are On Track. |
| TC-F-13.1 / .2 | Verify dashed ideal, solid actual, readable labels and marker. Measure page and table overflow separately at required widths. A page-only check does not prove that columns fit without internal scrolling; preserve the original no-scroll expectation and record discrepancies for review. |
| TC-NF-01.1 | Measure real browser update latency against the under-2000ms target. A fast calculation-only test is insufficient. |
| TC-NF-02 / TC-NF-04 | Execute keyboard/focus/labels and Chrome/Edge/Firefox viewport cases. Do not mark pending screen-reader or Firefox work Pass. |
| TC-NF-03 / TC-SR-02.1 | Reject invalid numbers before mutation/calculation. Story points follow the SRS non-negative numeric rule; do not infer a whole-number-only point rule from old agent-memory wording. |
| TC-NF-05 | Inspect actual separation of calculations, data and UI and demonstrate independent testability. |
| TC-SR-01.1 | Hostile key/summary/sprint-name content appears as inert text without executable elements or effects. |
| TC-SR-03.1 | Automatic sprint persistence is disabled. Test malformed JSON/schema recovery through restoreFromJSON/parseStoredState at the data layer; separately test startup/reset when storage throws. Theme persistence is separate. Do not require edits to survive reload. |
| TC-SR-04 | Empty backlog, zero points and one-day sprints stay defined; invalid durations are rejected. |
| TC-SR-05.1 | Verify meta CSP precedes scripts and rejects inline script/eval. File opening tests HTTP guidance; the no-JavaScript notice uses external CSS. |

## Results and review

Use the [baseline/evidence instructions](../reports/qa-phase-start.md). Hemanth
links actual results in the RTM; Bhuvi supplies system evidence; Naveen reviews
contradictions and consolidates document revisions. No teammate approval or
human signature is recorded in this addendum.

## QA closeout clarification — 2026-11-11

The literal no-horizontal-scroll expectation is retained at the four required
desktop widths (1024, 1366, 1440, 1920 CSS pixels), in both themes, for both the
page and the backlog table. The responsive layout now gives each panel enough
width; this is a fix, not a relaxed acceptance criterion. Historical measurements
remain unchanged. Current results, methods and any acceptance limitation are in
the [Test Summary](../reports/test-summary-report.md) and
[current RTM](../reports/requirements-traceability.md).
