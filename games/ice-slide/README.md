# 冰面滑行棋 / Polar Paths

A dependency-free, offline-capable Traditional Chinese sliding-robot puzzle game.
Entry point: `../ice-slide.html`. All assets are local files. No network, backend,
build step, analytics or third-party dependencies are needed. The home link is
`../index.html` relative to the HTML entry point.

## Play

Choose one of three colored and numbered robots. Each move slides in a straight
line until the board boundary, an ice-rock cell or another robot stops it. Robots
cannot push one another. Only the designated robot stopping exactly on its colored
ring completes the puzzle; passing through the target does not count. The two
other robots are movable blockers. No-op moves are ignored and do not count.

- Select: tap a robot, its colored button, or press 1 / 2 / 3
- Slide: arrow keys, WASD, the direction pad, or swipe on the board
- Undo: Z or 悔棋; restart: R or 重來; hint: H or 一步提示
- All 50 levels are available in 選關
- Hints and full solutions are searched from the **current** position, including
  after deviating from a stored solution. Stale asynchronous results are ignored.
- Full solution playback can be stopped by normal controls, changing level,
  opening help, leaving the window, or the stop button
- Completion and unassisted personal-best move counts use guarded localStorage
  under `arcade.ice-slide.v1`. Corrupt, incompatible or denied storage never blocks
  gameplay. Assisted completion does not overwrite an unassisted best. Restart
  begins a new unassisted attempt; undo does not erase assistance already used.

## Fifty genuinely different puzzles

`levels.json` contains 50 puzzles, 50 witnesses and proof metadata. `levels.js`
is the same data in a classic-script wrapper so opening the HTML directly does not
require a fetch. Board sizes progress from 6×6 to 7×7 to 8×8; certified shortest
witness lengths progress nondecreasingly from 4 to 14 slides, totaling 445 slides.
There are 10 stages of 5 puzzles. Difficulty grouping uses board size and proven
solution length; it is not a claim that every player experiences the same order.

Every level has all of these properties:

1. Its legal solution is produced by breadth-first search, rather than a random
   unverified shuffle or a claimed path through obstacles
2. Its target is interior and has four open neighboring cells. A wall or the edge
   cannot stop the target robot on that cell; another robot must provide the stop
3. An exhaustive search with both helper robots held at their starting positions
   cannot solve it. At least one helper therefore **must be moved**
4. Its witness moves at least two robots and includes robot-to-robot stopping
5. Its board topology differs from every other level, even after any of the eight
   square rotations/reflections
6. Its full puzzle canonical identity is unique under the same symmetries and
   color permutations. Canonicalization marks the target robot by role, and treats
   the two non-target colors as exchangeable

The UI calls routes "可行路線" and personal records "個人最佳"; it makes no
unsupported optimality claims. The shortest-distance proofs are retained for
verification and progression design.

## Reproduce and test

Requires Node.js 18+ and no installed packages. From this directory:

```sh
node generate.cjs
node verify-independent.cjs
node test.cjs
node test-controller.cjs
```

Or from the arcade root:

```sh
node games/ice-slide/generate.cjs
node games/ice-slide/verify-independent.cjs
node games/ice-slide/test.cjs
node games/ice-slide/test-controller.cjs
```

Generation uses the fixed xorshift seed `0x1ce2026`, finds the same 50 levels in
125 attempts, and writes `levels.json` and `levels.js`. It enumerates reachable
states with BFS and records legal predecessor witnesses. Regeneration is
byte-for-byte reproducible with the documented runtime.

`verify-independent.cjs` does **not** import the game engine or generator. It
builds its own directional rays and integer-state BFS to check every witness,
independently prove every shortest distance, reject goal-only solutions, verify
robot blocking, verify the difficulty ordering, and reject duplicates under
symmetry and equivalent color permutations. It writes `proof-report.json`,
including the SHA-256 of the exact JSON file certified.

`test.cjs` imports the **actual engine used by the web page** and:

- Solves all 50 levels using all 445 witness moves
- Undoes and reapplies every move, then checks restart and post-win locking
- Deliberately makes a different first move in all 50 levels, searches the new
  position and plays the resulting route to completion
- Verifies invalid moves/no-ops, impossible and bounded searches, and bad saves
- Confirms the browser's `levels.js` exactly matches the certified JSON

`test-controller.cjs` executes the actual page controller in a small no-package
DOM contract harness. It completes all 50 levels through the same button handlers
as the interface and checks selection, keyboard movement, touch swipes, saved
bests, undo/restart, off-path hints, solution playback, cancellation, stale worker
replies and modal interruption. This is controller testing, **not browser or
visual QA**. Browser preview was explicitly unavailable for this task and was not
used; actual canvas rendering/layout has not been visually verified.

## File map

- `engine.js`: shared pure transition engine, session/history and BFS solver
- `app.js`: canvas UI, controls, responsive sizing and guarded persistence
- `style.css`: responsive single-screen desktop/mobile layout; short viewports
  regain scrolling rather than hide required controls
- `worker.js`: off-main-thread current-state solver, with a main-thread fallback
  when a browser's local-file policy prevents workers
- `generate.cjs`: deterministic puzzle construction and predecessor witnesses
- `verify-independent.cjs`: independent legality, shortest-distance and uniqueness
  proof checker
- `levels.json`, `levels.js`, `proof-report.json`: level and certification data
- `test.cjs`, `test-controller.cjs`: engine and interface-controller regression tests
- `generation.log`, `verification.log`, `test.log`: captured successful checks

## Implementation notes

The rendered layout uses a high-contrast dark shell and icy light board. Each
robot is distinguished by color **and** number. Buttons, keyboard focus rings,
modal focus handling, a live status area and a descriptive board aria-label are
included. The touch direction pad stays available on small screens. For very
short/zoomed viewports the page may scroll intentionally.

State space has at most 64³ integer combinations and three robots; the runtime
search limit of 300,000 exceeds that full theoretical space for every shipped
board. Impossible and bounded-search results are still handled distinctly.
