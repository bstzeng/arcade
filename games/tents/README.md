# 帳篷與樹 / Tents

A standalone, dependency-free Traditional Chinese Tents game with 50 fixed, reproducible, uniquely solvable levels. Open `../tents.html` (or serve the arcade directory). No backend, packages, fonts, analytics, or runtime network calls.

## Rules and interface

- Every tree must match one orthogonally adjacent tent, and every tent must match a different tree. A tent may be adjacent to several trees as long as a global bijection exists.
- Tents never touch, including diagonally. Row and column totals must match their clues. Trees may touch each other. Grass marks are optional notes and do not affect victory.
- Click a non-tree cell to cycle blank → tent → grass → blank. Arrow keys move focus; Enter/Space cycle the native button; T places a tent; G marks grass; Delete/Backspace clears; Z undoes; H gives one hint.
- 50 selectable levels form five 10-level tiers: sizes 5×5, 6×6, 7×7, 8×8, and 9×9 with increasing tent count and measured search difficulty.
- Undo, undoable restart, one-cell safe hints, read-only solution preview, completion/next-level flow, previous/next, help, home link, and local save/resume are included. Preview does not change the saved board or award completion. Hints correct a misplaced tent first; otherwise reveal an unfinished tent. Assisted completion is tracked distinctly.
- Responsive one-screen layout sizes the board to available space; very small/short screens regain page scrolling. Cells have screen-reader labels, roving keyboard focus, and native buttons. Storage denial still permits play.

## Files

- `engine.js`: live rules, augmenting-path tree–tent matching, win detection
- `app.js`, `style.css`: browser UI/controller
- `levels.js`: 50 clue boards, saved tent positions, proof metrics
- `solver.cjs`: exact row-mask enumerator counting unique tent placements, never counting different tree assignments as different solutions
- `generate.cjs`: reproducible seeded independent-tent sampler with tree assignment and count-to-two filtering
- `verify.cjs`: every-level fresh uniqueness count, independent rule/matching validator, eight-symmetry canonicalization, mutation checks, and a second brute-force enumerator for the first 10
- `generation.json`, `verification.json`: reproducibility/proof output
- `ui-test.cjs`, `ui-verification.json`: controller integration test using a minimal DOM harness

## Reproduce

From repository root, with Node.js built-ins only:

```
node games/tents/generate.cjs
node games/tents/verify.cjs > games/tents/verification.json
node games/tents/ui-test.cjs tents > games/tents/ui-verification.json
```

Seed: `2026100202`; PRNG: 32-bit LCG. Random nontouching tent placements receive distinct adjacent trees; generated row/column clues are then solved without consulting the saved answer. The generator keeps only exact unique placements and rejects rotated/reflected duplicates. Each tier samples a sorted 40-puzzle pool across its search range. Search-node count is a reproducible computational proxy, not a claim of calibrated human difficulty. Generation takes less than one second in the task environment.

## Verified results and limits

- 50/50 have exactly one tent placement; all 50 answers pass both live validation and independent recursive tree assignment
- 50/50 are distinct under all eight square symmetries
- 10/10 also pass independent cell-subset brute-force counting
- 2,550 single-cell addition/removal mutations are rejected
- A deliberately ambiguous tree-matching fixture has two valid bijections but exactly one counted tent placement
- UI harness: all 50 complete by direct tent clicks; all 50 complete with hints; level selection, previous/next, dialogs, undo, restart, solution-preview isolation, save/reload, invalid-save recovery, storage denial, and keyboard editing are exercised
- No real-browser or screenshot QA was run because browser/preview execution was unavailable in the assigned environment. DOM tests do not establish visual rendering or real touch-device behavior.
