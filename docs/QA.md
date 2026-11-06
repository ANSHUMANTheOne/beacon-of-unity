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

## Approved integration verification ? 6 November 2026

This section supersedes the earlier branch-only merge-conflict and dry-run status. The authorized review-branch integration preserves the newer main Beacon design and account files. The source/output manifest now covers 147 resources: all 136 original paths, one unchanged-logo alias, and ten current-main design assets. 31 original text resources have separately recorded source hashes (29 inherited main updates and two CozyStudio repairs); 105 retain original snapshot bytes. Every original binary remains unchanged.

Current checks pass: 9 publisher tests; 62 Worker assertions; 264 animation combinations and 7 preset cases; 55 inline scripts; all five freshly built design bundles identical to retained assets; 52 HTML browser visits with no uncaught errors or horizontal overflow; 16 integrated UI flows/128 assertions; and 22 isolated login/logout/verification-state flows/96 assertions. See `audit/integrated-interactions.json`, `audit/integrated-pages-summary.json` and `audit/integrated-auth-redirects.json`. Firebase is replaced with local fixtures in redirect tests, all real remote writes are blocked, and destination HTML is intercepted only after its correct URL is requested. These are routing tests, not real account/backend authorization.

The fresh Wrangler 4.157.0 dry-run passes. Windows child processes initially could not resolve Node, and an incomplete shared npm cache failed; an isolated install with lifecycle scripts disabled and an explicit D: PATH resolved those QA-environment issues without changing application logic. The current-main OmniScope files are retained, with no additional OmniScope logic or separate deployment changes.

The earlier inaccessible version-URL acceptance report remains a failure. Version previews remain disabled in the reconciled Wrangler configuration, pending account inspection and any specifically approved staging change. Production and main are not changed. Original provider/development-entry warnings, real authentication/backend/hardware limits and the GitHub Pages publishing transition still apply.

Latest upstream follow-up: only OmniScope?s index and workspace stylesheet changed after the initial integration. Their exact main bytes were retained; two targeted desktop/mobile scene flows (10 assertions) pass. All 147 mapped resources and four directory aliases pass local HTTP byte/MIME validation (151/151). The account and Beacon design files are unchanged from their already-tested integrated versions. `audit/final-integration-status.json` is the current summary; earlier `final-qa-status.json` remains historical evidence. Provider acceptance and production remain pending.

Hosted verification of source commit `0df45ce`: GitHub artifact-validation run42155926797 and Cloudflare upload buildfc322341 both pass. Uploaded version `7fd58ac6-f06a-44a6-80dd-a1e15d21cf42` remains inaccessible with version URLs disabled: fresh full acceptance is1/152 passed and151 failed (only the expected unavailable dotfile matches). See `audit/integrated-provider-validation.json`. Preview-readiness failures now save an actionable JSON report rather than losing evidence in a traceback. The newer homepage?s desktop/mobile screenshots were visually inspected as well as its DOM/canvas controls.

The current Pages-source recheck was blocked by automatic approval review because it would use a stored Git credential without specific authorization. The credential was not retrieved; explicit approval is pending. No Settings change occurred. The previous confirmed legacy main/root configuration remains the recorded rollback reference, not a newly reverified setting.

## Verified enabled preview ? 6 November 2026

The user explicitly approved Preview URL enablement. The final dashboard change was verified after reload: Preview ON, Production workers.dev OFF, beaconofunity.com unchanged. The initial reported enablement did not persist; that observation is retained in the setting audit rather than treated as success. The subsequent immutable version at `https://09b9b63f-beaconofunity.anshorg.workers.dev` passed 152/152 content/MIME/redirect/range checks. The known unavailable `.assetsignore` remains 404; every other expected static resource matched its current source. See `audit/provider-preview-enabled-validation.json` and the updated 151-row `audit/integrated-routes.csv`.

