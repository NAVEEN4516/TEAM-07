# 📉 Burndown Chart Generator

A client-side Agile/Scrum web app that simulates a Jira-style sprint backlog and shows **Ideal vs Actual burndown**, **schedule variance** and **sprint KPIs**. It runs entirely in the browser: no backend and no live Jira connection.

> Software Engineering Mini-Project · PES University · Team 07

## ✨ Features

- Configure a sprint (name, duration, start/end dates) with validation
- Load and reset a default simulated dataset (10 issues, 50 story points)
- Backlog management: add, update status / completion day, delete
- Ideal burndown: `Ideal(d) = TotalPoints × (1 − d / TotalDays)`
- Actual burndown: `Actual(d) = TotalPoints − Σ points completed on or before d`
- Schedule variance: **Ahead** (> 1), **On Track** (−1 to 1), **Behind** (< −1)
- Chart.js line chart with a Current Day marker
- Live KPI dashboard (Total Scope, Completed, Remaining, Days Elapsed, Days Left, Status)
- Input validation, XSS-safe rendering and safe `localStorage` handling
- Dark / Light theme toggle with persistent user preference

## 🧱 Tech Stack

| Layer | Tech |
| --- | --- |
| Presentation | HTML5, CSS3, Chart.js (vendor bundle) |
| Logic | Vanilla JavaScript (ES6+): BurndownEngine, DataManager |
| Data | In-memory reactive state, default simulated dataset, optional localStorage |
| Testing | Node.js native test runner (`node --test`) |
| CI | GitHub Actions |

## 📁 Project Structure

```
src/                  App source (index.html, css/, js/data, js/logic, js/ui, vendor/)
tests/                Automated unit test suites (node --test)
docs/                 SRS, SAD, Test Plan (.docx), diagrams, and sprint 1 checklist
demo_sprint1_mvp.mp4  Sprint 1 MVP 1-minute working product demonstration video
.github/              PR template, CODEOWNERS, CI workflows
```

## 🎥 Sprint 1 Demo Video

A 1-minute video demonstration showcasing the working Sprint 1 MVP is available directly in the repository:
- **Demo File**: [`demo_sprint1_mvp.mp4`](demo_sprint1_mvp.mp4)

### What the demo showcases:
1. **Sprint Parameter Configuration**: Editing sprint title, duration, start and end dates via the configuration modal with real-time form validation.
2. **Interactive Current Day Timeline**: Range slider and step controls dynamically advancing from Day 1 through Day 10.
3. **Burndown Chart Visualization**: Dual-line Chart.js rendering of Ideal Burndown vs. Actual Burndown with vertical Current Day reference marker.
4. **Real-time KPI Dashboard**: Live tracking cards showing Total Scope, Completed Points, Remaining Points, and accessible Schedule Status badges (Ahead / On Track / Behind).
5. **Backlog Management**: Adding new issues with story points, updating issue status to Done with completion day, and deleting issues.
6. **Theme Customization**: Responsive Dark and Light mode toggle with smooth transitions and persistent storage preference.
7. **Simulated Dataset & Reset**: Loading the standard simulated 10-issue dataset and resetting state on demand.

## 🚀 Getting Started

```bash
git clone https://github.com/NAVEEN4516/TEAM-07.git
cd TEAM-07
# Serve the application over HTTP (e.g. using npx serve or Python):
npx serve src
# or: python -m http.server 8000 --directory src
```

> **Note on Browser Compatibility (`file://` protocol):**  
> The application uses modern JavaScript ES modules (`import`/`export`). Modern browsers (Chrome, Edge, Firefox) enforce CORS restrictions that block ES module scripts when opening files directly via `file://`. The application must be served over HTTP (`npx serve src`). Direct `file://` opening is not supported in modern browsers and will display a server requirement notification.

Run automated tests (Node.js 20+):

```bash
npm test
```
*(Executes all 119 unit tests across 36 suites via the native `node --test` runner with 0 external dependencies)*

### 🛠️ Developer Flags
- `?perf`: Enables high-resolution render timing instrumentation, logging update durations to `console.info` and recording measurements in `window.__perfLog` and `window.__lastUpdateMs` (SRS BDC-NF-001).
- `?day=<n>`: Sets initial current day on application load.
- `?dev`: Exposes `window.__setDay(n)` helper in the browser console for manual state testing.

## 📋 Project Management

- Backlog and sprints are tracked in the **GitHub Project "TEAM-07 Burndown Chart Generator"**.
- Each SRS requirement is one issue, titled with its ID (e.g. `BDC-F-013`, `BDC-NF-001`, `BDC-SR-001`) and carrying story points and an assignee.

| Sprint | Dates | Outcome |
| --- | --- | --- |
| Dry run | 12–16 Oct | Practice sprint |
| Sprint 1 | 19–23 Oct | Working core product + 1-min demo video ([`demo_sprint1_mvp.mp4`](demo_sprint1_mvp.mp4)) |
| Sprint 2 | 26–30 Oct | Remaining features, security, docs + 2-min demo video, then freeze |

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

Live Jira / Atlassian API, OAuth, cloud database, multi-user auth, ML forecasting.

## 📄 License

Academic project, for coursework use only.
