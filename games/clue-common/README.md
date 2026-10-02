# 線索推理：十款遊戲，1,000 個可驗證關卡

This package adds ten new games without modifying any existing game, lobby, registry, or historical verification report. Every game has 100 stable level IDs, a five-part curriculum, Traditional Chinese instructions, its own interaction surface, local progress, undo/reset, current-state hints, and an isolated step-by-step solution demonstration.

## Games and exact rule scope

| Game | Distinguishing interaction | Proof and acceptance |
| --- | --- | --- |
| 邏輯配對 (`logic-grid`) | Two cross-attribute assignment grids, with seat relationships | Exhaustively enumerate both permutations; exactly one valid assignment |
| 真話與謊言 (`truth-liars`) | Witness identity board and compositional statements | Exhaustively enumerate truth assignments with known honest count; exactly one |
| 時間線追兇 (`alibi-timeline`) | Departure timeline, travel windows, opportunity marker | Enumerate all departure permutations; one chronology and one physically feasible visitor |
| 替換密文 (`substitution-cipher`) | Letter substitution keyboard and decrypted note | Independent dictionary-constrained bijection search; exactly one mapping |
| 家譜追蹤 (`family-tree`) | Three-generation parent-link chart | Enumerate every generation-respecting single-line parent assignment; exactly one |
| 帽色推理 (`hat-deduction`) | Visibility/hat board plus public speech transcript | Enumerate worlds, compute each speaker's private indistinguishability set, then eliminate worlds after every truthful announcement. Output is public knowledge: red, blue, or undetermined, not an unsupported guessed actual world |
| 物證因果 (`evidence-order`) | Append/remove/reorder event chain | Every permutation is checked; all topological orders satisfying additional nonadjacency constraints are accepted |
| 規則實驗室 (`rule-lab`) | Active experiment bench and formula builder | Finite announced grammar: `(aX+bY+cZ) mod m = r`, coefficients 0–10, modulus 2–11, inputs 0–3. All 64 input results must agree; every equivalent expression is accepted |
| 地圖定位 (`landmark-location`) | Clickable landmark grid and orientation compass | Enumerate all non-landmark positions × four facings; exactly one |
| 密室道具 (`escape-inventory`) | Consumable inventory and recipe mechanisms | Independent forward BFS proves a shortest valid exit plan; any legal successful plan is accepted |

The family tree intentionally records one direct lineage parent per person, not a complete two-parent biological pedigree. The alibi task identifies physical opportunity from the stated model, not criminal guilt. The rule lab is a bounded inference game, not guessing an unrestricted mathematical sequence. All three scopes are explained in the visible instructions.

## Files and commands

Each `games/<slug>.html` loads the existing new `challenge-common` lifecycle shell, this family's DOM-free `engine.js`, `<slug>/levels.js`, and this family's `app.js` renderer. The thin per-game engine adapters are CommonJS/browser compatible. `levels.json` is the readable fixed corpus; `levels.js` contains the same data for offline browser loading. No backend, external runtime API, CDN, or account is required.

Run from the Arcade project directory:

```sh
python games/clue-common/generate.py
# Repair just one corpus without rewriting the other nine:
python games/clue-common/generate.py --only logic-grid
python games/clue-common/test-canonical.py
python games/clue-common/verify-independent.py
node games/clue-common/test.cjs
node games/clue-common/test-ui.cjs
```

The generator is deterministic. It fills each 20-level tier by seeded candidates and rejects canonical duplicates. Re-running it preserves stable IDs and produces byte-identical level assets. `verify-independent.py` does not import the generator or the JavaScript engine. It reimplements the domain rules with separate enumeration/BFS and emits `independent-verification.json`. JavaScript `test.cjs` exercises shipped reducers, validators, hints and controllers. `test-ui.cjs` executes all actual shipped scripts in an event-capable simulated DOM and solves every level through its rendered controls.

For a supported real-browser environment:

```sh
python -m http.server 8327 --directory .
CLUE_BASE_URL=http://localhost:8327 CHROMIUM_PATH=/usr/bin/chromium node games/clue-common/test-browser.cjs
# Optional: every level instead of the representative 1/50/100 samples:
CLUE_FULL_BROWSER=1 CLUE_BASE_URL=http://localhost:8327 node games/clue-common/test-browser.cjs
```

`test-browser.cjs` is a real Playwright/Chromium suite with manual control interactions, desktop/narrow layouts, replay isolation, modal Escape, reload, console-error checks, and screenshots. **It has not passed in this environment.** Chromium launch is blocked by `socket() Operation not permitted`, and the cloud browser refuses localhost with `ERR_BLOCKED_BY_CLIENT`. Do not present simulated DOM tests as real-browser visual QA. The release owner must run this gate on a supported preview before publishing.

## Canonical diversity

`canonical.py` removes IDs, stories, labels, witness annotations, and rule-preserving symmetries. Canonical fingerprints are stored on each level and are independently recomputed:

- Assignment grids: first normalize `gap(0)` to equality (including removal of the irrelevant distance payload), then rename professions/drinks by their uniquely determined seat, exchange attribute categories, and reverse the seat axis with corresponding relations.
- Truth statements: exact colored directed graph canonization, including speaker relabeling and commutative predicate references; irrelevant second operands of single-reference statements are ignored.
- Timelines: canonical suspect order by uniquely determined departure slot; names are removed.
- Ciphers: exact word/letter incidence graph, removing arbitrary plaintext and ciphertext symbol names while retaining word positions, message positions, and public anchors.
- Family trees: exact generation-colored relational graph, removing all person labels.
- Hat puzzles: exact visibility graph with ordered announcements as colors, plus global red/blue inversion and matching total-count transformation.
- Evidence chains: transitive closure, removal of already-implied nonadjacency clues, exact graph canonization, and reversal of the complete ordering axis.
- Rule lab: complete 64-bit truth table modulo all six input-axis permutations and eight input-axis reflections. Different seeds or initial examples of the same symmetric rule do not count as new puzzles.
- Maps: all square rotations/reflections, corresponding signed observer-coordinate changes, and landmark relabeling.
- Inventory: exact colored bipartite resource/recipe graph, retaining quantities, starting stock and goal but removing material names and recipe ordering.

Graph canonization uses invariant color refinement and exact permutations inside unresolved color cells, not only a noncanonical hash heuristic.

## Difficulty and safety

Difficulty grows through structural dimensions: more assignment entities; additional truth operators; more chronology slots; longer cipher messages; wider families; larger visibility worlds and longer announcement chains; more events; three-feature modular rules; larger maps; deeper resource graphs. Tiers are deterministic curriculum bands rather than a claim that every adjacent random puzzle has a strictly greater human solve time.

Validators do not use the stored reference solution as an equality-only win predicate. Unique games check the public constraints; multi-solution games check the actual rule semantics. Hat knowledge is recalculated from worlds. Rule hypotheses are compared by all legal observations. Inventory state is rederived from the action log before accepting a save. Replays never modify the player's board or grant completion; assistance is tracked by the common shell. Dead-end inventory/order hints explicitly suggest undo/restart rather than presenting an invalid continuation.
