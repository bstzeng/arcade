# 獨立鑽石 · Peg Solitaire

Standalone Traditional Chinese static game. Entry point: `../peg-solitaire.html`.
No dependencies, network requests, build tools, external fonts, or backend.

## Rules and implementation

- Standard orthogonal peg solitaire: jump exactly two grid steps over one adjacent peg into an empty valid hole; remove the jumped peg.
- A move cannot be diagonal, wrap across a row, or cross a missing hole.
- Win with exactly one peg. Every third level additionally requires that peg at the visible starred target.
- Fifty distinct initial patterns, from 3 through 27 pegs, on nine board geometries. Peg count rises every two levels; larger geometries and target endings are introduced. These are intended progression measures, not experimentally measured difficulty ratings.
- Every level comes from legal reverse jumps from its eventual single-peg finish. Reverse that construction to obtain the complete forward witness.
- Uniqueness is checked after all eight rotation/reflection transformations, also **ignoring target markers** so merely changing a target cannot create a new level.

## Files

- `engine.js`: pure actual game rules, replay, canonicalization, bounded current-state solver
- `generate.cjs`: seeded xorshift32 reverse construction, produces both data files
- `levels.json`, `levels.js`: identical 50-level data with full solution witnesses
- `verify-independent.py`: independently authored coordinate/set verifier; does not import JS engine
- `certification.json`: captured independent verification report with data SHA-256
- `session.js`: storage-boundary validation by legal replay
- `app.js`, `solver-worker.js`, `style.css`: interface and background hint search
- `test.cjs`, `test-ui.cjs`: engine and actual-client event tests

## Reproduce and verify

From this directory:

    node generate.cjs
    node test.cjs
    python3 verify-independent.py
    node test-ui.cjs

Generation is deterministic. Regeneration must retain the SHA-256 in the certification report.

Verified result: 50 levels, 700 legal forward jumps, 50 rotation/reflection-unique initial patterns, nine board families. The independent verifier checks valid coordinates, connected geometry, midpoint identity, occupancy before each jump, exact changed cells, peg decrement, all goals, and progression counts. The production engine separately replays every proof, checks every replay prefix through the actual save boundary, checks illegal moves, and solves near-terminal positions.

## Player experience and interruption safety

- All 50 levels unlocked in the selector; local completion and best records
- Mouse/touch and keyboard buttons; arrow-key board navigation with one roving tab stop; Enter/Space to select, Esc to cancel selection
- Unlimited undo within the current game; restart and changing an unfinished level require confirmation
- Hints never change the board. Known proof states use their correct suffix; divergent positions use a bounded DFS worker (60,000 nodes; browser worker fallback 15,000). A miss explicitly says the current state may be dead or search-limited. It never pretends the original proof works after divergence
- Playback starts at the current state, checks every action with the actual engine, and can be stopped immediately. Navigation, help, hidden-page transitions, and cancellation invalidate pending playback/search callbacks
- Assistance is recorded separately. Best time prefers an independently completed run over an assisted run
- Only move transcripts, time, and certified completion records are stored. Restore reconstructs the board with the actual rules. Best records also require a legal winning transcript. Corrupt JSON, illegal transcripts, invalid indices and unavailable local storage fail safely
- Time pauses while the page is hidden, help/confirmation is open, or the puzzle is complete

## QA scope and limits

Passed syntax, deterministic generation, all-level production-engine proofs, independent Python proofs, negative-rule and corrupted-save tests, and a dependency-free DOM/event harness that runs the **actual shipped client**. Client tests include first/last level completion, a genuinely divergent solvable position, no-mutation hints, asynchronous cancellation, stop/resume, undo after a win, confirmation accept/cancel, keyboard focus, background pause, and blocked storage.

The DOM harness is not a browser and does not prove visual layout or browser API rendering. Browser visual QA was not run because local preview/browser access was outside this assigned task. Responsive layouts and reduced-motion behavior are implemented but need visual confirmation in the integrated site.
