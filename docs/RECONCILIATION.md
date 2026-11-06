# Approved concurrent-work integration

The user approved reconciliation on the review branch on 6 November 2026 and selected public/demo testing without live writes. Main, production and separate OmniScope/social deployments are unchanged by this work.

Four conflicts were resolved: `.gitignore` combines both policies; both dashboards retain the newer main files (which already fix the demo string syntax); Wrangler keeps main?s account/domain identity, compatibility date, disabled workers.dev/version URLs and observability, while publishing generated `dist/` through the validation hook. No runtime routes, bindings, credentials or DNS values were invented.

The newer Beacon design source, package/lockfile, Vite configuration, tests and all ten new public assets are retained. A fresh isolated build reproduces all five compiled bundles byte-for-byte. Every main file is accounted for in `audit/integrated-main-coverage.json`; the deliberate differences are the two CozyStudio repairs, combined ignores, artifact-serving local preview server and publishing configuration.

The unchanged account flow remains `/login.html` ? `/dashboard.html`; anonymous account access and logout return to `/login.html`. The homepage embeds the existing `/dashboard_updated.html?demo=1`. Twenty-two isolated login/logout/verification-state checks pass without real Firebase use. Sixteen desktop/mobile interaction flows (128 assertions), the 52-visit page sweep, 55 inline script checks, 9 publisher tests, 62 Worker assertions and CozyStudio tests pass. No source was altered to accommodate obsolete test selectors.

The fresh Wrangler dry-run passes after installing the exact temporary QA tool with lifecycle scripts disabled and setting an explicit D: Node/Python PATH. Earlier Windows shim/cache failures are retained as historical findings, not current failures. Logs and generated QA files are directed to D:.

Provider acceptance remains a release requirement. Disabled version URLs explain why an upload can succeed without a working preview; no preview setting was changed. Cloudflare browser sign-in has been requested for inspection. The GitHub Pages generated-artifact transition still needs approval before merging the organized source into main. Keep this PR draft until an accessible provider preview passes and cutover is approved. Never force-push or overwrite concurrent work.
