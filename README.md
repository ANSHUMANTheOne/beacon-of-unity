# Beacon of Unity

Beacon of Unity is a community platform connecting UAE residents through help requests, volunteering, lost and found, and local news.

**[Visit Beacon of Unity](https://beaconofunity.com/)**

## Repository

- `website/` — the main website, account application, scripts, and preserved page variants.
- `projects/` — independent side projects: VoltWay, GOD'S EYE, CozyStudio, Carbon Ledger, and Focus Switch Detector.
- `src/` ? source for the current Beacon homepage experience; published bundles remain under `assets/unity/`.
- `assets/` ? shared site styles/scripts, compiled homepage bundles and branding.
- `assets/branding/` — the site's logo and favicon.
- `functions/api/` — Cloudflare Pages API handlers; their discovery location is preserved.
- `config/routes.json` — explicit source-to-public-path mappings.
- `scripts/` — dependency-free publishing and compatibility checks.
- `docs/` — architecture, development, deployment, and maintenance instructions.

`voltwayvideo.mp4` remains at the root because the existing EYSC player consumes its raw GitHub URL. 

## Deployment and maintenance

Source folders are separate from public URLs. Publishing reconstructs the original path layout without rewriting application code or media.Paths and capitalization in `config/routes.json` stable. See [architecture](docs/ARCHITECTURE.md), [deployment](docs/DEPLOYMENT.md), [projects](docs/PROJECTS.md), and [migration](docs/MIGRATION.md).

Compatibility checks validate the public artifact before publication. Cloudflare publishes the custom domain; the main-only Pages workflow publishes the repository site. Keep source-to-route mappings current whenever adding pages or assets, and use the recorded rollback procedure for deployment failures.

Current licenses aswell as existing third party license notices are retained, no new license is implied. Changes should be proposed through pull requests with compatibility checks.
Codex listed as collaborator as it assisted only with organizing all the files and contents present within this repo to appeal to the public and be easier to access, and thus consists of 11 commmits. Thus, rest and all of 383 and more commits done by Anshuman Tripathy's independent work on the project.
