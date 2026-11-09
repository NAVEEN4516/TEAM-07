# Mutation sanity check

A passing suite proves little unless it would fail when the code is wrong. This check applies one deliberate bug at a time to a **scratch copy** of `src/` (the repository itself is never modified), runs a test suite against each, and records whether the suite noticed.

- **Commit:** `98b198f7bca22ee0cb14ef08d1218f11aaafaa91`
- **Node:** v24.11.1, executed 2026-11-08 12:53 UTC
- **Original suite:** the 255 tests at baseline `222089658f26badaf5c9f6d3c60e75986ebd6320`, run against each mutated `src/`
- **Full suite:** all 410 tests on this branch, run against the same mutated `src/`
- **Driver:** [`mut-driver.py`](mut-driver.py) lists every mutation verbatim; raw results are in [`mut-results.json`](mut-results.json). Both suites were confirmed green on the unmutated copy first (255/255 and 410/410).

**Result: the original suite caught 18 of 23 mutants; the full suite caught 23 of 23.**

| ID | Requirement | Deliberate bug | Original 255 | Full 410 | First failing test, original suite | First failing test, full suite |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| M01 | BDC-F-010 | Ideal line divides by duration+1 | caught | caught | TC-F-15.1 - default dataset at Day 4 produces exact SRS Appendix A & B KPI values | TC-F-15.1 - default dataset at Day 4 produces exact SRS Appendix A & B KPI values |
| M02 | BDC-F-012 | +1 variance classed as Ahead (tolerance boundary off by one) | caught | caught | TC-F-15.2 - moving Current Day updates all KPIs live and deterministically | TC-F-15.2 - moving Current Day updates all KPIs live and deterministically |
| M03 | BDC-F-011 | Work completed ON the Current Day is not counted | caught | caught | TC-F-15.1 - default dataset at Day 4 produces exact SRS Appendix A & B KPI values | TC-F-15.1 - default dataset at Day 4 produces exact SRS Appendix A & B KPI values |
| M04 | BDC-F-010 | Ideal line is not clamped at the final day | caught | caught | day is clamped so ideal never goes negative | day is clamped so ideal never goes negative |
| M05 | BDC-F-008 | Deleting an issue leaves the stored sprint total stale | caught | caught | - | deleting the added issue returns every layer to the default snapshot |
| M06 | BDC-F-007 | Reopening a Done issue keeps its completion day | caught | caught | - | reopening Done work to In Progress clears the completion day in every layer |
| M07 | BDC-NF-003 | A rejected sprint change still applies the new name (partial update) | caught | caught | rejects empty or whitespace-only sprint name | rejects empty or whitespace-only sprint name |
| M08 | BDC-SR-003 | DEF-01 reintroduced: subscribers notified before load errors are set | **missed** | caught | - | a failed restore publishes the reasons together with the restored defaults |
| M09 | BDC-SR-003 | Sprint data starts reading browser storage | **missed** | caught | - | - |
| M10 | BDC-SR-002 | Maximum sprint length raised from 60 to 61 days | caught | caught | rejects duration beyond 60 days with a visible message and leaves state unchanged | rejects duration beyond 60 days with a visible message and leaves state unchanged |
| M11 | BDC-F-006 | Duplicate issue keys compared case-sensitively | caught | caught | rejects case-insensitive duplicate keys | add: duplicate key in other case with spaces is rejected with a message and no layer changes |
| M12 | BDC-F-007 | A completion day after the Current Day is accepted | caught | caught | TC-F-07.2 - rejects a completion day after the Current Day | update: Done after the Current Day is rejected with a message and no layer changes |
| M13 | BDC-SR-003 | Saved state's stored total is trusted instead of recomputed | caught | caught | a valid dataset is loaded as given | a valid dataset is loaded as given |
| M14 | BDC-F-014 | Actual line plots one day past the Current Day | caught | caught | - | - |
| M15 | BDC-F-015 | Variance shown without its + sign | caught | caught | formats positive variance with leading plus sign | a fresh load shows the 10 original issues with every field and the exact SRS Appendix B results |
| M16 | BDC-SR-001 | escapeHTML stops escaping '<' | caught | caught | escapes user-supplied values containing XSS payloads in HTML attributes | a hostile sprint name is escaped in the banner and cannot break out of any attribute |
| M17 | BDC-NF-004 | The OS dark-mode preference is ignored on first visit | **missed** | caught | - | - |
| M18 | BDC-F-005 | A missing completion day shows blank instead of '--' | caught | caught | - | a fresh load shows the 10 original issues with every field and the exact SRS Appendix B results |
| M19 | BDC-NF-005 | The calculation layer imports from the data layer | caught | caught | TC-NF-05.1 - module declares no imports, so it cannot form a cycle | TC-NF-05.1 - module declares no imports, so it cannot form a cycle |
| M20 | BDC-NF-005 | A circular import between two modules | caught | caught | - | - |
| M21 | BDC-SR-005 | eval() appears in application code | **missed** | caught | - | - |
| M22 | BDC-NF-005 | A data module reads the DOM | caught | caught | rejects negative story points with a visible message and leaves state unchanged | rejects negative story points with a visible message and leaves state unchanged |
| M23 | BDC-SR-005 | The page loads a script from another origin | **missed** | caught | - | - |

## What the 5 misses show

The original suite missed exactly the bugs the new tests were written for:

- **M08** (BDC-SR-003): DEF-01 reintroduced: subscribers notified before load errors are set.
- **M09** (BDC-SR-003): Sprint data starts reading browser storage.
- **M17** (BDC-NF-004): The OS dark-mode preference is ignored on first visit.
- **M21** (BDC-SR-005): eval() appears in application code.
- **M23** (BDC-SR-005): The page loads a script from another origin.

## Reading the "caught" results fairly

A mutant counts as caught whenever the suite fails, not only when a test names the real cause. Three of the original suite's catches were incidental:

- **M19** was caught by an existing engine test that asserts the file contains no `import` at all. The new architecture test reports the actual layering rule that was broken.
- **M20** (a circular import) crashed module loading, so the original tests failed at import time rather than by detecting a cycle.
- **M22** (DOM access in a data module) failed only because `document` does not exist in Node, and only for tests that call `serialize()`. In a browser it would not have failed anywhere.

The architecture tests turn these into direct, named failures, which is why they were added.

## Limits of this check

This is a sanity check of 23 hand-picked bugs, not a mutation score. It cannot show that no important bug can slip through, and it does not cover DOM-only code that only a browser exercises (see the coverage reports). It shows that the tests are capable of failing, and which gaps the new tests close.
