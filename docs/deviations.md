# Implementation Deviations Log

The following table documents intentional deviations between the project specification documents (SRS, SAD, Test Plan) and the current implementation in the codebase, along with the technical rationale for each decision.

| Document | What the document says | What was built | Reason |
| :--- | :--- | :--- | :--- |
| SRS Appendix A | Default sprint has no start/end date | startDate 2026-10-05, endDate 2026-10-16 in defaultDataset.js | Needed for BDC-F-001 and BDC-F-009 |
| SRS BDC-F-001 / BDC-SR-002 | Duration must be a positive integer, no maximum | Maximum 60 working days enforced by ValidationManager | Matches the configuration form text; prevents a very large chart series |
| SRS BDC-SR-003 | If localStorage is used, validate stored structure | Validated load path (serialize / restoreFromJSON) exists but sprint persistence is not enabled; localStorage is used only for the theme preference | No requirement to persist sprint data |
| SRS BDC-SR-005 | CSP for server-hosted deployments | CSP delivered through a <meta> tag, not a server header | Static hosting |
| SAD 4.3 | ValidationManager lists encodeText() | Text encoding done by textContent / escapeHTML in the UI modules; encodeText is not exported | Safer by construction; no separate function needed |
| Test Plan | Unit tests with Jest | Node.js built-in test runner (node --test) | No extra dependency |
| SAD | Module list | Added chartConfig.js, backlogTable.js, backlogActions.js, addIssueForm.js, fileProtocolNotice.js; Chart.js bundled locally in src/vendor; dev flags ?dev and ?perf disabled by default | Testability, offline use |
| Browser coverage | Chrome, Firefox, Edge | Chrome and Edge verified; Firefox pending | Firefox not yet tested |
