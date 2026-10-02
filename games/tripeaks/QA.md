# TriPeaks QA / certification

## Status and scope

- **PASS:** 50 actual shuffled standard deals, 50 full engine replays, 50 independent winning proofs
- **PASS:** 50 canonical rank layouts, distinct even modulo suit changes, circular rank relabeling/reversal and horizontal reflection
- **PASS:** 2,370 witness actions: 1,400 tableau removals, 970 stock draws; every witness reaches zero tableau cards
- **PASS:** deterministic generation reproduces `deals.js` byte for byte
- **PASS:** engine adversarial tests, all 2,420 witness checkpoints/undo prefixes and their winning continuations
- **PASS:** actual client handlers in a Node DOM-contract harness, including 50 wins, 50 selector buttons, undo/replay, confirmed/cancelled restart, safe hints after divergence, non-destructive full playback, timer pause, per-deal saves, reload, invalid saves and denied storage
- **NOT RUN by game builder:** actual browser rendering, touch hit testing, accessibility-tree/focus testing, screenshots, live deployment. The integration task owns live browser QA. The Node harness is explicitly not a layout/browser substitute.

## Route and controls

- Route: `games/tripeaks.html`; optional `?deal=1` … `?deal=50`
- Choose: HUD button `選牌局`, then 01–50; `✓` means completed, `•` means in progress
- `提示`: highlights a certified next move; repeated clicks do not consume cards
- `悔棋`: reverses one legal action, including draws, down to the initial state
- `完整解答與示範`: opens complete proof list; `在牌桌上播放（保留我的進度）` starts read-only playback; pause, single step, or return to the original game
- `重新開始`: asks before deleting that deal's current progress; same cards, fresh timer/history; collection retained
- `下一副`: chooses another unstarted/incomplete deal if available, otherwise cycles
- `大牌` / `縮小`: switches mobile-friendly wide card view; scroll horizontally, never a 28-card vertical stack
- `玩法`: detailed Traditional Chinese rules and verification links
- `D` draws; `U` undoes; `H` hints; arrows traverse exposed card buttons; Enter/Space activates
- Home link: `../index.html`

## Recommended live browser checks

1. Desktop around 1440×900 and 1366×768: board, piles, stats, primary controls visible together
2. Phone 390×844 and 360×740: no document-width overflow, ten-card bottom row remains a row, ranks readable; large-card mode scrolls the board horizontally
3. Load #1 and #50; ensure each starts with 28 cards, 10 exposed cards, 23 stock, one waste, 0 moves
4. Click an illegal face-up card; state unchanged and explanation visible. Covered cards must not reveal ranks or respond
5. At certified state use a hint; highlighted card/draw is legal. Take a different path; hint must ask before any rollback. Cancel preserves exact state
6. Draw until stock exhausted. Extra draw cannot occur. Undo restores stock and waste correctly
7. Open full solution and run/step to end. All 28 tableau cards disappear; exit restores the original player state and does not award a preview win
8. Make several moves, switch deals and switch back; then reload. Action history, elapsed time, assistance status and undo remain coherent
9. Confirm and cancel restart; close/Escape all dialogs; repeat hint/preview controls; background tab and reopen
10. Inspect console/network for missing files. No CDN/font/backend request is required
11. Keyboard focus remains visible. Covered cards are disabled; exposed card labels include location and rank. Dialog labels are present. Reduced-motion setting suppresses transitions

## Reproducible commands

From `arcade/`:

```sh
node --check games/tripeaks/engine.js
node --check games/tripeaks/session.js
node --check games/tripeaks/client.js
node games/tripeaks/test.cjs
node games/tripeaks/test-client.cjs
node games/tripeaks/verify-independent.cjs
node games/tripeaks/generate.cjs --check
```

## Data and proof format

`deals.js` is a static UMD data file, not a generated-at-playtime random board. Each deal contains:

- `id`: 1–50
- `seed`: deterministic actual shuffle seed
- `cards`: 52 unique integers 0–51. Rank is `card % 13 + 1`, suit is `floor(card / 13)`
- indices 0–27: tableau in top-to-bottom/left-to-right row order (3, 6, 9, 10)
- index 28: initial waste; indices 29–51: ordered one-pass stock
- `witness`: complete ordered legal actions; 0–27 removes that tableau card, −1 draws exactly the next stock card
- `searchNodes`: deterministic search work, not a player-difficulty score
- `rankHash`: SHA-256 of the suit-free raw rank layout

`certification.json` records every independently verified deal, total counts and stronger canonical-rank hashes.

## Generation and search

`generate.cjs` uses Mulberry32 and Fisher–Yates to permute every full standard deck. The deck is not edited to make a witness fit. DFS explores every legal exposed ±1 move and the draw branch. The memoization key contains remaining-tableau bitmask, next-stock index and waste rank; suits are irrelevant to legality. Edges always remove a tableau card or consume a stock card, so no state cycles are possible.

A successful witness is replayed through `engine.js` before inclusion. Unsolved capped searches are labelled `unknown` and discarded. Candidate 7319035 exceeded the 500,000-node cap; the data does not call it unsolvable. No probability estimate substitutes for a proof.

## Independent checker

`verify-independent.cjs` imports only the data. It derives tableau coordinates and overlapping blockers geometrically: a card in the next row, offset exactly half a column, covers the card above. It verifies:

1. Sorted deck equals 0…51: every standard card occurs once
2. Correct 3/6/9/10 layout, 18 cards each covered by two cards and 10 initial exposed cards
3. Every draw consumes the next stored stock card, once; at most 23 draws
4. Every removal uses a present, uncovered card exactly one rank away, including A–K
5. Every witness removes exactly all 28 tableau cards, with no actions after winning
6. Full rank layouts differ after minimizing across both board reflections, 13 cyclic rank shifts and two directions

The gameplay tests separately assert that engine positions and blocker lists equal this independent geometric construction. The same `engine.js` `step` function is called by human moves, saved-state replay, solution playback and engine proof replay.

## Storage and hint safety

Only bounded legal action histories are persisted. Every restored record is replayed on its exact seeded deck. Invalid records, unproven completion records, version mismatches and oversized data are ignored. Storage exceptions do not block playing. No API/backend is involved.

Certified checkpoints are indexed by remaining cards, stock cursor and waste rank. A different-suit waste of the same rank is equivalent because suits have no effect. Hints never claim all arbitrary player states are solvable. Off-route hints identify the closest earlier certified state in the player's legal action history and ask before rolling back; cancelling leaves the state untouched.

## Shipped files

Runtime: `../tripeaks.html`, `style.css`, `engine.js`, `deals.js`, `session.js`, `client.js`

Audit: `generate.cjs`, `verify-independent.cjs`, `test.cjs`, `test-client.cjs`, `certification.json`, `README.md`, `QA.md`
