# 📉 Burndown Chart Generator

A client-side Agile/Scrum web app that simulates a Jira-style sprint backlog and shows **Ideal vs Actual burndown**, **schedule variance** and **sprint KPIs**. It runs entirely in the browser: no backend and no live Jira connection.

> Software Engineering Mini-Project · PES University · Team 07

## ✨ Features

- Configure a sprint with a name, 1–60 working days, and valid calendar dates
- Move Current Day from Day 0 through the sprint duration
- Load and reset the default simulated dataset (10 issues, 50 story points, Current Day 4)
- Add issues with duplicate-key, required-field, and numeric-range validation
- Edit issue status and completion day; delete issues with live recalculation
- Mark Done only on days 1 through `min(Current Day, sprint duration)`; reopening clears the completion day
- Ideal burndown: `Ideal(d) = TotalPoints × (1 − d / TotalDays)`
- Actual burndown: `Actual(d) = TotalPoints − Σ points completed on or before d`
- Schedule variance: **Ahead** (> 1), **On Track** (−1 to 1), **Behind** (< −1)
- Chart.js line chart with a Current Day marker
- Live KPI dashboard (Total Scope, Completed, Remaining, Days Elapsed, Days Left, Status)
- Empty-backlog and zero-point guidance, including single-day sprint support
- Keyboard navigation, descriptive labels, focus restoration, and textual status indicators
- XSS-safe rendering and a static Content Security Policy (CSP)
- Validated JSON serialization/recovery APIs for sprint data; automatic sprint saving is not enabled
- Dark / Light theme toggle with persistent user preference

## Sprint 2 Release

