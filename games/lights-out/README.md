# 熄燈棋 · Lights Out

Standalone Traditional Chinese static game. Entry point: `../lights-out.html`.
No dependencies, network requests, build tools, external fonts, or backend.

## Rules and 50-level progression

Click any cell to toggle itself and its orthogonal neighbors. Edges do not wrap. A corner changes three cells, a non-corner edge four, and an interior cell five. Win when all lights are off; the displayed goal is optional, not a failure threshold.

- Levels 1–10: 3×3; exact minimum solution lengths 1–5
- Levels 11–22: 4×4; exact minimum lengths 3–6
- Levels 23–36: 5×5; exact minimum lengths 5–11
- Levels 37–50: 6×6; exact minimum lengths 10–16

Within each board-size group the minimum never decreases. Size transitions intentionally restart with simpler patterns on the larger geometry. All 50 patterns are nonzero and distinct even under rotations/reflections; no recolors, renames, or rotations count as extra levels.

## Why the guarantee and minimum claim are sound

The seeded generator starts from all-off and applies legal clicks, then solves the resulting GF(2) linear system. The production solver reduces the system, constructs its nullspace, enumerates **every** solution, and takes one with minimum Hamming weight. Nullities for the supported 3×3, 4×4, 5×5 and 6×6 geometries are 0, 4, 2 and 0 (1, 16, 4 and 1 solutions).

The independent Python verifier does **not** use Gaussian elimination or import the game engine. It enumerates all 2^n possible first-row click patterns, then chases rows: every lower row is forced by the lit cells directly above it. Every legal solution must occur in this enumeration. It confirms both the advertised exact minimum and every supplied solution transition.

Clicking the same cell twice cancels. Click operations commute. Consequently any player-reachable state remains solvable; the client computes a fresh optimal remaining solution after arbitrary player moves. A remaining solution's length is not confused with the original-board minimum.

## Files and reproducibility

- `engine.js`: actual pure game transitions, GF(2) solver, proof replay and symmetry canonicalization
- `generate.cjs`: deterministic generator
- `levels.json`, `levels.js`: same 50 levels and full solution witnesses
- `verify-independent.py`: independently implemented coordinate transitions and exhaustive row-chasing proof
- `certification.json`: captured verification output with the data SHA-256
- `session.js`: legal-replay save boundary
- `app.js`, `style.css`: interface
- `test.cjs`, `test-ui.cjs`: actual-engine and actual-client tests

Run from this directory:

    node generate.cjs
    node test.cjs
    python3 verify-independent.py
    node test-ui.cjs

Verified result: 50 unique levels, 378 witness clicks, every final state all-off, and independently proven minimum lengths for every level. Generation is reproducible; the SHA-256 should match the certification report.

## Player features and safety

All 50 levels unlocked, progress and best records, current-state hints, stoppable solution playback, unlimited undo, confirmed restarts/level changes, accessible cell labels, roving keyboard focus, arrow-key navigation and Enter/Space support. No time limit.

Hints do not mutate the board. Playback uses the actual transition engine and is cancelled by navigation/help/hidden-page transitions. Best records prefer an unassisted completion, then fewer clicks, then lower active time. The timer pauses in background, dialogs and completed games.

Local saves contain move transcripts rather than trusted serialized boards. Restoring replays all moves and rejects actions after completion. Stored completion/best records require their own legal winning transcripts. Invalid JSON, illegal click indices, forged progress and unavailable storage are handled without breaking gameplay.

## QA scope and limits

Passed syntax, deterministic generation, all 50 production-engine proofs, all 50 independent proofs and exact-minimum checks, every witness-prefix restore, all one-click divergent states, involution/commutativity, edge/wrap tests and corruption tests.

A dependency-free DOM/event harness also executes the actual shipped client: click/undo, non-mutating hints, first/last level playback, stop/resume, divergent-state playback, confirmed navigation/restart accept/cancel, best proof validation, blocked storage, keyboard focus and background timer behavior.

No browser visual QA was run because local preview/browser access was outside this assigned task. The DOM harness is not a rendering engine; responsive CSS and browser dialog/worker rendering still require integrated-site visual confirmation.
