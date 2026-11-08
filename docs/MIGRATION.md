# Migration review — 5 November 2026 (Asia/Dubai)

Status: published to `main` under explicit owner authorization on 6 November 2026. Cloudflare and GitHub Pages deployed successfully; 330 public-route comparisons found zero regressions. Earlier sections retain the migration history; see `audit/cutover-completed.json` for current status.

## Before and after

Previously the root mixed the main HTML pages, account/admin pages, homepage variants, interactive media, the EYSC presentation, scripts, and independent application folders. All 136 original files are retained; 77 have new source locations. Full inventories and reasons are in `audit/tree-before.txt`, `audit/tree-after.txt` and `audit/file-movements.csv`.



The final root also contains README, configuration, docs, deployment templates, build scripts and validation CI. No unrelated app is merged into Beacon's source. No empty architectural scaffolding was created. The variant pages are not classified as dead or disposable. Duplicate API handlers and media placeholders remain; no deduplication is performed.

## History and concurrent work



The second branch is substantive: it has 31 files, its own alternate homepage, a Cloudflare Worker configuration, and an environment-file ignore policy. Its only branch-unique commit is the Worker autoconfiguration; its complete file hashes and main differences are recorded in `audit/branches.json` and `audit/history.json`.

## Initial validation evidence (before functional repairs)



The first publisher-test run exposed missing baseline metadata in the fixture, which was corrected. A fresh build ran out of D: space; only generated duplicates were removed, and a fresh build and strict validation were rerun. A browser GIF check initially used an insufficient fixed delay; an explicit decode wait resolved the mismatch. No application changes were made to mask those results.

## Initial findings and limits (status updated below)



## Approvals before merge

Confirm Cloudflare's connected branch and deployed version, inspect the discrepancy with main, validate an isolated provider preview, approve publishing the generated artifact, approve the GitHub Pages Actions-source transition, and coordinate concurrent work. GitHub Pages is confirmed `main` + `/`, legacy publishing, no custom domain and HTTPS enforced. The proposed workflow/template does not change those settings. No DNS/ownership/visibility changes are needed or made.

Media placement and omission from navigation provide no confidentiality. Existing public URLs and Git history remain accessible. The admin UI's client UID check must be backed by verified server-side authorization. See `SECURITY.md`.

## Rollback

Before cutover, production is unchanged and needs no rollback. To inspect the old repository without altering history:

```sh
git fetch origin
git switch -c restore/pre-restructure origin/backup/pre-restructure-20261105-0020
```

If GitHub becomes unavailable, clone the verified local bundle into a new directory and switch to `main`. Never overwrite the only copy or force-push.



## Follow-up: Cloudflare build and provider preview

The Workers Builds failure was traced to a missing root Wrangler configuration and missing generated artifact. Root `wrangler.jsonc` and `scripts/cloudflare-build.mjs` now prepare and validate `dist/` before version upload. Both the GitHub compatibility workflow (including six publisher tests, 62 Worker/API assertions, and a Wrangler 4.157.0 dry-run) and the Cloudflare version upload passed. An additional provider acceptance run passed 141 checks against the immutable uploaded version; see `audit/provider-preview-validation.json`. One unavailable dotfile remains unavailable as in the baseline. Existing video range requests return the whole unchanged file on both live and preview hosts; partial seeking support was not introduced or claimed.



## Follow-up: functional QA and concurrent redesign

The initial byte-preservation evidence above describes the initial migration snapshot. The requested deeper testing reproduced the dashboard syntax errors and CozyStudio timing/preset failures. Four text files now contain explicit, minimal repairs; all original media and the other 132 original files retain original bytes. The manifest retains original hashes and separately records each repaired source hash/reason. `/og-image.png` additionally maps to the unchanged logo to repair an existing sharing-image 404. No original file or public route is removed.



**New release blocker:** current `main` received a substantial separate Beacon redesign after the original snapshot, and GitHub reports merge conflicts. Its changes include page files, new assets/source files, package/build configuration and Wrangler settings. No automatic merge/rebase was performed. Reconcile both workstreams, preserve the redesign and repeat final tests against the resulting merge. The review branch's frozen baseline evidence must not be presented as proof for the redesigned main branch.

Latest follow-up: the `a64d646` Cloudflare upload succeeded, but its preview is inaccessible and fresh provider acceptance failed (1/142, only the known unavailable dotfile comparison passed). The earlier 141/141 report remains historical evidence for its earlier version, not current release approval. See `QA.md` and `audit/final-qa-status.json`.

## Approved integration ? 6 November 2026



## Successful provider acceptance after approved preview enablement

Preview URLs are now verified ON after reload, while Production workers.dev remains OFF and the custom domain is unchanged. The immutable 09b9b63f version passes 152/152 provider checks and 16 uploaded main-site UI flows. All three PR checks passed on ccdf869 after rerunning preview verification. Earlier unavailable-preview notes above are historical; see the latest QA section and `audit/provider-preview-enabled-validation.json`. A main-only Pages artifact workflow is now prepared in the PR, but Pages Settings, main and production have not been changed. The publishing-source cutover still requires approval before merge.

Latest authorization: the user explicitly authorized completing main organization/cutover while preserving links, redirects and icons. The pre-cutover source incorporates main `056b25677afd5a5621fb36a6fcc107a53f553889`. The current Pages backup confirms legacy main/root, HTTPS enforced, no Pages custom domain; the Cloudflare backup records active version prefix 27fbb97f at 100%. The Pages publishing-source transition and main merge follow only after the newer preview passes.

## Completed cutover

PR#2 was merged normally at `1a5543d` after the final required checks passed. Pages changed only from legacy publishing to the prepared Actions workflow; its URL, CNAME and HTTPS settings are unchanged. The custom domain deployed successfully using generated dist. Both 165-route before/after comparisons passed, including query redirects, MIME and original binary integrity. All 16 live main-site UI flows passed; favicon bytes match the original on both hosts. No DNS/domain/visibility changes, branch deletions or history rewrites occurred. The rollback branch/bundle and active pre-cutover Worker version are retained. Known independent-app/hardware/authentication limits remain documented in QA; no private application data was migrated or written.
