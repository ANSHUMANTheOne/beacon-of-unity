# Route contract

`config/routes.json` records every one of the 136 original tracked files, its Git blob and SHA-256, original public path, source location and classification. `docs/audit/route-compatibility.csv` records 180 live URL probes, content types and observed redirect chains. A 200 alone is not treated as content proof.

| Public path | Source |
| --- | --- |
| `/` and `/index.html` | `website/pages/index.html` |
| `/blog.html`, `/founder.html`, `/contact.html` | Matching `website/pages/` files |
| `/omniscope/` | `omniscope/index.html` (unchanged source location) |
| `/omniscope/public/` resources | Matching `omniscope/public/` files |
| `/omniscope/api/archive`, `/omniscope/api/ephemeris` | Unchanged dedicated Worker dispatch |
| `/eysc.html`, `/eysc.zip` | `projects/voltway/` |
| `/voltwayvideo.mp4` | Root compatibility file; also retains raw GitHub path |
| `/gods-eye/` | `projects/gods-eye/index.html` |
| `/CozyStudio/` | `projects/CozyStudio/index.html` |
| `/carbon.html`, `/focus.html` | Matching independent project files |
| `/social`, `/socialdemo` and matching tracked files | Reserved passthrough; source remains where other agents create it |

All other original HTML, script, media and data paths are listed individually in the manifest and CSV. Account/admin paths are preserved without README navigation links. Directory indexes, case and original names remain intact. No new app redirect or asset redirect is introduced.

Cloudflare's observed HTML normalization remains provider behavior. Keeping the artifact paths supports it; the complete status/Location/query-string contract must still be checked on the provider preview. GitHub Pages uses a repository subpath, while the custom domain uses the origin root. Their pre-existing base-path assumptions are not rewritten. The primary domain is not moved between providers.

New tracked files under declared OmniScope/social passthrough patterns are copied to the identical public path. Untracked work is not deployed. Sensitive/generated passthrough names fail the build for review. Other new resources need explicit manifest entries. For normal later edits run `validate.py` to compare source with output; `--migration` additionally verifies the immutable original snapshot and is intended for this migration review.

## Account and demo contract after integration

The current main application files are retained byte-for-byte at their reorganized source paths. `/login.html` redirects an approved account to `/dashboard.html`. Anonymous account-dashboard access and account logout return to `/login.html`; pending/banned states retain their existing login/verification views. `/dashboard_updated.html?demo=1` remains the homepage?s standalone demo, rather than replacing the account dashboard. Its existing demo logout notices and navigation behavior are retained. Twenty-two isolated fixture-based checks verify these paths without real sign-in or database access; they do not prove backend authorization.

The original 136 paths plus the logo alias and ten new current-main design assets produce 147 mapped resources. Original snapshot hashes and declared concurrent-main source updates are retained separately; the builder does not publish source folders directly.

The publisher rejects newly tracked files unless they have a route, match a reserved concurrent-project passthrough, or are explicitly classified as source-only. This prevents a new project page or asset from silently disappearing from deployment during future work. Use `source_only_files`/`source_only_prefixes` only for build/source/docs material, not to hide existing public resources. The new refinement note is kept under `docs/` and still published at its original root filename.
