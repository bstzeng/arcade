# 亞馬遜棋

## Exact ruleset

amazons-10-standard-v1

- 10×10 棋盤，每方四枚皇后；白先。每手必須完成兩個動作：先移動自己的皇后，再由新位置射一支箭。
- 皇后與箭都可沿橫、直、斜線走任意距離，不可越過棋子或舊箭。箭可射回剛離開的起點，箭落點永久封鎖。棋子不互相吃掉。
- 輪到的一方若所有皇后均無法移動，即落敗。每手少一空格，不會和棋。
- 操作：選皇后 → 選落點 → 選射箭格。挑戰明示「對方移動落點總數」的封鎖目標，逐皇后計算同格可重複計數；不把局部封鎖當成必勝。

## Sources

- Ludii 遊戲規則教學: https://github.com/Ludeme/LudiiTutorials/blob/master/docs/tutorial_amazons.rst

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
