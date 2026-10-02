# 維京王棋

## Exact ruleset

fetlar-11x11-threefold-house-v1

- 採明示 Fetlar 11×11 版本：24 攻方、12 守軍與一位國王，攻方先行。所有棋子如城堡直線移動，不能越子。
- 國王抵達任一角落即守方勝。只有國王可停在中央王座與四角；所有棋子可越過空王座。國王可協助夾吃。普通棋子被剛落下的敵子與另一敵子／禁格夾住才移除，自己走進夾縫不會死。
- 空王座與角落可作夾吃支點。王座有國王時不能用作攻方夾吃守軍的支點。棋盤邊界不會夾吃。國王需四面攻子包圍；王座鄰格可用空王座代替一面。
- 攻方完整包圍全部守軍和國王、擒王，或讓守方無合法步可勝；任何一方無合法步即負。沒有 Copenhagen 盾牆或邊緣堡壘規則。
- Fetlar 允許循環和局；本作明示附加操作約定為「相同局面及行棋方三次自動和局」，不是宣稱歷史唯一版本。

## Sources

- Fetlar 規則，Aage Nielsen: https://aagenielsen.dk/fetlar_rules_en.php

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
