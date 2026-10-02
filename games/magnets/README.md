# 磁鐵棋 · Magnets

A self-contained Traditional Chinese, single-player logic puzzle with **50 genuinely distinct, uniquely solvable levels**. Entry point: `../magnets.html`. No backend, CDN, dependency, network request, random play-time generation, or build step.

## Complete rules

Every outlined domino must be either `(+,-)`, `(-,+)`, or neutral `(×,×)`. Blank is undecided. Identical non-neutral poles may not touch orthogonally, including across different dominoes. Diagonal contact is permitted. Plus counts appear on the top/left and minus counts on the bottom/right; a dot denotes an omitted clue. Every shown count must hold. A win requires every domino to be decided and every rule satisfied; it is not a reference-array equality test.

Rules checked against the primary author's instructions:
- [Simon Tatham: Magnets manual](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/magnets.html)
- [Simon Tatham: playable Magnets and rules](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/js/magnets.html)

## Level design and proof

Five ten-level chapters use 5×6, 6×6, 7×6, 7×8, and 8×8 boards. Domino partitions are independently randomized via legal 2×2 flips. All levels include both magnets and neutral dominoes; later chapters omit up to eight side clues while preserving uniqueness. Difficulty labels describe this progression rather than measured human solving times.

`generate.cjs` uses a deterministic PRNG (seed 2026100201). A full-rule constraint solver propagates adjacency and row/column contribution bounds, branches over actual domino states, and enumerates up to two complete solutions. Only a count of exactly one is accepted. All eight rectangular dihedral transformations and a global +/− exchange are canonicalized using the final cell pattern. Thus even an alternate tiling of the same cosmetic pattern is excluded from the 50.

`verify.py` is an independently implemented Python verifier. It directly checks the domino partition and every rule, enumerates legal **row patterns**, checks vertical domino continuity and line totals, counts up to two, and independently checks canonical distinctness. It does not import or execute the JavaScript engine or generator. This is a second algorithm, not reference-solution comparison.

## Commands

From `arcade/`:

```
node games/magnets/test.cjs
python games/magnets/verify.py
node games/magnets/generate.cjs  # exactly reproduce levels.json / levels.js / proof.json
```

`test.cjs` re-solves all 50 puzzles, tests truly ambiguous and impossible fixtures, rejects illegal same-pole contacts, and executes the real `app.js` controller using a minimal DOM contract harness. It wins all 50 through actual action handlers and tests selector, keyboard movement, cycle, undo, reset confirmation/cancel, contradiction repair hints, sticky assisted flag, complete/step/timed solution preview isolation, save/reload, corrupted saves, invalid completion rejection, unavailable storage, and level deep links.

Reports: `proof.json`, `independent-proof.json`, `test-report.json`. The independent report records one solution for every level. The controller report records 50 wins / 1,140 actions.

## Controls and persistence

Click either end to cycle that whole domino: positive at the clicked end → negative there → neutral → undecided. Arrow keys select a cell; Enter/Space cycles; P/+ and M/− place a pole at the selected end; N marks neutral; Delete clears; Z undoes; H hints. All 50 levels are directly selectable. `?level=27` opens level 27.

Hints first repair one incorrect decided domino, then reveal an undecided one. Assistance survives undo. Restart requires confirmation and begins a fresh attempt while preserving completed records. Solution view and stepped/timed demonstration use separate state and never mutate the player's board or award completion; the demo is explicitly described as answer reveal, not a logical explanation.

Storage key: `arcade-magnets-certified-v1`. Each level keeps its validated state, bounded undo stack (200 entries), move count and assistance flag. Completed records carry the actual board and puzzle fingerprint and are accepted on reload only after full-rule validation. Best unaided completion is retained. Storage failures are visible and do not prevent play.

## Files / QA boundary

- `engine.js`: UMD rule checker and exact runtime/generation solver
- `levels.json`, `levels.js`: reproducible 50-level dataset
- `generate.cjs`, `proof.json`: deterministic generation and enumeration report
- `verify.py`, `independent-proof.json`: independent exact verification
- `session.js`: structural and completed-state validation
- `app.js`, `style.css`, `../magnets.html`: game UI
- `test.cjs`, `test-report.json`: runtime/controller tests

Responsive CSS targets a one-screen 1180×757 desktop and a stacked mobile layout. Keyboard/native button semantics are retained. **A real-browser/layout test was not run in this worker**, per the integration constraint; the DOM harness is not a screenshot or browser rendering test. Hosted visual QA belongs to the publication audit.
