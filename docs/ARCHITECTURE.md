# Architecture

Beacon of Unity remains the primary product. Independent apps stay under `projects/`; they share no new application runtime or dependency manager.

| Source | Purpose | Published location |
| --- | --- | --- |
| `website/pages/` | Public Beacon pages and demonstration | Original root HTML filenames |
| `website/app/` | Login and both dashboard versions | Original root HTML filenames |
| `website/admin/` | Existing administration UI | Original root HTML filename |
| `website/variants/` | Distinct homepage alternatives | Original root HTML filenames |
| `website/scripts/` | Main website JavaScript | Original root script filenames |
| `website/interactive-assets/code/` | Resources used by Code-page interactions | Original root asset filenames |
| `omniscope/` | SPHEREx app, data, API and Worker | `/omniscope/` subtree |
| `projects/gods-eye/` | Static orrery and separate React source | `/gods-eye/` subtree |
| `projects/CozyStudio/` | Web Bluetooth light controller | `/CozyStudio/` subtree |
| `projects/voltway/` | EYSC page, ZIP and video placeholders | Original root filenames |
| `projects/carbon/`, `projects/focus/` | Independent utilities | Original root HTML filenames |
| `assets/branding/` | Original branding bytes | Original root filenames |
| `archive/unclassified/` | Unidentified file preserved without deletion | Original path |
| `functions/api/` | Whole-repository Cloudflare Pages API | `/api/archive`, `/api/ephemeris` on that provider |

The builder copies explicit manifest entries plus tracked files in the declared concurrent-work passthrough patterns. Newly added documentation, audit reports, environment files and repository metadata are not included automatically. The original public tree is reconstructed, including historically published project source and original project documentation; it is not a minimized bundle. No original runtime code or visual style is changed.

The root video is a deliberate compatibility exception, not a second media copy. OmniScope stays in its original root directory; its files, deployment commands and runtime configuration are excluded from restructuring. Do not deploy the source root as static assets after migration.

A source move changes the corresponding GitHub blob/raw path on the restructuring branch. Only the identified raw main-branch video consumer is explicitly preserved at its source path. Unidentified external raw-GitHub consumers cannot be ruled out. The public website mapping preserves original file paths, but provider redirects and runtime services require separate preview validation.

`social` and `socialdemo` are reserved for concurrent work and are not relocated. Only tracked additions in those reserved paths or `omniscope/` pass through automatically. New unrelated projects must declare their routes.
