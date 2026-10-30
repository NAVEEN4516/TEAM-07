# Team 07 contribution evidence

Prepared on **30 October 2026** for review alongside the project demonstration,
requirements, tests and original pull requests. This report records repository
evidence; it does not assign marks or estimate hours worked.

## Snapshot and counting method

The counts below use these exact branch tips, before this documentation update:

- `develop`: [`1adc815`](https://github.com/NAVEEN4516/TEAM-07/commit/1adc815343ac37edd7e551c4c880cb9ec3910fa4)
- `main`: [`b95982f`](https://github.com/NAVEEN4516/TEAM-07/commit/b95982f372b43f9191dd02540be3480cc9031a6d)

Both tips contain identical file contents, despite different commit histories.
The project uses squash merging: a PR with several commits becomes a single
commit on its target branch. Later release PRs squash several members' changes
again when promoting them to `main`.

`git shortlog` counts recorded commit authors. The names `Naveen Prasad M` and
`NAVEEN4516` are grouped as Naveen in this report. Other authors are grouped by
their recorded names and associated GitHub accounts.

| Member / GitHub account | Commits reachable on develop | Commits reachable on main |
| --- | ---: | ---: |
| Naveen Prasad M / `NAVEEN4516` | 10 | 10 |
| Bhuvi Sudheendra Katti / `stacktrace-bhuvi` | 4 | 1 |
| Hemanth Reddy / `hemanthloq` | 2 | 0 |

These are branch-history counts, not counts of implemented requirements or
original development commits. Hemanth's work is present in `main` through the
combined releases even though its squashed history has no separate commit under
his author name. The different counts for identical source trees demonstrate
why the branch and merge method must accompany a commit-count assessment.

## Original implementation and documentation PRs

The "PR commits" column is GitHub's commit count for the original PR at this
snapshot. Follow the linked Commits tab to inspect the individual records.
Counts can include integration merge commits, so they should not be added across
overlapping implementation and release PRs as unique work.

| Recorded PR author | Original PR / Commits tab | PR commits | Scope supported by the diff |
| --- | --- | ---: | --- |
| Naveen | [#28](https://github.com/NAVEEN4516/TEAM-07/pull/28/commits) | 2 | Default dataset, CI workflow, Sprint 1 test checklist and tests (BDC-F-004 / SCRUM-14) |
| Naveen | [#32](https://github.com/NAVEEN4516/TEAM-07/pull/32/commits) | 1 | DataManager, sprint configuration, Current Day control, KPI cards and tests (BDC-F-001/003/015) |
| Naveen | [#39](https://github.com/NAVEEN4516/TEAM-07/pull/39/commits) | 4 | Edit/delete/reset, keyboard/focus handling, safe text rendering, empty/zero states, CSP and workflow tests (BDC-F-007/008/009, BDC-NF-002, BDC-SR-001/004/005) |
| Bhuvi | [#26](https://github.com/NAVEEN4516/TEAM-07/pull/26/commits) | 1 | README and GitHub Project workflow documentation |
| Bhuvi | [#34](https://github.com/NAVEEN4516/TEAM-07/pull/34/commits) | 1 | Dashboard integration, backlog table, Chart.js display/current-day marker, styling/theme support and tests (BDC-F-005/013/014) |
| Bhuvi | [#35](https://github.com/NAVEEN4516/TEAM-07/pull/35/commits) | 1 | Sprint 1 documentation, checklist and demonstration deliverables |
| Bhuvi | [#38](https://github.com/NAVEEN4516/TEAM-07/pull/38/commits) | 4 | Add Issue form/validation, profiling, compatibility fixes and review corrections (BDC-F-006, BDC-NF-001/004) |
| Hemanth | [#31](https://github.com/NAVEEN4516/TEAM-07/pull/31/commits) | 3 | Pure BurndownEngine and tests: total points, ideal/actual series, variance/status and modularity (BDC-F-002/010/011/012, BDC-NF-005) |
| Hemanth | [#42](https://github.com/NAVEEN4516/TEAM-07/pull/42/commits) | 1 | Shared sprint/day/status validation, saved-state validation/recovery, DataManager integration and tests (BDC-NF-003, BDC-SR-002/003) |

PR-author attribution above follows GitHub metadata. It does not infer authorship
from CODEOWNERS or claim that each listed person independently wrote every line.
Requirements can have shared implementation and review contributions.

Naveen also has separate setup, SRS/SAD/Test Plan upload/update and rename commits.
Examples include repository scaffolding
[`b791825`](https://github.com/NAVEEN4516/TEAM-07/commit/b791825)
and dataset/schema alignment
[`cf1981c`](https://github.com/NAVEEN4516/TEAM-07/commit/cf1981c).
These are legitimate project activities with different scopes from a combined
implementation PR. The PR table is therefore not a list of every historical commit.

## Worked examples of squash effects

| Example | Original PR record | Target-branch result |
| --- | --- | --- |
| Hemanth's calculation work | #31: 3 commits, 2 changed files, 735 added lines | One develop commit: `6592061` |
| Hemanth's validation work | #42: 1 commit, 4 changed files, 935 added / 62 removed lines | One develop commit: `a56fc7f` |
| Bhuvi's Add Issue / profiling / compatibility work | #38: 4 commits, 14 changed files | One develop commit: `82d06f1` |
| Naveen's Sprint 2 workflow work | #39: 4 commits, including integration with develop | One develop commit: `1adc815` |

Line and file counts help locate the changes; they do not measure difficulty or
effort. For example, generated files, documentation and formatting have different
line-count characteristics from calculation code.

## Release and integration records

These PRs promote already recorded work. They should be identified separately
when assessing new implementation work.

| Release PR | Recorded author | Relationship to earlier work |
| --- | --- | --- |
| [#29](https://github.com/NAVEEN4516/TEAM-07/pull/29) | Naveen | Main-branch dataset/CI/checklist promotion related to #28 |
| [#33](https://github.com/NAVEEN4516/TEAM-07/pull/33) | Naveen | Combined Sprint 1 application release |
| [#37](https://github.com/NAVEEN4516/TEAM-07/pull/37) | Naveen | Main-branch Sprint 1 documentation/demo promotion corresponding to #35 |
| [#41](https://github.com/NAVEEN4516/TEAM-07/pull/41) | Naveen | Combined Sprint 2 release of Bhuvi's #38, Hemanth's #42 and Naveen's #39 |

Release #41 records the combined Sprint 2 work in one `main` commit authored under
Naveen's name. It is evidence of integration/release activity and delivery of the
three members' reviewed changes, rather than evidence that Naveen individually
implemented all of those changes.

## Tests and peer review

- [#31](https://github.com/NAVEEN4516/TEAM-07/pull/31) documents 37 new engine tests.
- [#42](https://github.com/NAVEEN4516/TEAM-07/pull/42) adds 72 tests above its 161-test baseline.
- The integrated release has **255 passing tests across 63 suites**. This is the
  combined suite, rather than a test total attributed to one member.
- [Bhuvi's review of #39](https://github.com/NAVEEN4516/TEAM-07/pull/39#pullrequestreview-5708578362)
  identified the completion-day inconsistency and inline noscript style under CSP.
  The corrections are in `2fde06a` on the same PR.
- [Hemanth's approval of #39](https://github.com/NAVEEN4516/TEAM-07/pull/39#pullrequestreview-5711198863)
  records verification of shared validation, unchanged state on rejected edits,
  reopening and JSON round-tripping.
- [Naveen's review comment on #38](https://github.com/NAVEEN4516/TEAM-07/pull/38#issuecomment-6473958003)
  records three browser reproductions; the fixes were verified before merging.

## Reproducing the evidence

From a Git checkout, fetch the branches and inspect authors and changes:

```bash
git fetch origin
git shortlog -sn origin/develop
git shortlog -sn origin/main
git log origin/develop --format="%h | %an | %s"
git show --stat 6592061
git show --stat a56fc7f
```

For the snapshot in this report, compare the pinned tips rather than later changes:

```bash
git diff b95982f372b43f9191dd02540be3480cc9031a6d 1adc815343ac37edd7e551c4c880cb9ec3910fa4
```

That diff is empty. To assess contribution, open each original PR's **Commits**,
**Files changed** and review conversation alongside the requirement/test evidence.

## Suggested explanation for assessment

> Our repository uses squash merging, so several original commits become one
> target-branch commit. Our releases also combine members' work under a release
> author's name. Please consider the original PR commits, implemented requirements,
> tests and peer reviews alongside the raw branch counts. This report links the
> evidence and distinguishes implementation from release activity.

This documentation does not rewrite published history, add balancing commits,
claim equal hours, or establish a numerical workload ranking. Each member should
review their recorded scope before using it in an individual contribution statement.
