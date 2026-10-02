# 同色消除 · SameGame

A standalone Traditional Chinese SameGame puzzle with 50 certified clearable levels. Open `../samegame.html` from the game directory, or `/games/samegame.html` on the hosted arcade.

## Rules and controls

Click a group of at least two orthogonally connected matching tiles. Remaining tiles fall vertically, then completely empty columns close toward the left. Clear every tile to win; singletons cannot be removed. Color is reinforced with four distinct symbols. Arrow keys move keyboard focus; Enter or Space removes the focused group.

The level chooser preserves each level's progress. Undo restores the previous legal position. Restart requires confirmation and Cancel leaves the board intact. Earned completion records remain after undo or restart. Saves contain action histories, and both the current history and any completion certificate are replayed and validated when loaded. Corrupt records are rejected; unavailable local storage does not prevent play.

Hints never move a tile. If the current board matches the certified path, the next certified group is highlighted. Otherwise a bounded exhaustive search is used. A hint is shown only after a complete legal continuation to an empty board has been found. If exhaustive search proves the position impossible, the message suggests undo; a search limit is explicitly reported without falsely claiming the board is impossible. The isolated solution viewer starts from the original board and provides previous/next, autoplay, pause and replay. Closing it or hiding the page cancels pending playback; it never awards completion or changes live actions.

## Level variety and certification

The levels progress from 5×5 to 8×7, with three colors in levels 1–38 and four colors in levels 39–50. All 50 board patterns are distinct after color-name normalization and horizontal reflection; they are not palette swaps. Certificates contain 4–22 legal removals, totaling 520 removals across the collection. Dimensions and color count provide progression; optimality, unique solutions and strictly increasing human difficulty are not claimed.

`generate.cjs` uses deterministic seed `0x51A6E202`, independently samples board layouts, and retains only boards with a complete DFS clearing witness. `verify.py` is an independent Python implementation using a two-dimensional flood fill, gravity, and column reconstruction; it does not import the generator or JavaScript engine. It verifies each action, full clearance, tile accounting, and canonical layout distinctness. `certification.json` contains `count`, `allSolved`, `distinctModuloColorNamesAndHorizontalReflection`, and 50 `rows` with per-level results.

## Reproduce and test

Run from the arcade root:

```
node games/samegame/generate.cjs
python games/samegame/verify.py
node games/samegame/controller-tests.cjs
```

The generator and verifier require only built-in Node/Python libraries. `levels.json` and `levels.js` are identical datasets in two loading formats. `engine.js` exports pure state transitions for Node and a browser global. The controller suite runs actual event handlers in an event-driven DOM harness: 273 assertions, all 50 winning click sequences, non-destructive hints/previews, autoplay cancellation, undo, reset cancellation, level persistence, keyboard use, corrupted records, certified completion validation and unavailable storage. This is a logic/controller test, not a browser rendering test.

Responsive CSS targets a single-screen board and controls at 1180×757 and narrow touch screens. The board adapts to the play area's remaining height. Rules are also available in the help dialog.

## Browser QA selectors

`#level`, `#prev`, `#next`, `#undo`, `#reset`, `#hint`, `#solution`, `#help`, `#modal`, `#cancel`, `#confirm`; tiles are `#board [data-cell="INDEX"]` with row-major indices. Preview controls are `#demoPrev`, `#demoNext`, `#demoPlay`, `#demoCount`. Live state uses the local-storage key `arcade.samegame.v1`.
