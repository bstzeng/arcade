# 飛行棋

Traditional Chinese single-device multiplayer with independently configurable human/AI seats and easy, normal and hard AI. No network account or level unlocks required. Open the sibling HTML through a static HTTP server.

## Implementation
- `engine.js`: immutable legal-move engine and bounded heuristic AI; CommonJS-compatible for testing.
- `session.js`: round checkpoints, restore validation, undo, cancellation generations; flight dice tape prevents undo rerolls.
- `app.js` / `worker.js`: responsive SVG controller with worker token plus session-epoch guards, restart confirmation, pause and dialog cancellation.
- `style.css`: responsive desktop/mobile layout and keyboard focus.
- Explicit rules and variant choices appear in the in-game Traditional Chinese help dialog. AI difficulties are bounded strategies, not perfect play.

## Tests
Run `node games/aeroplane-chess/rules-tests.cjs` and `node games/aeroplane-chess/controller-tests.cjs` from the collection root. Tests regenerate this game's verification.json. Rules include all seat counts, three AI levels, tactical fixtures and legal state transitions. Controller tests exercise the actual app in a minimal DOM VM, persistence failures, restart and stale worker handling; these are not browser visual tests. Native browser smoke and responsive checks may be recorded separately.

## Scope and limitations
Local same-device play only. Saves live in this browser; storage failures are surfaced. AI is stochastic at easy/hard levels and does not guarantee a win. No fixed puzzle-level count applies to these match-based games.
