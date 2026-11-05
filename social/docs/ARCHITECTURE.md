# Architecture

```
Browser
  /socialdemo -> lazy-loaded sample React demo -> local storage only
  /social     -> real React UI -> same-origin /social/api/*
                                      |
                              Cloudflare Worker
                          session + CSRF/origin + limits
                            role + ownership + privacy
                                      |
                                isolated D1 DB
                        users / sessions / social records
                          media metadata / base64 chunks
```

## Repository map

- `index.html`: Vite entry; no runtime credentials.
- `src/main.jsx`: login, feed, upload, Reels/video playback, stories, messages, settings, moderation UI, legal pages.
- `src/api.js`: same-origin authenticated fetch wrapper.
- `src/app.css`: responsive premium dark UI.
- `src/demo/`: refined guest demo, loaded only at `/socialdemo`.
- `worker/index.js`: API routes, session authorization, data ownership and privacy.
- `worker/security.js`: validation, password hashing, secure cookies and response headers.
- `worker/media-store.js`: capped D1 media storage, authenticated byte-range streaming; optional R2 adapter for a future migration.
- `migrations/`: versioned SQL schema, foreign keys, indexes and storage quota triggers.
- `scripts/prepare.mjs`: builds physical `/social/index.html` and `/socialdemo/index.html` directories and shared `/social/assets/*` files.
- `tests/`: isolated SQLite tests calling the actual Worker handler.
- `wrangler.jsonc`: only the four social routes, D1 binding and cleanup schedule.

## Request lifecycle

Mutations require a matching Origin and supported content type. Passwords become salted PBKDF2 hashes; sessions are random 256-bit values in Secure/HttpOnly/SameSite=Strict cookies with a `/social` path. Only SHA-256 token hashes are stored in D1. Roles come from the current database user row on each request.

Media has no unauthenticated download endpoint. Visibility is checked before chunk retrieval: owner, authorized administrator, or an approved and visible post. Private posts also require an accepted follow. Blocks deny both directions. Expired stories and removed posts are unavailable to members.

DM queries always include the authenticated user as one participant. The admin interface has no message-browser endpoint. Infrastructure operators with database access can still read stored messages; do not market this as end-to-end encrypted.

## Boundaries

Cloudflare's Workers/D1 runtime holds all authority. Browser storage and UI visibility never determine roles or permissions. Guest demo state cannot authenticate a real API request. The parent Beacon platform's existing identity system is not silently reused.

All static source includes only public configuration. Database IDs and Worker names are not secrets. Database contents, password hashes, sessions, provider keys and private media are server-side.

## Interests and organizations

`worker/community.js` validates profile updates and post topics, and builds chronological discovery queries. Interests are an explicit array on the user row. Organization posts are excluded from Discover unless the viewer has an accepted follow. Company pages are available in People search; privacy and block checks still apply. `src/Community.jsx` supplies interest controls, real member/organization pages, and sample organization conversations for the guest demo. Migration 0003 adds only those fields; it does not reuse the parent site's private data.
