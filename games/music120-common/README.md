# Music120: fifteen sound-creation games

This family adds only its fifteen new HTML entries, two same-named task-data directories, and `games/music120-common/`. It has no dependency on remote audio, a microphone, accounts, an external AI service, or other game-family engines. The existing lobby and existing 150 games are outside this family's ownership.

## Run and verify

From the arcade root:

- `node games/music120-common/generate.cjs` deterministically reconstructs the catalog, 15 SVG artworks, 200 task records, and 200 action witnesses.
- `node games/music120-common/verify.cjs` runs syntax/static, corpus, independent-equation, semantic-negative, synthesis, WebAudio graph/parameter-scheduling, and real-controller simulated-DOM tests. It writes the two verification reports.
- `node games/music120-common/dom-test.cjs` runs only the controller/event/lifecycle simulation.
- `node games/music120-common/finalize.cjs` binds the release manifest to the verifier's exact source hashes. Run the full verifier first.
- `node games/music120-common/verify.cjs --check-report` rejects a missing, extra or changed owned source compared with the last tested source fingerprint.

Serve the arcade directory as static files and open any `games/<slug>.html`. No build step or runtime server API is needed. Tests are Node 18+ compatible except `findLastIndex`/`at` require a current supported Node runtime; verified here with Node 24.19.0.

## Mode and mechanic inventory

| Game | Mode / level count | Actual sound mechanic |
|---|---|---|
| 聲音採集簿 / sound-collection | Creative sandbox / 0 | Walk a 4×4 island, visit six sources, collect them into a pocket, and place only collected sound types in a 16-step composition. Wind/paper/footsteps use differently filtered noise; wood, water and metal use tonal synthesis. |
| 迴圈花園 / loop-garden | Creative sandbox / 0 | Four editable plants run their own 2–9-step cycles against a shared tick. The default 3/4/5/7 periods produce genuinely asynchronous note patterns over 48 ticks. |
| 擬音工作室 / foley-studio | Creative sandbox / 0 | Place synthesized object effects on an 8-second film timeline. Animated door, steps, water and falling cup events share the audio clock. Hide the film and plot instructions for a same-device listening/guessing session. |
| 音色煉金 / timbre-alchemy | Creative sandbox / 0 | Waveform, low-pass cutoff, attack, release, transposition and playable keys feed actual oscillator/filter/envelope schedules. |
| 空間樂團 / spatial-orchestra | Creative sandbox / 0 | Three movable sources, a movable listener, and manual/circular/diagonal paths alter stereo panning and inverse-distance amplitude per note. |
| 旋律接枝 / melody-graft | Creative sandbox / 0 | Edit a four-note motif, then append transformed bars. The first two motif notes remain anchors; the second half can rise, fall, invert or rotate. Up to 12 editable bars and local turn-taking. |
| 回音建築師 / echo-architect | Objective experiment / 100 | Move two one-dimensional reflecting walls and change each absorption coefficient to match first-reflection delay and amplitude. Direct sound, two wall reflections, and one combined-path reflection are synthesized. |
| 故事配樂師 / story-score | Creative sandbox / 0 | Two editable character leitmotifs recur through four story cues with independent character, tempo and instrument choices. |
| 靜默作曲室 / silent-composer | Creative sandbox / 0 | Place notes in 16 slots under an adjustable sounding-time budget. The budget counts the union of actual note durations including release tails; over-budget playback is blocked. There is no score or predefined task progression. |
| 聲景生態箱 / soundscape-terrarium | Creative sandbox / 0 | Seeded, half-second ecological rules combine rain, bird and insect probabilities with time of day and rain suppression. 16-second reproducible soundscapes. |
| 樂器發明家 / instrument-inventor | Objective experiment / 100 | Select a string, closed pipe or membrane; change effective length/radius and tension; design the required fundamental and playable semitone span; tune a resonator filter and play all keys. Distinct modal/partial models are audible. |
| 聲音迷彩 / sound-camouflage | User-authored creative listening sandbox / 0 | Hide bell/bird/water in one of four procedurally generated stems, pass the device to a listener, solo the same stems and reveal voluntarily. No built-in scored challenges, guessing score, or unlocks. |
| 同曲異景 / same-tune-scenes | Creative sandbox / 0 | A fixed eight-note melody remains invariant while four chord roots/qualities, instrument and tempo change. Three editable scene recipes demonstrate possibilities without aesthetic correctness claims. |
| 圖形樂譜 / graphic-score | Creative sandbox / 0 | Paint a 16-column × 8-height graphic score, one pitch per column. Height is pitch, color is waveform, density is repetition rate. A visible scan line follows playback. |
| 聲音接力站 / sound-relay | Creative sandbox / 0 | Each station applies exactly one reversal, three-semitone shift or half-clip slice. Reversal changes event ordering and plays time-reversed PCM envelopes. A local partner selects one transformation; 12-step undo history. |

