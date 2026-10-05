# 花園守望隊 · The Garden Watch

A complete, original lane-defense campaign for the Arcade classic collection. Native HTML/CSS/JavaScript, entirely local, no build, external assets, fonts, accounts, trackers, or network services.

## Play

Open `../garden-watchline.html` through any ordinary static HTTP server. Select a seed card, then a garden cell. Plants attack automatically; warm light is credited automatically, so there is no rapid collection-click requirement. First plant a sustainable back row, cover the forecast lanes, then layer the appropriate counter in front.

- 30 authored missions in six chapters, with 141 complete waves and 1,857 explicit enemy spawn entries
- Three active lanes in stages 1–3, then five lanes; eight cells per lane
- Eight complementary plants, seven enemy roles, hand-positioned rock and fertile cells
- Every mission is available to try; stars preserve completed progression without forcing a perfect run
- Clear all waves and surviving enemies to win; no arbitrary survival timer or forced waiting for completion
- Optional early wave launch, automatic 8-second between-wave preparation, 1× / 2× speed
- Pause-to-plan includes planting and ordinary paid relocation; paused time produces no income
- Pointer/touch support and keyboard selection: 1–8 plants, arrows + Enter on the canvas, S shovel, R rain, P/Space pause, Esc cancel/pause

## The original cast

The resource plant is a luminous hanging lantern blossom, the basic shooter an exposed-seed living leaf crossbow, and the barrier a woven living-vine wall. All canvas shapes, SVG card silhouettes, and the cover illustration were authored for this game. The enemy cast consists of original soft-edged shadow visitors. No commercial game artwork, characters, fonts, names, music, or recorded audio are included. Optional sounds are synthesized with Web Audio after the player enables them.

| Plant | Cost | Role |
| --- | ---: | --- |
| 暖燈花 | 50 | Produces 25 warm light every 8 seconds, first production after 5 seconds |
| 芽葉弩 | 90 | Reliable same-lane forward fire, 20 damage every 1.15 seconds |
| 霜鈴蘭 | 125 | 12 damage every 1.6 seconds; slows by 45% for 4 seconds |
| 藤編牆 | 75 | 900 HP barrier; reflects 8 damage/second while being bitten |
| 莓果炮 | 150 | 45 armor-piercing splash damage every 3 seconds |
| 赤葉扇 | 160 | 18 armor-piercing damage every 1.4 seconds, travels through its entire lane |
| 露滴草 | 100 | Heals nearby plants by 18 every 2 seconds, including itself |
| 星火蕾 | 95 | Immediate 170-damage armor-piercing burst in a 1.6-cell radius; 18-second cooldown |

Fertile cells improve plant production, attacks (including instant/reflect damage), and healing by 20%. Weather palettes are decorative and do not secretly change simulation rules.

## Error tolerance, without passive wins

Each active lane begins with one rescue cart. Its first breach clears the enemies currently in that lane, then the cart is consumed. The cottage also has five hearts. Three aid-rain uses damage and slow all active enemies and repair all plants; each use has a 32-second cooldown. The shovel immediately refunds 80% of the removed plant's original price. Resource flowers, regular global income, wave rewards and kill rewards allow rebuilding.

These safeguards do not establish a win automatically: all 30 no-defense runs lose. After formation tuning, a single basic shooter per lane and then no further input loses 24 of the 30 levels, including all six chapter finales. Players must invest, react to concentrated packets, or combine useful counters. Strong shield/healer-first plans are intentionally more comfortable than continually rebuilding exposed attackers.

## Campaign design

The data consists of explicit, deterministic authored schedules, not a random level generator or level-dependent enemy-HP multiplier. Enemy statistics are constant across the campaign. The first encounter with a new enemy is isolated in a readable opening wave; later groups combine it with earlier threats. Terrain placement, concentration, timing, alternating lanes, support combinations, economy and wave count all vary.

1. 晨露小徑, stages 1–5: economy, coverage, barriers, speed control, expansion from three lanes to five
2. 苔階雨庭, stages 6–10: dense swarms, armor, splash, piercing, repair and changing pressure lanes
3. 風鈴果園, stages 11–15: one-wall hoppers, defense depth, rotating/paired lanes and late runners
4. 月影花境, stages 16–20: support lanterns, healing formations, terrain-constrained attack lanes and grouped targets
5. 霜葉溫室, stages 21–25: durable brutes, mixed light/heavy lanes, protected production and resupply recovery
6. 曙光盛典, stages 26–30: mixed counterplay, constrained gardens, rhythmic packets and a six-wave finale

Mission names and their individual strategic focus are listed in `design.md`; full terrain and schedules are in `levels.js`. Times vary with the player's build and wave launch choices. Verification reports give simulation durations for their exact policies; they are not claimed as measured human completion times. The UI offers 2× speed and optional early waves, never a mandatory delay to pad duration.

## Save and lifecycle behavior

Only these keys are used:

- `arcade.classic30.garden-watchline.v1.progress`
- `arcade.classic30.garden-watchline.v1.session`
- `arcade.classic30.garden-watchline.v1.settings`

Actions and periodic checkpoints save the ongoing session. Continue restores the exact simulation, initially paused. Changing tabs auto-pauses; restart requires a visible confirmation. Corrupt sessions fail closed and do not block fresh play. If browser storage writes fail, the current game remains playable in memory and the player sees a warning. Stars merge by the maximum completed rating across tabs. A new tab claiming the session pauses the older writer; continuing in the older tab explicitly takes the save back, preventing silent stale-timer overwrites.

The renderer is separate from the deterministic engine. Reduced-motion preference stops decorative plant/enemy wobble and ambient drift while retaining essential projectile and enemy-position feedback. Decorative animation is not part of simulation time. The visible canvas rectangle and pointer mapping use the same geometry at desktop and portrait sizes.

## Verification

From the repository root:

    node games/garden-watchline/verify.cjs
    node games/garden-watchline/replay.cjs
    node games/garden-watchline/coherent-strategy.cjs
    node games/garden-watchline/balance-audit.cjs
    node games/garden-watchline/shield-first-audit.cjs

`verify.cjs` verifies the schema, terrain, explicit wave timing, legal planting costs, occupancy, refunds, rescue cooldowns, invalid saves, pause invariance, instant-spell save roundtrips, and preservation of longer slows. It then runs all 30 levels with a resource-paid adaptive strategy, all 30 with an eight-second opening delay plus a deliberate refunded misplacement, and all 30 without defenses. It writes `verification-report.json` and full input witnesses in `solutions.json`.

`replay.cjs` imports no policy code. It replays all 60 winning witnesses through the published engine's public actions, independently checks legality/resource availability, and roundtrips the session repeatedly during every run. The results are in `replay-report.json`. These are deterministic-engine/legal-input proofs, not a universal strategy guarantee or human difficulty measurement.

`coherent-strategy.cjs` checks 30 mortar-first, 30 piercing-first and 30 eight-second-delayed/three-second-cadence shield-and-healer-first wins. `balance-audit.cjs` checks the challenge floor, including single-shooter, no-economy and restricted-build policies. `shield-first-audit.cjs` records and independently replays 90 more legal witnesses: 30 coherent wins, 30 delayed/refund-recovery wins, and 30 deliberately very slow runs (28 wins, two expected losses). A failed deliberately weak policy is not counted as a solvability failure. Independent source, state, lifecycle and renderer findings are recorded separately when supplied. A canvas fixture or VM/DOM harness is never labeled actual-browser evidence. Actual browser visual/touch play, hosting, and deployed-source checks are separate release gates owned by the integration review.
