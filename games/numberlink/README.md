# 橋接數字 / Numberlink

Entry page: `../numberlink.html`. No backend or external dependencies.

## Rules and source

Connect equal numbered endpoints by orthogonal paths; no overlap, crossings,
branches, repeated cells, or passage through another endpoint. Every cell must
be used. **Full-board coverage is an explicit additional variant rule** rather
than a claim that the Nikoli rules require it.

Primary source checked 2026-10-02:
https://www.nikoli.co.jp/en/puzzles/numberlink/

The interface uses Traditional Chinese. Number labels distinguish paths without
relying solely on color. Pointer dragging, touch dragging, or successive clicks
can draw a path. Keyboard Tab/Enter also operates cells.

## Levels and proof

50 seeded puzzles, 4×4 through 7×7. The constructor makes randomized Hamiltonian
covers, but construction is **not** the uniqueness test. `generate.py` enumerates
all complete simple paths for pairs and exact-covers the board, counting up to 2.
Only solution-count 1 puzzles are retained.

`verify.py` uses an independent undirected-edge CSP. Endpoints have degree 1 and
other cells degree 2; components reject cycles or conflicting terminal labels.
It counts edge subsets up to 2 without using stored solution paths. It also
checks the supplied solutions, and canonicalizes puzzles under all eight square
symmetries and arbitrary pair renaming. Positive, impossible, and ambiguous
counter fixtures are included. All 50 are unique and symmetry-distinct.

Difficulty increases by board size and average path length. Within a batch,
levels are ordered by generation search effort and path-length score; these are
heuristics, not a claim of calibrated human solving times.

## Reproduce and test

From the arcade root:

    python3 games/numberlink/generate.py
    python3 games/numberlink/verify.py
    node games/numberlink/test.cjs

Seed: 31415926. Data: `levels.json` and browser copy `levels.js`.
Proof: `verification-report.json`. UI/engine results: `test-report.json`.

The UI test executes the actual shipped app.js, dispatches real registered DOM
handlers, and solves all 50 boards. It also tests undo, reset confirmation,
cancel, reset undo, valid/malformed saves, storage denial, current-level resume,
transparent hints from wrong states, touch pointer input, help, boundaries, and
non-destructive solution preview. The DOM harness does not measure pixel layout. Browser layout validation is
a separate check.

## Integration / live QA

Selectors: `#levelSelect`, `#prev`, `#next`, `#board [data-cell="0"]`,
`#undo`, `#reset`, `#hint`, `#solution`, `#check`, `#help`,
`#modal`, `#confirmModal`, `#cancelModal`, `#status`, `#saveStatus`.

Storage key: `logic-numberlink-v1`. Progress and completed-board certificates
are validated independently when restored. Preview never changes either.

At 1180×757 the responsive desktop layout is designed to fit one screen; on
narrow screens controls stack above the touch board. Check this with the live
site at desktop and 390px mobile width. Home link is `../index.html`.
