# Security model and limits

Implemented: prepared SQL statements; validation and bounded bodies; mutation Origin checks; no wildcard CORS; session cookies inaccessible to JavaScript; random hashed session and recovery tokens; password-reset session revocation; passwords hashed with per-user random salts; member/admin authorization; ownership and private follower checks; independent DM isolation; symmetric blocks; per-network and per-member write limits; magic-byte media validation; no SVG/HTML uploads; CSP, frame denial and nosniff; storage quotas enforced by SQLite triggers; no credential/client-admin shortcut; no public database dumps or source-file serving.

PBKDF2-SHA256 currently uses 100,000 iterations to fit the Workers Web Crypto implementation's iteration ceiling. This is a deployment constraint and below current preferred password-hardening settings in many environments. Before a broad launch, move authentication to a hardened managed provider or a runtime that can support a stronger, reviewed password hashing configuration; add MFA/passkeys and breached-password screening. Avoid promising production-grade security from a custom-auth pilot.

Email verification is optional and honestly represented. Password recovery cannot work without a configured email sender. Database operators can recover access operationally but must never expose reset tokens publicly or assign admins solely from a user-supplied email.

No AI detector can guarantee authenticity. Human declarations, held uploads, moderator review and reporting are the current policy implementation. Uploaded video is not transcoded or malware-scanned. The real marketplace is link-out only. Automated age verification is not implemented.

HTTP access is supported only for loopback development. Production cookies are Secure and require HTTPS. The app intentionally requires same-origin requests. The account focus lock cannot disable browser controls; it denies app API access until server time reaches the stored deadline.

Do not store national IDs, medical details, passwords or payment details in posts or messages. Review Cloudflare backups and deletion retention before opening registration widely. The app is currently `noindex` during early access.

Report issues privately to the Beacon of Unity operator through the site's contact page. Do not include passwords, session cookies or another member's private data in public GitHub issues.

The service minimum age is 13, self-declared at signup. This is not automated age verification. Youth-specific safety and privacy controls and applicable consent requirements must be reviewed before general availability. Organization labels can be selected by users and do not indicate identity verification. No organization can purchase Discover placement.

Email configuration is protected by admin authorization, same-origin mutation checks and rate limits. Provider keys are encrypted using AES-256-GCM with a distinct server secret; only configuration metadata is exposed through the admin status endpoint. Test messages can be sent only to the current admin account email. The provider account and sender must still be activated; quota checks do not increase the provider's free allowance.
