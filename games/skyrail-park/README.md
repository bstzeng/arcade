# 雲霄歡樂園

Ten original, independently authored park-management scenarios. Static Traditional Chinese HTML/JS/CSS, no backend, runtime service or external asset request.

Core simulation: 32×32 terrain; public paths, exclusive queue networks and bridges; fourteen fixed ride types plus the original custom coaster; custom piece-by-piece coaster geometry, energy, height, braking, comfort and excitement; individual guest budgets/preferences/needs, with optional motion-sickness effects from the new rides; stocked food/drink/toilet services; ride prices, gate admission and marketing; physical maintenance/cleaning staff and zones; landscaping; real service districts and walking-link projects.

Original isometric Canvas artwork and synthesized optional sound are documented in ART-PROVENANCE.md. The renderer interpolates between authoritative one-second simulation steps; real-browser frame timing remains a separate acceptance gate. High-level requirements are described by each scenario, with visible target-region overlays and detailed engineering conditions.

All scenarios are available in the actual selector. Pause also stops simulation on blur/visibility loss; no offline catch-up. Full run/profile data uses only arcade.classic30.skyrail-park.v2.*. The earlier v1 game saves are never read or overwritten. Import/export, transactional backup, volatile storage fallback and multi-tab conflict handling are included. A completed park can continue in free management while preserving its one-time award.

## Validation

Commands from the package root:
- node verification/classic30/skyrail-park/verify-slice.cjs
- node verification/classic30/skyrail-park/verify-campaign.cjs --ui-all
- node verification/classic30/skyrail-park/stress-public.cjs --generate
- node verification/classic30/skyrail-park/profile-construction.cjs

Engine/action traces, normal-speed automated endurance, DOM/event controller tests and real-browser play are separate evidence categories. Automated witness time is not a claim of human playing time or enjoyment. The campaign’s twenty-minute-per-scenario ordinary-play target requires the separately recorded browser/pacing acceptance; it is not enforced by a timer floor.

## Additive ride expansion

Eight original optional rides expand the catalog to fifteen types: a miniature train, bumper cars, flying planes, pendulum ship, log flume, circular rafts, hedge maze and puppet theater. Each has its own footprint, capacity, cycle, admission, wear and operating/repair costs. Their need effects create different rest, water and maintenance requirements. Water attractions require a complete land footprint within one cell of water. Nausea is optional in saves: absent means zero, so existing guests are loaded without any rewritten fields. Benches and gentle rest attractions can relieve it.

No scenario goals or authored unlock arrays were changed. Additional types are available through the ordinary build palette with category filters and visible details. Original type keys, IDs, prices, save namespace, manual parks and completed/freeplay state are preserved. The separate legacy-route comparison verifies exact old-only behavior, while new-type receipts cover their additional state and effects.

## Park 07 mission-content revision 2

Fresh Park 07 runs now require the promised northern observation wheel with its own connected, stocked and previously used food, drink and toilet services. The market, north district and narrower east garden are disjoint service regions, and the final canopy coaster must actually pass at least two distinct used, stocked food/drink stalls in the market band at two-layer ground clearance. These requirements are described in current/future project details and map overlays.

New Park 07 starts carry `missionRevision: 2`. Existing unversioned active, completed and free-management Park 07 saves retain their complete original definition, including future goals, physics/economy, deadlines and awards. Confirmed restart starts the revised scenario. Other nine scenario definitions, all maps, the fifteen ride catalog entries, save/profile namespace and completion IDs remain unchanged. Unknown explicit mission revisions fail validation rather than silently switching goals.

Additional validation: `node verification/classic30/skyrail-park/verify-mission-revision.cjs` (requires a supplied shipped baseline via `PARK_BASELINE`; optional private Park 01 compatibility input via `PARK_PRIVATE_SAVE`). The corrected public-action witness is an accelerated solvability check, not ordinary playing-time evidence. No time gate, forced wait, new demand quota or grant change was added.
