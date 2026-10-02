# 象棋 · Xiangqi

Entry: `../xiangqi.html`. Standalone Traditional Chinese static game. No dependencies, account, API, build step, or server beyond any ordinary static host. Assets are relative so subdirectory/GitHub Pages deployment works.

## Play

- Red moves first. Choose same-device two-player or computer play, with human red or black.
- Click/tap a piece then a highlighted destination. Arrow keys navigate intersections; Enter/Space activates the focused native button; Escape clears selection. Every intersection has a spoken coordinate/piece label. Your side is displayed at the bottom in computer mode.
- Standard nine-file, ten-rank Xiangqi with 32 starting pieces: palace restriction, river restriction, elephant eye, horse leg, cannon screen, flying generals, check and self-check prevention.
- Checkmate wins. **Stalemate is a loss for the side with no legal move.**
- This casual edition automatically draws at the third occurrence of the same board **and side to move**, or at 120 consecutive non-capturing plies (60 full turns). Mate/stalemate take priority. It does **not** implement tournament perpetual-check/perpetual-chase responsibility adjudication; the rules dialog explicitly says so.
- Local undo removes one ply. Computer undo returns to the human's previous decision point, including cancellation of a pending computer response. A black human cannot undo only the computer's initial move; restart is available instead.
- Restart and setting changes require confirmation. Cancel/Escape restores the displayed current settings.

## Computer

`ai.js` uses iterative-deepening negamax/alpha-beta with capture ordering and material/advancement evaluation. Actual search profiles: easy depth 1 / 100 ms / 3,000 nodes; normal depth 2 / 550 ms / 20,000 nodes; hard depth 4 / 1,800 ms / 80,000 nodes. Search may finish at a shallower depth under budget. Not tournament-strength or perfect play.

Search runs only in `worker.js`. Main-thread input remains responsive. Restart, settings and undo terminate the worker; monotonically increasing request IDs reject stale results. Every worker move is rechecked for legality. Errors, malformed moves and the 6.5-second watchdog expose a retry control without making an unverified move.

## Persistence

`arcade.xiangqi.v1` in localStorage contains only versioned settings and move pairs. Loading starts from the canonical initial position and legally replays every move; arbitrary board snapshots are never trusted. Size and move-count bounds reject oversized data. Invalid/unreadable saves recover to a fresh game with a notice. Storage-write failure leaves play usable and displays a warning. Saves stay on this browser; no cloud sync.

## Files and verification

- `engine.js`: pure rules and terminal-state functions (browser + CommonJS).
- `session.js`: replay-validated persistence and turn-aware undo.
- `ai.js`, `worker.js`: bounded search and isolated execution.
- `app.js`, `style.css`: responsive UI and controller.
- `rules-tests.cjs`: rule fixtures, persistence, computer legality and self-play.
- `controller-tests.cjs`: executes the actual app and worker in controlled VM environments; covers interruptions, rejected/stale results, settings, saves, undo and restart.
- `test.cjs`: runs both suites and writes `verification.json`.

Run from any working directory with Node 18+:

    node games/xiangqi/test.cjs

No package install is required. VM controller tests verify state transitions and actual controller code, not browser layout. Live browser/visual QA is a separate release check handled by the parent integration task. No 50-level count applies to this open-ended board game.
