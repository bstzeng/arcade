# 水果快切 (fruit-slice)

以實際拖曳軌跡切過拋起的水果，避開炸彈。

## Artifacts and actual rules

- `engine.js`: independent deterministic 60 Hz simulation, game-specific canvas renderer, level generator and bounded demonstration planner.
- `levels.json` / `levels.js`: exactly 100 stable, selectable seed-generated courses, loaded without a server/fetch requirement.
- `certificates.json` / `certificates.js`: exactly 100 real-time witnesses containing seed, fixed Hz, canonical start hash, input-change transcript, final state/event hashes and measured duration.
- `verify.cjs`: all 100 stored transcripts are replayed through the delivered engine, with independently implemented per-tick rules/geometry/resource audits.
- `verification-report.json`: exact source hashes and offline gate results. Browser QA status remains honest and separate.

This is a distinct real-time arcade game, not a generic click-to-answer puzzle. All outcomes use actual engine goals; no witness comparison is used as the win condition. Alternate legal winning input is accepted. Witnesses prove one winning play in the declared deterministic game model, not uniqueness, optimality, or guaranteed human success. Physics are intentionally consistent arcade physics, not laboratory simulation.

## Curriculum and canonical uniqueness

Twelve to twenty-six differently launched fruit, interleaved offset bombs, different velocities, increasing density. Actual capped pointer strokes are required. A new touch/pointer gesture rebases the knife origin without cutting, so tapping never sweeps from an old cursor location. Mouse hover repositions without slicing; touch can lift and start a new stroke. Keyboard movement plus held blade remains supported. Canonical key normalizes horizontal reflection.

## Controls and lifecycle

The Traditional Chinese game page describes keyboard and touch controls and each game's exact rules. Start/pause, P, blur/visibility pause, restart, all 100 levels, per-level hint and 1×/2×/4× demonstration are available. Fixed 60 Hz physics is independent of presentation frame rate, with maximum 100ms catch-up per rendered frame. No server, login, external asset or audio requirement.

The shared session saves current manual state, current level, assistance flag and independent wins under a new game-specific storage key. Corrupt/unavailable storage is safely handled. Viewing a hint or demonstration marks the current manual attempt assisted immediately, including across reload. Demo uses a separate fresh state and restores the manual gameplay state; the assistance flag remains. It never grants progress or removes previous genuine wins. A fresh reset permits independent completion.

## Reproduction and verification

From the repository root:

- `node games/fruit-slice/verify.cjs`
- `node games/action-common/corpus.cjs fruit-slice` regenerates the frozen corpus and certificates deterministically.
- `node games/action-common/verify-all.cjs` runs the full 1,000-course audit and 57 focused rule/session/simulated-DOM tests.

Independent audit logic lives in `../action-common/independent.cjs`; it does not import a game generator, engine or stored solution. The audit checks actual transitions and independently computed terminal constraints. This is an independent rule audit, not a second full general-purpose physics engine.

## Remaining release gate

Real-browser desktop/mobile visual and touch QA is **not run** in this environment. DOM event/canvas call simulations and multiple frame-rate replay schedules are tested, but do not substitute for that gate. See `../action-common/BROWSER-QA.md`.
