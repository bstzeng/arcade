# 多堆取石 — 100 challenges

Entry: `games/misere-nim.html`. All assets are static and offline, with no build step, service, analytics, paid asset, or external API.

## Rules and interaction

你先手，每回合從單一石堆取走至少一顆。電腦有必勝著時一定選它，無必勝著時採固定合法走法。所有 100 關起點都可必勝；你仍可能走出合法但會輸的選擇。提示只在目前局面可保證勝利時提供必勝著。

一次選一堆取石，拿走最後一顆的人輸。

## Content and evidence

- 100 stable IDs `misere-nim-001` through `misere-nim-100`.
- `levels.json` contains puzzle-only data; `proofs.json` contains separate executable witnesses. `levels.js` serializes both for offline browser loading.
- Canonical deduplication: Sorted multiset of nonzero initial heap sizes.
- Generation/proof: Two to five heaps, increasing total stones. Independent recursive minimax checks all possible legal replies, not just the displayed deterministic opponent. Engine formula is cross-checked over every sorted 1–5 heap state with sizes 1–9. Last taker loses; losing legal actions remain selectable.
- Proof kind: `forced-strategy`. No optimality claim. Uniqueness is claimed only for remainder-code, balance-weights, and difference-sequence.
- `engine.js` is this game's deterministic DOM-free rule engine. It exports `createState`, `validateState`, `legalActions`, `applyAction`, `inspect`, and `canonicalKey`. State JSON never uses BigInt; internal exact arithmetic may.
- Common code in `../numeric-common/` provides arithmetic, persistence, and rendering. Each mechanic has a distinct interactive UI, not a multiple-choice reskin.

## Verify

Run from any directory:

```sh
node arcade/games/misere-nim/test.cjs
node arcade/games/misere-nim/controller-tests.cjs
node arcade/games/misere-nim/ui-test.cjs
node arcade/games/misere-nim/boundary-tests.cjs
node arcade/games/misere-nim/verify.cjs
```

`verify.cjs` uses the independent shared audit implementation, which does not import generators or engines. Engine witness replay is checked separately. Simulated DOM tests render, select, preview, hint, solve via the actual mechanic-specific UI controls, undo, and reload all 100 levels. Completion reads current rules, never matches only the saved answer. Corrupt stored records are rejected by replay. Replay uses independent state, never grants completion, and marks assistance.

Regeneration is deterministic: `node arcade/games/misere-nim/generate.cjs`. It writes only this game's levels and witnesses.

## Limits and browser QA

Browser visual QA is pending the coordinated release. Local Chromium launch failed on restricted IPC sockets; cloud browser does not allow file URLs. No browser pass is claimed. `numeric-common/browser-tests.cjs` is ready for an authorized browser/HTTP environment. Its suite includes real interaction, desktop/mobile screenshot checks, preview isolation, 100-level controller completion, and reload.

No timer, account, backend, purchase, or network is required. Saved progress is browser-local and can disappear when storage is cleared.
