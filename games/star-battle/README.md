# 星星之戰 / Star Battle

Entry page: `../star-battle.html`. No backend or external dependencies.

## Rules and source

Place exactly k stars in every row, column, and bold-bordered region. Stars
cannot touch orthogonally or diagonally, including across region borders.
All regions are orthogonally connected. Crosses are optional pencil marks.

Primary publisher source checked 2026-10-02:
https://www.gmpuzzles.com/blog/star-battle-rules-and-info/

The interface is Traditional Chinese. Region borders, tinted fills, small
region numbers, accessible cell labels, and live quota counters distinguish
regions. Click cycles blank/star/cross; dedicated star/cross modes and right
click notes are available. Keyboard Tab/Enter also operates cells.

## Levels and proof

50 seeded puzzles: 8 on 5×5, 10 on 6×6, 12 on 7×7, and 10 on 8×8 with k=1;
then 5 on 8×8 and 5 on 9×9 with k=2. All have distinct connected region maps.

`generate.py` completely enumerates row/column/non-touching placements before
filtering them by region quotas. A random connected region construction is
accepted only when exactly one placement survives. Stored answers are not
assumed unique.

`verify.py` independently enumerates each region's admissible k-cell subsets,
then searches assignments using row, column, and king-distance constraints,
counting up to 2. It does not import the generator or use the solution to prune.
It validates every answer and connected region and canonicalizes all eight
square symmetries with region-label renaming. Impossible and ambiguous counter
fixtures are included. All 50 have exact count 1 and are symmetry-distinct.

Difficulty progresses by size and then two-star quotas; ordering within each
batch uses an irregularity heuristic rather than calibrated human solve time.

## Reproduce and test

From the arcade root:

    python3 games/star-battle/generate.py
    python3 games/star-battle/verify.py
    node games/star-battle/test.cjs

Seed: 27182818. Generation takes about 3 minutes in this environment.
Data: `levels.json` and identical browser data `levels.js`.
Proof: `verification-report.json`. UI/engine tests: `test-report.json`.

The UI test runs the actual shipped app.js via a deterministic DOM/event
harness, completing all 50 levels through the registered click handlers. It
tests incorrect adjacency/diagonals/quotas, missing and extra stars, optional
crosses, invalid input, undo, confirmed/cancelled reset, reset undo, reload,
invalid saves, storage denial, wrong-star/wrong-cross hints, note modes, help,
and non-destructive preview. No pixel-layout test is claimed: local browser
launch is blocked; publisher live-browser QA is still required.

## Integration / live QA

Selectors: `#levelSelect`, `#prev`, `#next`, `#board [data-cell="0"]`,
`[data-mode="cycle"]`, `[data-mode="star"]`, `[data-mode="cross"]`,
`#undo`, `#reset`, `#hint`, `#solution`, `#check`, `#help`,
`#modal`, `#confirmModal`, `#cancelModal`, `#status`, `#saveStatus`.

Storage key: `logic-star-battle-v1`. Saved boards have strict shape/value
validation; completion certificates are checked with the actual rules.
Solution preview is read-only and never grants a completion medal.

Desktop layout is designed for one screen at 1180×757; mobile stacks controls
above the touch board. Live QA should check this at desktop and 390px mobile.
Home link: `../index.html`.
