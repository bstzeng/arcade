# 魔方陣 — 100 challenges

Entry: `games/magic-square.html`. All assets are static and offline, with no build step, service, analytics, paid asset, or external API.

## Rules and interaction

把 1 至 N² 各填一次，固定綠色線索不能更改。每一行、每一列與兩條主對角線的總和都要相同。前 20 關是 3×3，之後為 4×4。解不一定唯一。

點空格，再從數字盤填入。

## Content and evidence

- 100 stable IDs `magic-square-001` through `magic-square-100`.
- `levels.json` contains puzzle-only data; `proofs.json` contains separate executable witnesses. `levels.js` serializes both for offline browser loading.
- Canonical deduplication: Given grid minimized over all eight rotations/reflections and the value complement v → N² + 1 − v (blank zero remains blank), with size.
- Generation/proof: 20 partial 3×3 squares and 80 partial 4×4 squares use varied fixed clue locations. Given clues, not skins, define distinct challenges. Solutions are independently checked for permutation, rows, columns, diagonals. Multiple solutions are allowed.
- Proof kind: `assignment`. No optimality claim. Uniqueness is claimed only for remainder-code, balance-weights, and difference-sequence.
- `engine.js` is this game's deterministic DOM-free rule engine. It exports `createState`, `validateState`, `legalActions`, `applyAction`, `inspect`, and `canonicalKey`. State JSON never uses BigInt; internal exact arithmetic may.
- Common code in `../numeric-common/` provides arithmetic, persistence, and rendering. Each mechanic has a distinct interactive UI, not a multiple-choice reskin.

## Verify

Run from any directory:

```sh
node arcade/games/magic-square/test.cjs
node arcade/games/magic-square/controller-tests.cjs
node arcade/games/magic-square/ui-test.cjs
node arcade/games/magic-square/boundary-tests.cjs
node arcade/games/magic-square/verify.cjs
```

`verify.cjs` uses the independent shared audit implementation, which does not import generators or engines. Engine witness replay is checked separately. Simulated DOM tests render, select, preview, hint, solve via the actual mechanic-specific UI controls, undo, and reload all 100 levels. Completion reads current rules, never matches only the saved answer. Corrupt stored records are rejected by replay. Replay uses independent state, never grants completion, and marks assistance.

Regeneration is deterministic: `node arcade/games/magic-square/generate.cjs`. It writes only this game's levels and witnesses.

## Limits and browser QA

Browser visual QA is pending the coordinated release. Local Chromium launch failed on restricted IPC sockets; cloud browser does not allow file URLs. No browser pass is claimed. `numeric-common/browser-tests.cjs` is ready for an authorized browser/HTTP environment. Its suite includes real interaction, desktop/mobile screenshot checks, preview isolation, 100-level controller completion, and reload.

No timer, account, backend, purchase, or network is required. Saved progress is browser-local and can disappear when storage is cleared.

## Complement-symmetry correction

Content revision numeric100-r2 includes the arithmetic complement symmetry in addition to D4. The former 001/006 pair is a permanent regression fixture. The generator now rejects that pair and preserves 100 distinct normalized puzzles; no other numeric corpus is regenerated differently.
