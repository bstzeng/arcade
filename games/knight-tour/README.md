# 騎士巡遊

這是開放式騎士巡遊：每次走兩格橫向加一格縱向，或兩格縱向加一格橫向。只走有色格；每格只能踏入一次。全部走完即可，不必回起點。點亮起的目的格。

## Finite rule model

(current cell, visited-cell bitmask). A move has coordinate differences {1,2}, lands on a playable unvisited cell, and sets its bit. Delivered levels are open tours, so no return is required.

## 100-level curriculum

5×5 then 6×6 irregular boards; 8–19 playable cells; increasing branching requirements. Maps are generated from self-avoiding knight walks and every cell is part of the goal.

Each level has a stable 001–100 ID. Disconnected decorative grid islands are removed. Stored witnesses prove existence, not unique solutions. Alternative legal routes are accepted by the rule predicate. Difficulty tiers are instructional groups, not a claim that each adjacent level is strictly harder.

## Normalization

All eight board rotations/reflections and empty outer margins; playable cells and start are retained. Fingerprints exclude IDs, titles, difficulty metadata and witness actions.

## Files and proof semantics

- `levels.json`: all 100 level starts and 100 independent-oracle-checked witnesses. `levels.js` is a deterministic browser serialization of the same data.
- `engine.cjs`: game adapter using the title-specific rule branch in the new-only Path Laboratory module.
- `generate.cjs`: regenerates only this title.
- `verify.cjs`: verifies all 100 starts, canonical uniqueness, legal witness replay, sampled differential transitions, actual lifecycle, and byte-equivalent regeneration.
- `verification-report.json`: machine-readable audit with exact SHA-256 source hashes.

The generator searches with a separately implemented array-state oracle. The browser engine uses independent object-state transitions. Each proof includes the actual engine start-state hash, goal, no-uniqueness declaration, rules revision and action certificate. No shortest-route claim is made.

## Run

From the arcade directory: `node games/knight-tour/verify.cjs`. Batch commands and browser checklist: `games/path-lab/README.md`.

## Verification limit

Actual browser QA is not run. All 100 actual app level renders are covered by simulated DOM, which does not prove visual layout or browser behavior. Real desktop and narrow-touch review remains mandatory before the all-80 release.
