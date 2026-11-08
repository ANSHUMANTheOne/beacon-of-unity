# Architecture

Beacon of Unity remains the primary product. Independent apps stay under `projects/`; they share no new application runtime or dependency manager.



The builder copies explicit manifest entries plus tracked files in the declared concurrent-work passthrough patterns. Newly added documentation, audit reports, environment files and repository metadata are not included automatically. The original public tree is reconstructed, including historically published project source and original project documentation; it is not a minimized bundle. The publisher does not transform source content. Four narrowly scoped HTML/JavaScript repairs discovered during functional QA are documented in `QA.md`; visual styles are unchanged. A sharing-image alias publishes the unchanged existing logo.



A source move changes the corresponding GitHub blob/raw path on the restructuring branch. Only the identified raw main-branch video consumer is explicitly preserved at its source path. Unidentified external raw-GitHub consumers cannot be ruled out. The public website mapping preserves original file paths, but provider redirects and runtime services require separate preview validation.



The authorized integration retains the newer main design source in `src/`, shared page styling in `assets/`, and its five compiled bundles in `assets/unity/`. All ten new deployment assets have explicit manifest entries and retain current-main bytes. Source/build/test files excluded by main?s `.assetsignore` are not added to the public artifact. The local preview server now serves `dist/`, so moving HTML source does not change the URLs used during checks. The existing package, lockfile and Vite configuration are retained; the build is checked in isolation before publishing.

Runtime payloads use neutral source identifiers and extensions to reduce casual discovery in the current tree. The publisher restores original filenames and extensions; browser MIME types, links and behavior are unchanged. This is organization and obscurity, not access control: the manifest, public URLs and history remain discoverable.
