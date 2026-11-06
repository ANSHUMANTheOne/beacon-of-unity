# Social — Beacon of Unity

An early-access React/Tailwind social application with a Cloudflare Worker API and D1 persistence. Brand name and logo are intentionally temporary.

Large uploads use optional private B2 multipart storage; see [storage setup and limits](docs/STORAGE.md). Main Beacon membership mail uses a separate authenticated persistent queue; see [approval email operations](docs/APPROVAL_EMAIL.md). Long-form Videos are deferred; Reels remain available.

Google sign-in uses Google's official button with server-verified identity tokens and secure existing-account linking. Configure a public Google web client ID and its allowed origin; no client secret is needed for this sign-in flow. See [Google login setup](docs/GOOGLE_LOGIN.md).

## Two separate experiences

| URL | Purpose |
| --- | --- |
| `https://beaconofunity.com/socialdemo` | Guest prototype with sample photography, stories, Reels, interest-based discovery, organization pages, and device-local demo messages. No real login required. |
| `https://beaconofunity.com/social` | Real sign-up/login, posts held for moderation, likes, comments, follows/private accounts, private DMs, saved posts, media uploads, server-enforced focus sessions. |
| `/social/admin` | Same account login; API requires the `admin` role. Ordinary sign-ups cannot grant themselves this role. |
| `/social/settings` | Profile, account privacy, follower approvals, email confirmation, sign-out, account deletion. |
| `/social/privacy`, `/social/terms` | Early-access notice and community rules. |

The Worker handles only the exact `/social`, `/social/*`, `/socialdemo`, and `/socialdemo/*` routes. The existing Beacon homepage and other apps have separate routes. This folder can be committed as `social/` within the existing Beacon repository or used as a standalone repository.

## 1. Install and run locally

Node 24 LTS is recommended (tests use the built-in `node:sqlite` module).

```sh
cd social
npm ci
npm test
npm run build
npm run db:local
npm start
```

Open `http://127.0.0.1:8787/social` and `http://127.0.0.1:8787/socialdemo`. `npm run dev` runs Vite on port 5173 for frontend iteration; the integrated Worker on 8787 is the authoritative login/upload test environment. Vite proxies `/social/api` to the Worker, but cookie and origin policy are intentionally strict: use port 8787 for authenticated testing.

Local accounts, database and media live under ignored `.wrangler/`. They never enter Git or the published static assets.

## 2. Infrastructure

The initial deployment uses Cloudflare Workers and D1, with no R2 subscription. `wrangler.jsonc` contains the real database identifier, which is configuration, not a credential. For a fresh account:

```sh
npx wrangler login
npx wrangler d1 create social-db
```

Replace the database ID in `wrangler.jsonc` with the returned ID. The account must manage the `beaconofunity.com` zone to deploy the supplied routes. Change the routes and `APP_ORIGIN` if deploying elsewhere.

```sh
npm run db:remote
npm run deploy
```

Deployment is explicit; a GitHub push alone does not run Wrangler. Cloudflare must already proxy the domain. Retain the existing site's hosting configuration; do not point the domain's root at this app.

## 3. Set up your administrator

There are no default passwords, hard-coded admin emails, first-user-admin shortcuts, or public setup endpoints.

1. Open `/social`, create your own account, and choose your own password. Never send it through chat or commit it.
2. In the Cloudflare dashboard, open **D1 → social-db → Console**. Find your account:

```sql
SELECT id, username, email, role FROM users ORDER BY created_at;
```

3. Verify the row is yours and promote that exact account ID:

```sql
UPDATE users SET role='admin' WHERE id='YOUR_ACCOUNT_ID';
```

4. Reload `/social/admin`. Admin checks happen on every API request. Account lists, reports, review media and moderation logs are not exposed to members or guests.

Do not publish database dumps or screenshots containing other members' private details. To revoke admin privileges, set the role back to `member` using the D1 console.

## 4. Posting and private access

1. Create an account and find people in Discover → Explore people.
2. Create a photo, Reel or 24-hour story. The server validates the media type and signature, checks limits, and stores it privately. Long-form video creation is deferred.
3. New posts enter `pending`. Only the owner and admins can retrieve pending media.
4. An admin reviews the post and approves or removes it. Approval is a moderation decision, not a scientific proof that no AI was used.
5. Public approved posts appear in Everyone/Discover. Following shows accepted follows and the viewer's own posts in chronological order. Private accounts require follower approval.
6. DMs persist between two actual accounts; third parties cannot retrieve the conversation through the API. Messages refresh every five seconds while the inbox is open. Messages are not end-to-end encrypted.

