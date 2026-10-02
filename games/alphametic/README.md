# 字母算式 — 100 challenges

Entry: `games/alphametic.html`. All assets are static and offline, with no build step, service, analytics, paid asset, or external API.

## Rules and interaction

同一字母代表同一數字，不同字母使用不同數字；多位數最高位不能是零。讓畫面的直式加法成立。題目可能有多組解，任何滿足所有條件的解都接受。

選字母，再按數字鍵填入。

## Content and evidence

- 100 stable IDs `alphametic-001` through `alphametic-100`.
- `levels.json` contains puzzle-only data; `proofs.json` contains separate executable witnesses. `levels.js` serializes both for offline browser loading.
- Canonical deduplication: Canonical first-occurrence letter pattern, minimized over swapping addends.
- Generation/proof: Deterministic arithmetic instances are translated to canonical letter equations; patterns, rather than renamed letters or digit answers, are deduplicated. Two-digit then three-digit equations with 4–8 letters.
- Proof kind: `assignment`. No optimality claim. Uniqueness is claimed only for remainder-code, balance-weights, and difference-sequence.
- `engine.js` is this game's deterministic DOM-free rule engine. It exports `createState`, `validateState`, `legalActions`, `applyAction`, `inspect`, and `canonicalKey`. State JSON never uses BigInt; internal exact arithmetic may.
- Common code in `../numeric-common/` provides arithmetic, persistence, and rendering. Each mechanic has a distinct interactive UI, not a multiple-choice reskin.

## Verify

Run from any directory:

```sh
node arcade/games/alphametic/test.cjs
node arcade/games/alphametic/controller-tests.cjs
node arcade/games/alphametic/ui-test.cjs
node arcade/games/alphametic/boundary-tests.cjs
node arcade/games/alphametic/verify.cjs
```

`verify.cjs` uses the independent shared audit implementation, which does not import generators or engines. Engine witness replay is checked separately. Simulated DOM tests render, select, preview, hint, solve via the actual mechanic-specific UI controls, undo, and reload all 100 levels. Completion reads current rules, never matches only the saved answer. Corrupt stored records are rejected by replay. Replay uses independent state, never grants completion, and marks assistance.

Regeneration is deterministic: `node arcade/games/alphametic/generate.cjs`. It writes only this game's levels and witnesses.

## Limits and browser QA

Browser visual QA is pending the coordinated release. Local Chromium launch failed on restricted IPC sockets; cloud browser does not allow file URLs. No browser pass is claimed. `numeric-common/browser-tests.cjs` is ready for an authorized browser/HTTP environment. Its suite includes real interaction, desktop/mobile screenshot checks, preview isolation, 100-level controller completion, and reload.

No timer, account, backend, purchase, or network is required. Saved progress is browser-local and can disappear when storage is cleared.
