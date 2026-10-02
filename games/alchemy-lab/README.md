# 鍊金研究所

依原料、工具與熱度研究幻想配方，管理燃料、器具耐久與材料質量。

## Delivered mode

100 fixed missions in five 20-level chapters, with deterministic DOM-free engine, game-specific interactive renderer, local save, undo, reset, chapter/level selector, strategic hints and isolated step-by-step winning demonstration. No backend, external API, installation, or random hidden opponent.

## Distinguishing mechanics

- 分支配方 DAG 和兩原料轉化
- 工具解鎖、耐久及保養
- 熱度消耗燃料與時間
- 成品質量與失敗廢料守恆

## Player rules

- 這是幻想材料轉化遊戲，所有名稱與配方都是虛構，不提供現實化學實驗建議。
- 實驗需選兩份原料、工具與熱度。成功消耗兩份原料，產生一份質量等於原料總和的新材料；未命中配方時全部轉為廢料。
- 配方筆記提供明確研究線索，不必盲猜。每次成功首次發現的配方會記入研究數，也能再做相同配方生產多份。
- 熱度 1–3 分別消耗同額燃料和時間。蒸餾器、熔爐各花 4 元與 1 時間解鎖；每把工具用 4 次需花 2 元、1 時間保養。
- 成品可逐份交付，每份只能交一次。原料、燃料、工具耐久與時間有限，質量不會憑空增加。廢料超標或超時失敗。

## Corpus and proof

- Entry: games/alchemy-lab.html
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
- node games/alchemy-lab/verify.cjs
- node games/management-common/audit.cjs (all ten)

Regenerate deterministic data: node games/management-common/generate.cjs alchemy-lab

## QA limitation

Real desktop/mobile browser visual and pointer/touch checks have not run because preview is currently blocked. The release must not present simulated DOM tests as that missing browser gate.