All 16 main-site desktop/mobile UI flows passed on that uploaded version (128 assertions), including homepage demos, media decoding, EYSC video metadata, account/admin gate, Carbon, Code, CozyStudio and Focus. See `audit/hosted-main-interactions.json`. No real account transactions were submitted. The hosted preview-verification workflow rerun passed too, alongside artifact validation and Cloudflare upload. Earlier failed preview reports are historical and are superseded for this version.

The main-Worker version URL cannot reproduce the separate OmniScope API Worker. Tests therefore target the real dedicated Worker for scientific-data interactions; they do not fake that dispatch on the assets-only preview. A cold desktop detector-load check exceeded 90 seconds while controls correctly showed the loading-disabled state; mobile detector/replay interactions subsequently passed. No OmniScope code was edited to change that behavior. The final live-flow report records the retry result separately.

Live OmniScope follow-up: mobile detector3/6/2 and replay checks passed; desktop remained in the scientific-load busy state beyond the90-second assertion, and a desktop-only retry was stopped without a result. This does not establish a specific application bug or its cause. The separate app is under concurrent development; no OmniScope source or deployment was changed. See `audit/hosted-omniscope-observation.json`. The default main-site UI suite covers16 flows; dedicated scientific UI tests require an explicit `--omniscope-base-url` and are reported separately. Earlier passing OmniScope observations are retained as historical, not substituted for the latest result.

## Final refinement snapshot before cutover

The user gave full authorization to finish main-repository organization, conditioned on retaining links, redirects, icons and current behavior. Newer main `056b25677afd5a5621fb36a6fcc107a53f553889` is incorporated verbatim, including its refinement, privacy/deletion wording, compiled assets and ongoing OmniScope work. The new refinement note is organized under docs and retains its possible original public path. There are 148 mapped resources: 136 original paths, ten shared design assets, one new document route and one unchanged-logo alias.

All five isolated compiled bundles match newer main bytes; 55 inline scripts parse; 10 publisher tests, 62 Worker assertions, 264 animation combinations and 7 preset cases pass. All 148 resources plus four directory aliases pass local byte/MIME checks (152/152). All 26 HTML pages pass desktop/mobile checks (52 visits, no uncaught errors or overflow), and 16 main-site UI flows pass with 128 assertions. A hidden duplicate demo CTA is preserved; the test uses a visible CTA. See `audit/refinement-*.json`. A positive live QR2 query returned 424 rows with QUERY_STATUS=OK; the separately documented live desktop image-load limitation is not claimed fixed. No OmniScope application changes are made beyond verbatim upstream integration.

The publisher refuses silently omitted future tracked files: each needs a route, reserved concurrent passthrough or explicit source-only classification. The 153-check provider acceptance for this new snapshot follows its upload. Earlier 152-check evidence applies only to the previous version.

Current-snapshot hosted acceptance passes 153/153 on immutable version `3e1034f5-67ab-454a-ace5-b0f6eb5add4f`; all three PR checks pass on source commit `2e394e2`. Public before-cutover snapshots cover 165 paths on each existing host, including favicons/media, directory routes, query-preserving redirects and separate-project routes. The current main backup branch is `backup/pre-cutover-056b256`; the verified full-history bundle is retained on D:.

## Completed production verification

After the authorized normal merge, both production deployments succeeded. The main domain and existing Pages site each passed 165 before/after route comparisons with zero regressions (330 total), checking previously working routes, query redirects, MIME, page titles and original binary integrity. Direct ICO reads on both hosts match the original SHA-256 exactly. All 16 main-domain desktop/mobile UI flows passed with 128 assertions. See `audit/live-domain-post-cutover.json`, `audit/pages-post-cutover-routes.json`, `audit/production-interactions.json` and `audit/cutover-completed.json`. A local checkout briefly interrupted the first Pages comparison because its baseline file was temporarily absent; it was rerun after the checkout completed and passed. This affected neither live site.

These results do not claim every possible authenticated state, third-party uptime or hardware output. The existing separate live desktop OmniScope data-load timeout remains recorded; its Worker was not redeployed or altered by this cutover. The main repository layout/public-path migration itself has no detected route regression.
