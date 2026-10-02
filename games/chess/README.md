# 西洋棋 engine and original puzzle set

This directory contains the game-specific rules and 100 original, composed,
unique-answer mate-in-one positions. The shared competitive UI owns display,
local two-player play, three AI settings, saves, and replay. No runtime packages,
network access, downloaded game library, or third-party puzzle database is used.

## API and representation

`engine.js` exports CommonJS and `globalThis.CompetitiveEngines.chess`.
`levels.js` exports CommonJS and `globalThis.CompetitiveLevels.chess`.
`config.json` contains Traditional Chinese rules, names, and primary sources.

- `width=height=8`; `board[0]` is a8, `board[63]` is h1.
- Positive pieces are white; negative pieces are black. `turn` is +1 / −1.
- Absolute piece codes: pawn 1, knight 2, bishop 3, rook 4, queen 5, king 6.
- `labels` includes signed Unicode pieces; `pieces` has labels/names/values.
- `initial()`, `legal(state)`, `apply(state, action)`, `play(state, action)`,
  `outcome(state)`, `evaluate(state, side=state.turn)`, `describe(action,state)`,
  `validate(state)`, and `goalMet(level,state,previousState)` implement the shared API.
- `apply` is pure but deliberately unchecked, for a search engine that already
  obtained legal actions. `play` validates and rejects play after game end.
- Board actions are `{from,to}` or `{from,to,promote:2|3|4|5}`. Different promotion
  choices are distinct actions; the UI must not silently select the first.
- `legal` also returns `{claim:'threefold'|'fifty-move', move?: boardAction}`.
  A move-bearing claim declares that intended move without executing it. Claims
  stop the game as draws; they are optional. The fifth repetition and 150 quiet
  plies automatically draw. Checkmate takes precedence over 150 quiet plies.
- `agreeDraw(state, {'1':true,'-1':true})` implements a mutually agreed draw;
  the UI must obtain both players' agreement before calling it.
- `state.history` holds normalized position keys (including side, castling,
  legally available en passant). Preserve it in saved games/replay.
- `fromFEN`, `toFEN`, `square`, `coord`, `inCheck`, `boardLegal` are diagnostics.
- The validator checks local legality, kings, pawn ranks, and material caps;
  it is not a retrograde proof that an arbitrary study was reached from move one.

## Rules and scope

The legal move engine covers castling, attacked transit squares, pins, discovered
checks, en passant including discovered self-check, all four promotions, mate,
stalemate, repetition claims, intended-move claims, and automatic repetition and
move-count draws. It automatically recognizes standard insufficient-material
dead positions (bare kings, one minor, or bishops restricted to one square color).
Arbitrary blocked-pawn dead positions are not automatically proven; use explicit
mutual draw adjudication. This limitation is also disclosed in player-facing rules.
Physical tournament matters such as clocks/touch-move/arbiter penalties are outside
this untimed digital board.

Primary rule source: https://handbook.fide.com/chapter/E012023

## Puzzle provenance and verification

`generate-levels.cjs` uses a fixed PRNG seed, seven attacking-piece families, and
exhaustive legal move search. Every puzzle has exactly one legal mating move.
All 100 geometric canonical signatures are different (including rotations and
reflections before alternating player color); no displayed number or shuffled
metadata supplies the uniqueness. `levels.json` is the readable source artifact;
`levels.js` is the browser artifact. There are no hidden castling/en-passant rights.

`independent-check.py` uses the separately implemented python-chess oracle, not
this engine, to independently enumerate every legal move and every mating move
for all 100 puzzles. It also compares complete legal move sets on seeded full-game
playout positions. `independent-verification.json` records each unique answer and
SHA-256 hashes tying the report to the engine and puzzle files. The independent
Python package is test-only, installed from PyPI, and not bundled with the website.

Run from the repository root:

    node games/chess/test.cjs
    node games/chess/generate-levels.cjs
    python -m pip install -r games/chess/requirements-test.txt
    python games/chess/independent-check.py

The checked-in regression suite includes initial perft through depth 4 (197281),
Kiwipete depth 3 (97862), the rook-pawn endgame perft (2812), rule boundaries,
draw distinctions, immutable transitions, and all 100 unique solutions.

## Replayable agreement event

After obtaining both consents, the shared UI can pass
`{agreement: "draw", consent: [true, true]}` to either `play` or `apply`.
Both validate consent and adjudication, return the terminal result and increment
`ply` once. The action is intentionally absent from `legal()` so search does not
auto-propose agreements. Save the event alongside ordinary actions for replay.
