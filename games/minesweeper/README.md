# 踩地雷 / Certified no-guess Minesweeper

Self-contained Traditional Chinese game. Entry point: `../minesweeper.html`; home link: `../../index.html`. No dependencies, backend, external fonts, network, or shared runtime files.

## 50 distinct progressive boards

Exactly 50 boards: ten each of 6×6, 7×7, 8×8, 9×9 and 10×10. Mine counts rise through 5–8, 8–11, 12–15, 17–20 and 22–25. The first ten use only direct deductions; every board in levels 31–50 requires subset subtraction in the recorded proof. Canonical mine-mask comparison rejects rotation/reflection duplicates even when the opening differs.

Every board has a **fixed, displayed, guaranteed-safe zero opening** in `start`. The UI requires this first click. Mines are never relocated, including after an incorrect guess or restart. All safe cells must be revealed to win; flags are optional. Wrong flags can cause a chord loss. Loss supports undo and confirmed restart.

## What “no guess” means here

A board is accepted only if a public-information solver can classify **every cell** after the designated opening. Uniqueness of mine placement alone is not accepted as a certificate.

Allowed inference:

1. For a revealed number, subtract adjacent mines already logically proven; its other adjacent cells are a constraint.
2. If a constraint's remaining mine count is zero, every cell in it is safe.
3. If the count equals the number of cells, every cell in it is a mine.
4. If constraint A's cells are a strict subset of B's cells, subtract both sets and mine counts; apply rules 2–3 to the difference.
5. The entire unrevealed board with total mines minus proven mines is another constraint, so the published total mine count can participate.

The initial opening is the only stipulated safe fact. Every subsequent safe cell or mine has a recorded inference reason. The trace reveals one safe cell at a time; UI zero-flood can expose more safe information sooner without invalidating any inference.

### Separation of answer and deduction

`generate.py` samples layouts using a seeded RNG. Its `deduce(width, height, total, revealed, flags)` accepts **no mine layout**. The game host reveals an actual number only after the solver selects a logically safe cell. Rejection sampling candidate layouts is generation, not answer-aware play.

`engine.js` exposes `deduction` and `logicalHint` with only board dimensions, total mine count, revealed numbers and flags. A runtime hint does **not trust player flags**: it derives certain mines internally from the revealed numbers, then recommends/executes a safe reveal or a proven flag. Hidden answers are used only by ordinary game reveal rules and the separate, explicitly labeled full-board preview, never to choose an inference action. Hints never consult the stored proof/solution to pick a cell.

## Proof files and independent replay

- `levels.json` / `levels.js`: 50 layouts, fixed starts, full trace and rule counts.
- The full traces contain **3,300 cell classifications**. Each action identifies a direct source or two subset sources; each revealed cell includes its resulting number.
- `verify.py`: standalone implementation with no generator or game-engine imports. It reconstructs each premise using only information available before that step, checks entailment first, then checks board truth and the newly disclosed number. It verifies all 50 complete certificates, exact mine totals, zero openings, canonical nonduplicates and three negative tampering controls.
- `verification.json`: dataset checksum, complete per-level replay results, safe/mine totals, technique counts and negative-control result.
- `generation.log`: deterministic generation attempt counts and technique totals.

Run:

```
python games/minesweeper/verify.py
node games/minesweeper/test.cjs
node games/minesweeper/test-ui.cjs
```

Regenerate with `python games/minesweeper/generate.py`; rerun all checks after changes.

## Gameplay, saves and QA

- Reveal mode, flag mode, right-click flag, touch long-press flag; clicking a revealed number chords when adjacent flag count matches. Incorrect flags do not get answer-aware protection.
- Arrows move focus; Enter/Space activate the selected cell in the current mode; F flags; C chords; Ctrl/Command Z undoes. Accessible labels state coordinates, revealed numbers and flags.
- Undo includes direct mine losses and incorrect-flag chord losses. Reset needs confirmation. 50-level selector, next, help, progress stars and timer. Answer preview is non-destructive and never counts as a win.
- `arcade-minesweeper-v1` local save validates boolean arrays, sizes, revealed-safe consistency, fixed start, explosion state, moves and history. Corrupt/blocked saves fall back safely; storage failure is visibly reported.
- `test.cjs` completes all 50 with **public-only runtime hints**, tests hint input purity, opening enforcement, zero flood, flags, 50 successful chords, 50 incorrect-flag chord losses, direct loss, wins and invalid saves.
- `test-ui.cjs` is a controller/DOM harness rather than visual browser QA. It covers all 50 preview/restore, hint wins, undo, reset cancellation, help, save/reload, history restoration, keyboard, touch long press, right-click, flag mode, losses and malformed/blocked storage.
- Designed for 1180×757 desktop and responsive touch widths. DOM tests do not replace visual browser QA. Inspect the published game at desktop and 390px mobile widths.
- Live selectors: `#level`, `#board [data-cell]`, `.cell.start`, `#revealMode`, `#flagMode`, `#hint`, `#undo`, `#restart`, `#confirmDialog`, `#cancelConfirm`, `#acceptConfirm`, `#solution`, `#exitPreview`, `#help`, `#closeHelp`, `#next`.
- Debug API: `window.MinesweeperGame` exposes `getState()`, `getLevel()`, `load(index)`, `act(type, cell)`, `hint()`, `undo()`, `isPreview()`.
