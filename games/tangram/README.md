# 七巧板 / Tangram

A dependency-free Traditional Chinese tangram game with 50 distinct solvable silhouettes. Open `../tangram.html` through a static server. Seven standard pieces are used on every level, with area ratio **4:4:2:1:1:2:2**: two large triangles, one medium triangle, two small triangles, one square and one parallelogram.

## Play

Select a piece in the tray, then click/tap the silhouette, or drag a piece into position. Existing placed pieces can be selected and moved. Rotate by 45° in either direction or flip a piece. The orange cross shows the piece's local origin. Position snaps to a half-unit grid; shape containment and overlap are checked geometrically.

Keyboard: 1–7 select a piece, arrow keys move its preview by half a unit, Q/E rotate, F flips, Enter places, Delete/Backspace returns it to the tray, and Escape deselects. Controls and the board are keyboard accessible. Moving/rotating a preview does not change a placed piece until placement is confirmed. Rejected placements leave the previous position intact.

Any arrangement of the seven standard pieces that exactly covers the silhouette without overlap is accepted, including alternative decompositions and interchanging equal-sized triangles. The game does not compare the player's placement list against one fixed answer. Every legal piece is contained in the target, pieces are pairwise disjoint, and the sum of their areas equals the target's area; consequently seven valid pieces cover the entire target.

Hints show a reference piece in dashed outline without placing it. They disclose when that reference conflicts with the current arrangement. Solution playback starts a separate board, supports pause/single-step/stop, and never awards a completion or changes player moves/time. Undo, confirmed restart/level switch and proof-validated local saves are included. Assisted attempts are labeled.

## Generation and certification

`generate.py` is deterministic from seed 2601002. It attaches standard pieces along positive-length boundary segments, rejecting intersections, holes and disconnected boundaries. The 50 silhouettes have genuinely different geometry; translation, the four right-angle rotations and mirror images are canonicalized away. Levels are roughly ordered by bounding-box area, not a claimed exact difficulty rating. The supplied witnesses use the integer-lattice orientations; the runtime also allows 45° rotations and half-unit translations and checks them by the same geometric rules.

`levels.json` stores `id`, `name`, `target` (seven non-overlapping convex polygons forming the silhouette), `boundary`, `width`, `height`, `seed`, and `solution` (seven `{i,p}` placements; `p` has `x,y,r,f`). `r` is a count of clockwise 45° turns and `f` reflects the local x coordinate. Coordinates are in standard units: large triangles have legs 4; total silhouette area is 32. The renderer fills the target polygons without internal seams and draws only its exterior boundary. `levels.js` contains identical browser data.

`verify-independent.py` imports neither generator nor engine. It reconstructs each standard shape independently, uses exact rational polygon clipping to certify area, containment and absence of overlap, checks a connected simple silhouette boundary, and deduplicates silhouettes using exact equal-area lattice-triangle occupancy under all eight planar symmetries. It rejects tampered witnesses. `certification.json` has `count: 50`, `uniqueSilhouettes: 50` and 50 `levels` rows. Multiple solutions are allowed; uniqueness is not claimed.

## Reproduce and test

From the repository root:

```sh
python3 games/tangram/generate.py
python3 games/tangram/verify-independent.py
node games/tangram/controller-tests.cjs
node --check games/tangram/app.js
```

Python 3 and Node 18+ are sufficient; no packages are needed. Runtime clipping uses a 1e-6 area tolerance only for floating-point rotations. The independent certification of the supplied integer witnesses uses exact Fractions.

The DOM tests execute actual rotate/flip/click handlers for all 350 witness placements across 50 levels. They also cover alternate solutions by swapping equal triangles, 45° shape-area preservation, rejected geometry, keyboard transforms, undo/reload, corrupted and unavailable storage, validated completion records, restart/navigation confirmation, and non-destructive preview/pause/step/stop. DOM simulation verifies behavior but does not certify browser rendering or physical touch interaction.
