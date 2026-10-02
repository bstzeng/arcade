# 商隊交易

買賣有限貨物、規劃糧食與護衛，穿越有風險的商路完成合約並返鄉。

## Delivered mode

100 fixed missions in five 20-level chapters, with deterministic DOM-free engine, game-specific interactive renderer, local save, undo, reset, chapter/level selector, strategic hints and isolated step-by-step winning demonstration. No backend, external API, installation, or random hidden opponent.

## Distinguishing mechanics

- 城市價格與有限庫存
- 食物和貨物共用載重
- 道路天數、風險、護衛
- 一次性合約及返鄉現金

## Player rules

- 貨物每件占一格，每 3 份糧食合占一格（向上取整）。買貨與補糧不能超過載重。
- 每條路會消耗標示天數的糧食；出發前必須備足。風險會扣生命並遺失背包順序最前的一件貨物。
- 聘請護衛花指定費用，保護下一段道路；無論道路是否危險，抵達後護衛離隊。
- 各城市買賣價格固定，庫存有限、不會刷新；出售貨物不補回商店庫存，不能靠無限買賣刷錢。
- 合約需在指定城市交付指定貨物數量，獎金只領一次。完成合約後還要安全返鄉達到現金目標；超時或生命歸零失敗。

## Corpus and proof

- Entry: games/caravan-trade.html
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
- node games/caravan-trade/verify.cjs
- node games/management-common/audit.cjs (all ten)

Regenerate deterministic data: node games/management-common/generate.cjs caravan-trade

## QA limitation

Real desktop/mobile browser visual and pointer/touch checks have not run because preview is currently blocked. The release must not present simulated DOM tests as that missing browser gate.
