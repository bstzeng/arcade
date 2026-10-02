# 黑白平衡 · Unruly

50 standalone, uniquely solvable classic Unruly puzzles in Traditional Chinese. Fill every cell black or white. Each row and column must contain equal numbers of both colors, and no three consecutive orthogonal cells may share a color. Identical rows and columns are allowed. There is deliberately no all-different-row rule.

## Level set and certificates

- 5 boards at 4×4, 20 at 6×6, and 25 at 8×8
- All 50 clue patterns and all 50 completed solutions are distinct under the eight rotations/reflections and global black/white swapping
- `generate.py`, seed 551028, generates complete boards using balanced row domains and column count/triple checks. Clues are greedily removed while preserving uniqueness
- `verify.py` independently uses cell-domain propagation and backtracking. It enforces exact half counts and no-three constraints, enumerates up to two solutions, exhausts each unique search, compares the full solution, and separately validates every row and column
- An explicit repeated-row/column regression board is accepted by both verifier and engine tests
- `proof.json` has a top-level `levels` array. Each record has `id`, `solutions` (all 1), independent `nodes`, and `clues`. Top-level `canonicalDistinct` and `solutionCanonicalDistinct` are 50; `repeatedRowsAllowed` is true
- `levels.json` and `levels.js` contain identical data. Search counts are not used as claims about human difficulty

## Run validation

From the arcade directory:

```
python games/unruly/generate.py
python games/unruly/verify.py
node games/unruly/controller-tests.cjs
```

The controller suite executes the actual controller in a lightweight DOM harness. It covers all 50 engine wins and all 50 controller wins, repeated-row legality, fixed-clue protection, click/reverse-click cycles, keyboard input, navigation, undo, preview/hint non-mutation, restart confirmation and cancellation, stale confirmation dismissal, save/reload, malformed saves, and unavailable storage. This is logic/DOM coverage, not a browser rendering test.

## Controls and files

Click an editable cell to cycle empty → black → white → empty. Shift-click or right-click reverses the cycle. Arrow keys move focus; Space/Enter cycles; B sets black, W sets white, and Delete clears. Small filled dots identify fixed clues. Red cell outlines flag triples or excess color counts. Undo reverses every board edit. Restart asks first and preserves the original clues.

Hints reveal one correct cell without changing the board. The answer dialog is a noninteractive preview; it never completes the level or alters saved progress. Invalid marks, edited clues, or malformed history are rejected. Data is stored under `logic-unruly-v1` in localStorage.

Entry point: `../unruly.html`. Runtime files: `levels.js`, `engine.js`, `app.js`, `style.css`. No external dependencies. Layout targets a single desktop screen at 1180×757 and supports narrow touch screens.

UI selectors: `#level`, `#prev`, `#next`, `#undo`, `#reset`, `#hint`, `#solution`, `#modal`, `#cancel`, `#confirm`, and `#board [data-cell="INDEX"]` (zero-based row-major). Home links lead to `../index.html` from the HTML entry point.
