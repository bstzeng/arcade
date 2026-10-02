# 生態保育園

逐季修復棲地、灌溉、野放與遷移，平衡草、兔與狐的透明食物網。

## Delivered mode

100 fixed missions in five 20-level chapters, with deterministic DOM-free engine, game-specific interactive renderer, local save, undo, reset, chapter/level selector, strategic hints and isolated step-by-step winning demonstration. No backend, external API, installation, or random hidden opponent.

## Distinguishing mechanics

- 棲地生長、容量與天氣
- 食草、捕食、繁殖的有序計算
- 有限管理額度、種子、水與資金
- 生態廊道、野放與遷移

## Player rules

- 這是公開可計算的幻想保育模型，不能當作真實動物飼養或生態管理指引。每季最多執行指定次數管理行動。
- 修復棲地花 4 元，每季生產力 +3、草量上限 +8；補種花 2 元及 1 種子、立刻增加 6 草；灌溉用 1 水、本季生長 +4。
- 每季先將基礎生長、修復、天氣、灌溉加總（最低 0），草不超過上限。每兔接著吃 2 草，不足的兔消失。
- 每狐再捕食 1 兔；獵物不夠的狐消失。非冬季剩餘兔每 3 隻繁殖 1 隻，冬季不繁殖。全部兔消失會立即失敗。
- 育護中心可花 2 元野放一隻兔或狐；存量有限。相連棲地可遷移一隻動物，消耗一個行動。季末領固定補助，所有灌溉與行動額度重置。

## Corpus and proof

- Entry: games/conservation-park.html
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
- node games/conservation-park/verify.cjs
- node games/management-common/audit.cjs (all ten)

Regenerate deterministic data: node games/management-common/generate.cjs conservation-park

## QA limitation

Real desktop/mobile browser visual and pointer/touch checks have not run because preview is currently blocked. The release must not present simulated DOM tests as that missing browser gate.
