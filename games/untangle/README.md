# 解開繩結 · Untangle

A standalone Traditional Chinese planar-graph puzzle with 50 distinct certified solvable levels. Open `../untangle.html` from the game directory, or `/games/untangle.html` on the hosted arcade.

## Rules and controls

Drag numbered nodes until no edges cross. Edges may share a graph endpoint. Overlapping nodes, a node sitting on an unrelated edge, and overlapping edges do not count as a solution. Any valid planar arrangement wins; the supplied reference embedding is not the only accepted answer.

Each released drag is one undoable move. Pointer cancellation, lost pointer capture, Escape and page hiding abandon an unfinished drag without changing saved history. Keyboard: Tab selects a node, arrow keys move one board unit, and Shift+arrow moves five. Touch uses a stable board-level pointer capture and larger transparent node hit areas. Positions stay within the board.

The chooser saves each level independently. Restart requires confirmation; Cancel does not change progress. Earned completions survive undo and restart. Stored actions and completion witnesses are replayed and validated on load; unavailable storage is nonfatal.

Hints display one reference target as a dashed circle without changing node positions. They explicitly do not promise to reduce intersections on every intermediate move. The isolated solution viewer shows the starting graph moving node-by-node into the reference embedding, with previous/next, autoplay, pause and replay. Viewing never changes the live board or awards a completion. Closing or hiding the page cancels playback.

## Distinct graphs and independent proof

There are five levels each at 6 through 15 nodes, with 6–23 edges and varying graph density. Every `(node count, edge count)` pair is different, which proves all 50 graphs are pairwise non-isomorphic, not merely rearrangements of one graph. Every graph is connected. Initial layouts have 2–69 genuine crossings. Board complexity grows through node count and density; strictly increasing human difficulty is not claimed.

`generate.py` uses deterministic seed `61492026`. It samples separated planar points, greedily builds noncrossing straight-line edges, then retains a connected spanning tree plus additional edges. Nodes are shuffled onto circular starting positions that have genuine crossings. Reference embeddings have extra clearance.

`verify.py` is a separate implementation with its own determinant/closed-segment intersection tests and point-to-segment distance calculation; it imports neither generator nor JavaScript engine. It checks legal edges, connectivity, pairwise non-isomorphism by graph order/size, starting crossings and every solution's geometry. `certification.json` contains `count`, `allSolved`, `nonIsomorphicGraphCount`, and 50 `rows` including `initialCrossings`, `solutionCrossings`, `degenerateConflicts`, `connected` and `solved`.

The play engine rejects node centers less than 5.5 board units apart and unrelated nodes within 1.2 units of a segment. Closed intersections detect crossings and collinear contacts. Shared-endpoint edge overlap is rejected through the node/segment test.

## Reproduce and test

Run from the arcade root:

```
python games/untangle/generate.py
python games/untangle/verify.py
node games/untangle/controller-tests.cjs
```

All tools use only built-in Python/Node libraries. `levels.json` and `levels.js` agree exactly. The actual-controller DOM suite has 274 assertions and plays all 50 reference paths through drag handlers (525 moves). It also tests pointer cancellation/wrong pointer IDs/Escape, keyboard movement and bounds, all intersection/degeneracy cases, save restoration, invalid records, undo, restart cancellation, isolated previews, autoplay cancellation, hint safety and unavailable storage. This is a logic/controller test, not a browser rendering test.

Responsive CSS targets a single-screen board and controls at 1180×757 and narrow touch screens. The SVG remains a square within the available play area; complete rules are in the help dialog.

## Browser QA selectors

`#level`, `#prev`, `#next`, `#undo`, `#reset`, `#hint`, `#solution`, `#help`, `#modal`, `#cancel`, `#confirm`; draggable SVG groups are `#board [data-node="INDEX"]` with zero-based node IDs. Coordinates are percentages of the square board. Preview controls are `#demoPrev`, `#demoNext`, `#demoPlay`, `#demoCount`. Live state uses local-storage key `arcade.untangle.v1`.
