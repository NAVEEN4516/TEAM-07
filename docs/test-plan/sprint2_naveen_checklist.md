# Naveen's Sprint 2 implementation and verification

Reverified on 30 October 2026 after merging `develop` at `a56fc7f`, including
reviewed PRs #38 and #42, into the existing PR #39 branch. Scope follows the
GitHub issues assigned to `NAVEEN4516`.

| Issue | Deliverable | Evidence |
| --- | --- | --- |
| [#7 BDC-F-007](https://github.com/NAVEEN4516/TEAM-07/issues/7) | Edit status/completion day, clear completion when reopened, reject invalid days atomically | Workflow unit tests and browser checks |
| [#8 BDC-F-008](https://github.com/NAVEEN4516/TEAM-07/issues/8) | Delete selected issue, recalculate scope/chart/KPIs, preserve keyboard focus | Workflow unit tests; delete every issue in browser |
| [#9 BDC-F-009](https://github.com/NAVEEN4516/TEAM-07/issues/9) | Reset Data restores exact default sprint, 10 issues, 50 points, Day 4 | Exact dataset equality test; browser reset after empty backlog |
| [#17 BDC-NF-002](https://github.com/NAVEEN4516/TEAM-07/issues/17) | Labeled native controls, skip link, focus restoration, textual status/errors and chart description | Browser keyboard/focus assertions; visual screenshot |
| [#21 BDC-SR-001](https://github.com/NAVEEN4516/TEAM-07/issues/21) | Render hostile keys/summaries/sprint names as inert text, escape rejected duration values | Real DOM fixtures and security unit regression |
| [#24 BDC-SR-004](https://github.com/NAVEEN4516/TEAM-07/issues/24) | Empty/zero-scope information, finite calculations, single-day navigation and rejection of duration zero | Unit tests and browser fixtures |
| [#25 BDC-SR-005](https://github.com/NAVEEN4516/TEAM-07/issues/25) | Enforced static CSP, external theme bootstrap, documented hosting limitations | Policy structure test and actual inline-script blocking in browser |

## Executed checks

- [x] `npm test`: **255 tests, 63 suites, zero failures** (233 on develop plus 22 workflow/security tests).
- [x] `node tools/verify-sprint2.cjs`: passed using Chrome **156.0.8078.74**.
- [x] Same browser checks with `BROWSER_CHANNEL=msedge`: passed using Edge **156.0.4314.50**.
- [x] Valid Done update changes remaining points from 21 to 18 and updates actual chart Day 4 to 18.
- [x] Missing/out-of-range completion day is rejected without changing points; reopening clears the old day.
- [x] TC-F-07.2: Day 5 at Current Day 4 is rejected by the real edit form; serialized state is unchanged.
- [x] Editor maximum/label update with the timeline; at Day 0 a Done edit is rejected with a useful error.
- [x] JavaScript-disabled browser context shows the styled noscript warning through external CSS, without inline styles.
- [x] Delete all issues, observe zero totals and helpful information, then restore exact sample data.
- [x] Keyboard skip link, repeated timeline arrow keys, editor initial focus, Escape/cancel,
      post-save/post-delete focus, config error focus and disabled endpoint controls.
- [x] Hostile text appears literally in the backlog/header/editor without creating executable elements.
- [x] One-day zero-point fixture remains stable and duration zero is rejected by the real config form.
- [x] No unexpected page exceptions or startup CSP violations in either browser.
- [x] Injected inline script is blocked by CSP in both browsers.
- [x] Startup and Reset Data work when the `localStorage` getter throws.
- [x] No document-wide horizontal overflow at 1024, 1440 and 1920px; backlog can scroll internally.
- [x] Visually reviewed [workflow screenshot](evidence/naveen-sprint2-workflow.png).
- [x] Actual merge of reviewed PRs #38 and #42 into this same branch is conflict-free.
      The browser checks cover adding a hostile-text issue through the teammate's
      form, editing it to Done, deleting it, and resetting.

The optional browser script requires a separately installed Playwright package and Chrome
(or Edge via `BROWSER_CHANNEL=msedge`). Set `NODE_PATH` to that package directory if it
is outside the checkout. It serves `src/` temporarily on a loopback port and shuts down
both browser and server when done. It does not add runtime or unit-test dependencies.

## Boundaries and remaining team work

- Add Issue, performance and broad browser compatibility from
  [teammate PR #38](https://github.com/NAVEEN4516/TEAM-07/pull/38) are now integrated.
- [PR #42](https://github.com/NAVEEN4516/TEAM-07/pull/42) supplies validated saved-state APIs
  and malformed-data recovery at the data layer. Automatic browser persistence remains
  disabled. The unavailable-storage browser check verifies startup/reset resilience.
- New completion updates accept integer days 1 through `min(currentDay, durationDays)`;
  future completion days are rejected. Existing history is preserved when rewinding or
  shortening a sprint, but editing a historical entry must satisfy the current bounds.
- Screen-reader testing and Firefox testing have not been performed for this PR.
- Team integration, reviewer approval, final walkthrough video and code freeze remain
  team deliverables. This checklist does not claim they are complete.
