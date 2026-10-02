# Ten management and adventure games

This directory owns only new family helpers. Existing game assets, shared challenge-common files, the root registry and publication configuration are untouched.

## Architecture

Each game has a separate deterministic state machine (`engine.js`) and a bespoke interface (`view.js`). `model.js` handles pure cloning, nonnegative integer action fields, terminal-state guards and replay-based save validation. It does not contain the ten games' rules or target predicates. `ui.js` handles DOM helpers, stale-click rejection, lifecycle and tower autoplay; it does not turn games into generic multiple-choice questions.

All ten use the optional `challenge-common` controller for level selection, history, progress, isolated replay, reset dialogs and resilient storage. The browser loads fixed data directly; no fetch, backend, external API, external font or external package is used.

## Corpus

Exactly 100 fixed levels per game, split into five chapters of 20. The full set has 1,000 distinct solvable tasks, not 1,000 unique-solution puzzles. `generate.cjs` is deterministic. It emits:

- `levels.json`: public mission definitions.
- `witnesses.json`: complete action plans, claim, public goal, rule revision, SHA-256 of the actual initial state, and action certificates.
- `data.js`: browser-ready copies of both.

The nine planning games use reachability witnesses. Tower defense uses fixed-tick real-time witnesses: all waves are public, the exact enemy and tower simulation is replayed, building happens only between waves, and manual stepping/pause is available. The proof does not depend on superhuman pointer movement or wall-clock precision.

## Independent verification

`reference.cjs` imports neither engines nor the generator. It implements a second transition machine for each game and checks each field after each action, final goals, legality and conservation. In particular:

- Hotel occupancy is exclusive and staff-hour limits, cleaning, check-ins, services, rent and payroll balance.
- Repair stock equals initial parts plus arrived shipments minus consumed repair parts; diagnoses follow actual test evidence.
- Museum visitors walk the selected route and independently accumulate interest, fatigue, admission revenue and exposure damage.
- Theater resources cannot double-book; independent rehearsal, fatigue and quality calculations determine performances.
- Caravan market stock, cargo, food, risk losses, guard use, one-shot contract rewards and deadlines are checked.
- Tower targeting, range, cooldowns, armor, splash, slow, spawning, movement, bounty and leaks are independently simulated.
- Diving checks adjacency, depth, keys, oxygen, weight, finite air canisters, treasure removal and actual return to the boat.
- Time loops preserve only learned knowledge, reset daily objects and causal flags, and enforce every scheduled precondition.
- Conservation checks grass growth, feed consumption, starvation, predation, winter births and nonnegative populations.
- Alchemy checks recipe inputs, tools, wear, fuel and output, and proves initial material mass equals inventory + delivered mass + waste.

`canonical.cjs` removes cosmetic labels and normalizes valid symmetries or interchangeable entities; every game's report explains its normalization. Full corpora also have at least 80 distinct nontrivial structural signatures, beyond simply changing cash goals.

`audit.cjs` performs byte-identical regeneration, every witness against both machines, off-witness legal play, malformed/illegal actions, explicit rule-boundary fixtures, alternate accepted winning plans and tampered-save rejection. It writes source-hashed per-game reports and the aggregate report.

## Actual renderer/controller testing

`controller-test.cjs` mounts the shipped game renderers with the actual challenge lifecycle in a simulated DOM. It completes levels 001, 050 and 100 through their visible controls, including map cells, resource buttons, cast selectors, schedules and experiment controls. It also covers replay isolation, hint provenance, reset cancel/Escape/stale callbacks, stale detached game controls, invalid action atomicity, persistence, corrupt and denied storage, timer cancellation, blur, visibility and back-forward-cache page lifecycle.

This is explicitly **not a real-browser or visual-layout test**. Real desktop and narrow touch checks are still a release gate. Do not change browserQA from `not-run` based on these tests.

## Commands

Run from the arcade root:

1. `node games/management-common/controller-test.cjs`
2. `node games/management-common/audit.cjs`
3. `node games/management-common/static-test.cjs`

Focused rule/corpus check: `node games/<slug>/verify.cjs` (requires the existing successful controller report).

Rebuild data before verifying deliberate generator or initial-state changes: `node games/management-common/generate.cjs`.

Integration contract: `release-manifest.json` has exact titles, Traditional Chinese descriptions, entries, paths, counts and proof semantics. The integrator alone edits the root registry and publishes only after all release gates for all eighty new games pass.
