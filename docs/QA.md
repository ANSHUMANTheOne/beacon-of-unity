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



## Limits and release blockers



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



The earlier inaccessible version-URL acceptance report remains a failure. Version previews remain disabled in the reconciled Wrangler configuration, pending account inspection and any specifically approved staging change. Production and main are not changed. Original provider/development-entry warnings, real authentication/backend/hardware limits and the GitHub Pages publishing transition still apply.



Hosted verification of source commit `0df45ce`: GitHub artifact-validation run42155926797 and Cloudflare upload buildfc322341 both pass. Uploaded version `7fd58ac6-f06a-44a6-80dd-a1e15d21cf42` remains inaccessible with version URLs disabled: fresh full acceptance is1/152 passed and151 failed (only the expected unavailable dotfile matches). See `audit/integrated-provider-validation.json`. Preview-readiness failures now save an actionable JSON report rather than losing evidence in a traceback. The newer homepage?s desktop/mobile screenshots were visually inspected as well as its DOM/canvas controls.

The current Pages-source recheck was blocked by automatic approval review because it would use a stored Git credential without specific authorization. The credential was not retrieved; explicit approval is pending. No Settings change occurred. The previous confirmed legacy main/root configuration remains the recorded rollback reference, not a newly reverified setting.

## Verified enabled preview ? 6 November 2026

The user explicitly approved Preview URL enablement. The final dashboard change was verified after reload: Preview ON, Production workers.dev OFF, beaconofunity.com unchanged. The initial reported enablement did not persist; that observation is retained in the setting audit rather than treated as success. The subsequent immutable version at `https://09b9b63f-beaconofunity.anshorg.workers.dev` passed 152/152 content/MIME/redirect/range checks. The known unavailable `.assetsignore` remains 404; every other expected static resource matched its current source. See `audit/provider-preview-enabled-validation.json` and the updated 151-row `audit/integrated-routes.csv`.

All 16 main-site desktop/mobile UI flows passed on that uploaded version (128 assertions), including homepage demos, media decoding, EYSC video metadata, account/admin gate, Carbon, Code, CozyStudio and Focus. See `audit/hosted-main-interactions.json`. No real account transactions were submitted. The hosted preview-verification workflow rerun passed too, alongside artifact validation and Cloudflare upload. Earlier failed preview reports are historical and are superseded for this version.





## Final refinement snapshot before cutover





The publisher refuses silently omitted future tracked files: each needs a route, reserved concurrent passthrough or explicit source-only classification. The 153-check provider acceptance for this new snapshot follows its upload. Earlier 152-check evidence applies only to the previous version.

Current-snapshot hosted acceptance passes 153/153 on immutable version `3e1034f5-67ab-454a-ace5-b0f6eb5add4f`; all three PR checks pass on source commit `2e394e2`. Public before-cutover snapshots cover 165 paths on each existing host, including favicons/media, directory routes, query-preserving redirects and separate-project routes. The current main backup branch is `backup/pre-cutover-056b256`; the verified full-history bundle is retained on D:.

## Completed production verification

After the authorized normal merge, both production deployments succeeded. The main domain and existing Pages site each passed 165 before/after route comparisons with zero regressions (330 total), checking previously working routes, query redirects, MIME, page titles and original binary integrity. Direct ICO reads on both hosts match the original SHA-256 exactly. All 16 main-domain desktop/mobile UI flows passed with 128 assertions. See `audit/live-domain-post-cutover.json`, `audit/pages-post-cutover-routes.json`, `audit/production-interactions.json` and `audit/cutover-completed.json`. A local checkout briefly interrupted the first Pages comparison because its baseline file was temporarily absent; it was rerun after the checkout completed and passed. This affected neither live site.

