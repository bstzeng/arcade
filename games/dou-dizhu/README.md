# 鬥地主 · DOU DIZHU

競叫地主，或與另一位農民合作，搶先出完牌。

## Frozen local variant

三人順時針・公開底牌・叫分 1–3・炸彈／春天加倍

- 點數 3 到 A、2、小王、大王；花色不分高低。叫分須提高，最高 3 分或連續兩家不叫後定地主；全不叫則流標。
- 合法牌型：單、對、三條、三帶一／對；五張以上順子、三對以上連對、兩組以上飛機，可帶等量單牌或不同點數對子；四帶兩張不同點單牌／兩對。
- 順子、連對、飛機主體不含 2 或王。單翼可成對但不可三張同點，也不可與主體同點；翼牌與四帶二均不得同時含雙王。炸彈四張同點；火箭雙王最大。
- 兩家連續不出後重新領出。炸彈或火箭每次倍增。地主勝收兩份叫分，敗付兩份；農民均相反。農民皆未出牌或地主僅出一手便敗，再加倍。全部只是遊戲積分。

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

    node games/dou-dizhu/test.cjs
    node games/dou-dizhu/controller-tests.cjs

The content verifier replays all 100 prefixes and witnesses; a separate rule checker validates card ownership, conservation, move rules, card rankings and scoring; hidden-information mutation tests confirm invariant observations and AI choices. Self-play and targeted fixtures cover full round endings and special rules. Controller tests cover stale workers, reset, replay cancellation, undo, malformed saves and round switching. The actual shipped app is exercised by a deterministic simulated DOM harness; this is explicitly not a pixel-rendering test.

Real Chromium desktop/mobile QA is pending due to executor socket / localhost restrictions. A ready-to-run Playwright suite is at ../cards80-common/browser-tests.cjs. Serve arcade on localhost:8766 in a supported environment, then run that suite. Do not describe the simulated DOM checks as real-browser QA.

## Rule sources (checked 2026-10-02)

- [Pagat：Dou Dizhu](https://www.pagat.com/climbing/doudizhu.html)

Implementation is original; the links document the rules and explicitly selected local variants.
