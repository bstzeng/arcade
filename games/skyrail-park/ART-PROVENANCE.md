# Paper Wind Park: artwork provenance

All game artwork in this campaign was created specifically for 雲霄歡樂園. No graphics, sprites, sounds, logos, screenshots, fonts, or textures were extracted from commercial park simulation games. No stock or licensed commercial asset pack is used.

## Files

- `render.js`: original programmatic Canvas 2D artwork. Isometric terrain diamonds, soil faces, paths, bridges, water, trees, flowers, windmills, benches, entrance arch, kiosks, toilets, guests, staff, balloons, all fifteen ride types, coaster supports, ties, rails, and cars are drawn from geometric primitives. Palette, character proportions, buildings, paper-carousel canopy, and foliage are original designs for this project.
- `art.svg`: original hand-authored vector campaign illustration. It uses reusable SVG symbols drawn for this project, including trees, guests, flowers, wheel cabins, a carousel, timber coaster, kiosk, river island and paper hot-air balloon. No externally sourced images are embedded or linked.
- `sound.js`: original synthesized bell cues generated in the browser; no downloaded recordings or commercial game sounds.
- `style.css`: original responsive interface presentation using paper, botanical green, brass, rose, and terracotta colours. Fonts use the user's installed system fonts with Traditional Chinese fallbacks. No font assets are downloaded.

## Rendering and motion

The world is rendered as an isometric 32×32 board. Static terrain is cached at the device pixel ratio; visible objects are culled and depth-sorted by their ground positions. Guest and staff positions interpolate between simulation snapshots. Rides use their actual active cycle and cycle duration, smoothly interpolated by the UI. Fixed rides remain at rest while loading or closed; pause/resume rebases guest movement history to prevent backward interpolation. Coaster cars use the same timed track curve as the simulation, including individual track heights. Water glints, leaves, pinwheels, and balloons provide original ambient motion. Reduced-motion preference stops ambient motion and reduces ride animation to simulation ticks.

Environmental trees and riverside shrubs are deterministic visual scenery. They do not reserve buildable squares and clear visually when a facility, road, or player-placed decoration occupies their location. Player-built scenery is represented by the actual simulation cells.

## External dependencies

Artwork requires no external image service, commercial assets, or runtime network requests. Canvas 2D and SVG are browser-standard technologies. This provenance statement describes authorship and implementation, not a claim of external legal review or a comparison with any commercial game.

## Eight additional attraction designs

The miniature train, bumper-car arena, biplane fleet, crescent pendulum ship, log-flume chute, round-raft channel, hedge labyrinth and puppet stage are original Canvas structures added for this expansion. They have separate geometry and motion paths and use actual occupied rider counts. Their animation uses the same authoritative ride cycles, loading/closed states, pause rules and reduced-motion handling as the existing park. The eight small palette icons are original inline SVG line drawings authored for these attractions. No outside sprite, model, commercial name, recording or font was introduced.
