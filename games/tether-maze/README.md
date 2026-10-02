# 牽繩迷宮

分別移動 A 與 B 到同名字母的目標。繩子沿格線依序連接兩人；往繩子的下一格走會收短，往別處走則加長一節。不可超長、穿牆、碰到繩子其他部分，兩人不可重疊。繩子不會自動換路，需移動端點把繞住柱子的繩子收回。

## Finite rule model

The ordered simple grid-cell rope [A,…,B] with 1..maximum-length grid edges. Move one endpoint cardinally. Moving onto its immediate rope neighbor pops one segment, unless that would overlap the two avatars. Moving elsewhere pushes one segment only if within length, on floor, and outside the existing rope. No automatic rerouting; walls are posts and forbid passing through them. This is a finite discrete wrapping model, not continuous string physics. Every goal pair has floor-geodesic distance greater than Manhattan distance, so an obstacle detour is unavoidable.

## 100-level curriculum

4×4 then 5×5 post fields; maximum rope length 4–7; both endpoint goals move and all require genuine obstacle detours.

Each level has a stable 001–100 ID. Disconnected decorative grid islands are removed. Stored witnesses prove existence, not unique solutions. Alternative legal routes are accepted by the rule predicate. Difficulty tiers are instructional groups, not a claim that each adjacent level is strictly harder.

## Normalization

All eight board rotations/reflections, simultaneous endpoint/goal exchange and empty outer margins; the full ordered rope and maximum length are retained. Fingerprints exclude IDs, titles, difficulty metadata and witness actions.

## Files and proof semantics

- `levels.json`: all 100 level starts and 100 independent-oracle-checked witnesses. `levels.js` is a deterministic browser serialization of the same data.
- `engine.cjs`: game adapter using the title-specific rule branch in the new-only Path Laboratory module.
- `generate.cjs`: regenerates only this title.
- `verify.cjs`: verifies all 100 starts, canonical uniqueness, legal witness replay, sampled differential transitions, actual lifecycle, and byte-equivalent regeneration.
- `verification-report.json`: machine-readable audit with exact SHA-256 source hashes.

The generator searches with a separately implemented array-state oracle. The browser engine uses independent object-state transitions. Each proof includes the actual engine start-state hash, goal, no-uniqueness declaration, rules revision and action certificate. No shortest-route claim is made.

## Run

From the arcade directory: `node games/tether-maze/verify.cjs`. Batch commands and browser checklist: `games/path-lab/README.md`.

## Verification limit

Actual browser QA is not run. All 100 actual app level renders are covered by simulated DOM, which does not prove visual layout or browser behavior. Real desktop and narrow-touch review remains mandatory before the all-80 release.
