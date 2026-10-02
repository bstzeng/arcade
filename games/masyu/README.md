# 黑白圓圈環線 / Masyu

Original, dependency-free implementation and generated content. Entry: `../masyu.html`.

## Rules

Use orthogonal edges between adjacent grid points to draw exactly one nonempty simple cycle. Every used vertex has degree two. Every pearl must be visited. A black pearl is a turn whose two immediately adjacent vertices along the loop are straight. A white pearl is straight and has a turn at one or both immediately adjacent vertices along the loop. Non-pearl vertices may be unused. Branches, crossings, extra loops, and open paths are invalid. Cross marks are player notes, not edges.

Primary reference: [Nikoli Masyu rules](https://www.nikoli.co.jp/en/puzzles/masyu/), also checked against the Japanese [original rules](https://www.nikoli.co.jp/ja/puzzles/masyu/). The point-grid rendering represents the centers of the traditional cell grid; its topology and rules are unchanged.

## 50 fixed levels and proofs

- Boards increase by stages: 4×4 (6), 5×4 (6), 5×5 (8), 6×5 (8), 6×6 (8), 7×6 (7), 7×7 (7)
- Early boards retain more clues; later boards are larger and progressively sparser. These are structural difficulty bands, not a claim that every adjacent level is objectively harder
- `levels.json` and the browser-ready `levels.js` contain identical data: pearl layout, solution connector masks, generation seed, and complete count-to-two result
- All 50 have both black and white pearls and exactly one legal solution
- Canonical comparison over all eight rotations/reflections rejects geometric reskins
- No fetched puzzle layouts or external puzzle engine are used

`generate.cjs` uses deterministic seeded loop mutations, derives valid pearl candidates, rejects nonunique layouts, and removes selected clues only after another exact uniqueness check. It writes both datasets. `engine.js` uses a vertex-domain constraint solver with exhaustive branching and single-cycle validation. A returned `aborted` result is never accepted as a proof.

`verify.py` is a separately implemented Python exact solver, independent of the JavaScript generator/engine. It recounts up to two solutions for every board, validates every saved proof by walking the full cycle, and independently canonicalizes the layouts. It also verifies a multiple-solution fixture and an impossible fixture. `verification-report.json` records the independent results.

## Controls and saved state

Click an edge: line → cross mark → empty. Tab and Enter/Space work on every edge; arrow keys move edge focus. Undo retains up to 200 recent actions for the currently open level. Reset uses a confirmation dialog; cancellation leaves the board intact. Hints first repair an incorrect line or cross mark, otherwise place one correct edge, explicitly using the unique reference solution. Each hint can be undone.

The full-solution preview is read-only and never changes saved boards, moves, or completion medals. Switching levels exits preview and retains each level's partial board. All 50 levels are immediately selectable.

Local key: `arcade-masyu-v1`. Per-level boards and move counts, last level, and independently validated completed-board medals are saved. Loaded dimensions, integer ranges, edge values, and medal validity are checked. Invalid records are discarded. Storage denial or quota failure does not stop play and is announced. Undo history is session-only. Reset preserves earned medals. No account, backend, dependency, telemetry, or network API is used. First page load still requires the site's normal network availability.

## Reproduction and tests

From this directory:

    node generate.cjs
    node test.cjs
    python3 verify.py
    node test-ui.cjs

- `test.cjs`: 419 rule, exact uniqueness, proof, arbitrary-state hint, undo, preview, reset, and save-load assertions
- `test-ui.cjs`: 25 minimal-DOM controller assertions, including confirmation cancellation, repeated preview entry/exit, all 50 choices, keyboard navigation, resume, malformed saves and storage failures
- `test-report.json` / `ui-test-report.json`: machine-readable results

The interface targets a compact 1180×757 desktop viewport with a one-column touch layout on narrow screens; smaller screens may scroll vertically. All controls remain available. Browser-based layout/screenshots were not run because the authorized local preview was unavailable; the Node DOM harness does not substitute for real-browser visual QA.
