# 程式工坊 / Code Atelier

15 standalone Traditional Chinese programming games, each with 100 selectable fixed challenges. Every unchanged starter fails its goal and requires a meaningful user change; this is guarded in both runtime and DOM corpus-wide tests. Every challenge carries an actual program witness interpreted by its game's own bounded semantics, not a route-puzzle reskin. The family does not modify any pre-existing game or shared asset.

## Play and delivery

Open `games/<slug>.html`. `catalog.json` supplies the 15 root integration records for category `code`, catalog positions 226–240. The root integrator owns the lobby and publication. Browser sources are local only and need no server, account, font service, or network. The pages use direct `levels.js` includes so they also work through `file:` URLs.

The workbench provides a full program editor, tap-to-insert command chips, editable/reorderable line cards, explicit step/run, a trace scrubber, a full state inspector, level selection, restart, persistent programs, explanatory hints and a separate witness demonstration. Rule-oriented games additionally expose touch selects or cellular rule toggles. Each mechanic has its own visualization and all goals are visible.

## Rules and scope

- Swarm Command: common bee selection, reservation, carrying and yield rules; flower work, flight timers, reservations and collection deadline.
- Robot Dance: separate dance instruction streams, bounded repeat expansion, actual synchronization barriers, cell and edge-swap collisions, multiple target formations.
- Amphibious Code: one conditional program with distinct land/water movement distances, orientation and swept obstacle checks.
- Stack Kitchen: pantry queue, LIFO stack, swap/rotate/duplicate/discard and ordered plated output.
- Recursive Treehouse: recursive calls and base case, asymmetric depth decrements, modular room kinds and conditional branches; full path-labeled target.
- Signal Operator: Boolean gates, clocked delay and toggle memory, 16 finite input traces. Passing proves the published finite test suite, not equivalence for all possible infinite signals.
- Debug Courier: integer register interpreter, send operation, full finite input table, and exactly bounded line edits.
- Regex Warden: a custom finite matcher with literals, character sets, alternation and bounded quantifiers. All 781 words over A/B/1/2/- of length 0–4 are checked. It does not invoke native regex on player text and does not claim PCRE compatibility.
- Async Post: concurrently scheduled workers with bounded directional FIFO mailboxes, blocking send/receive, causal reply prerequisites, per-worker receive order, waiting and true no-progress deadlock detection.
- Twelve-Line Rocket: a reactive arithmetic/conditional language, fixed discrete kinematics, changing wind and gravity, saturated thrust, fuel, terrain, actual landing deadlines and cargo-specific vertical speed envelopes. Five progression profiles require stable descent, faster descent, and altitude-conditioned braking. This is an explicit teaching simulation, not real aerodynamic physics.
- Totem Rewrite: parallel L-system rewriting over three symbols, bounded growth, fixed rounds and exact string goal.
- Reversible Machine: NOT, SWAP, CNOT and Toffoli permutations, exhaustive truth table and reverse execution restoring every input.
- Cellular Board: elementary one-dimensional cellular rules over all eight neighborhoods; simultaneous updates and ring boundaries, multiple seeds and generations.
- Adversarial Tester: player finds a counterexample in an opponent's faulty program and then writes a conforming program. Its deterministic local AI tries specification boundaries before exhaustive -32…32 inputs. This is a transparent finite-domain search opponent, not a language model. Other hints are deterministic and not advertised as AI opponents.
- Interrupt Rescue: main patrol, typed interrupt handlers, pending priority events, nested return-PC stack, saved positions, interrupt masking and return validation.

## Proof and diversity

`levels.json` and browser-identical `levels.js` contain exactly 100 challenges per game. `solution` is an executable program; `proof.outputSHA256` binds its observed interpreter output. The validator evaluates the player's behavior against the goal, never compares submitted text to the reference solution.

`canonical.cjs` independently derives keys from relevant task constraints, dropping IDs, prose, hints, starter code, solution and proof. It additionally normalizes bee flower listing, dancer identity and stage dihedral symmetry, stack ingredient naming, recursion room naming, regex letter/digit swaps, async worker/message-pair naming, reversible wire naming, cellular reflection and rewrite symbol naming where relevant. Remaining named public quantities such as ordered messages and stations are task constraints. A unique key proves distinct normalized specifications under these stated equivalences; it does not prove 1,500 unrelated algorithms, unique solutions, optimal programs or unlimited-domain correctness.

## Help, demonstration and persistence

Progress is stored per game/level under `code120:v1:<slug>`. A demonstration uses the witness in a separate trace and never replaces player code or records completion. Copying the witness is an explicit assisted operation. Hint, witness viewing or AI testing persistently mark the level assisted; reload and restart cannot erase that mark. Actual run-to-completion registers either independent or assisted completion. Previously earned independent completion remains independent. Programs, selected level and completion survive reload. Corrupt/quota-blocked storage fails softly.

## Reproduce verification

From the arcade root:

    node games/code120-common/generate.cjs
    node games/code120-common/scaffold.cjs
    node games/code120-common/art.cjs
    node games/code120-common/verify.cjs
    node games/code120-common/dom-test.cjs
    node games/code120-common/static-test.cjs
    node games/code120-common/finalize.cjs

Generation is deterministic from the local proposal file and PRNG state. Run all verifiers after any changes; finalization hashes the exact tested release sources.

`verify.cjs` replays all 1,500 reference programs, independently checks their specifications or trace invariants, checks alternate valid programs, rejects 3,000 invalid/oversized programs, and exercises independent/assisted/demo/restart/save lifecycle for each challenge. `oracle.cjs` independently implements most domain semantics; swarm, dance, async, rocket and interrupt cases additionally verify conservation, collision, queue, kinematic and stack invariants from runtime traces. This is documented honestly rather than labeled as a wholly independent second engine for every mechanic.

`dom-test.cjs` renders and runs all 1,500 missions through the real app in a purpose-built DOM event harness and checks help/restart/reload/error states. It does not claim browser pixel layout, actual accessibility tree, keyboard focus order or screenshot review. No browser QA or publication has been performed by this family builder; the parent owns browser QA before release.

## Limits

All interpreters are bounded educational DSLs. Player code cannot access JavaScript, the DOM, filesystem or network. Program length is capped at 6,000 characters; interpreters additionally bound lines, steps, loop expansion, tree depth, rules, mailboxes or output sizes. There is no arbitrary code evaluation. The UI renders Traditional Chinese, responsive 333/400px-friendly controls and desktop columns; pixel verification remains a separate required release gate.
