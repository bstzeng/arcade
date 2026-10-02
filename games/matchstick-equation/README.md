# 算式火柴 — 100 challenges

Entry: `games/matchstick-equation.html`. All assets are static and offline, with no build step, service, analytics, paid asset, or external API.

## Rules and interaction

數字採標準七段顯示；只有數字的火柴可以移動，運算符號與等號固定。恰好移動指定根數後，須得到正確加減法，數字不能有前導零。最終被移開的原位置數也必須等於指定根數，不能反覆搬回來湊次數。

先點亮火柴拾起，再點空位放下。

## Content and evidence

- 100 stable IDs `matchstick-equation-001` through `matchstick-equation-100`.
- `levels.json` contains puzzle-only data; `proofs.json` contains separate executable witnesses. `levels.js` serializes both for offline browser loading.
- Canonical deduplication: Initial digit segments, operand lengths, fixed operator, exact move budget.
- Generation/proof: One to three effective match moves. Standard seven-segment digits only; operators/equal sign fixed; no leading zeros. Every pick and drop is independently replayed and net moved-source positions must equal budget.
- Proof kind: `reachability`. No optimality claim. Uniqueness is claimed only for remainder-code, balance-weights, and difference-sequence.
- `engine.js` is this game's deterministic DOM-free rule engine. It exports `createState`, `validateState`, `legalActions`, `applyAction`, `inspect`, and `canonicalKey`. State JSON never uses BigInt; internal exact arithmetic may.
- Common code in `../numeric-common/` provides arithmetic, persistence, and rendering. Each mechanic has a distinct interactive UI, not a multiple-choice reskin.

## Verify

Run from any directory:

```sh
node arcade/games/matchstick-equation/test.cjs
node arcade/games/matchstick-equation/controller-tests.cjs
node arcade/games/matchstick-equation/ui-test.cjs
node arcade/games/matchstick-equation/boundary-tests.cjs
node arcade/games/matchstick-equation/verify.cjs
```

`verify.cjs` uses the independent shared audit implementation, which does not import generators or engines. Engine witness replay is checked separately. Simulated DOM tests render, select, preview, hint, solve via the actual mechanic-specific UI controls, undo, and reload all 100 levels. Completion reads current rules, never matches only the saved answer. Corrupt stored records are rejected by replay. Replay uses independent state, never grants completion, and marks assistance.

Regeneration is deterministic: `node arcade/games/matchstick-equation/generate.cjs`. It writes only this game's levels and witnesses.

## Limits and browser QA

Browser visual QA is pending the coordinated release. Local Chromium launch failed on restricted IPC sockets; cloud browser does not allow file URLs. No browser pass is claimed. `numeric-common/browser-tests.cjs` is ready for an authorized browser/HTTP environment. Its suite includes real interaction, desktop/mobile screenshot checks, preview isolation, 100-level controller completion, and reload.

No timer, account, backend, purchase, or network is required. Saved progress is browser-local and can disappear when storage is cleared.
