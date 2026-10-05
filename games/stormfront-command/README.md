# 磁暴前線 · 十關原創即時戰略

Ten authored, mechanically distinct missions are implemented. This is the full campaign source candidate, with final-engine endurance passed and a presentation-only first-use patch awaiting renewed desktop/mobile browser acceptance. It is not a verified claim that every player or every mission takes at least twenty minutes.

## Play and architecture

Open `../stormfront-command.html`. All code, art and audio are local relative files: no backend, runtime packages, fonts, analytics or network services. The engine, controller, renderer, storage, scenario catalog and audio are separate modules.

- Eight shared unit roles and eight structures, with two original factions, faction-specific names/silhouettes and selected stat differences; five missions per faction.
- Finite physical ore, 200-capacity harvesters, return/unload income, paid production/construction/repair, power shortage and build radius.
- Selection/box selection, movement, attack-move, hold, patrol, queued orders, repair, engineer capture, rally points and five groups.
- Fog and remembered terrain, scouting, line of sight, artillery minimum range, armor/anti-air counters and traveling projectiles.
- Enemy spending, harvesting, production, scouting, rebuilding and assault use its own finite ledger and observed information. No free reinforcement waves. Visible affected buildings show categorical OFF/SLOW power badges without exposing hidden infrastructure or enemy supply totals.
- Mouse/keyboard and explicit touch commands with confirmation, two-pointer pan/zoom, minimap, pause, retry and surrender. Tab keeps normal interface focus; unmodified P cycles producers. Gameplay shortcuts do not hijack focused controls/editable text.
- Three manual slots plus separate autosave, JSON backup/import, conflict preservation, corrupt-save recovery and playable storage-denied mode.

The simulation runs fixed0.1-second steps. Movement reserves a legal cell edge before progressing, and the renderer interpolates observed progress. Spatial combat queries, heap paths, cached terrain and paths, bounded24-request admission and particle/projectile caps bound common work. Path-cache warmth cannot change admission timing; unchanged unreachable goals persist as canonical failure keys until location, goal or structure topology changes. Transient performance counters are not canonical state. Serialization is behaviorally read-only.

## Ten mission identities

1. 河口再連線: bridges, expanding refinery network, mixed assault and three engineering captures; a paid-air northern-first alternative is verified.
2. 岔路護礦: C-shaped ridge, vulnerable short route versus long supply route, protected ore vehicle and forward refining. The final safe transfer is measured separately.
3. 高地電網: ridge-route choice, protected home generator and enemy paid replacement/production pressure. The accepted routes do not create a tactical blackout; no such claim is made.
4. 裂谷砲線: four mobile artillery objectives, minimum-range counterplay, destructible shortcut, support depot and a workshop that must survive capture.
5. 林冠防空: two real paid enemy airfields, ground-bridge versus overwater air threats, anti-air resource protection and two supply targets.
6. 三礦競逐: two protected cores, distributed mines and captureable central production. The central-first alternative creates an observed57.1-second tower-off window on the historical reviewed trace; it does not purchase aircraft.
7. 活工廠: three industrial sites must remain intact for engineering capture; generator demolition opens routes, followed by protected engineer extraction. Accepted routes do not disable enemy towers through low power.
8. 逆流補給: sparse opening minerals, staged refining/relay relocation and an equipment convoy moving while enemy operations remain unresolved.
9. 雷脊要塞: staggered ridges, destructible shortcut, paid air support threats, forward repair/refining and preserved relay captures.
10. 極晝終線: two protected bases, two enemy economic networks, early forward factory/relay capture, paid fortification and equipment evacuation. Two different expert policies are verified, both below twenty simulated minutes.

## Duration evidence and limits

Primary automated legal traces are approximately25.9,22.8,22.2,22.3,20.9,20.2,24.7,22.3,22.3 and19.6 simulated minutes. The finale's second strategy is19.0 minutes. Faster expert routes remain disclosed; no walking, health inflation or waiting gate was added solely to cross twenty minutes. Missions have no minimum elapsed-time victory locks or ore-deposit quotas.

These traces establish feasibility and economic/tactical consequences. They run accelerated during source tests and are not human-duration or enjoyment evidence. Repeated commands are not counted as independent strategic decisions. Safe post-objective convoy transfers are separately reported. Each mission retains a20–35-minute ordinary first-clear design target, but actual ordinary-player duration, browser fluidity and mobile ergonomics remain unmeasured until actual browser acceptance. No universal minimum playtime is promised by the proofs.

## Verification

Run from the package root:

- `node verification/stormfront-command/tests.cjs`: thirteen causal engine/storage/footprint/AI/stress suites.
- `node verification/stormfront-command/cache-resume-tests.cjs`: warm/cold/no-save branch equality, read-only serialization and topology recovery.
- `node verification/stormfront-command/movement-tests.cjs`: occupied-edge motion, stopping and reachable command latency behind109 unreachable requests.
- `node verification/stormfront-command/campaign-replay.cjs`: all14 public-action strategies, visible targets, exact midpoint save continuations, ledgers and objective/escort timing.
- `node verification/stormfront-command/controller-harness.cjs` and `controller-campaign-tests.cjs`: actual controller handlers with a minimal DOM harness, not a browser.
- `normal-speed-runner.cjs <frozen-run-directory>`: one0.1-second tick per100ms wall interval, without catch-up, including JSON save/restore. Final-engine runs are under `normal-speed-release/`. Historical `normal-speed/` reports use the prior engine and are not final-byte acceptance.

Independent reports and final source receipts accompany the handoff. Native Canvas captures show actual renderer geometry, not browser layout or frame rates. The controller exposes only read-only `StormfrontDiagnostics.snapshot()` and `.observation()` for profiling; no developer win/resource/state setters are provided.

