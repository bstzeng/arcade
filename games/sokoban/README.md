# 推箱子 · The Little Warehouse

Entry point: `../sokoban.html`. Static HTML/CSS/JavaScript; no dependencies, network calls or backend. Home link: `../index.html`.

## Rules and collection

Standard Sokoban. The player walks one cell orthogonally. A single adjacent box may be pushed only if the following cell is empty. Boxes cannot be pulled; two boxes cannot be pushed together. Every box must occupy a goal to win. Walking moves and pushes are counted separately; rejected actions do not count.

There are exactly 50 certified puzzles, with 50 **different wall topologies even after rotations and reflections**. No color/rotation variants are counted as separate levels.

| Stage | Levels | Boxes | Certified route pushes | Route walking + pushes |
|---|---|---|---|---|
| 倉庫暖身 | 1–5 | 1 | 3–5 | 5–21 |
| 雙箱換位 | 6–15 | 2 | 5–6 | 11–18 |
| 三箱調度 | 16–30 | 3 | 9–13 | 23–61 |
| 四箱協作 | 31–50 | 4 | 13–16 | 33–93 |

Difficulty is progressive by planning load and box count; individual levels within a stage need not be monotonically harder. Full collection: 1,806 legal movement steps and 506 pushes. Gameplay and UI label routes as **reference solutions**, never minimum walking-step solutions.

## Certification and reproducibility

- `generate.py`: deterministic standard-library Python generator; seed `2026100222`. Generates connected compact wall topologies, starts with boxes on goals, performs legal inverse pushes, then solves with a forward push-space BFS. Walking paths are included in every resulting certificate.
- `levels.json`: human-readable board maps and full `UDLR` move witnesses. The map alphabet is `#` wall, space floor, `.` goal, `$` box, `@` player, `*` box on goal, `+` player on goal.
- `levels.js`: byte-reproducible browser copy of the same data.
- `verify.py`: independent cell-by-cell simulator. It imports neither generator nor gameplay engine. Checks board shape, enclosing walls, connected floor, exactly one player, matching box/goal counts, every move/push, first win at the end, and D4 wall-topology uniqueness. Also checks the JSON/browser copies agree.
- `certification.json`: per-map/per-witness SHA-256 digests, totals and independent validation report.
- `engine.js`: actual gameplay rules, dead-square/frozen-square detection, current-state BFS and replay verification.
- `test.cjs`: every certificate through the real engine and session, complete undo/restart/save tests, static and dynamic deadlocks, and 20 solvable off-witness situations.
- `test-ui.cjs`: executes actual `app.js` against a dependency-free DOM mock, including all 50 UI wins. This checks UI logic and state, not pixels/browser layout.

Run from the `arcade` directory:

```sh
python3 games/sokoban/verify.py
node games/sokoban/test.cjs
node games/sokoban/test-ui.cjs
# Rebuild both data files and assert exact byte equality with committed data:
python3 games/sokoban/verify.py --regenerate
```

Full regeneration was run and verified byte-identical. It may take a few minutes. `generation.log` and `reproducibility.log` retain the generation/verification results. No external or copyrighted puzzle pack is used.

## Interaction and recovery

- Arrow keys / WASD, screen direction buttons or swipe on board
- Z: undo; H: hint; R: restart confirmation
- Numbered selector includes all 50 stages, with completion marks
- Undo remains available after a win; restart requires confirmation when there is a route to discard
- Hints first look for an exact certified state match. Otherwise they solve **the current state** in yielding batches. Dead ends produce an honest no-solution message. Search limits produce an inconclusive message, not an invalid hint.
- Solutions list every step from the current position. Playback is cancellable by movement, undo, restart, level change, opening rules, Escape or tab hiding.
- Demonstration sessions never create completion/best records. Hint-assisted manual finishes are labeled assisted.
- Best records compare pushes first, then total walking steps. No claim that a personal best is globally optimal.
- Progress is saved as a legal move history and replay-validated before restoration. Untrusted raw board state is never restored. Invalid saves fall back safely; unavailable localStorage does not prevent play.
- Storage keys: `arcade.sokoban.progress.v1` and `arcade.sokoban.records.v1`.

## Verification limits

All logic, certificates, deterministic reproduction and actual UI state-flow checks passed. A rendered browser/visual check was **not run**, per the task's explicit blocked-preview instruction; no blocked browser route was retried. Suggested final visual sizes: 1280×800, 768×1024 and 390×844. Check board fit, dialog scroll, focused control outlines and swipe behaviour on a real touch surface.
