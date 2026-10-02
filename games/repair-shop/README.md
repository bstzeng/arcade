# 二手修理店

用檢測排除故障，規劃零件到貨與工具升級，修好二手物品再出售。

## Delivered mode

100 fixed missions in five 20-level chapters, with deterministic DOM-free engine, game-specific interactive renderer, local save, undo, reset, chapter/level selector, strategic hints and isolated step-by-step winning demonstration. No backend, external API, installation, or random hidden opponent.

## Distinguishing mechanics

- 陰性／陽性診斷證據
- 有限零件庫存及運送交期
- 共用工具投資
- 修理工時、品質與售出收益

## Player rules

- 每件物品只有一個故障，初始可能是電路、傳動或訊號。檢測花費 1 元與 1 小時；陽性直接鎖定故障，兩次陰性也能排除到唯一可能。
- 只能在診斷確定後修理，需消耗一個正確零件及指定等級工具。修理工時依物品而異，售出再花 1 小時。
- 訂購零件消耗資金與 1 小時；到貨時間從下單前時刻起算，時間推進時自動到貨。可穿插其他工作節省等待。
- 工具為全店共用，升級一次花指定費用與 1 小時。市場零件數量有限，沒有無限刷新。
- 故障答案不直接顯示；解答示範會透過相同檢測取得證據，再執行修理。超過交期即失敗。

## Corpus and proof

- Entry: games/repair-shop.html
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
- node games/repair-shop/verify.cjs
- node games/management-common/audit.cjs (all ten)

Regenerate deterministic data: node games/management-common/generate.cjs repair-shop

## QA limitation

Real desktop/mobile browser visual and pointer/touch checks have not run because preview is currently blocked. The release must not present simulated DOM tests as that missing browser gate.
