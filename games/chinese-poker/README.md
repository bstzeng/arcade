# 十三支 · CHINESE POKER

把十三張排成三墩，每墩分別與另外三家比較。

## Frozen local variant

四人封閉排牌・前3／中5／後5・逐墩 1 分・無特殊牌／紅利

- 五張採標準撲克牌型：高牌、對子、兩對、三條、順子、同花、葫蘆、四條、同花順。花色不破平手。
- 前墩只算高牌、一對、三條，不算三張順子或同花。順子 A 可在最低或最高端，不繞接。
- 本版採基本逐墩計分，不加打槍、特殊十三張或牌型獎分。倒水排列不可送出，可先用整理建議再自由調整。
- AI 排牌只看自己的十三張；一般模式在所有人確認以前不揭露對手配置。

## Play and information boundary

- Normal play supports a complete deal, AI opponents (easy and normal), genuine same-device multiplayer, results, next deal, undo, restart and validated automatic save. Hearts, Gin Rummy and Spades keep multi-deal totals and identify their 100/100/500-point match threshold; other tables accumulate deal scores. Hold’em restarts each deal with 200 valueless virtual points per seat.
- The UI has game-specific layouts: thirteen-card arrangement lanes; sevens suit ladders; trick and auction tables; rummy draw/discard and deadwood; Hold’em community cards, betting and side pots.
- The AI worker receives only a versioned public observation plus its own hand. Opponent card identities, stock order, seed and unrevealed Chinese Poker arrangements are absent. Bridge dummy becomes public only after the opening lead. Normal and challenge opponents never consult the omniscient game state.
- Local play covers private cards at every change of controlling seat. Reload, Escape and hidden-tab interruption cover them again. This is handoff privacy on a shared device, not encryption against someone inspecting source or browser storage.
- Chinese Poker uses independent bounded exhaustive arrangement search over its own thirteen cards. Other opponents are bounded heuristics; these are transparent practice AIs, not claims of tournament strength.

## 100 specified positions and solutions

Exactly 100 distinct card-position records are in levels.json. Each names its seed, legal prefix, protagonist (seat 1), precise score/winner goal, and fixed public-normal-v1 opponent policy. All hands are displayed in this training mode; future stock cards are kept visually face down and follow the recorded deterministic deck. These are playable fixed-opponent scenarios, not arbitrary-opponent forced-win puzzles.

The whole successful continuation is in proofs.json, with a SHA-256 digest, terminal score and winner. The browser bundle levels.js contains the same records. The generator simulates actual rounds, selects meaningful protagonist positions with remaining decisions, and retains only witness lines meeting the stated goal. Chinese Poker’s decision is a complete 3/5/5 arrangement of thirteen cards, not a multiple-choice card question.

After deviation, hints disclose that they are heuristic; replay restarts the certified position. Replayed success is marked separately from manual completion. A fixed-opponent validator rejects forged opponent actions.

## API and files

engine.js exports the live engine and the shared challenge adapter: createState(level), validateState(level,state), applyAction(level,state,action), inspect(level,state), hint(level,state). Live methods are initial(seed,options), actions(state), legal(state,action), apply(state,action), actor(state), observe(state,viewer,open=false), ai(observation,difficulty).

Family code is in ../cards80-common/. No external runtime requests, backend, third-party game assets, payments, or real-money functionality are used. Everything runs in a normal static browser origin. No dependencies are required for rules/content/controller tests.

## Reproduce verification

From the arcade directory:

    node games/chinese-poker/test.cjs
    node games/chinese-poker/controller-tests.cjs

The content verifier replays all 100 prefixes and witnesses; a separate rule checker validates card ownership, conservation, move rules, card rankings and scoring; hidden-information mutation tests confirm invariant observations and AI choices. Self-play and targeted fixtures cover full round endings and special rules. Controller tests cover stale workers, reset, replay cancellation, undo, malformed saves and round switching. The actual shipped app is exercised by a deterministic simulated DOM harness; this is explicitly not a pixel-rendering test.

Real Chromium desktop/mobile QA is pending due to executor socket / localhost restrictions. A ready-to-run Playwright suite is at ../cards80-common/browser-tests.cjs. Serve arcade on localhost:8766 in a supported environment, then run that suite. Do not describe the simulated DOM checks as real-browser QA.

## Rule sources (checked 2026-10-02)

- [Pagat：Chinese Poker](https://www.pagat.com/partition/pusoy.html)

Implementation is original; the links document the rules and explicitly selected local variants.
