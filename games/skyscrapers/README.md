# 天際線 / Skyscrapers

Self-contained Traditional Chinese single-player city-height puzzle. Entry: `../skyscrapers.html`.
No network dependencies, packages, backend, fonts, or CDN. The entry's home link is `../index.html`. All 50 levels are immediately selectable.

## Rules and primary reference

[Simon Tatham's official Towers/Skyscrapers manual](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/towers.html), inspected 2026-10-02.

Each row and column contains every height 1…N exactly once. A side clue counts record-breaking heights seen inward from that side: a taller building obscures shorter buildings behind it. Zero in stored clues, displayed as a dot, means no clue. Fixed interior heights must be preserved. Top/bottom clues are ordered left to right; left/right clues top to bottom. Both directions have explicit visibility fixtures. Original implementation and visual design.

## 50 unique levels

- 1–10: 4×4, full or nearly full sightlines, several fixed heights
- 11–20: 4×4, fewer sightlines and fewer fixed heights
- 21–30: 5×5 with introductory givens
- 31–40: 5×5 with sparse sightlines
- 41–50: 6×6

A deterministic seeded Latin-square backtracker creates complete boards. All four side counts are calculated. Fixed heights are added if needed for uniqueness. Clues and excess givens are removed only while complete search still returns exactly one solution. Each group is ordered by a structural/search score. This is progressive board size and clue scarcity, not a human-calibrated strict difficulty ranking.

The generator/runtime solver chooses complete row permutations, checks column uniqueness incrementally, and rejects incompatible sightlines. The independent verifier never imports that engine: it builds both row and column permutation domains, propagates crossing-cell support to a fixed point, then branches on the smallest remaining line domain. Both count up to two; returning exactly one requires completing the remaining exhaustive search. They agree on the unique complete solution for all 50 levels. An empty 4×4 returns two, and contradictory givens return zero in both solvers, guarding against accidental always-one validators.

All solutions are canonicalized under the eight square rotations/reflections. No duplicate canonical answer boards appear. `verification-report.json` contains one independent count per level; `levels.json` contains the generation-side proof counts. The level data includes answers for deterministic local validation; this is an offline puzzle, not a secrecy/security mechanism.

## Interaction and saving

- Click/tap a cell, then a height button or number key. Arrow keys move within the grid. Delete, Backspace, or zero clears a value.
- N toggles candidate notes. Notes are separate from values and never satisfy a rule. Given cells remain immutable.
- Check marks duplicate values and already-complete lines whose visible count is wrong. A conflict-free partial board is explicitly not certified correct.
- Completion independently checks full Latin rows/columns, givens, and every present sightline. Repeated, incomplete, or clue-inconsistent values cannot win.
- Hint names a correct height and highlights a cell without filling it. The solution is a separate non-destructive view. Both permanently record assistance for that attempt and never automatically complete it.
- Undo includes recovery from a winning state. Reset requires confirmation. Level switching keeps all current entries and notes.
- localStorage key: `arcade-skyscrapers-v1`. Saved data consists of selection and per-level action transcripts, not trusted win flags. Load replays each transcript, rejects illegal edits (including edits to givens), and recomputes completion. Corruption is isolated to the affected level. Storage denial displays a warning and allows continued play.
- Transcripts have a 5,000-action validation safety budget per attempt. No timer or time pressure.

## Reproduction and tests

Run from the collection root (parent of `games`):

```
node games/skyscrapers/generate.cjs
node games/skyscrapers/verify-independent.cjs
node games/skyscrapers/test.cjs
node games/skyscrapers/test-ui.cjs
```

No installation required. Generation is deterministic from seed `0x6c1f208a` and rewrites only this folder's level files. Tests cover both sightline directions, zero/one/multiple solution cases, unique answers for all 50, false answers, fixed values, notes, malformed transcripts, undo after wins, persistent assistance, and every official solution played through the actual app handlers. Client tests also exercise non-destructive hints/solution views, confirmation cancel/accept, complete save/reload, corrupted record isolation, forged win flags, blocked storage, keyboard, and level-50 deep links.

`test-ui.cjs` runs the real client in an event-driven DOM mock, not a browser. No browser/render result is claimed. Desktop CSS targets 1180×757, gives the board flexible height when a win banner appears, and offers a single-column board/mobile fallback below 650px. Browser visual QA belongs to the integrating publisher.

## Shipping files

Runtime: `../skyscrapers.html`, `style.css`, `engine.js`, `levels.js`, `app.js`.
Audit: `README.md`, `levels.json`, `fixtures.json`, `generate.cjs`, `verify-independent.cjs`, `test.cjs`, `test-ui.cjs`, and the three `*-report.json` files. No caches or binaries are required.
