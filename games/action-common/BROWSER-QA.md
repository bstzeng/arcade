# Final action-game browser QA gate (not yet run)

The current task's local Chrome socket/cloud-localhost preview is unavailable. This checklist is a pending gate, not evidence of a pass. Use the final staging/release test surface after all 80 games are present; do not publish a partial batch merely to test it.

## Every new route

Visit breakout, snake, pinball, bubble-shooter, rhythm-drums, parkour-run, space-dodge, whack-a-mole, fruit-slice and fishing-challenge. Check 1280×900 desktop and 390×844 narrow layout, all assets loaded, no horizontal clipping, readable rules/status, focus outline and all 100 selector entries. Review levels 1, 50 and 100 plus the longest certificate course for each title.

## Meaningful manual play

- Breakout: mouse/touch paddle, arrow keys, ball-paddle angle change, brick armor, drain and win.
- Snake: keyboard and swipe turns, growth, body/wall collision, pause without unintended turn.
- Pinball: launch, both held flipper keys and simultaneous touch controls, bumper contact, drain.
- Bubble: aim and projectile travel, side-wall rebound, same-number cluster removal, unsupported drop.
- Rhythm: D/F/J/K, simultaneous two-button touch, long-note release, misses and visual-only timing.
- Parkour: held/released jump, slide under beam, actual gaps, acceleration, failed and successful course.
- Space: directional and touch drag, diagonal speed, waves/clearance, one-use shield and collision.
- Moles: 1–9 keys, target hit, decoy distinction independent of color, misses and empty hit.
- Fruit: mouse/touch stroke, pointer interpolation, non-slicing reposition, actual bomb collision, keyboard blade.
- Fishing: meter cast, visible bite cue, hook, held reel/release, distinct fish pull phases, tension failures.

## Interrupted/repeated flow

Start using the keyboard immediately after clicking Start (focus must be on the game canvas). Pause/resume with P and button. Blur, hide the tab for 30 seconds, return, confirm paused without time jump. Begin a demo, change speed, stop, and verify exact prior manual state; complete demo and verify independent wins unchanged. Try hint then win, reset then win. Change levels repeatedly. Reload midgame, corrupt/block localStorage, Back/Forward and BFCache pagehide/pageshow. Check pointer release/cancel outside the canvas and held-button release on blur. No stuck keys, stray auto-reel, duplicated render loop or delayed actions.

Record browser/version, exact source/release revision, viewport, per-route result and screenshots when this gate is performed. Keep failures separate from not-run or passed stages.
