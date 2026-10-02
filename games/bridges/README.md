# 橋梁連線 / Hashi

A standalone, dependency-free Traditional Chinese Hashi game with 50 fixed, reproducible, uniquely solvable levels. Open `../bridges.html` (or serve the arcade directory). Uses no backend, packages, fonts, analytics, or runtime network calls.

## Rules and interface

- Connect orthogonally nearest islands with 0, 1, or 2 bridges. Bridges may not cross; island degrees must exactly match their numbers; the entire network must be connected.
- Select an island, then its nearest same-row/column neighbor; the bridge cycles 0 → 1 → 2 → 0. Clicking a bridge corridor also cycles it. Crossings are rejected immediately; degree mistakes remain editable and are highlighted.
- Arrow keys move island focus. Enter/Space use the focused native button. Escape clears the selected origin; Z undoes; H gives one hint.
- All 50 levels are selectable from the start. There are five 10-level tiers, 5×5 through 9×9. Island count and later-tier search difficulty increase; these are new layouts, not rotations or recolorings.
- Undo, undoable restart, one-step safe hints, read-only solution preview, completion dialog, next/previous, help dialog, home link, and local save/resume are included. Preview never changes saved board or awards completion. Hints first correct an erroneous edge; otherwise reveal an unfinished edge. Assisted completion is distinguished from independent completion.
- Responsive viewport layout fits the board to available space. Tiny/short viewports deliberately allow page scroll rather than clipping controls. Touch controls are supplemented with keyboard focus and labeled islands. Browser storage denial degrades gracefully.

## Files

- `engine.js`: shipped rule engine and independent live win detection
- `app.js`, `style.css`: browser controller and visual interface
- `levels.js`: 50 puzzle clues, solved bridge arrays, and proof metrics
- `solver.cjs`: exact finite-domain solution enumerator, stopping at 2; does not read saved solutions or call live validation
- `generate.cjs`: seeded planar connected-network generator; rejects nonunique puzzles and rotational/reflection duplicates
- `verify.cjs`: fresh full enumeration for every level, independent rules validator, symmetry checks, mutation checks, and a second brute-force enumerator for the first 10 levels
- `generation.json`, `verification.json`: reproducibility/proof output
- `ui-test.cjs`, `ui-verification.json`: executes shipped controller with a minimal DOM harness

## Reproduce

From the repository root, with Node.js (built-ins only):

```
node games/bridges/generate.cjs
node games/bridges/verify.cjs > games/bridges/verification.json
node games/bridges/ui-test.cjs bridges > games/bridges/ui-verification.json
```

Seed: `2026100201`; PRNG: 32-bit LCG. The generator builds noncrossing connected networks, derives island degrees, then solves the resulting clue-only puzzle exhaustively up to 2 solutions. Five sizes use increasing island counts. Tier 3 requires at least 3 solver search nodes, tier 4 at least 7, and tier 5 at least 20. A node count is a reproducible computational proxy, not a formal measurement of human difficulty. Each 10-level tier samples a sorted pool across its measured range. Generation takes approximately 7 seconds in the task environment.

## Verified results and limits

- 50/50 have exactly one solution; all 50 saved solutions pass the live engine and an independent coordinate-occupancy/degree/connectivity validator
- 50/50 are distinct under all eight square symmetries
- 10/10 also pass a separate edge-assignment brute-force count
- 994 single-edge mutations are rejected
- UI harness: all 50 complete by direct bridge clicks; all 50 complete through one-step hints; selection, previous/next, completion/help dialogs, undo, restart, preview isolation, save/reload, invalid-save recovery, storage denial, and keyboard focus are exercised
- No screenshot or real-browser visual QA was run because browser/preview execution was unavailable in the assigned environment. DOM checks do not substitute for rendering, mobile layout, or real device input QA.
