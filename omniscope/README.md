# OmniScope

OmniScope compares real NASA/IPAC SPHEREx FITS observations for the NASA Space Apps Planet X challenge. The solar-system view uses NASA JPL reference positions. Quick-look change markers are unconfirmed candidates.

## Beacon of Unity path

The repository now has `omniscope/index.html`, so a host that publishes this repository's root serves the app at `/omniscope/`. The app's images, scripts, styles, and bundled FITS files remain in `omniscope/public/`; the entry page uses that folder as its asset base. The root `functions/api/` directory supplies the live NASA/IPAC and JPL API routes when the root is deployed with Cloudflare Pages Git integration.

A GitHub push updates the source repository. If `beaconofunity.com` is deployed by a separate upload or project, its host must also publish this commit before the path appears there. Static-only hosting can display bundled observations but cannot serve the live `/api/` routes.

## Standalone Cloudflare Pages deployment

The `omniscope/` folder can also be deployed as its own Pages project. Use **Root directory** `omniscope`, **Build output directory** `public`, no framework preset, and an empty build command. Its local `functions/api/` directory provides the same live routes.

SPHEREx, AllWISE, 2MASS, and JPL credits remain in the app because they identify the scientific data sources.
