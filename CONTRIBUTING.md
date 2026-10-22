# Contributing

## Where does my file go?

| Area / Req | Task | Owner | Path |
| --- | --- | --- | --- |
| BDC-F-001 | Sprint config banner & modal | BK / NM | `src/js/ui/sprintBanner.js` |
| BDC-F-002, 010–012 | Burndown calculations (Ideal, Actual, Variance) | RR | `src/js/logic/burndownEngine.js` |
| BDC-F-003 | Current Day timeline slider & stepper | BK | `src/js/ui/currentDayControl.js` |
| BDC-F-004 | Default simulated dataset | NM | `src/js/data/defaultDataset.js` |
| BDC-F-005–008 | Backlog table, issue CRUD controls | BK | `src/js/ui/backlogTable.js` |
| BDC-F-009 | State management, validation & localStorage | RR + BK | `src/js/data/dataManager.js` |
| BDC-F-013–014 | Chart.js burndown chart & Day marker | BK | `src/js/ui/chart.js`, `src/js/ui/chartConfig.js` |
| BDC-F-015 | KPI cards & schedule status badge | BK | `src/js/ui/kpiCards.js` |
| Theme Toggle | Dark / Light theme toggle & persistence | BK | `src/js/ui/themeManager.js`, `src/css/styles.css` |
| Dashboard | Layout, component wiring & initialization | BK | `src/index.html`, `src/js/ui/dashboard.js` |
| Tests | Automated test suites (`node --test`) | All | `tests/` (`logic/`, `data/`, `ui/`, `docs/`) |
| Demo Video | Sprint 1 MVP 1-min walkthrough | Team | `demo_sprint1_mvp.mp4` |
| CI / CD | GitHub Actions workflow | NM | `.github/workflows/ci.yml` |
| Docs | SRS, SAD, Test Plan, UML, checklist | NM | `docs/` |

## Workflow
1. Start from the latest `develop`:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/BDC-F-<id>-short-name
   # or: feature/SCRUM-<id>-short-name
   ```
2. Make targeted commits prefixed with requirement ID or Jira key:
   - `BDC-F-013: render ideal and actual burndown lines`
   - `SCRUM-15: add ideal burndown calculation`
3. Run tests locally and verify 100% pass rate:
   ```bash
   npm test
   ```
4. Push your branch and open a **Pull Request into `develop`** (not directly into `main`). Fill in the PR template.
5. Get **1 approval**, resolve all review comments, verify CI checks pass, then **Squash and merge**.
6. The branch is deleted automatically after merge.

## Rules
- Never push directly to `main` or `develop`; both are protected branches.
- Keep commits focused and modular; run `npm test` before opening a PR.
- Don't commit `node_modules/`, `.env`, temporary IDE folders, or Office temp files (`~$*.docx`).
- Don't edit another member's area without coordination (see `.github/CODEOWNERS`).
- Keep the repo outside cloud-synced folders (e.g. OneDrive) when working locally to prevent Git corruption.

## Branch naming conventions
- `feature/BDC-F-005-backlog-table` or `feature/SCRUM-12-dashboard-layout`
- `fix/BDC-F-007-completion-day-bug` or `fix/SCRUM-21-validation-bug`
- `docs/BDC-update-srs` or `docs/SCRUM-xx-update-test-plan`
