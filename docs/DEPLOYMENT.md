# Deployment and cutover

## Recorded topology before restructuring



## Review before production



## Local caveats

A Python static server validates bytes and relative paths, not Cloudflare routing, API execution, cache headers or HTTPS. Local browser parity does not prove production authorization or external service availability. New `.nojekyll` is artifact-only and prevents Jekyll processing; no source CNAME is invented. Review any provider-specific effect on previously excluded dotfiles before publishing.

The exact original tree, branch heads, route mappings and HTTP samples are recorded under `docs/audit/` and `config/routes.json`. Those records are evidence, not authorization to change Settings.

References: [GitHub custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [Cloudflare HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/), [Cloudflare function routing](https://developers.cloudflare.com/pages/functions/routing/).

## Concurrent work



## Reproduce checks

Run `python scripts/test-publisher.py`, `node scripts/test-worker.mjs`, `python scripts/build.py` (fresh output), then `python scripts/validate.py --migration`. Browser parity is optional development tooling: with Playwright already installed and a Chromium browser available, run `python scripts/check-browser.py`; set `BEACON_BROWSER_EXECUTABLE` to an installed browser path if needed. It writes only under ignored `.verification/` and blocks external requests. Ongoing application edits use ordinary `validate.py` source/output checking; the immutable original hashes remain migration evidence.

## Confirmed Workers Builds failure and fix

The failed build ran `npx wrangler versions upload` at root, with **Build command: None**. The log reported **Missing entry-point to Worker script or to assets directory**. There was no active root Wrangler configuration and no generated artifact.

The review branch now provides:
- Root `wrangler.jsonc`: existing Worker name `beaconofunity`, assets `./dist`, live compatibility date `2026-10-19`, no new bindings, routes, domains, or compatibility flags.
- `node scripts/cloudflare-build.mjs`: generates the original public layout and validates source/output integrity. If `dist/` already exists it is validated instead of overwritten; stale, incomplete, or extra-file output fails. Preserve or move a prior output before rebuilding.
- A local Wrangler custom build hook and GitHub CI dry-run with Wrangler `4.157.0`. Dry-run does not upload a version or deploy.
- Cloudflare confirmed a successful version upload for commit `cb60f6066fdb7a8716e8f45cacc18cdd5366b8a3`, producing version `2462e365-f8a9-4c69-a69f-8b36c4bf7089`. Repository changes did not edit the dashboard or promote production traffic.

The existing settings already produced a passing upload using the custom hook. **Do not change them just to remove the old failure.** If a future build environment skips the hook, review this optional build-only configuration:
- Root directory: `/` (unchanged).
- Build command: `node scripts/cloudflare-build.mjs`.
- Existing upload command: `npx wrangler versions upload` (unchanged; do not replace with `wrangler deploy`).
- Keep tokens, variables, production branch, domain, DNS, and other Worker settings unchanged.



The active pre-cutover main version recorded by the read-only audit is `3ed17401-3234-4074-a41f-388209a6dc95`, deployment `ff74e721-78a2-42d3-ab14-aba135decd56`. Re-read the current deployment immediately before any future approved promotion or rollback; other agents may have made changes.

This resolves the known missing configuration/artifact path. It does not approve production promotion, fix baseline application defects, or complete the GitHub Pages publishing-source transition.

References: [Wrangler custom builds](https://developers.cloudflare.com/workers/wrangler/custom-builds/), [Workers Builds settings](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), [version uploads](https://developers.cloudflare.com/workers/wrangler/commands/workers/).

## Provider acceptance evidence

The immutable preview `https://2462e365-beaconofunity.anshorg.workers.dev` passed 141 checks: the original file contents and MIME types, applicable main-site redirect chains, four directory/index aliases, and video range-request parity with the current live site. The original `.assetsignore` URL remains 404 as before; its bytes are still retained in the generated artifact. Full results are recorded in `audit/provider-preview-validation.json`.

The preview, the existing live domain, and the original deployed version URL all returned HTTP 200 with the same 23,527,562-byte MP4 and SHA-256 when asked for a range. Partial-range support is therefore not claimed; the first 206-only test was an incorrect assumption about the baseline and was replaced by an explicit live-response comparison. No media content or server behavior was changed to make the test pass.



## Final runtime review

`QA.md` records the functional follow-up and its four declared text repairs. Repeat provider checks against the repaired version rather than the earlier immutable snapshot. Current main has a concurrent redesign and merge conflicts, so branch-only preview results are not approval to merge or deploy the combined site. Coordinate its build/Wrangler changes before the Pages transition or any production promotion.

The fresh `a64d646` upload passed, but its preview URL currently returns404 to acceptance probes (generic local access can also return403/error1010). The newer main configuration disables workers.dev/preview URLs. Confirm an approved accessible staging/version URL before release; no provider settings were changed to resolve this. Current failed acceptance evidence is in `audit/provider-runtime-validation.json`.

## Reconciled design build

The approved integration retains current main?s Worker name/account, custom-domain declaration, compatibility date, observability and disabled workers.dev/version URLs. Only asset input (`./dist`) and the validated artifact build hook replace source-root publication. New shared assets are explicit manifest additions; Vite source/build metadata is not deployed. `node node_modules/vite/bin/vite.js build --outDir .verification/design-build` reproduces the five retained bundles. The local preview server serves generated `dist/`. The fresh integrated Wrangler dry-run passes. Version URL access still requires inspection/approved enablement; a passing upload alone is not acceptance.

## Approved version URL enablement ? 6 November 2026

After a read-only dashboard inspection confirmed both workers.dev toggles off, the user explicitly approved enabling only Preview URLs. The dashboard now shows Preview ON, Production workers.dev OFF, and the existing beaconofunity.com custom domain unchanged. The review branch records `preview_urls: true` so future uploads retain that approved intent. No version was manually promoted and no DNS/domain/build setting was changed. Earlier disabled-preview findings above remain historical; fresh provider acceptance follows this setting change. See `audit/preview-setting-approval.json`.

## Prepared Pages cutover workflow

`.github/workflows/pages.yml` now prepares the same validated `dist/` artifact for GitHub Pages after the separately approved source transition. It runs only for main pushes or an explicitly dispatched main run; both build and deploy refuse other refs. It cannot publish from this review branch. `configure-pages` explicitly has `enablement: false`, so it does not enable Pages automatically. Build permissions are read-only, while the deployment job alone receives Pages-write and OIDC permissions. The previous template remains historical reference. Do not merge until the Pages source setting is confirmed/approved; no Pages setting or deployment has been changed here.

The approved preview change is now verified persistent after reload, and the immutable 09b9b63f upload passes 152/152 provider checks. The branch alias also serves the site and its GitHub verification rerun passes. Keep the approved `preview_urls: true` setting when reconciling future main deployments: an older explicit false configuration can switch it off again. This is configuration drift to avoid, not a reason to enable production workers.dev or alter the custom domain.

Current pre-cutover rollback references are `audit/pages-settings-pre-cutover.json` and `audit/cloudflare-pre-cutover.json`: Pages legacy main/root with HTTPS and no custom domain, and active Cloudflare version prefix 27fbb97f at 100%. Restore these current values if rollback is needed; the original October snapshot above is historical. Revert the merge through a normal commit while preserving later work, never reset/force-push.

## Current production state ? 6 November 2026



For rollback, first restore the previous main-domain Worker version (unique prefix 27fbb97f) if necessary. Review/revert the restructuring merge with `git revert -m 1 1a5543da99e6f66a55777feced5795e52801ea5c`, preserving any later work. Keep the current Pages deployment until the original source tree is restored; only then restore saved legacy main/root publishing if rolling back that migration too. Never force-push or delete history. Backups: remote branch `backup/pre-cutover-056b256` and the verified full-history bundle on D:.
