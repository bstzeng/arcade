# 非對稱合作：15 款、1,500 關

Standalone vanilla HTML/CSS/JavaScript. No packages, external services, accounts, telemetry, network multiplayer, or installation. Each HTML loads `core.js`, its own `model.js`, `session.js`, then `app.js`. The engine is the same in browser, generator, witness replay and tests. Run a normal HTTP static server from the arcade root; `file://` cannot fetch JSON.

## Player contract

- Exactly 100 individually selectable missions per game. Same-device two-player privacy handoff and either human role plus a local AI teammate are available throughout.
- In two-player mode, switching roles immediately removes the scene, controls, status and hint from the DOM. The receiving player must explicitly reveal their view. This is a shared-screen courtesy, not encryption against developer tools or another person looking over the player's shoulder.
- AI receives only `observe(state, role)` and uses the corresponding role's legal operations. It does not read witnesses. Human input is still required for the selected human role. Some incorrect or contradictory player choices can require retrying the level; AI does not promise to rescue every dead-end state.
- Arrow keys work for directional controls; Tab/Enter covers every button. Numbers 1–9 operate the first nine controls. P pauses, R restarts, Escape covers the scene. No held-key or drag gesture is required. Pointer cancellation, hidden tabs, window blur and page hide pause progression; resuming is explicit.
- Completion is stored separately as manual two-player, AI/hint assisted, or demonstration. A demonstration never awards a manual completion. Completed-level records persist locally; an interrupted level stays in memory but does not restore its exact position after reloading.
- All games have alternate valid actions/solutions. No unique-solution, globally optimal AI, online multiplayer, medical simulation accuracy, or realistic aircraft certification claim is made.

## Fifteen actual mechanics

1. **盲圖領航**: obstacle/trap grid, navigator's complete trap knowledge versus explorer's local terrain, explicit directional signals and independent movement. Levels vary spatial blockage topology and safe paths.
2. **時間搭檔**: globally rewound cyclic gate phases; frozen crossings and finite two-step freeze duration. Missions vary gate periods, openings, phase offsets and number of gates.
3. **巨人與小匠**: giant selects bridge spans and pipe-entry elevations; artisan alone crawls branching-direction pipe sequences and releases interior locks. Gap, elevation and pipe structure vary.
4. **夢境剪接師**: actual panel permutations with left/right port-height compatibility, moon collection, locked occupied/past panels and backtracking. The editor solves a connection permutation; the walker physically traverses it.
5. **譯者與使節**: envoy privately observes negotiation requirements, translator privately owns a shuffled lexicon and grammar order; shared intentions are encoded word-by-word and decoded by the engine at speech. Quantity intervals allow alternate accepted offers.
6. **醫師與奈米艇**: physician scans unknown samples and issues visible location/drug prescriptions; pilot routes a boat through branched vessels, consumes oxygen and delivers the specific drug. Wrong doses harm integrity. This is fictional rescue entertainment, not medical guidance.
7. **倒影雙生**: the physical role aligns reflective surfaces; the reflection traverses a lit branch and sends a light seal back to form the physical bridge. Route angles and lengths vary across mutually dependent stages.
8. **指揮與潛艇**: sonar casts four cardinal range rays and accumulates only measured cells in memory; pilot has heading plus thrust and cannot see hidden reefs. Optional synthesized echo delays have a complete visual equivalent. Audio uses only the currently visible sonar-role observation; pilots cannot hear hidden AI sonar information. Muting, curtains, pausing, resetting, role/level changes and page lifecycle interruptions stop and disconnect every active or future-start voice. Finished voices are removed, and stale AudioContext resume rejections cannot affect a newer context. The sonar AI plans from observed memory, not the real reef array.
9. **植物與園丁**: spatial root growth connects wells; stem growth branches around stones toward fruits. The gardener supplies water, column lighting and supports for the plant's explicitly requested growth. Grown geometry is part of the persistent state.
10. **導演與替身**: camera/rig setup by director and real-time stunt input by performer. Clock is 10 ticks/second; the legal cue tolerance is recorded per shot. Engine witnesses replay exact timed inputs, not an assertion that an arbitrary player always wins.
11. **寄居堡壘**: driver chooses steering and throttle; engineer selects slope-appropriate gear, shields/power split and cooling. Progress, heat, energy and rough-terrain conditions are actually evaluated.
12. **說書與化身**: editable world conditions and two alternative actions per story scene, limited ink, persistent condition state and different branch gifts. The narrator changes laws; the avatar requests and executes actions permitted by those laws.
13. **光束接力**: grid-ray reflection including blocked rays, slash/backslash mirror orientation and wavelength matching. Once started, the target changes every 80 real 100 ms ticks; each segment requires 40 illuminated ticks. Three missed segments fail. Source/mirror setup has a preview before starting. Light travel is instantaneous in this deliberately discrete optical model.
14. **空中吊運隊**: aircraft position/elevation, an explicitly damped pendulum (`theta`, angular velocity, gravity and movement impulse), cable length, cargo hook, fully rotated irregular docking silhouette, projected collision width, obstacle clearance and precise stable drop. It is a simplified discrete-flight model, not a continuous aerodynamics simulator.
15. **無聲調查局**: field-only scene evidence, analyst-only suspect dossiers, a hard three-icon channel, category requests and cross-evidence accusation followed by field arrest. Correct accusations without corroborated, searched evidence do not win.

