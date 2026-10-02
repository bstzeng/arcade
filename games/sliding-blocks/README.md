# 華容道 / Sliding Blocks

Standalone Traditional Chinese sliding-block game. Open `../sliding-blocks.html`; all scripts, levels and styles are local, with no package dependencies, network requests, backend, or build step required to play.

## Rules and controls

- Board: four columns by five rows. The red 2×2 曹操 wins when its top-left corner is at column 2, row 4, filling the bottom-center exit. It does not need to move outside the board.
- Each of ten pieces moves orthogonally, without rotating, overlapping, or crossing another piece.
- **One straight slide of any positive distance is one move. A turn requires another move.** Generation, optimality proof, independent verifier, hint, UI, saved history and undo use this exact rule.
- Tap/click a piece, then one of its circular landing markers. Marker arrows and numerals show direction and distance. Dragging is also supported; the piece stops before an obstacle.
- Keyboard: focus a piece with Tab and select with Enter or Space. Arrow keys move the selected piece one cell; Shift+Arrow slides to the farthest legal location. Z undoes.
- All 50 levels are selectable. Restart requires confirmation after a move. Undo has no gameplay limit. Each move pushes the entire prior position.
- Hint marks a certified next move without executing it. Full solution presents the entire ordered move list with unambiguous starting row, column, shape, direction, and distance. Single-step and timed playback are available. Timed playback returns to the visible board; opening help, selecting another level, hiding the tab, or pressing the pause control stops it.

## Real level variety and proof

These are complete 18-occupied-cell Hua Rong Dao arrangements with two empty cells, not cosmetically relabeled versions of one puzzle. Every board has one 2×2 target, four 1×1 pieces, and five dominoes. The four domino mixtures are 1 vertical / 4 horizontal, 2/3, 3/2, and 4/1. All four shapes occur in every level.

`generate.cpp` enumerates **every legal goal configuration** for each mixture, then runs exhaustive multi-source reverse breadth-first search using legal any-distance straight slides. Identical rectangles are canonicalized by sorting their top-left positions within a shape. All edges have unit cost and every slide is reversible, so BFS distance to the closest goal proves the global optimum, rather than just the length of a random scramble. Saved parents form a legal winning witness for every selected start.

| Vertical / horizontal | Reachable canonical positions | Maximum optimal distance |
|---|---:|---:|
| 1 / 4 | 30,778 | 109 |
| 2 / 3 | 82,835 | 145 |
| 3 / 2 | 83,972 | 150 |
| 4 / 1 | 53,954 | 101 |

Total: **251,539** reachable positions. A deterministic selection spreads target depths across each family and maximizes minimum shape-layout distance among previous picks. The combined 50 starts are sorted by proven depth: **8–150 moves**, with 3,336 witness moves in total. Tier counts: 9 初陣, 10 佈陣, 14 深謀, 11 重圍, 6 絕境. No two are equivalent under same-shape piece relabeling or horizontal reflection; even the closest two starts differ in at least six board cells after reflection is considered.

Horizontal reflection is the goal-preserving nontrivial board symmetry. Vertical reflection and 180-degree rotation do not preserve the bottom exit and are not cosmetic symmetries of this task.

## Hint divergence safety

The current position is compared by shape-canonical key to every certified witness checkpoint. If it matches, the remaining witness works regardless of interchangeable piece labels. If it does not match, a clear confirmation explains that returning to the starting position clears this run's moves and undo history; cancel preserves everything. No arbitrary fallback move is called a solving hint. Restarting happens only after confirmation.

The pure engine also includes a complete forward BFS solver (`solve`). It distinguishes `solved`, `unsolvable`, `invalid`, and caller-imposed `limit`, and never reports “unsolvable” merely because a budget was exhausted. The UI uses instant preverified checkpoints rather than blocking the browser with a potentially large synchronous search.

## Progress and integrity

