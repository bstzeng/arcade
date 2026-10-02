# 立方體展開圖 / cube-nets

把六個有方向的面接成紙網，摺出面向與箭頭都正確的立方體。

## Rules and distinct interaction

A fixed front face supplies an orthonormal root frame. Each planar edge folds 90°. Breadth-first frame propagation rejects inconsistent cycles, duplicate normals, disconnected parts and incorrect labeled normal/arrow vectors.

The Traditional Chinese page provides its full model, controls, tutorial text, 100-level selector, undo, confirmed reset, nonmutating hints, isolated solution playback and local progress. Keyboard-operated buttons and SVG hotspots complement touch/mouse controls. Hints are verified next actions on the reference path; after a divergent move the UI explicitly offers a reference-only explanation rather than claiming a guaranteed continuation.

## Corpus and proof semantics

- Exactly 100 fixed levels in `levels.json`; browser copy: `levels.js`.
- Stable IDs `cube-nets-001` through `cube-nets-100`.
- `solution` is a legal action witness; `proof.certificate` is the same witness with a start-state SHA-256 and rules revision.
- Proof profile: `assignment`. At least one solution is certified. No uniqueness or optimality claim is made. Rolling-block records a shortest witness length, but the general proof text does not promise all games are optimized.
- The completion predicate evaluates public game constraints, never equality to `solution`.
- Curriculum: All 11 free cube-net families; progressively more optional usable cells and alternative net placements. Every allowed cell belongs to at least one complete foldable net through the anchor, so isolated decorative cells do not create levels.
- Normalization: Allowed-cell geometry and anchor under translation plus all eight plane symmetries. Face labels are fixed geometric meanings, not cosmetic permutations.
- Deterministic generator: `../spatial-common/generate.cjs cube-nets`. It builds candidates, removes normalized duplicates, and forwards each witness through the engine.

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

`../cube-nets.html`, this directory, and shared `../spatial-common/*`. Existing games, the lobby and shared challenge shell are untouched. There are no runtime dependencies, remote APIs, fonts or image downloads.
