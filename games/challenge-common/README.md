# Optional challenge lifecycle, version 1

This is shared infrastructure for new games only. It does not implement game rules, render a generic puzzle grid, generate content, choose AI moves, or certify a game's puzzle solutions. Each title retains its own mechanics, renderer, rule validation and verification.

## Browser use

Load `../challenge-common/core.js`, optionally `../challenge-common/ui.js` and `../challenge-common/style.css`, then your game-specific engine and app. All paths are relative to the game's HTML location; for `games/title.html`, the correct common reference is `./challenge-common/core.js`. For `games/title/index.html`, it is `../challenge-common/core.js`.

The core is also CommonJS-compatible: `require('../challenge-common/core.js')`.

```js
const controller = ArcadeChallenge.createController({
  gameId: 'my-game',
  revision: 'rules-1-content-1',
  levels, // [{ id: '001', title: '...', ...customPuzzleFields }]
  engine,
  // optional: storage, storageKey, historyLimit (default 100, cap 500)
});
const view = ArcadeChallenge.mountControls(document.querySelector('#challenge'), controller, {
  title: 'My game',
  render(snapshot, dispatch, board) { /* Game-specific rendering and inputs */ },
  getReplayActions(level) { return witnessesByLevelId[level.id].actions; },
  onError(message) { /* Optional game-specific error presentation */ },
});
```

`mountControls` is optional. Full multiplayer/live-action games can implement a separate controller, or use this lifecycle only for challenge mode. A family renderer must not substitute for genuinely different mechanics.

## Required engine adapter

- `createState(level) -> state`
- `validateState(level, state) -> boolean`
- `applyAction(level, state, action) -> newState`; reject illegal actions by throwing.
- `inspect(level, state) -> {status: 'playing'|'won'|'lost', goalMet: boolean, ...JSONDiagnostics}`. `goalMet` is true exactly when status is `won`. Completion must follow the rules and goal, never solely equality with the saved witness answer.
- Optional `hint(level, state) -> {text, action?, kind?} | null`. The action, when present, must be legal. A legal hint is not automatically a proven winning hint; classify it truthfully. Suggested `kind`: `verified-current-state`, `logical-deduction`, `reference-start-guide`, `legal-move-only`.

Engine input/output is finite, acyclic JSON data, without dates, maps, sets, functions, undefined values or special prototype keys. The core clones inputs and outputs and freezes copied levels. Level IDs are unique strings; generated levels may contain additional fields. Do not put hidden opponent information into the ordinary AI observation just because it is available inside challenge data.

`legalActions` and `canonicalKey` are useful engine methods for verification but not required by the lifecycle; continuous controls need not enumerate infinitely many inputs.

## Controller methods

- `snapshot()` returns cloned state, current level, level list, legal completion result, progress, assistance, storage warnings and optional replay metadata. Includes a monotonically increasing `sequence` for invalidating stale UI actions.
- `dispatch(action, {checkpoint = true, persist = true} = {}) -> {ok, inspection?, error?}` applies a legal action atomically. Frames can use both flags false and `flush()` at meaningful stops; game-specific simulation must still be deterministic.
- `select(levelId)`, `undo()`, `reset()`, `hint()` return an `{ok, ...}` result.
- `startReplay(actions)`, `stepReplay(count = 1)`, `stopReplay()` use a separate state. Replay never replaces the player's board or grants completion. Viewing the answer marks the current attempt assisted.
- `subscribe(fn)` calls the listener immediately and after changes; returns an unsubscribe function. The optional shell passes `(snapshot, dispatch, board)` to its renderer.
- `flush()` persists when available. `destroy()` flushes and removes listeners.

Reset starts a new attempt, clears its hint/replay assistance, and retains valid historical completion evidence. Later unassisted completion upgrades an assisted record. Undo does not erase assistance or historical completion. Saved completion flags alone are never trusted; a stored successful state is revalidated against the exact rules/content revision. A content revision mismatch starts fresh rather than applying incompatible state.

There is no cross-device sync or guarantee that local storage cannot be edited by its owner. Storage denial, quota failure and malformed data must leave the game playable. The saved JSON is limited to 8 MiB of string length. An unavailable save displays a warning. Infinite/endless free play should use game-specific save policy rather than repeatedly serializing large states every frame.

## Shared UI behavior

Controls provide 100-level selection when supplied, previous/next, undo, nondestructive hints, reset confirmation, per-step solution replay, progress and storage status. They do not auto-solve the player's board. Reset cancellation, Escape, double-click, navigation and external state changes invalidate pending destructive actions. Focus returns after dialog dismissal. There are no global game-key bindings; each renderer owns its accessible input design.

Do not use the helper's generic status text as a replacement for instructions, game-specific objective, rule variant, hidden-information explanation or proof claim. Add those in each game's HTML/renderer. Live modes must have pause/restart and fair controls in their own UI.

## Verification

From the expansion infrastructure root:

- `node tests/challenge-core.test.cjs`: 522 assertions, 100 lifecycle flows.
- `node tests/challenge-ui.test.cjs`: 36 simulated-DOM assertions.

These are model/controller tests, not real-browser visual QA or proof that any supplied game's 100 challenges are solvable. The final release separately runs every game's independent verifier and real-browser interaction checks.
