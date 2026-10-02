# Sokoban QA

Verified on 2026-10-02 in the task's Node 24 / Python 3.12 cloud workspace.

## Passed

- Independent Python rules replay: 50/50, 1,806 moves, 506 pushes
- 50 connected board layouts; proper borders, equal goals/boxes, unique player
- 50 different wall topologies modulo all rotations/reflections
- `levels.json` / `levels.js` consistency
- Generator rerun: exact byte-identical reproduction of both data files
- Real gameplay engine replay of every witness, checking counters on every move
- No false-positive deadlock detection on any certificate state
- Separate real-engine BFS solved all 50 initial boards (79,083 total visited states)
- Impossible wall movement, double-box push and invalid direction are no-ops
- Static dead square and dynamic 2×2 box-freeze detection
- Real move history `DRDLLL` in level 1 reaches a genuine dead end; hint rejects it, undo works
- 20 solvable off-witness current-state solutions, all replayed to win
- Undo after win, replay last move, reset, arbitrary valid saved prefix, restore validation
- Actual app script's 50 stage selections and all 50 UI victories
- Actual app script restart confirmation/cancel and repeated restart
- Actual app script off-path hint, solution dialog and current-state playback
- Pending hint invalidation on level change
- Playback cancellation by manual input, undo, level change and opening rules
- Keyboard movement, native select-key exclusion, keyboard after focused button
- Touch-swipe move and pointer cancellation
- Progress reload, corrupt save rejection and localStorage failure handling
- Demonstration-only wins excluded from completion/best records
- JS syntax checks

## Not run

- Browser rendering/screenshots: prohibited after blocked preview by the coordinating task
- Physical touch-device gestures or screen-reader software

DOM mocks do not establish visual correctness; no browser-visual pass is claimed.
