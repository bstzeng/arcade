# Browser QA handoff

Status: not run in this builder task. Parent requested browser ownership after upload/hosting. No screenshot or browser-readiness claim is made by offline verification.

## Inspect at 333 and 400 CSS pixels, then desktop

1. Load every sports entry from its served path, confirm no error overlay, horizontal overflow, missing glyphs, or clipped input controls.
2. Select levels 1, 50, 100; inspect visible sport-specific geometry and run at least one complete demo for each. Demo must show a win but manual count remain zero.
3. Test angle/power sliders, numeric typing, Space, Z/X/C, WASD and touch directional buttons where shown. Drag/cancel in moving games must release control.
4. Run same-device Pong/fencing and verify P2 arrows/touch, plus badminton/tennis/volleyball action controls. Soccer P2 is goalkeeper; baseball P2 is pitcher.
5. Pause/resume, change level during a shot, restart during demo, switch modes while held input is active, navigate away/back. No old animation or input may continue.
6. Inspect archery target/wind, elevated basketball/tennis/frisbee ball and shadow, billiards pockets, mini-golf moving gate/slope, fencing telegraph text, and bowling remaining-pin labels.
7. Inspect all 100 selector options and persistence after reload; assisted completion must remain separate.
8. Test freeplay bowling ten-frame scoring and extra balls. Other matches are explicitly arcade point races rather than complete official tournament rules.

Expected controls: a full 1000×600 Canvas scales to viewport; controls below it reflow into a two-column compact panel on widths ≤900px. At 333px the arena content width is 309px. Keyboard focus rings and native labeled form controls are present.
