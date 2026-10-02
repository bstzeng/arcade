# 西洋雙陸棋

## Exact ruleset

backgammon-single-game-virtual-cube-v1

- 標準 24 點、每方 15 子。紅從 24 往 1，藍從 1 往 24。開局每人一骰，高者先走並使用兩骰；同點重擲。之後每回合兩骰，雙數走四次。
- 每骰單獨走，落點不可有兩枚以上對方棋子。單枚對方棋子被擊上中欄；中欄有子時必須先重新入場。
- 必須用盡所有能用骰點；只能用一骰且兩骰都可選時，必須用較高點。引擎先枚舉整回合，僅亮出符合最大用骰的第一步。
- 全部活子進入己方六點內才可移出；精準點數可移出該點，超額骰只有在沒有更遠己子時才能移出。先移出 15 子者勝。
- 加倍骰為純遊戲分數，沒有金錢。可在自己擲骰前提出加倍，對手接受即取得下次加倍權；拒絕按加倍前分值判負。無收子敗方算雙倍（gammon）；仍在中欄或勝方家區算三倍（backgammon）。
- 單局制，不用 Crawford、Jacoby、beaver 或開局自動加倍；虛擬分數安全上限 1,048,576，達上限不再加倍。骰點由瀏覽器密碼學亂數產生，AI 搜尋看不到未擲出的骰點。

## Sources

- Backgammon Galore 標準規則: https://www.bkgm.com/rules.html

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
