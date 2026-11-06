# Beacon of Unity approval delivery

The main Beacon admin commits membership approval and removal of its review in one Firestore batch, then requests email delivery. Email problems never reverse membership approval. Volunteer approvals intentionally do not send email.

The static main site calls `/social/api/beacon/approval` with a Firebase ID token, not a provider key. The Worker verifies Google's RS256 signature, project audience, issuer and expiry and requires the existing Beacon admin UID allowlist in `worker/beacon-mail.js`. It reads the target member's approved Firestore record using that admin token; clients cannot provide a recipient or arbitrary message. Maintain that allowlist when the main site's administrator changes.

Migration 0007 adds a persistent D1 outbox with one welcome email per Firebase member ID. A minute cron claims at most five messages per run; atomic leases prevent concurrent delivery. Accepted messages are not resent by ordinary retries. Temporary failures back off; eight failed attempts surface for admin retry. Hourly/monthly quota deferrals do not consume attempts. Accepted means provider acceptance, not confirmed inbox receipt. As with most SMTP/API queues, a crash after provider acceptance but before recording it can cause a rare duplicate on recovery; this is not an exactly-once guarantee.

The verified SendPulse connection and global budget (50/hour, 12,000/calendar month) are shared with Social authentication emails. Overflow waits for the next budget window. This is a finite free allowance, not unlimited email. The provider may impose additional anti-abuse or account limits. Sending uses the verified configured sender, display name **Beacon of Unity**, and Reply-To `beaconofunityofficial@gmail.com`. Do not spoof a Gmail From address through a third-party sender.

The template includes https://beaconofunity.com/logo.png, escaped member names, inline email-safe table styles, a login link, and plain text fallback. SendPulse requires UTF-8 HTML encoded in Base64: https://sendpulse.com/integrations/api/smtp .

The main admin's **Approval emails** panel shows provider acceptance, queue state, recent errors and failed-message retry. Failed initial enqueue requests retain member IDs locally for retry. If the browser closes between Firestore commit and the first queue request, membership remains approved but manual re-enqueue using the member ID may be necessary; Firestore and D1 do not share a transaction. A later server-side Firestore trigger would remove that narrow cross-system gap but needs a separately authorized Firebase deployment.

No historical approvals are automatically emailed. Outbox recipient information is private, accessed only by a verified main-site administrator. Define retention policy before scaling; currently history remains for deduplication and admin diagnosis.
