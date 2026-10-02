# 劇院經理

選角、排練與跨舞台排程，管理演員疲勞，讓每場演出達到品質目標。

## Delivered mode

100 fixed missions in five 20-level chapters, with deterministic DOM-free engine, game-specific interactive renderer, local save, undo, reset, chapter/level selector, strategic hints and isolated step-by-step winning demonstration. No backend, external API, installation, or random hidden opponent.

## Distinguishing mechanics

- 角色技能匹配
- 舞台與演員同時衝突
- 可編輯的日程
- 排練依赖、疲勞及品質公式

## Player rules

- 先為每齣戲每個角色選擇不同演員，技能須達最低要求。排入場次後該齣戲不能再換角，可移除所有場次後重選。
- 排練和演出都占一個舞台與一個時段。同時間不可共用演員，也不能讓同齣戲占兩場。演員缺席與舞台保養時段不可排入。
- 排程只可在第一時段推進前修改。按「推進下一時段」依日程執行；正式演出之前要先完成指定次數排練。
- 每次工作增加 2 疲勞，空檔恢復 2。品質 = 角色技能總和 + 排練次數×2 − 各演員超過 2 的疲勞總和。
- 每次排練有成本，每時段都要付租金；演出達標才收取票房。排練不足、品質不合格、資金為負或閉幕時缺演均失敗。

## Corpus and proof

- Entry: games/theater-manager.html
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
- node games/theater-manager/verify.cjs
- node games/management-common/audit.cjs (all ten)

Regenerate deterministic data: node games/management-common/generate.cjs theater-manager

## QA limitation

Real desktop/mobile browser visual and pointer/touch checks have not run because preview is currently blocked. The release must not present simulated DOM tests as that missing browser gate.
