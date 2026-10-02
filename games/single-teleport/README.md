# 單次傳送

先步行到任一紫色傳送門，再按「傳送」。兩扇門會一起消失，不能再使用。傳送不會自動觸發。抵達星星即可。每關的兩區由牆分隔，必須安排一次跨區傳送。

## Finite rule model

(cell, portal-used bit). Ordinary moves do not trigger portals. Action 4 at an endpoint moves to its partner and consumes the only pair. Goal is the exit; all delivered maps require the jump.

## 100-level curriculum

6×4 to 7×6 separated regions; varying wall topology, start/exit placements and portal approach routes; witness lengths 6–15.

Each level has a stable 001–100 ID. Disconnected decorative grid islands are removed. Stored witnesses prove existence, not unique solutions. Alternative legal routes are accepted by the rule predicate. Difficulty tiers are instructional groups, not a claim that each adjacent level is strictly harder.

## Normalization

All eight board rotations/reflections, portal-pair exchange and empty outer margins; start and goal remain marked. Fingerprints exclude IDs, titles, difficulty metadata and witness actions.

## Files and proof semantics

- `levels.json`: all 100 level starts and 100 independent-oracle-checked witnesses. `levels.js` is a deterministic browser serialization of the same data.
- `engine.cjs`: game adapter using the title-specific rule branch in the new-only Path Laboratory module.
- `generate.cjs`: regenerates only this title.
- `verify.cjs`: verifies all 100 starts, canonical uniqueness, legal witness replay, sampled differential transitions, actual lifecycle, and byte-equivalent regeneration.
- `verification-report.json`: machine-readable audit with exact SHA-256 source hashes.

The generator searches with a separately implemented array-state oracle. The browser engine uses independent object-state transitions. Each proof includes the actual engine start-state hash, goal, no-uniqueness declaration, rules revision and action certificate. No shortest-route claim is made.

## Run

From the arcade directory: `node games/single-teleport/verify.cjs`. Batch commands and browser checklist: `games/path-lab/README.md`.

## Verification limit

Actual browser QA is not run. All 100 actual app level renders are covered by simulated DOM, which does not prove visual layout or browser behavior. Real desktop and narrow-touch review remains mandatory before the all-80 release.
