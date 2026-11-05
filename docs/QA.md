# Functional verification

Results apply to the restructuring review branch, not an unreviewed merge with current `main`. Production was not promoted. Tests use fresh anonymous browser contexts and block remote methods other than GET, HEAD and OPTIONS. No forms, messages, real Firebase writes or Bluetooth commands were submitted.

## Repairs found by testing

| Original public path | Repair | Evidence |
| --- | --- | --- |
| `/dashboard.html`, `/dashboard_updated.html` | Escape apostrophes in two demo strings so each inline program can parse | 67 inline scripts parse; homepage demonstration opens on desktop/mobile |
| `/CozyStudio/js/animations.js` | Clamp a first animation-frame delta that can otherwise be negative | Deterministic first-frame, pause/resume and stop tests; all 11 browser animation controls |
| `/CozyStudio/js/presets.js` | Preserve numeric zero speed/brightness through export/import | 7 import cases and desktop/mobile save/export/import/reload |
| `/og-image.png` | Serve the existing unchanged logo at the previously missing sharing-image URL | Explicit binary alias; publisher integrity and preview checks |

These are four text-file repairs and one new output alias. Original hashes remain in `config/routes.json`; corrected hashes and reasons are recorded separately. Binary content has not been edited or re-encoded. No visual redesign or application feature removal is included.

## Test evidence

- 8 publisher tests: path preservation, binary copies/aliases, tracked concurrent-work passthrough, output isolation, sensitive-path refusal, stale-output rejection and text-only repair constraints.
- 62 Worker/API assertions: query-preserving redirects, forwarding, methods, invalid input and mocked upstream responses. OmniScope handlers themselves are unchanged.
- CozyStudio: 264 animation combinations, first-frame/pause/resume/stop and 7 preset cases.
- 67 inline JavaScript blocks parse without executing application code.
- 16 browser flows / 120 assertions across desktop and 390px mobile: homepage/demo (ordinary and reduced motion), CozyStudio, Carbon, Code, Focus, login/admin gate and EYSC video metadata. See `audit/runtime-interactions.json`.
- 6 read-only live desktop/mobile flows pass for separate OmniScope, social sign-in/signup view and socialdemo navigation. OmniScope canvas, band controls, motion preview and comparison remain responsive. Their source and deployments were not changed. See `audit/separate-worker-interactions.json`.
- 5 live scientific API probes pass: invalid-input responses, JPL vector structure and SPHEREx VOTable loading. A known bundled QR2 field returns `QUERY_STATUS=OK` and 424 rows. See `audit/live-api-validation.json`.
- All 26 HTML pages loaded at desktop and 390px mobile (52 visits), with zero uncaught JavaScript errors and no horizontal overflow. The local server reports the existing React development-entry script and Cloudflare-specific email-decoder script as missing; third-party news favicons and the empty hidden admin lightbox also produce image warnings. These are recorded, not counted as fully functional pages. See `audit/runtime-pages-summary.json`. Earlier baseline evidence is retained rather than overwritten.

## Limits and release blockers

- Current `main` has received a separate Beacon redesign (including changed HTML, scripts, dependencies and deployment configuration). GitHub reports merge conflicts. No branch merge/rebase was performed. Reconcile those changes and repeat acceptance tests on the resulting merge before release; do not overwrite either workstream. See `audit/concurrent-main-review.json`.
- GitHub Pages still publishes legacy `main` + `/`. Approve and validate generated-artifact publishing before merging the organized source layout.
- Real sign-in, admin backend permissions, email delivery, Firestore rules and user-to-user transactions need an isolated test environment/test accounts. An anonymous hidden admin panel proves only UI behavior, not backend access control.
- CozyStudio physical Bluetooth connectivity and light output require the supported device. Browser animation/preset tests do not prove hardware behavior.
- GOD'S EYE standalone `/gods-eye/` remains available with its existing gate. Authorized behavior behind that gate was not tested. Its separate `redacted.html` React/Vite development entry requests missing `/src/main.tsx` on both old and preview static hosts; it was preserved rather than replaced.
- Previously deployed alternate OmniScope pages and exact-case CozyStudio paths had existing live 404s. Main-Worker previews cannot reproduce separate custom-domain Worker dispatch. Known live failures are distinguished from generated-file availability.
- Two 2-byte MP4 placeholders and the empty EYSC ZIP directory are retained. They are not playable videos or a complete archive.
- Every possible dynamic redirect, authenticated state and third-party outage cannot be guaranteed. Original public paths, current artifact contents, applicable provider redirect chains and selected actual UI behavior are verified; HTTP 200 alone is not the acceptance criterion.

## Repeating checks

Run `python scripts/test-publisher.py`, `node scripts/test-worker.mjs`, `node scripts/test-cozystudio.mjs` and `python scripts/check-inline-syntax.py`. Build to a fresh directory with `python scripts/build.py --output <new-directory>`; validate it with `python scripts/validate.py --output <new-directory> --migration`.

Optional installed Playwright plus Chromium/Chrome runs `python scripts/check-interactions.py --directory <new-directory>` or `--base-url <uploaded-preview-origin>`. It blocks remote writes and exits nonzero for failed flows. Use `python scripts/check-preview.py --base-url <uploaded-Worker-version-origin>` for provider integrity. These commands do not promote production.

The fresh artifact build and reuse checks pass. The latest local Wrangler dry-run could not complete because npm exhausted D: disk space, including after removal of generated candidate duplicates. The previous published branch dry-run passed; that evidence is not presented as a fresh dry-run of these changes. No source/backups or other projects were removed.

## Latest uploaded-version outcome

Cloudflare Workers Builds passed for `a64d646` and uploaded version `a9baa6bf-60bf-41c5-808a-6117b024af4f`. However, the fresh version URL is unavailable: all 141 file/directory GET probes returned 404 and the video probe failed, while the live video still returns its original bytes. Acceptance is **1/142 passed, 141 failed**; the sole passing comparison is the explicitly expected unavailable `.assetsignore`. This is a failed acceptance run, not evidence that application content is served. The generic local runner also receives403/error1010, and independent fetches return404 for the homepage and CozyStudio. An earlier passing version is now unavailable too.

Current main's Wrangler file declares `workers_dev: false` and `preview_urls: false`; the relationship to current preview availability needs confirmation from Cloudflare Settings. No preview, domain or production settings were changed here. The remote UI run was stopped after unavailable documents caused its first controls to be absent; its failures do not override the separately saved passing local UI results. No fresh GitHub PR workflow ran while the PR has conflicts. See `audit/provider-runtime-validation.json` and `audit/final-qa-status.json`. **Do not merge or publish based on local tests alone.**
