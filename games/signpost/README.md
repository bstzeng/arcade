# 箭頭接龍 · Signpost

50 fixed, independently verified unique puzzles. Each cell receives a different number from 1 through the cell count. The arrow in cell k must point toward cell k+1 along one of the eight straight directions. The next cell may be any distance along that ray: it is not required to be adjacent. The star is the last cell. Printed numbers are fixed clues.

## Content and diversity

12 boards at 4×4, 20 at 5×5, and 18 at 6×6. Every solution has long jumps. The complete ordinal placements differ even after all eight square rotations/reflections and reversal of the ordinal path. Levels are arranged by board size; solver node counts are not presented as a measurement of human difficulty.

`levels.json` and `levels.js` contain the same data: `id`, `size`, `arrows` (clockwise from north, -1 for the end), row-major `givens` (0 means empty), `solution`, `tier`, and generation `proof`.

## Generation and exact verification

`generate.py` uses seed 9257102. It constructs full paths in the eight-direction ray graph, then greedily removes clues while retaining a single complete path. Its exact search follows the ordinal path and checks future-clue reachability. A budget-exhausted trial simply keeps its clue; a final successful exact count is required for every exported level.

`verify.py` is separately implemented. It treats each ordinal position as a variable whose domain is the set of candidate cells, propagates successor/predecessor arcs and all-different constraints, and exhaustively branches until completion or a second solution. It does not import the generator or trust its proof. It compares the resulting full solution, validates every arrow, checks fixed clues, and rejects equivalent solutions. `verification-report.json` records `levels: 50`, `uniqueLevels: 50`, `canonicalDistinctSolutions: 50`, a SHA-256 of the dataset, and a `results` array containing `id`, `solutionCount`, `nodes`, and `givens`.

`solver-tests.py` compares the independent solver against literal permutation enumeration over 324 tiny directed boards, plus dedicated ambiguity and non-adjacent-jump fixtures. `solver-test-report.json` records all 326 comparisons.

## Run

From the repository root:

```sh
python3 games/signpost/generate.py
python3 games/signpost/verify.py
python3 games/signpost/solver-tests.py
node games/signpost/controller-tests.cjs
```

No runtime package, build step, network API, or external font is needed. Serve the repository with `python3 -m http.server 8080` and open `games/signpost.html`.

## Controls and persistence

Choose a number in the picker or input, then click a cell. After filling a number, the picker advances to the next missing number. 0 selects the eraser. Right-click or Delete clears an editable cell. Arrow keys move focus; Enter/Space fills the selected number. Number keys support multi-digit input. Fixed clues cannot be edited. The blue ray highlights possible targets of the selected cell's arrow.

Undo preserves full prior boards. Restart requires confirmation and supports Cancel/Escape. Navigating to another level dismisses pending confirmation. A hint names the correct value in one empty or mistaken cell using the certified unique answer; it does not alter the board. The answer dialog is a read-only preview and never grants completion. A win is computed from the actual game rules, not equality to the stored solution.

Browser storage key: `arcade-signpost-v1`. Selected level, boards, and bounded undo histories are saved. Invalid records are discarded; unavailable storage does not prevent play. Completion marks reflect currently solved boards. Progress is local to the browser.

## Regression and responsive design

`controller-tests.cjs` executes the shipped JavaScript and HTML IDs through a deterministic DOM/event harness. Its 1,091 assertions cover all 50 wins, incorrect values, immutable clues, numeric and pointer entry, keyboard focus, erase, undo, reload, blocked/corrupt storage, level boundaries, nondestructive hints/preview, restart cancellation, Escape, repeated confirmation, and stale modal callbacks. `controller-test-report.json` records the results. These are logic/controller tests, not browser-rendering evidence.

The desktop layout targets 1180×757 with the board, number input, and all four action buttons visible in the main panel. The mobile layout keeps touch-sized primary controls with the board and stacks the supplementary number picker and rules below. Main DOM IDs: `level`, `prev`, `next`, `number`, `erase`, `board`, `undo`, `reset`, `hint`, `solution`, `modal`, `cancel`, `confirm`. Cells use row-major `data-cell` indexes.
