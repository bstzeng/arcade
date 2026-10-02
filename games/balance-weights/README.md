# 天平重量 — 100 challenges

Entry: `games/balance-weights.html`. All assets are static and offline, with no build step, service, analytics, paid asset, or external API.

## Rules and interaction

相同字母的砝碼重量相同，各重量為範圍內的正整數。每條天平線索給出砝碼組合的總重量。所有方程組都有非零行列式，且附有符合範圍的解，因此解唯一。

調整每個砝碼的整數重量，讓全部天平平衡。

## Content and evidence

- 100 stable IDs `balance-weights-001` through `balance-weights-100`.
- `levels.json` contains puzzle-only data; `proofs.json` contains separate executable witnesses. `levels.js` serializes both for offline browser loading.
- Canonical deduplication: Equation set minimized over unknown-variable permutations and equation order.
- Generation/proof: Integer full-rank 3-variable then 4-variable equations, with independently enumerated weight domains proving one solution. Nonzero determinant is additional generator evidence.
- Proof kind: `assignment`. No optimality claim. Uniqueness is claimed only for remainder-code, balance-weights, and difference-sequence.
- `engine.js` is this game's deterministic DOM-free rule engine. It exports `createState`, `validateState`, `legalActions`, `applyAction`, `inspect`, and `canonicalKey`. State JSON never uses BigInt; internal exact arithmetic may.
- Common code in `../numeric-common/` provides arithmetic, persistence, and rendering. Each mechanic has a distinct interactive UI, not a multiple-choice reskin.

## Verify

Run from any directory:

```sh
node arcade/games/balance-weights/test.cjs
node arcade/games/balance-weights/controller-tests.cjs
node arcade/games/balance-weights/ui-test.cjs
node arcade/games/balance-weights/boundary-tests.cjs
node arcade/games/balance-weights/verify.cjs
```

`verify.cjs` uses the independent shared audit implementation, which does not import generators or engines. Engine witness replay is checked separately. Simulated DOM tests render, select, preview, hint, solve via the actual mechanic-specific UI controls, undo, and reload all 100 levels. Completion reads current rules, never matches only the saved answer. Corrupt stored records are rejected by replay. Replay uses independent state, never grants completion, and marks assistance.

Regeneration is deterministic: `node arcade/games/balance-weights/generate.cjs`. It writes only this game's levels and witnesses.

## Limits and browser QA

Browser visual QA is pending the coordinated release. Local Chromium launch failed on restricted IPC sockets; cloud browser does not allow file URLs. No browser pass is claimed. `numeric-common/browser-tests.cjs` is ready for an authorized browser/HTTP environment. Its suite includes real interaction, desktop/mobile screenshot checks, preview isolation, 100-level controller completion, and reload.

No timer, account, backend, purchase, or network is required. Saved progress is browser-local and can disappear when storage is cleared.
