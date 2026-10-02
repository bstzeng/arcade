# 真話與謊言

100 個固定、可選關、可離線遊玩的題目。核心玩法：一致真假身分。

- Entry: `../truth-liars.html`
- Fixed corpus: `levels.json` / `levels.js`
- Engine adapter: `engine.js`; implementation: `../clue-common/engine.js`
- Distinct browser renderer: `truth-liars` / corresponding kind branch in `../clue-common/app.js`
- Proof profile: `assignment-unique`
- Generator: `python ../clue-common/generate.py` (run from this directory)
- Independent solver: `python ../clue-common/verify-independent.py`
- Engine/controller tests: `node ../clue-common/test.cjs`
- Shipped-app simulated-DOM tests: `node ../clue-common/test-ui.cjs`
- Real-browser tests: `node ../clue-common/test-browser.cjs` with `CLUE_BASE_URL` set

See `../clue-common/README.md` for exact rules, proof semantics, canonical relabeling/symmetry normalization, difficulty progression, and verification limitations. Real Chromium visual QA remains pending because browser startup/localhost access is blocked in the assigned environment. No publication has occurred.
