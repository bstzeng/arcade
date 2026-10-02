# Spatial expansion infrastructure

Ten distinct games, 1,000 fixed challenges. `release-manifest.json` is the integration inventory. Each game owns its entry page, engine, renderer, fixed corpus, inline proof certificates and audit. This directory supplies only low-level geometry helpers, a lifecycle mount, styling, a deterministic corpus builder and independent verification infrastructure. The ten action schemas and completion models are different.

- `generate.cjs [slug ...]`: reproduce corpus files. Candidate generation is bounded and rejects repeated normalized constraints.
- `oracle.cjs`: independent action/goal/normalization implementation; imports no game engines or production helpers.
- `verify.cjs`: all 1,000 proofs, normalized uniqueness, rule fixtures, reproducibility and isolated lifecycle tests.
- `dom-harness.cjs`, `dom-tests.cjs`: load the real HTML's scripts in order and drive game-specific DOM/SVG controls for all 1,000 levels; this is not browser rendering.
- `browser-qa.cjs`: full visible-control Chromium suite retained for an environment supporting browser/local sockets.

The browser gate is openly pending: local Chromium cannot make sockets in this sandbox and cloud-browser localhost navigation is blocked. The release owner must not turn simulated DOM evidence into a browser pass. No publication occurred.
