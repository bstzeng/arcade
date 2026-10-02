# Competitive board expansion

Ten new static game entries, each with 100 specified-position challenges and complete casual full-game modes. This directory is new shared code only; none of the original seventy games or lobby assets are changed here.

## Ownership and interface

`release-manifest.json` is the integration handoff: exact slugs, titles, rulesets, source URLs and game/proof paths. Each engine exports `CompetitiveEngines[slug]` and CommonJS with `initial`, `legal`, `apply`, validated `play`, `outcome`, `evaluate`, `validate`, `describe`, numeric-board labels and names.

`challenges.js` supplies objective checking and an optional `ArcadeChallenge`-compatible adapter. `session.js` owns challenge/full-game modes, legal event logs, undo, non-mutating solution replay and replay-validated restore. `app.js` renders native board affordances: Go intersections, Hex connectivity edges, shogi hands, Backgammon dice/bar/off/cube, Dots-and-Boxes edges and boxes, and Amazons' move-then-arrow flow.

`worker.js` loads only same-origin static code. AI uses independent timed search with no future random dice. The controller terminates old workers and tags requests to ignore late results. A watchdog provides a recoverable retry action. The random Backgammon dice are generated in the main browser from `crypto.getRandomValues` with rejection sampling, then stored in the log for reproducible validation.

## Exact challenge claims

- Chess and shogi: 100 independently verified unique mate-in-one puzzles each, enumerating every legal action with a separate established Python rules library.
- Go: capture the stated number of stones in one legal placement.
- Hex: connect the correct two opposite edges immediately.
- Ataxx: attain a stated increase in piece count through cloning/infection.
- Amazons: reduce the opponent's summed queen destination count to the stated bound in one move-and-arrow action. No full-game victory claim.
- Dots-and-Boxes: close the stated number of boxes with one edge.
- Jungle: capture an enemy animal of at least the stated rank in one move.
- Fetlar Hnefatafl: capture the stated number of enemy pieces in one move.
- Backgammon: bear off the stated number within the current full compulsory-dice turn.

The latter eight use a separate Python witness-rule implementation. Full-board symmetry canonicalization in the deterministic generator excludes rotated/reflected duplicates, with game-aware edge mapping for Dots-and-Boxes. No arbitrary random unsolved levels are shipped. Tactical objectives can have multiple valid solutions; the UI accepts any legal route meeting the goal within the allowed action count.

## Full-game adjudication disclosures

The displayed rules explicitly distinguish variants and operational agreements. Go is 9×9 Tromp–Taylor with 7.5 komi, position-superko, permitted multi-stone suicide and strict two-pass area scoring; dead stones must be played out. Hnefatafl is Fetlar 11×11, without Copenhagen shieldwalls/edge-fort, plus a stated three-occurrence draw convention. Ataxx and Jungle label their repetition/quiet-move house draws. Backgammon is single-game, virtual points, no monetary betting; cube is capped at 1,048,576 for numeric safety, with no beaver/Jacoby/Crawford options. Chess detects standard material dead positions; rare blocked-position adjudication requires mutual draw agreement. No clocks/tournament arbiter features are claimed.

## Verification

Run from repository root:

    node games/competitive-common/test.cjs
    node games/competitive-common/test-controller.cjs
    node games/competitive-common/test-ai-selfplay.cjs
    python games/competitive-common/independent-check.py
    node games/chess/test.cjs
    node games/shogi/test.cjs
    python games/chess/independent-check.py
    python games/shogi/independent-check.py

The final two Python oracles require their game-local `requirements-test.txt` dependencies from PyPI, test-only and not included at runtime.

`test-report.json`: 1,000 solution/session replays, undo/restore, illegal input rejection, random legal selfplay, 30 initial AI settings, and named rule boundaries.

`controller-test-report.json`: actual app/worker in a simulated DOM, including native click handlers, mode changes, cancellation, stale messages, corrupt save and quota failures. It is not browser visual verification.

`ai-selfplay-report.json`: actual search selfplay for all 30 game/difficulty combinations with an explicit shortened test budget.

`independent-verification.json`: all 800 non-chess/shogi witnesses independently checked; each game adds `proof.json`. Chess and shogi have separate independent reports tied to final file hashes.

Actual browser layout/interaction QA is pending: local Chromium cannot create its required socket in this task environment; the provided cloud browser rejects localhost previews. `test-browser.cjs` is a ready-to-run suite for a permitted Chromium environment, not a claimed successful run.
