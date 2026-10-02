# 數和 / Kakuro

A self-contained Traditional Chinese cross-sum game with no CDN, backend or runtime network requests. Entry: `../kakuro.html`; home: `../index.html`.

## Rules and source

Fill every white cell with 1–9. Each diagonal clue cell gives the sum of the uninterrupted white run to its right (upper-right clue) and/or below (lower-left clue). Digits cannot repeat within a run. Black cells end runs; repetition elsewhere in a row/column is legal. Every white cell belongs to both an across and a down run. Publisher rules: https://www.nikoli.co.jp/en/puzzles/kakuro/ (checked 2026-10-02).

## Genuine Kakuro layouts

50 connected, irregular, unique-solution layouts, with no digits prefilled in white cells. Five ten-level tiers use 5 × 5 through 9 × 9 clue-inclusive grids, and progressively greater minimum white-cell counts. Every run has length 2–5 (within the standard 2–9 range). Both across and down clue sums come from a valid no-repeat assignment. Random sum assignments are rejected unless an exhaustive count up to two finds exactly one solution.

The layout canonicalizer normalizes occupied-cell coordinates and compares all eight rotations/reflections. All 50 white/black structures are different even after those transformations; these are not cosmetic digit or clue reskins.

## Regeneration and certification

Python 3.10+ and Node 18+, from the repository root:

- `python arcade/games/kakuro/generate.py` regenerates all fixtures (offline; several minutes)
- `node arcade/games/kakuro/certify.cjs` independently counts solutions and checks run geometry, overlap, uniqueness, canonical layout identities and runtime mutation rejection
- `node arcade/games/kakuro/ui-test.cjs` tests the shipped controller with real registered DOM event handlers
- `python arcade/games/futoshiki/make_ui.py` rebuilds the two game shells/CSS/controllers

The generator's solver propagates ordered run tuples. The independent verifier instead uses unordered digit-set combinations plus cell-level backtracking; it reconstructs all runs from the black/white mask and checks against clue records. The runtime engine independently evaluates sums, nonrepetition, filled-cell ranges and remaining-sum feasibility; wins are validated from rules, not answer equality. `certification.json` contains per-level counts, independent search nodes, layout fingerprints and fixture hash. `ui-certification.json` lists controller test coverage.

Additional regression command: `node arcade/games/kakuro/engine-test.cjs`. This exercises deliberately nonunique fixtures, an alternative valid completion that differs from the stored answer, malformed input and contradiction-safe hints.

## Interaction and persistence

Click/tap a white cell, then the keypad; keyboard 1–9 also enters values. Arrows skip black cells. Delete/Backspace/0 clears, Z undoes and H hints. The display flags repeated digits and impossible residual sums. No red warning does not necessarily mean the partial board is extendable.

Each hint first clears one erroneous assignment, or reveals one cell if the current entries are all compatible with the unique solution. Read-only solution preview never changes the board or awards completion. Using hints or viewing the solution marks the attempt assisted. Reset is confirmed, and preserves completed-level records.

Storage key: `arcade.logic.kakuro.v2`. The controller validates shapes, numeric ranges, black-cell zeros, history arrays, indices and saved completed boards before restoring. Storage denial and malformed JSON do not prevent play. Progress remains in this browser only.

## QA limits

The DOM suite completes all 50 boards manually, by hints, and after deliberately wrong inputs. It covers reset confirmation/cancel, undo, answer-preview preservation, keyboard focus, save/reload, malformed state and blocked storage. CSS targets a 1180 × 757 desktop and mobile touch screens. No visual browser claim is made: the assigned local preview/browser route was unavailable.
