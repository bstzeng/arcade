# 24 點 — 100 challenges

Entry: `games/twenty-four.html`. All assets are static and offline, with no build step, service, analytics, paid asset, or external API.

## Rules and interaction

每張數字卡恰好用一次；每一步選兩張卡，依選擇順序運算。減法和除法有方向，除數不能是零。所有運算使用約分後的整數分數，不使用浮點近似。

選兩張牌，用加、減、乘、除與括號湊出 24。

## Content and evidence

- 100 stable IDs `twenty-four-001` through `twenty-four-100`.
- `levels.json` contains puzzle-only data; `proofs.json` contains separate executable witnesses. `levels.js` serializes both for offline browser loading.
- Canonical deduplication: Sorted multiset of four source numbers.
- Generation/proof: Exhaustive ordered binary combination search over reduced rational pairs. Levels are sampled across witness division/fraction complexity; this is not a human difficulty or minimality claim.
- Proof kind: `reachability`. No optimality claim. Uniqueness is claimed only for remainder-code, balance-weights, and difference-sequence.
- `engine.js` is this game's deterministic DOM-free rule engine. It exports `createState`, `validateState`, `legalActions`, `applyAction`, `inspect`, and `canonicalKey`. State JSON never uses BigInt; internal exact arithmetic may.
- Common code in `../numeric-common/` provides arithmetic, persistence, and rendering. Each mechanic has a distinct interactive UI, not a multiple-choice reskin.

## Verify

Run from any directory:

```sh
node arcade/games/twenty-four/test.cjs
node arcade/games/twenty-four/controller-tests.cjs
node arcade/games/twenty-four/ui-test.cjs
node arcade/games/twenty-four/boundary-tests.cjs
node arcade/games/twenty-four/verify.cjs
```

`verify.cjs` uses the independent shared audit implementation, which does not import generators or engines. Engine witness replay is checked separately. Simulated DOM tests render, select, preview, hint, solve via the actual mechanic-specific UI controls, undo, and reload all 100 levels. Completion reads current rules, never matches only the saved answer. Corrupt stored records are rejected by replay. Replay uses independent state, never grants completion, and marks assistance.

Regeneration is deterministic: `node arcade/games/twenty-four/generate.cjs`. It writes only this game's levels and witnesses.

## Limits and browser QA

Browser visual QA is pending the coordinated release. Local Chromium launch failed on restricted IPC sockets; cloud browser does not allow file URLs. No browser pass is claimed. `numeric-common/browser-tests.cjs` is ready for an authorized browser/HTTP environment. Its suite includes real interaction, desktop/mobile screenshot checks, preview isolation, 100-level controller completion, and reload.

No timer, account, backend, purchase, or network is required. Saved progress is browser-local and can disappear when storage is cleared.
