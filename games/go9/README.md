# 九路圍棋

## Exact ruleset

tromp-taylor-9x9-komi7.5-v1

- 採 Tromp–Taylor 邏輯規則，棋盤明確為 9×9。黑先白後，白貼 7.5 目。
- 棋子落在交叉點；上下左右連成一組，共享相鄰空點「氣」。先移除無氣的對方棋，再移除無氣的己方棋。允許多子自殺，但不得重現任何先前的棋盤顏色配置（位置超劫）。
- 可停一手；雙方連續停手即結束。計算盤上己子，加上只接觸己色的空區。囚子不另計分；死子必須實際吃掉再停手，不自動移除。7.5 貼目使本設定不會同分。
- 本作沒有日本式死活協議畫面；雙方應下到死子被提清，再連續停手。100 題為一步提子目標，不宣稱整局必勝。

## Sources

- 規則作者 John Tromp: https://tromp.github.io/go.html

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
