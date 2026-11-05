# Migration review — 5 November 2026 (Asia/Dubai)

Status: implemented on `restructure/preserve-public-paths-20261105`; production cutover is not approved or performed. Do not merge while GitHub Pages or a Cloudflare build still publishes the source root.

## Before and after

Previously the root mixed the main HTML pages, account/admin pages, homepage variants, interactive media, the EYSC presentation, scripts, and independent application folders. All 136 original files are retained; 77 have new source locations. Full inventories and reasons are in `audit/tree-before.txt`, `audit/tree-after.txt` and `audit/file-movements.csv`.

```text
Before                         After
index.html and site pages      website/pages/
login and dashboard pages      website/app/
admin HTML                     website/admin/
index2, oldindex, trial         website/variants/
site JavaScript                website/scripts/
Code interactive resources     website/interactive-assets/code/
logo and favicon               assets/branding/
eysc page, ZIP, placeholders    projects/voltway/
gods-eye/                      projects/gods-eye/
CozyStudio/                    projects/CozyStudio/
carbon.html, focus.html         projects/carbon/, projects/focus/
nothing                        archive/unclassified/
omniscope/                     omniscope/ (excluded; unchanged)
functions/api/                 functions/api/ (unchanged)
voltwayvideo.mp4                voltwayvideo.mp4 (raw URL exception)
```

The final root also contains README, configuration, docs, deployment templates, build scripts and validation CI. No unrelated app is merged into Beacon's source. No empty architectural scaffolding was created. The variant pages are not classified as dead or disposable. Duplicate API handlers and media placeholders remain; no deduplication is performed.

## History and concurrent work

- Original main: `77f3d901930729f5a3af72ec371ffdca7a85a3f9`.
- Original `cloudflare/workers-autoconfig`: `a9851c7ad030fd483f18389b6c3014c19e4f6ad7`.
- Backup branch: `backup/pre-restructure-20261105-0020`, published at original main.
- A verified full-history Git bundle is retained at `D:\Codex\beacon-of-unity-restructure\pre-restructure-20261105.bundle`.
- Both original branches and all original history are preserved. No branches/tags are deleted, no force-push or history rewrite is used, and branches are not automatically merged.
- OmniScope source and deployment configuration have zero tracked diff. Social/socialdemo and OmniScope tracked additions pass through at their existing paths. No social files existed on the remote at the recorded fetch. Do not relocate concurrent work when resolving future conflicts.

The second branch is substantive: it has 31 files, its own alternate homepage, a Cloudflare Worker configuration, and an environment-file ignore policy. Its only branch-unique commit is the Worker autoconfiguration; its complete file hashes and main differences are recorded in `audit/branches.json` and `audit/history.json`.

## Initial validation evidence (before functional repairs)

- 136/136 files: original Git bytes, reorganized source and published paths match SHA-256 and length.
- 136/136 local HTTP resources: original and reconstructed tree return matching content and MIME.
- 26/26 HTML pages: offline browser DOM, local network and console parity with the original tree. External hosts were blocked equally; parity is not proof that baseline defects are fixed.
- Code-page GIF playback image decoding and all six interactive function bindings pass; Focus blur/focus counting passes.
- Five key pages rendered at 390 px width without horizontal overflow.
- 62 Worker/API assertions pass, including redirects with queries, asset-prefix forwarding, methods, invalid input, mocked upstream success/failure, and unchanged deployment contract.
- Five publisher tests pass, covering binary integrity, no accidental extra files, new tracked social passthrough, sensitive path refusal, path traversal/case collisions and refusal to overwrite an existing output directory.
- The existing OmniScope build command was validated before its move was removed; all 47 generated assets matched their original inputs. The project is now excluded from source changes.
- 180 live probes recorded 158 HTTP 200, 20 HTTP 404 and two expected invalid-input HTTP 400 responses. These are **before-cutover observations**, not deployment verification.
- 67 inline scripts checked: two existing syntax failures, in both dashboards. All other checked inline scripts parse.

The first publisher-test run exposed missing baseline metadata in the fixture, which was corrected. A fresh build ran out of D: space; only generated duplicates were removed, and a fresh build and strict validation were rerun. A browser GIF check initially used an insufficient fixed delay; an explicit decode wait resolved the mismatch. No application changes were made to mask those results.

## Initial findings and limits (status updated below)

