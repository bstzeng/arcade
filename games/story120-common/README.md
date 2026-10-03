# Fifteen causal stories

15 distinct Traditional Chinese narrative/roleplaying systems, with 100 configured objective scenarios each and an optional free-story mode. Exact proposal text is frozen in spec.json. No historical game or shared historical source is modified by this family.

## Design

The radio's broadcasts determine later callers; seven letters have separate effects and a real delayed-delivery queue; council promises are scarce assets that must actually be delivered after voting; pawned memories remove dialogue; an adult heir's learned skills unlock concrete dispute resolution and alter consent to transfer; the last boat removes one character while the remaining two continue; testimony can contaminate a later witness; the substitute ruler's private disclosures change later support; three identities promise the same scarce bridge; old-age claims are constrained by young-age documents; opposing roles inherit the previous chapter's city; secrets track exactly who knows which topic; retirement sites progress even without visits; swapped lives leave real obligations on return; and final-wish interpretations create cross-clause obligations and family consent.

Mission order, directed links and special public constraints alter the causal process. Each ending goal also constrains two observable consequences. These are compositional story scenarios, not 1,500 independently written novels. Multiple coherent endings may be acceptable in life; the challenge asks the player to reach one specified outcome, not to identify a universal moral answer. Every mission includes at least two distinct legal traces.

## Runtime and controls

Open any of the fifteen entry HTML files through the site server. All resources are same-origin static files. Choice buttons, level/mode selectors, help, hint, demo and reset are the only public controls. Tab/Enter works throughout. The layout is scoped and responsive; relationship tables and full journals scroll internally. There are no external fonts, libraries, AI services, accounts or audio requirements.

The UI uses engine.js (fifteen distinct state-transition definitions), session.js (public action/controller lifecycle and replay persistence) and ui.js (renderer plus DOM event handlers). Save files contain action traces, not trusted injected engine state. A stored completion is reconstructed and checked on load. localStorage failure leaves the current story playable. Hints return a concrete feasible continuation when found; search is bounded and honestly reports if it cannot establish a continuation. Demos execute actual legal choices, never assign terminal state. Assisted attempts cannot earn independent completion; earlier independent records survive.

## Local characters

Character negotiation is deterministic and deliberately bounded. A validated four-field observation object contains disclosed evidence, fulfilled commitments, conflicts and urgency. Easy accepts score at least1 and includes urgency; normal requires at least2; hard requires at least3 and doubles conflicts. These tolerances alter actual cooperation and subsequent state. No policy reads hidden motives, future documents or another role's private notes. The UI discloses exact rule scope and displays explanations.

All100 objective scenarios are certified only with normal policy and the challenge difficulty selector is disabled accordingly. Free story offers all three policies but does not award challenge completion. This is not unrestricted generative conversation, a psychological model or an adversarial forced-win claim.

## Reproducible validation

- node games/story120-common/generate.cjs regenerates deterministic corpora/proofs.
- node games/story120-common/build-assets.cjs regenerates entries/catalog/art/per-game READMEs.
- node games/story120-common/verify-all.cjs runs the release gate without rewriting sources.
- node games/story120-common/release.cjs updates SHA-256 bindings after successful final verification.

The gate replays 1,500 primary and 1,500 alternate traces, independently recomputes factual outcomes, verifies each primary via actual UI click/change listeners in a simulated DOM surface, tests meaningful causal regressions and negative actions, confirms policy fairness/difficulty, checks save/reload/malformed data, and regenerates data in memory for byte determinism. It binds all tested sources before execution and verifies unchanged bytes afterward. Browser geometry and hosted QA remain separate and are not implied by the simulated-DOM tests.

Every runtime, test, generator, canonical proposal, data file, art and README is in the source manifest. Only verification-report.json and release-manifest.json are excluded from their own circular source hashes. No screenshots, logs, archives or development dependencies are part of this family.
