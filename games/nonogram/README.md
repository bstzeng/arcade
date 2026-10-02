# 數繪 Nonogram

A self-contained Traditional Chinese browser puzzle with 50 authored pixel-art pictures, from small symbols through plants, creatures, objects and architecture. Open `../nonogram.html` through the arcade's static host. No backend, external dependencies, fonts, APIs or runtime network calls.

## Rules and completion

Each row's and column's ordered clues specify lengths of contiguous filled runs. Consecutive runs must be separated by at least one empty cell. A zero means the line has no filled cells. This implementation requires every cell to be filled or explicitly marked empty before a win. Completion is evaluated by the shared pure `engine.js` rules, not by comparing the user's board to the bundled answer. Primary published rules checked: [Conceptis B&W Pic-a-Pix](https://www.conceptispuzzles.com/index.aspx?uri=puzzle/pic-a-pix/rules).

The answers are deliberately shipped client-side so hints and previews work offline. This is a recreational puzzle, not an anti-cheating service.

## Levels and difficulty

- Exactly 50 unique solutions, independently counted twice for every level
- 50 genuinely different pictures, not mirrors/rotations of repeated puzzles. `verify.cjs` canonicalizes all eight dihedral transforms including transposed dimensions
- Source artwork is explicit hand-authored monochrome icon data in `generate.py`; random-noise bitmaps are not used
- Candidate artwork with multiple solutions and a symmetry duplicate were rejected; 50 accepted pictures are selected deterministically
- Five groups of ten, ordered by a transparent heuristic: board area + number of clue runs / 5 + 2 × (generator search nodes − 1)
- Progression increases board size and clue structure. The labels are structural difficulty bands, not claimed human play-test ratings. These are deductive puzzles: the generator's line-domain solver finishes all selected pictures without branching

## Features

50-level selector, previous/next, keyboard navigation, large paint-mode buttons, touch/click input, right-click empty mark, explicit empty marks, row/column completion tint, local contradiction highlighting, reversible moves, restart confirmation with Cancel/Escape, help and victory dialogs, contradiction-first hint, and a non-destructive solution preview. Hints consult the proved unique answer; they do not claim to teach a human deduction. The next hint clears the first conflicting filled/empty mark before revealing another unknown cell.

The page uses a 100dvh single-screen layout designed for 1180×757. Under 650px, controls condense below the board. Cell size has a 26px minimum; when a narrow screen cannot fit the grid, only the board region scrolls rather than shrinking targets indefinitely.

## Storage

Key: `arcade.logic.nonogram.v1`. The current level, cells, move/hint counts, capped undo history and completion boards are saved locally. All restored arrays, values, fixed cells, indices and completion boards are validated. A completion badge is only accepted if its stored board satisfies the actual rules. Corrupted/unavailable storage leaves the game playable and does not crash it. Assistance is retained when undoing hints; restarting begins a new attempt. Undoing a restart restores both the old board and its assistance status. Previously earned completion records survive restart. Preview never modifies the saved cells or awards completion.

## Reproduce and verify

Run from the arcade root:

```sh
python games/nonogram/generate.py
node games/nonogram/verify.cjs
node games/nonogram/ui-test.cjs
```

`generate.py`: derives exact run clues from authored pictures; exhaustively searches row/column pattern domains with propagation, stopping at a second solution; rejects nonunique candidates.

`verify.cjs`: independently enumerates all line bitmasks, uses row-prefix DFS with column-domain filtering, stops at two solutions, and never uses the bundled answer when counting. Also independently extracts solution runs, checks shared engine agreement, tests one incorrect mutation per puzzle, rejects symmetry duplicates, and records a SHA-256 of level data in `verification.json`.

`ui-test.cjs`: executes the actual shipped `app.js` in a minimal DOM, rather than a reimplemented controller. All 50 levels are completed manually, via hints, and after a wrong move, plus interrupted/repeated flows. Results are in `ui-verification.json`. The report explicitly distinguishes DOM integration checks from visual browser QA, which was not available in this assigned task.

`generation.json`, `verification.json`, and `ui-verification.json` are audit outputs. `levels.json` and `levels.js` regenerate byte-for-byte in the checked environment.
