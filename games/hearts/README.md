# 傷心小棧（紅心大戰） · HEARTS

The existing `games/hearts.html` catalog identity now opens an original, self-contained full-match Hearts table. There is no duplicate catalog game. New matches randomly deal 52 cards to one human and three AI players, and continue across deals until someone reaches at least 100 points. There is no level unlock requirement.

## Current full-match profile (v3)

- Four players, 13 cards each; 2 is low and Ace high. Pass three cards left, right, across, then keep; repeat this cycle.
- The holder of 2♣ leads the first trick. Follow the led suit if possible; highest card of that suit wins and leads next. There are no trumps.
- On the first trick, an off-suit player cannot discard a heart or Q♠ while any clean card is held. A hand containing only penalty cards may discard one.
- Only a heart breaks hearts. Q♠ does not break hearts in this profile. A heart cannot lead before breaking unless the player holds only hearts. Q♠ may lead after the first trick.
- Each heart is 1 penalty point and Q♠ is 13. Taking all 26 points scores 0 for that player and 26 for each other player.
- After a complete deal, scores are added exactly once. Once anyone reaches 100 or more, the lowest score wins. Tied lowest players share the win; no silent tiebreaker or sudden-death round.
- Passing and playing require a separate confirmation after selecting cards. Random matches have no undo, hints exposing hidden cards, or omniscient autoplay.

## Fair AI and bounded work

`match-ai.js` receives only `match-engine.js` public observations: its own hand, public played cards, counts, score, current trick and legal own choices. Opponents' hands, deal seeds and private pass contents are absent.

- Easy chooses legal plays deterministically from a public-information hash, and passes simple high cards.
- Normal evaluates safe losses, penalty unloading, high cards and short suits.
- Hard uses up to 16 sampled possible distributions of the unseen cards and looks ahead through at most two tricks. Its constraints include public failure-to-follow suit, the hearts-only deduction from a legal unbroken heart lead, and the penalty-only deduction from a forced first-trick penalty discard. It never reads the actual hidden hands. This is a bounded practice AI, not a claim of tournament strength.

## Save and record compatibility

The original page is preserved as `games/hearts-practice.html`, with direct return navigation, its 100 specified positions and original same-device multiplayer. Its storage keys remain `arcade:cards80:v1:hearts` and `arcade:cards80:v1:hearts:progress`. Its frozen old rules and proofs are unchanged; in that legacy variant Q♠ also breaks hearts. Both pages explain this difference.

The new match uses `arcade.hearts.full-match.v3`, preferences use `arcade.hearts.preferences.v3`, and result records use `arcade.hearts.results.v3`. The new save is a seed plus canonical action log; loading replays every legal action instead of trusting serialized hands or totals. Reload pauses before resuming. A Web Locks exclusive lock (`arcade.hearts.active-table.v3`) permits only one active tab to change the game or results. Pausing, hiding or leaving that tab releases ownership; another tab must acquire the lock and adopt newer progress before continuing. Foreign-tab changes pause the stale tab; invalid foreign saves remain blocked until a valid replacement is loaded or a new game is explicitly started. This is an actual browser lock, not a claimed atomic localStorage compare-and-set. In contexts without Web Locks, existing saves remain readable but gameplay is explicitly memory-only and never overwrites saved game/result data. Storage denial also leaves the game playable with an unsaved warning.

A manually entered seed is visibly labeled `seeded` and records separately from fresh `random` games. Seeds are available under the score history for reproducibility. Results are local, noncompetitive, and have no monetary or redeemable value.

## Presentation and assets

The standalone premium UI uses original HTML/CSS card faces, an original inline heart mark, procedural CSS felt/paper textures and optional Web Audio tones. No external fonts, images, tracking, or runtime network dependencies. Desktop fan hand, narrow-phone two-row grid, keyboard controls, reduced motion, three speeds, mute, pause and skip-trick animation are included.

## Files and verification

- `match-engine.js`: immutable transitions, legal moves, scoring, match lifecycle, public observation, save replay.
- `match-ai.js`: public-information policies and bounded two-trick sampling.
- `match-app.js`, `match-style.css`: premium browser UI and persistence controller.
- `match-tests.cjs`: rule fixtures, 150 complete matches, independent legality oracle, replay and hidden-state mutation tests.
- `match-controller-tests.cjs`: actual-controller deterministic DOM simulation. This is not a rendering/browser test.
- `independent-review.cjs`: separate independently authored rules/scoring/persistence/AI test suite.

Run from repository root:

    node games/hearts/match-tests.cjs
    node games/hearts/match-controller-tests.cjs
    node games/hearts/independent-review.cjs
    node games/hearts/controller-review.cjs
    node games/hearts/moon-ui-review.cjs
    node games/hearts/concurrent-write-repro.cjs
    node games/hearts/test.cjs
    node games/hearts/controller-tests.cjs

The shared legacy DOM and browser test harnesses route only Hearts to `hearts-practice.html`; no shared game runtime changed. Real-browser visual and interaction acceptance must be recorded separately against the final deployed revision. Simulation success is not real-browser proof.

## Rules references and explicit selections (checked 2026-10-04)

- [Bicycle Hearts](https://bicyclecards.com/how-to-play/hearts/) documents the 52-card four-player game, following suit, point values, moon scoring and 100-point finish. Its break rule includes Q♠, which is retained only in the frozen legacy practice profile.
- [Tabletopia Hearts rules](https://c.tabletopia.com/games/hearts/rules/hearts-rules/en) documents the hearts-only break convention and the passing/keep cycle. Its initial passing order differs; this game's explicit left/right/across/keep order and first-trick exception are frozen above.

The on-screen rules are the full-match contract, including exceptional all-penalty hands and shared-lowest ties.

---

# Legacy practice documentation (unchanged rules and proofs)

The documentation below describes only `hearts-practice.html`, its original shared engine, and its existing 100 specified positions. References to the live engine and two AI levels here belong to that legacy page, not the new v3 match table.

# 紅心大戰 · HEARTS

避開紅心與黑桃皇后，讓自己的失分最低。

## Frozen local variant

四人 Black Lady・左／右／對面／不傳・射月加他家 26

- 每副 13 墩；無王牌，首出花色最大牌吃墩並領下一墩。
- 第一墩不能墊紅心或 Q♠，除非只有罰分牌。紅心或 Q♠被墊出後視為破心；未破心不能領紅心，除非手上全是紅心。
- 射月者 0 分，其餘各 26 分。牌桌顯示本副與累積失分；先達 100 分時以累積最低者勝，可開始新場。

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

    node games/hearts/test.cjs
    node games/hearts/controller-tests.cjs

The content verifier replays all 100 prefixes and witnesses; a separate rule checker validates card ownership, conservation, move rules, card rankings and scoring; hidden-information mutation tests confirm invariant observations and AI choices. Self-play and targeted fixtures cover full round endings and special rules. Controller tests cover stale workers, reset, replay cancellation, undo, malformed saves and round switching. The actual shipped app is exercised by a deterministic simulated DOM harness; this is explicitly not a pixel-rendering test.

Real Chromium desktop/mobile QA is pending due to executor socket / localhost restrictions. A ready-to-run Playwright suite is at ../cards80-common/browser-tests.cjs. Serve arcade on localhost:8766 in a supported environment, then run that suite. Do not describe the simulated DOM checks as real-browser QA.

## Rule sources (checked 2026-10-02)

- [Bicycle：Hearts](https://bicyclecards.com/how-to-play/hearts/)

Implementation is original; the links document the rules and explicitly selected local variants.
