# 戰艦定位 · Battleships

A self-contained Traditional Chinese, single-player logic puzzle with **50 genuinely distinct, uniquely solvable levels**. Entry point: `../battleships.html`. No backend, CDN, dependency, network request, random play-time generation, or build step.

## Complete rules

Place the displayed fleet with exactly its given lengths and multiplicities. Each ship is a contiguous horizontal or vertical straight line. Separate ships may not touch, including diagonally. Top/left clues count occupied cells in each column/row. Dot-marked given ship or water cells are fixed. The fleet, counts, fixed cells, straightness and no-contact rule all participate in the win checker; it is not reference-array equality. Unmarked water may remain undecided once all ships are correctly located.

Rules checked against the primary puzzle publisher:
- [Puzzle Battleships: rules and game](https://www.puzzle-battleships.com/)
- [Puzzle Battleships: FAQ](https://www.puzzle-battleships.com/faq.php)

## Level design and proof

Five ten-level chapters use 5×5, 6×6, 6×6, 7×7, and 8×8 boards. Fleets progress from `[3,2,1]` to `[4,3,2,2,1,1,1]`; no game rules are removed. Additional fixed ship/water cells are introduced only as needed for uniqueness and then reduced. Introductory levels retain a visible opening. Difficulty names describe fleet/board progression, not measured human times.

`generate.cjs` uses deterministic PRNG seed 2026100202 and independently places non-contacting fleets. The exact JavaScript solver enumerates row occupancy masks, enforces counts, straightness, diagonal separation, fixed cells and the fleet multiset, and stops after two solutions. Only exactly one is accepted. The solution is the occupied-cell pattern: identical ships never receive distinguishable labels. All eight dihedral transforms are canonicalized and excluded as duplicates.

`verify.py` independently places **whole ships** rather than enumerating rows. It tracks exclusion halos, line totals and fixed cells; identical ships are ordered to remove permutations, and final occupied patterns are deduplicated. It exhaustively counts up to two, directly validates every reference board against all rules, and independently checks canonical distinctness. It does not import or execute JavaScript.

## Commands

From `arcade/`:

```
node games/battleships/test.cjs
python games/battleships/verify.py
node games/battleships/generate.cjs  # exactly reproduce levels.json / levels.js / proof.json
```

`test.cjs` re-solves all 50 levels, tests ambiguous/impossible fixtures and illegal bent ships, and executes the real `app.js` controller with a minimal DOM contract harness. It wins all 50 through action handlers and tests immutable givens, selector, keyboard movement, cycle, undo, reset confirmation/cancel, contradiction repair hints, sticky assistance, complete/step/timed solution preview isolation, save/reload, corrupted saves, invalid completion rejection, unavailable storage and level deep links.

Reports: `proof.json`, `independent-proof.json`, `test-report.json`. The independent report records one occupied pattern per level. The controller report records 50 wins / 1,840 actions.

## Controls and persistence

Click an editable cell to cycle ship → water → undecided. Arrow keys select a cell; Enter/Space cycles; S places ship; W marks water; Delete clears; Z undoes; H hints. Fixed cells cannot be changed. All 50 levels are directly selectable. `?level=27` opens level 27.

Hints repair one incorrect existing mark first; otherwise they reveal one ship location before optional water. Assistance survives undo. Restart requires confirmation, clears the current attempt and preserves historical completion. Solution view and step/timed demonstration use separate state, do not overwrite the board and never award a win. The demo is labeled as answer reveal rather than a full reasoning explanation.

Storage key: `arcade-battleships-certified-v1`. Each level retains its state, bounded undo stack (200), moves and assisted flag. Loading validates all cells, fixed givens, matching puzzle fingerprints and completed boards against the full rule checker. Best unaided completion is retained. Corrupted records are skipped; storage refusal shows a notice and play continues.

## Files / QA boundary

- `engine.js`: UMD rule checker and exact row-mask solver
- `levels.json`, `levels.js`: reproducible 50-level dataset
- `generate.cjs`, `proof.json`: deterministic generation and enumeration report
- `verify.py`, `independent-proof.json`: independent whole-ship exact verification
- `session.js`: saved-state and completed-state validation
- `app.js`, `style.css`, `../battleships.html`: UI
- `test.cjs`, `test-report.json`: runtime/controller tests

Responsive CSS targets one-screen 1180×757 desktop and stacked mobile layouts. Native keyboard button semantics are retained. **A real-browser/layout test was not run in this worker**, per the integration constraint; DOM-contract coverage must not be described as visual browser QA. Hosted rendering is for the publication audit.
