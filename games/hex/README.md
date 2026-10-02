# 六角連線棋

## Exact ruleset

hex-11x11-pie-v1

- 11×11 菱形六角棋盤。紅方連上下兩邊，藍方連左右兩邊；紅先。輪流在空格放一子，落子後不能移動或吃子。
- 六個鄰格相接才算連通。率先完成兩邊連線者獲勝；完整棋盤不會和棋。
- 交換規則：紅方第一手後，藍方可用自己的整回合交換開局。畫面以「將第一子轉置到對角位置並改成藍色」表示，紅方接著下；等價於交換角色並翻轉棋盤。
- 挑戰是指定局面下一手完成連通；完整對局仍由空盤開始。

## Sources

- Alberta Hex 研究團隊: https://webdocs.cs.ualberta.ca/~hayward/hex/

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