Creative sandboxes intentionally have no fabricated 100-level series or objective taste ratings. The two objective games each have 100 selectable, acoustically different targets; they accept valid alternate constructions.

## Objective model and proof scope

### Echo Architect

- Source and listener are co-located, with a left and right planar wall.
- First-return delay is `2 × wall distance / 343` seconds.
- First-return linear amplitude ratio is `1 − absorption`.
- The secondary combined-wall path has delay `2 × (left + right) / 343`; its gain is the product of two reflection coefficients with an additional fixed attenuation.
- The task checks the two first delays within ±1.5 milliseconds and amplitude ratios within ±0.012. It does not score the secondary reflection.
- 100 targets cover ten distinct left distances, ten right distances and independently changing absorption values. These are changed acoustic constraints, not cosmetic labels.
- This is a transparent one-dimensional educational approximation, not ray-traced room acoustics, interference, frequency-dependent material absorption, or a certified acoustic-design tool.

### Instrument Inventor

- Ideal string: `f = sqrt(T / 0.003) / (2L)`.
- Ideal closed pipe: `f = 343 / (4L)`.
- Ideal circular membrane fundamental: `f = 2.4048 sqrt(T / 0.5) / (2πr)`.
- Tasks require the indicated physical model, fundamental within ±12 cents, and at least the specified semitone span. The 25 fundamentals and four interval spans form 100 distinct audible target ranges; model choice rotates independently.
- Keys simulate changing effective length or tension to equally tempered finger positions. The string has integer partials, pipe odd partials, and membrane illustrative inharmonic modes. The resonator is a low-pass filter.
- This is an educational modal model, not a finite-element physical simulation or a claim that an untuned real drum can play a chromatic keyboard without changing tension.

`engine.transition`, used by actual input controls, validates and sanitizes each parameter action. The checked-in `proofs.json` files contain nonempty action sequences. The verifier replays all 200 through the same transition function, runs the real validator, then independently checks formulas and actual emitted frequencies/delays. It tests a different valid construction per task, invalid geometry/tuning, nonfinite data, empty witnesses and invalid commands. No unique-solution claim is made.

Reference audio does not change the user's design. A visible demo loads a legal construction through the replay engine, marks the entire attempt assisted, and cannot add a manual-completion record. Saving/loading a demo preserves that flag; imported task compositions are assisted. A deliberate fresh retry clears assistance and resets the design, preserving previously earned completion records. Contextual hints also mark and persist an assisted attempt, including across edits, save/load and reload. They explain equations rather than claiming a hidden aesthetic answer.

## Audio engine, controls and lifecycle

