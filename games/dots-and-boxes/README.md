# 點線方格

## Exact ruleset

dots-boxes-4x4-v1

- 5×5 個點形成 4×4 個小方格。雙方輪流連接水平或垂直相鄰兩點，每手只畫一條未畫過的邊。
- 畫完某方格的第四條邊，就取得該格；若一條線同時完成兩格，兩格都歸你。取得方格後必須再下一手，沒有取得才換人。
- 全部 16 格完成後，格數較多者勝；8 比 8 為和局。可以選擇不立即封格，沒有強制吃格。
- 挑戰要求下一條線取得明示數量的方格；完整對局可練習長鏈、讓格與雙格收尾。

## Sources

- Gathering 4 Gardner 遊戲規則卡: https://www.gathering4gardner.org/wp-content/uploads/2021/03/CardDeckOfGames-English.pdf

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
