# Numeric 10-game batch

10 new browser games, 100 certified challenges each. The ten slugs and proposed lobby rows are in `manifest.json`. Only these new folders, matching HTML entries, and `numeric-common` belong to this batch. No lobby, historical game, root test, or publication file was modified.

`verify-batch.cjs` runs deterministic reproducibility, independent witnesses and normalized deduplication, engines, rule boundaries, persistence/replay tests, and simulated DOM control flows. Generates `batch-verification-report.json`, per-game `game-audit.json`, and `proof-claims.json`.

Independent verifier never imports engines or the generator. Its reduced fractions use BigInt; runtime arithmetic uses reduced safe integer ratios for the bounded puzzle domains. Prime products use BigInt in both, independently implemented. Misère Nim is checked using recursive minimax over all replies; runtime uses the misère formula.

Visual browser QA is explicitly NOT RUN due to environment IPC/protocol restrictions. No deployment has been performed. `browser-tests.cjs` is a prepared suite for the release browser stage.

All interaction/persistence is local. Undo is unlimited. Hints do not modify board state. Solution preview is isolated, is not completion, and preserves the player's board. Unassisted results are preferred over assisted results. All completions are revalidated from legal action history on reload.
