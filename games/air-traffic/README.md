# 空中指揮所 · Air Traffic Control

Dependency-free Traditional Chinese canvas air-traffic game. Open `../air-traffic.html` through the same static server as the Arcade site. No external assets, libraries, accounts, backend, or network calls are used. All eight maps are original procedural canvas illustrations.

## Play

- Hold an aircraft and draw its future route with a mouse, pen, or one finger. Release to commit. Time pauses while drawing; cancelling a gesture preserves the old route. A tap selects without replacing a route.
- Aircraft always move, turn with a finite radius, and keep their current heading when the route ends. The selected aircraft's route can be cleared.
- Arrivals must reach the airport bearing the same color AND letter. Planes cross the marked approach threshold in the arrow direction and continue along the runway. A gentle approach drawn into the matching corridor snaps to a long straight final approach. Reverse approaches do not land.
- Helicopters are slower and land on their matching airport's H pad from any heading.
- Departures appear at an airport, show a north/east/south/west arrow, and must leave through that assigned boundary. Departures are counted separately from challenge landing targets.
- All flights have a four-second advance preview. Unsafe releases wait at “待” until space is available. Aircraft separation warnings include forecast conflicts. An actual collision ends either mode.
- Challenge mode unlocks eight sectors in order, requiring 6 / 8 / 10 / 12 / 14 / 16 / 18 / 20 safe landings. Three missed destinations end a challenge.
- Free mode offers every map from the start, tracks a separate personal best, and counts misses without ending the session. Collision still ends the session.
- Scenery is not an obstacle. Runway/helipad positions, directions, airport counts, preview frequency, departure mix, and traffic caps vary by map.

## Controls and device behavior

Routes require mouse, touch, or pen. Keyboard shortcuts operate pause/resume (P or Space), pause/dialog dismissal (Esc), restart confirmation (R), and help (H). They do not offer full keyboard route plotting. Buttons support keyboard focus and visible focus indicators.

The map retains its 1000×700 logical aspect ratio in every orientation. Aircraft hit targets expand in CSS pixels on smaller screens. Portrait mode remains usable; landscape offers a larger map. The fullscreen control uses the browser Fullscreen API where available and explains the landscape fallback where it is not.

Visibility changes pause the game. Additional pointers cannot steal a drawing gesture; pointer cancellation, lost capture, and window blur discard only the uncommitted drawing. Modal dialogs pause all simulation. Reopening the map selector from Pause restores Pause when dismissed.

Local storage key: `arcade-air-traffic-v1`. Only unlocked maps, completed sectors, mode/map selection, separate best landing scores, tutorial acknowledgement, and optional sound preference are saved. Live flight positions are intentionally not resumed after a refresh. Corrupt/unavailable storage falls back safely; a visible warning explains unavailable persistence. Sound is off by default.

## Files

- `maps.js`: eight map definitions, 25 airports, challenge progression; CommonJS + `AirTrafficMaps`
- `engine.js`: deterministic simulation; CommonJS + `AirTrafficEngine`
- `render.js`: generated landscape, runway, route, preview, aircraft, and warning drawings
- `app.js`: responsive UI, pointer ownership, modal flows, persistence, optional Web Audio
- `style.css`: viewport-first desktop/touch layout
- `test.cjs`: gameplay engine tests
- `audit.test.cjs`: independent deterministic rule and seeded stress audit
- `test-ui.cjs`: simulated DOM/canvas controller checks (not browser visual QA)

## Verification

Run from the Arcade repository:

```sh
node games/air-traffic/test.cjs
node games/air-traffic/audit.test.cjs
node games/air-traffic/test-ui.cjs
```

The controller suite checks script execution and finite canvas coordinates, menu/mode/map selection, tutorial, drag/tap/cancel/multitouch ownership, pause/resume, blur/visibility interruptions, restart confirmation, route clearing, runway/pad assist, win/failure/retry/next map, storage validation, and separate free-mode records.

Actual rendered browser QA is a separate release step. Local Chromium launch in the implementation container was blocked by `socket() failed: Operation not permitted`; the simulated DOM tests must not be described as visual browser verification. Validate the published page in desktop and portrait/landscape mobile viewports, including a real drag, landing, modal restart, and return to lobby.