Storage key: `arcade-sliding-blocks-v1`. Local storage holds the currently selected level's exact board and undo history, the demonstration flag, and the best independently played winning witness for each cleared level. Switching levels starts the newly selected level at its beginning. Reloading restores the currently active level.

Loading validates every rectangle and every consecutive move starting from the actual certified level. Invalid or malformed saves fall back to a fresh level. Completion records are replayed and only accepted when the record's actual witness reaches the exit and its length matches the claimed best score. Demonstration wins do not unlock completion records. Hints may be used during an otherwise manual run. Storage errors are caught and disclosed; the game remains playable.

For hostile/corrupt storage protection, imports are limited to 5 MB and 10,000 moves per saved run/record. There is no in-memory undo cap. A run beyond the save-import guard still plays normally, but will not restore on a future reload.

## Files

- `../sliding-blocks.html`: accessible application shell, dialogs and rules
- `style.css`: responsive wood/jade board, distinct shape colors, reduced-motion support
- `app.js`: live controls, hints, list/playback, progress and validation
- `engine.js`: pure UMD game engine, canonicalization, state validation and complete BFS
- `levels.js`: browser-ready level data
- `levels.json`: equivalent machine-readable data and proof metadata
- `generate.cpp`, `build-levels.py`: deterministic full BFS generator
- `verify.py`: independent Python witness replay and symmetry-distinctness verification; imports neither the game engine nor generator
- `test.js`: engine regression suite and unbounded independent forward BFS of every published level
- `ui-test.js`: runs the actual shipped `app.js` through a deterministic DOM interaction harness
- `verification.json`: independent witness verification summary and SHA-256
- `optimality-verification.json`: all 50 independently proven forward-BFS minima, visited-state counts, winning-path replay results and the matching levels SHA-256

## Reproduce and test

From the arcade root:

```sh
python3 games/sliding-blocks/build-levels.py  # Requires a C++17 g++ compiler
python3 games/sliding-blocks/verify.py
node games/sliding-blocks/test.js
node games/sliding-blocks/ui-test.js
node --check games/sliding-blocks/app.js
node --check games/sliding-blocks/engine.js
```

Verified: independent Python replay of every intermediate cell for all 3,336 moves; all 50 wins; exact shape/mirror uniqueness; impossible-move rejection; crossing rejection; save/history integrity; complete no-solution search; explicit search-limit state. Independent JavaScript **forward** BFS now checks **all 50 published starts**, with no state budget and no use of the supplied witness or claimed distance to prune the search. The first goal removed from its breadth-first queue proves the exact shortest distance; its independently found path is also replayed to a win. Every result agrees with the C++ **reverse** BFS minimum. Per-level visited-state counts and exact distances are saved in `optimality-verification.json`, bound to `levels.json` by SHA-256. The hardest level has a 150-move minimum and its forward search visits 41,350 canonical states.

For one aggregate proof-and-UI check from the arcade root, run:

```sh
python3 games/sliding-blocks/verify.py && node games/sliding-blocks/test.js && node games/sliding-blocks/ui-test.js
```

The first command independently validates every witness and layout; the second independently establishes every displayed optimum; the third validates shipped UI interactions. Neither verifier substitutes generation metadata for these checks.

The actual app DOM harness exercises all 50 wins, unlimited undo, keyboard and pointer drag, list length, hint without auto-move, divergent-hint reset/cancel, playback interruption/navigation, demo scoring exclusion, restart confirmation/cancel, valid/corrupt restore, replay-validated 50-level completion records, and a storage-write error. This is state/interaction testing, not pixel rendering.

Browser visual QA was not performed in this worker because browser access was explicitly out of scope. Recommended publisher QA: desktop 1366×768, mobile 390×844 and 375×667; verify board/controls fit, modal scrolling, legal landing-marker taps, piece dragging and keyboard selection. Small/zoomed screens deliberately retain page scrolling rather than hiding controls.
