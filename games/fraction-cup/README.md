# 分數滿杯 — 100 challenges

Entry: `games/fraction-cup.html`. All assets are static and offline, with no build step, service, analytics, paid asset, or external API.

## Rules and interaction

每片只能放入一個杯子。可以留下多餘的片；所有杯子都必須恰為 1。點片再按「放回桌面」能取出它。程式使用約分整數分數加總，不以小數近似判勝。

選分數片，再點杯子；每杯恰好裝滿 1。

## Content and evidence

- 100 stable IDs `fraction-cup-001` through `fraction-cup-100`.
- `levels.json` contains puzzle-only data; `proofs.json` contains separate executable witnesses. `levels.js` serializes both for offline browser loading.
- Canonical deduplication: Cup count and sorted multiset of reduced fractions.
- Generation/proof: One to three cups; each built from exact positive partitions of 1, mixed with two distractor pieces. Any exact packing accepted; pieces can be left unused.
- Proof kind: `assignment`. No optimality claim. Uniqueness is claimed only for remainder-code, balance-weights, and difference-sequence.
- `engine.js` is this game's deterministic DOM-free rule engine. It exports `createState`, `validateState`, `legalActions`, `applyAction`, `inspect`, and `canonicalKey`. State JSON never uses BigInt; internal exact arithmetic may.
- Common code in `../numeric-common/` provides arithmetic, persistence, and rendering. Each mechanic has a distinct interactive UI, not a multiple-choice reskin.

## Verify

Run from any directory:

```sh
node arcade/games/fraction-cup/test.cjs
node arcade/games/fraction-cup/controller-tests.cjs
node arcade/games/fraction-cup/ui-test.cjs
node arcade/games/fraction-cup/boundary-tests.cjs
node arcade/games/fraction-cup/verify.cjs
```

`verify.cjs` uses the independent shared audit implementation, which does not import generators or engines. Engine witness replay is checked separately. Simulated DOM tests render, select, preview, hint, solve via the actual mechanic-specific UI controls, undo, and reload all 100 levels. Completion reads current rules, never matches only the saved answer. Corrupt stored records are rejected by replay. Replay uses independent state, never grants completion, and marks assistance.

Regeneration is deterministic: `node arcade/games/fraction-cup/generate.cjs`. It writes only this game's levels and witnesses.

## Limits and browser QA

Browser visual QA is pending the coordinated release. Local Chromium launch failed on restricted IPC sockets; cloud browser does not allow file URLs. No browser pass is claimed. `numeric-common/browser-tests.cjs` is ready for an authorized browser/HTTP environment. Its suite includes real interaction, desktop/mobile screenshot checks, preview isolation, 100-level controller completion, and reload.

No timer, account, backend, purchase, or network is required. Saved progress is browser-local and can disappear when storage is cleared.
