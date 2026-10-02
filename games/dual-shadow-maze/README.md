# 雙影迷宮

一次指令同時移動 A 與 B。B 的左右方向和 A 相反，上下相同。撞牆的那一人留在原地，另一人仍會移動。兩人同時停在各自的星星才算完成；到達星星不會鎖住角色。

## Finite rule model

(position A, position B). Resolve the same input simultaneously; mirror left/right for B. Each blocked avatar stays independently. Both staying is an invalid no-op. Neither avatar locks on its goal.

## 100-level curriculum

4×4 to 6×5 paired maps; required route length rises; every witness exploits a collision that blocks only one avatar.

Each level has a stable 001–100 ID. Disconnected decorative grid islands are removed. Stored witnesses prove existence, not unique solutions. Alternative legal routes are accepted by the rule predicate. Difficulty tiers are instructional groups, not a claim that each adjacent level is strictly harder.

## Normalization

Joint horizontal/vertical reflections, character exchange and empty outer margins. Quarter-turns are excluded because the second avatar mirrors the horizontal axis. Fingerprints exclude IDs, titles, difficulty metadata and witness actions.

## Files and proof semantics

- `levels.json`: all 100 level starts and 100 independent-oracle-checked witnesses. `levels.js` is a deterministic browser serialization of the same data.
- `engine.cjs`: game adapter using the title-specific rule branch in the new-only Path Laboratory module.
- `generate.cjs`: regenerates only this title.
- `verify.cjs`: verifies all 100 starts, canonical uniqueness, legal witness replay, sampled differential transitions, actual lifecycle, and byte-equivalent regeneration.
- `verification-report.json`: machine-readable audit with exact SHA-256 source hashes.

The generator searches with a separately implemented array-state oracle. The browser engine uses independent object-state transitions. Each proof includes the actual engine start-state hash, goal, no-uniqueness declaration, rules revision and action certificate. No shortest-route claim is made.

## Run

From the arcade directory: `node games/dual-shadow-maze/verify.cjs`. Batch commands and browser checklist: `games/path-lab/README.md`.

## Verification limit

Actual browser QA is not run. All 100 actual app level renders are covered by simulated DOM, which does not prove visual layout or browser behavior. Real desktop and narrow-touch review remains mandatory before the all-80 release.
