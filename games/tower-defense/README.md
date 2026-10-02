# 塔防守城

在真實固定時間格戰鬥中配置箭塔、砲塔與冰塔，升級防線抵擋公開敵軍波次。

## Delivered mode

100 fixed missions in five 20-level chapters, with deterministic DOM-free engine, game-specific interactive renderer, local save, undo, reset, chapter/level selector, strategic hints and isolated step-by-step winning demonstration. No backend, external API, installation, or random hidden opponent.

## Distinguishing mechanics

- 敵人實際路徑位置與生命
- 射程、攻速、護甲、濺射、緩速
- 賞金、建造與升級
- 固定時間格且可暫停

## Player rules

- 戰場以固定時間格推進，可單步或每 180ms 自動播放；兩者使用完全相同的模擬。隨時暫停，沒有精準反應時間要求。
- 箭塔：7 元，傷害 3，射程 2.5，每格射擊。砲塔：9 元，傷害 6，射程 2.2，每 3 格射擊，波及目標前後一路徑格。冰塔：6 元，傷害 1，射程 2.8，每 2 格射擊並延遲移動。
- 升級每級 5 元，最高 3 級；每級傷害 +2、射程 +0.25。攻擊優先選最接近城門的敵人，同格按出生順序。
- 每時間格先出生、塔攻擊，再移動存活敵人。護甲降低傷害但至少受到 1；冰凍會使接下來兩次移動延後一格時間。
- 擊殺得到賞金，每波結束獲整備金。穿越終點的敵人扣 1 城防生命。開始波次後不能建塔；示範不會改動玩家盤面。

## Corpus and proof

- Entry: games/tower-defense.html
- engine.js: actual rules; the win predicate does not read the witness.
- view.js: this game's own board and controls.
- levels.json: 100 fixed task definitions. data.js is the browser-ready deterministic copy.
- witnesses.json: 100 fixed-tick real-time witnesses, start-state SHA-256, rule revision, public goal and complete actions.
- canonical-fingerprints.json: symmetry/identity-normalized fingerprints with an explicit method.
- audit.json: all 100 legal replays, separate reference transitions, conservation, boundary tests, generator reproducibility and exact source hashes.
- controller-report.json: actual renderer controls in a simulated DOM on levels 001, 050 and 100. This is not visual/browser QA.

The proof establishes a legal winning plan from the original fixed start. It does not claim unique solutions, shortest plans, random-outcome guarantees, or recovery from every player mistake. Alternate legal winning plans are accepted. Save validation reconstructs the full action transcript and rejects modified or unreachable state.

## Verify

From the arcade root:

- node games/management-common/controller-test.cjs
- node games/tower-defense/verify.cjs
- node games/management-common/audit.cjs (all ten)

Regenerate deterministic data: node games/management-common/generate.cjs tower-defense

## QA limitation

Real desktop/mobile browser visual and pointer/touch checks have not run because preview is currently blocked. The release must not present simulated DOM tests as that missing browser gate.