## Reproducible checks

From the arcade root:

    node games/coop120-common/generate.cjs --check
    node games/coop120-common/verify.cjs
    node games/coop120-common/dom-test.cjs
    node games/coop120-common/audio-test.cjs

`generate.cjs` without `--check` regenerates the deterministic corpora and artwork. `seal.cjs` updates the release manifest to the exact approved source and corpus hashes; it must be run only after reviewed changes and followed by the full verifier. It does not publish anything.

For each game, `levels.json`, `proofs.json`, and `alternates.json` are arrays of exactly 100 records. Proof records contain legal `{role, action}` transitions and a SHA-256 of the actual terminal state with the repeated level and action log omitted. Primary witnesses and alternate witnesses are both replayed through the engine. Alternate methods are documented in `alternate.cjs` and the report; where the game has a fixed traversal order, alternates can be legal operation ordering or safe backtracking rather than a different ending.

Semantic distinctness excludes level IDs; it additionally removes unused reflective-height decoration, dream-panel identity labels, gate decoration and narrator AI's preferred-branch field. Distinctness means 100 different operative parameter/topology records, not 100 unrelated game rules or a proof of unique solutions.

The fresh verifier rejects changed bound source files, malformed corpora, duplicate semantic levels, missing/truncated witnesses, wrong titles, invalid or wrong-role actions, and stale terminal hashes. It checks direct objective invariants, source generation determinism, all 1,500 primary and 1,500 alternate witnesses, AI legality on reachable off-reference states, hidden-information equivalence, terminal view rendering, and the real shared Session controller's privacy/lifecycle/progress behavior.

`controls()` returns the available UI control palette, including operations that can currently fail with an explanation. `legal()` filters that palette by actual engine transition acceptance. A failed transition is atomic. Neither API checks actions against a stored solution.

## Verification limits

This family supplies offline engine/controller and SVG generation evidence. Browser screenshots, visual QA at 333/400 px, real touch devices, audio hardware, hosted routes, and publication are separate parent integration gates and are not claimed by the family report. The actual app.js is additionally executed in a minimal non-layout DOM harness for all 15 routes, including mission 1/50/100 demos, role handoff, timers, saved progress and interrupted flows. This is not a browser; neither that harness, local SVG strings, nor Session tests are called browser tests. The repository and all historical games are untouched outside the 15 owned game entries/directories and `coop120-common`.
