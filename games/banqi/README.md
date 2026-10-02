# 暗棋 / Banqi

Dependency-free Traditional Chinese game at `../banqi.html`. Serve the repository over HTTP; no build step, account, backend, external library, online model, or API key is required.

## Play

- Same-device two-player or computer opponent, with selectable first/second seat.
- The first flip assigns that piece's color to the first player. Seat choice does not guarantee a color.
- 4 rows × 8 columns, 32 shuffled face-down pieces. Every turn is one flip or one move/capture.
- Orthogonal one-square moves. General > advisor > elephant > rook > horse > cannon > soldier, with equal-rank capture allowed. Soldier captures general; general cannot capture soldier.
- Cannon is the exception: it moves one square to an empty cell, but captures only by jumping exactly one occupied square along a row or column. The screen may be hidden or either color; the enemy target must be face up. Cannon may capture any rank but cannot capture adjacent pieces.
- No legal action loses. Losing every piece loses. Three repetitions of the same public position including turn/color assignment, or 80 consecutive plies without a flip or capture, draws. There is no separate perpetual-chase adjudication.

Click/tap to flip or select/move. Arrow keys navigate the board; Enter/Space activate, Escape clears selection, Ctrl/Command+Z undoes. Native dialogs have keyboard dismissal. Legal-target hints can be switched off. Screen-reader labels expose only revealed identities.

## Fair-information AI

The real shuffled board exists only in the game controller. `session.js` calls `engine.publicView(state)` before worker transmission. Covered squares become `{up:false}`. The remaining pool is derived only from the initial public inventory minus revealed and captured pieces. No initial shuffle seed, replay, hidden identity, or hidden-derived metadata is sent to the worker. The search seed depends only on the public ply count and a constant.

`ai.js` sanitizes its input again, then samples full hypothetical arrangements without replacement from the publicly remaining pool. Each hypothetical arrangement is consistent throughout its own search and reused across candidate comparisons. These arrangements are unrelated to the real concealed layout. Future flips are stochastic via this bounded determinization, not perfect-information knowledge of the actual board. This is a practical sampled opponent, not an optimal imperfect-information solver.

- Easy: weighted random legal moves, with a modest capture preference; no tree search.
- Normal: up to 10 root candidates, 3 independent public-pool samples, 2 plies, beam 6, node ceiling 3,000.
- Hard: up to 14 root candidates, 5 samples, 3 plies, beam 7, node ceiling 12,000.

All levels are local and deterministic for a fixed public observation and search seed. Hard has a larger computation budget but does not guarantee better play in every position or a forced win. A six-second worker watchdog, construction/runtime/message-error handling, and legal-response validation fall back to an easy public-information move. Reset/undo/exit terminates pending workers and invalidates stale replies.

## Persistence and undo

`arcade.banqi.v1` stores the initial shuffle seed, settings and action replay in localStorage. Restore reconstructs every state through the rules engine and validates all actions, bounds, version and settings; saved board/result assertions are not trusted. This is local convenience storage, not tamper-proof competitive security: a person inspecting developer tools could reconstruct the shuffle. The AI never receives this seed.

Local undo rewinds one action. AI undo rewinds to before the user's latest action, including the AI response when present. AI's opening flip alone cannot be undone. Undo during search cancels it. Replaying from the same seed preserves the exact hidden arrangement, so undo does not reroll a flip. Humans may remember a previously seen piece. Restart and configuration changes require confirmation and clear the replay. Storage failure does not block play.

## Verification

Run from any directory:

```sh
node games/banqi/test.cjs
```

Or separately run `rules-tests.cjs` and `controller-tests.cjs`. The combined runner checks JS syntax and writes timestamped `verification.json` with SHA-256 hashes.

Rule/AI tests cover all 49 adjacent rank pairs, cannon screens/directions, color assignment, legal flip/move handling, immutability, elimination/stalemate, both draw mechanisms, full inventory conservation, safe hidden-piece getters, identical public positions with different secret layouts, deterministic fixed-seed decisions, worker contracts, and six complete all-level self-play games.

Controller tests execute the actual session and actual app.js inside a minimal DOM VM. They cover local and AI undo, first/second seats, replay reload and rejection, storage denial, restart/settings confirmations and cancellation, keyboard controls, hidden-information DOM labels, stale results, repeated start, invalid worker replies, constructor/runtime/message errors, timeout fallback, and cleanup. These are controller tests, not a substitute for real-browser rendering checks. The parent integration reports desktop/mobile browser QA separately.
