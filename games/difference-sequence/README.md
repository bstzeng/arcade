# 差分數列 — 100 challenges

Entry: `games/difference-sequence.html`. All assets are static and offline, with no build step, service, analytics, paid asset, or external API.

## Rules and interaction

相鄰兩項的後項減前項稱一階差分；再做一次得到二階差分，依此類推。本題明確指定第幾階的每個差分都等於哪個常數，沒有任意猜規律。指定的階差分與足夠固定項唯一確定整列。

依指定階差分與固定項，填完整數列。

## Content and evidence

- 100 stable IDs `difference-sequence-001` through `difference-sequence-100`.
- `levels.json` contains puzzle-only data; `proofs.json` contains separate executable witnesses. `levels.js` serializes both for offline browser loading.
- Canonical deduplication: Specified difference order, exact terminal difference, and fixed indexed anchors.
- Generation/proof: Orders 1–3. A fixed d-th difference plus d distinct indexed anchors uniquely fixes a degree-at-most-d discrete polynomial. Values are integers in −1000…1000; witnesses replay all missing values.
- Proof kind: `assignment`. No optimality claim. Uniqueness is claimed only for remainder-code, balance-weights, and difference-sequence.
- `engine.js` is this game's deterministic DOM-free rule engine. It exports `createState`, `validateState`, `legalActions`, `applyAction`, `inspect`, and `canonicalKey`. State JSON never uses BigInt; internal exact arithmetic may.
- Common code in `../numeric-common/` provides arithmetic, persistence, and rendering. Each mechanic has a distinct interactive UI, not a multiple-choice reskin.

## Verify

Run from any directory:

```sh
node arcade/games/difference-sequence/test.cjs
node arcade/games/difference-sequence/controller-tests.cjs
node arcade/games/difference-sequence/ui-test.cjs
node arcade/games/difference-sequence/boundary-tests.cjs
node arcade/games/difference-sequence/verify.cjs
```

`verify.cjs` uses the independent shared audit implementation, which does not import generators or engines. Engine witness replay is checked separately. Simulated DOM tests render, select, preview, hint, solve via the actual mechanic-specific UI controls, undo, and reload all 100 levels. Completion reads current rules, never matches only the saved answer. Corrupt stored records are rejected by replay. Replay uses independent state, never grants completion, and marks assistance.

Regeneration is deterministic: `node arcade/games/difference-sequence/generate.cjs`. It writes only this game's levels and witnesses.

## Limits and browser QA

Browser visual QA is pending the coordinated release. Local Chromium launch failed on restricted IPC sockets; cloud browser does not allow file URLs. No browser pass is claimed. `numeric-common/browser-tests.cjs` is ready for an authorized browser/HTTP environment. Its suite includes real interaction, desktop/mobile screenshot checks, preview isolation, 100-level controller completion, and reload.

No timer, account, backend, purchase, or network is required. Saved progress is browser-local and can disappear when storage is cleared.
