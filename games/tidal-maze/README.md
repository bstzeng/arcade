# 潮汐迷宮

移動或等待都讓時間前進一拍。只有下一拍開放的格子才能落腳；不可用非法移動跳過時間。水格的數字列出它開放的拍數，岸地永遠安全。等待也要求目前格下一拍安全。

## Finite rule model

(position, time modulo period). Every move and wait first advances time by one. Destination must be open at that new phase. Waiting uses the same safety check. Unsafe actions are rejected rather than allowing drowning or advancing the clock.

## 100-level curriculum

4×4 to 7×5 maps and periods 3–5; increasing route length; every witness contains waiting and time-gated traversal.

Each level has a stable 001–100 ID. Disconnected decorative grid islands are removed. Stored witnesses prove existence, not unique solutions. Alternative legal routes are accepted by the rule predicate. Difficulty tiers are instructional groups, not a claim that each adjacent level is strictly harder.

## Normalization

All eight board rotations/reflections and empty outer margins, retaining the phase-zero origin and every availability bit. Fingerprints exclude IDs, titles, difficulty metadata and witness actions.

## Files and proof semantics

- `levels.json`: all 100 level starts and 100 independent-oracle-checked witnesses. `levels.js` is a deterministic browser serialization of the same data.
- `engine.cjs`: game adapter using the title-specific rule branch in the new-only Path Laboratory module.
- `generate.cjs`: regenerates only this title.
- `verify.cjs`: verifies all 100 starts, canonical uniqueness, legal witness replay, sampled differential transitions, actual lifecycle, and byte-equivalent regeneration.
- `verification-report.json`: machine-readable audit with exact SHA-256 source hashes.

The generator searches with a separately implemented array-state oracle. The browser engine uses independent object-state transitions. Each proof includes the actual engine start-state hash, goal, no-uniqueness declaration, rules revision and action certificate. No shortest-route claim is made.

## Run

From the arcade directory: `node games/tidal-maze/verify.cjs`. Batch commands and browser checklist: `games/path-lab/README.md`.

## Verification limit

Actual browser QA is not run. All 100 actual app level renders are covered by simulated DOM, which does not prove visual layout or browser behavior. Real desktop and narrow-touch review remains mandatory before the all-80 release.
