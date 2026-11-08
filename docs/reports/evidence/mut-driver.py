"""Mutation sanity check: apply one deliberate bug at a time to a scratch copy of src/
and record whether the baseline tests, and the full suite, notice it.

Usage: python mutate.py <scratch-root> <out-json>
The scratch root holds base/ (baseline tests) and full/ (all tests), each with its own src/.
"""
import json, re, shutil, subprocess, sys
from pathlib import Path

root = Path(sys.argv[1])
out = Path(sys.argv[2])

# (id, requirement, description, file, [(old, new), ...])
MUTANTS = [
    ("M01", "BDC-F-010", "Ideal line divides by duration+1",
     "src/js/logic/burndownEngine.js",
     [("return normalize(total * (1 - safeDay / durationDays));", "return normalize(total * (1 - safeDay / (durationDays + 1)));")]),
    ("M02", "BDC-F-012", "+1 variance classed as Ahead (tolerance boundary off by one)",
     "src/js/logic/burndownEngine.js",
     [("if (variance > VARIANCE_TOLERANCE) {", "if (variance >= VARIANCE_TOLERANCE) {")]),
    ("M03", "BDC-F-011", "Work completed ON the Current Day is not counted",
     "src/js/logic/burndownEngine.js",
     [("return completedDay <= day;", "return completedDay < day;")]),
    ("M04", "BDC-F-010", "Ideal line is not clamped at the final day",
     "src/js/logic/burndownEngine.js",
     [("? Math.min(Math.max(day, 0), durationDays)", "? Math.max(day, 0)")]),
    ("M05", "BDC-F-008", "Deleting an issue leaves the stored sprint total stale",
     "src/js/data/dataManager.js",
     [("    this._issues.splice(index, 1);\n    this._sprint.totalStoryPoints = calculateTotalPoints(this._issues);\n", "    this._issues.splice(index, 1);\n")]),
    ("M06", "BDC-F-007", "Reopening a Done issue keeps its completion day",
     "src/js/data/dataManager.js",
     [("      : null;\n    const validation = validateStatusUpdate", "      : current.completedDay;\n    const validation = validateStatusUpdate")]),
    ("M07", "BDC-NF-003", "A rejected sprint change still applies the new name (partial update)",
     "src/js/data/dataManager.js",
     [("    const validation = validateSprintConfig(merged);", "    this._sprint.sprintName = String(merged.sprintName);\n    const validation = validateSprintConfig(merged);")]),
    ("M08", "BDC-SR-003", "DEF-01 reintroduced: subscribers notified before load errors are set",
     "src/js/data/dataManager.js",
     [("    this.loadErrors = loadErrors;\n    this._sprint = deepClone(source.sprint);\n    this._issues = deepClone(source.issues);\n    this._notify();",
       "    this._sprint = deepClone(source.sprint);\n    this._issues = deepClone(source.issues);\n    this._notify();\n    this.loadErrors = loadErrors;")]),
    ("M09", "BDC-SR-003", "Sprint data starts reading browser storage",
     "src/js/data/dataManager.js",
     [("    return JSON.stringify({ sprint: this._sprint, issues: this._issues });", "    void globalThis.localStorage;\n    return JSON.stringify({ sprint: this._sprint, issues: this._issues });")]),
    ("M10", "BDC-SR-002", "Maximum sprint length raised from 60 to 61 days",
     "src/js/logic/validationManager.js",
     [("export const MAX_SPRINT_DAYS = 60;", "export const MAX_SPRINT_DAYS = 61;")]),
    ("M11", "BDC-F-006", "Duplicate issue keys compared case-sensitively",
     "src/js/logic/validationManager.js",
     [("const lowerKey = trimmedKey.toLowerCase();", "const lowerKey = trimmedKey;"),
      ("return kStr.trim().toLowerCase() === lowerKey;", "return kStr.trim() === lowerKey;")]),
    ("M12", "BDC-F-007", "A completion day after the Current Day is accepted",
     "src/js/logic/validationManager.js",
     [("const lastValidDay = Math.min(today, duration);", "const lastValidDay = duration;")]),
    ("M13", "BDC-SR-003", "Saved state's stored total is trusted instead of recomputed",
     "src/js/logic/validationManager.js",
     [("totalStoryPoints: cleanIssues.reduce((sum, issue) => sum + issue.storyPoints, 0)", "totalStoryPoints: sprint.totalStoryPoints")]),
    ("M14", "BDC-F-014", "Actual line plots one day past the Current Day",
     "src/js/ui/chartConfig.js",
     [("if (day > validCurrentDay) {", "if (day > validCurrentDay + 1) {")]),
    ("M15", "BDC-F-015", "Variance shown without its + sign",
     "src/js/ui/kpiCards.js",
     [("return variance > 0 ? `+${variance}` : `${variance}`;", "return `${variance}`;")]),
    ("M16", "BDC-SR-001", "escapeHTML stops escaping '<'",
     "src/js/ui/sprintBanner.js",
     [(".replace(/</g, '&lt;')", ".replace(/</g, '<')")]),
    ("M17", "BDC-NF-004", "The OS dark-mode preference is ignored on first visit",
     "src/js/ui/themeManager.js",
     [("window.matchMedia('(prefers-color-scheme: dark)').matches) {", "window.matchMedia('(prefers-color-scheme: dark)').matches && false) {")]),
    ("M18", "BDC-F-005", "A missing completion day shows blank instead of '--'",
     "src/js/ui/backlogTable.js",
     [("      : '--';", "      : '';")]),
    ("M19", "BDC-NF-005", "The calculation layer imports from the data layer",
     "src/js/logic/burndownEngine.js",
     [("const STATUS_DONE = 'Done';", "import { deepClone } from '../data/defaultDataset.js';\nconst STATUS_DONE = 'Done';")]),
    ("M20", "BDC-NF-005", "A circular import between two modules",
     "src/js/data/defaultDataset.js",
     [("export function deepClone(data) {", "import { DataManager as CircularDataManager } from './dataManager.js';\nexport function deepClone(data) {")]),
    ("M21", "BDC-SR-005", "eval() appears in application code",
     "src/js/logic/validationManager.js",
     [("export const MIN_SPRINT_DAYS = 1;", "export const MIN_SPRINT_DAYS = eval('1');")]),
    ("M22", "BDC-NF-005", "A data module reads the DOM",
     "src/js/data/dataManager.js",
     [("    return JSON.stringify({ sprint: this._sprint, issues: this._issues });", "    void document.title;\n    return JSON.stringify({ sprint: this._sprint, issues: this._issues });")]),
    ("M23", "BDC-SR-005", "The page loads a script from another origin",
     "src/index.html",
     [('<script src="vendor/chart.umd.js"></script>', '<script src="vendor/chart.umd.js"></script>\n  <script src="https://cdn.example.com/analytics.js"></script>')]),
]


