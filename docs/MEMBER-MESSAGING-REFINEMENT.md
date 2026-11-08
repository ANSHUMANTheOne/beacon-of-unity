# Search, persistent Lost and Found, and admin messages

8 November 2026.

The search icon and placeholder overlapped because the general input rule had
higher CSS specificity than the search padding. Reserve 40px on the inline start
of search fields, with a pointer-transparent icon positioned on the same side.

Lost and Found no longer calls the expiry-based deletion helper or shows expiry
chips and extension prompts. Its map records use region and coordinate checks
without the community request age limit. Owner and moderator deletion remain.
Community requests retain their existing seven-day expiry behavior. This cannot
recover items deleted before the change. No backend TTL policy is configured in
this repository; the removed deletion mechanism was in the dashboard client.

The existing moderation entry identifies the admin account by its Firebase UID.
Use that same UID for a Message a member action on desktop and mobile and a
Message as Admin action in the member profile's admin view. The picker searches
names, email and region, supports keyboard navigation, and has empty/error states.
Admin senders are also identified in message notification titles.
Opening a private admin conversation reuses the existing chat path, real-time
subscriptions, unread indicators, notifications and phone popup. Reopening a
member preserves message history and uses a stable pair-based conversation ID.

Admin conversation and sender labels derive from the established account UID,
not user-editable profile roles, display names, or a message senderRole field.
This adds no Firestore permission grants. Existing authentication and deployed
Firestore rules remain the authority for chat creation, sender identity and reads.

Validation: Chrome checks at desktop, 390px and 320px; member and admin fixtures;
old-item persistence in both feed and map; manual deletion; both search filters;
non-admin action denial and false-role labels; recipient Admin labels; opening
failure and retry; outgoing messages and history preservation. These are isolated
frontend tests, not a verification of production Firestore rules or delivery to a
real member. Existing dashboard checks run at nine widths.
