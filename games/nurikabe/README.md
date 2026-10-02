# 數牆 Nurikabe

A self-contained Traditional Chinese browser puzzle with 50 unique-solution island-and-sea boards. Open `../nurikabe.html` through the arcade's static host. No backend, external dependencies, fonts, APIs or runtime network calls.

## Rules and completion

Each orthogonally connected white island contains exactly one clue, and its total size equals that clue. Different islands cannot touch orthogonally; diagonal contact is allowed. All sea cells must form one orthogonally connected component, and no 2×2 block may be entirely sea. Clue cells are fixed white cells. Blue represents the traditional black sea. Every cell must be classified for a win. Primary published rules checked: [Nikoli Nurikabe](https://www.nikoli.co.jp/en/puzzles/nurikabe/).

Completion uses the shared pure `engine.js` rules, not answer comparison. Connected components, clue count, island size, sea connectivity, fixed clues, and every 2×2 square are checked. The bundled unique answers power offline hints and preview; this is not an anti-cheating service.

## Levels and progression

- Exactly 50 levels; 10 each at 4×4, 5×5, 6×6, 7×7 and 8×8
- All solution layouts differ even after rotation or reflection, not just clue placement on repeated boards
- Later groups require larger and more numerous multi-cell islands and fewer trivial size-one islands; 7×7 and 8×8 boards must also exceed a minimum exhaustive search-node threshold
- Each group sorts by size² + generator proof nodes / 100 + sum of squared island sizes / 20
- These are transparent structural difficulty heuristics, not human difficulty ratings
- Fixed seed: 8242102. Reverse generation grows a connected sea without 2×2 sea blocks, derives white components, places one clue per island, then exhaustively rejects nonunique candidates

## Features and layout

50-level selector, previous/next, keyboard navigation, touch/click paint modes, right-click sea mark, fixed numbered clues, partial contradiction highlights, undo, restart confirmation with Cancel/Escape, rule/help and victory dialogs, contradiction-first hints, and a non-destructive solution preview. Hints first clear a marked cell that conflicts with the unique solution; only after existing conflicts are repaired do they reveal an unknown cell. They are answer-based assistance, not a claimed human deduction engine.

100dvh single-screen shell designed for 1180×757 desktop. Compact controls appear below the board on screens under 650px. Cells never shrink below 26px; a constrained board region can scroll on narrow screens.

## Storage

Key: `arcade.logic.nurikabe.v1`. Current cells, level, moves, hints, capped undo history and completed boards save locally. Restore validates every cell value and clue position. Saved victories are accepted only when their boards satisfy the real rules. Malformed data and denied localStorage are handled without losing playability. Restart begins a fresh attempt; undoing restart restores the prior board and assistance count. Undoing a hint does not erase assistance. Existing completion history is retained. Preview never mutates a board or awards a victory.

## Reproduce and verify

From the arcade root:

```sh
python games/nurikabe/generate.py
node games/nurikabe/verify.cjs
node games/nurikabe/ui-test.cjs
```

`generate.py` exhaustively enumerates all connected island shapes for each clue, forbids any other clue within a shape or its orthogonal boundary, then searches all non-touching assignments and checks the remaining sea. It stops at a second solution. Candidates that exceed the explicit generator budget are rejected, never accepted as unique.

`verify.cjs` is a separate JavaScript implementation with BigInt connected-shape exact cover. It enumerates all possible clue shapes and counts all compatible assignments up to two without reading the stored solution. An independent BFS rule checker verifies every answer, the shared engine must agree, invalid single-cell mutations must fail, and eight-way symmetry canonicalization must find 50 distinct layouts. `verification.json` includes per-level proof counts and a SHA-256 of the exact level file.

`ui-test.cjs` executes the shipped controller with a minimal DOM and tests all 50 manual wins, all 50 hint wins and all 50 incorrect-move recovery flows, plus undo, restart/cancel/Escape, preview preservation, keyboard/touch input, saved-game recovery, false victory rejection and unavailable storage. `ui-verification.json` records results. These are DOM integration tests, not visual browser QA; the assigned preview path was unavailable.

`generation.json`, `verification.json`, and `ui-verification.json` are audit outputs. The fixed-seed `levels.json` and `levels.js` were checked for byte-for-byte reproducibility in the assigned environment.
