# 點燈 Akari — 50 independently certified unique boards

Classic Akari rules: bulbs go on white cells and illuminate orthogonally until a black cell or edge. Every white cell must be lit. Two bulbs cannot see each other. A numbered black cell requires exactly that many orthogonally adjacent bulbs; an unnumbered black cell has no numerical requirement. Pencil crosses never block light.

## Genuine level differences
50 procedurally generated boards: 10 at 5×5, 10 at 6×6, 15 at 7×7, 15 at 8×8. Each has a distinct geometry/given pattern, even under the eight rotations/reflections. Number clues are greedily minimized while retaining uniqueness. Board size progresses; no unverified claim is made that solver search nodes equal human difficulty.

## Independent proofs
`generate.py` (seed 1783981) uses a white-cell cardinality constraint solver: at most one bulb per white segment, at least one illuminating bulb per white cell, and exact counts around numbered black cells. Generation solves up to two solutions and retains only unique boards.

`verify.py` is a separate implementation. It uses bitset illumination-cover branching on available bulbs that can light an unlit cell, with numbered-cell propagation. This independently enumerates up to two solutions, confirms there is exactly one, compares the full bulb set, separately validates every rule, and checks all eight board symmetries. `proof.json` stores all 50 results and independent search counts.

Files: `levels.json` and `levels.js` contain identical datasets. `engine.js` contains pure visibility/rules/state/undo code. `app.js`, `style.css`, and `../akari.html` are standalone, with no shared runtime or dependencies. `controller-tests.cjs` executes the actual UI controller using a tiny DOM harness (368 assertions); it is not a browser screenshot test.

Run:

```
python arcade/games/akari/generate.py
python arcade/games/akari/verify.py
node arcade/games/akari/controller-tests.cjs
```

Controls: `#level`, `#prev`, `#next`, `#undo`, `#reset`, `#hint`, `#solution`, `#modal`, `#cancel`, `#confirm`; white cells are `#board [data-cell="INDEX"]` with zero-based row-major indices. Click cycles empty → bulb → cross; Shift-click/right-click reverses. Arrow keys navigate white cells. Space/Enter cycles; B places a bulb, X marks a cross, Delete clears. Every edit has undo; reset asks first. Hints and answer views never edit the board or mark a level completed. Invalid save arrays, values, or history are rejected. Home link is `../index.html`.

Responsive layout targets 1180×757 desktop and narrow/mobile screens. Browser visual QA was not performed by this worker because the assigned environment explicitly prohibited browser work; parent publication QA owns screenshots and live browser checks.
