# Social Club: 15 distinct games

This family adds 15 social-deduction/allegiance games, without modifying the existing collection. It is a static, offline-capable set of HTML pages. No runtime dependency, network account, external language model, online matchmaking or real-money transaction is used.

## Entry points and modes

Each `games/<id>.html` loads the common core, that game's engine, its authored level catalog and the shared UI. Every game has:

- 100 deterministic fixed scenarios. The full legal successful trace is stored in `games/<id>/proof.json`.
- Replayable single-player freeplay with local role bots.
- Same-device hotseat, with a private handoff curtain before every new actor. It is not network multiplayer. Asymmetric games retain their investigator/leader/visitor or buyer/seller roles.
- Chinese rules, role cards, action descriptions, public evidence and outcome review.
- Separate independent-completion and assisted-demo progress. Fixed scenarios always use normal policy. Freeplay/hotseat do not add challenge completions.
- JSON persistence for solo mode; active hotseat secrets are intentionally not persisted.

The role curtain protects against accidental shared-screen disclosure, not someone inspecting the device's memory or JavaScript. Solo saves include the local complete state. This is not an anti-cheat or cryptographically private application.

## Architecture and information boundaries

`core.js` supplies a deterministic immutable transition contract:

- `create(id, seed, mode, difficulty)` creates the full referee state.
- `view(state, actor)` projects public facts and that actor's private knowledge. Other roles, secret ballots, cards and truth are omitted until final reveal.
- `actions(view)` enumerates legal structured actions. Freehand drawing has additional bounded coordinate validation.
- `step(state, action)` validates then clones/reduces state; invalid actions cannot mutate the old state.
- `bot(view)` receives only a role-filtered projection, never referee state. Bot policies are deterministic and use public history, their own role/word/map/cards and permitted investigation results.
- `solve(state)` is an author/demo witness policy. It **can see the referee state** and must never be used as an opponent policy. The UI only uses it in explicitly marked assisted demonstrations.

Structured dialogue is a limited vocabulary of claims, questions, answers, offers and commitments. It does not understand arbitrary typed conversation. Fake-painter has actual pointer-drawn vector strokes and accessible line tools; its fake bot copies visible strokes and makes a coarse aspect-ratio/preference guess, not semantic image understanding.

The 15 rule engines are separate modules with different state machines and objectives:

1. **Night Werewolf:** simultaneous night abilities, private seer checks, public claims, secret exile ballots, deaths and faction parity.
2. **Station Impostor:** 3×3 movement, oxygen, repair damage, sabotage tool evidence, audits and ejection meetings.
3. **Word Undercover:** private paired words, two description rounds, evidence-based odd-word ballots; 24 actual word pairs.
4. **Resistance Squad:** team construction, majority approval, hidden success/sabotage and a three-mission threshold. Fixed scenarios have cleared loyal members and varying match progress; freeplay rotates leaders without cleared membership.
5. **Authentic Collector:** expert-only authenticity, claims, paid characteristic inspection, sealed-budget auctions, tie priority and collection value.
6. **Traitor Caravan:** secret aggregate contributions, blocking guards, sabotage, consumable private audits and five resource-sensitive route choices.
7. **Fake Painter:** shared vector drawing, two to four rounds, imitation evidence, secret accusation vote and a final fake's theme guess.
8. **Alibi Interrogation:** partners choose a story; individual memories differ; investigator asks bounded, separate questions and must record two contradictions before a supported accusation.
9. **Anonymous Orders:** six distinct private goal predicates, public inventories/travel/gifts/trades, a masking period, goal guesses and personal scores.
10. **Hidden King:** role-private candidate clues, scouts, concealment, simultaneous shields/assassinations and a variable survival deadline. Assassins deduce from their own permitted clues.
11. **Mist Expedition:** five layers, partial maps assigned to specific guides, false recommendations, two limited torches and consequential path decisions.
12. **Intelligence Exchange:** actual card ownership changes, proposed exchanges accepted according to the recipient's collecting goal, paid purchase, paid verification and a three-bit code.
13. **Secret Covenant:** freely chosen partners, two contract kinds, accept/reject, simultaneous cooperate/betray payoffs, reputation, directed relationships and a final vote. Freeplay rotates proposers for twelve negotiations.
14. **Monster Masquerade:** five asymmetric visitors, potentially false spoken answers, limited physical tests, three-feature parity and admission errors. All species rules are explicitly fictional.
15. **Majority Trap:** sealed color/stake ballots, non-binding preference polls, four changing population rules, public past outcomes and risk-sensitive scoring.

