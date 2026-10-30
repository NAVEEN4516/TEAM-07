# Sprint 2 architecture addendum

This supplements the Sprint 1 SAD with Naveen's issue workflow, accessibility and
static content-security changes. The application remains fully client-side with
the local Chart.js bundle and no external runtime services.

## State and workflow

`DataManager.updateIssue(issueKey, changes)` validates workflow status and completion
day before applying an atomic update. It returns `{ success, errors, issue }` on
success; returned issue data is cloned. To Do and In Progress always have
`completedDay: null`. The edit path delegates to `validateStatusUpdate` from
ValidationManager (merged in PR #42). Done requires an integer from 1 through
`min(currentDay, durationDays)`, matching SRS 5.2 and the Add Issue validator.
At Current Day 0 no completion day is valid. The editor's label and maximum follow
the timeline and sprint bounds. Rewinding the timeline or shortening the sprint
preserves existing completion history; any new Done edit must satisfy today's bounds.
Unknown keys and invalid changes return errors without publishing a state update.

`DataManager.deleteIssue(issueKey)` removes one matching issue. Both mutation
methods recalculate total commitment and publish once through the existing
subscriber mechanism. Dashboard/chart and KPI calculations still use
`burndownEngine.js`; the UI does not duplicate the mathematics.

`createBacklogActions` owns the editor and Reset Data button. `renderTable` accepts
optional edit/delete callbacks, retaining its previous read-only calling convention.
Editor strings are assigned through `textContent` and `value`; issue keys are matched
as dataset values rather than interpolated into CSS selectors. The editor keeps
invalid input visible with a useful alert. Save/cancel/delete restore focus to a
remaining action or Reset Data. Timeline rerenders preserve keyboard focus.

Reset continues to clone the immutable canonical dataset. It also clears a pending
editor and announces restoration. PR #42 supplies validated `serialize()` and
`restoreFromJSON()` data APIs, including safe default recovery. Automatic storage
of sprint state remains disabled; theme storage failures are isolated from initialization.

The dashboard provides empty/zero-scope guidance and a current textual chart
description. Existing safe engine behavior remains the source of finite metrics.

## Static Content Security Policy (BDC-SR-005)

`src/index.html` declares the following enforced meta policy before any script:

```text
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:;
connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'
```

The former inline theme initialization is now `themeBootstrap.js`, loaded early
as a local classic script. Script execution uses local files; inline scripts,
inline event handlers, string evaluation, external connections, plugins, base-URL
changes and browser-native form navigation are disallowed. Form submissions are
handled by JavaScript with `preventDefault`. User text still requires safe DOM
rendering; CSP is an additional boundary.

The JavaScript-disabled warning uses the external `.javascript-required-notice`
CSS class rather than a blocked inline style. Its visibility and computed warning
styles are checked in a browser context with JavaScript disabled.

This is a **meta policy, not an HTTP response header**. Python's standard static
server is sufficient for exercising it, but this repository does not configure
production HTTP security headers. The [CSP specification](https://www.w3.org/TR/CSP2/)
excludes `frame-ancestors`, `sandbox` and reporting through `report-uri` from meta
delivery. Clickjacking protection and response-header reporting therefore need a
separate host configuration. No such deployment protection is claimed here.
For a future host with header configuration, deliver the policy as a response
header, add an appropriate `frame-ancestors` rule, and verify the actual deployed
response and application flows before claiming those protections.

Serve `src/` over HTTP; browser module restrictions make direct `file://` opening
unsuitable. See the [Sprint 2 verification checklist](../test-plan/sprint2_naveen_checklist.md)
for executed checks and limitations.
