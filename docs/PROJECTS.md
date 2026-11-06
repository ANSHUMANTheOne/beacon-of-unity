# Project guide

Beacon of Unity is the main site; these are independent side projects.

- **OmniScope** compares NASA/IPAC SPHEREx FITS observations and includes a solar-system view, observation guide, and bundled scientific data. Preserve its dedicated Cloudflare Worker and `/omniscope*` route. Do not substitute the standalone Pages entry for the main-domain entry: their base paths differ.
- **VoltWay / EYSC** is the existing video presentation and download page. Preserve both its raw GitHub video source and GitHub Pages fallback. The ZIP currently contains only an empty directory.
- **GOD'S EYE** includes a standalone Three.js HTML experience and an independent React/Vite/TypeScript source tree. The static entry is retained as-is; the React build is not used to replace it. Its Vite config does not specify a subpath base.
- **CozyStudio** is a static Web Bluetooth controller with local presets and animations. Real Bluetooth validation requires compatible hardware and HTTPS or localhost.
- **Carbon Ledger** is the existing eco-themed footprint/check-in application.
- **Focus Switch Detector** counts window focus and visibility changes.

`demo.html` remains a Beacon website demonstration, rather than an unrelated app. `index2.html`, `trial.html`, `oldindex.html` and `dashboard_updated.html` are unique alternatives. Their names and commit ages do not establish that they are inactive; all are retained and published at original paths.

Original project READMEs are retained byte-for-byte as historical documentation and public resources. Their old root-relative development commands may need the updated paths documented here. Add future projects under `projects/<stable-name>/`, keep their own configuration and assets, and declare each public path in the manifest.
