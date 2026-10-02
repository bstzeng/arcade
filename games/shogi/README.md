# 日本將棋 engine and original puzzle set

This directory contains game-specific rules and 100 original composed one-move
mate puzzles. The parent shared UI owns rendering, human color selection, local
two-player play, three AI settings, save/load, and replay. There are no runtime
package or network dependencies and no copied puzzle collection.

## API and representation

`engine.js` exports CommonJS and `globalThis.CompetitiveEngines.shogi`.
`levels.js` exports CommonJS and `globalThis.CompetitiveLevels.shogi`.
`config.json` provides Traditional Chinese player-facing rules and primary sources.

- `width=height=9`; `board[0]` is 9一, `board[80]` is 1九.
- Positive pieces are sente/先手 (moving toward row zero), negative pieces gote/後手.
- Piece codes: pawn 1, lance 2, knight 3, silver 4, gold 5, bishop 6, rook 7,
  king 8; promoted pawn/lance/knight/silver/bishop/rook are 9/10/11/12/13/14.
- `state.hands` is `{'1':[0,P,L,N,S,G,B,R],'-1':[0,P,L,N,S,G,B,R]}` where
  array entries are counts. Display each player's actual hands, including puzzles.
- `initial()`, `legal(state)`, `apply(state,action)`, `play(state,action)`,
  `outcome(state)`, `evaluate(state,side=state.turn)`, `describe(action,state)`,
  `validate(state)`, `goalMet(level,state)` implement the shared API.
- Board actions are `{from,to}` or `{from,to,promote:true}`; drops are
  `{drop:1|2|3|4|5|6|7,to}`. Optional promotion alternatives must remain selectable.
- `apply` is pure and intentionally unchecked for already generated legal actions;
  use `play` at the human-input boundary. Illegal moves are disallowed rather than
  physically committed and penalized afterward.
- `legal` includes `{claim:'entering-king'}` only when a valid declaration exists.
- `declaration(state)` returns `{eligible,count,points}` for a UI explanation.
- `impasse(state, {'1':true,'-1':true})` explicitly adjudicates agreed 24-point
  impasse. The UI must obtain both players' agreement. Both kings must be in the
  enemy camp and neither in check. A player below 24 loses; otherwise replay.
- `outcome` replay endings have `{winner:0,reason,replay:true}`. Present these as
  no-contest/replay; an ordinary repetition is not a decisive game win/loss.
- Preserve `history` (key/mover/check entries) and `limitChecker` when saving.
  The latter tracks a checking sequence extending beyond the 500th ply.
- Helpers `boardLegal`, `inCheck`, `attacked`, `toSFEN`, `coord`, `key` are exposed.
- `validate` checks local legality, inventory caps, nifu and dead ranks; it does
  not claim a retrograde proof of arbitrary composed study reachability.

## Rules

Implemented: directional movement for every piece, optional/mandatory promotion,
captured-piece demotion, hand drops, nifu, dead-rank drops, self-check, uchifuzume
(illegal pawn-drop mate), legal board-pawn mate, checkmate, fourfold repetition,
continuous-check repetition loss, entering-king declaration, explicit agreed
impasse, and the 500-ply replay with continuous-check extension.

The JSA's current professional declaration method is used: a king in the enemy
camp, ten or more other board pieces in that camp, no check, and points counting
only that camp plus the declarer's hand. At least 31 points wins; 24–30 leads to
replay. Bishop/rook each count five; other nonking pieces count one. This is
explicitly different from a separately organized 27-point amateur convention.
Clocks and physical tournament penalties are outside this untimed digital game.

Primary sources:
- https://www.shogi.or.jp/match/taikyoku_rules/
- https://www.shogi.or.jp/match/taikyoku_rules/taikyoku_rules_revision.pdf

## Puzzle provenance and verification

`generate-levels.cjs` produces 100 deterministic, symmetry-distinct positions with
exactly one legal mating move: 40 drops, 30 promotions, 30 ordinary board moves.
These are full specified board-and-hand studies, not formal tsume-shogi with all
unlisted pieces implicitly owned by the defender. The distinction is prominent
in every puzzle description. Every state obeys material caps, nifu/dead-rank
restrictions and king legality. The generator rejects illegal pawn-drop mates.

`independent-check.py` verifies every move set and unique mating answer with the
independently implemented python-shogi 1.1.1 oracle, and compares complete legal
move sets for seeded full-game playouts. `independent-verification.json` stores
per-puzzle answers, totals and hashes of the verified engine and level files.
The Python dependency is installed from PyPI only for tests and is not shipped.

Run from the repository root:

    node games/shogi/test.cjs
    node games/shogi/generate-levels.cjs
    python -m pip install -r games/shogi/requirements-test.txt
    python games/shogi/independent-check.py

Tests cover initial perft 30/900/25470, all special movement/drop rules,
repetition/perpetual check, declaration/impasse, 500-ply extension, immutable
transitions and all 100 unique puzzle solutions.

## Replayable agreement event

After obtaining both consents, the shared UI can pass
`{agreement: "impasse", consent: [true, true]}` to either `play` or `apply`.
Both validate consent and adjudication, return the terminal result and increment
`ply` once. The action is intentionally absent from `legal()` so search does not
auto-propose agreements. Save the event alongside ordinary actions for replay.
