# OmniScope

OmniScope compares real NASA/IPAC SPHEREx FITS observations for the NASA Space Apps Planet X challenge. The solar-system view uses NASA JPL reference positions. Quick-look change markers are unconfirmed candidates.

## Beacon of Unity path

`beaconofunity.com` runs an existing Cloudflare Worker. OmniScope is served by its own Worker on the `beaconofunity.com/omniscope*` route, leaving other site paths with the existing Worker. Its entry page is `omniscope/index.html`, the images and bundled FITS files are in `omniscope/public/`, and live NASA/IPAC and JPL requests use `/omniscope/api/`.

To redeploy after a GitHub update, sign in with Wrangler, then run from this repository's root:

```sh
node omniscope/worker/prepare-assets.mjs
wrangler deploy --config omniscope/worker/wrangler.jsonc
```

GitHub pushes do not automatically redeploy this Worker. The root `functions/api/` directory also supports a separate Cloudflare Pages deployment of the whole repository.
## Standalone Cloudflare Pages deployment

The `omniscope/` folder can also be deployed as its own Pages project. Use **Root directory** `omniscope`, **Build output directory** `public`, no framework preset, and an empty build command. Its local `functions/api/` directory provides the same live routes.

SPHEREx, AllWISE, 2MASS, and JPL credits remain in the app because they identify the scientific data sources.
