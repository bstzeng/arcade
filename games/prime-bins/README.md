# 質因數分箱 — 100 challenges

Entry: `games/prime-bins.html`. All assets are static and offline, with no build step, service, analytics, paid asset, or external API.

## Rules and interaction

每張質數片只能放入一個箱子；空箱乘積為 1。每個箱子的片相乘必須等於目標，可以留下多餘片。採用 BigInt 整數計算，沒有捨入。

選質因數，再點箱子，讓乘積等於箱上目標。

## Content and evidence

- 100 stable IDs `prime-bins-001` through `prime-bins-100`.
- `levels.json` contains puzzle-only data; `proofs.json` contains separate executable witnesses. `levels.js` serializes both for offline browser loading.
- Canonical deduplication: Sorted target products and sorted multiset of prime pieces.
- Generation/proof: Two then three product bins using primes 2, 3, 5, 7, 11 and a distractor. Independent BigInt multiplication validates all targets; alternative allocations are allowed.
- Proof kind: `assignment`. No optimality claim. Uniqueness is claimed only for remainder-code, balance-weights, and difference-sequence.
- `engine.js` is this game's deterministic DOM-free rule engine. It exports `createState`, `validateState`, `legalActions`, `applyAction`, `inspect`, and `canonicalKey`. State JSON never uses BigInt; internal exact arithmetic may.
- Common code in `../numeric-common/` provides arithmetic, persistence, and rendering. Each mechanic has a distinct interactive UI, not a multiple-choice reskin.

## Verify

Run from any directory:

```sh
node arcade/games/prime-bins/test.cjs
node arcade/games/prime-bins/controller-tests.cjs
node arcade/games/prime-bins/ui-test.cjs
node arcade/games/prime-bins/boundary-tests.cjs
node arcade/games/prime-bins/verify.cjs
```

`verify.cjs` uses the independent shared audit implementation, which does not import generators or engines. Engine witness replay is checked separately. Simulated DOM tests render, select, preview, hint, solve via the actual mechanic-specific UI controls, undo, and reload all 100 levels. Completion reads current rules, never matches only the saved answer. Corrupt stored records are rejected by replay. Replay uses independent state, never grants completion, and marks assistance.

Regeneration is deterministic: `node arcade/games/prime-bins/generate.cjs`. It writes only this game's levels and witnesses.

## Limits and browser QA

Browser visual QA is pending the coordinated release. Local Chromium launch failed on restricted IPC sockets; cloud browser does not allow file URLs. No browser pass is claimed. `numeric-common/browser-tests.cjs` is ready for an authorized browser/HTTP environment. Its suite includes real interaction, desktop/mobile screenshot checks, preview isolation, 100-level controller completion, and reload.

No timer, account, backend, purchase, or network is required. Saved progress is browser-local and can disappear when storage is cleared.
