# Required real-browser release gate (not yet run)

Preview is currently blocked. These steps are prepared for a later real browser session; none are certified by simulated DOM tests.

1. Open all ten entry HTML routes from the integrated lobby and confirm title, 100-level selection, labels and initial objective.
2. At desktop and 360px width, check the board, selectors and critical buttons remain visible without horizontal page clipping. Tables may scroll inside their container.
3. Play representative controls on 001, 050 and 100: hotel booking and service; repair diagnosis/order arrival; museum placement/path/open/tick; theater cast/calendar; caravan markets/routes; tower pad click/build/start/pause; diving move/take/refill; loop discovery/reset; ecology restore/water/season; alchemy inputs/tool/heat/brew.
4. Complete at least one manual mission per game and compare the actual goal, feedback and progress. Demonstrate a losing decision and undo recovery.
5. Inspect isolated winning demonstrations, stop midway, resume the player board, and ensure demonstration completion never grants a player win.
6. Test reset Cancel, Escape, repeated confirm, level navigation while a dialog was pending, keyboard focus return, hint assistance and save/reload.
7. For tower defense, pause on blur, hidden document, level change and back/forward navigation; verify no background catch-up and no duplicate timer on resume.
8. Test browser Back/Forward with bfcache restoration; pagehide persisted must retain a usable game, and every graph/map remains interactive after return.
9. Record exact tested build/source hashes, viewport sizes, routes, screenshots, results and any defects. Only an actual browser result may close this gate.
