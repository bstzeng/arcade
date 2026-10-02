# 猜色碼 Mastermind — 50 unique clue challenges

This is standard Mastermind feedback and turn-by-turn guessing, in an explicitly labeled **prefilled-clue challenge** variant. Black counts exact matches; white counts unmatched shared colors, each occurrence once. Levels 1–20 prohibit repeated colors; levels 21–50 allow them. Every color also carries a number for color-independent play.

## Genuine level differences
- 1–10: length 3, 4 colors, no repeats (24 possible secrets)
- 11–20: length 4, 5 colors, no repeats (120 possible secrets)
- 21–30: length 4, 5 colors, repeats allowed (625 possible secrets)
- 31–40: length 4, 6 colors, repeats allowed (1,296 possible secrets)
- 41–50: length 5, 6 colors, repeats allowed (7,776 possible secrets)

Each challenge provides truthful starting guesses and feedback jointly identifying exactly one secret. No starting guess is the answer. Every clue is necessary: removing it leaves more than one candidate. The generator excludes equivalence under all position permutations and color relabelings, with clue row ordering ignored. Therefore these are not simply 50 secret codes or palette reskins. Difficulty progresses by increasing search space and repetition, not a claimed human difficulty rating.

## Files and verification
- `levels.json`, `levels.js`: identical datasets, the JS wrapper supports static/file hosting without fetching
- `generate.py`: deterministic generation, seed 284719; full candidate enumeration and symmetry canonicalization
- `engine.js`: pure runtime feedback, validated state, submit/undo/win logic
- `app.js`, `style.css`, `../mastermind.html`: standalone UI, no shared runtime or dependencies
- `verify.cjs`: independent unmatched-list feedback algorithm; enumerates every allowed secret, checks unique answer and clue irredundancy; compares 243,476 feedback results against the runtime
- `proof.json`: per-level candidate counts, clue counts, symmetry hashes and uniqueness results
- `controller-tests.cjs`: 420 assertions over engine and actual UI controller under a minimal DOM harness; this is not a browser screenshot test

Run from repository root:

```
python arcade/games/mastermind/generate.py
node arcade/games/mastermind/verify.cjs
node arcade/games/mastermind/controller-tests.cjs
```

Controls: `#level`, `#prev`, `#next`, `#submit`, `#undo`, `#reset`, `#hint`, `#solution`, `#modal`, `#cancel`, `#confirm`. Inputs use `#draft button` and `#palette button`. Reset has an explicit cancel/confirm dialog; solution and hints are non-mutating. Eight player guesses per attempt; undo permits recovery after failure. Saves validate lengths, domains, allowed repeats, guess count, and post-win truncation; malformed data resets safely. Keyboard directions choose a slot, 1–6 choose colors, Delete/Backspace clears, Enter submits. Home link is `../index.html`.

Visual layout is coded for desktop 1180×757 and narrow/mobile screens, with scrollable history and a bounded rules panel. Browser visual QA was not performed by this worker because the assigned environment explicitly prohibited browser work; parent publication QA owns screenshots and live browser checks.