The reviewed Sprint 2 implementation is merged into `main` through
[release PR #41](https://github.com/NAVEEN4516/TEAM-07/pull/41), including:

| Pull request | Delivered work |
| --- | --- |
| [#38](https://github.com/NAVEEN4516/TEAM-07/pull/38) | Add Issue form, performance profiling, and layout/compatibility fixes |
| [#42](https://github.com/NAVEEN4516/TEAM-07/pull/42) | Shared ValidationManager, strict input checks, and safe saved-state APIs |
| [#39](https://github.com/NAVEEN4516/TEAM-07/pull/39) | Edit/delete/reset workflow, accessibility, empty states, safe text rendering, and static CSP |

At the release, **255 automated tests across 63 suites pass**. Chrome and Edge
workflow checks pass. The [Sprint 2 screen recording](demo_sprint2.mp4) is
available. Firefox and manual screen-reader verification and submission freeze
remain separate completion tasks.

## 🧱 Tech Stack

| Layer | Tech |
| --- | --- |
| Presentation | HTML5, CSS3, Chart.js (vendor bundle) |
| Logic | Vanilla JavaScript (ES6+): BurndownEngine, ValidationManager, DataManager |
| Data | In-memory reactive state, immutable default dataset, validated JSON load/save APIs |
| Storage | Theme preference in localStorage; automatic sprint persistence disabled |
| Testing | Node.js native test runner (`node --test`); optional Playwright browser checks |
| CI | GitHub Actions |

## 📁 Project Structure

```
src/                  App source (index.html, css/, js/data, js/logic, js/ui, vendor/)
tests/                Automated unit test suites (node --test)
docs/                 SRS, SAD, Test Plan, Sprint 1/2 checklists, screenshots, and evidence
tools/                Optional browser regression verification script
demo_sprint1_mvp.mp4  Archived Sprint 1 demonstration video
demo_sprint2.mp4      Sprint 2 screen recording
.github/              PR template, CODEOWNERS, CI workflows
```

## Documentation and Evidence

- [Sprint 2 screen recording](demo_sprint2.mp4)
- [Team contribution evidence and commit-count explanation](docs/team-contributions.md)
- [Software Requirements Specification](docs/SRS/Burndown_Chart_SRS.docx)
- [Software Architecture Document](docs/SAD/Burndown_Chart_SAD.docx)
- [Sprint 2 architecture addendum](docs/SAD/sprint2_addendum.md)
- [Master Test Plan](docs/test-plan/Burndown_Chart_Test_Plan.docx)
- [Sprint 2 verification checklist](docs/test-plan/sprint2_naveen_checklist.md)
- [Performance evidence](docs/test-plan/evidence/BDC-NF-001-performance.md)
- [Browser compatibility evidence](docs/test-plan/evidence/BDC-NF-004-compatibility.md)
- [Integrated dashboard screenshot](docs/test-plan/evidence/naveen-sprint2-workflow.png)

The archived [one-minute Sprint 1 demo](demo_sprint1_mvp.mp4) documents the earlier
milestone. Use the Sprint 2 checklist for evidence of the current implementation.

## 🚀 Getting Started

```bash
git clone https://github.com/NAVEEN4516/TEAM-07.git
cd TEAM-07
python -m http.server 8000 --directory src
```

Open [http://localhost:8000](http://localhost:8000). Python is used only to serve
static files; the application has no runtime backend. Alternatively, serve `src/`
with another static HTTP server, such as `npx serve src`.

Directly opening `src/index.html` with `file://` is unsupported because the app
uses JavaScript modules. The page displays guidance to start an HTTP server.
Chart.js is bundled locally, so the application does not need a CDN connection.

The initial Day 4 dashboard shows **50 total, 29 completed, 21 remaining**, and
variance **+9 (Ahead of Schedule)**. Reset Data restores this baseline.

## Testing

Run automated tests (Node.js 20+):

```bash
npm test
```

The release contains **255 tests across 63 suites**, using the native runner with
no external test dependencies. GitHub Actions runs the suite on pushes and PRs
to `develop` and `main`, and supports manual dispatch.

For optional end-to-end verification, with Playwright and Chrome available to Node:

```bash
node tools/verify-sprint2.cjs
```

The script starts a temporary loopback HTTP server and checks the complete
Add → Edit → Delete → Reset flow, chart/KPI updates, keyboard focus, rejected
future completion days, XSS handling, CSP, unavailable storage, and the styled
JavaScript-disabled warning. It regenerates the workflow screenshot under
`docs/test-plan/evidence/`. Set `BROWSER_CHANNEL=msedge` to use Edge. If Playwright
is installed outside the checkout, set `NODE_PATH` to its package directory.

### 🛠️ Developer Flags

- `?perf`: Enables high-resolution render timing instrumentation, logging update durations to `console.info` and recording measurements in `window.__perfLog` and `window.__lastUpdateMs` (SRS BDC-NF-001).
- `?day=<n>`: Sets initial current day on application load.
- `?dev`: Exposes `window.__setDay(n)` helper in the browser console for manual state testing.

## Data and Security Behavior

- Sprint/backlog changes live in memory. Reloading starts with the default sprint;
  only the theme preference is saved automatically.
- `DataManager.serialize()` and `restoreFromJSON(raw)` provide validated JSON APIs.
  Malformed or invalid saved state restores defaults and returns validation errors.
- New Done edits reject days after Current Day or sprint duration. Rewinding the
  timeline or shortening a sprint preserves existing completion history.
- The CSP is delivered through an HTML meta tag. This repository does not configure
  server response headers or claim host-level framing protection; see the
  [architecture addendum](docs/SAD/sprint2_addendum.md).

## 📋 Project Management

- Backlog and sprints are tracked in the **GitHub Project "TEAM-07 Burndown Chart Generator"**.
- Each SRS requirement is one issue, titled with its ID (e.g. `BDC-F-013`, `BDC-NF-001`, `BDC-SR-001`) and carrying story points and an assignee.

| Sprint | Dates | Outcome |
| --- | --- | --- |
| Dry run | 12–16 Oct | Practice sprint |
| Sprint 1 | 19–23 Oct | Working core product + 1-min demo video ([`demo_sprint1_mvp.mp4`](demo_sprint1_mvp.mp4)) |
| Sprint 2 | 26–30 Oct | Reviewed implementation merged to `main`; screen recording available; submission freeze remains |

## 🌿 Contribution Workflow

- `main`: protected and always demo-ready; merged at sprint end only.
- `develop`: protected; all features merge here first.
- Branches: `feature/BDC-<id>-short-name` or `fix/BDC-<id>-short-name`, e.g. `feature/BDC-F-013-burndown-chart`.
- Commits start with the requirement ID, e.g. `BDC-F-013: render ideal and actual lines`.

1. `git checkout develop && git pull`
2. Create your branch, commit, push
3. Open a PR into `develop` that references the issue (`Closes #13`)
4. The assignee raises the PR and the repo owner reviews and merges it (squash)

No direct pushes to `main` or `develop`. See [CONTRIBUTING.md](CONTRIBUTING.md).

## 👥 Team 07

| Member | SRN | GitHub |
| --- | --- | --- |
| Naveen Prasad M | PES1UG24AM379 | [@NAVEEN4516](https://github.com/NAVEEN4516) |
| Bhuvi Sudheendra Katti | PES1UG24AM418 | [@stacktrace-bhuvi](https://github.com/stacktrace-bhuvi) |
| Hemanth Reddy | PES1UG24AM390 | [@hemanthloq](https://github.com/hemanthloq) |

## 🚫 Out of Scope (Version 1)

Live Jira / Atlassian API, OAuth, cloud database, multi-user authentication,
ML forecasting, and advanced reporting/export. Automatic sprint persistence is
not enabled in this release.

## 📄 License

Academic project, for coursework use only.
