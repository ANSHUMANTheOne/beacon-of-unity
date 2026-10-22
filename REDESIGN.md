# Beacon of Unity redesign

Branch: `design/world-connected-by-unity`. Based on `9b5c2c6`.

## Run locally

Use Node.js 20.19+ (or 22.12+), then:

```sh
npm ci
npm run build
npm run dev
```

Open http://127.0.0.1:4174. The server binds to localhost only. Use `npm run watch` in a second terminal while editing homepage source. No deployment is configured or performed by these commands.

## Direction and implementation

The final revision follows the owner's clarification: Beacon is for UAE residents in apartment communities, including neighbours who live close together without knowing each other. The original logo, Beacon of Unity heading, bridge-building message, navy/cyan identity, four pillars and existing destinations remain central.

The homepage uses original procedural Three.js apartment buildings, balconies, windows, entrances, pavements and palms. Scroll changes the camera and reveals connections between buildings; illuminated windows become brighter as the neighbourhood connects. Buildings stay grounded. No stock video, proprietary 3D assets, or copied reference layouts are used. Mobile has its own camera composition. Native scrolling, skip links, direct platform access, pause controls, reduced motion and a CSS fallback keep the experience usable.

`src/world.js` owns rendering, `src/main.js` owns homepage interactions, and `src/style.css` owns presentation. `assets/unity/` contains the built files used by the existing static HTML site. Rendering is lazy-loaded, geometry is merged by material, pixel ratio is capped, and rendering pauses when hidden or outside the scene. The dashboard does not load Three.js.

`assets/platform.css` and `assets/platform.js` enhance both existing dashboards. The existing Firebase data handlers, authentication, forms, maps and role checks remain responsible for application behavior. Sidebar, mobile navigation, request filters, messaging layout, profile/forms and all community tabs share the design system. The original quote intro and tutorial are opt-in. The demo conversation engine now retains messages when a conversation is reopened and uses text nodes for message content.

`assets/secondary.css` and `assets/secondary.js` cover sign-in, administration, blog, founder, contact, privacy, terms and credits. Existing account and identity verification behavior is retained. Admin access is not bypassed.

## Browser evidence and checks

Chrome/Playwright tests cover 320, 360, 375, 390, 430, 768, 1024, 1440 and 1920px widths, plus 844×390 landscape. The responsive matrix captures all ten primary demo dashboard tabs. Workflow tests exercise help responses, sending/reopening demo conversations, request submission, Lost & Found contact, the embedded demo and the mascot's double-click/double-tap interaction. Additional checks cover navigation, map/profile/settings presentation, fallback rendering and reduced motion.

To rerun the main checks, install Python Playwright (`python -m pip install playwright`) and Google Chrome, start the local server, then run:

```sh
python tests/browser_workflows.py
python tests/responsive_matrix.py
```

Reports and screenshots are written to `playwright-results/`, which is ignored by Git. Automated accessibility checks used axe-core on the mobile homepage, demo dashboard, sign-in, blog and admin entry screen; they are not an accessibility certification.

Testing used the existing demo data and unauthenticated pages. Real Firebase sign-in, live database writes, identity submissions, admin operations, real messaging delivery and physical-device keyboard behavior still require an authorized test account/device. Existing external news/map/auth services also depend on their network availability. No production records were changed.

## Reference study

The listed references were opened in rendered Chrome at desktop and mobile sizes, with scroll and pointer/touch exploration. Public bundles were inspected for technical signals, not copied. Public landing pages were used for Linear, Vercel and Apple; their private applications were not accessed.

| Reference | Observed principle applied |
| --- | --- |
| Active Theory | Treat the environment as one continuous experience; keep text and navigation legible over it. |
| Lusion | Use lighting, material consistency and controlled scene composition rather than unrelated effects. |
| Bruno Simon | Make 3D interaction concrete and discoverable. Building selection links to the relevant platform preview; ordinary navigation remains available. |
| Immersive Garden | Author camera views around typography and negative space, with separately composed mobile views. |
| Resn | Give a memorable interaction a clear response. Beacon's original mascot remains draggable and opens its existing assistant. |
| Lando Norris | Carry typography and motion rhythm through the whole page, including content and footer. |
| Linear | Refine application density, hierarchy, navigation states and surface contrast. |
| Vercel | Use concise controls and restrained structure in practical application screens. |
| Apple | Prioritize legibility, coherent spacing and straightforward forms. |

The custom reference experiences can be open-ended; these observations do not claim exhaustive access to every hidden route or state. No award outcome is promised.
