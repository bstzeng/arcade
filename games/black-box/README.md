# 棋盤雷射 / Black Box

Self-contained Traditional Chinese single-player deduction game. Entry: `../black-box.html`.
No network dependencies, packages, backend, fonts, or CDN. The home link is `../index.html` from the HTML entry. All 50 levels are immediately selectable.

## Rules and primary references

- [Simon Tatham's official Black Box manual](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/blackbox.html), inspected 2026-10-02
- [British Informatics Olympiad's official 1999 solution](https://olympiad.org.uk/papers/1999/bio/bio99r1s2.html), inspected 2026-10-02

The engine adopts the Tatham interpretation: direct hits have priority; a forward diagonal turns the ray away at its current position; two diagonals reverse direction. A diagonal encountered before entry is an immediate reflection. Otherwise the simulation continues after a turn/reversal, and only return to the actual entry port yields R. A different exit is a paired passage. We do not adopt the BIO worked example's early-stop shortcut for an internal reversal in complicated configurations. All movements are orthogonal; no diagonal ray travel or board wrapping. A repeated complete ray state is an error, never silently interpreted as reflection.

`fixtures.json` transcribes selected outcomes of the official manual's illustrated 8×8 configuration and includes simple hand-checked edge cases. The game uses original code and visual design; no assets or source code were copied from the references.

## Level proof and difficulty

50 levels in five groups of ten:

| Levels | Grid | Atoms | ALL candidate layouts enumerated per group |
|---|---|---|---|
| 1–10 | 4×4 | 2 | 120 |
| 11–20 | 4×4 | 3 | 560 |
| 21–30 | 5×5 | 3 | 2,300 |
| 31–40 | 5×5 | 4 | 12,650 |
| 41–50 | 6×6 | 4 | 58,905 |

For each group, generation enumerates every combination of k occupied cells. Each complete 4N-port observation signature is counted. A level is accepted only if precisely one same-count configuration has its complete signature. This is a uniqueness proof for the FULL boundary, not for the player's currently revealed subset. The UI and help explicitly make that distinction. There are 74,535 total candidate layouts; independent verification examines 1,723,600 rays and verifies reciprocity as well.

Rotations and reflections are canonicalized; no two included atom configurations are equivalent under D4. Within each group, ten increasing quantiles of a turn-count/interior-depth score are selected. Across groups, grid size and atom count increase. This is structural progression, not a claim that every adjacent level takes every human longer.

The independent verifier does not import `engine.js`, the generator, or their helpers. It uses a padded two-dimensional occupancy matrix, cardinal-direction indexing, and its own exhaustive combination enumeration. It checks each selected signature against all alternatives, including alternatives not selected for play. The shared inputs are level data and published rules. `verification-report.json` records all 50 independent counts.

## Controls and integrity

- Click/tap a boundary port to probe. H = absorption; R = return; matching numbers pair entry and exit. Already-known paired ports do not consume another probe.
- Interior cells toggle atoms or × exclusions. Right-click directly toggles exclusion. X switches tools. Tab and arrow keys reach controls; Enter/Space use native buttons.
- Check requires exactly the known atom count and the correct unique layout. Incorrect marked configurations never win, even if consistent with the currently probed subset.
- Unlimited ordinary undo within a validated 5,000-action safety budget; a new probe and a mark are both reversible. Prior knowledge cannot literally be forgotten, so this is a practice game, not a competitive scoring promise.
- Hint identifies a useful unprobed port without firing it. With the whole boundary known, it names one mismatched cell. Solution opens a separate view. Neither changes the player's atoms or completes the level; both mark assistance.
- Reset asks for confirmation. Switching levels saves and preserves each level independently.
- `arcade-black-box-v1` in localStorage contains only current selection and per-level action transcripts. On load every transcript is replayed and all win states recomputed. Untrusted win flags are ignored; malformed level records are isolated. Browser storage failure leaves the game playable and displays a warning.

## Reproduce and test

Run from the collection root (the parent of `games`):

```
node games/black-box/generate.cjs
node games/black-box/verify-independent.cjs
node games/black-box/test.cjs
node games/black-box/test-ui.cjs
```

No npm install required. Regeneration is deterministic and rewrites only this folder's level data. Tests cover official ray fixtures, head-on priority, internal and edge reflection, unique solutions, false marks, invalid transcripts, undo from wins, retained assistance, all 50 wins through actual client handlers, probe/mark/exclusion behavior, hint and solution non-mutation, reset cancel/accept, save/reload, corruption, forged wins, unavailable storage, keyboard navigation, and level-50 deep links.

`test-ui.cjs` is an event-driven DOM mock running the real app code. It does not claim browser layout or screenshot verification. Desktop CSS targets 1180×757, with a shrinking board to accommodate the win banner and mobile fallback below 650px. Actual browser visual QA remains the integrating publisher's responsibility.

## Shipping files

Runtime: `../black-box.html`, `style.css`, `engine.js`, `levels.js`, `app.js`.
Audit: `README.md`, `levels.json`, `fixtures.json`, `generate.cjs`, `verify-independent.cjs`, `test.cjs`, `test-ui.cjs`, and the three `*-report.json` files. No caches or binaries are required.
