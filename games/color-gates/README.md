# 變色通路

有「門」字的格子，只有目前顏色與它相同才可進入。有「染」字的格子會在踏入時改變角色顏色。顏色用紅 R、綠 G、藍 B 同時標示，不需靠辨色。抵達星星即可。

## Finite rule model

(cell, color in {R,G,B}). A gate tests the incoming color. A dye updates color on arrival. The goal does not require a particular final color. Every witness changes color at least twice and crosses a gate.

## 100-level curriculum

4×4 to 6×5 maps; length thresholds and minimum gate interactions grow; every instance uses multiple real color changes.

Each level has a stable 001–100 ID. Disconnected decorative grid islands are removed. Stored witnesses prove existence, not unique solutions. Alternative legal routes are accepted by the rule predicate. Difficulty tiers are instructional groups, not a claim that each adjacent level is strictly harder.

## Normalization

All eight board rotations/reflections, all six global color permutations and empty outer margins. Fingerprints exclude IDs, titles, difficulty metadata and witness actions.

## Files and proof semantics

- `levels.json`: all 100 level starts and 100 independent-oracle-checked witnesses. `levels.js` is a deterministic browser serialization of the same data.
- `engine.cjs`: game adapter using the title-specific rule branch in the new-only Path Laboratory module.
- `generate.cjs`: regenerates only this title.
- `verify.cjs`: verifies all 100 starts, canonical uniqueness, legal witness replay, sampled differential transitions, actual lifecycle, and byte-equivalent regeneration.
- `verification-report.json`: machine-readable audit with exact SHA-256 source hashes.

The generator searches with a separately implemented array-state oracle. The browser engine uses independent object-state transitions. Each proof includes the actual engine start-state hash, goal, no-uniqueness declaration, rules revision and action certificate. No shortest-route claim is made.

## Run

From the arcade directory: `node games/color-gates/verify.cjs`. Batch commands and browser checklist: `games/path-lab/README.md`.

## Verification limit

Actual browser QA is not run. All 100 actual app level renders are covered by simulated DOM, which does not prove visual layout or browser behavior. Real desktop and narrow-touch review remains mandatory before the all-80 release.
