# 餘數密碼 — 100 challenges

Entry: `games/remainder-code.html`. All assets are static and offline, with no build step, service, analytics, paid asset, or external API.

## Rules and interaction

密碼是指定範圍內的整數。它除以每個指定除數，必須得到指定餘數。每題都已完整枚舉範圍，確認恰有一個解；線索會即時顯示你的數字得到的餘數。

比對三個餘數，輸入範圍內的整數。

## Content and evidence

- 100 stable IDs `remainder-code-001` through `remainder-code-100`.
- `levels.json` contains puzzle-only data; `proofs.json` contains separate executable witnesses. `levels.js` serializes both for offline browser loading.
- Canonical deduplication: Bounds and sorted modulus/remainder constraints.
- Generation/proof: Integer candidates are exhaustively enumerated in each stated range, proving exactly one matching code. Range progresses from 99 to 299 to 599.
- Proof kind: `assignment`. No optimality claim. Uniqueness is claimed only for remainder-code, balance-weights, and difference-sequence.
- `engine.js` is this game's deterministic DOM-free rule engine. It exports `createState`, `validateState`, `legalActions`, `applyAction`, `inspect`, and `canonicalKey`. State JSON never uses BigInt; internal exact arithmetic may.
- Common code in `../numeric-common/` provides arithmetic, persistence, and rendering. Each mechanic has a distinct interactive UI, not a multiple-choice reskin.

## Verify

Run from any directory:

```sh
node arcade/games/remainder-code/test.cjs
node arcade/games/remainder-code/controller-tests.cjs
node arcade/games/remainder-code/ui-test.cjs
node arcade/games/remainder-code/boundary-tests.cjs
node arcade/games/remainder-code/verify.cjs
```

`verify.cjs` uses the independent shared audit implementation, which does not import generators or engines. Engine witness replay is checked separately. Simulated DOM tests render, select, preview, hint, solve via the actual mechanic-specific UI controls, undo, and reload all 100 levels. Completion reads current rules, never matches only the saved answer. Corrupt stored records are rejected by replay. Replay uses independent state, never grants completion, and marks assistance.

Regeneration is deterministic: `node arcade/games/remainder-code/generate.cjs`. It writes only this game's levels and witnesses.

## Limits and browser QA

Browser visual QA is pending the coordinated release. Local Chromium launch failed on restricted IPC sockets; cloud browser does not allow file URLs. No browser pass is claimed. `numeric-common/browser-tests.cjs` is ready for an authorized browser/HTTP environment. Its suite includes real interaction, desktop/mobile screenshot checks, preview isolation, 100-level controller completion, and reload.

No timer, account, backend, purchase, or network is required. Saved progress is browser-local and can disappear when storage is cleared.
