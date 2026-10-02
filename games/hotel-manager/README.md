# 旅館經理

安排床位、退房清潔與每日員工服務，在薪資與房費間經營多日旅館。

## Delivered mode

100 fixed missions in five 20-level chapters, with deterministic DOM-free engine, game-specific interactive renderer, local save, undo, reset, chapter/level selector, strategic hints and isolated step-by-step winning demonstration. No backend, external API, installation, or random hidden opponent.

## Distinguishing mechanics

- 客房床位與安靜／景觀需求
- 跨日入住與退房清洁
- 多技能員工工時
- 每日服務及薪資、房費

## Player rules

- 每間房同時只能住一位旅客；床位、安靜和景觀需求必須滿足。
- 旅客在入住日至退房前一日每天都需要服務；每次占用需求標示的員工工時，技能也要相符。
- 退房在夜間結算發生；房間變髒，打掃需要任何員工 1 工時。每日員工工時會重置。
- 結束一天會收取已服務旅客的房費，並支付全體薪資；漏接當日旅客、漏服務或現金為負會失敗。
- 操作：客房卡選旅客後入住；入住後選員工服務。可撤銷、選關，或逐步觀看獨立解答盤面。

## Corpus and proof

- Entry: games/hotel-manager.html
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
- node games/hotel-manager/verify.cjs
- node games/management-common/audit.cjs (all ten)

Regenerate deterministic data: node games/management-common/generate.cjs hotel-manager

## QA limitation

Real desktop/mobile browser visual and pointer/touch checks have not run because preview is currently blocked. The release must not present simulated DOM tests as that missing browser gate.
