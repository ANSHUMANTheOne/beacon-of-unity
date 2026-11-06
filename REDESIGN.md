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


## October 23 revision: reference-led motion and content parity

The owner rejected the first pass as repetitive and too static. Fresh Chrome captures covered Lusion (primary reference), Active Theory, Lando Norris, the live Beacon introduction and the previous local build, at desktop and mobile sizes. Lusion's large material-driven scene, Active Theory's depth, and Lando's changing scale informed this revision. This is an original Beacon scene, not a replica of any reference.

- Added `src/cinematic.css` and switched homepage display typography to Syne, keeping DM Sans for body text and leaving dashboard typography independent.
- Replaced the repeated distant views with a wide neighbourhood, individual-building close-ups, an overhead composition and a final connected view. Added pointer parallax, damped horizontal drag, arrow-key controls and Escape-to-reset. Touch vertical scrolling remains native.
- Added optional desktop bloom above a luminance threshold; phones use the simpler render path. Direct scene interaction and its camera changes remain available without postprocessing.
- Added masked heading reveals, varied text placement and explicitly labelled example request/lost-item/volunteering moments. Content remains readable without low-opacity reveal states; reduced motion disables decorative animation.
- Restored dedicated How It Works, Why Beacon comparison, schools/businesses/organisations, Badges & Rewards and Thank You Wall & Chats content. Retained the existing `#features`, `#how`, `#live`, `#trust`, `#compare` and `#beyond` anchors.
- Kept all application handlers and the previously refined dashboard intact. Production authenticated operations remain untested without an authorized test account.

Chrome tests covered all requested widths and landscape, scene drag/keyboard input, feature tabs, demo interactions, mobile navigation, reduced motion and WebGL fallback. Build and diff checks passed. Automated accessibility scans are limited to the scanned pages and states; screenshots do not establish full compliance or physical-device performance.

## October 23 refinement pass

- Restored the original mascot gravity, throwing, perching, cursor-following eyes and double gesture chat. Restyled chat and reused Beacon artwork instead of an emoji avatar.
- Studied Aardvark in rendered Chrome. Added original illustrated pillar cards with alternating scroll offsets, hover responses and mobile scroll snapping. Detailed descriptions remain in the feature preview instead of repeated plain cards.
- Added lazy-loaded Three.js neighbourhood, school and workplace scenes, including helping conversations, an older neighbour and a wheelchair user. Scenes are illustrative and share the existing Three dependency. Reduced motion and offscreen rendering controls are supported.
- Restored atmospheric blue and a restrained translucent login panel. Refined contact hierarchy and founder portrait/layout, corrected header contrast, and added a linked founder credit to the homepage footer.
- Removed em dashes from first-party HTML, JavaScript, CSS and supporting copy, including legacy pages. No backend or authentication logic intentionally changed.
- Chrome checks: nine widths from 320 to 1920 without horizontal overflow; card and scene controls; normal/reduced-motion modes; mascot gaze, throw and double gestures; demo request, messaging/history and lost-and-found workflows at 320, 390 and 1440. Public page screenshots captured in outputs/refinement.
- Live sign-in, identity uploads, real messages and contact submission were not performed. No deployment or push.

## Connected classrooms and scenario follow-up

- School concept now transforms four furnished classrooms into nodes connected to a central Beacon hub, with a sample all-class announcement action.
- Neighbourhood and workplace actions demonstrate help and a coordinated food drive. Two neighbours approach an older resident and a wheelchair user; mobile actions bring the scene into view.
- Rewards, Conversations and Thank You Wall homepage buttons open the matching embedded demo tab after demo initialization.
- Reliable News implementation compared with base 9b5c2c6: the news block matches after normalizing em-dash punctuation. Fetching, parsing, filtering and rendering logic were not changed.
- Compact organisation links, mascot/dock collision clearance, clearer final CTA and corrected mobile headline overflow.
- Chrome scenario controls passed at 320, 390 and 1440 with no overflow or page errors. Demo workflow retest passed all six checks at those widths. Nothing deployed.

## October 24 story and mascot corrections

- Replaced rigid sliding characters with jointed arms/legs and timed walking, stopping and contribution placement.
- Neighbour story now shows a hospital appointment request, a reply, meeting at the entrance and walking together toward pickup. A separate helper supports the wheelchair user with groceries.
- Office characters stop clear of the donation box and desks before transferring a contribution.
- Added readable four-step story panels and manual Next moment controls for reduced-motion users.
- Fixed Beacon's inverted flying mouth and made its physics floor respect the chat dock, allowing it to settle naturally instead of remaining in flight.
- Verified all four stages in rendered Chrome. Final 320/390/1440 checks reported no horizontal overflow and no axe WCAG A/AA violations. Reliable News code was not modified in this pass.

## Playback, comparison and mobile follow-up

- Explicit Play animation now runs independently of the ambient motion pause, with an individual pause/resume control. Reduced-motion visitors can still step manually; intentional Play opts into the scene animation.
- Added immediate request/phone movement, shortened the lead-in and exposed continuous playback progress. Browser checks confirmed advancing time, pause and restart in normal, ambient-paused and reduced-motion contexts.
- Added YouTube marks and labels to walkthrough and YouTube links; checked the player still opens.
- Highlighted Beacon's comparison column with its brand mark, blue surface and checkmarks. Navigation labels the comparison The Beacon difference. No new prominent Reliable News links; help and lost-and-found remain the primary features.
- Reduced mobile mascot dimensions from 56x74 to 44x57 pixels, maintaining a 44px pointer target. Four viewport checks passed without overflow or axe A/AA violations.

## Organized repository publishing

The compatibility builder recreates the public paths from `config/routes.json`; HTML source now lives under `website/`. `npm run dev` and `npm run preview` prepare/validate `dist/` before serving it on localhost. Preserve an existing stale output before building a new artifact; the builder refuses to overwrite it. Vite still builds the retained homepage source into `assets/unity/`; CI additionally builds into an isolated directory and compares every compiled bundle. No development instruction is added to the repository README.