- `audio.js` creates an AudioContext only inside a requested play/audition gesture and resumes a suspended context, including the `webkitAudioContext` fallback for iOS.
- A 25ms look-ahead timer schedules real OscillatorNodes or AudioBufferSourceNodes, envelope GainNodes, low-pass BiquadFilterNodes and stereo panners. Partial banks use normalized partial gains. Noise is generated locally.
- Master volume is capped at 0.25, voice gain at 0.096 and active voice count at 48, with a dynamics compressor. These are technical output limits; device volume still matters and the UI recommends starting low.
- Mute alters master gain. Stop, pause, reset, field edits, level changes, tab hiding and page exit cancel pending schedules and stop/disconnect all active voice graphs. Page exit also disconnects and closes the master context.
- Pause resumes the original timeline, recreating an overlapping note with a fresh envelope; it is not sample-phase-continuous DAW transport.
- Stale async `resume()` completions cannot restart stopped audio. The transport is tested both for natural ending and interruption.
- Pure visual playback never constructs an AudioContext. Captions, pitch/position readouts, animated scenes and editable diagrams provide alternatives to hearing alone.
- Keyboard support includes native Tab/Enter/Space controls, Escape stop, island arrow movement and listener arrow movement. The graphic score has keyboard-operable cells. Touch users can tap every control; pointer painting also supports desktop dragging.
- Narrow layouts collapse at 800px; 333/400px intended widths use wrapped controls and a four-column step editor. Actual browser-layout QA is a separate gate owned by the integrator.

## Local collaborator policies and permitted observations

All collaborators are deterministic local arranging rules, explicitly labeled “本機夥伴”. They are not trained models, remote LLMs, network opponents or claims of human musicianship. Each observes only the currently visible/editable composition for its own game:

- Collection: use collected IDs only, alternating sounds and rests.
- Loop garden: preserve existing notes; fill empty cycle positions with a consonant pattern.
- Foley: use the public film timings and the selected object for its last cue.
- Timbre: choose a complementary waveform and attack from current cutoff/release.
- Spatial: spread sources around the current listener location.
- Melody graft: use the previous bar's average pitch to rise/fall; retain motif anchors.
- Story: use current character ranges and public scene order for instrument/tempo suggestions.
- Silence: preserve spaced onsets and remove enough events to meet the current budget.
- Ecology: use current day/night choice to adjust activity probabilities.
- Camouflage: the author-side helper knows the author's selected secret type and sets a suggested mask level; no solver falsely peeks at hidden information.
- Reharmonization: compare fixed melody accents with user-selected chord roots for major/minor suggestions.
- Graphic score: preserve painted points; fill empty alternating columns from adjacent height and the last color.
- Relay: choose a slice for a long clip, downward transposition for a high mean frequency, otherwise reversal/upward shift based on current turn.
- Echo and instrument: no AI role is claimed. Explicit reference constructions and measurable feedback are available instead.

## Saving and data safety

Each slug has its own `arcade.music120.<slug>` key. Current state is locally persisted; a separate user-controlled snapshot supports save/load. JSON export/import transfers only that game's composition, not manual completions. Imports are size-limited, checked for game/schema identity and sanitized. Stored corruption/quota failures are caught. There is no storage or upload to a third-party service. Reset does not erase earned task completion records.

## Verification limits

The reports accurately distinguish three independent forms of evidence:

1. Engine witness replay plus a separately written equation/semantic oracle.
2. The actual WebAudio scheduling implementation driven by instrumented graph/parameter mocks, with voice/source lifecycles and interrupted-resume tests.
3. Numerical waveforms with energy, peak, frequency, envelope, filtering and reversal assertions, plus real-controller event tests in a purpose-built DOM simulation.

The numerical renderer is a deterministic visualization/test reference, not a bit-identical reproduction of a browser's antialiased oscillator, BiquadFilter, compressor or stereo output. It is also used for reversed PCM buffers. The suite does not claim physical-device listening, actual browser screenshot/layout testing, cross-browser audio compatibility, hardware stereo, screen-reader usability certification, or perceptual musical quality. These need separate browser/device checks. All results are source-bound with SHA-256.
