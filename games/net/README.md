# 旋轉水管 / Net

Original, dependency-free implementation and generated content. Entry: `../net.html`.

## Rules

Rotate orthogonal connector tiles in place. Every connector must match the opposite connector on its adjacent tile. No connector may point outside the board; opposite borders do not wrap. Every tile must belong to one connected network, with no cycles: the completed network is a spanning tree. Endpoints and junctions are ordinary tiles, not separately omitted targets. The gold source is only a visual connectivity indicator and imposes no extra rule.

Primary reference: [Simon Tatham's Net rules](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/net.html). This version fixes wrapping off and uses the connected, loop-free variant.

## 50 fixed levels and proofs

- Boards increase by stages: 3×3 (6), 4×3 (6), 4×4 (8), 5×4 (8), 5×5 (8), 6×6 (7), 7×7 (7)
- Larger boards require coordinating more endpoints, bends, and junctions. Difficulty bands describe board complexity, not measured human solve time or a strict ranking between every adjacent level
- `generate.cjs` uses seeded random Kruskal spanning trees, exact uniqueness rejection, physical-shape canonical deduplication, and a separately scrambled starting orientation
- `levels.json` and browser-ready `levels.js` contain the same tile layouts, unique completed connector masks, deterministic seeds, and exact solver results
- There are 50 unique solutions and 50 dihedral-distinct tile-shape layouts
- Tile identity is its physical connector shape, independent of starting rotation. Uniqueness counts final connector masks, not rotation gestures: a straight piece has two distinct states, a cross has one
- Every generated puzzle has total connector degree 2(N−1). The validator additionally requires reciprocal edges and complete connectivity; this proves the final network is a tree

`engine.js` searches all distinct tile connector domains, enforcing border/matching constraints, forced-cycle rejection, and possible connectivity. It counts up to two solutions. Aborted searches are never accepted as uniqueness proofs.

`verify.py` is an independent Python implementation which does not import the JavaScript engine or trust saved counts. It independently checks shape identity, edge reciprocity, tree connectivity, exact solution counts, and all eight symmetries. It tests an ambiguous 4×4 fixture, an impossible cycle fixture, and rotation symmetry. `verification-report.json` records the result for each board.

## Controls and saved state

Click/Enter/D rotates clockwise; right click/A rotates counterclockwise. Arrow keys move focus. Shift-click/L locks or unlocks a tile. Touch users can enable the lock-mode button. Locking only prevents accidental movement and does not certify the tile's correctness.

Undo retains 200 recent actions for the current level. Reset requires confirmation, restores original orientations and clears locks while retaining earned medals. Hints correct one tile toward the unique solution; if that tile is incorrectly locked, the hint asks the player to unlock it and does not change it. Corrections can be undone. Full-solution preview is read-only and preserves boards, locks, moves, and completion records.

All 50 levels are selectable. Local key: `arcade-net-v1`. Every partial board, locks, moves, last selected level, and proof-validated completed-board medals are saved. Loaded tile orientations must be rotations of that level's physical tiles. Booleans, lengths, integer ranges and completed solutions are validated. Invalid records are discarded. Storage denial or quota failure is announced but does not stop play. Undo history is session-only. No account, dependency, backend, telemetry, or network API is required; first page load still requires the site's normal network availability.

## Reproduction and tests

From this directory:

    node generate.cjs
    node test.cjs
    python3 verify.py
    node test-ui.cjs

- `test.cjs`: 416 rule, exact uniqueness, proof, symmetric-rotation, arbitrary-state hint, locking, undo, reset, preview and save-load assertions
- `test-ui.cjs`: 30 minimal-DOM controller assertions, including dialogs, cancellation, read-only previews, full-board solution connectivity, keyboard/touch locking, save resume and malformed/blocked storage
- `test-report.json` / `ui-test-report.json`: machine-readable results

The interface targets a compact 1180×757 desktop viewport and a stacked touch layout on smaller screens. Browser-based visual QA/screenshots were not run because the authorized local preview was unavailable. The DOM harness is controller regression coverage, not a substitute for actual browser rendering.
