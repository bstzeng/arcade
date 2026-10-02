# 十五數字 — Sliding Numbers

Dependency-free, client-only Traditional Chinese sliding-number puzzle. Entry point: `../fifteen-puzzle.html`. Its home link is `../index.html` relative to the HTML entry point.

## Rules

A move slides exactly one numbered tile horizontally or vertically into its adjacent blank. No diagonal moves, wrapping, multi-tile moves, or tile swaps. The canonical goal is ascending row-major numbers, with the blank at bottom right. Keyboard arrows move the blank in the named direction; clicking/tapping moves the selected adjacent tile.

## Fifty actual puzzles

- Levels 1–20: 3×3 boards with exact shortest distances 6–25, one at every distance
- Levels 21–50: standard 4×4 boards with legal reverse-scramble witnesses of 14–72 steps, increasing by two
- All 50 starting boards are different and all have proper solvability parity
- The complete 3×3 reverse BFS enumerates all 181,440 reachable boards. An independent Python BFS re-proves every claimed optimum
- For 4×4, `optimal: null` is deliberate: these are **reference solution lengths, not optimal distances**. Each board also reports its Manhattan lower bound. No optimality or exact human difficulty claim is made
- The deterministic generator only makes legal moves from the goal and excludes repeated states within each 4×4 scramble. It never blindly shuffles tiles

## Hints and preview

Hints never change the board. If the current board appears on the saved witness, use its certified suffix. Otherwise reverse the player's legal transcript to the original position, append the witness, and remove cycles. The result is a valid current-position route; the interface explicitly labels this fallback “返回參考路線” and says it is not a shortest-path guarantee. This avoids unbounded searches and invented hints, including after very long detours.

Solution observation is a separate, temporary board. It supports pause, speed changes and return. It does not mutate player moves, time, or state; it cannot award a completion. The demo explicitly states this. A hint or observation does mark the current run assisted. Switching to the background stops observation and returns to the saved player state.

## Persistence and controls

- 50-level selector, next, undo, confirmed restart and confirmed departure from unfinished games
- Local-only storage key `arcade.fifteen-puzzle.v1`
- Restored current games are replayed from the immutable initial fixture; malformed or illegal moves are rejected
- Completion records include winning transcripts and must legally replay to the goal before being accepted
- Best records prioritize unassisted play, then moves, then seconds
- Time pauses in the background, help/confirmation dialogs, previews and completed boards
- Storage failures leave the game playable and clearly show that saving is unavailable
- Keyboard, touch, focus retention, live status messages, labelled controls, responsive 3×3/4×4 board
- Desktop layout is a single viewport at 1180×757; short/zoomed/mobile screens use document flow, with no overflow clipping on mobile

## Files

`engine.js`: pure rule/route API. `levels.json`: fixtures plus complete witnesses. `levels.js`: browser fixtures. `generate.cjs`: deterministic generator. `session.js`: save validation and winning records. `app.js`: UI state and event handlers. `style.css`: responsive interface. `test.cjs`: pure engine/session regression tests. `test-ui.cjs`: real client handlers in a minimal deterministic DOM harness. `verify-independent.py`: independent rule, parity, witness and optimum checker. `certification.json`: its machine-readable result.

## Reproduction and verification

Run from the repository root:

```sh
node games/fifteen-puzzle/generate.cjs
node games/fifteen-puzzle/test.cjs
node games/fifteen-puzzle/test-ui.cjs
python games/fifteen-puzzle/verify-independent.py
```

The UI harness completes all 50 boards with their real click handlers (1,600 moves total), checks invalid actions and keyboard control, confirms undo/reload and completion proof validation, and exercises off-path hints, non-destructive demonstrations, pause/stop/speed changes, interrupted navigation and failed/corrupted storage.

Independent verifier passed all 50 witnesses and all claimed 3×3 optima. The DOM harness verifies application event handlers, not browser rendering or visual layout. Browser visual QA has not been performed.

## Live smoke selectors

`#level` (values `0`–`49`), `#board`, `[data-tile="N"]`, `#moves`, `#hint`, `#solution`, `#pause`, `#stop`, `#speed`, `#undo`, `#restart`, `#confirmDialog`, `#acceptConfirm`, `#cancelConfirm`, `#help`, `#closeHelp`, `#win`, `#status`, `#home`.
