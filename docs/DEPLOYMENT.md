# Deployment and cutover

## Recorded topology

- `main` originally had no tracked `.github` workflows, `CNAME`, `.nojekyll`, root Wrangler configuration or submodules.
- GitHub reports an active generated `pages-build-deployment` workflow; recent Pages deployments use `main`. An authenticated read confirmed legacy branch publishing from `main`, folder `/`, HTTPS enforced, and no GitHub Pages custom domain. The Pages URL is `https://anshumantheone.github.io/beacon-of-unity/`. Settings have not been changed.
- The main domain responds through Cloudflare and normalizes many `.html` URLs to extensionless paths. Current live HTML is not byte-identical to main-branch HTML; provider transformations and/or deployed-version differences remain unresolved.
- OmniScope's tracked configuration identifies a dedicated Worker named `omniscope-beacon` on `beaconofunity.com/omniscope*`, with an ASSETS binding and `run_worker_first: true`. The production app and API validation errors respond on that route. This Worker is separate from GitHub Pages.
- The alternate branch is `cloudflare/workers-autoconfig`, with a root static-assets Worker named `beaconofunity`, assets directory `.`, observability and `nodejs_compat`. It also has its own different homepage. It is preserved and not merged. Its current production connection requires console confirmation.
- Root `functions/api/` is for whole-repository Cloudflare Pages; project-local copies support standalone OmniScope Pages and its Worker imports. GitHub Pages cannot run these functions. The live main-domain `/api/archive` returned 404 at baseline.

## Review before production

1. Confirm GitHub Pages settings and all Cloudflare production/preview branches, build roots, asset directories, existing headers, HTML handling, domains, routes and bindings. Save settings before changing them. Do not merge while any host publishes the reorganized source root directly.
2. Build with `python scripts/build.py` into a new output directory and run `python scripts/validate.py`. Use `--migration` for the initial byte-preservation gate. Upload `dist/` to an isolated provider preview. Confirm original redirect status codes, targets, query strings, MIME, range playback, fonts, CDN/CORS behavior and authenticated flows on the real provider.
3. Keep Cloudflare as the main-domain host. For its main static Worker, point assets at the generated output using a reviewed configuration based on `deployment/cloudflare-main.example.jsonc`; first confirm the actual connected branch and its homepage. Do not automatically deploy the old branch over main or move the domain to GitHub Pages.
4. If GitHub Pages needs the organized main branch, approve a custom Actions publishing source and use `deployment/pages.yml.example` as a reviewed template. Keep the current domain/HTTPS settings exactly as recorded. The template is inert outside `.github/workflows/`; this branch has only build/validation CI.
5. OmniScope can still use the existing commands: `node omniscope/worker/prepare-assets.mjs`, then (only with production approval) `wrangler deploy --config omniscope/worker/wrangler.jsonc`. No OmniScope source, build scripts, or configuration are modified. The Worker name, route, HTTP dispatch and bindings are preserved.
6. A standalone OmniScope Pages project keeps source root `omniscope`, output `public`, no build command, and its local `functions/` directory. A whole-repository Pages project uses root `functions/` with generated static output. Confirm both before cutover.
7. After approval and successful previews, coordinate the publishing-source change and merge, then compare the saved live baseline and all route aliases again. Keep previous provider versions available for immediate rollback. No DNS changes are required by this proposal.

## Local caveats

A Python static server validates bytes and relative paths, not Cloudflare routing, API execution, cache headers or HTTPS. Local browser parity does not prove production authorization or external service availability. New `.nojekyll` is artifact-only and prevents Jekyll processing; no source CNAME is invented. Review any provider-specific effect on previously excluded dotfiles before publishing.

The exact original tree, branch heads, route mappings and HTTP samples are recorded under `docs/audit/` and `config/routes.json`. Those records are evidence, not authorization to change Settings.

References: [GitHub custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [Cloudflare HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/), [Cloudflare function routing](https://developers.cloudflare.com/pages/functions/routing/).

## Concurrent work

OmniScope is explicitly excluded from source moves. Keep the original `omniscope/` configuration and commands. Reserved `social`, `socialdemo`, their directories and matching root filename extensions remain in place. New tracked files matching `config/routes.json` passthrough patterns are included at unchanged paths; sensitive/generated paths are rejected for review. The remote had no tracked social files at the last fetch, so their unpublished runtime cannot yet be validated. Coordinate with those agents before merging.

## Reproduce checks

Run `python scripts/test-publisher.py`, `node scripts/test-worker.mjs`, `python scripts/build.py` (fresh output), then `python scripts/validate.py --migration`. Browser parity is optional development tooling: with Playwright already installed and a Chromium browser available, run `python scripts/check-browser.py`; set `BEACON_BROWSER_EXECUTABLE` to an installed browser path if needed. It writes only under ignored `.verification/` and blocks external requests. Ongoing application edits use ordinary `validate.py` source/output checking; the immutable original hashes remain migration evidence.
