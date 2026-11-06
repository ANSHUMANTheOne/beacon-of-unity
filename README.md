# Beacon of Unity

Beacon of Unity is a community platform connecting UAE residents through help requests, volunteering, lost and found, and local news.

**[Visit Beacon of Unity](https://beaconofunity.com/)**

## Repository

- `website/` — the main website, account application, scripts, and preserved page variants.
- `omniscope/` — the existing SPHEREx application, kept in place during concurrent work.
- `projects/` — independent side projects: VoltWay, GOD'S EYE, CozyStudio, Carbon Ledger, and Focus Switch Detector.
- `src/` ? source for the current Beacon homepage experience; published bundles remain under `assets/unity/`.
- `assets/` ? shared site styles/scripts, compiled homepage bundles and branding.
- `assets/branding/` — the site's logo and favicon.
- `functions/api/` — Cloudflare Pages API handlers; their discovery location is preserved.
- `config/routes.json` — explicit source-to-public-path mappings.
- `scripts/` — dependency-free publishing and compatibility checks.
- `docs/` — architecture, development, deployment, and maintenance instructions.

`voltwayvideo.mp4` remains at the root because the existing EYSC player consumes its raw GitHub URL. `omniscope/` and the reserved social-project paths remain in place while other agents work on them.

## Deployment and maintenance

Source folders are separate from public URLs. Publishing reconstructs the original path layout without rewriting application code or media. Keep paths and capitalization in `config/routes.json` stable. See [architecture](docs/ARCHITECTURE.md), [deployment](docs/DEPLOYMENT.md), [projects](docs/PROJECTS.md), and [migration](docs/MIGRATION.md).

This restructuring is prepared for review. **Do not merge until the publishing-source transition and provider previews are approved and validated.** The validation workflow uploads a review artifact and does not deploy it.

No repository-wide license was found. Existing third-party license notices are retained; no new license is implied. Changes should be proposed through pull requests with compatibility checks.
