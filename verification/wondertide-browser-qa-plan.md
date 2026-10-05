# Aquarium UI QA plan

Entry: /games/wondertide-aquarium.html. No hidden state injection is needed or allowed for these checks. Public screenshot/DOM observation is sufficient; AquariumSnapshot is read-only for comparing paused/reloaded state if desired.

1. Desktop1280×720 and phone390×844 / narrow360×740: check title, whole tank, mode buttons, habitat requirements, bubble/supply and shop. No horizontal page overflow. Modal content may scroll; live controls should remain together.
2. Fresh stage01: choose two different pets, start. Smart tap empty upper corner must spend zero. Tap visibly closest fish; food must appear, fall/swim and be eaten. Two meals grow a fish, then physical coins drop. Tap a coin: cash increases exactly once, food count must not also rise. Buy a fish, upgrade food, build actual completed stages. Verify original sound starts only after interaction and mute works.
3. Pause/resume, P keyboard from canvas and after button use. Background tab and return: paused, no offline time. Reload mid-run: paused with same currency/food/fish. Resume does not duplicate a completion reward.
4. Touch: single pointer release once, pointercancel produces no spending, release outside tank does nothing. Dragging is aim only. Check six mode selections; collect mode on empty space cannot spend. Keyboard1–6/arrows/space/B.
5. Campaign modal shows exactly30 unique visible stages grouped six each. Select09 for armor: wait for normal visible8-second warning then attack the actual bright eye. Closed eye absorbs shots. Bubble protects but does not delete the visitor.
6. Stage19 nursery: enable breeding, keep two ember adults fed, witness real birth; disable afterward. Stage30 has reversing current, three diets, two-birth objective and7 scheduled enemies, not copied stage geometry.
7. Rescue supply: use one; count decreases and cash adds30 once. Exhaust supply; disabled. Refuge automatically triggers on first severe injury and clears after18 seconds. No serialization failure afterward.
8. Modal Close, Escape, repeated opening, map cancel, restart cancel, import invalid text. Cancel should retain the current run. All menu pauses remain explicit; no invisible continuing invasion.
9. Backup export / import in controlled test profile; use valid legacy fixture to verify legacy label and no new campaign completion. Cross-tab conflict choice should block resume until resolved; volatile mode must remain playable.
10. Full ordinary visible stage completion, next-stage button, then reload. Record actual steps/timing/viewport and console failures. Automated legal traces are not a substitute for this browser sample.
