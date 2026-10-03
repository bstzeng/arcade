# Vehicle browser QA handoff

Use all 15 `games/<id>.html` routes in catalog.json. Every page has 100 selectable scenarios and Chinese rules. Test first, middle and final scenarios at widths 333 and 400, then desktop. Keep browser findings separate from simulated-DOM evidence.

1. Confirm no console errors, missing assets, horizontal overflow, clipped selectors/HUD or tiny unreadable controls. All external resources are absent.
2. Start, hold two touch controls, release one, cancel pointer, blur/hide, resume. No stuck direction or giant resume movement. Try keyboard, space, P/R and fine sliders. Navigation/restart must retain one frame loop.
3. Run a demonstration to completion. It must state assistance and preserve manual progress. Restart should remove assistance. Hint, save, reload: still assisted and paused, with no automatic demo takeover.
4. Select challenges 1, 50 and 100; attempt each distinct mechanic and compare tutorial to visible physics.
5. Kart: follow red AI for tailwind, then change lane to pass; same-lane overlap should block. Test all three honest speed tiers.
6. Drift: handbrake alone on straight wheels must not score; steer with speed should accumulate combo.
7. Off-road/boat: follow the narrow visually curved corridor; low gear changes grip/speed. Boat wave height affects speed/damage even without lift. Release and tap lift again at each crest; keeping it held must not automatically launch every wave.
8. Motocross/rover: lean changes body angle; rover hills require opposite counterweight uphill/downhill. Check the center-of-mass/support meter and suspension damage from fast landings.
9. Truck/trailer: backing up reverses turn effect; watch live mirror and articulated trailer; park actual target body and stop.
10. Bus/train: check stop accuracy, dwell, doors for bus, overshoot and speed limits.
11. Drone: independently change height and horizontal position; collide with a gate frame, then replay valid example.
12. Heli: extend rope to orange survivor, retract, transport, lower onto green platform; rope swing is visible.
13. Sail: heading directly upwind stalls; angled tacking works and sheet green target responds to wind.
14. Space: releasing thrust retains velocity; rotate/retro-thrust to brake, dock slowly.
15. Workshop: inspect 4–5 varied gaps and the actual budget; build ramps/bridges accordingly, clear/change selections, use keyboard construction, and vary speed for narrow/wide jumps. Low beams must collide with an overshooting jump. Construction alone must never complete a level. Try an unbuilt track and see a genuine cliff failure.
16. Complete one unassisted manual challenge. Verify only that level becomes green. Reload must preserve progress. Freeplay must not mark completion.
