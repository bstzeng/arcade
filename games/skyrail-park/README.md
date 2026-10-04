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