The guest demo uses a separate local-storage namespace and sample data. It has no authority over real users, admin roles, media access or production messages.

## 5. Free-tier media limits

Connecting private B2 storage enables a 1 GiB file limit, 8 GiB global budget and 2 GiB/member reservations, with resumable 8 MiB parts. The admin connection stays disabled until credentials and private-bucket read/write/delete checks succeed. Follow [storage setup](docs/STORAGE.md); a live provider acceptance test is required before announcing this capability.

The pilot stores binary files as **base64 text in 192 KiB chunks** in D1. Base64 is not encryption and does not bypass storage accounting. Access is protected by session and authorization checks; the database is not a public asset folder.

- Maximum file: **8 MiB**.
- Maximum raw media per member: **20 MiB**.
- Maximum raw media across the app: **128 MiB**.
- Base64 adds approximately 33% storage overhead, plus database overhead.
- Raw media is sent only after authorization. Video byte-range requests are supported.
- Daily scheduled cleanup removes expired sessions/tokens/rate counters and unattached uploads older than one day.
- Account deletion cascades through metadata, chunks and social records.

Cloudflare quotas still apply. These default D1 caps keep a small pilot bounded. B2 multipart storage adds larger resumable uploads within its own finite free budget. Transcoding, thumbnails and adaptive streaming remain future infrastructure work. A larger video network requires a funded hosting plan; changing encodings or splitting files does not remove provider quotas. Never enable a paid plan without the owner's explicit decision.

## 6. Recovery and verification email

The app supports SendPulse's free transactional email plan (12,000/month; 50/hour). Account signup, email/SMS confirmation, SMTP activation and sender verification happen in SendPulse. Complete those steps, then use **Private email connection** in `/social/admin` to connect a static API key. Do not share credentials through chat.

Credentials are encrypted in D1 with an independent Worker secret, `EMAIL_SETTINGS_KEY`. The key never appears in source or an API response. The admin panel shows send usage and can send a test only to the administrator's own account email. Password verification/reset links expire in 30 minutes. Provider acceptance and actual inbox delivery are separate checks.

See [the complete email setup guide](docs/EMAIL_SETUP.md). Password login works before email setup; confirmation and recovery fail clearly until a sender is connected. Legacy Resend server-secret configuration is retained as a fallback.

## 7. People-first discovery and organization profiles

Discover contains community posts, filtered by interests explicitly chosen by the viewer. Uploads can have up to three topic tags. There are no product tiles or sponsored rankings in Discover. Organization posts enter a viewer's discovery results only after that viewer follows the organization.

Companies can choose an Organization profile in Settings, add a bio and HTTPS website link, publish moderated posts and reply to people. Their page is available through People search and clickable post handles. Organization status is a label, not verification or an authenticity guarantee.

Payments are not enabled. Stripe Connect, seller verification, webhooks, taxes, refunds and payouts remain future work if direct commerce is reintroduced. Legacy product schema/endpoints are unused by the current UI and have no Discover placement.

## 8. GitHub sequence

Add this folder as `social/` in `ANSHUMANTheOne/beacon-of-unity`:

```sh
git switch -c feature/social-app
git add social
git commit -m "Add social pilot and separate guest demo"
git push -u origin feature/social-app
```

Review the diff before merging. Keep `.gitignore`; never upload `.env`, `.dev.vars`, `.wrangler`, account data, OAuth config or credentials. CI runs dependency installation, API tests and the build. The workflow template in `docs/social-ci.yml` can be copied into the repository's `.github/workflows/social-ci.yml`. The deployment workflow is deliberately manual and requires scoped Cloudflare secrets.

## 9. Validation and operational limits

`npm test` covers authentication, role escalation attempts, cross-origin rejection, pending/private media access, follow approval, blocks, DM isolation, focus enforcement, byte ranges, deletion, input validation, and unavailable email behavior. Browser QA exercises signup, upload, comments, focus reload and mobile/demo navigation.

This is a functioning early-access model, not a finished Instagram/YouTube-scale service. Before wider public launch: connect email recovery, assign the administrator, review applicable legal/privacy requirements, add robust moderation staffing and appeals, abuse/fraud tooling, stronger authentication/MFA, monitoring and incident response, media processing/scanning, pagination and index tuning at scale, and production load tests. The minimum age is 13 and currently relies on user attestation. Youth-specific safety and privacy work remains necessary before general release. Security controls are tested but have not had an independent audit.

See `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, and `docs/ROADMAP.md`.
