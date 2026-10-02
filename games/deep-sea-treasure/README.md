# 潛海尋寶

在礁石、深度與海流間潛行，管理氧氣、載重與補氣罐，帶寶物安全返航。

## Delivered mode

100 fixed missions in five 20-level chapters, with deterministic DOM-free engine, game-specific interactive renderer, local save, undo, reset, chapter/level selector, strategic hints and isolated step-by-step winning demonstration. No backend, external API, installation, or random hidden opponent.

## Distinguishing mechanics

- 氧耗受深度、重量、海流影響
- 耐壓衣、氣瓶與有限補氣
- 鑰匙和封門
- 指定寶物必須實際返回船上

## Player rules

- 點擊相鄰水域移動；礁石無法通過。每下降兩層增加氧耗，超過耐壓衣允許深度不能進入。
- 移動耗氧 = 1 + 目的地深度÷2取整 + 目前載重÷重裝門檻取整；出發格水流方向與移動不同時再 +1。第一排深度為 0。
- 拾取寶物耗 2 氧氣與 1 時間，載重不能超標；攜帶越重，回程越耗氧。丟棄的寶物本次不能再拾取。
- 補氣罐有使用次數，只能在原地補氣；氧量不超過氣瓶上限。船上可花 3 元升級氣瓶一次（+15）或耐壓衣一層。
- 鑰匙在走入該格時取得，可開古船封門。危險水域扣生命；氧氣為負、生命歸零或超時失敗。收集寶物後一定要返回船上才通關。

## Corpus and proof

- Entry: games/deep-sea-treasure.html
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
- node games/deep-sea-treasure/verify.cjs
- node games/management-common/audit.cjs (all ten)

Regenerate deterministic data: node games/management-common/generate.cjs deep-sea-treasure

## QA limitation

Real desktop/mobile browser visual and pointer/touch checks have not run because preview is currently blocked. The release must not present simulated DOM tests as that missing browser gate.
