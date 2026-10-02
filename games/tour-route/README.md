# 巡迴路線

從基地出發，走訪所有字母站後回基地。每次直達任一其他站，費用見路程表。總路程不可超過本關最佳值。可以重訪，但通常會浪費預算。地圖座標僅供辨認，費用以表格整數為準。

## Finite rule model

(current stop, visited-stop bitmask, total integer distance ≤ optimum). Move to any different stop, adding the public matrix cost. Revisit is legal within budget. Goal: every stop visited, back at depot, within optimal cost. Positive symmetric metric distances are ceilings of twice Euclidean length. The generator enumerates permutations; independent Held–Karp and bucketed Dijkstra over (position, visited mask), allowing revisits, verify every optimal value.

## 100-level curriculum

4–8 stops with distinct metric matrices; the combinatorial search space rises from 3! to 7!, and all targets are independently proven minimum closed-tour distances.

Each level has a stable 001–100 ID. Disconnected decorative grid islands are removed. Stored witnesses prove existence, not unique solutions. Alternative legal routes are accepted by the rule predicate. Difficulty tiers are instructional groups, not a claim that each adjacent level is strictly harder.

## Normalization

Exact complete weighted-graph isomorphism fixing the depot. Coordinates, stop names and visit order are discarded. Fingerprints exclude IDs, titles, difficulty metadata and witness actions.

## Files and proof semantics

- `levels.json`: all 100 level starts and 100 independent-oracle-checked witnesses. `levels.js` is a deterministic browser serialization of the same data.
- `engine.cjs`: game adapter using the title-specific rule branch in the new-only Path Laboratory module.
- `generate.cjs`: regenerates only this title.
- `verify.cjs`: verifies all 100 starts, canonical uniqueness, legal witness replay, sampled differential transitions, actual lifecycle, and byte-equivalent regeneration.
- `verification-report.json`: machine-readable audit with exact SHA-256 source hashes.

The generator searches with a separately implemented array-state oracle. The browser engine uses independent object-state transitions. Each proof includes the actual engine start-state hash, goal, no-uniqueness declaration, rules revision and action certificate. Both Hamiltonian DP and a revisiting-walk Dijkstra check all 100 optimum values.

## Run

From the arcade directory: `node games/tour-route/verify.cjs`. Batch commands and browser checklist: `games/path-lab/README.md`.

## Verification limit

Actual browser QA is not run. All 100 actual app level renders are covered by simulated DOM, which does not prove visual layout or browser behavior. Real desktop and narrow-touch review remains mandatory before the all-80 release.