## Challenge proof scope

`generate.cjs` evaluates candidate deterministic worlds and records 100 distinct successful fixed-policy scenarios per game. Canonical signatures exclude seed, level number, action-label text and presentation metadata. They include the operative initial world and policy trace; fake-painter also excludes non-fake actors' inactive guessing preferences.

These are **existence witnesses against the bundled fixed policies**. They are not minimax certificates, universal forced wins, unique-solution claims or a guarantee that hidden truth can be deduced without risk from every decision point. Witness authoring can use hidden truth. UI and manifest disclose this scope. Freeplay and human hotseat choices invalidate the fixed-policy guarantee.

The three difficulty chapter labels are presentation sections, not measured human difficulty. The separate AI-style control changes only Werewolf freeplay role composition and Majority Trap stake/forecast policy; it is disabled where there is no implemented alternative policy.

## Verification

Run from the arcade root:

```
node games/social120-common/art.cjs
node games/social120-common/generate.cjs
node games/social120-common/verify.cjs
node games/social120-common/verify-ui.cjs
node games/social120-common/freeze.cjs
node games/social120-common/verify-package.cjs
```

`verify.cjs` replays all 1,500 stored witnesses through the actual engine, checks bot actions against role projections, alternate legal moves, rejected illegal moves, source hashes, reset determinism, JSON round trips and 225 terminating freeplay matches. Hidden-leaf counterfactuals whose projected observations remain unchanged must leave bot decisions unchanged.

`verify-ui.cjs` is a **VM DOM/controller contract simulation**, not a browser or visual test. It checks all 15 manual completion flows, reload/reset, assisted completion separation, hotseat curtain transitions, absence of private panels behind the curtain, non-persistence of hotseat states denied-storage fallback, fractional/out-of-range saved levels, malformed saved progress, changed checkpoint payloads, visibility/blur/pagehide interruption, stale callback rejection and no automatic replay restart. A paused demonstration stays marked assisted; resumption requires an explicit new demo click. Hotseat private cards also hide on focus loss.

CSS is designed for 333 px and 400 px phones and desktop; touch targets, wrapping, reduced-motion preference and keyboard action buttons are implemented. Actual browser rendering, pointer interaction, viewport measurements and hosted smoke checks remain separate release gates owned by the parent.

## Files for integration

- `catalog.json`: 15 lobby records with exact proposed Chinese titles and `primaryCategory: social`.
- `release-manifest.json`: contract, proof paths, policy/privacy scope and test commands.
- `verification-report.json`: source-bound engine coverage.
- `ui-verification-report.json`: simulated controller coverage.
- `source-hashes.json`: final source hashes, generated by `freeze.cjs`.
- `art.cjs` and each game’s `art.svg`: 15 mechanic-specific, accessible, local SVG illustrations. Catalog records carry `artFile`, `artPath` and `cover`.
- `verify-package.cjs`: copies only manifest-allowlisted files to a clean temporary directory, then reruns all engine/UI tests and checks SVG geometry distinctness.

The frozen package includes runtime files, levels, witnesses, metadata, catalogs, test scripts, generators, documentation, artwork and fresh reports. The manifest itself is explicitly listed in `packageFiles` but does not hash itself. `source-hashes.json` excludes its own hash to avoid a circular digest; the release manifest binds it separately.

No publication, browser session, existing-game change or lobby change was performed by this family worker.
