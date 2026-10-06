# 📉 Burndown Chart Generator

A client-side web app that simulates a Jira-style sprint backlog and shows
**Ideal vs Actual burndown**, **schedule variance**, and **sprint KPIs**.
It runs entirely in the browser: no backend, no live Jira connection.

> Software Engineering Team Project · PES University · Team 07

<!-- Add a dashboard screenshot at docs/diagrams/dashboard.png once the UI exists, then uncomment:
![Dashboard screenshot](docs/diagrams/dashboard.png)
-->

---

## ✨ Features
- Configure a sprint (name, duration, start/end dates)
- Load / reset a default simulated Jira dataset
- Manage the backlog: add, update status / completion day, delete issues
- Ideal burndown: `Ideal(d) = TotalPoints × (1 − d / TotalDays)`
- Actual burndown: `Actual(d) = TotalPoints − Σ points completed on or before d`
- Schedule variance → **Ahead** (> 1) / **On Track** (−1 … 1) / **Behind** (< −1)
- Chart.js line chart with a Current Day marker
- Live KPI dashboard (committed, completed, remaining points)
- Optional `localStorage` persistence

## 🧱 Tech Stack
| Layer | Tech |
| --- | --- |
| Presentation | HTML5, CSS3, Chart.js |
| Logic | Vanilla JavaScript (ES6+): BurndownEngine, ValidationManager |
| Data | In-memory state + localStorage |
| Testing | Jest |
| CI | GitHub Actions |

## 🏗️ Architecture
Three-layer, fully client-side:

`Presentation (UI + Chart.js)` → `Logic (BurndownEngine, ValidationManager)` → `Data (DataManager, localStorage, default dataset)`

See [`docs/diagrams`](docs/diagrams) for the UML diagrams and [`docs/SRS`](docs/SRS) for the full requirements.

## 📁 Project Structure
```
src/      → app source
  index.html, css/styles.css
  js/data/    → default dataset, DataManager
  js/logic/   → BurndownEngine, ValidationManager
  js/ui/      → chart + dashboard
tests/    → Jest unit tests
docs/     → SRS, Test Plan, UML diagrams
.github/  → PR template, CODEOWNERS, CI workflows
```

## 🚀 Getting Started
### Prerequisites
- A modern browser (Chrome / Firefox / Edge / Safari)
- Node.js 18+ (only needed for running tests)

### Run the app
```bash
git clone https://github.com/NAVEEN4516/TEAM-07.git
cd TEAM-07
# Option 1: open src/index.html directly in a browser
# Option 2: serve locally
npx serve src
```

### Run tests
```bash
npm install
npm test
```
> `package.json` and the Jest tests are added in SCRUM-20.

## 🌿 Branching & Contribution Workflow
- `main`: protected, always demo-ready. Sprint-end merges only.
- `develop`: protected. All features are merged here first.
- Feature branches: `feature/SCRUM-<id>-short-name` (e.g. `feature/SCRUM-15-burndown-math`)
- Fix branches: `fix/SCRUM-<id>-short-name`

**Steps**
1. `git checkout develop && git pull`
2. `git checkout -b feature/SCRUM-15-burndown-math`
3. Commit with the Jira key: `SCRUM-15: add ideal burndown calculation`
4. `git push -u origin feature/SCRUM-15-burndown-math`
5. Open a PR into `develop` → 1 approval → **Squash and merge**
6. At the end of each sprint, the project lead opens a PR from `develop` into `main`

No direct pushes to `main` or `develop`. See [CONTRIBUTING.md](CONTRIBUTING.md) for details and where each file goes.

## 👥 Team
| Member | SRN | Role | GitHub | Jira |
| --- | --- | --- | --- | --- |
| Naveen Prasad M | PES1UG24AM379 | Project Lead / QA / Data | [@NAVEEN4516](https://github.com/NAVEEN4516) | NM |
| Bhuvi Sudheendra Katti | PES1UG24AM418 | Frontend | [@stacktrace-bhuvi](https://github.com/stacktrace-bhuvi) | BK |
| Hemanth Reddy | PES1UG24AM390 | Core Logic | [@hemanthloq](https://github.com/hemanthloq) | RR |

## 📋 Project Management
Tracked in Jira (project key **SCRUM**). Branches, commits and PRs include the issue key so they link back to Jira.

## 🚫 Out of Scope (Version 1)
Live Jira / Atlassian API, OAuth, cloud database, multi-user auth, ML forecasting.

## 📄 License
Academic project, for coursework use only.
