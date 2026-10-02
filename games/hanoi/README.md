# 河內塔 — Tower of Hanoi

Dependency-free, client-only Traditional Chinese game. Entry point: `../hanoi.html`. Its home link is `../index.html` relative to the HTML entry point.

## Rules and representation

There are exactly three pegs. Disc ranks run from 1 (smallest) to n (largest), with exactly one disc of each rank. `start[rank-1]` gives its peg: 0=A, 1=B, 2=C. Discs on each peg are always stacked smaller above larger. A legal action removes one top disc and places it on an empty peg or a larger top disc. Buried discs, multi-disc moves, and placing large on small are rejected. The goal is every disc on the specified target, C.

Click/tap a source peg then destination. Keys 1/2/3 select A/B/C, Escape cancels, left/right move focus, and Enter/Space selects a focused peg.

## Fifty actual layouts

There are 3–8 discs: respectively 5, 7, 8, 9, 10, 11 levels.

- Six classic full-tower starts, one per disc count, with minima 7, 15, 31, 63, 127, 255
- Forty-four legal intermediate layouts, explicitly called **布局挑戰** in the UI
- All 50 layouts are distinct even if every peg label is arbitrarily permuted. The target is ignored for this stronger uniqueness check, so changing only the goal or peg names cannot create a “new” level
- Chapter layouts progress by exact shortest distance. Disc count increases between chapters. This is not a claim that mathematical distance equals human difficulty
- Every fixture has its complete witness and exact `optimal` length; the range is 2–255 moves

## Exact solver and independent proof

The engine performs complete reverse BFS from the target over all 3^n legal states, at most 6,561 for eight discs. All state assignments correspond to legal sorted stacks. The graph is connected and all edges are reversible legal moves.

A separate Python verifier, which reads only JSON and never imports the engine, constructs explicit stacks, independently enumerates all 9,828 states across sizes 3–8, verifies every witness step and goal, checks all optimum claims, and excludes peg-relabel-equivalent layouts. Its full machine-readable result is `certification.json`.

Hints recompute an exact shortest route from the **current** layout, so a detour never causes a stale or illegal hint. They mark the moving top disc and destination without moving anything.

## Non-destructive demonstration

“觀摩解答” starts from the player's current state but uses a separate display board. It can pause, change speed, or return at any time. It never changes player moves, state or time and never awards a completion. It is clearly labelled as an observation. Viewing a hint or solution marks the active run assisted. Going into the background stops observation and restores the original player board.

## Persistence and interface

- 50-level selector, next, unlimited undo, confirmed restart/departure for unfinished games
- Local-only key `arcade.hanoi.v1`; invalid or impossible saved transcripts are rejected
- Winning records carry their full transcript and are replay-validated before loading
- Best results prioritize unassisted play, then moves, then time
- Time pauses in background, help/confirmation dialogs, previews and wins
- Storage failure is nonfatal and is explained in the UI
- Numbered/color-coded discs, labelled pegs, keyboard focus retention, touch controls and live status
- Single-screen desktop layout at 1180×757 with responsive mobile document flow

## Files and tests

`engine.js` contains pure rules and exact BFS. `levels.json` / `levels.js` contain the 50 starts and full solutions. `generate.cjs` generates deterministic, canonical-unique fixtures. `session.js` validates storage and completion proofs. `app.js` drives the UI. `style.css` styles it. `test.cjs` checks rules, state graph, every witness action and inverse, hints after detours, and saves. `test-ui.cjs` executes actual app handlers with a deterministic minimal DOM. `verify-independent.py` separately certifies all mathematical claims.

Run from the repository root:

```sh
node games/hanoi/generate.cjs
node games/hanoi/test.cjs
node games/hanoi/test-ui.cjs
python games/hanoi/verify-independent.py
```

The UI harness completes every level through actual source/destination clicks (3,238 legal moves), verifies preservation of original games during demonstration, and covers pause/stop/speed, off-path hints, save/reload, proof rejection, confirm/cancel, keyboard focus, timing, background interruptions and unavailable storage.

All listed checks passed. The DOM harness verifies application event handlers, not browser rendering or visual layout. Browser visual QA has not been performed.

## Live smoke selectors

`#level` (values `0`–`49`), `#board`, `[data-peg="0"]` / `1` / `2`, `#moves`, `#hint`, `#solution`, `#pause`, `#stop`, `#speed`, `#undo`, `#restart`, `#confirmDialog`, `#acceptConfirm`, `#cancelConfirm`, `#help`, `#closeHelp`, `#win`, `#status`, `#home`.
