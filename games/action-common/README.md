# Action challenge infrastructure

Ten distinct simulations share only numeric geometry primitives, fixed-step lifecycle, input delivery, isolated demo replay, storage and page styling. Engines/rules/renderers are individually implemented in each game directory. No legacy game or lobby asset is owned or modified by this package.

## Public API

`engine.js` is CommonJS and browser-compatible. `createState(level)`, `validateState(level, state)`, `applyAction(level, state, input)` (pure copied adapter), `inspect(level, state)` and `step(level, state, input)` (in-place hot loop) satisfy the shared challenge intent. `step` is invoked only for live states by the session. Actions represent one simulation tick. `bot` builds a replay using the same bounded controls and is not consulted by the game's win predicate. `draw` is unique to each game.

`Session` clamps each presentation delta to 100ms and accumulates 1/60s steps. Blur/hidden states clear input and pause simulation, discarding stale accumulated wall time. Demo 1×/2×/4× presentation changes simulation tick throughput, never physics. Single requestAnimationFrame loop; repeated reset/navigation creates no event listeners or timers.

## Verification

Run `node games/action-common/verify-all.cjs` from the repository root. It runs:

1. 22 focused game-rule tests, including geometry, collisions, growth, tail-vacating, timing windows, long notes, hazards, resource limits and invalid actions.
2. 22 session tests, covering all ten games' real manual winning trace, assisted completion, separate demo state, save/resume, corrupt/unavailable storage, restart/navigation, and 30/60/120Hz equivalent replay.
3. 13 simulated-DOM tests, loading the actual HTML scripts, rendering each game through a checked canvas surface and invoking real event listeners for keyboard/touch controls, pause, level changes, demo cancellation and listener/rAF lifecycle.
4. The full 1,000-course audit: deterministic generator matches frozen data; canonical uniqueness; every stored bounded input trace reaches the displayed game goal; per-tick checks in an independent module; stored start/final/event hashes; fresh replanning reproduces the trace.

The independent checker contains separately written rule calculations and terminal predicates and imports no engine/solver/generator. It is not a second complete rendering/physics implementation. The physics models are deterministic arcade conventions, not physically accurate billiards/pinball claims.

`corpus.cjs` regenerates artifacts. `verify-game.cjs` verifies one game read-only. Only `verify-all.cjs` writes fresh source-hashed reports and test log. Each game owns exactly 100 levels and 100 witness certificates.

## Open gate

Real-browser visual/touch QA is **not run**. Final release must complete BROWSER-QA.md on desktop and narrow touch viewports. No files have been uploaded, published or merged by this package.
