# Restore the original dashboard flow

7 November 2026. Requested refinement, not a replacement of the dashboard.

## Presentation

- Restore a compact, single-column request feed and the original system typography.
- Retain grouped sidebar navigation and the box illustration.
- Use the homepage's logo asset and stacked Syne wordmark in the sidebar.
- Show the introduction once per account in this browser, with a dismiss action.
  Returning sign-ins on this device do not show it again. Other devices have their
  own first-visit state; no new account database field is written.
- Keep an explicit **Post your request** action beside the request heading.
- Restore the original phone chat shape, frosted header, grouped message tails,
  circular controls and equipped backgrounds. Keep it compact on mobile and
  account for visual-viewport keyboard changes.
- Remove the redundant news subheading and repeated greeting on other tabs.
  Admin owners retain one set of delete controls rather than duplicate buttons.

## Map correctness

Both maps now derive their post markers from the existing real-time feed
subscriptions. They apply the same region and expiry checks as the feeds, reject
invalid coordinates and remove markers when documents disappear. Mobile markers
are cleared before rebuilding. This does not fabricate coordinates or change
geolocation permission handling, source data or the separate OmniScope app.

## Messaging

Unread conversations show amber styling, a count in the conversation heading and
a badge on the new mobile navigation. Opening a chat clears its local indication
and persists its read state. Open-chat snapshots acknowledge newly arriving
messages. Async rendering uses the latest chat data, and mobile copies no longer
duplicate desktop element IDs. The previous duplicate IDs could update the wrong
copy and restore stale unread styling.

End Chat retains confirmation and closes only after the database operation
succeeds. Failure remains visible in the popup instead of silently reporting
success. Closing a chat invalidates pending async opening work.

## Tutorial and notifications

The Skip control no longer overlaps posting. Highlighted elements retain their
original positioning. Ending or skipping the tour restores the real form handler,
preserves the user's draft, cancels pending simulated posting and removes sample
cards. Simulation cleanup applies to the public demo too.

Read notifications older than 30 days are hidden from the inbox, without an
automatic background deletion policy. **Clear all** asks for confirmation and
deletes only notification documents addressed to the signed-in user. Conversation
and message records are not part of that operation. The existing live notification
subscription remains in use.

## News classification

Use word boundaries instead of matching keyword fragments inside names or words.
Keep clear military terms and contextual military reporting in Conflict; avoid
classifying sporting metaphors or geographic names alone as armed conflict.
Reclassify cached article labels on display as well. Publisher configuration,
RSS/proxy requests, fallback behavior, source/topic filtering, cache storage and
deduplication remain in place. This remains heuristic classification, not a
guarantee about every article.

## Verification

`tests/dashboard_original_flow.py` runs the actual dashboard module against an
isolated in-memory Firebase test double. It covers stale/other-region/deleted map
records, unread events without reload, read acknowledgement, close failure and
success, notification ownership, old-read filtering, cached news relabelling,
first-visit/returning states, tutorial skip cleanup, explicit posting and popup
size. It includes ten classification regression cases, including the supplied
chess headline and military reports. Test doubles never enter the public artifact.

These checks validate frontend behavior. They do not verify deployed Firestore
permissions/indexes, physical mobile keyboards, push delivery or a real two-account
conversation. No private community requests or messages were modified during QA.
