# 倒轉階梯

橫向走廊可雙向移動，樓梯只能依箭頭方向走。每次抵達節點後，所有連到該節點的樓梯都會翻轉，剛走過的也包含在內。先取得鑰匙 K，再抵達 G。點相鄰節點或下方路線。

## Finite rule model

(node, orientation bitmask, key-collected bit). Corridors are undirected. A staircase can only be used from its current tail. After arriving, flip every incident staircase, including the just-used staircase. Obtain the key and then reach the exit. Row position illustrates elevation; only marked stair connections change level.

## 100-level curriculum

Three- then four-floor networks; varying corridors, directed stair orientations, key and exit placements; every witness traverses a flipped staircase.

Each level has a stable 001–100 ID. Disconnected decorative grid islands are removed. Stored witnesses prove existence, not unique solutions. Alternative legal routes are accepted by the rule predicate. Difficulty tiers are instructional groups, not a claim that each adjacent level is strictly harder.

## Normalization

Exact directed attributed-graph isomorphism with corridor/stair type, initial stair direction, start, key and goal preserved; layout and labels are discarded. Fingerprints exclude IDs, titles, difficulty metadata and witness actions.

## Files and proof semantics

- `levels.json`: all 100 level starts and 100 independent-oracle-checked witnesses. `levels.js` is a deterministic browser serialization of the same data.
- `engine.cjs`: game adapter using the title-specific rule branch in the new-only Path Laboratory module.
- `generate.cjs`: regenerates only this title.
- `verify.cjs`: verifies all 100 starts, canonical uniqueness, legal witness replay, sampled differential transitions, actual lifecycle, and byte-equivalent regeneration.
- `verification-report.json`: machine-readable audit with exact SHA-256 source hashes.

The generator searches with a separately implemented array-state oracle. The browser engine uses independent object-state transitions. Each proof includes the actual engine start-state hash, goal, no-uniqueness declaration, rules revision and action certificate. No shortest-route claim is made.

## Run

From the arcade directory: `node games/reversible-stairs/verify.cjs`. Batch commands and browser checklist: `games/path-lab/README.md`.

## Verification limit

Actual browser QA is not run. All 100 actual app level renders are covered by simulated DOM, which does not prove visual layout or browser behavior. Real desktop and narrow-touch review remains mandatory before the all-80 release.