- Both dashboards have `Unexpected identifier 's'` in existing inline scripts (original lines 5941 and 6002). Source bytes are deliberately preserved. Fix in a separate application change with owner review.
- CozyStudio has an existing `undefined.map` runtime error in the offline browser baseline.
- Admin-page Firebase/email integration cannot run with external CDNs blocked; its Cloudflare-injected email-decoding path is unavailable on a plain local server. Backend authorization rules are not in the repository and cannot be verified here.
- The Vite entry `gods-eye/redacted.html` uses `/src/main.tsx`; it is not a working plain-static alternative to the standalone entry. This existing distinction is preserved.
- Baseline 404s include `/api/archive`, exact-case CozyStudio paths on the main domain, several alternate OmniScope routes, and the as-yet unpublished social routes. See the full route CSV for exact results.
- Two MP4 filenames are 2-byte placeholders; the ZIP contains an empty directory. Retained, not presented as valid playable media or a complete application archive.
- Live HTML differs from Git main; provider transforms/deployed revisions remain unresolved. The optional GOD'S EYE React package build was not run; its existing standalone static entry is the preserved published application. No staging/provider preview, authenticated forms, real Bluetooth hardware, end-to-end Firebase authorization, real NASA/JPL response contract, every arbitrary runtime state, cache policy or production range-playback validation is claimed.
- Static extraction mapped 1,953 reference candidates and 314 dynamic-reference locations across both branches. It cannot discover unknown external consumers or all dynamically generated URLs. Exact original bytes and public-tree preservation minimize that risk, but cannot guarantee every external service/link is functional.

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

After a future approved cutover, roll Cloudflare back to the saved pre-cutover deployment/version, including the separate OmniScope Worker if it was redeployed. Restore the saved Pages source (`main`, `/`, legacy) together with a revert of the restructuring merge commit; use `git revert -m 1 <merge-commit>` through a reviewed PR, never reset/force-push. For a squash merge, revert its single commit instead. Preserve any later application work when reviewing that revert. Keep the recorded domain/HTTPS settings and DNS unchanged. Confirm main website, video fallback and OmniScope/API routes against the route manifest after rollback.

## Follow-up: Cloudflare build and provider preview

The Workers Builds failure was traced to a missing root Wrangler configuration and missing generated artifact. Root `wrangler.jsonc` and `scripts/cloudflare-build.mjs` now prepare and validate `dist/` before version upload. Both the GitHub compatibility workflow (including six publisher tests, 62 Worker/API assertions, and a Wrangler 4.157.0 dry-run) and the Cloudflare version upload passed. An additional provider acceptance run passed 141 checks against the immutable uploaded version; see `audit/provider-preview-validation.json`. One unavailable dotfile remains unavailable as in the baseline. Existing video range requests return the whole unchanged file on both live and preview hosts; partial seeking support was not introduced or claimed.

No production promotion, domain/DNS change, GitHub Pages settings change, OmniScope source change, or social deployment change was performed. The PR must still remain draft until the GitHub Pages publishing transition and final cutover are approved. The former statement that all deployment configuration is inert applies to the initial snapshot; the review branch now includes an active root build/version-upload configuration.

## Follow-up: functional QA and concurrent redesign

The initial byte-preservation evidence above describes the initial migration snapshot. The requested deeper testing reproduced the dashboard syntax errors and CozyStudio timing/preset failures. Four text files now contain explicit, minimal repairs; all original media and the other 132 original files retain original bytes. The manifest retains original hashes and separately records each repaired source hash/reason. `/og-image.png` additionally maps to the unchanged logo to repair an existing sharing-image 404. No original file or public route is removed.

All 8 publisher tests, 62 Worker/API assertions, 264 animation combinations, 7 preset cases, 67 inline syntax checks and 16 desktop/mobile browser flows (120 assertions) pass locally. Separate live OmniScope/social UI checks and scientific API probes pass without editing or redeploying those applications. Current results and limitations supersede the initial open-bug notes; see `QA.md` and `audit/runtime-interactions.json`. Provider checks are repeated on the uploaded repaired version before release.

**New release blocker:** current `main` received a substantial separate Beacon redesign after the original snapshot, and GitHub reports merge conflicts. Its changes include page files, new assets/source files, package/build configuration and Wrangler settings. No automatic merge/rebase was performed. Reconcile both workstreams, preserve the redesign and repeat final tests against the resulting merge. The review branch's frozen baseline evidence must not be presented as proof for the redesigned main branch.
