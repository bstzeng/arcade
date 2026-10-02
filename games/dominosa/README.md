# 多米諾配對 · Dominosa

50 standalone, uniquely solvable Dominosa puzzles in Traditional Chinese. Partition every cell into orthogonally adjacent dominoes. Every unordered pair from the full double-N set must appear exactly once; reversing a domino does not make a new pair.

## Level set and certificates

- 10 double-2 boards (3×4), 10 double-3 (4×5), 15 double-4 (5×6), and 15 double-5 (6×7)
- All 50 boards are distinct under rotations, reflections, and arbitrary digit permutations, checked by normalizing first-seen labels in all eight orientations
- `generate.py`, seed 620241, builds random tilings, assigns complete standard sets, then enumerates with cell-MRV search and pair-use constraints
- `verify.py` independently constructs exact-cover rows for adjacent cell pairs and uses Algorithm X over cell and domino-type columns. It enumerates up to two solutions, exhausts the search for every unique board, compares the complete answer, and validates the standard set
- `proof.json` has a top-level `levels` array. Each record contains `id`, `solutions` (all 1), and independent `nodes`. The top-level `canonicalDistinct` is 50
- `levels.json` and `levels.js` contain the same dataset. Search counts are not presented as human difficulty ratings

## Run validation

From the arcade directory:

```
python games/dominosa/generate.py
python games/dominosa/verify.py
node games/dominosa/controller-tests.cjs
```

The controller suite executes the actual controller in a lightweight DOM harness. It covers all 50 engine wins and all 50 controller wins, tile removal, undo, keyboard navigation, level navigation, preview/hint non-mutation, restart confirmation and cancellation, stale confirmation dismissal, save/reload, malformed saves, and unavailable storage. This is logic/DOM coverage, not a browser rendering test.

## Controls and files

Click two neighboring cells to join them. Click the same two cells again to separate them. Delete or right-click removes the clicked tile. Arrow keys move focus; Space/Enter selects a cell; Escape cancels selection. A green outline is a paired domino. Red outlines and red inventory entries identify repeated types. Undo reverses every board edit. Restart asks for confirmation.

Hints reveal one true connection without changing the board. The answer dialog is a noninteractive preview; it never marks the level complete or changes saved progress. Invalid, asymmetric, non-adjacent, or malformed saved links/history are rejected. Data is stored under `logic-dominosa-v1` in localStorage.

Entry point: `../dominosa.html`. Runtime files: `levels.js`, `engine.js`, `app.js`, `style.css`. No external dependencies. Layout targets a single desktop screen at 1180×757 and supports narrow touch screens.

UI selectors: `#level`, `#prev`, `#next`, `#undo`, `#reset`, `#hint`, `#solution`, `#modal`, `#cancel`, `#confirm`, and `#board [data-cell="INDEX"]` (zero-based row-major). `#inventory` shows the entire current standard set. Home links lead to `../index.html` from the HTML entry point.
