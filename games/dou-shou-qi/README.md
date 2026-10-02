# 鬥獸棋

## Exact ruleset

jungle-leiden-rat-no-cross-capture-draw-v1

- 7×9 棋盤，雙方各八獸。依強弱：象8、獅7、虎6、豹5、狼4、狗3、貓2、鼠1；強者可吃同級或較弱者。陸上鼠可吃象，象不能吃鼠。
- 一般上下左右走一格。只有鼠可入河；鼠不可跨水岸吃子。獅、虎可直線跳過整段河，任何一方鼠擋在跳躍路徑上都不能跳。跳落可按等級吃子。
- 進入敵方陷阱的動物可被任意敵獸吃；離開後恢復。不可進入自己的獸穴。進入敵方獸穴，或令對方無合法走法即勝。
- 採研究實作常用版本；民間版本有差異。休閒循環附加規則：三次同局面或連續 120 手未吃子，和局。

## Sources

- Leiden University 鬥獸棋研究規則: https://liacs.leidenuniv.nl/~visjk/doushouqi/about.html

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
