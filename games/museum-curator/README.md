# 博物館策展

配置展品與保存設備，設計參觀動線，兼顧觀眾偏好與行走疲勞。

## Delivered mode

100 fixed missions in five 20-level chapters, with deterministic DOM-free engine, game-specific interactive renderer, local save, undo, reset, chapter/level selector, strategic hints and isolated step-by-step winning demonstration. No backend, external API, installation, or random hidden opponent.

## Distinguishing mechanics

- 可編輯的相鄰參觀動線
- 展廳承重與明亮條件
- 藏品損傷與保護設備
- 逐組到場的偏好、興趣、疲勞

## Player rules

- 點選地圖上的展廳，再選擇展品放置，或延伸入口到出口的參觀動線。動線上下左右相鄰、不重複；全部作品都必須在動線內。
- 每間展廳只能有一件作品；大型作品需要承重 2 的展廳。首次陳列支付借展費，搬移不重複付費。
- 脆弱作品位於明亮展廳時需裝恆溫遮光設備（3 元），否則每次參觀都造成損傷。長椅（2 元）使經過觀眾的疲勞降低 3。
- 開館後每時間格依次入場一組觀眾，走過每個展廳。喜愛主題 +3 興趣，其他 +1；走一格 +1 疲勞，疲勞超標即失敗。
- 抵達出口後再前進一次離館；興趣達標且疲勞合格才付門票。開館後不能改動展場，使用撤銷返回設計。

## Corpus and proof

- Entry: games/museum-curator.html
- engine.js: actual rules; the win predicate does not read the witness.
- view.js: this game's own board and controls.
- levels.json: 100 fixed task definitions. data.js is the browser-ready deterministic copy.
- witnesses.json: 100 reachability witnesses, start-state SHA-256, rule revision, public goal and complete actions.
- canonical-fingerprints.json: symmetry/identity-normalized fingerprints with an explicit method.
- audit.json: all 100 legal replays, separate reference transitions, conservation, boundary tests, generator reproducibility and exact source hashes.
- controller-report.json: actual renderer controls in a simulated DOM on levels 001, 050 and 100. This is not visual/browser QA.

The proof establishes a legal winning plan from the original fixed start. It does not claim unique solutions, shortest plans, random-outcome guarantees, or recovery from every player mistake. Alternate legal winning plans are accepted. Save validation reconstructs the full action transcript and rejects modified or unreachable state.

## Verify

From the arcade root:

- node games/management-common/controller-test.cjs
- node games/museum-curator/verify.cjs
- node games/management-common/audit.cjs (all ten)

Regenerate deterministic data: node games/management-common/generate.cjs museum-curator

## QA limitation

Real desktop/mobile browser visual and pointer/touch checks have not run because preview is currently blocked. The release must not present simulated DOM tests as that missing browser gate.
