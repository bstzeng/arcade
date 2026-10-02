# 能量路網

沿單向路線移動，先支付損耗。出發能量不可超過路線承載上限，也不可低於損耗。首次到充電站會自動補入指定能量，超過電池容量的部分捨棄，之後不能再次充電。抵達 G 時需保留指定能量。

## Finite rule model

(node, integer energy, used-charger bitmask). Directed edge requires cost ≤ current energy ≤ edge capacity. Deduct the cost; on first charger arrival add its fixed amount, clipping to battery capacity. Overflow is explicitly discarded. Recharge is automatic and cannot repeat. Goal includes a reserve bound.

## 100-level curriculum

3×3 to 5×3 directed networks; 2–4 consumable chargers, nonuniform losses and bottleneck capacities; every instance becomes unsolvable when charging is removed.

Each level has a stable 001–100 ID. Disconnected decorative grid islands are removed. Stored witnesses prove existence, not unique solutions. Alternative legal routes are accepted by the rule predicate. Difficulty tiers are instructional groups, not a claim that each adjacent level is strictly harder.

## Normalization

Exact directed attributed-graph isomorphism fixing start/goal and preserving each loss, capacity and recharge amount; layout and node names are discarded. Fingerprints exclude IDs, titles, difficulty metadata and witness actions.

## Files and proof semantics

- `levels.json`: all 100 level starts and 100 independent-oracle-checked witnesses. `levels.js` is a deterministic browser serialization of the same data.
- `engine.cjs`: game adapter using the title-specific rule branch in the new-only Path Laboratory module.
- `generate.cjs`: regenerates only this title.
- `verify.cjs`: verifies all 100 starts, canonical uniqueness, legal witness replay, sampled differential transitions, actual lifecycle, and byte-equivalent regeneration.
- `verification-report.json`: machine-readable audit with exact SHA-256 source hashes.

The generator searches with a separately implemented array-state oracle. The browser engine uses independent object-state transitions. Each proof includes the actual engine start-state hash, goal, no-uniqueness declaration, rules revision and action certificate. No shortest-route claim is made.

## Run

From the arcade directory: `node games/energy-network/verify.cjs`. Batch commands and browser checklist: `games/path-lab/README.md`.

## Verification limit

Actual browser QA is not run. All 100 actual app level renders are covered by simulated DOM, which does not prove visual layout or browser behavior. Real desktop and narrow-touch review remains mandatory before the all-80 release.
