# 一筆走橋

從 S 島出發，走完所有橋，最後停在 G 島。橋旁數字是橋的編號；平行橋是不同的橋。點橋、島嶼或下方可走路線。走過的橋不可重走。

## Finite rule model

(current vertex, used-edge bitmask). An action names one unused incident edge. Parallel edges have separate identities. Goal: every edge used once and current vertex equals the declared endpoint.

## 100-level curriculum

5–9 vertices; growing combinations of cycles, articulation choices, parallel bridges and open/closed endpoints; 7–26 crossings.

Each level has a stable 001–100 ID. Disconnected decorative grid islands are removed. Stored witnesses prove existence, not unique solutions. Alternative legal routes are accepted by the rule predicate. Difficulty tiers are instructional groups, not a claim that each adjacent level is strictly harder.

## Normalization

Exact multigraph isomorphism fixing start and end; vertex names, embedding, edge order and parallel-edge order are discarded. Fingerprints exclude IDs, titles, difficulty metadata and witness actions.

## Files and proof semantics

- `levels.json`: all 100 level starts and 100 independent-oracle-checked witnesses. `levels.js` is a deterministic browser serialization of the same data.
- `engine.cjs`: game adapter using the title-specific rule branch in the new-only Path Laboratory module.
- `generate.cjs`: regenerates only this title.
- `verify.cjs`: verifies all 100 starts, canonical uniqueness, legal witness replay, sampled differential transitions, actual lifecycle, and byte-equivalent regeneration.
- `verification-report.json`: machine-readable audit with exact SHA-256 source hashes.

The generator searches with a separately implemented array-state oracle. The browser engine uses independent object-state transitions. Each proof includes the actual engine start-state hash, goal, no-uniqueness declaration, rules revision and action certificate. No shortest-route claim is made.

## Run

From the arcade directory: `node games/euler-bridges/verify.cjs`. Batch commands and browser checklist: `games/path-lab/README.md`.

## Verification limit

Actual browser QA is not run. All 100 actual app level renders are covered by simulated DOM, which does not prove visual layout or browser behavior. Real desktop and narrow-touch review remains mandatory before the all-80 release.
