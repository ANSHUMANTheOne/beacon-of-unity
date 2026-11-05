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
