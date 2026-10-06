# Contributing

## Where does my file go?

| Jira | Task | Owner | Path |
| --- | --- | --- | --- |
| SCRUM-12 | HTML/CSS dashboard layout | BK | `src/index.html`, `src/css/styles.css` |
| SCRUM-13 | Chart.js burndown graph | BK | `src/js/ui/chart.js` |
| SCRUM-18 / 19 | Backlog controls, Current Day slider | BK | `src/js/ui/dashboard.js` |
| SCRUM-14 | Dummy Jira data & KPI logic | NM | `src/js/data/defaultDataset.js` |
| SCRUM-15 | Ideal & Actual burndown math | RR | `src/js/logic/burndownEngine.js` |
| SCRUM-20 | package.json + Jest tests | RR | `package.json`, `tests/burndownEngine.test.js` |
| SCRUM-21 | ValidationManager + localStorage safe-load | RR | `src/js/logic/validationManager.js` |
| SCRUM-22 | Integration | RR + BK | `src/js/data/dataManager.js` |
| SCRUM-26 | CI/CD with GitHub Actions | NM | `.github/workflows/` |
| Docs | SRS, test plan, diagrams | NM | `docs/` |

## Workflow
1. Start from the latest `develop`:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/SCRUM-<id>-short-name
   ```
2. Make small commits that start with the Jira key: `SCRUM-15: add ideal burndown calculation`
3. Push and open a **Pull Request into `develop`** (not `main`). Fill in the PR template.
4. Get **1 approval**, resolve all review comments, then **Squash and merge**.
5. The branch is deleted automatically after merge.

## Rules
- Never push directly to `main` or `develop`; both are protected.
- One Jira issue per branch / PR where possible.
- Don't commit `node_modules/`, `.env`, or Office temp files (`~$*.docx`).
- Don't edit another member's area without telling them (see `.github/CODEOWNERS`).
- Keep the repo outside OneDrive when working locally (OneDrive can corrupt `.git`).

## Branch names
`feature/SCRUM-12-dashboard-layout`, `fix/SCRUM-21-validation-bug`, `docs/SCRUM-xx-update-srs`
