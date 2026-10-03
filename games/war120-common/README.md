# 大規模戰爭與領土爭奪 · 15 games

A native HTML/CSS/JavaScript strategy family with a shared public territory graph/combat model and fifteen distinct causal subsystems. Runtime does not require packages, external services, fonts, analytics, accounts or a build step.

## Reproduction

From arcade:

- `node games/war120-common/generate.cjs`: deterministically regenerate 1,500 semantic mission configurations and their legal fixed-normal-opponent witnesses. Throws if any witness fails.
- `node games/war120-common/build.cjs`: regenerate 15 entry HTML files, distinctive thematic SVGs, per-game rules and catalog.
- `node games/war120-common/verify-all.cjs`: replay all 1,500 witnesses in both runtime and simulated public UI, execute independent victory assertions, alternative legal plans, negative traces, 135 full AI duels, causal/hidden-information tests, persistence/lifecycle/secret-order checks, and source-bound packaging verification. No generation occurs in this command. The independent-audit regression suite also checks decentralized continuity, council relocation/rebuilding, victory after origin loss, actual rail tax/support behavior, cross-layer reinforcement and uniform ceasefire transport filtering.

## Mission evidence and limits

Every game has exactly 100 stable numbered missions. All 100 maps per title have different canonical unlabeled tree topologies, checked with a center-rooted canonical tree encoding, not label/seed/coordinate hashes. Branches enter traversal, command links, territory income, AI scoring and alternate approaches. Mission targets, operational edge phases/types, quotas, upgrades and hold deadlines vary too. Geometry is abstract province adjacency, not realistic geography.

Challenges deliberately lock to the fixed public-state normal AI, with an explicit existence-of-successful-plan claim. Easy and hard are free-skirmish policies, not silently covered by the normal witnesses. No universal forced-win or uniqueness claim is made. Alternate plans are verified separately. Initial-state and wait/recruit-only policies cannot satisfy full objectives.

The `independent.cjs` terminal checker does not import the runtime goal predicate. All proof actions are drawn from actual legal native select options, and execute through the same submit button used by a player. Simulated DOM tests are not browser layout or hosted verification.

## Causal mechanical distinctions

1. Sky: periodic opening edges, anchored connections, cut-off attrition, delivered supply.
2. Robots: counter-module power and mobility traversal; limited per-round production order.
3. Seasons: mountain closure, spring recruitment, autumn crop income, winter food loss and ceasefires.
4. No capital: multiple command roots, friendly-network connectivity and secession. Losing the starting city does not end a challenge; another command network can continue or a surviving town can establish a replacement council before secession.
5. One city: independent ally sieges, costly expedition relief and periodic homeland waves.
6. Neutrals: competing aid, access treaties, annexation treaties, diplomacy damaged by conquest and ceasefires.
7. Tides: closing land bridges plus consumable port-to-port fleet transport.
8. Flags: country-specific land preferences, military pledges, fulfilled grants, loyalty and coalition exit.
9. Rail: contiguous transport construction, connected recruitment, rear capacity and supply deliveries.
10. Memory: persistent war scars, income loss and civilian morale, repair and reconciliation.
11. Orders: equal-snapshot secret orders, crossing armies, scouting and interception.
12. Three fronts: layer-specific routes, lift links and surface-base air reinforcements.
13. Heirs: individual territory and military authority, concentration-driven disloyalty and civil war.
14. Occupation: temporary control, autonomous administration, garrison food burdens, legitimacy and revolt.
15. Retreat: scheduled territorial collapse, rear guards, civilian movement, army preservation and rebuilding stores.

## AI and privacy

AI acts only on the sanitized public view and its own side. The fixed enemy order is committed before the current human order is submitted; it is absent from the UI/debug view and serialized saves. Resolved orders become public history. Adjudication uses a published fixed phase order: construction, opposing road crossings, then blue and red arrivals. This is a simultaneous commitment game with fixed initiative, not an order-entry race. Easy limits candidate consideration and shallow force comparisons; normal balances territory, economy and objective distances; hard has a larger candidate budget plus counterattack/defensive-threat and objective scoring. It is deterministic local tactical AI, not an LLM. There is no hidden map in these games.

Hotseat stores the blue pending order in a controller closure, displays a handoff curtain, and gives red the same beginning-of-round public state. A pending order is never in a save; full rounds can be replayed. As with any same-device game, this assumes players respect screen handoff and do not use developer tools to attack local memory.

## Storage and assistance

Only completed round inputs are saved, not arbitrary trusted state. Loading validates and replays the trace. Bad IDs, bad modes, broken JSON and illegal moves are rejected. A hint marks the actual match assisted. Demonstrations execute isolated state and never award progress or overwrite a player's match. Timers use cancellation epochs. No undo is offered after revealing the opponent's command; unsent drafts can be cleared.

All rules, controllers, corpora, proofs, tests, art and catalog are included in the release manifest. Test reports bind the exact pre- and post-test source hashes. Browser and deployment QA remain separate integration stages.
