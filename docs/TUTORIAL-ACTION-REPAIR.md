# Tutorial action repair

8 November 2026. Follow-up to the restored dashboard layout.

- Keep the practice chat open after a reply and show a working End Chat control
  below the messages, matching the real phone chat's placement.
- Use Continue wording for explanatory steps. Clicking Post your request opens
  the practice form directly, above the tutorial blocker.
- Intercept practice submission before the real or standalone demo handlers.
  Practice requests, conversations and rewards do not write to Firebase.
- Cancel returns to the posting action; Skip and Finish restore draft fields,
  original z-index priorities and normal posting handlers, and remove examples.
- Keep tutorial cards outside the live feed's replacement container so incoming
  snapshots or standalone demo renders cannot detach the active practice card.
- Enable the actual desktop circular map and the mobile map button above the
  blocker. Keep Skip away from the mobile header actions.
- Guard delayed transitions after leaving and respect reduced motion in text and
  scan transitions. Preserve the original dashboard and news ingestion code.

Validation uses Chrome and isolated in-memory Firebase exports, never a real
account. tests/tutorial_actions.py clicks the complete sequence on desktop,
390px and 320px phones, plus the standalone public demo at 390px. It also checks
Cancel, Skip, draft restoration, incoming feed changes and absence of tutorial
request/chat writes. TUTORIAL_NORMAL_MOTION=1 repeats desktop with normal motion.
The nine-width dashboard suite verifies existing maps, messaging, notifications
and category regressions. These checks do not verify deployed Firestore rules or
physical-device keyboard behavior.
