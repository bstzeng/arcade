# Vehicle laboratory · 15 distinct games

This family owns only `games/vehicles120-common`, the 15 listed game directories and their HTML entry pages. No existing game, shared infrastructure or lobby file is modified. The exact titles and mechanics are preserved from the user's vehicle proposal.

## Runtime and controls

The vanilla browser bundle works without network dependencies or a build step. `specs.js` contains Traditional Chinese tutorials and per-game controls. `engine.js` has separate fixed-tick models and win/failure rules. Rendering, session recording and touch/keyboard controls are shared only where appropriate. Per-game `engine.js` files expose a CommonJS adapter for independent integration.

Every simulation tick is exactly 1/30 second. Browser frame time is clamped, fixed steps are accumulated and background/blur pauses clear all held controls. Multitouch buttons support pointer cancellation and lost capture. Keyboard arrow/WASD controls, space action, P pause and R restart are available; optional 5% increment sliders allow fine steering, throttle, braking and altitude.

- Kart: lateral steering, bend-dependent inner/outer line distance, real same-lane blocking and trailing slipstream; a legal state-driven opponent.
- Drift: steering slip with handbrake, minimum speed/angle scoring and broken/rebuilt combos.
- Off-road: a narrow, physically curved mountain corridor, mud drag, gravel brake loss, slope resistance, lateral tire-force speed scrub and low-gear grip/speed tradeoff.
- Speedboat: narrow winding water corridor, unavoidable wave drag/slam even without jumping, edge-triggered crest-timed launch, airborne steering and landing damage. Full-throttle perfect-steering ablations fail all 100 without actual wave timing.
- Motocross: terrain contact, gravity, chasm/cliff collision, jump and airborne body torque.
- Reverse truck: bicycle steering reverses with direction, actual obstacle overlap, low-speed aligned parking.
- Trailer: separate articulated trailer angle, reverse-instability, jackknife failure, trailer-position docking.
- Bus: traction/braking/grade, jerk and overspeed comfort, stationary doors and boarding dwell at several stops.
- Train: lower acceleration and braking, grades, speed limits, stopping-distance planning and station overshoot.
- Drone: independent lateral and altitude velocity through sequential 3D gate planes; depth projection, frame collisions.
- Helicopter: horizontal/vertical acceleration, extensible pendulum rope, actual hook pickup and stable delivery.
- Sailboat: wind-dependent no-go zone and polar speed, sheet trim, turning/tacking, legal buoy-seeking opponent.
- Spaceship: angular inertia, thrust/reverse thrust, no translational drag, finite fuel, planets and low-speed docking.
- Moon rover: five steep rock formations per route, actual wheel-support/center-of-mass tipping, low-gravity crest take-off and damaging suspension impacts, plus low-gear climbing. Counterweight must switch between uphill and downhill.
- Stunt workshop: 4–5 editable gaps per level with seven bridge/ramp plan patterns, varying material budgets, narrow/wide jump trajectories and low landing beams. A correct construction still requires changing approach speeds; construction never grants completion.

AI race difficulty changes disclosed speed tiers. AI reads its present state, public geometry/wind and current visible vehicle positions only. It does not consume future user inputs or a precomputed winning player route. The live coach is used exclusively for explicitly assisted demonstrations. All other modes remain player controlled.

## 100 scenarios per game and proof scope

`levels.json` freezes each game's 100 scenarios. The browser reconstructs the same generator output; exact equality is audited. Semantic geometry signatures exclude IDs, cosmetic themes and seeds; road reflection is normalized. Parking translation is normalized. Terrain, route, wind, gate, obstacle, stop and destination geometry actually vary.

`proofs.json` stores 100 complete legal input traces per game. Each packed witness row is `[ticks, steering×20, throttle×20, brake×20, lift×20, special]`. A seventh `'start'` starts a built workshop route; seventh and eighth entries can name a build index and type. Records bind the level and final state with SHA-256.

Witnesses are replayed through the released engine without calling its coach or solver. Checks independently inspect physical terminal predicates, every drone gate crossing, collision/clock semantics and exact final state hashes. These are existence witnesses at the disclosed standard AI policy and arcade tolerances, not unique solutions, arbitrary-opponent forced wins or high-precision real-world dynamics.

Manual completion, hint assistance, demonstration and freeplay are separately tracked. Demonstrations run legal inputs and never alter manual completion. A hinted manual run stays assisted after reload but does not turn into automatic demo. Stored sessions are input logs, replayed on load and left paused; malformed logs and oversized saves are rejected. Fresh manual runs clear assistance. All levels are selectable.

## Verification

From the arcade repository root:

- `node games/vehicles120-common/verify-all.cjs` runs 18 physics-rule tests, 19 actual-script simulated-DOM lifecycle tests, 28,000 constant-control negative cases and all 1,500 frozen input witnesses plus 1,500 interrupted save/replays.
- `node games/vehicles120-common/verify.cjs` reruns the corpus and rule audit only.
- `node games/vehicles120-common/generate.cjs` regenerates frozen corpora and HTML from source; run verification after regeneration.
- `node games/vehicles120-common/release.cjs` writes the source-bound manifest and catalog after verification.

`verification-report.json` provides per-game proof counts, semantic uniqueness, exact level/proof hashes and final hashes. `test-report.json` binds the tested engine, UI, test scripts, entries and corpus. `release-manifest.json` lists precise ownership and integration evidence.

## Remaining gate

Actual browser visual/layout/native-touch QA has intentionally not been run in this worker. Simulated DOM at 333 and 400 pixel widths does not prove layout, screenshot appearance or physical touch performance. Parent must run BROWSER-QA.md before publication. No upload, publish or merge was performed here.

## Independent-audit correction regression

Version 1.1 replaces the overly forgiving initial off-road/water corridors, automatically stable rover terrain and identical two-gap workshop layouts. The corrected 400 scenarios each pass their legal witnesses and reject all 70 tested constant throttle/steering/special combinations (28,000 trials). Workshop tests supply the correct full build before constant driving, and separately reject the old first-gap-ramp/second-gap-bridge plan. Two additional sets of 100 boat trials use perfect route steering but full throttle with either no lift or permanently held lift; all fail from physical wave impact. These are tested policy families, not an exhaustive proof about every imaginable constant real-valued command. `constant-policy-report.json` binds exact tested sources. Input saves and manual progress carry the engine revision so older-model attempts are not promoted to new-model completions.
