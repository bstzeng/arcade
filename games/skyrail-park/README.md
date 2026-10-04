# 雲霄歡樂園

Ten original, independently authored park-management scenarios. Static Traditional Chinese HTML/JS/CSS, no backend, runtime service or external asset request.

Core simulation: 32×32 terrain; public paths, exclusive queue networks and bridges; six fixed ride types; custom piece-by-piece coaster geometry, energy, height, braking, comfort and excitement; individual guest budgets/preferences/needs; stocked food/drink/toilet services; ride prices, gate admission and marketing; physical maintenance/cleaning staff and zones; landscaping; real service districts and walking-link projects.

Original isometric Canvas artwork and synthesized optional sound are documented in ART-PROVENANCE.md. The renderer interpolates between authoritative one-second simulation steps; real-browser frame timing remains a separate acceptance gate. High-level requirements are described by each scenario, with visible target-region overlays and detailed engineering conditions.

All scenarios are available in the actual selector. Pause also stops simulation on blur/visibility loss; no offline catch-up. Full run/profile data uses only arcade.classic30.skyrail-park.v2.*. The earlier v1 game saves are never read or overwritten. Import/export, transactional backup, volatile storage fallback and multi-tab conflict handling are included. A completed park can continue in free management while preserving its one-time award.

## Validation

Commands from the package root:
- node verification/classic30/skyrail-park/verify-slice.cjs
- node verification/classic30/skyrail-park/verify-campaign.cjs --ui-all
- node verification/classic30/skyrail-park/stress-public.cjs --generate
- node verification/classic30/skyrail-park/profile-construction.cjs

Engine/action traces, normal-speed automated endurance, DOM/event controller tests and real-browser play are separate evidence categories. Automated witness time is not a claim of human playing time or enjoyment. The campaign’s twenty-minute-per-scenario ordinary-play target requires the separately recorded browser/pacing acceptance; it is not enforced by a timer floor.
