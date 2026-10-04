# Final browser acceptance checklist

Status: pending real-browser execution. Node rules checks and deterministic DOM simulations do not satisfy this checklist.

Use the existing catalog route `/games/hearts.html`. Do not expose hidden state or call engine transitions from DevTools; interact with actual page controls. A displayed seed may be used to reproduce a scenario.

## Desktop, 1360×1000 or comparable

1. Start a new random match from the opening dialog. Confirm 13 face-up human cards, three private AI hands, clear left-pass destination and separate selection/confirmation.
2. Select exactly three cards, try a fourth, deselect/reselect, and confirm. Confirm three cards arrive, the holder of 2♣ opens, legal-follow highlights agree with the table, and illegal cards cannot be activated.
3. Play all 13 tricks of a complete round using human card selection and confirmation. Observe staged AI plays, all four table cards, the winner's collection animation, points, and the round dialog. The raw round score must total 26, or a moon must produce 0/26/26/26.
4. Continue through a complete match. Verify left → right → across → keep passing, cumulative scores, the >=100 endpoint, displayed winner(s), and fresh-match reset. Do not treat autoplay simulation as actual play.
5. Pause during an AI turn and during the four-card display; wait, then resume. Skip one collection. Open/close Rules and Settings. Toggle sound after a user gesture, reduced motion and speeds.
6. Reload during passing, partial trick, four-card display and round results. Restored game must be paused with exactly preserved cards/scores. Changing browser tabs pauses it; it must not run in the background.
7. Open a second same-origin game tab. Only one tab may hold the active-table Web Lock. Rapid Confirm clicks in the other tab must not write or overwrite progress. Pause/hide the owning tab, then acquire ownership and adopt the latest progress in the second tab; this must not duplicate moves or points. Close the extra QA tab when finished.
8. Verify no browser console/page errors, no horizontal overflow, all controls reachable with keyboard, modal focus behavior, readable contrast and no overlapping/obscured controls.

## Phone, 390×844 and 320px width

- Seven-column, two-row hand displays all 13 ranks/suits without horizontal scrolling. Every card selection target is usable; primary confirm remains visible after selection.
- Score sidebar stacks below the table. Opponent labels stay clear of played cards. Pause overlay, setup/rules/result dialogs fit and scroll internally.
- Play a passing phase and at least two complete tricks by touch controls. Check double taps cannot duplicate a play. Repeat at 320px width.
- Check 561–680px intermediate width to catch fan-hand overflow between phone and tablet layouts.

## Legacy compatibility and navigation

- Follow “指定牌局與同機練習”. Verify 100 level buttons, existing progress/undo/replay, old Q♠-breaks-hearts explanation, same-device privacy reveal/cover and saved-state restoration.
- Return to the premium table. New-game save and preference state must still be present and paused on reload. No duplicate lobby card should exist; catalog ID and URL remain `hearts` and `/games/hearts.html`.
- Verify the lobby link and the catalog card launch the same final deployed page.

Record the final source hashes, deployed commit, browser/screen sizes, actual rounds and full matches completed, screenshots, exact console errors and unresolved findings. Do not label publication as accepted until this real-browser evidence is complete.
