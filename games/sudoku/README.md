# 數獨 / Sudoku

Self-contained Traditional Chinese game. Entry point: `../sudoku.html`; home link: `../../index.html`. No packages, network, backend, fonts, or shared runtime files required.

## Content and actual rules

- Exactly 50 canonical-distinct puzzles: levels 1–10 use a 4×4 board with **2×2 square boxes**, levels 11–50 use a 9×9 board with **3×3 square boxes**.
- Every row, column and box contains the whole 1–N alphabet once. Given clues are immutable. Completion checks the rules rather than merely comparing arrays.
- Progressive bands: 4×4 with 10→6 givens; 9×9 with 45→43, 38→36, 32→30, and 27→25 givens. 47 boards can be completed with naked/hidden singles; three expert boards require stronger reasoning.
- `generate.py` uses a fixed random seed, randomized independent solution seeds, clue deletion guarded by exhaustive uniqueness search, and canonical rejection.
- Canonical clue-mask normalization ignores digit identity and enumerates every column permutation within stacks, stack permutation, transpose, row permutation within bands and band permutation. Rotations and reflections are included in this group. Distinct canonical masks rule out cosmetic digit relabeling and all these geometric reskins, conservatively rejecting identical masks even when digits differ.

## Verification and proof artifacts

- `levels.json` and its browser mirror `levels.js` contain clues, solution, canonical mask, and a recorded naked/hidden single trace.
- `verify.py` is an independent implementation. It does **not** import `generate.py` or `engine.js`. A bitset MRV exhaustive search counts solutions up to two, validates all fixed clues, confirms the stored solution, replays the simple logical trace, and independently recomputes the symmetry key.
- `verification.json` includes the final dataset SHA-256 and one result per level. All 50 have exactly one solution and a distinct canonical key.
- Basic hints inspect the user's current entries and use only naked singles or hidden singles. User entries are assumptions; a hint warns to check earlier inputs. If neither technique applies, it says so. It does not silently read the reference solution. The separate, clearly labeled solution preview shows the answer.

Run from the arcade root or repository root, adjusting paths as needed:

```
python games/sudoku/verify.py
node games/sudoku/test.cjs
node games/sudoku/test-ui.cjs
```

Reproduce the committed data with `python games/sudoku/generate.py`, then rerun verification.

## Controls, state and QA

- Mouse/touch: pick a cell, use the number pad; notes toggle; erase; undo; confirmed restart; 50-level selector; next level; help dialog; non-destructive answer preview.
- Keyboard: arrows move selected cell; 1–N enters; N toggles notes; Backspace/Delete/0 erases; Ctrl/Command Z undoes. The grid is a roving-tabstop control, with per-cell accessible labels.
- Local save key `arcade-sudoku-v1`. Loaded states are validated for length, integer range, unchanged givens, notes, step counter and bounded history. Malformed/blocked saves fall back safely and show a storage warning. Completion stars survive undo/restart. Preview does not alter state, history, wins, or the local solution.
- `test.cjs`: all 50 rule-valid completions, candidate hint correctness, immutable clues, note toggle, erase, conflicts, malformed save rejection.
- `test-ui.cjs`: lightweight controller/DOM harness, not a rendering browser. All 50 selector loads, wins, undo, preview preservation, reset cancellation, help, save/reload, persisted undo, keyboard, invalid/blocked storage, and last-level boundary.
- UI targets: 1180×757 desktop and narrow touch screens. DOM tests do not replace visual browser QA. Inspect the published page at desktop and 390px mobile widths.
- Live QA selectors: `#level`, `#board [data-cell]`, `#pad [data-value]`, `#notes`, `#erase`, `#hint`, `#undo`, `#restart`, `#confirmDialog`, `#cancelConfirm`, `#acceptConfirm`, `#solution`, `#exitPreview`, `#help`, `#closeHelp`, `#next`.
- Dev-only read/control surface: `window.SudokuGame` offers `getState()`, `getLevel()`, `load(index)`, `input(value)`, `undo()`, `isPreview()`. No network or secret data is involved.
