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

## 🧱 Tech Stack

| Layer | Tech |
| --- | --- |
| Presentation | HTML5, CSS3, Chart.js |
| Logic | Vanilla JavaScript (ES6+): BurndownEngine, ValidationManager |
| Data | In-memory state, DataManager, optional localStorage |
| Testing | Jest |
| CI | GitHub Actions |

## 📁 Project Structure

```
src/      app source (index.html, css/, js/data, js/logic, js/ui)
tests/    Jest unit tests
docs/     SRS, SAD, Test Plan, UML diagrams
.github/  PR template, CODEOWNERS, CI workflows
```

## 🚀 Getting Started

```bash
git clone https://github.com/NAVEEN4516/TEAM-07.git
cd TEAM-07
# Option 1: open src/index.html in a browser
# Option 2: npx serve src
```

Run tests (Node.js 18+):

```bash
npm install
npm test
```

## 📋 Project Management

- Backlog and sprints are tracked in the **GitHub Project "TEAM-07 Burndown Chart Generator"**.
- Each SRS requirement is one issue, titled with its ID (e.g. `BDC-F-013`, `BDC-NF-001`, `BDC-SR-001`) and carrying story points and an assignee.

| Sprint | Dates | Outcome |
| --- | --- | --- |
| Dry run | 12–16 Oct | Practice sprint |
| Sprint 1 | 19–23 Oct | Working core product + 1-min demo video |
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