def run_suite(directory):
    result = subprocess.run(["node", "--test"], cwd=directory, capture_output=True, text=True, encoding="utf8", errors="replace")
    text = result.stdout + result.stderr
    def count(label):
        match = re.search(rf"^ℹ {label} (\d+)", text, re.M)
        return int(match.group(1)) if match else None
    failing = []
    for line in text.splitlines():
        match = re.match(r"^\s{4,}✖ (.+?) \(\d", line)
        if match and match.group(1) not in failing:
            failing.append(match.group(1))
    return {"exit": result.returncode, "tests": count("tests"), "fail": count("fail"), "first_failures": failing[:3]}


results = []
for mid, req, desc, rel, edits in MUTANTS:
    row = {"id": mid, "requirement": req, "mutant": desc, "file": rel}
    originals = {}
    for variant in ("base", "full"):
        path = root / variant / rel
        originals[variant] = path.read_text(encoding="utf8")
        text = originals[variant]
        for old, new in edits:
            if text.count(old) != 1:
                sys.exit(f"{mid}: expected exactly one match in {variant}/{rel} for: {old!r} (found {text.count(old)})")
            text = text.replace(old, new)
        path.write_text(text, encoding="utf8", newline="\n")
    try:
        for variant in ("base", "full"):
            row[variant] = run_suite(root / variant)
    finally:
        for variant in ("base", "full"):
            (root / variant / rel).write_text(originals[variant], encoding="utf8", newline="\n")
    row["killed_by_baseline"] = row["base"]["exit"] != 0
    row["killed_by_full"] = row["full"]["exit"] != 0
    results.append(row)
    print(f"{mid} baseline:{'KILLED' if row['killed_by_baseline'] else 'survived':8} full:{'KILLED' if row['killed_by_full'] else 'survived':8} {desc}")

out.write_text(json.dumps(results, indent=2), encoding="utf8")
print(f"\nbaseline suite killed {sum(r['killed_by_baseline'] for r in results)}/{len(results)}; full suite killed {sum(r['killed_by_full'] for r in results)}/{len(results)}")
