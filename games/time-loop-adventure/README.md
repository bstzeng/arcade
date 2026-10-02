# 時間循環探險

跨日保留線索記憶，改變水閘與洪水事件，製作信標解除時間循環。

## Delivered mode

100 fixed missions in five 20-level chapters, with deterministic DOM-free engine, game-specific interactive renderer, local save, undo, reset, chapter/level selector, strategic hints and isolated step-by-step winning demonstration. No backend, external API, installation, or random hidden opponent.

## Distinguishing mechanics

- 公開時間表及旅行成本
- 跨日記憶與每日物品重置
- 修水閘改變洪水／通橋事件
- 多輪配方、鏡片、製作與啟動

## Player rules

- 村莊的一天有公開時間表。移動消耗道路標示時間；互動通常 1 時間，製作信標 2 時間。可用等待讓事件出現。
- 主動重置會回到旅舍、時間歸零；齒輪、礦石、信標及水閘狀態都消失。只有已發現的門鎖、星象與鏡片記憶保留。
- 晚間檔案提供門鎖記憶，但工坊早早關門。下一輪在關門前開鎖取齒輪，趕在洪水前修理水閘。
- 修好的水閘讓本日橋梁保全；洪水發生後才能進入天文台研究星象。高階關卡還需要理解配方後在晚間辨識庭園鏡片。
- 最後一輪仍要重新修水閘；採礦、在工坊依記憶製作信標，再到信標塔啟動。超過一天長度會失敗，請在超時前主動重置。

## Corpus and proof

- Entry: games/time-loop-adventure.html
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
- node games/time-loop-adventure/verify.cjs
- node games/management-common/audit.cjs (all ten)

Regenerate deterministic data: node games/management-common/generate.cjs time-loop-adventure

## QA limitation

Real desktop/mobile browser visual and pointer/touch checks have not run because preview is currently blocked. The release must not present simulated DOM tests as that missing browser gate.
