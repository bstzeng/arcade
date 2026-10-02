# 數字分區 · Fillomino

50 fixed, independently verified unique puzzles using full classic Fillomino rules. Fill every cell with a positive number. Each orthogonally connected component of equal numbers must contain exactly that many cells. Equal-size regions may not touch along an edge, because adjacent equal digits form one component. A region may have several matching clues or no clues at all.

## Content and diversity

12 boards at 4×4, 20 at 5×5, and 18 at 6×6. All 50 complete solutions differ under the eight rotations/reflections. 37 levels contain at least one region with no initial clue. Digit values encode the region sizes and cannot be freely relabeled. Levels progress by board size, without claiming that solver nodes measure human difficulty.

`levels.json` and `levels.js` contain identical row-major `givens` and `solution` arrays plus `id`, `size`, `tier`, and generation `proof`. 0 denotes an empty cell. The interface allows any number from 1 through the total cell count, including numbers that are not among the initial clues.

## Generation and unrestricted exact verification

`generate.py` uses seed 4029255. It generates connected partitions, merges adjacent equal-size regions, then removes clues while retaining uniqueness. Its exact region-cover search enumerates connected candidate regions, checks all givens, covers the board without overlaps, and forbids adjacent chosen regions of the same size.

Crucially, the search also includes regions without clues. A region with no clue must lie inside a connected component of initially blank cells. Therefore its size can be no greater than the largest such component. A region with a clue has the value of that clue. The union of those possibilities is a complete upper bound on every possible region size; it is not an extra game restriction. This dataset keeps initial blank components at five cells or fewer for tractable generation, while considering every legal clue-free size.

`verify.py` is independent and does not import the generator. It assigns cell-value domains, propagates connected-component size and reachability constraints, and exhaustively branches to find all solutions up to the second. Its initial domains include every possible clue-free region size, even values absent from the clues. It checks the exact resulting solution and all clue and component rules, then deduplicates square symmetries. `verification-report.json` contains `levels: 50`, `uniqueLevels: 50`, `canonicalDistinctSolutions: 50`, `cluelessRegionsAllowed: true`, `levelsWithCluelessRegions: 37`, the dataset SHA-256, and `results` rows with `id`, `solutionCount`, `nodes`, and `completeValueDomain`.

`solver-tests.py` compares the independent verifier to brute-force enumeration of every complete 2×2 assignment for all 625 possible clue patterns (digits 0 through 4). This explicitly includes entirely clue-free boards and regions whose digit appears nowhere among the clues. The report is `solver-test-report.json`.

## Run

From the repository root:

```sh
python3 games/fillomino/generate.py
python3 games/fillomino/verify.py
python3 games/fillomino/solver-tests.py
node games/fillomino/controller-tests.cjs
```

No runtime dependency or build step. Serve the repository with `python3 -m http.server 8080`, then open `games/fillomino.html`.

## Controls and persistence

Select a number, then click cells to fill them. The same selected number remains active for painting several cells. The input allows all values from 1 through the total cell count; 0 is the eraser. Right-click/Delete erases. Arrow keys move focus, Enter/Space fills, and typing digits supports multi-digit numbers. Fixed clues are bold with a small dot. Matching adjacent digits automatically share a region; colors are visual aids, not rules. Red frames show overfull regions.

Undo restores the previous board. Restart asks for confirmation and supports Cancel/Escape. Navigation clears pending dialogs. Hints identify a correct value in an empty or incorrect cell using the independently certified unique solution; they do not alter the board. Answer previews preserve the board and do not award completion. The win checker checks actual component sizes and clues, including clue-free regions, rather than matching a stored solution.

The browser-local `arcade-fillomino-v1` save holds selected level, boards, and bounded undo histories. Invalid boards/history are rejected. Storage errors do not prevent play. Completion marks correspond to currently solved boards. Progress does not sync between devices.

## Regression and responsive design

`controller-tests.cjs` executes the shipped scripts with a deterministic DOM/event harness. Its 1,092 assertions cover all 50 full controller wins, wrong value recovery, immutable clues, picker/pointer/keyboard input, multi-digit entry, focus, erase, undo, reload, blocked/corrupt storage, level boundaries, nondestructive hints/preview, reset Cancel/Escape, repeated confirmation, and stale modal callbacks. `controller-test-report.json` contains the report. DOM tests are not a substitute for browser-rendering QA.

The desktop layout targets 1180×757 with board, input, and all action buttons in view. Mobile stacks the supplementary number picker and rules below the touch-friendly board panel. Main DOM IDs: `level`, `prev`, `next`, `number`, `erase`, `board`, `undo`, `reset`, `hint`, `solution`, `modal`, `cancel`, `confirm`; row-major cells use `data-cell`.
