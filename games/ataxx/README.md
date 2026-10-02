# 同化棋

## Exact ruleset

ataxx-7-open-threefold-quiet100-v1

- 7×7 無障礙標準棋盤，雙方各占一對對角。選棋再選落點：往相鄰八格增殖（原子留下）；距離恰為兩格時跳躍（原子移走）。距離以橫直差最大值計。
- 落點周圍八格的所有對方棋子立即變成己方。無合法移動時必須停一手。
- 盤滿、任一方無子，或雙方都無法移動時結算，棋子較多者勝，同數為和。
- 明示循環附加規則：相同局面及行棋方三次，或連續 100 手沒有增殖或轉化，自動和局。這是避免無限跳躍的休閒約定。

## Sources

- CodinGame Ataxx 公開規則: https://www.codingame.com/multiplayer/bot-programming/ataxx

## Challenges and evidence

100 fixed, canonical-distinct positions with explicit tactical goals. Solutions are legal witness actions. They prove the stated objective only; they do not assert an eventual forced win. At most three positions are sampled from each seeded full-game walk, except backgammon which uses independently composed legal bearing-off positions. Backgammon goals require finishing the compulsory dice turn.

`levels.json` / `levels.js` contain the start, goal and reference solution. `proof.json` fingerprints the rules, source, engine and every replay. `../competitive-common/independent-check.py` validates the witness geometry, captures, compulsory dice sequencing and objective in a separate Python implementation.

## Runtime

The shared responsive Traditional Chinese UI supplies level selection, legal highlights, hints, non-destructive solution preview, undo, validated local-save replay, full same-device play and three AI difficulty settings. All files are static and local; there are no remote runtime APIs, downloaded engines, or hidden opponent dice.

AI uses a cancellable Web Worker, an operation token to discard stale responses, time/node limits, and depth/candidate limits. Large move lists are sampled; this is a recreational opponent and does not claim perfect play. Undo/restart/mode changes terminate the worker. A failure exposes retry rather than freezing the UI.

## Reproduce tests

From repository root:

    node games/competitive-common/test.cjs
    node games/competitive-common/test-controller.cjs
    node games/competitive-common/test-ai-selfplay.cjs
    python games/competitive-common/independent-check.py

Regenerate the eight non-chess/shogi puzzle collections:

    node games/competitive-common/generate.cjs
    node games/competitive-common/finalize.cjs

Browser visual QA remains pending in this environment. The simulated-DOM report does not claim desktop/mobile browser testing.