## Saves and publishing

Only `arcade.classic30.stormfront-command.campaign10.v2.*` keys are used. The three manual slots are not overwritten by autosave. Historical v1 and other game keys are not read, migrated or removed. Imported runs are marked assisted and do not grant formal campaign wins. All ten maps are selectable for direct retries and review.

The release manifest is an explicit static publication allowlist. Authoring tools, traces, tests and source-review reports are not runtime assets. Catalog integration, preservation of existing games/saves, upload/merge and final hosted browser acceptance are tracked separately.

## First-use clarity patch

The presentation-only patch adds a near-battlefield production/engineer strip, persistent named repair state and paid-rate feedback, explicit idle-producer cues, and observation-only opening guidance. It does not issue orders, place buildings, queue units, grant resources or change mission rules. Repair already continues until its target is repaired; idle engineers already seek nearby damaged friendlies. The new labels explain that existing behavior rather than adding a repair mode.

On portrait screens, common train/build/move/repair actions are near the battlefield; expanded commands and the detailed inspector remain available. The pause indicator is compact, and an explicit return-to-battlefield control replaces repeated scrolling for common loops. Native keyboard focus is retained, and pointer focus requests prevent page scrolling. Source/controller tests do not establish actual phone geometry; the same small portrait and short-landscape viewports must be rechecked in the browser.

## Logistics feedback patch

The battlefield now shows the known ore remaining within13 cells of completed friendly refineries. This is observed proximity, not a claim that mining routes are safe; an approximation marker means that some information is stale. Mission01 warns before depletion and prioritizes scouting and defended refining over blindly replacing miners. A known ore locator explicitly labels stale information, and only moves the camera. It reveals no new terrain or enemies and gives no orders.

Observed damage or loss of friendly miners/engineers produces a short-lived notice with the current unit or its last position. The notice does not pause play. During construction, dashed circles show the actual friendly core/relay radius; the hovered grid cell and green/red ghost use the existing legal-placement check. A touch placement awaiting confirmation stays pinned through mouse/stylus hover. Its legal-placement status refreshes as funds, visibility or occupancy change. No resources, rules, mission data or saved progress are altered.

Focused verification: logistics-guidance-tests.cjs (pure observation), logistics-controller-tests.cjs (ordinary handlers and a read-only live recovery save), logistics-render-tests.cjs (native Canvas geometry and hidden-information invariance), and pointer-mode-tests.cjs (explicit versus contextual commands). Native images are offline renderer captures; hosted phone layout and live input remain separate checks.

## Paused planning and Help focus patch

Paused planning now replaces the mission clock's ordinary label with a compact status pill beside the existing resume control. The pause notice is outside the battlefield, so camera-centred units and capture/repair targets stay visible. Space and both existing pause/resume buttons retain their behavior. Terminal result panels remain unchanged. The near-map Build disclosure now reveals its existing quick-build strip on desktop as well as portrait, with truthful expanded state and horizontal overflow when needed.

The optional modeless Help panel initially focuses its heading and resets to the top so the current contextual advice is visible. Closing through Return or the native dialog close path restores focus to the actual header/guide opener without requesting page scroll. The heading is excluded from sequential Tab navigation; browser dialog behavior remains native. This is a presentation-only update with no engine, renderer, guidance, campaign or save change. Exact browser geometry and native dialog focus at333×564,400×677,846×392 and desktop remain separate live checks.

## Real-time group controls

Desktop drag-box selection, Shift-add, numbered groups and right-click group movement/attack were already present. The update makes those controls visible and adds touch marquee selection with explicit「框選部隊／移動畫面」modes, live selected counts, and highlighted units while dragging. Group Move, Attack and AttackMove use the existing paid/observed public-action engine and its per-unit formation destinations. No formation rules or unit statistics change.

New and retried missions now start running. Selection, unit orders, production, construction previews/confirmation and the modeless Help panel leave combat running. Pause remains optional through the existing button/Space. Opening the mission menu, loading/importing a saved run, losing window visibility/focus and a conflicting save revision retain clearly separate safety pauses. A long visible frame caps catch-up at0.5seconds and records dropped time; it does not automatically pause. No accelerated catch-up or autoplay is added.

Pointer cancellation, Escape, mode/selection changes and lost capture consume held gestures. Two/three-finger gestures remain camera-only until every finger lifts; a contextual right-click cannot fire during a held touch. Release coordinates are read at pointer-up, and outside releases cannot issue a movement/attack command. The original PR42 explicit-left versus contextual-right command behavior is preserved.

Source verification includes47 owner controller/native suites. Existing paused-planning regression fixtures now explicitly request voluntary pause instead of assuming a paused start; the new tests separately require immediate running and uninterrupted interaction. Native Canvas PNGs show real renderer output and group combat in a synthetic fixture. Actual continuous normal-speed browser combat, input latency, physical phone geometry and ordinary mission-duration acceptance remain separate and unclaimed.

## Native text-selection interference guard

A live portrait check isolated an interaction edge case: existing browser text selection could interrupt a mouse marquee or pan. Clearing that selection restored the same gesture at both100% and125% browser zoom, so no coordinate, scaling, renderer or formation correction is warranted.

Accepted battlefield pointer starts now clear prior DOM text selection, and cancelable active pointer events suppress native defaults. Canvas selection/HTML drag starts are blocked, with non-selectable text limited to the battlefield and its input-mode strip. Hover, other controls, manual content and terminal/menu-rejected gestures do not clear text selection. Existing cancellation, touch camera gestures, keyboard/groups and explicit/contextual orders remain intact. This adds no gameplay orders, pause, resource or save changes. Source checks are complete; the guarded125% portrait gesture still needs its targeted hosted retest.
