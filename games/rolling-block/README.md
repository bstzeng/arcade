# 滾方塊過橋 / rolling-block

翻滾長方塊穿越薄板、切換橋樑，以直立姿態落入出口。

## Rules and distinct interaction

Exact 1×1×2 integer-lattice rigid-body rolling. Weak tiles reject a standing block. An entered switch toggles the bridge after support checking, and lost support means a fall. A switch under an already occupied footprint does not retoggle.

The Traditional Chinese page provides its full model, controls, tutorial text, 100-level selector, undo, confirmed reset, nonmutating hints, isolated solution playback and local progress. Keyboard-operated buttons and SVG hotspots complement touch/mouse controls. Hints are verified next actions on the reference path; after a divergent move the UI explicitly offers a reference-only explanation rather than claiming a guaranteed continuation.

## Corpus and proof semantics

- Exactly 100 fixed levels in `levels.json`; browser copy: `levels.js`.
- Stable IDs `rolling-block-001` through `rolling-block-100`.
- `solution` is a legal action witness; `proof.certificate` is the same witness with a start-state SHA-256 and rules revision.
- Proof profile: `reachability`. At least one solution is certified. No uniqueness or optimality claim is made. Rolling-block records a shortest witness length, but the general proof text does not promise all games are optimized.
- The completion predicate evaluates public game constraints, never equality to `solution`.
- Curriculum: Ordinary terrain, then weak floors, then a mandatory switched bridge separating map halves; shortest witnesses range from 8 moves upward.
- Normalization: Full typed map, start and goal under the eight dihedral plane symmetries. Map holes, terrain and goal are gameplay constraints.
- Deterministic generator: `../spatial-common/generate.cjs rolling-block`. It builds candidates, removes normalized duplicates, and forwards each witness through the engine.

## Verification

From the arcade root:

```
node games/spatial-common/verify.cjs
node games/spatial-common/dom-tests.cjs
```

The independent oracle in `../spatial-common/oracle.cjs` does not import production engines or geometry utilities. It reconstructs every action, checks exact end constraints and calculates its own normalized keys. The verification suite also checks generator reproducibility, illegal rule boundaries, immutable transitions and shared-controller undo/reset/replay/navigation/storage failure behavior. `audit.json` contains current source hashes and metrics; `dom-qa.json` is shipped-script event-harness evidence.

Real browser suite (requires a normal local HTTP server and Chromium socket support):

```
python -m http.server 8797
node games/spatial-common/browser-qa.cjs
```

Actual browser rendering is **not yet verified** in the task runtime: standalone Chromium cannot create its local socket, and the available cloud browser blocks localhost navigation. No screenshots or visual-pass claim are fabricated. The DOM simulation exercises the actual shipped scripts and game-specific controls, but it does not test layout, hit areas, fonts or native browser behavior.

## Owned assets

`../rolling-block.html`, this directory, and shared `../spatial-common/*`. Existing games, the lobby and shared challenge shell are untouched. There are no runtime dependencies, remote APIs, fonts or image downloads.
