# 麻將接龍 / Mahjong Solitaire

A dependency-free Traditional Chinese game with 50 fixed layered layouts. Open `../mahjong-solitaire.html` through any static HTTP server. Progress stays in this browser; no account or server is required.

## Rules and controls

Remove two identical free tiles. A tile is free only when no tile on any higher layer overlaps its footprint and at least one horizontal side has no touching tile on the same layer. Vertical neighbors do not block a side. Each face appears two or four times. There are no flower/season wildcard matches. Clear every tile to win.

Click/tap two free tiles; click the selected tile again to cancel. Keyboard Tab/Enter selects a tile; arrow keys move focus, Escape clears selection. Undo is unlimited. Restart and changing an unfinished level require confirmation. Completed records survive undo and restart.

Hints search the current position for a complete route before calling a pair safe. If the search proves a dead end, the UI asks the player to undo. If its node budget is exceeded, it labels any highlighted pair as only legal, not proven winning. The guarantee applies to the initial level, not all player choices. Solution playback replays the original certified route on a separate board with pause, single-step and stop; it preserves player state and does not award completion. Using hints/playback marks this attempt assisted.

## Level construction and proof

`generate.py` uses seed 2601002. It builds 50 genuinely different 2–4-layer, supported layouts and removes arbitrary accessible pairs, retrying any geometrically stuck order. Faces are then assigned along the successful legal removal order, with at most four copies of each of the 34 faces. The result is a construction witness, not an assertion that arbitrary shuffles are solvable. Size/layers loosely group progression; no exact difficulty or shortest-path claim is made.

`levels.json` is the data source. Each level has `id`, `name`, `tiles` (`id,x,y,z,face`), `layers`, and `solution` (ordered pairs of tile IDs). Every tile occupies a 2×2 footprint in layer coordinates; the visual layer offset is decorative only. `levels.js` exposes the same data to a static browser page.

`verify-independent.py` imports neither the generator nor JavaScript engine. It checks dimensions, support, same-layer disjointness, face multiplicities, every removal's full geometric accessibility, matching faces, and empty final state. It deduplicates geometry under all eight planar rotations/reflections and translation without using tile labels. It also rejects tampered witnesses and tests partial-cover/side-blocker edge cases. `certification.json` contains `count: 50`, `uniqueLayouts: 50`, and 50 `levels` rows.

## Reproduce and verify

From the repository root:

```sh
python3 games/mahjong-solitaire/generate.py
python3 games/mahjong-solitaire/verify-independent.py
node games/mahjong-solitaire/controller-tests.cjs
node --check games/mahjong-solitaire/app.js
```

The generator is deterministic and overwrites only its own `levels.json`/`levels.js`. The independent verifier writes `certification.json`. Python 3 and Node 18+ suffice; no packages are needed.

Controller tests execute the actual UI handlers in a simulated DOM: all 50 manual witness completions; illegal selections; repeat clicks; keyboard; safe hint behavior; preview/pause/step/stop; undo; saved-game reload; proof-validated records; corrupt/disabled storage; canceled/confirmed navigation; and timers paused by dialogs/background. These are logic/DOM checks, not a replacement for visual browser testing.
