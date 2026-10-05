# 奇潮水族館: campaign release

This replaces the earlier, unpublished three-tank prototype. The current game is a complete authored 30-tank campaign, IDs 01–30, in five chapters of six tanks. It is not the old 50-tank plan. There is no claimed free-aquarium mode, multiplayer mode, human enjoyment study, or real-time hour endurance test.

## Progression

1. 晨光育成, 01–06: growth, two diets, shelters, currents, first defense, armor introduction.
2. 珊瑚水道, 07–12: pearl income, three diets, paired armor, food recovery, opposite gates, combined crossing currents.
3. 月影警戒, 13–18: successive hunters, two armor targets, lure helper, injured start, reversing current, five-wave watch.
4. 新生花園, 19–24: ember/ribbon/lantern nurseries, simultaneous attacks, two births, six-fish combined garden.
5. 深藍燈塔, 25–30: low initial funds, mixed double gate, reversing nursery, paired waves, larger community, seven-wave final exhibit.

Each tank consumes its authored initial fish, shelter/currents, enemy kind/location/timing, starting money, conservation/birth requirements and three construction goals. Themes change architecture and vegetation, not just colors. Core care is spatial: fish find diet-compatible sinking food, flee invaders, grow, produce physical coins and require nourishment. Six companion jobs have distinct original silhouettes and real effects.

## Forgiveness without idle completion

- Smart taps prioritize actual coins, then a nearby invader, then a nearby fish's diet. Empty smart taps never spend.
- No attack charge or ammunition cost. Armored enemies still require their real visible open eye.
- Eight-second invasion forecast; free six-second defensive bubble with 32-second recharge.
- Each fish gets one 18-second refuge rescue before a later death is permanent for that run.
- Each tank has two or three limited manual supplies: fish recovery and 30 currency each. No unlimited cash grant.
- Food helper gives an 18-point snack every 20 seconds, so it cannot sustain an unattended tank indefinitely.
- Losing is possible, retry is unrestricted, and completed campaign records are preserved.

## Save contract and prototype lineage

The sole key remains arcade.classic30.wondertide-aquarium.v1. Bundle/profile schema is now2; engine schema2. Exact legacy prototype scenarios01/25/50 are archived in legacy-levels.json/js and old real engine fixture states in verification/wondertide-legacy-fixtures.json. Schema1 imports retain the complete active embedded old tank, currency, entities, timing, and completion record. Old completions migrate into legacyCompleted; they never award overlapping campaign01/25. Legacy active runs are visibly labeled and do not appear as a second campaign. Restore and backgrounding pause time; no offline catch-up. Multi-tab conflicts require choosing the newer save or volatile session. Quota/invalid saves preserve the old bytes and allow explicit export.

## Verification limits

Run node verification/verify-wondertide.cjs from the release root. It tests 30 tanks in attentive, slower-with-breaks, damaged-economy and no-care variants; deterministic save round-trip; prototype migration; conflicting tabs; denied storage; empty smart taps; finite supplies; natural refuge expiration; corrupt imports. This is snapshot-assisted released-engine simulation through public legal actions. It is not browser play, a human action-pace study, proof of fun, or a real-time endurance run. The ordinary UI browser review is separate.
